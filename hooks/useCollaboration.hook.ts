import { useCallback } from "react";
import * as Y from "yjs";
import { useCollaboration as useCollaborationContext } from "@/components/collaboration-provider";
import { EditorInstance } from "@/types/global";

type CollaborativeData = EditorInstance | Y.Array<any> | string | null;
type CollaborativeCallback = ((data: any) => void) | null;

export function useCollaboration() {
  const { yDoc, provider } = useCollaborationContext();

  const collaborativeEdit = useCallback(
    (type: string, data: CollaborativeData | CollaborativeCallback) => {
      if (yDoc && provider) {
        if (type === "monaco" && data instanceof Object) {
          const yText = yDoc.getText("monaco");
          // Implement Monaco binding here
        } else if (type === "whiteboard") {
          const yArray = yDoc.getArray("whiteboard");
          if (typeof data === "function") {
            yArray.observe(() => {
              const newData = yArray.toArray();
              (data as CollaborativeCallback)?.(newData);
            });
          } else if (typeof data === "string") {
            yArray.delete(0, yArray.length);
            yArray.insert(0, [data]);
          } else if (Array.isArray(data)) {
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
