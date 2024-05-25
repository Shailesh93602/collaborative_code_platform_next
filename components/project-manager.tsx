"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  code: string;
}

export function ProjectManager({
  onProjectLoad,
}: {
  onProjectLoad: (code: string) => void;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      } else {
        throw new Error("Failed to fetch projects");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      });
    }
  };

  const createProject = async () => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newProjectName, code: "// New project" }),
      });

      if (response.ok) {
        const data = await response.json();
        setProjects([...projects, data.project]);
        setNewProjectName("");
        toast({
          title: "Success",
          description: "Project created successfully",
        });
      } else {
        throw new Error("Failed to create project");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const loadProject = (project: Project) => {
    onProjectLoad(project.code);
    toast({
      title: "Project Loaded",
      description: `Loaded project: ${project.name}`,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Project Manager</h2>
      <div className="flex space-x-2">
        <Input
          placeholder="New project name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
        <Button onClick={createProject}>Create Project</Button>
      </div>
      <div className="space-y-2">
        {projects.map((project) => (
          <div key={project.id} className="flex justify-between items-center">
            <span>{project.name}</span>
            <Button onClick={() => loadProject(project)}>Load</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
