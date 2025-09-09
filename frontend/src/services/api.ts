import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chat API
export const chatApi = {
  sendMessage: async (message: string) => {
    const response = await api.post('/chat/message', { message });
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/chat/history');
    return response.data;
  },
};

// Tasks API
export const tasksApi = {
  getAllTasks: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },
  createTask: async (task: any) => {
    const response = await api.post('/tasks', task);
    return response.data;
  },
  updateTask: async (id: string, updates: any) => {
    const response = await api.put(`/tasks/${id}`, updates);
    return response.data;
  },
  deleteTask: async (id: string) => {
    await api.delete(`/tasks/${id}`);
  },
};

// Triggers API
export const triggersApi = {
  getAllTriggers: async () => {
    const response = await api.get('/triggers');
    return response.data;
  },
  createTrigger: async (trigger: any) => {
    const response = await api.post('/triggers', trigger);
    return response.data;
  },
  toggleTrigger: async (id: string) => {
    const response = await api.put(`/triggers/${id}/toggle`);
    return response.data;
  },
  deleteTrigger: async (id: string) => {
    await api.delete(`/triggers/${id}`);
  },
};

// Integrations API
export const integrationsApi = {
  getAllIntegrations: async () => {
    const response = await api.get('/integrations');
    return response.data;
  },
  getIntegrationStatus: async (service: string) => {
    const response = await api.get(`/integrations/${service}/status`);
    return response.data;
  },
  testIntegration: async (service: string) => {
    const response = await api.post(`/integrations/${service}/test`);
    return response.data;
  },
  configureIntegration: async (service: string, config: any) => {
    const response = await api.post(`/integrations/${service}/configure`, { config });
    return response.data;
  },
};

// Health check
export const healthApi = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};