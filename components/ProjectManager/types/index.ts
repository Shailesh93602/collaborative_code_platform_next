export interface Project {
  id: string;
  name: string;
  code: string;
}

export interface ProjectManagerProps {
  projects: Project[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onProjectLoad: (code: string) => void;
}
