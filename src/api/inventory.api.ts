import axiosClient from './axiosClient';

// Stocks (Inventory)
export const getStock = (productId: string) => 
  axiosClient.get(`/stocks/${productId}`);

export const getAllStocks = () => 
  axiosClient.get('/stocks');

// Deduct/Add stock usually handled via events/backend, but if admin needs direct access:
export const updateStock = (productId: string, quantity: number) => 
  axiosClient.put(`/stocks/${productId}`, { quantity });
