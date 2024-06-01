"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  followers: number;
  following: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
}

export function UserProfilePage({ userId }: { userId: string }) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
    fetchUserProjects();
    checkFollowStatus();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    }
  };

  const fetchUserProjects = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/projects`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching user projects:", error);
      toast({
        title: "Error",
        description: "Failed to load user projects",
        variant: "destructive",
      });
    }
  };

  const checkFollowStatus = async () => {
    if (session?.user?.id === userId) return;
    try {
      const response = await fetch(`/api/users/${userId}/follow-status`);
      const data = await response.json();
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isFollowing ? "unfollow" : "follow" }),
      });
      if (response.ok) {
        setIsFollowing(!isFollowing);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followers: isFollowing
                  ? prev.followers - 1
                  : prev.followers + 1,
              }
            : null
        );
        toast({
          title: isFollowing ? "Unfollowed" : "Followed",
          description: `You have ${isFollowing ? "unfollowed" : "followed"} ${
            profile?.name
          }`,
        });
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{profile.name}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{profile.bio}</p>
          <div className="flex space-x-4 mb-4">
            <span>{profile.followers} followers</span>
            <span>{profile.following} following</span>
          </div>
          {session?.user?.id !== userId && (
            <Button onClick={handleFollowToggle}>
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="projects" className="mt-8">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="projects">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{project.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="activity">
          {/* Implement activity feed here */}
          <p>User activity will be displayed here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
