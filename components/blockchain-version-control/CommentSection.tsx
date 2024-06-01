import { useState, useEffect } from "react";
import { useWeb3 } from "@/hooks/userWeb3.hook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";

interface Comment {
  author: string;
  content: string;
  timestamp: number;
}

export function CommentSection() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
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
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment || !selectedVersion) return;
    try {
      await addComment(selectedVersion, newComment);
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
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
        />
        <Button
          onClick={handleAddComment}
          disabled={!newComment || !selectedVersion}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Add Comment
        </Button>
      </div>
    </div>
  );
}
