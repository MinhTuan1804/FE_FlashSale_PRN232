import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Grid, ListOrdered, Users, Bell, Zap,
  ExternalLink, Menu, X, ShieldAlert, CheckCircle2, Lock, ArrowRight, Command
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isAdmin = isAuthenticated && (
    user?.role?.toString().toLowerCase() === 'admin' ||
    user?.email?.toLowerCase().includes('admin')
  );

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Sản Phẩm', href: '/admin/products', icon: Package },
    { name: 'Danh Mục', href: '/admin/categories', icon: Grid },
    { name: 'Flash Sales', href: '/admin/flash-sales', icon: Zap, badge: 'LIVE' },
    { name: 'Đơn Hàng', href: '/admin/orders', icon: ListOrdered },
    { name: 'Người Dùng', href: '/admin/users', icon: Users },
    { name: 'Thông Báo Push', href: '/admin/notifications', icon: Bell },
  ];

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090B] text-white">
        <div className="max-w-md w-full bg-[#121215] border border-[#27272A] p-8 rounded-3xl text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-white">
            <Lock size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Quyền Truy Cập Bị Hạn Chế</h2>
            <p className="text-xs text-[#A1A1AA]">
              Khu vực quản trị chỉ dành cho tài khoản Admin cấp cao. Vui lòng đăng nhập tài khoản có thẩm quyền.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="btn-admin-primary w-full py-3.5 text-sm"
            >
              Đăng Nhập Tài Khoản Admin <ArrowRight size={16} />
            </button>
            <Link to="/" className="btn-admin-secondary w-full py-3 text-xs block text-center">
              Quay Về Cửa Hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#09090B] text-[#FAFAFA] selection:bg-white selection:text-black">

      {/* ─── Desktop Minimalist Monochrome Sidebar ─── */}
      <aside className="hidden lg:flex w-64 bg-[#09090B] border-r border-[#27272A] flex-shrink-0 flex-col sticky top-0 h-screen z-30">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-[#27272A] gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-black">
            <Command size={18} />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white uppercase">
            FLASH<span className="font-light text-[#A1A1AA]">ADMIN</span>
          </span>
          <span className="ml-auto text-[9px] font-mono font-bold bg-[#18181C] border border-[#27272A] text-white px-2 py-0.5 rounded-full">
            PRO
          </span>
        </div>

        {/* Admin Profile Pill */}
        <div className="p-3.5 mx-3 my-3 bg-[#121215] border border-[#27272A] rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs text-white truncate">{user?.email?.split('@')[0] || 'Administrator'}</div>
            <div className="text-[10px] text-[#A1A1AA] font-mono flex items-center gap-1">
              <CheckCircle2 size={10} className="text-white" /> System Root
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 px-3 space-y-1 overflow-y-auto no-scrollbar">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] px-3 mb-2 font-mono">
            HỆ THỐNG QUẢN TRỊ
          </div>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/admin');
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  isActive
                    ? 'bg-white text-black shadow-md scale-[1.02]'
                    : 'text-[#A1A1AA] hover:bg-[#18181C] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={isActive ? 'text-black' : 'text-[#71717A]'} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-black text-white' : 'bg-[#27272A] text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#27272A]">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-[#121215] hover:bg-[#18181C] border border-[#27272A] text-xs font-bold text-[#A1A1AA] hover:text-white transition-all"
          >
            <ExternalLink size={14} /> Website Cửa Hàng
          </Link>
        </div>
      </aside>

      {/* ─── Mobile Sidebar Overlay Drawer ─── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-[#09090B] border-r border-[#27272A] p-4 flex flex-col z-10">
            <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <Command className="h-6 w-6 text-white" />
                <span className="font-extrabold text-lg text-white">FLASHADMIN</span>
              </div>
              <button onClick={() => setIsMobileOpen(false)} className="text-[#A1A1AA] hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1.5">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl ${
                    location.pathname === item.href ? 'bg-white text-black' : 'text-[#A1A1AA] hover:bg-[#18181C]'
                  }`}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              ))}
            </nav>
            <Link to="/" className="btn-admin-secondary w-full py-3 text-xs text-center">
              <ExternalLink size={14} /> Về Cửa Hàng
            </Link>
          </div>
        </div>
      )}

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header */}
        <header className="h-16 bg-[#09090B]/90 backdrop-blur-md border-b border-[#27272A] flex items-center px-4 md:px-8 justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden text-[#A1A1AA] hover:text-white p-2 rounded-xl bg-[#121215] border border-[#27272A]"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert size={18} className="text-white" />
              {navigation.find(n => n.href === location.pathname || (location.pathname.startsWith(n.href) && n.href !== '/admin'))?.name || 'Trang Quản Trị'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#A1A1AA] hover:text-white bg-[#121215] border border-[#27272A] px-3.5 py-2 rounded-xl transition-colors"
            >
              <ExternalLink size={14} /> Về Cửa Hàng
            </Link>
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
