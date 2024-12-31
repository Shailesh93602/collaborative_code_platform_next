import { CustomFile } from '@/types/global';

export interface FileTreeNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  content?: string;
  path: string;
}

export interface FileTreeProps {
  readonly data: FileTreeNode;
  readonly onSelect: (file: CustomFile) => void;
  readonly onCreateFile: (path: string, content: string) => void;
  readonly onCreateDirectory: (path: string) => void;
  readonly onDelete: (path: string) => void;
  readonly onRename: (oldPath: string, newPath: string) => void;
}
