import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Zap, Globe, ShieldCheck, Truck, RotateCcw, Phone, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const TICKER_ITEMS = [
  '⚡ FLASH SALE 00:00 - 12:00 — Giảm đến 70%',
  '🔥 MIỄN PHÍ VẬN CHUYỂN cho đơn từ 500.000 ₫',
  '⚡ Chuột Gaming Razer Viper V3 — Giảm 30%',
  '🔥 Bàn phím cơ Apex Pro — Còn 5 sản phẩm',
  '⚡ Màn hình ROG OLED 360Hz — Flash Price hôm nay',
  '🔥 Thanh toán qua Ví FlashPay — Hoàn tiền 5%',
];

const UserLayout = () => {
  const tickerText = TICKER_ITEMS.join('   •   ') + '   •   ' + TICKER_ITEMS.join('   •   ');

  return (
    <div className="min-h-screen flex flex-col text-text-primary">

      {/* ─── Marquee Ticker ─── */}
      <div className="bg-[#FF1E27] py-1.5 overflow-hidden relative z-50">
        <div className="ticker-wrap">
          <div className="ticker-content text-white text-[11px] font-bold tracking-wide">
            {tickerText}
          </div>
        </div>
      </div>

      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#1A1A2A] mt-8 bg-[#0A0510]/80 backdrop-blur-md">

        {/* Trust bar */}
        <div className="border-b border-[#1A1A2A] py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center gap-2 text-[#8E92B2]">
                <div className="w-10 h-10 rounded-full bg-[#FF1E27]/10 flex items-center justify-center">
                  <Truck size={20} className="text-[#FF1E27]" />
                </div>
                <span className="text-xs font-semibold text-white">Miễn Phí Vận Chuyển</span>
                <span className="text-[10px]">Đơn hàng từ 500.000 ₫</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-[#8E92B2]">
                <div className="w-10 h-10 rounded-full bg-[#FF1E27]/10 flex items-center justify-center">
                  <ShieldCheck size={20} className="text-[#FF1E27]" />
                </div>
                <span className="text-xs font-semibold text-white">Bảo Hành Chính Hãng</span>
                <span className="text-[10px]">1-đổi-1 trong 12 tháng</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-[#8E92B2]">
                <div className="w-10 h-10 rounded-full bg-[#FF1E27]/10 flex items-center justify-center">
                  <RotateCcw size={20} className="text-[#FF1E27]" />
                </div>
                <span className="text-xs font-semibold text-white">Đổi Trả Dễ Dàng</span>
                <span className="text-[10px]">Trong vòng 7 ngày</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-[#8E92B2]">
                <div className="w-10 h-10 rounded-full bg-[#FF1E27]/10 flex items-center justify-center">
                  <Phone size={20} className="text-[#FF1E27]" />
                </div>
                <span className="text-xs font-semibold text-white">Hỗ Trợ 24/7</span>
                <span className="text-[10px]">1800-FLASH (miễn phí)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Column 1 — Brand */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-[#FF1E27] fill-[#FF1E27]" />
                <span className="font-extrabold text-xl text-white">
                  <span className="text-[#FF1E27]">Flash</span>Shop
                </span>
              </Link>
              <p className="text-[#8E92B2] text-sm leading-relaxed">
                Nền tảng thương mại điện tử Flash Sale thiết bị gaming & công nghệ hàng đầu Việt Nam. Giá tốt nhất — Hàng chính hãng 100%.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a href="#" title="Facebook" className="w-9 h-9 rounded-full bg-[#121220] border border-[#232338] flex items-center justify-center text-[#8E92B2] hover:text-[#FF1E27] hover:border-[#FF1E27] transition-colors">
                  <span className="text-[11px] font-black">FB</span>
                </a>
                <a href="#" title="YouTube" className="w-9 h-9 rounded-full bg-[#121220] border border-[#232338] flex items-center justify-center text-[#8E92B2] hover:text-[#FF1E27] hover:border-[#FF1E27] transition-colors">
                  <span className="text-[10px] font-black">YT</span>
                </a>
                <a href="#" title="Instagram" className="w-9 h-9 rounded-full bg-[#121220] border border-[#232338] flex items-center justify-center text-[#8E92B2] hover:text-[#FF1E27] hover:border-[#FF1E27] transition-colors">
                  <Globe size={15} />
                </a>
                <a href="#" title="Twitter/X" className="w-9 h-9 rounded-full bg-[#121220] border border-[#232338] flex items-center justify-center text-[#8E92B2] hover:text-[#FF1E27] hover:border-[#FF1E27] transition-colors">
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>

            {/* Column 2 — Liên Kết */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Liên Kết Nhanh</h4>
              <ul className="space-y-2.5 text-sm text-[#8E92B2]">
                <li><Link to="/" className="hover:text-[#FF1E27] transition-colors">Trang Chủ</Link></li>
                <li><Link to="/products" className="hover:text-[#FF1E27] transition-colors">Tất Cả Sản Phẩm</Link></li>
                <li><Link to="/flash-sale" className="hover:text-[#FF1E27] transition-colors">Flash Sale</Link></li>
                <li><Link to="/hot-deals" className="hover:text-[#FF1E27] transition-colors">Ưu Đãi Hot</Link></li>
                <li><Link to="/cart" className="hover:text-[#FF1E27] transition-colors">Giỏ Hàng</Link></li>
                <li><Link to="/orders" className="hover:text-[#FF1E27] transition-colors">Đơn Hàng Của Tôi</Link></li>
              </ul>
            </div>

            {/* Column 3 — Hỗ Trợ */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Hỗ Trợ Khách Hàng</h4>
              <ul className="space-y-2.5 text-sm text-[#8E92B2]">
                <li><a href="#" className="hover:text-[#FF1E27] transition-colors">Trung Tâm Hỗ Trợ</a></li>
                <li><a href="#" className="hover:text-[#FF1E27] transition-colors">Chính Sách Đổi Trả</a></li>
                <li><a href="#" className="hover:text-[#FF1E27] transition-colors">Bảo Hành Sản Phẩm</a></li>
                <li><a href="#" className="hover:text-[#FF1E27] transition-colors">Tra Cứu Đơn Hàng</a></li>
                <li><a href="#" className="hover:text-[#FF1E27] transition-colors">Hướng Dẫn Thanh Toán</a></li>
                <li><a href="#" className="hover:text-[#FF1E27] transition-colors">Liên Hệ Chúng Tôi</a></li>
              </ul>
            </div>

            {/* Column 4 — Liên Hệ */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Thông Tin Liên Hệ</h4>
              <ul className="space-y-3 text-sm text-[#8E92B2]">
                <li className="leading-relaxed">
                  <span className="text-white font-semibold block text-xs uppercase mb-1">Địa Chỉ</span>
                  123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
                </li>
                <li>
                  <span className="text-white font-semibold block text-xs uppercase mb-1">Hotline</span>
                  1800-FLASH (Miễn phí, 8:00–22:00)
                </li>
                <li>
                  <span className="text-white font-semibold block text-xs uppercase mb-1">Email</span>
                  support@flashshop.vn
                </li>
              </ul>

              {/* Trust badges */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-[#5A5E7A]">
                  <ShieldCheck size={14} className="text-green-500" />
                  <span>Đã xác thực Bộ Công Thương</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#5A5E7A]">
                  <ShieldCheck size={14} className="text-green-500" />
                  <span>SSL 256-bit Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#1A1A2A] py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#5A5E7A]">
            <p>&copy; {new Date().getFullYear()} FlashShop. Tất cả quyền được bảo lưu.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-[#8E92B2] transition-colors">Điều Khoản Sử Dụng</a>
              <a href="#" className="hover:text-[#8E92B2] transition-colors">Chính Sách Bảo Mật</a>
              <a href="#" className="hover:text-[#8E92B2] transition-colors">Cookie</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
