"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Github } from "lucide-react";
import { useToast } from "@/hooks/useToast.hook";

export function ProjectImport() {
  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!repoUrl) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/projects/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to import project");
      }

      const data = await response.json();
      toast({
        title: "Project Imported",
        description: `Successfully imported ${data.name}`,
      });
      setRepoUrl("");
    } catch (error) {
      toast({
        title: "Import Failed",
        description:
          "There was an error importing your project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Import GitHub Project</CardTitle>
        <CardDescription>
          Enter the URL of the GitHub repository you want to import
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Github className="w-6 h-6" />
          <Input
            placeholder="https://github.com/username/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleImport} disabled={isLoading || !repoUrl}>
          {isLoading ? "Importing..." : "Import Project"}
        </Button>
      </CardFooter>
    </Card>
  );
}
