"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { editor } from "monaco-editor";

interface Conflict {
  start: number;
  end: number;
  localContent: string;
  remoteContent: string;
}

interface CollaborationContextType {
  yDoc: Y.Doc | null;
  provider: WebsocketProvider | null;
  awareness: any;
  bindMonacoEditor: (editorInstance: editor.IStandaloneCodeEditor) => void;
  conflicts: Conflict[];
  resolveConflict: (index: number, content: string) => void;
}

const CollaborationContext = createContext<CollaborationContextType>({
  yDoc: null,
  provider: null,
  awareness: null,
  bindMonacoEditor: () => {},
  conflicts: [],
  resolveConflict: () => {},
});

export function CollaborationProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [yDoc, setYDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [awareness, setAwareness] = useState<any | null>(null);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  useEffect(() => {
    const doc = new Y.Doc();
    const websocketProvider = new WebsocketProvider(
      "ws://localhost:1234", // Replace with your WebSocket server URL
      "collaborative-code-platform",
      doc
    );
    setYDoc(doc);
    setProvider(websocketProvider);
    setAwareness(websocketProvider.awareness);

    return () => {
      websocketProvider.destroy();
    };
  }, []);

  const bindMonacoEditor = (editorInstance: editor.IStandaloneCodeEditor) => {
    if (yDoc && provider) {
      const yText = yDoc.getText("monaco");
      const _binding = new MonacoBinding(
        yText,
        editorInstance.getModel()!,
        new Set([editorInstance]),
        provider.awareness
      );

      yText.observe((event) => {
        event.changes.delta.forEach((change: any) => {
          if (change.retain) return;
          const start = change.index;
          const end =
            start + (change.insert ? change.insert.length : change.delete || 0);
          const localContent = change.insert || "";
          const remoteContent = yText.toString().slice(start, end);

          if (localContent !== remoteContent) {
            setConflicts((prevConflicts: any) => [
              ...prevConflicts,
              { start, end, localContent, remoteContent },
            ]);
          }
        });
      });
    }
  };

  const resolveConflict = (index: number, content: string) => {
    if (yDoc) {
      const yText = yDoc.getText("monaco");
      const conflict = conflicts[index];
      yText.delete(conflict.start, conflict.end - conflict.start);
      yText.insert(conflict.start, content);
      setConflicts((prevConflicts) =>
        prevConflicts.filter((_, i) => i !== index)
      );
    }
  };

  return (
    <CollaborationContext.Provider
      value={{
        yDoc,
        provider,
        awareness,
        bindMonacoEditor,
        conflicts,
        resolveConflict,
      }}
    >
      {children}
    </CollaborationContext.Provider>
  );
}

export const useCollaboration = () => useContext(CollaborationContext);
