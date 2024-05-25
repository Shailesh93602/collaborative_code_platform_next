"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";
import { DiffViewer } from "@/components/diff-viewer";
import { BranchManager } from "@/components/branch-manager";

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
  } = useWeb3();
  const { toast } = useToast();

  useEffect(() => {
    fetchVersions();
  }, []);

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
      console.error("Error fetching versions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch versions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await saveVersion(commitMessage, code);
      console.log(
        "🚀 ~ file: blockchain-version-control.tsx:109 ~ handleSave ~ result:",
        result
      );
      setCommitMessage("");
      fetchVersions();
      toast({
        title: "Success",
        description: "Version saved successfully",
      });
    } catch (error) {
      console.error("Error saving version:", error);
      toast({
        title: "Error",
        description: "Failed to save version",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async (hash: string) => {
    setIsLoading(true);
    try {
      const result = await loadVersion(hash);
      onCodeUpdate(result.code);
      toast({
        title: "Success",
        description: "Version loaded successfully",
      });
    } catch (error) {
      console.error("Error loading version:", error);
      toast({
        title: "Error",
        description: "Failed to load version",
        variant: "destructive",
      });
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
      console.error("Error searching versions:", error);
      toast({
        title: "Error",
        description: "Failed to search versions",
        variant: "destructive",
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
      console.error("Error resolving conflict:", error);
      toast({
        title: "Error",
        description: "Failed to resolve conflict",
        variant: "destructive",
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
      console.error("Error adding tag:", error);
      toast({
        title: "Error",
        description: "Failed to add tag",
        variant: "destructive",
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
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
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
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch comments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
          <div className="flex space-x-2">
            <Input
              placeholder="Commit message"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleSave} disabled={!commitMessage || isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder="Search versions"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleSearch} disabled={!searchQuery || isLoading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Version History</h3>
            <ScrollArea className="h-[200px] border rounded">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  Loading...
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
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
