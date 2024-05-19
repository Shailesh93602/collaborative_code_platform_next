import { editor } from "monaco-editor";

export type EditorInstance = editor.IStandaloneCodeEditor;

export interface AICodeSuggestion {
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  text: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  status: string;
}
