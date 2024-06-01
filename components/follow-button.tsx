import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FollowButtonProps {
  userId: string;
}

export function FollowButton({ userId }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFollowToggle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/users/${userId}/${isFollowing ? "unfollow" : "follow"}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setIsFollowing(!isFollowing);
        toast({
          title: isFollowing ? "Unfollowed" : "Followed",
          description: isFollowing
            ? "You have unfollowed this user."
            : "You are now following this user.",
        });
      } else {
        throw new Error("Failed to update follow status");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={isLoading}
      variant={isFollowing ? "outline" : "default"}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
