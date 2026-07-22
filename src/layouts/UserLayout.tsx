import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Zap, Globe, ShieldCheck, Truck, RotateCcw, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const TICKER_ITEMS = [
  '⚡ FLASH SALE 00:00 - 12:00 — Giảm đến 70%',
  '🔥 MIỄN PHÍ VẬN CHUYỂN cho đơn từ 500.000 ₫',
  '⚡ Chuột Gaming Razer Viper V3 — Giảm 30%',
  '🔥 Bàn phím cơ Apex Pro — Còn 5 sản phẩm',
  '⚡ Màn hình ROG OLED 360Hz — Flash Price hôm nay',
  '🔥 Thanh toán qua Ví FlashPay — Hoàn tiền 5%',
];

// Global Interactive Mouse Particle Effect Canvas across Entire Background
const GlobalMouseParticlesCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: -1000, y: -1000, radius: 160 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create 75 particles across full viewport
    const particleCount = 75;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
    }> = [];

    const colors = ['#FF1E27', '#FFB800', '#A855F7', '#E02424', '#38BDF8'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.3
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render & update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Particle dot with glow
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Mouse attraction constellation lines
        if (dist < mouse.radius) {
          const lineAlpha = (1 - dist / mouse.radius) * 0.55;
          ctx.save();
          ctx.strokeStyle = '#FF1E27';
          ctx.globalAlpha = lineAlpha;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
          ctx.restore();
        }

        // Particle to particle connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const pdx = p.x - p2.x;
          const pdy = p.y - p2.y;
          const pDist = Math.sqrt(pdx * pdx + pdy * pdy);

          if (pDist < 90) {
            ctx.save();
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - pDist / 90) * 0.15;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden" />;
};

const UserLayout = () => {
  const tickerText = TICKER_ITEMS.join('   •   ') + '   •   ' + TICKER_ITEMS.join('   •   ');

  return (
    <div className="min-h-screen flex flex-col text-text-primary relative bg-transparent">
      {/* Global Interactive Mouse Particle Background */}
      <GlobalMouseParticlesCanvas />

      {/* ─── Marquee Ticker ─── */}
      <div className="bg-[#FF1E27] py-1.5 overflow-hidden relative z-50">
        <div className="ticker-wrap">
          <div className="ticker-content text-white text-[11px] font-bold tracking-wide">
            {tickerText}
          </div>
        </div>
      </div>

      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Outlet />
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#1A1A2A] mt-8 bg-transparent relative z-10">

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
              </div>
            </div>

            {/* Column 2 — Categories */}
            <div className="space-y-4">
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">Danh Mục Flash Sale</h4>
              <ul className="space-y-2.5 text-xs text-[#8E92B2]">
                <li><Link to="/products" className="hover:text-white transition-colors">Thiết Bị Điện Tử & Gaming</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Máy Tính & Laptop</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Tai Nghe & Âm Thanh</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Đồng Hồ Thông Minh</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Phụ Kiện Công Nghệ</Link></li>
              </ul>
            </div>

            {/* Column 3 — Customer Support */}
            <div className="space-y-4">
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">Hỗ Trợ Khách Hàng</h4>
              <ul className="space-y-2.5 text-xs text-[#8E92B2]">
                <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn mua hàng Flash Sale</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo hành 1 đổi 1</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Chính sách đổi trả & hoàn tiền</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Phương thức thanh toán FlashPay</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tra cứu vận chuyển đơn hàng</a></li>
              </ul>
            </div>

            {/* Column 4 — Contact */}
            <div className="space-y-4">
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">Tổng Đài Chăm Sóc</h4>
              <div className="space-y-2 text-xs text-[#8E92B2]">
                <p className="font-extrabold text-base text-[#FF1E27]">1800-FLASH (1800 3527)</p>
                <p>Thời gian làm việc: 08:00 - 22:00 hàng ngày</p>
                <p>Email: support@flashshop.vn</p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-[#1A1A2A] py-6 text-center text-xs text-[#8E92B2]">
          © 2026 FlashShop. All rights reserved. Built for PRN232 Assignment High-End E-Commerce.
        </div>

      </footer>
    </div>
  );
};

export default UserLayout;
