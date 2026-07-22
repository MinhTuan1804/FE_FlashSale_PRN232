import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import PageLoader from './components/PageLoader';
import MaintenanceModal from './components/MaintenanceModal';
import MaintenanceOverlay from './components/MaintenanceOverlay';
import WalletLockedModal from './components/WalletLockedModal';
import { useServiceHealthCheck } from './hooks/useServiceHealthCheck';


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

const AppRoutes = () => {
  // Start health check poller
  useServiceHealthCheck(5000);

  return (
    <>
      <MaintenanceModal />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<HomePage />} />
            
            {/* Catalog Routes */}
            <Route path="products" element={
              <MaintenanceOverlay serviceName="catalog">
                <ProductsPage />
              </MaintenanceOverlay>
            } />
            <Route path="products/:id" element={
              <MaintenanceOverlay serviceName="catalog">
                <ProductDetailPage />
              </MaintenanceOverlay>
            } />
            <Route path="flash-sale" element={
              <MaintenanceOverlay serviceName="catalog">
                <FlashSalePage />
              </MaintenanceOverlay>
            } />
            <Route path="hot-deals" element={
              <MaintenanceOverlay serviceName="catalog">
                <HotDealsPage />
              </MaintenanceOverlay>
            } />

            {/* Ordering & Cart Routes */}
            <Route path="cart" element={
              <MaintenanceOverlay serviceName="ordering">
                <CartPage />
              </MaintenanceOverlay>
            } />
            <Route path="checkout" element={
              <MaintenanceOverlay serviceName="ordering">
                <CheckoutPage />
              </MaintenanceOverlay>
            } />
            <Route path="orders" element={
              <MaintenanceOverlay serviceName="ordering">
                <OrdersPage />
              </MaintenanceOverlay>
            } />
            <Route path="orders/:id" element={
              <MaintenanceOverlay serviceName="ordering">
                <OrdersPage />
              </MaintenanceOverlay>
            } />

            {/* Identity & Profile Routes */}
            <Route path="profile" element={
              <MaintenanceOverlay serviceName="identity">
                <ProfilePage />
              </MaintenanceOverlay>
            } />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={
            <MaintenanceOverlay serviceName="identity">
              <LoginPage />
            </MaintenanceOverlay>
          } />
          <Route path="/register" element={
            <MaintenanceOverlay serviceName="identity">
              <RegisterPage />
            </MaintenanceOverlay>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={
              <MaintenanceOverlay serviceName="catalog">
                <AdminProductsPage />
              </MaintenanceOverlay>
            } />
            <Route path="categories" element={
              <MaintenanceOverlay serviceName="catalog">
                <AdminCategoriesPage />
              </MaintenanceOverlay>
            } />
            <Route path="flash-sales" element={
              <MaintenanceOverlay serviceName="catalog">
                <AdminFlashSalesPage />
              </MaintenanceOverlay>
            } />
            <Route path="orders" element={
              <MaintenanceOverlay serviceName="ordering">
                <AdminOrdersPage />
              </MaintenanceOverlay>
            } />
            <Route path="users" element={
              <MaintenanceOverlay serviceName="identity">
                <AdminUsersPage />
              </MaintenanceOverlay>
            } />
            <Route path="notifications" element={
              <MaintenanceOverlay serviceName="notification">
                <AdminNotificationsPage />
              </MaintenanceOverlay>
            } />
          </Route>

          {/* Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <WalletLockedModal />
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0D0D16',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 30, 39, 0.4)',
            borderRadius: '14px',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            lineHeight: '1.4',
            padding: '12px 18px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)'
          }
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
