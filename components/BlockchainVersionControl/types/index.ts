import { CustomFile } from '@/types/global';

export interface CodeReviewProps {
  readonly code: string;
  readonly selectedVersion: string | null;
  readonly dictionary: any;
}

export interface Comment {
  author: string;
  content: string;
  timestamp: number;
}

export interface ConfirmationDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly title: string;
  readonly description: string;
  readonly dictionary: any;
}

export interface Conflict {
  id: string;
  sourceVersion: string;
  targetVersion: string;
}

export interface ConflictResolverProps {
  readonly code: string;
  readonly dictionary: any;
}

export interface FileExplorerProps {
  readonly files: CustomFile[];
  readonly onFileSelect: (path: string) => void;
  readonly onFilesUpdate: (files: CustomFile[]) => void;
  readonly dictionary: any;
}

export interface Version {
  hash: string;
  message: string;
  timestamp: number;
  tags: string[];
}

export interface VersionHistoryProps {
  readonly versions?: Version[];
  readonly selectedVersions?: string[];
  readonly onSelect?: (hash: string) => void;
  readonly onLoad: (hash: string) => void;
  readonly onViewComments?: (hash: string) => void;
  readonly onRevert?: (hash: string) => void;
  readonly onReview?: (hash: string) => void;
  readonly isLoading?: boolean;
  readonly selectedFile?: string | null;
  readonly dictionary: any;
  readonly lang: 'en' | 'hi' | 'gu';
}

export interface VersionItemProps {
  readonly version: { hash: string; message: string; timestamp: number; tags: string[] };
  readonly isSelected: boolean;
  readonly onSelect: (version: string) => void;
  readonly onLoad: (version: string) => void;
  readonly onViewComments: (version: string) => void;
  readonly onRevert: (version: string) => void;
  readonly onReview: (version: string) => void;
  readonly isLoading: boolean;
  readonly dictionary: any;
  readonly lang: 'en' | 'hi' | 'gu';
}
