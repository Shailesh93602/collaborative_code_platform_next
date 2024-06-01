import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Twitter, Globe } from "lucide-react";
import { FollowButton } from "./follow-button";

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    bio: string;
    profile: {
      avatarUrl: string;
      githubProfile: string;
      twitterHandle: string;
      websiteUrl: string;
      skills: string[];
    };
  };
  isOwnProfile: boolean;
}

export function UserProfile({ user, isOwnProfile }: UserProfileProps) {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-center space-x-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={user.profile.avatarUrl} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-2xl">{user.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        {!isOwnProfile && <FollowButton userId={user.id} />}
      </CardHeader>
      <CardContent>
        <p className="mb-4">{user.bio}</p>
        <div className="flex space-x-4 mb-4">
          {user.profile.githubProfile && (
            <a
              href={`https://github.com/${user.profile.githubProfile}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1"
            >
              <Github className="w-4 h-4" />
              <span>{user.profile.githubProfile}</span>
            </a>
          )}
          {user.profile.twitterHandle && (
            <a
              href={`https://twitter.com/${user.profile.twitterHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1"
            >
              <Twitter className="w-4 h-4" />
              <span>{user.profile.twitterHandle}</span>
            </a>
          )}
          {user.profile.websiteUrl && (
            <a
              href={user.profile.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1"
            >
              <Globe className="w-4 h-4" />
              <span>Website</span>
            </a>
          )}
        </div>
        <div>
          <h3 className="font-semibold mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user.profile.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
