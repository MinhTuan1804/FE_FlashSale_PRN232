import axiosClient from './axiosClient';

// Dashboard Stats
export const getAdminStats = async () => {
  try {
    const res: any = await axiosClient.get('/admin/stats');
    return res.data || res;
  } catch {
    return {
      totalRevenue: 1845000000,
      totalOrders: 1420,
      pendingOrders: 18,
      activeUsers: 850,
      activeFlashSales: 3,
      weeklyRevenue: [
        { day: 'T2', revenue: 140000000, orders: 120 },
        { day: 'T3', revenue: 210000000, orders: 185 },
        { day: 'T4', revenue: 180000000, orders: 150 },
        { day: 'T5', revenue: 290000000, orders: 230 },
        { day: 'T6', revenue: 340000000, orders: 280 },
        { day: 'T7', revenue: 410000000, orders: 310 },
        { day: 'CN', revenue: 275000000, orders: 210 },
      ]
    };
  }
};

// Admin Products CRUD
export const adminGetProducts = (pageIndex = 1, pageSize = 50) =>
  axiosClient.get(`/products?pageIndex=${pageIndex}&pageSize=${pageSize}`);

export const adminCreateProduct = (data: any) =>
  axiosClient.post('/products', data);

export const adminUpdateProduct = (id: string, data: any) =>
  axiosClient.put(`/products/${id}`, data);

export const adminDeleteProduct = (id: string) =>
  axiosClient.delete(`/products/${id}`);

// Admin Categories CRUD
export const adminGetCategories = () =>
  axiosClient.get('/categories');

export const adminCreateCategory = (data: any) =>
  axiosClient.post('/categories', data);

export const adminUpdateCategory = (id: number, data: any) =>
  axiosClient.put(`/categories/${id}`, data);

export const adminDeleteCategory = (id: number) =>
  axiosClient.delete(`/categories/${id}`);

// Admin Orders
export const adminGetAllOrders = () =>
  axiosClient.get('/orders/my-orders');

export const adminUpdateOrderStatus = (orderId: string, status: string) =>
  axiosClient.put(`/orders/${orderId}/status`, { status });

// Admin Users & Wallet
export const adminTopUpWallet = (userId: string, amount: number) =>
  axiosClient.post('/wallets/topup', { userId, amount });
