/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
  id: string;
  name: string;
  avatar: string;
  status: string;
}

export interface CodeVersion {
  hash: string;
  message: string;
  timestamp: number;
}

export interface AIResponse {
  content: string;
}

export interface AICodeSuggestion {
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  text: string;
}

export type EditorInstance = any;
