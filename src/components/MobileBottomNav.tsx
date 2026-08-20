import { Link, useLocation } from 'react-router-dom';
import { Home, Layers, Zap, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '../stores/useCartStore';

export const MobileBottomNav = () => {
  const location = useLocation();
  const totalItems = useCartStore((state) => state.totalItems());

  const navItems = [
    { to: '/', label: 'Trang Chủ', icon: Home },
    { to: '/products', label: 'Sản Phẩm', icon: Layers },
    { 
      to: '/flash-sale', 
      label: 'Flash Sale', 
      icon: Zap, 
      isFlash: true,
      badge: 'LIVE'
    },
    { 
      to: '/cart', 
      label: 'Giỏ Hàng', 
      icon: ShoppingCart, 
      count: totalItems 
    },
    { to: '/profile', label: 'Tài Khoản', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07050A]/95 backdrop-blur-xl border-t border-[#1A1A2A] pb-[max(env(safe-area-inset-bottom),8px)] pt-2 px-3 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);

          if (item.isFlash) {
            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative -top-3 flex flex-col items-center group focus:outline-hidden"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                  active 
                    ? 'bg-[#FF1E27] text-white shadow-[0_0_20px_rgba(255,30,39,0.8)] scale-110' 
                    : 'bg-gradient-to-tr from-[#FF1E27] to-[#FF5555] text-white shadow-[0_0_15px_rgba(255,30,39,0.5)] group-hover:scale-105'
                }`}>
                  <Icon size={22} className="fill-current animate-pulse" />
                </div>
                <span className="text-[10px] font-black text-[#FF1E27] mt-1 tracking-wider uppercase">
                  {item.label}
                </span>
                <span className="absolute -top-1 right-0 text-[8px] font-black bg-white text-[#FF1E27] px-1.5 py-0.2 rounded-full shadow-sm">
                  {item.badge}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all duration-200 ${
                active 
                  ? 'text-[#FF1E27]' 
                  : 'text-[#8E92B2] hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={active ? 'stroke-[2.5]' : 'stroke-[1.75]'} />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 text-[9px] font-black bg-[#FF1E27] text-white rounded-full flex items-center justify-center px-1 shadow-[0_0_8px_rgba(255,30,39,0.6)]">
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-semibold tracking-tight ${active ? 'font-bold text-white' : ''}`}>
                {item.label}
              </span>
              {active && (
                <span className="w-1 h-1 bg-[#FF1E27] rounded-full mt-0.5 shadow-[0_0_4px_#FF1E27]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
