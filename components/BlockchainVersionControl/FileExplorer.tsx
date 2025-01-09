'use client';
import React from 'react';
import { FileTree } from '@/components/FileTree';
import { CustomFile } from '@/types/global';
import { FileExplorerProps } from './types';

export default function FileExplorer({
  files,
  onFileSelect,
  onFilesUpdate,
  dictionary,
}: FileExplorerProps) {
  const fileTree = buildFileTree(files);

  const handleCreateFile = async (path: string, content: string) => {
    const newFiles = [...files, { path, content }];
    onFilesUpdate(newFiles);
  };

  const handleCreateDirectory = async (path: string) => {
    console.log(path);
    // Directories are implicitly created when files are added
    // No need to explicitly create directories in this implementation
  };

  const handleDeleteFile = async (path: string) => {
    const newFiles = files.filter((file) => file.path !== path);
    onFilesUpdate(newFiles);
  };

  const handleRenameFile = async (oldPath: string, newPath: string) => {
    const newFiles = files.map((file) =>
      file.path === oldPath ? { ...file, path: newPath } : file
    );
    onFilesUpdate(newFiles);
  };

  return (
    <div className="w-1/2">
      <h3 className="text-sm font-medium mb-2">{dictionary?.Text?.FileExplorer}</h3>
      <FileTree
        data={fileTree}
        onSelect={(file) => onFileSelect(file.path)}
        onCreateFile={handleCreateFile}
        onCreateDirectory={handleCreateDirectory}
        onDelete={handleDeleteFile}
        onRename={handleRenameFile}
      />
    </div>
  );
}

function buildFileTree(files: CustomFile[]) {
  const root = {
    name: 'root',
    type: 'directory' as const,
    children: [],
    path: '',
  };
  files.forEach((file) => {
    const parts = file.path.split('/');
    let currentNode: any = root;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        currentNode.children.push({
          name: part,
          type: 'file' as const,
          content: file.content,
        });
      } else {
        let child = currentNode.children.find(
          (c: any) => c.name === part && c.type === 'directory'
        );
        if (!child) {
          child = { name: part, type: 'directory' as const, children: [] };
          currentNode.children.push(child);
        }
        currentNode = child;
      }
    });
  });
  return root;
}
