export interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
}

export interface CodeSnippetLibraryProps {
  readonly onCodeChange?: (code: string) => void;
  readonly dictionary?: any;
}
