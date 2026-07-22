import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';
import { useServiceHealthStore, type ServiceName } from '../stores/useServiceHealthStore';

// API Gateway URL: uses VITE_API_URL env var or defaults to Production Server HTTPS API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api2.sosbike.io.vn/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to determine service name from URL path
const detectServiceFromUrl = (url?: string): ServiceName | null => {
  if (!url) return null;
  const path = url.toLowerCase();
  if (path.includes('/auth') || path.includes('/users') || path.includes('/wallets')) return 'identity';
  if (path.includes('/categories') || path.includes('/products') || path.includes('/flashsales')) return 'catalog';
  if (path.includes('/stocks')) return 'inventory';
  if (path.includes('/cart') || path.includes('/orders')) return 'ordering';
  if (path.includes('/notifications')) return 'notification';
  return null;
};

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

// Interceptor for handling global responses & service outage detection
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url;
    const serviceName = detectServiceFromUrl(requestUrl);

    // If 502 Bad Gateway, 503 Service Unavailable, 504 Timeout, or Network Error (no response)
    if (!error.response || status === 502 || status === 503 || status === 504) {
      if (serviceName) {
        useServiceHealthStore.getState().setServiceStatus(serviceName, false, true);
      } else {
        useServiceHealthStore.getState().triggerMaintenanceModal('Hệ thống');
      }
    }

    // Detect locked wallet / locked user account errors and trigger WalletLockedModal
    const responseMessage = error.response?.data?.message || error.response?.data?.Message || '';
    if (typeof responseMessage === 'string' && (
      responseMessage.includes('KHOÁ') || 
      responseMessage.includes('khóa') || 
      responseMessage.includes('locked')
    )) {
      window.dispatchEvent(new CustomEvent('wallet-locked-event', { detail: { message: responseMessage } }));
    }

    // Handle 401 Unauthorized globally: purge invalid token and log out
    if (status === 401 && !requestUrl?.includes('/auth/login')) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

