/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
// import { MonacoBinding } from "y-monaco";
import * as Y from "yjs";
import { useCollaborationContext } from "@/components/collaboration-provider";
import { EditorInstance } from "@/types/global";

type CollaborativeData = EditorInstance | Y.Array<any> | null;
type CollaborativeCallback = ((data: any) => void) | null;

export function useCollaboration() {
  const { yDoc, provider } = useCollaborationContext();

  const collaborativeEdit = useCallback(
    (type: string, data: CollaborativeData | CollaborativeCallback) => {
      if (yDoc && provider) {
        if (type === "monaco" && data instanceof Object) {
          const yText = yDoc.getText("monaco");
          // new MonacoBinding(
          //   yText,
          //   (data as EditorInstance).getModel()!,
          //   new Set([data as EditorInstance]),
          //   provider.awareness
          // );
        } else if (type === "whiteboard") {
          const yArray = yDoc.getArray("whiteboard");
          if (typeof data === "function") {
            // If data is a function, it's a listener for changes
            yArray.observe(() => {
              const newData = yArray.toArray();
              (data as CollaborativeCallback)?.(newData);
            });
          } else if (Array.isArray(data)) {
            // If data is an array, it's new data to be added
            yArray.delete(0, yArray.length);
            yArray.insert(0, data);
          }
        }
      }
    },
    [yDoc, provider]
  );

  const onCursorChange = useCallback(
    (event: { position: { lineNumber: number; column: number } }) => {
      if (provider) {
        const { position } = event;
        provider.awareness.setLocalStateField("cursor", {
          anchor: { line: position.lineNumber, ch: position.column },
          head: { line: position.lineNumber, ch: position.column },
        });
      }
    },
    [provider]
  );

  const getPeers = useCallback(() => {
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
  }, [provider]);

  const changeEditorLanguage = useCallback(
    (language: string) => {
      if (yDoc) {
        const yText = yDoc.getText("monaco");
        yText.delete(0, yText.length);
        yText.insert(0, `// New ${language} file`);
      }
    },
    [yDoc]
  );

  return { collaborativeEdit, onCursorChange, getPeers, changeEditorLanguage };
}
