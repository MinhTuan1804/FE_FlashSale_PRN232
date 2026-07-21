import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import PageLoader from './components/PageLoader';

// Lazy-loaded Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Lazy-loaded User Pages
const HomePage = lazy(() => import('./pages/user/HomePage'));
const ProductsPage = lazy(() => import('./pages/user/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/user/ProductDetailPage'));
const FlashSalePage = lazy(() => import('./pages/user/FlashSalePage'));
const HotDealsPage = lazy(() => import('./pages/user/HotDealsPage'));
const CartPage = lazy(() => import('./pages/user/CartPage'));
const CheckoutPage = lazy(() => import('./pages/user/CheckoutPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/user/OrdersPage'));

// Lazy-loaded Admin Pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminFlashSalesPage = lazy(() => import('./pages/admin/AdminFlashSalesPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminNotificationsPage = lazy(() => import('./pages/admin/AdminNotificationsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
    }
  }
});

const NotFound = () => {
  const location = useLocation();
  return (
    <div className="p-12 text-center text-white space-y-4">
      <h1 className="text-3xl font-bold text-[#FF1E27]">404 - Không tìm thấy trang</h1>
      <p className="text-gray-400 text-sm">
        Đường dẫn hiện tại không tồn tại: <code className="bg-[#121220] px-2 py-1 rounded text-white font-mono">{location.pathname}</code>
      </p>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </BrowserRouter>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0D0D16',
            color: '#F0F0FF',
            border: '1px solid #FF1E27',
            borderRadius: '16px'
          }
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
