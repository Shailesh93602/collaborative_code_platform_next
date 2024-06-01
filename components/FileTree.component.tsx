import React, { useState, useCallback } from "react";
import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomFile } from "@/types/file";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

interface FileTreeNode {
  name: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
  content?: string;
}

interface FileTreeProps {
  readonly data: FileTreeNode;
  readonly onSelect: (file: CustomFile) => void;
  readonly onCreateFile: (path: string, content: string) => void;
  readonly onCreateDirectory: (path: string) => void;
  readonly onDelete: (path: string) => void;
  readonly onRename: (oldPath: string, newPath: string) => void;
}

export function FileTree({
  data,
  onSelect,
  onCreateFile,
  onCreateDirectory,
  onDelete,
  onRename,
}: FileTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [newNodeName, setNewNodeName] = useState("");

  const toggleNode = useCallback((path: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  }, []);

  const handleCreate = useCallback(
    (path: string, type: "file" | "directory") => {
      if (type === "file") {
        onCreateFile(path, "");
      } else {
        onCreateDirectory(path);
      }
    },
    [onCreateFile, onCreateDirectory]
  );

  const handleDelete = useCallback(
    async (path: string) => {
      try {
        await onDelete(path);
      } catch (error) {
        console.error("Error deleting file:", error);
        // TODO: Add user-facing error message
      }
    },
    [onDelete]
  );

  const handleRename = useCallback(async (oldPath: string) => {
    setEditingNode(oldPath);
    setNewNodeName(oldPath.split("/").pop() || "");
  }, []);

  const submitRename = useCallback(
    async (oldPath: string) => {
      const newPath = oldPath
        .split("/")
        .slice(0, -1)
        .concat(newNodeName)
        .join("/");
      try {
        await onRename(oldPath, newPath);
      } catch (error) {
        console.error("Error renaming file:", error);
        // TODO: Add user-facing error message
      }
      setEditingNode(null);
      setNewNodeName("");
    },
    [newNodeName, onRename]
  );

  const flattenTree = useCallback(
    (node: FileTreeNode, path: string = ""): FileTreeNode[] => {
      const currentPath = path ? `${path}/${node.name}` : node.name;
      const result: FileTreeNode[] = [{ ...node, path: currentPath }];
      if (
        node.type === "directory" &&
        node.children &&
        expandedNodes.has(currentPath)
      ) {
        node.children.forEach((child) => {
          result.push(...flattenTree(child, currentPath));
        });
      }
      return result;
    },
    [expandedNodes]
  );

  const flattenedTree = flattenTree(data);

  const renderNode = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const node = flattenedTree[index];
      const depth = node.path.split("/").length - 1;
      const isExpanded = expandedNodes.has(node.path);
      const isEditing = editingNode === node.path;

      return (
        <div
          style={{ ...style, paddingLeft: `${depth * 20}px` }}
          className="flex items-center"
        >
          {node.type === "directory" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleNode(node.path)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          {node.type === "directory" ? (
            <Folder className="h-4 w-4 mr-2" />
          ) : (
            <File className="h-4 w-4 mr-2" />
          )}
          {isEditing ? (
            <Input
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              onBlur={() => submitRename(node.path)}
              onKeyPress={(e) => e.key === "Enter" && submitRename(node.path)}
              className="w-40"
            />
          ) : (
            <span
              onClick={() =>
                onSelect({ path: node.path, content: node.content || "" })
              }
              className="cursor-pointer hover:underline"
            >
              {node.name}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRename(node.path)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(node.path)}
          >
            <Trash className="h-4 w-4" />
          </Button>
          {node.type === "directory" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleCreate(`${node.path}/new-file.txt`, "file")
                }
              >
                <Plus className="h-4 w-4" />
                <File className="h-4 w-4 ml-1" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleCreate(`${node.path}/new-directory`, "directory")
                }
              >
                <Plus className="h-4 w-4" />
                <Folder className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}
        </div>
      );
    },
    [
      expandedNodes,
      editingNode,
      newNodeName,
      onSelect,
      handleRename,
      handleDelete,
      handleCreate,
      submitRename,
      toggleNode,
    ]
  );

  return (
    <div className="h-full">
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            itemCount={flattenedTree.length}
            itemSize={35}
            width={width}
          >
            {renderNode}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}
