"use client";

import { useState, useEffect, useCallback } from "react";
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

interface File {
  path: string;
  content: string;
}

interface BlockchainVersionControlProps {
  code: string;
  onCodeUpdate: (code: string) => void;
}

const VERSIONS_PER_PAGE = 5;

export function BlockchainVersionControl({
  code,
  onCodeUpdate,
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
    { commitMessage: string; files: File[] }[]
  >([]);
  const [fileTree, setFileTree] = useState<any>({
    name: "root",
    type: "directory",
    children: [
      {
        name: "main.js",
        type: "file",
      },
    ],
  });
  const [selectedFile, setSelectedFile] = useState<string>("main.js");
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
  } = useLocalCache("versionHistory", getAllVersions);

  useEffect(() => {
    if (cachedVersions) {
      setVersions(cachedVersions);
    }
  }, [cachedVersions]);

  const handleBlockchainError = useCallback(
    (error: Error, action: string) => {
      console.error(`Error ${action}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action}. Please try again.`,
        variant: "destructive",
      });
    },
    [toast]
  );

  const handleSave = useCallback(async () => {
    if (!commitMessage) return;
    setIsLoading(true);
    try {
      const files = [{ path: selectedFile, content: code }];
      const result = await saveVersion(commitMessage, files);
      setPendingVersions((prev) => [...prev, { commitMessage, files }]);
      setCommitMessage("");
      invalidateCache();
      toast({
        title: "Success",
        description: "Version saved successfully",
      });
    } catch (error) {
      handleBlockchainError(error as Error, "saving version");
    } finally {
      setIsLoading(false);
    }
  }, [
    commitMessage,
    code,
    selectedFile,
    saveVersion,
    invalidateCache,
    toast,
    handleBlockchainError,
  ]);

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
      handleBlockchainError(error as Error, "saving versions");
    } finally {
      setIsLoading(false);
    }
  }, [
    pendingVersions,
    batchSaveVersions,
    fetchVersions,
    toast,
    handleBlockchainError,
  ]);

  const handleLoad = async (hash: string) => {
    setIsLoading(true);
    try {
      const result = await loadVersion(hash);
      const mainFile = result.files.find((file) => file.path === "main.js");
      if (mainFile) {
        onCodeUpdate(mainFile.content);
      }
      toast({
        title: "Success",
        description: "Version loaded successfully",
      });
    } catch (error) {
      handleBlockchainError(error as Error, "loading version");
    } finally {
      setIsLoading(false);
    }
  };

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
      handleBlockchainError(error as Error, "fetching versions");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      handleBlockchainError(error as Error, "searching versions");
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
      handleBlockchainError(error as Error, "resolving conflict");
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
      handleBlockchainError(error as Error, "adding tag");
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
      handleBlockchainError(error as Error, "adding comment");
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
      handleBlockchainError(error as Error, "fetching comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFile = async (path: string) => {
    try {
      await createFile(path, "");
      fetchFileTree();
      toast({
        title: "Success",
        description: "File created successfully",
      });
    } catch (error) {
      handleBlockchainError(error as Error, "creating file");
    }
  };

  const handleCreateDirectory = async (path: string) => {
    try {
      await createFile(path, "", true);
      fetchFileTree();
      toast({
        title: "Success",
        description: "Directory created successfully",
      });
    } catch (error) {
      handleBlockchainError(error as Error, "creating directory");
    }
  };

  const handleDeleteFile = async (path: string) => {
    try {
      await deleteFile(path);
      fetchFileTree();
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    } catch (error) {
      handleBlockchainError(error as Error, "deleting file");
    }
  };

  const handleRenameFile = async (oldPath: string, newPath: string) => {
    try {
      await renameFile(oldPath, newPath);
      fetchFileTree();
      toast({
        title: "Success",
        description: "File renamed successfully",
      });
    } catch (error) {
      handleBlockchainError(error as Error, "renaming file");
    }
  };

  const handleFileSelect = async (path: string) => {
    setSelectedFile(path);
    try {
      const fileContent = await loadVersion(path);
      onCodeUpdate(fileContent.code);
    } catch (error) {
      handleBlockchainError(error as Error, "loading file content");
    }
  };

  const fetchFileTree = async () => {
    try {
      const tree = await getAllVersions();
      setFileTree(tree);
    } catch (error) {
      handleBlockchainError(error as Error, "fetching file tree");
    }
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
        handleBlockchainError(error as Error, "reverting to version");
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

  const paginatedVersions = versions.slice(
    (currentPage - 1) * VERSIONS_PER_PAGE,
    currentPage * VERSIONS_PER_PAGE
  );

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
          <DialogTitle>Blockchain Version Control</DialogTitle>
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
            <Button onClick={handleSave} disabled={!commitMessage || isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Queue Save
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
              <FileTree
                data={fileTree}
                onSelect={handleFileSelect}
                onCreateFile={handleCreateFile}
                onCreateDirectory={handleCreateDirectory}
                onDelete={handleDeleteFile}
                onRename={handleRenameFile}
              />
            </div>
            <div className="w-2/3">
              <h3 className="text-sm font-medium mb-2">Version History</h3>
              <ScrollArea className="h-[200px] border rounded">
                {versionsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    Loading versions...
                  </div>
                ) : (
                  paginatedVersions.map((version) => (
                    <div
                      key={version.hash}
                      className="flex justify-between items-center p-2 hover:bg-accent"
                    >
                      <input
                        type="checkbox"
                        checked={selectedVersions.includes(version.hash)}
                        onChange={() => handleVersionSelect(version.hash)}
                        className="mr-2"
                      />
                      <span className="text-sm truncate flex-grow">
                        {version.message}
                      </span>
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
                          onClick={() => handleLoad(version.hash)}
                          disabled={isLoading}
                        >
                          <Upload className="h-4 w-4" />
                          <span className="sr-only">Load version</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewComments(version.hash)}
                          disabled={isLoading}
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span className="sr-only">View comments</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevert(version.hash)}
                          disabled={isLoading}
                        >
                          Revert
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(versions.length / VERSIONS_PER_PAGE)}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
