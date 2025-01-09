import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getProjects,
  createProject,
  fetchProjectData,
  updateProject,
  deleteProject,
} from '@/lib/api';
import { useToast } from '@/hooks/useToast';

export function useProjects() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const projectsQuery = useQuery('projects', getProjects, {
    onError: (error: Error) => {
      toast({
        title: 'Error fetching projects',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const createProjectMutation = useMutation(createProject, {
    onSuccess: () => {
      queryClient.invalidateQueries('projects');
      toast({
        title: 'Project created',
        description: 'Your new project has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating project',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateProjectMutation = useMutation(
    ({ projectId, data }: { projectId: string; data: any }) => updateProject(projectId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
        toast({
          title: 'Project updated',
          description: 'Your project has been updated successfully.',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error updating project',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  const deleteProjectMutation = useMutation(deleteProject, {
    onSuccess: () => {
      queryClient.invalidateQueries('projects');
      toast({
        title: 'Project deleted',
        description: 'Your project has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting project',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const fetchProjectDataQuery = (projectId: string) =>
    useQuery(['project', projectId], () => fetchProjectData(projectId), {
      enabled: !!projectId,
      onError: (error: Error) => {
        toast({
          title: 'Error fetching project data',
          description: error.message,
          variant: 'destructive',
        });
      },
    });

  return {
    projects: projectsQuery.data,
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    fetchProjectData: fetchProjectDataQuery,
  };
}
