import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Don't override Content-Type if it's already set (for multipart/form-data)
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      delete config.headers['Content-Type']; // Let axios set the boundary properly
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData)
};

// Task services
export const taskService = {
  getAllTasks: () => api.get('/tasks'),
  getTask: (id) => api.get(`/tasks/${id}`),
  
  // Update these methods to properly handle FormData
  createTask: (taskData) => {
    // Check if taskData is FormData (has file attachments)
    if (taskData instanceof FormData) {
      return api.post('/tasks', taskData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return api.post('/tasks', taskData);
  },
  
  updateTask: (id, taskData) => {
    // Check if taskData is FormData (has file attachments)
    if (taskData instanceof FormData) {
      return api.put(`/tasks/${id}`, taskData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return api.put(`/tasks/${id}`, taskData);
  },
  
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  removeAttachment: (id, attachmentUrl) => api.post(`/tasks/${id}/remove-attachment`, { attachmentUrl })
};

// File upload service
export const uploadService = {
  uploadProfileImage: (formData) => {
    return api.post('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  uploadTaskAttachments: (id, formData) => {
    return api.put(`/tasks/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default api; 