export interface AIAssistantProps {
  readonly code: string;
  readonly onSuggestionApply: (suggestion: string) => void;
  readonly language: string;
  readonly dictionary?: any;
}
