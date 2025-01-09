import { useCallback } from 'react';
import { useCollaboration as useCollaborationContext } from '@/components/CollaborationProvider';
import { EditorInstance } from '@/types/global';
import { IPosition } from 'monaco-editor';

export function useCollaboration() {
  const context = useCollaborationContext();

  const bindMonacoEditor = useCallback(
    (editor: EditorInstance) => {
      context.bindMonacoEditor(editor);
    },
    [context.bindMonacoEditor]
  );

  const onCursorChange = useCallback(
    (event: { position: IPosition }) => {
      context.onCursorChange(event);
    },
    [context.onCursorChange]
  );

  return {
    ...context,
    bindMonacoEditor,
    onCursorChange,
  };
}
