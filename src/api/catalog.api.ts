import axiosClient from './axiosClient';

export interface ProductQueryParams {
  page?: number;
  pageSize?: number;
  categoryId?: number | null;
  search?: string;
  sortBy?: string;
  sortDir?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Products API — Supports Backend Filtering, Search, Pagination & Sorting
export const getProducts = (params: ProductQueryParams | number = 1, pageSize = 200) => {
  if (typeof params === 'number') {
    return axiosClient.get(`/products?page=${params}&pageSize=${pageSize}`);
  }
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.pageSize) query.append('pageSize', params.pageSize.toString());
  if (params.categoryId !== undefined && params.categoryId !== null) {
    query.append('categoryId', params.categoryId.toString());
  }
  if (params.search) query.append('search', params.search);
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortDir) query.append('sortDir', params.sortDir);
  if (params.minPrice) query.append('minPrice', params.minPrice.toString());
  if (params.maxPrice) query.append('maxPrice', params.maxPrice.toString());

  return axiosClient.get(`/products?${query.toString()}`);
};

export const getHotDeals = () =>
  axiosClient.get('/products/hot-deals');

export const getProductById = (id: string) =>
  axiosClient.get(`/products/${id}`);

// Categories
export const getCategories = () =>
  axiosClient.get('/categories');

// Flash Sales
export const getActiveFlashSales = () =>
  axiosClient.get('/flashsales/active');

export const getAllFlashSales = () =>
  axiosClient.get('/flashsales');

export const getFlashSaleById = (id: string) =>
  axiosClient.get(`/flashsales/${id}`);
