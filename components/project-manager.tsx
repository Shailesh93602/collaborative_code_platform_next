"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast.hook";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Project {
  id: string;
  name: string;
  code: string;
}

interface ProjectManagerProps {
  projects: Project[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onProjectLoad: (code: string) => void;
}

export function ProjectManager({
  projects,
  isLoading,
  error,
  onProjectLoad,
}: ProjectManagerProps) {
  const [newProjectName, setNewProjectName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createProjectMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, code: "// New project" }),
      });
      if (!response.ok) {
        throw new Error("Failed to create project");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setNewProjectName("");
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const createProject = () => {
    if (newProjectName) {
      createProjectMutation.mutate(newProjectName);
    }
  };

  const loadProject = (project: Project) => {
    onProjectLoad(project.code);
    toast({
      title: "Project Loaded",
      description: `Loaded project: ${project.name}`,
    });
  };

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  if (error) {
    return <div>Error loading projects: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Project Manager</h2>
      <div className="flex space-x-2">
        <Input
          placeholder="New project name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
        <Button
          onClick={createProject}
          disabled={createProjectMutation.isPending}
        >
          {createProjectMutation.isPending ? "Creating..." : "Create Project"}
        </Button>
      </div>
      <div className="space-y-2">
        {projects?.map((project) => (
          <div key={project.id} className="flex justify-between items-center">
            <span>{project.name}</span>
            <Button onClick={() => loadProject(project)}>Load</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
