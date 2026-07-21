import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, User, Zap, Bell, Search, Check, Tag, Package, Sparkles, Send,
  Menu, X, Home, Layers, Flame, ChevronRight
} from 'lucide-react';
import { useCartStore } from '../stores/useCartStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import toast from 'react-hot-toast';

const Navbar = () => {
  const totalItems = useCartStore((state) => state.totalItems());
  const location = useLocation();

  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount());
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const pushTestNotification = useNotificationStore((state) => state.pushTestNotification);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotifOpen(false);
  }, [location.pathname]);

  const isLinkActive = (path: string) => location.pathname === path;

  const handlePushTest = () => {
    pushTestNotification();
    const latestNotif = useNotificationStore.getState().notifications[0];
    toast.custom(
      (t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#0D0D16] border border-[#FF1E27] shadow-[0_10px_30px_rgba(255,30,39,0.4)] rounded-2xl p-4 flex gap-3 text-white pointer-events-auto`}>
          <div className="p-2 rounded-xl bg-[#FF1E27]/20 text-[#FF1E27] flex-shrink-0 h-fit">
            <Zap size={20} className="fill-[#FF1E27]" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-[#FF1E27]">{latestNotif?.title || 'THÔNG BÁO TEST VỪA PUSH'}</h4>
            <p className="text-xs text-[#8E92B2] mt-0.5">{latestNotif?.message}</p>
            <span className="text-[10px] text-[#5A5E7A] mt-1 block">Vừa đẩy qua Notification System</span>
          </div>
        </div>
      ),
      { duration: 4000 }
    );
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'flash_sale': return <Zap size={16} className="text-[#FF1E27] fill-[#FF1E27]" />;
      case 'voucher': return <Tag size={16} className="text-amber-400" />;
      case 'order': return <Package size={16} className="text-emerald-400" />;
      default: return <Sparkles size={16} className="text-purple-400" />;
    }
  };

  const navLinks = [
    { to: '/', label: 'Trang Chủ', icon: <Home size={18} />, activeClass: 'text-white font-bold', hoverClass: 'hover:text-white' },
    { to: '/products', label: 'Sản Phẩm', icon: <Layers size={18} />, activeClass: 'text-white font-bold', hoverClass: 'hover:text-white' },
    { to: '/flash-sale', label: 'Flash Sale', icon: <Zap size={18} className="fill-current" />, activeClass: 'text-[#FF1E27] font-bold', hoverClass: 'hover:text-[#FF1E27]', badge: 'LIVE' },
    { to: '/hot-deals', label: 'Ưu Đãi Hot', icon: <Flame size={18} />, activeClass: 'text-amber-400 font-bold', hoverClass: 'hover:text-amber-400' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#07050A]/85 backdrop-blur-md border-b border-[#1A1A2A]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center h-16 gap-4">

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-1.5 group">
                <Zap className="h-6 w-6 text-[#FF1E27] fill-[#FF1E27] group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-xl tracking-tight text-white">
                  <span className="text-[#FF1E27]">Flash</span>Shop
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isLinkActive(link.to)
                      ? `${link.activeClass} bg-white/5`
                      : `text-[#8E92B2] ${link.hoverClass} hover:bg-white/5`
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="text-[9px] font-black bg-[#FF1E27] text-white px-1.5 py-0.5 rounded-full animate-pulse">
                      {link.badge}
                    </span>
                  )}
                  {isLinkActive(link.to) && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#FF1E27] rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Search Bar — Desktop */}
            <div className="flex-1 max-w-xs relative hidden md:block">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, thiết bị gaming..."
                className="w-full bg-[#121220]/60 text-[#8E92B2] placeholder-[#5A5E7A] text-xs rounded-full py-2 pl-4 pr-10 border border-[#232338] focus:border-[#FF1E27] focus:outline-none focus:bg-[#121220] transition-all"
              />
              <Search className="absolute right-3.5 top-2.5 h-3.5 w-3.5 text-[#5A5E7A]" />
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-1">

              {/* Profile */}
              <Link to="/profile" className="text-[#8E92B2] hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" title="Tài khoản">
                <User className="h-5 w-5" />
              </Link>

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative text-[#8E92B2] hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                  title="Thông báo"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center h-4 w-4 text-[9px] font-black text-white bg-[#FF1E27] rounded-full animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-80 md:w-96 bg-[#0D0D16] border border-[#FF1E27]/40 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-4 z-50 animate-slide-up">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#1E1E2E] pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-[#FF1E27]" />
                        <h3 className="font-extrabold text-sm text-white">Thông Báo FlashShop</h3>
                        {unreadCount > 0 && (
                          <span className="bg-[#FF1E27]/20 border border-[#FF1E27]/40 text-[#FF1E27] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} chưa đọc
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-[10px] text-[#8E92B2] hover:text-white flex items-center gap-1 font-semibold transition-colors">
                          <Check size={12} /> Đã đọc hết
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar pr-1">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-xs text-[#8E92B2]">
                          <Bell size={32} className="mx-auto mb-3 opacity-20" />
                          Không có thông báo nào.
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => markAsRead(item.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                              item.isRead
                                ? 'bg-[#08080E]/60 border-[#1A1A2A] opacity-70'
                                : 'bg-[#121220] border-[#FF1E27]/30 shadow-md'
                            }`}
                          >
                            <div className="p-2 rounded-xl bg-[#1A1A2A] h-fit flex-shrink-0">
                              {getNotifIcon(item.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-bold text-xs text-white truncate">{item.title}</h4>
                                <span className="text-[9px] text-[#5A5E7A] font-mono flex-shrink-0">{item.timestamp}</span>
                              </div>
                              <p className="text-[11px] text-[#8E92B2] mt-1 leading-snug line-clamp-2">{item.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#1E1E2E] mt-3">
                      <button
                        onClick={handlePushTest}
                        className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF1E27] to-[#E02424] hover:shadow-[0_5px_20px_rgba(255,30,39,0.5)] text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <Send size={14} />
                        <span>GỬI THÔNG BÁO TEST</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link to="/cart" className="relative text-[#8E92B2] hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" title="Giỏ hàng">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center h-4 w-4 text-[9px] font-black text-white bg-[#FF1E27] rounded-full animate-pulse">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-[#8E92B2] hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 ml-1"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Slide-in Menu ─── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-72 bg-[#0D0D16] border-l border-[#1A1A2A] shadow-2xl flex flex-col animate-slide-up">

            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#1A1A2A]">
              <Link to="/" className="flex items-center gap-1.5">
                <Zap className="h-5 w-5 text-[#FF1E27] fill-[#FF1E27]" />
                <span className="font-extrabold text-lg text-white">
                  <span className="text-[#FF1E27]">Flash</span>Shop
                </span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#8E92B2] hover:text-white p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b border-[#1A1A2A]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5E7A]" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full bg-[#121220] border border-[#232338] text-white text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-[#FF1E27] transition-colors placeholder-[#5A5E7A]"
                />
              </div>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isLinkActive(link.to)
                      ? 'bg-[#FF1E27]/10 text-[#FF1E27] font-bold border border-[#FF1E27]/20'
                      : 'text-[#8E92B2] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {link.icon}
                    <span className="text-sm font-semibold">{link.label}</span>
                    {link.badge && (
                      <span className="text-[9px] font-black bg-[#FF1E27] text-white px-1.5 py-0.5 rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <ChevronRight size={16} className="opacity-40" />
                </Link>
              ))}

              <div className="pt-4 mt-4 border-t border-[#1A1A2A] space-y-1">
                <Link
                  to="/profile"
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-[#8E92B2] hover:bg-white/5 hover:text-white transition-all"
                >
                  <div className="flex items-center gap-3">
                    <User size={18} />
                    <span className="text-sm font-semibold">Tài Khoản</span>
                  </div>
                  <ChevronRight size={16} className="opacity-40" />
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-[#8E92B2] hover:bg-white/5 hover:text-white transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Package size={18} />
                    <span className="text-sm font-semibold">Đơn Hàng Của Tôi</span>
                  </div>
                  <ChevronRight size={16} className="opacity-40" />
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-[#8E92B2] hover:bg-white/5 hover:text-white transition-all"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart size={18} />
                    <span className="text-sm font-semibold">Giỏ Hàng</span>
                    {totalItems > 0 && (
                      <span className="bg-[#FF1E27] text-white text-[10px] font-black px-2 py-0.5 rounded-full">{totalItems}</span>
                    )}
                  </div>
                  <ChevronRight size={16} className="opacity-40" />
                </Link>
              </div>
            </nav>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#1A1A2A] bg-[#08080E]">
              <p className="text-xs text-[#5A5E7A] text-center">© {new Date().getFullYear()} FlashShop</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
