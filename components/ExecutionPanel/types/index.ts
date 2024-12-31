export interface ExecutionPanelProps {
  readonly code: string;
  readonly onCodeChange: (newCode: string) => void;
  readonly dictionary: any;
}
