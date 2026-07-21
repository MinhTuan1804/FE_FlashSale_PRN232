import axiosClient from './axiosClient';

// Cart
export const getCart = () => 
  axiosClient.get('/cart');

export const addToCart = (item: { productId: string; productName: string; unitPrice: number; quantity: number; imageUrl?: string }) => 
  axiosClient.post('/cart/items', item);

export const updateCartItem = (productId: string, quantity: number) => 
  axiosClient.put(`/cart/items/${productId}`, { quantity });

export const removeCartItem = (productId: string) => 
  axiosClient.delete(`/cart/items/${productId}`);

export const clearCart = () => 
  axiosClient.delete('/cart');

// Orders
export const checkout = (checkoutDetails: any) => 
  axiosClient.post('/orders/checkout', checkoutDetails);

export const getMyOrders = () => 
  axiosClient.get('/orders/my-orders');

export const getOrderById = (id: string) => 
  axiosClient.get(`/orders/${id}`);

export const cancelOrder = (id: string) => 
  axiosClient.post(`/orders/${id}/cancel`);

export const payOrder = (id: string) => 
  axiosClient.post(`/orders/${id}/pay`);
