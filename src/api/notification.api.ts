import axiosClient from './axiosClient';

export const getMyNotifications = () => 
  axiosClient.get('/notifications');

export const markAsRead = (id: string) => 
  axiosClient.put(`/notifications/${id}/read`);
