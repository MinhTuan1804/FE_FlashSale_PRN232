import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';

// The API Gateway is running on http://localhost:5164
const axiosClient = axios.create({
  baseURL: 'http://localhost:5164/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for adding Authorization token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for handling global responses
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      // Don't auto purge token if temporary network glitch
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
