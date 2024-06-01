import { useQuery, useMutation, useQueryClient } from "react-query";
import { getProjects, createProject, fetchProjectData } from "@/lib/api.util";

export function useProjects() {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery("projects", getProjects);

  const createProjectMutation = useMutation(createProject, {
    onSuccess: () => {
      queryClient.invalidateQueries("projects");
    },
  });

  const fetchProjectDataQuery = (projectId: string) =>
    useQuery(["project", projectId], () => fetchProjectData(projectId), {
      enabled: !!projectId,
    });

  return {
    projects: projectsQuery.data,
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    createProject: createProjectMutation.mutate,
    fetchProjectData: fetchProjectDataQuery,
  };
}
