"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/useToast.hook";

interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  target: string;
  timestamp: string;
}

export function SocialFeed() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/social-feed");
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error("Error fetching social feed:", error);
      toast({
        title: "Error",
        description: "Failed to load social feed",
        variant: "destructive",
      });
    }
  };

  if (!session) return <div>Please sign in to view the social feed.</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Social Feed</h2>
      {activities.map((activity) => (
        <Card key={activity.id}>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage
                  src={activity.userAvatar}
                  alt={activity.userName}
                />
                <AvatarFallback>{activity.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm font-medium">
                  {activity.userName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p>
              {activity.action} {activity.target}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
