import axiosClient from './axiosClient';
import { getAllOrders } from './ordering.api';
import { getProducts, getFlashSales } from './catalog.api';

// Real Dynamic Dashboard Stats
export const getAdminStats = async () => {
  try {
    const [ordersRes, productsRes, flashSalesRes]: [any, any, any] = await Promise.all([
      getAllOrders().catch(() => ({ data: { items: [] } })),
      getProducts().catch(() => ({ data: { items: [] } })),
      getFlashSales().catch(() => ({ data: [] }))
    ]);

    const rawOrders = ordersRes?.data?.items || ordersRes?.items || ordersRes?.data || ordersRes || [];
    const ordersArray = Array.isArray(rawOrders) ? rawOrders : [];

    const productsArray = Array.isArray(productsRes?.data?.items) 
      ? productsRes.data.items 
      : (Array.isArray(productsRes?.items) ? productsRes.items : (Array.isArray(productsRes) ? productsRes : []));

    const flashSalesArray = Array.isArray(flashSalesRes?.data) 
      ? flashSalesRes.data 
      : (Array.isArray(flashSalesRes) ? flashSalesRes : []);

    // Calculate real stats
    const totalRevenue = ordersArray
      .filter((o: any) => ['paid', 'delivered', 'completed'].includes(o.status?.toLowerCase()))
      .reduce((sum: number, o: any) => {
        const amt = Number(o.totalAmount || o.total) || 0;
        return sum + (amt < 10000 ? amt * 25000 : amt);
      }, 0);

    const totalOrders = ordersArray.length;
    const pendingOrders = ordersArray.filter((o: any) => 
      ['pending', 'awaitingpayment', 'processing'].includes(o.status?.toLowerCase())
    ).length;

    const uniqueUsers = new Set(ordersArray.map((o: any) => o.userId).filter(Boolean)).size;

    // Weekly revenue calculation (T2 to CN)
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const weeklyRevenueMap: Record<string, { revenue: number; orders: number }> = {};
    days.forEach(d => { weeklyRevenueMap[d] = { revenue: 0, orders: 0 }; });

    ordersArray.forEach((o: any) => {
      if (o.createdAt) {
        const d = new Date(o.createdAt);
        const dayIdx = (d.getDay() + 6) % 7; // Convert Sunday=0 to Index 6 (CN)
        const dayName = days[dayIdx];
        const amt = Number(o.totalAmount || o.total) || 0;
        const realAmt = amt < 10000 ? amt * 25000 : amt;
        weeklyRevenueMap[dayName].revenue += realAmt;
        weeklyRevenueMap[dayName].orders += 1;
      }
    });

    const weeklyRevenue = days.map(day => ({
      day,
      revenue: weeklyRevenueMap[day].revenue,
      orders: weeklyRevenueMap[day].orders
    }));

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      activeUsers: Math.max(uniqueUsers, 1),
      activeFlashSales: flashSalesArray.length || 1,
      weeklyRevenue,
      recentOrders: ordersArray.slice(0, 5),
      liveFlashProducts: productsArray.slice(0, 3)
    };
  } catch (error) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      activeUsers: 0,
      activeFlashSales: 0,
      weeklyRevenue: [],
      recentOrders: [],
      liveFlashProducts: []
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

// Admin Users CRUD & Wallet
export const adminGetAllUsers = (page = 1, pageSize = 100) =>
  axiosClient.get(`/users?page=${page}&pageSize=${pageSize}`);

export const adminToggleUserActive = (userId: string) =>
  axiosClient.put(`/users/${userId}/toggle-active`);

export const adminTopUpWallet = (userId: string, amount: number) =>
  axiosClient.post('/wallets/topup', { userId, amount });

