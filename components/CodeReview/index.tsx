'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWeb3 } from '@/hooks/useWeb3';
import { useToast } from '@/hooks/useToast';
import { CodeReviewProps } from './types';
import { Comment } from '@/types/global';

export default function CodeReview({ versionHash, code }: CodeReviewProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>(
    'pending'
  );
  const { addComment, getComments, approveVersion, rejectVersion } = useWeb3();
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    fetchApprovalStatus();
  }, [versionHash]);

  const fetchComments = async () => {
    try {
      const fetchedComments = await getComments(versionHash);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch comments',
        variant: 'destructive',
      });
    }
  };

  const fetchApprovalStatus = async () => {
    try {
      // const status = await getApprovalStatus(versionHash);
      setApprovalStatus('approved');
    } catch (error) {
      console.error('Error fetching approval status:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch approval status',
        variant: 'destructive',
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment || selectedLine === null) return;

    try {
      await addComment(versionHash, newComment);
      setNewComment('');
      setSelectedLine(null);
      fetchComments();
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    }
  };

  const handleApprove = async () => {
    try {
      await approveVersion(versionHash);
      setApprovalStatus('approved');
      toast({
        title: 'Success',
        description: 'Version approved successfully',
      });
    } catch (error) {
      console.error('Error approving version:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve version',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    try {
      await rejectVersion(versionHash);
      setApprovalStatus('rejected');
      toast({
        title: 'Success',
        description: 'Version rejected successfully',
      });
    } catch (error) {
      console.error('Error rejecting version:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject version',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex">
        <ScrollArea className="w-1/2 border-r">
          <pre className="p-4">
            {code.split('\n').map((line, index) => (
              <div
                key={index}
                className={`cursor-pointer hover:bg-gray-100 ${
                  selectedLine === index + 1 ? 'bg-yellow-100' : ''
                }`}
                onClick={() => setSelectedLine(index + 1)}
              >
                <span className="mr-4 text-gray-500">{index + 1}</span>
                {line}
              </div>
            ))}
          </pre>
        </ScrollArea>
        <ScrollArea className="w-1/2 p-4">
          <h3 className="text-lg font-semibold mb-4">Comments</h3>
          {comments.map((comment) => (
            <div key={comment.id} className="mb-4 p-2 border rounded">
              <p className="font-semibold">{comment.author}</p>
              <p className="text-sm text-gray-500">Line {comment.lineNumber}</p>
              <p>{comment.content}</p>
              <p className="text-xs text-gray-400">
                {new Date(comment.timestamp * 1000).toLocaleString()}
              </p>
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="p-4 border-t">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="mb-2"
        />
        <div className="flex justify-between items-center">
          <Button onClick={handleAddComment} disabled={!newComment || selectedLine === null}>
            Add Comment
          </Button>
          <div>
            <Button
              onClick={handleApprove}
              disabled={approvalStatus !== 'pending'}
              className="mr-2"
              variant={approvalStatus === 'approved' ? 'default' : 'outline'}
            >
              Approve
            </Button>
            <Button
              onClick={handleReject}
              disabled={approvalStatus !== 'pending'}
              variant={approvalStatus === 'rejected' ? 'destructive' : 'outline'}
            >
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
