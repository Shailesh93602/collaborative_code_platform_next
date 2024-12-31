import { ReactNode } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Awareness } from 'y-protocols/awareness';
import { editor as MonacoEditor, IPosition } from 'monaco-editor';

export interface CollaborationProviderProps {
  readonly children: ReactNode;
}

export interface Conflict {
  start: number;
  end: number;
  localContent: string;
  remoteContent: string;
}

export interface CollaborationContextType {
  yDoc: Y.Doc | null;
  provider: WebsocketProvider | null;
  awareness: Awareness | null;
  bindMonacoEditor: (editorInstance: MonacoEditor.IStandaloneCodeEditor) => void;
  conflicts: Conflict[];
  resolveConflict: (index: number, content: string) => void;
  collaborativeEdit: (type: 'monaco' | 'whiteboard', data: any) => void;
  onCursorChange: (event: { position: IPosition }) => void;
  getPeers: () => Array<{
    id: string;
    name: string;
    avatar: string;
    status: string;
  }>;
  changeEditorLanguage: (language: string) => void;
}
