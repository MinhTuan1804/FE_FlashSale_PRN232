import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import HomePage from './pages/user/HomePage';
import ProductsPage from './pages/user/ProductsPage';
import ProductDetailPage from './pages/user/ProductDetailPage';
import FlashSalePage from './pages/user/FlashSalePage';
import HotDealsPage from './pages/user/HotDealsPage';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import ProfilePage from './pages/user/ProfilePage';
import OrdersPage from './pages/user/OrdersPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminFlashSalesPage from './pages/admin/AdminFlashSalesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';

const queryClient = new QueryClient();

const NotFound = () => {
  const location = useLocation();
  return (
    <div className="p-12 text-center text-white space-y-4">
      <h1 className="text-3xl font-bold text-[#FF1E27]">404 - Không tìm thấy trang</h1>
      <p className="text-gray-400 text-sm">Đường dẫn hiện tại không tồn tại: <code className="bg-[#121220] px-2 py-1 rounded text-white font-mono">{location.pathname}</code></p>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="flash-sale" element={<FlashSalePage />} />
            <Route path="hot-deals" element={<HotDealsPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrdersPage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="flash-sales" element={<AdminFlashSalesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
          </Route>

          {/* Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#0D0D16',
          color: '#F0F0FF',
          border: '1px solid #FF1E27',
          borderRadius: '16px'
        }
      }}/>
    </QueryClientProvider>
  );
}

export default App;
