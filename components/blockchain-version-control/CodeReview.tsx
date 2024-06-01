import { useState } from "react";
import { useWeb3 } from "@/hooks/userWeb3.hook";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CodeReviewProps {
  readonly code: string;
}

export function CodeReview({ code }: CodeReviewProps) {
  const [reviewComments, setReviewComments] = useState<string>("");
  const [selectedVersion] = useState<string | null>(null);
  const { addReviewComment, approveVersion, rejectVersion } = useWeb3();

  const handleAddReviewComment = async () => {
    if (!reviewComments || !selectedVersion) return;
    try {
      await addReviewComment(selectedVersion, reviewComments, 0); // Assuming 0 as the line number for the entire file
      setReviewComments("");
      // In a real implementation, you would update the UI to show the new comment
    } catch (error) {
      console.error("Error adding review comment:", error);
    }
  };

  const handleApprove = async () => {
    if (!selectedVersion) return;
    try {
      await approveVersion(selectedVersion);
      // In a real implementation, you would update the UI to show the approval status
    } catch (error) {
      console.error("Error approving version:", error);
    }
  };

  const handleReject = async () => {
    if (!selectedVersion) return;
    try {
      await rejectVersion(selectedVersion);
      // In a real implementation, you would update the UI to show the rejection status
    } catch (error) {
      console.error("Error rejecting version:", error);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Code Review</h3>
      <ScrollArea className="h-[200px] border rounded mb-2">
        <pre className="p-2">{code}</pre>
      </ScrollArea>
      <Textarea
        placeholder="Add review comments..."
        value={reviewComments}
        onChange={(e) => setReviewComments(e.target.value)}
        className="mb-2"
      />
      <div className="flex space-x-2">
        <Button
          onClick={handleAddReviewComment}
          disabled={!reviewComments || !selectedVersion}
        >
          Add Review Comment
        </Button>
        <Button onClick={handleApprove} disabled={!selectedVersion}>
          Approve
        </Button>
        <Button onClick={handleReject} disabled={!selectedVersion}>
          Reject
        </Button>
      </div>
    </div>
  );
}
