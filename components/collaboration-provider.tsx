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
import { editor as MonacoEditor } from "monaco-editor";
import { useSession } from "next-auth/react";
import { Awareness } from "y-protocols/awareness";

interface Conflict {
  start: number;
  end: number;
  localContent: string;
  remoteContent: string;
}

interface CollaborationContextType {
  yDoc: Y.Doc | null;
  provider: WebsocketProvider | null;
  awareness: Awareness | null;
  bindMonacoEditor: (
    editorInstance: MonacoEditor.IStandaloneCodeEditor
  ) => void;
  conflicts: Conflict[];
  resolveConflict: (index: number, content: string) => void;
  collaborativeEdit: (type: "monaco" | "whiteboard", data: any) => void;
  onCursorChange: (event: { position: MonacoEditor.IPosition }) => void;
  getPeers: () => Array<{
    id: string;
    name: string;
    avatar: string;
    status: string;
  }>;
  changeEditorLanguage: (language: string) => void;
}

const CollaborationContext = createContext<CollaborationContextType | null>(
  null
);

interface CollaborationProviderProps {
  children: ReactNode;
}

export function CollaborationProvider({
  children,
}: CollaborationProviderProps) {
  const [yDoc, setYDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [awareness, setAwareness] = useState<Awareness | null>(null);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    const doc = new Y.Doc();
    const websocketProvider = new WebsocketProvider(
      "wss://your-websocket-server-url.com",
      "collaborative-code-platform",
      doc
    );
    setYDoc(doc);
    setProvider(websocketProvider);
    setAwareness(websocketProvider.awareness);

    websocketProvider.on("status", (event: { status: string }) => {
      if (event.status === "disconnected") {
        console.error("WebSocket disconnected");
        // TODO: Implement reconnection logic or notify the user
      }
    });

    if (session?.user) {
      websocketProvider.awareness.setLocalStateField("user", {
        name: session.user.name,
        color: Math.floor(Math.random() * 16777215).toString(16),
      });
    }

    return () => {
      websocketProvider.destroy();
    };
  }, [session]);

  const bindMonacoEditor = (
    editorInstance: MonacoEditor.IStandaloneCodeEditor
  ) => {
    if (yDoc && provider) {
      const yText = yDoc.getText("monaco");
      new MonacoBinding(
        yText,
        editorInstance.getModel()!,
        new Set([editorInstance]),
        provider.awareness
      );

      yText.observe((event) => {
        event.changes.delta.forEach((change) => {
          if (change.retain) return;
          const start = change.index;
          const end =
            start + (change.insert ? change.insert.length : change.delete || 0);
          const localContent = change.insert || "";
          const remoteContent = yText.toString().slice(start, end);

          if (localContent !== remoteContent) {
            setConflicts((prevConflicts) => [
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

  const collaborativeEdit = (type: "monaco" | "whiteboard", data: any) => {
    if (yDoc && provider) {
      if (type === "monaco") {
        // Monaco binding is already handled in bindMonacoEditor
      } else if (type === "whiteboard") {
        const yArray = yDoc.getArray("whiteboard");
        if (typeof data === "function") {
          yArray.observe(() => {
            const newData = yArray.toArray();
            data(newData);
          });
        } else if (Array.isArray(data)) {
          yArray.delete(0, yArray.length);
          yArray.insert(0, data);
        }
      }
    }
  };

  const onCursorChange = (event: { position: MonacoEditor.IPosition }) => {
    if (provider) {
      const { position } = event;
      provider.awareness.setLocalStateField("cursor", {
        anchor: { line: position.lineNumber, ch: position.column },
        head: { line: position.lineNumber, ch: position.column },
      });
    }
  };

  const getPeers = () => {
    if (provider) {
      const peerStates = Array.from(provider.awareness.getStates().entries());
      return peerStates.map(([clientId, state]) => ({
        id: clientId.toString(),
        name: (state.user?.name as string) || `Anonymous ${clientId}`,
        avatar: (state.user?.avatar as string) || "/default-avatar.png",
        status: "Active",
      }));
    }
    return [];
  };

  const changeEditorLanguage = (language: string) => {
    if (yDoc) {
      const yText = yDoc.getText("monaco");
      yText.delete(0, yText.length);
      yText.insert(0, `// New ${language} file`);
    }
  };

  const contextValue: CollaborationContextType = {
    yDoc,
    provider,
    awareness,
    bindMonacoEditor,
    conflicts,
    resolveConflict,
    collaborativeEdit,
    onCursorChange,
    getPeers,
    changeEditorLanguage,
  };

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
}

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error(
      "useCollaboration must be used within a CollaborationProvider"
    );
  }
  return context;
};
