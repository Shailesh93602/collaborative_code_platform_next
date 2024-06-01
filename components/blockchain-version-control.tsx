"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWeb3 } from "@/hooks/use-web3";
import {
  GitBranch,
  Save,
  Upload,
  Search,
  AlertTriangle,
  Tag,
  MessageSquare,
  Download,
  Lock,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";
import { DiffViewer } from "@/components/diff-viewer";
import { BranchManager } from "@/components/branch-manager";
import { VersionGraph } from "@/components/version-graph";
import { useLocalCache } from "@/hooks/use-local-cache";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileTree } from "@/components/file-tree";
import { saveAs } from "file-saver";
import { CustomFile } from "@/types/file";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  BlockchainErrorType,
  handleBlockchainError,
} from "@/lib/blockchain-error-handler";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CodeReview } from "@/components/code-review";
import { FileExplorer } from "./blockchain-version-control/FileExplorer";
import { VersionHistory } from "./blockchain-version-control/VersionHistory";
import {
  generateEncryptionKey,
  exportKey,
  importKey,
  encryptData,
  decryptData,
} from "@/utils/encryption";

interface FileTreeNode {
  name: string;
  type: string;
  content?: string;
  children?: FileTreeNode[];
}

interface Version {
  hash: string;
  message: string;
  timestamp: number;
  tags: string[];
}

interface Comment {
  author: string;
  content: string;
  timestamp: number;
}

interface BlockchainVersionControlProps {
  code: string;
  onCodeUpdate: (code: string) => void;
  files: CustomFile[];
  onFilesUpdate: (files: CustomFile[]) => void;
}

const VERSIONS_PER_PAGE = 20;

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

export function BlockchainVersionControl({
  code,
  onCodeUpdate,
  files,
  onFilesUpdate,
}: BlockchainVersionControlProps) {
  const [commitMessage, setCommitMessage] = useState("");
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [conflicts, setConflicts] = useState<
    { id: string; sourceVersion: string; targetVersion: string }[]
  >([]);
  const [newTag, setNewTag] = useState("");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [pendingVersions, setPendingVersions] = useState<
    { commitMessage: string; files: CustomFile[] }[]
  >([]);
  const [fileTree, setFileTree] = useState<FileTreeNode>({
    name: "root",
    type: "directory",
    children: [],
  });
  const [selectedFile, setSelectedFile] = useState<string>();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalVersions, setTotalVersions] = useState(0);
  const [showCodeReview, setShowCodeReview] = useState(false);
  const [selectedVersionForReview, setSelectedVersionForReview] = useState<
    string | null
  >(null);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const scrollRef = useRef(null);
  const {
    saveVersion,
    loadVersion,
    getAllVersions,
    searchVersions,
    resolveConflict,
    addTag,
    getTags,
    addComment,
    getComments,
    batchSaveVersions,
    revertToVersion,
    getBranchNames,
    currentBranch,
    createFile,
    deleteFile,
    renameFile,
  } = useWeb3();
  const { toast } = useToast();
  const {
    data: cachedVersions,
    loading: versionsLoading,
    error: versionsError,
    invalidateCache,
  } = useLocalCache("versionHistory", () =>
    getAllVersions(1, VERSIONS_PER_PAGE)
  );

  useEffect(() => {
    if (cachedVersions) {
      setVersions(cachedVersions.versions);
      setTotalVersions(cachedVersions.total);
    }
  }, [cachedVersions]);

  useEffect(() => {
    const tree = buildFileTree(files);
    setFileTree(tree);
  }, [files]);

  const buildFileTree = (files: CustomFile[]): FileTreeNode => {
    const root: FileTreeNode = {
      name: "root",
      type: "directory",
      children: [],
    };
    files.forEach((file) => {
      const parts = file.path.split("/");
      let currentNode = root;
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          currentNode.children?.push({
            name: part,
            type: "file",
            content: file.content,
          });
        } else {
          let child = currentNode.children?.find(
            (c) => c.name === part && c.type === "directory"
          );
          if (!child) {
            child = { name: part, type: "directory", children: [] };
            currentNode.children?.push(child);
          }
          currentNode = child;
        }
      });
    });
    return root;
  };

  useEffect(() => {
    const initializeEncryptionKey = async () => {
      let key = localStorage.getItem("encryptionKey");
      if (!key) {
        const newKey = await generateEncryptionKey();
        const exportedKey = await exportKey(newKey);
        localStorage.setItem("encryptionKey", exportedKey);
        setEncryptionKey(newKey);
      } else {
        const importedKey = await importKey(key);
        setEncryptionKey(importedKey);
      }
    };

    initializeEncryptionKey();
  }, []);

  const handleSave = useCallback(async () => {
    if (!commitMessage || !encryptionKey) return;
    setIsLoading(true);
    try {
      const filesToSave: CustomFile[] = [
        { path: selectedFile!, content: code },
      ];

      // Encrypt the code before saving
      const encryptedCode = await encryptData(code, encryptionKey);

      // Handle large files
      if (encryptedCode.length > CHUNK_SIZE) {
        const chunks = Math.ceil(encryptedCode.length / CHUNK_SIZE);
        for (let i = 0; i < chunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min((i + 1) * CHUNK_SIZE, encryptedCode.length);
          const chunk = encryptedCode.slice(start, end);
          await saveVersion(commitMessage, [
            { path: `${selectedFile!}.part${i}`, content: chunk },
          ]);
          setUploadProgress(((i + 1) / chunks) * 100);
        }
        // Save metadata
        await saveVersion(commitMessage, [
          {
            path: `${selectedFile!}.metadata`,
            content: JSON.stringify({ chunks, encrypted: true }),
          },
        ]);
      } else {
        await saveVersion(commitMessage, [
          { path: selectedFile!, content: encryptedCode },
        ]);
      }

      setPendingVersions((prev) => [
        ...prev,
        { commitMessage, files: filesToSave },
      ]);
      setCommitMessage("");
      invalidateCache();
      toast({
        title: "Success",
        description: "Encrypted version saved successfully",
      });
    } catch (error) {
      handleBlockchainError({
        type: BlockchainErrorType.TRANSACTION_FAILED,
        message: "Failed to save encrypted version",
        details: error,
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  }, [
    commitMessage,
    code,
    selectedFile,
    saveVersion,
    invalidateCache,
    toast,
    encryptionKey,
  ]);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const fetchedVersions = await getAllVersions();
      const versionsWithTags = await Promise.all(
        fetchedVersions.map(async (version: Version) => {
          const tags = await getTags(version.hash);
          return { ...version, tags };
        })
      );
      setVersions(versionsWithTags);
    } catch (error) {
      handleBlockchainError({
        type: BlockchainErrorType.CONTRACT_INTERACTION_ERROR,
        message: "Failed to fetch versions",
        details: error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchSave = useCallback(async () => {
    if (pendingVersions.length === 0) return;
    setIsLoading(true);
    try {
      await batchSaveVersions(pendingVersions);
      setPendingVersions([]);
      fetchVersions();
      toast({
        title: "Success",
        description: "Versions saved successfully",
      });
    } catch (error) {
      handleBlockchainError({
        type: BlockchainErrorType.TRANSACTION_FAILED,
        message: "Failed to save versions",
        details: error,
      });
    } finally {
      setIsLoading(false);
    }
  }, [pendingVersions, batchSaveVersions, fetchVersions, toast]);

  const handleLoad = async (hash: string) => {
    if (!encryptionKey) return;
    setIsLoading(true);
    try {
      const result = await loadVersion(hash);
      const mainFile = result.files.find((file) => file.path === selectedFile);
      if (mainFile) {
        if (mainFile.path.endsWith(".metadata")) {
          // Handle large file
          const metadata = JSON.parse(mainFile.content);
          let fullContent = "";
          for (let i = 0; i < metadata.chunks; i++) {
            const chunkResult = await loadVersion(`${hash}.part${i}`);
            fullContent += chunkResult.files[0].content;
            setUploadProgress(((i + 1) / metadata.chunks) * 100);
          }
          const decryptedContent = await decryptData(
            fullContent,
            encryptionKey
          );
          onCodeUpdate(decryptedContent);
        } else {
          const decryptedContent = await decryptData(
            mainFile.content,
            encryptionKey
          );
          onCodeUpdate(decryptedContent);
        }
      }
      toast({
        title: "Success",
        description: "Encrypted version loaded and decrypted successfully",
      });
    } catch (error) {
      handleBlockchainError({
        type: BlockchainErrorType.CONTRACT_INTERACTION_ERROR,
        message: "Failed to load and decrypt version",
        details: error,
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    setIsLoading(true);
    try {
      const result = await getAllVersions(page, VERSIONS_PER_PAGE);
      setVersions(result.versions);
      setTotalVersions(result.total);
    } catch (error) {
      handleBlockchainError({
        type: BlockchainErrorType.CONTRACT_INTERACTION_ERROR,
        message: "Failed to fetch versions",
        details: error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVersionSelect = (hash: string) => {
    setSelectedVersions((prev) => {
      if (prev.includes(hash)) {
        return prev.filter((v) => v !== hash);
      } else if (prev.length < 2) {
        return [...prev, hash];
      }
      return [prev[1], hash];
    });
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const searchResults = await searchVersions(searchQuery);
      setVersions(searchResults);
      setCurrentPage(1);
    } catch (error) {
      handleBlockchainError({
        type: BlockchainErrorType.CONTRACT_INTERACTION_ERROR,
        message: "Failed to search versions",
        details: error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveConflict = async (
    conflictId: string,
    resolvedCode: string
  ) => {
    setIsLoading(true);
    try {
      await resolveConflict(conflictId, resolvedCode);
      setConflicts((prev) =>
        prev.filter((conflict) => conflict.id !== conflictId)
      );
      toast({
        title: "Success",
        description: "Conflict resolved successfully",
      });
    } catch (error) {
      handleBlockchainError({
        type: BlockchainErrorType.TRANSACTION_FAILED,
        message: "Failed to resolve conflict",
        details: error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = async (versionHash: string) => {
    if (!newTag) return;
    setIsLoading(true);
    try {
      await addTag(versionHash, newTag);
      setNewTag("");
      fetchVersions();
      toast({
        title: "Success",
        description: "Tag added successfully",
      });
    } catch (error) {
      handleBlockchainError({
        type: BlockchainErrorType.TRANSACTION_FAILED,
        message: "Failed to add tag",
        details: error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (versionHash: string) => {
    if (!newComment) return;
    setIsLoading(true);
    try {
      await addComment(versionHash, newComment);
      setNewComment("");
      const updatedComments = await getComments(versionHash);
      setComments(updatedComments);
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      handleBlockchainError({
        type: BlockchainErrorType.TRANSACTION_FAILED,
        message: "Failed to add comment",
        details: error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewComments = async (versionHash: string) => {
    setIsLoading(true);
    try {
      const fetchedComments = await getComments(versionHash);
      setComments(fetchedComments);
    } catch (error) {
      handleBlockchainError({
        type: BlockchainErrorType.CONTRACT_INTERACTION_ERROR,
        message: "Failed to fetch comments",
        details: error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFile = async (path: string, content: string) => {
    try {
      await createFile(path, content, false);
      const newFiles = [...files, { path, content }];
      onFilesUpdate(newFiles);
      toast({
        title: "Success",
        description: "File created successfully",
      });
    } catch (error) {
      handleBlockchainError({
        type: BlockchainErrorType.TRANSACTION_FAILED,
        message: "Failed to create file",
        details: error,
      });
    }
  };

  const handleCreateDirectory = async (path: string) => {
    try {
      await createFile(path, "", true);
      toast({
        title: "Success",
        description: "Directory created successfully",
      });
    } catch (error) {
      handleBlockchainError({
        type: BlockchainErrorType.TRANSACTION_FAILED,
        message: "Failed to create directory",
        details: error,
      });
    }
  };

  const handleDeleteFile = async (path: string) => {
    try {
      await deleteFile(path);
      const newFiles = files.filter((file) => file.path !== path);
      onFilesUpdate(newFiles);
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    } catch (error) {
      handleBlockchainError({
        type: BlockchainErrorType.TRANSACTION_FAILED,
        message: "Failed to delete file",
        details: error,
      });
    }
  };

  const handleRenameFile = async (oldPath: string, newPath: string) => {
    try {
      await renameFile(oldPath, newPath);
      const newFiles = files.map((file) =>
        file.path === oldPath ? { ...file, path: newPath } : file
      );
      onFilesUpdate(newFiles);
      toast({
        title: "Success",
        description: "File renamed successfully",
      });
    } catch (error) {
      handleBlockchainError({
        type: BlockchainErrorType.TRANSACTION_FAILED,
        message: "Failed to rename file",
        details: error,
      });
    }
  };

  const handleFileSelect = (file: CustomFile) => {
    onCodeUpdate(file.content);
    setSelectedFile(file.path);
  };

  const handleRevert = async (versionHash: string) => {
    if (
      window.confirm(
        "Are you sure you want to revert to this version? This action cannot be undone."
      )
    ) {
      setIsLoading(true);
      try {
        await revertToVersion(versionHash);
        toast({
          title: "Success",
          description: "Reverted to selected version successfully",
        });
        fetchVersions();
      } catch (error) {
        handleBlockchainError({
          type: BlockchainErrorType.TRANSACTION_FAILED,
          message: "Failed to revert to version",
          details: error,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExport = () => {
    const exportData = {
      versions,
      currentBranch,
      branches: getBranchNames(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "version-history-export.json");
  };

  const virtualizer = useVirtualizer({
    count: totalVersions,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  const visibleVersions = useMemo(() => {
    const start = virtualizer.getVirtualItems()[0]?.index || 0;
    return versions.slice(start, start + VERSIONS_PER_PAGE);
  }, [versions, virtualizer]);

  const handleReview = (hash: string) => {
    setSelectedVersionForReview(hash);
    setShowCodeReview(true);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <GitBranch className="h-4 w-4" />
          <span className="sr-only">Open version control</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Blockchain Version Control (Encrypted)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {versionsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to fetch version history. Please try again later.
              </AlertDescription>
            </Alert>
          )}
          <div className="flex space-x-2">
            <Input
              placeholder="Commit message"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              disabled={isLoading}
            />
            <Button
              onClick={handleSave}
              disabled={!commitMessage || isLoading || !encryptionKey}
            >
              <Save className="h-4 w-4 mr-2" />
              <Lock className="h-4 w-4 mr-2" />
              Queue Encrypted Save
            </Button>
          </div>
          {pendingVersions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Pending Versions</h3>
              <ScrollArea className="h-[100px] border rounded mb-2">
                {pendingVersions.map((version, index) => (
                  <div key={index} className="p-2 border-b">
                    <p className="text-sm">{version.commitMessage}</p>
                  </div>
                ))}
              </ScrollArea>
              <Button onClick={handleBatchSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save All Versions
              </Button>
            </div>
          )}
          <div className="flex space-x-4">
            <div className="w-1/3">
              <h3 className="text-sm font-medium mb-2">File Explorer</h3>
              <FileExplorer
                fileTree={fileTree}
                onSelect={handleFileSelect}
                onCreateFile={handleCreateFile}
                onCreateDirectory={handleCreateDirectory}
                onDelete={handleDeleteFile}
                onRename={handleRenameFile}
              />
            </div>
            <div className="w-2/3">
              <h3 className="text-sm font-medium mb-2">Version History</h3>
              <ScrollArea className="h-[200px] border rounded" ref={scrollRef}>
                {versionsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    Loading versions...
                  </div>
                ) : (
                  <div
                    style={{
                      height: `${virtualizer.getTotalSize()}px`,
                      width: "100%",
                      position: "relative",
                    }}
                  >
                    {virtualizer.getVirtualItems().map((virtualItem) => (
                      <div
                        key={virtualItem.key}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                      >
                        {visibleVersions[virtualItem.index] && (
                          <VersionItem
                            version={visibleVersions[virtualItem.index]}
                            isSelected={selectedVersions.includes(
                              visibleVersions[virtualItem.index].hash
                            )}
                            onSelect={handleVersionSelect}
                            onLoad={handleLoad}
                            onViewComments={handleViewComments}
                            onRevert={handleRevert}
                            onReview={handleReview}
                            isLoading={isLoading}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalVersions / VERSIONS_PER_PAGE)}
            onPageChange={handlePageChange}
          />
          {selectedVersions.length === 2 && (
            <DiffViewer versionHashes={selectedVersions} />
          )}
          {conflicts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Conflicts</h3>
              {conflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className="flex items-center space-x-2 mb-2"
                >
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">
                    Conflict between versions {conflict.sourceVersion} and{" "}
                    {conflict.targetVersion}
                  </span>
                  <Button
                    onClick={() => handleResolveConflict(conflict.id, code)}
                  >
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium mb-2">Add Tag</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="New tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                disabled={isLoading}
              />
              <Button
                onClick={() => handleAddTag(selectedVersions[0])}
                disabled={!newTag || selectedVersions.length !== 1 || isLoading}
              >
                <Tag className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Comments</h3>
            <ScrollArea className="h-[100px] border rounded mb-2">
              {comments.map((comment, index) => (
                <div key={index} className="p-2 border-b">
                  <p className="text-sm">{comment.content}</p>
                  <p className="text-xs text-gray-500">
                    By {comment.author} on{" "}
                    {new Date(comment.timestamp * 1000).toLocaleString()}
                  </p>
                </div>
              ))}
            </ScrollArea>
            <div className="flex space-x-2">
              <Input
                placeholder="New comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isLoading}
              />
              <Button
                onClick={() => handleAddComment(selectedVersions[0])}
                disabled={
                  !newComment || selectedVersions.length !== 1 || isLoading
                }
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </div>
          </div>
          <BranchManager />
          <div>
            <h3 className="text-sm font-medium mb-2">Version History Graph</h3>
            <VersionGraph versions={versions} />
          </div>
          <Button onClick={handleExport} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export History
          </Button>
          {uploadProgress > 0 && (
            <div>
              <Label>Upload Progress</Label>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
          {showCodeReview && selectedVersionForReview && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Code Review</h3>
              <CodeReview versionHash={selectedVersionForReview} code={code} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function VersionItem({
  version,
  isSelected,
  onSelect,
  onLoad,
  onViewComments,
  onRevert,
  onReview,
  isLoading,
}: {
  version: Version;
  isSelected: boolean;
  onSelect: (hash: string) => void;
  onLoad: (hash: string) => void;
  onViewComments: (hash: string) => void;
  onRevert: (hash: string) => void;
  onReview: (hash: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex justify-between items-center p-2 hover:bg-accent">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(version.hash)}
        className="mr-2"
      />
      <span className="text-sm truncate flex-grow">{version.message}</span>
      <div className="flex items-center space-x-2">
        {version.tags.map((tag, index) => (
          <span
            key={index}
            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
          >
            {tag}
          </span>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLoad(version.hash)}
          disabled={isLoading}
        >
          <Upload className="h-4 w-4" />
          <span className="sr-only">Load version</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewComments(version.hash)}
          disabled={isLoading}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="sr-only">View comments</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRevert(version.hash)}
          disabled={isLoading}
        >
          Revert
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReview(version.hash)}
          disabled={isLoading}
        >
          Review
        </Button>
      </div>
    </div>
  );
}
