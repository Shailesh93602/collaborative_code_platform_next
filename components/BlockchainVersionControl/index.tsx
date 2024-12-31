'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useWeb3 } from '@/hooks/useWeb3.hook';
import { GitBranch, Save, Lock, Loader2, Upload, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/useToast.hook';
import VersionHistory from './VersionHistory';
import FileExplorer from './FileExplorer';
import ConflictResolver from './ConflictResolver';
import TagManager from './TagManager';
import CommentSection from './CommentSection';
import BranchManager from './BranchManager';
import VersionGraph from './VersionGraph';
import ExportButton from './ExportButton';
import CodeReview from './CodeReview';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { z } from 'zod';
import { encrypt, decrypt } from '@/lib/encryption.util';
import { logError } from '@/lib/errorHandling';
import { Skeleton } from '@/components/ui/skeleton';
import { BlockchainVersionControlProps } from '@/types/components';
import { formatRelativeDate } from '@/lib/dateUtils';
import { VersionItemProps } from './types';

export default function BlockchainVersionControl({
  code,
  onCodeUpdate,
  files,
  onFilesUpdate,
  dictionary,
  lang,
}: BlockchainVersionControlProps) {
  const [commitMessage, setCommitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [commitMessageError, setCommitMessageError] = useState<string | null>(null);
  const { saveVersion, loadVersion } = useWeb3();
  const { toast } = useToast();

  const commitMessageSchema = z.string().min(1, dictionary?.commitMessageRequired);

  const validateCommitMessage = useCallback(
    (message: string) => {
      try {
        commitMessageSchema.parse(message);
        setCommitMessageError(null);
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          setCommitMessageError(error.errors[0].message);
        }
        return false;
      }
    },
    [commitMessageSchema, dictionary]
  );

  const handleSave = useCallback(async () => {
    if (!validateCommitMessage(commitMessage) || !selectedFile) return;
    setIsLoading(true);
    setError(null);
    try {
      const { encryptedData, keyId } = await encrypt(code);
      await saveVersion(commitMessage, [{ path: selectedFile, content: encryptedData, keyId }]);
      setCommitMessage('');
      toast({
        title: dictionary?.success,
        description: dictionary?.encryptedVersionSaved,
      });
    } catch (error: any) {
      setError(dictionary?.failedToSaveEncryptedVersion);
      logError(error, 'blockChainVersionControl', { action: 'save', selectedFile });
    } finally {
      setIsLoading(false);
    }
  }, [
    commitMessage,
    code,
    selectedFile,
    saveVersion,
    toast,
    validateCommitMessage,
    encrypt,
    dictionary,
  ]);

  const handleLoad = useCallback(
    async (hash: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await loadVersion(hash);
        const mainFile = result.find((file) => file.path === selectedFile);
        if (mainFile) {
          const decryptedContent = await decrypt(mainFile.content, mainFile.keyId ?? '');
          onCodeUpdate(decryptedContent);
        }
        toast({
          title: dictionary?.success,
          description: dictionary?.encryptedVersionLoadedAndDecrypted,
        });
      } catch (error: any) {
        setError(dictionary?.failedToLoadAndDecryptVersion);
        logError(error, 'blockchainVersionControl', { action: 'load', hash, selectedFile });
      } finally {
        setIsLoading(false);
      }
    },
    [loadVersion, selectedFile, onCodeUpdate, toast, decrypt, dictionary]
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <GitBranch className="h-4 w-4" />
          <span className="sr-only">{dictionary?.openVersionControl}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{dictionary?.blockchainVersionControlEncrypted}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div aria-live="polite" className="sr-only">
            {isLoading && dictionary?.loading}
            {error && `${dictionary?.error?.replace('{{error}}', error)}`}
          </div>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="flex space-x-4">
                <Skeleton className="h-40 w-1/3" />
                <Skeleton className="h-40 w-2/3" />
              </div>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <>
              <div className="flex space-x-2">
                <div className="flex-grow">
                  <Input
                    placeholder={dictionary?.commitMessagePlaceholder}
                    value={commitMessage}
                    onChange={(e) => {
                      setCommitMessage(e.target.value);
                      validateCommitMessage(e.target.value);
                    }}
                    disabled={isLoading}
                    aria-label={dictionary?.enterCommitMessage}
                    aria-invalid={!!commitMessageError}
                    aria-describedby="commit-message-error"
                  />
                  {commitMessageError && (
                    <p id="commit-message-error" className="text-red-500 text-sm mt-1">
                      {commitMessageError}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleSave}
                  disabled={!commitMessage || isLoading || !!commitMessageError}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      <Lock className="h-4 w-4 mr-2" />
                    </>
                  )}
                  {dictionary?.queueEncryptedSave}
                </Button>
              </div>
              <div className="flex space-x-4">
                <FileExplorer
                  files={files}
                  onFileSelect={setSelectedFile}
                  onFilesUpdate={onFilesUpdate}
                />
                <div role="region" aria-label={dictionary?.versionHistory}>
                  <VersionHistory
                    onLoad={handleLoad}
                    selectedFile={selectedFile}
                    dictionary={dictionary}
                    lang={lang}
                  />
                </div>
              </div>
              <ConflictResolver code={code} />
              <TagManager />
              <CommentSection />
              <BranchManager />
              <VersionGraph />
              <ExportButton />
              <CodeReview code={code} selectedVersion={selectedFile} />
            </>
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
  dictionary,
  lang,
}: VersionItemProps) {
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
        <span className="text-xs text-muted-foreground">
          {formatRelativeDate(version.timestamp, new Date(), lang)}
        </span>
        {version.tags.map((tag, index) => (
          <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {tag}
          </span>
        ))}
        <Button variant="ghost" size="sm" onClick={() => onLoad(version.hash)} disabled={isLoading}>
          <Upload className="h-4 w-4" />
          <span className="sr-only">{dictionary?.loadVersion}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewComments(version.hash)}
          disabled={isLoading}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="sr-only">{dictionary?.viewComments}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRevert(version.hash)}
          disabled={isLoading}
        >
          {dictionary?.revert}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReview(version.hash)}
          disabled={isLoading}
        >
          {dictionary?.review}
        </Button>
      </div>
    </div>
  );
}
