import { CustomFile } from './file';

export interface ExecutionPanelProps {
  readonly code: string;
  readonly onCodeChange: (newCode: string) => void;
}

export interface BlockchainVersionControlProps {
  readonly code: string;
  readonly onCodeUpdate: (code: string) => void;
  readonly files: CustomFile[];
  readonly onFilesUpdate: (files: CustomFile[]) => void;
  readonly dictionary: any;
  readonly lang: 'en' | 'hi' | 'gu';
}

export interface AIAssistantProps {
  readonly code: string;
  readonly onSuggestionApply: (suggestion: string) => void;
  readonly language: string;
}

export interface CodeExplanationProps {
  readonly code: string;
}

export interface MultiLanguageSupportProps {
  readonly code: string;
  readonly language: string;
  readonly onLanguageChange: (newLanguage: string) => void;
  readonly dictionary: any;
  readonly lang: 'en' | 'hi' | 'gu';
}
