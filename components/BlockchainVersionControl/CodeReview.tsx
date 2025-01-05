'use client';
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/hooks/useWeb3.hook';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { CodeReviewProps } from './types';

export default function CodeReview({ code, selectedVersion, dictionary }: CodeReviewProps) {
  const [reviewComments, setReviewComments] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addReviewComment, getReviewComments, approveVersion, rejectVersion } = useWeb3();

  useEffect(() => {
    if (selectedVersion) {
      fetchReviewComments();
    }
  }, [selectedVersion]);

  const fetchReviewComments = async () => {
    if (!selectedVersion) return;
    setIsLoading(true);
    setError(null);
    try {
      const comments = await getReviewComments(selectedVersion);
      setReviewComments(comments.map((c) => `${c.author}: ${c.content}`).join('\n'));
    } catch (error) {
      console.error('Error fetching review comments:', error);
      setError(dictionary?.Errors?.FetchingReviewComments);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReviewComment = async () => {
    if (!reviewComments || !selectedVersion) return;
    setIsLoading(true);
    setError(null);
    try {
      await addReviewComment(selectedVersion, reviewComments, 0); // Assuming 0 as the line number for the entire file
      setReviewComments('');
      fetchReviewComments();
    } catch (error) {
      console.error('Error adding review comment:', error);
      setError(dictionary?.Errors?.AddingReviewComments);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedVersion) return;
    setIsLoading(true);
    setError(null);
    try {
      await approveVersion(selectedVersion);
    } catch (error) {
      console.error('Error approving version:', error);
      setError(dictionary?.Errors?.ApprovingVersion);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVersion) return;
    setIsLoading(true);
    setError(null);
    try {
      await rejectVersion(selectedVersion);
    } catch (error) {
      console.error('Error rejecting version:', error);
      setError(dictionary?.Errors?.RejectingVersion);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{dictionary?.Text?.CodeReview}</h3>
      <ScrollArea className="h-[200px] border rounded mb-2">
        <pre className="p-2">{code}</pre>
      </ScrollArea>
      <Textarea
        placeholder={dictionary?.Placeholder?.ReviewComments}
        value={reviewComments}
        onChange={(e) => setReviewComments(e.target.value)}
        className="mb-2"
      />
      <div className="flex space-x-2">
        <Button onClick={handleAddReviewComment} disabled={!reviewComments || !selectedVersion}>
          {dictionary?.Button?.AddReviewComments}
        </Button>
        <Button onClick={handleApprove} disabled={!selectedVersion}>
          {dictionary?.Button?.Approve}
        </Button>
        <Button onClick={handleReject} disabled={!selectedVersion}>
          {dictionary?.Button?.Reject}
        </Button>
      </div>
    </div>
  );
}
