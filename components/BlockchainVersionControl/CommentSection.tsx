'use client';
import { useState, useEffect } from 'react';
import { useWeb3 } from '@/hooks/useWeb3.hook';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare } from 'lucide-react';
import { Comment } from './types';

export default function CommentSection({ dictionary }: { readonly dictionary: any }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedVersion] = useState<string | null>(null);
  const { addComment, getComments } = useWeb3();

  useEffect(() => {
    if (selectedVersion) {
      fetchComments();
    }
  }, [selectedVersion]);

  const fetchComments = async () => {
    if (!selectedVersion) return;
    try {
      const fetchedComments = await getComments(selectedVersion);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment || !selectedVersion) return;
    try {
      await addComment(selectedVersion, newComment);
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">{dictionary?.text?.comments}</h3>
      <ScrollArea className="h-[100px] border rounded mb-2">
        {comments.map((comment, index) => (
          <div key={index} className="p-2 border-b">
            <p className="text-sm">{comment.content}</p>
            <p className="text-xs text-gray-500">
              {dictionary?.Text?.CommentedBy?.replace('{{AUTHOR}}', comment.author)?.replace(
                '{{DATE}}',
                new Date(comment.timestamp * 1000).toLocaleString()
              )}
            </p>
          </div>
        ))}
      </ScrollArea>
      <div className="flex space-x-2">
        <Input
          placeholder={dictionary?.Placeholder?.NewComment}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button onClick={handleAddComment} disabled={!newComment || !selectedVersion}>
          <MessageSquare className="h-4 w-4 mr-2" />
          {dictionary?.Button?.AddComment}
        </Button>
      </div>
    </div>
  );
}
