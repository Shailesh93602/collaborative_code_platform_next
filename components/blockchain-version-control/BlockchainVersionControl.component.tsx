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
import { useWeb3 } from "@/hooks/userWeb3.hook";
import { GitBranch, Save, Lock } from "lucide-react";
import { useToast } from "@/hooks/useToast.hook";
import { CustomFile } from "@/types/file";
import { VersionHistory } from "./VersionHistory";
import { FileExplorer } from "./FileExplorer";
import { ConflictResolver } from "./ConflictResolver";
import { TagManager } from "./TagManager";
import { CommentSection } from "./CommentSection";
import { BranchManager } from "./BranchManager";
import { VersionGraph } from "./VersionGraph";
import { ExportButton } from "./ExportButton";
import { EncryptionManager } from "./EncryptionManager";
import { CodeReview } from "./CodeReview";
import {
  BlockchainErrorType,
  handleBlockchainError,
} from "@/lib/blockchainErrorHandler.util";

interface BlockchainVersionControlProps {
  code: string;
  onCodeUpdate: (code: string) => void;
  files: CustomFile[];
  onFilesUpdate: (files: CustomFile[]) => void;
}

export function BlockchainVersionControl({
  code,
  onCodeUpdate,
  files,
  onFilesUpdate,
}: BlockchainVersionControlProps) {
  const [commitMessage, setCommitMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const { saveVersion, loadVersion } = useWeb3();
  const { toast } = useToast();
  const encryptionManager = EncryptionManager();

  const handleSave = useCallback(async () => {
    if (!commitMessage || !encryptionManager.encryptionKey || !selectedFile)
      return;
    setIsLoading(true);
    try {
      const encryptedCode = await encryptionManager.encryptData(code);
      await saveVersion(commitMessage, [
        { path: selectedFile, content: encryptedCode },
      ]);
      setCommitMessage("");
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
    }
  }, [
    commitMessage,
    code,
    selectedFile,
    saveVersion,
    toast,
    encryptionManager,
  ]);

  const handleLoad = useCallback(
    async (hash: string) => {
      if (!encryptionManager.encryptionKey) return;
      setIsLoading(true);
      try {
        const result = await loadVersion(hash);
        const mainFile = result.files.find(
          (file) => file.path === selectedFile
        );
        if (mainFile) {
          const decryptedContent = await encryptionManager.decryptData(
            mainFile.content
          );
          onCodeUpdate(decryptedContent);
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
      }
    },
    [loadVersion, selectedFile, onCodeUpdate, toast, encryptionManager]
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
          <DialogTitle>Blockchain Version Control (Encrypted)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Commit message"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              disabled={isLoading}
            />
            <Button
              onClick={handleSave}
              disabled={
                !commitMessage || isLoading || !encryptionManager.encryptionKey
              }
            >
              <Save className="h-4 w-4 mr-2" />
              <Lock className="h-4 w-4 mr-2" />
              Queue Encrypted Save
            </Button>
          </div>
          <div className="flex space-x-4">
            <FileExplorer
              files={files}
              onFileSelect={setSelectedFile}
              onFilesUpdate={onFilesUpdate}
            />
            <VersionHistory onLoad={handleLoad} selectedFile={selectedFile} />
          </div>
          <ConflictResolver code={code} />
          <TagManager />
          <CommentSection />
          <BranchManager />
          <VersionGraph />
          <ExportButton />
          <CodeReview code={code} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
