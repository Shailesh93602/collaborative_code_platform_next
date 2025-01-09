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
import { useWeb3 } from '@/hooks/useWeb3';
import { GitBranch, Save, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
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
import * as yup from 'yup';
import { encrypt, decrypt } from '@/lib/encryption';
import { logError } from '@/lib/errorHandling';
import { Skeleton } from '@/components/ui/skeleton';
import { BlockchainVersionControlProps } from '@/types/global';

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

  const commitMessageSchema = yup.string().min(1, dictionary?.CommitMessageRequired);

  const validateCommitMessage = useCallback(
    (message: string) => {
      try {
        commitMessageSchema.validate(message);
        setCommitMessageError(null);
        return true;
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          setCommitMessageError(error?.[0]?.message);
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
        title: dictionary?.Success,
        description: dictionary?.EncryptedVersionSaved,
      });
    } catch (error: any) {
      setError(dictionary?.FailedToSaveEncryptedVersion);
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
          title: dictionary?.Success,
          description: dictionary?.EncryptedVersionLoadedAndDecrypted,
        });
      } catch (error: any) {
        setError(dictionary?.FailedToLoadAndDecryptVersion);
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
          <span className="sr-only">{dictionary?.OpenVersionControl}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{dictionary?.BlockchainVersionControlEncrypted}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div aria-live="polite" className="sr-only">
            {isLoading && dictionary?.Loading}
            {error && `${dictionary?.Error?.replace('{{error}}', error)}`}
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
                    placeholder={dictionary?.Placeholder?.CommitMessage}
                    value={commitMessage}
                    onChange={(e) => {
                      setCommitMessage(e.target.value);
                      validateCommitMessage(e.target.value);
                    }}
                    disabled={isLoading}
                    aria-label={dictionary?.EnterCommitMessage}
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
                  {dictionary?.QueueEncryptedSave}
                </Button>
              </div>
              <div className="flex space-x-4">
                <FileExplorer
                  files={files}
                  onFileSelect={setSelectedFile}
                  onFilesUpdate={onFilesUpdate}
                  dictionary={dictionary}
                />
                <div role="region" aria-label={dictionary?.VersionHistory}>
                  <VersionHistory
                    onLoad={handleLoad}
                    selectedFile={selectedFile}
                    dictionary={dictionary}
                    lang={lang}
                  />
                </div>
              </div>
              <ConflictResolver code={code} dictionary={dictionary} />
              <TagManager />
              <CommentSection dictionary={dictionary} />
              <BranchManager dictionary={dictionary} />
              <VersionGraph />
              <ExportButton dictionary={dictionary} />
              <CodeReview code={code} selectedVersion={selectedFile} dictionary={dictionary} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
