import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const executeCode = async (code: string, language: string) => {
  const response = await api.post("/execute", { code, language });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const register = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await api.post("/auth/register", { name, email, password });
  return response.data;
};

export const getProjects = async () => {
  const response = await api.get("/projects");
  return response.data;
};

export const createProject = async (name: string) => {
  const response = await api.post("/projects", { name });
  return response.data;
};

export const fetchProjectData = async (projectId: string) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};
