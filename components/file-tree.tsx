import React, { useState } from "react";
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

interface FileTreeNode {
  name: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
}

interface FileTreeProps {
  data: FileTreeNode;
  onSelect: (path: string) => void;
  onCreateFile: (path: string) => void;
  onCreateDirectory: (path: string) => void;
  onDelete: (path: string) => void;
  onRename: (oldPath: string, newPath: string) => void;
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

  const toggleNode = (path: string) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(path)) {
      newExpandedNodes.delete(path);
    } else {
      newExpandedNodes.add(path);
    }
    setExpandedNodes(newExpandedNodes);
  };

  const handleCreate = (path: string, type: "file" | "directory") => {
    if (type === "file") {
      onCreateFile(path);
    } else {
      onCreateDirectory(path);
    }
  };

  const handleDelete = (path: string) => {
    onDelete(path);
  };

  const handleRename = (oldPath: string) => {
    setEditingNode(oldPath);
    setNewNodeName(oldPath.split("/").pop() || "");
  };

  const submitRename = (oldPath: string) => {
    const newPath = oldPath
      .split("/")
      .slice(0, -1)
      .concat(newNodeName)
      .join("/");
    onRename(oldPath, newPath);
    setEditingNode(null);
    setNewNodeName("");
  };

  const renderNode = (node: FileTreeNode, path: string) => {
    const isExpanded = expandedNodes.has(path);
    const isEditing = editingNode === path;

    return (
      <div key={path} className="ml-4">
        <div className="flex items-center">
          {node.type === "directory" && (
            <Button variant="ghost" size="sm" onClick={() => toggleNode(path)}>
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
              onBlur={() => submitRename(path)}
              onKeyPress={(e) => e.key === "Enter" && submitRename(path)}
              className="w-40"
            />
          ) : (
            <span
              onClick={() => onSelect(path)}
              className="cursor-pointer hover:underline"
            >
              {node.name}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={() => handleRename(path)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(path)}>
            <Trash className="h-4 w-4" />
          </Button>
          {node.type === "directory" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCreate(`${path}/new-file.txt`, "file")}
              >
                <Plus className="h-4 w-4" />
                <File className="h-4 w-4 ml-1" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleCreate(`${path}/new-directory`, "directory")
                }
              >
                <Plus className="h-4 w-4" />
                <Folder className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}
        </div>
        {node.type === "directory" && isExpanded && node.children && (
          <div className="ml-4">
            {node.children.map((child) =>
              renderNode(child, `${path}/${child.name}`)
            )}
          </div>
        )}
      </div>
    );
  };

  return <div className="p-4">{renderNode(data, data.name)}</div>;
}
