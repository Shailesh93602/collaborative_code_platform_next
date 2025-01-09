import axios from 'axios';
import { generateCSRFToken } from './csrf';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const csrfToken = generateCSRFToken();
  config.headers['X-CSRF-Token'] = csrfToken;

  return config;
});

export const getProjects = async () => {
  try {
    const response = await api.get('/projects');
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const createProject = async (name: string) => {
  try {
    const response = await api.post('/projects', { name });
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const fetchProjectData = async (projectId: string) => {
  try {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project data:', error);
    throw error;
  }
};

export const updateProject = async (projectId: string, data: any) => {
  try {
    const response = await api.put(`/projects/${projectId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (projectId: string) => {
  try {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export const updateUserProfile = async (id: string, data: any) => {};
