export interface DebugStep {
  step: number;
  code: string;
  variables: Record<string, any>;
  timestamp: number;
}

export interface TimelineDebuggerProps {
  readonly dictionary: any;
}
