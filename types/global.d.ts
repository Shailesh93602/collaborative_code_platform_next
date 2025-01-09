import { editor } from 'monaco-editor';

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

export interface CustomFile {
  path: string;
  content: string;
}

export interface Comment {
  id?: string;
  author: string;
  content: string;
  lineNumber?: number;
  timestamp: number;
}

export interface BlockchainVersionControlProps {
  readonly code: string;
  readonly onCodeUpdate: (code: string) => void;
  readonly files: CustomFile[];
  readonly onFilesUpdate: (files: CustomFile[]) => void;
  readonly dictionary: any;
  readonly lang: 'en' | 'hi' | 'gu';
}

export interface MultiLanguageSupportProps {
  readonly code: string;
  readonly language: string;
  readonly onLanguageChange: (newLanguage: string) => void;
  readonly dictionary: any;
  readonly lang: 'en' | 'hi' | 'gu';
}

export interface CustomFile {
  path: string;
  content: string;
  keyId?: string; // Add keyId property
}
