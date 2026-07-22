import { useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useServiceHealthStore, type ServiceName } from '../stores/useServiceHealthStore';

export const useServiceHealthCheck = (intervalMs = 5000) => {
  const setServicesStatus = useServiceHealthStore((state) => state.setServicesStatus);

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        // GET /api/gateway/health from Gateway
        const res = await axiosClient.get<unknown, Record<ServiceName, boolean>>('/gateway/health');
        if (isMounted && res && typeof res === 'object') {
          setServicesStatus(res);
        }
      } catch (err) {
        // If Gateway itself or endpoint fails, don't crash poller
        console.warn('Health check poller error:', err);
      }
    };

    // Initial check
    checkHealth();

    // Setup periodic polling
    const timer = setInterval(checkHealth, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [setServicesStatus, intervalMs]);
};
