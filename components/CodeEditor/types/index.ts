export interface CodeEditorProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly language: string;
  readonly dictionary: any;
}
