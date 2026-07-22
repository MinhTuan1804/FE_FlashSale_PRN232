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

export const getFlashSales = getAllFlashSales;

export const getFlashSaleById = (id: string) =>
  axiosClient.get(`/flashsales/${id}`);

// Customer Testimonials API
export interface TestimonialItem {
  id: string;
  customerName: string;
  avatarUrl: string;
  role: string;
  rating: number;
  productName: string;
  comment: string;
  createdDate: string;
}

export const getTestimonials = async () => {
  try {
    const res: any = await axiosClient.get('/testimonials');
    const data = res?.data || res;
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (err) {
    console.warn('Backend /testimonials notice, using fallback seed data...');
  }
  return [
    {
      id: 'testim-1',
      customerName: 'Hoàng Anh Tuấn',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      role: 'VIP Member / Verified Buyer',
      rating: 5,
      productName: 'iPhone 17 Pro 256GB',
      comment: 'Săn Flash Sale thành công iPhone 17 Pro giá siêu hời! Giao hàng hỏa tốc trong 2h, máy nguyên seal chính hãng VN/A. Quá hài lòng với dịch vụ!',
      createdDate: '2026-07-20'
    },
    {
      id: 'testim-2',
      customerName: 'Nguyễn Minh Châu',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      role: 'Pro Gamer',
      rating: 5,
      productName: 'Bàn Phím Cơ Apex Pro + Chuột Gaming Prime',
      comment: 'Bàn phím gõ cực êm, switch OmniPoint nhạy đét! Săn sale giảm hơn 1.6 triệu. Chuột Prime cầm đầm tay, bắn FPS mượt mà. 10/10 điểm!',
      createdDate: '2026-07-21'
    },
    {
      id: 'testim-3',
      customerName: 'Trần Thị Mai Phương',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      role: 'Content Creator',
      rating: 5,
      productName: 'MacBook Pro 16 M3 Max',
      comment: 'Máy dựng video 4K siêu nhanh, xuất file 8K phơi phới không hề nóng. FlashShop giao hàng chuẩn seal, bảo hành 12 tháng tận tâm!',
      createdDate: '2026-07-22'
    },
    {
      id: 'testim-4',
      customerName: 'Đặng Quốc Huy',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      role: 'Tech Enthusiast',
      rating: 5,
      productName: 'Samsung Galaxy S24 Ultra',
      comment: 'Màn hình phẳng chống lóa tuyệt đẹp, camera 200MP chụp siêu nét. Đặt hàng lúc 00:00 Flash Sale, sáng ra 9h đã có shipper giao hàng!',
      createdDate: '2026-07-22'
    },
    {
      id: 'testim-5',
      customerName: 'Lê Hoàng Bảo',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
      role: 'Streamer / Reviewer',
      rating: 5,
      productName: 'Tai Nghe Sony WH-1000XM5',
      comment: 'Chống ồn đỉnh cao, mic lọc tạp âm quá tốt cho buổi livestream. FlashShop tư vấn hỗ trợ nhiệt tình, freeship nhận trong ngày!',
      createdDate: '2026-07-22'
    }
  ];
};
