import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, ShoppingBag, ChevronLeft, ChevronRight, ArrowRight, Star, Tag, Check, Copy, 
  Globe, ShieldCheck, Truck, Headphones, MessageCircle, Share2, Send, Radio, Sparkles
} from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import toast from 'react-hot-toast';
import { getProducts, getCategories, getActiveFlashSales } from '../../api/catalog.api';
import heroVideo from '../../assets/videos/Cinematic_K_photorealistic_D.mp4';

interface ProductItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  badge?: string;
  rating?: number;
  reviews?: number;
  isSoldOut?: boolean;
  isNew?: boolean;
  time?: { hours: number; minutes: number; seconds: number };
  label?: string;
}

export const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
};

const HomePage = () => {
  const addItem = useCartStore((state) => state.addItem);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Carousel Scroll Refs for interactive < > arrow buttons
  const electronicScrollRef = useRef<HTMLDivElement>(null);
  const upcomingScrollRef = useRef<HTMLDivElement>(null);
  const bestsellingScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 320;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Dynamic API state
  const [apiProducts, setApiProducts] = useState<ProductItem[]>([]);

  // Real-time Countdown Timer for Hero
  const [heroTime, setHeroTime] = useState({ hours: 0, minutes: 12, seconds: 31 });
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroTime((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 0, minutes: 12, seconds: 31 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timers for SẮP DIỄN RA
  const [upcomingTime1, setUpcomingTime1] = useState({ hours: 0, minutes: 15, seconds: 20 });
  const [upcomingTime2, setUpcomingTime2] = useState({ hours: 0, minutes: 12, seconds: 20 });
  const [upcomingTime3, setUpcomingTime3] = useState({ hours: 0, minutes: 15, seconds: 20 });
  const [upcomingTime4, setUpcomingTime4] = useState({ hours: 0, minutes: 18, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setUpcomingTime1((prev) => (prev.seconds > 0 ? { ...prev, seconds: prev.seconds - 1 } : prev.minutes > 0 ? { ...prev, minutes: prev.minutes - 1, seconds: 59 } : { hours: 0, minutes: 15, seconds: 20 }));
      setUpcomingTime2((prev) => (prev.seconds > 0 ? { ...prev, seconds: prev.seconds - 1 } : prev.minutes > 0 ? { ...prev, minutes: prev.minutes - 1, seconds: 59 } : { hours: 0, minutes: 12, seconds: 20 }));
      setUpcomingTime3((prev) => (prev.seconds > 0 ? { ...prev, seconds: prev.seconds - 1 } : prev.minutes > 0 ? { ...prev, minutes: prev.minutes - 1, seconds: 59 } : { hours: 0, minutes: 15, seconds: 20 }));
      setUpcomingTime4((prev) => (prev.seconds > 0 ? { ...prev, seconds: prev.seconds - 1 } : prev.minutes > 0 ? { ...prev, minutes: prev.minutes - 1, seconds: 59 } : { hours: 0, minutes: 18, seconds: 45 }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real product data from Backend API Gateway
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const [prodRes] = await Promise.allSettled([
          getProducts(1, 20),
          getCategories(),
          getActiveFlashSales()
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value) {
          const resValue = prodRes.value as any;
          const items = resValue.items || resValue.data || (Array.isArray(resValue) ? resValue : []);
          if (Array.isArray(items) && items.length > 0) {
            const mapped = items.map((p: any) => {
              const rawPrice = Number(p.price || p.unitPrice) || 3490000;
              const convertedPrice = rawPrice < 10000 ? rawPrice * 25000 : rawPrice;
              return {
                id: p.id || p.productId,
                name: p.name || p.productName || 'Thiết bị Gaming High-End',
                price: convertedPrice,
                originalPrice: p.originalPrice ? Number(p.originalPrice) : convertedPrice * 1.3,
                imageUrl: p.imageUrl || p.image || 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400',
                badge: p.badge || 'Chính hãng',
                rating: p.rating || 5.0,
                reviews: p.reviewsCount || 120
              };
            });
            setApiProducts(mapped);
          }
        }
      } catch (err) {
        console.warn('Backend API Gateway offline, using authentic localized product catalog fallback:', err);
      }
    };

    fetchRealData();
  }, []);

  const formatDigit = (num: number) => num.toString().padStart(2, '0');

  const copyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã voucher ${code}!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleAddToCart = (product: ProductItem, e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      imageUrl: product.imageUrl,
      quantity: 1
    });
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  // Authentic Localized Gaming Gear Products with Valid VND Prices
  const defaultElectronicProducts: ProductItem[] = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Bộ đôi Bàn phím cơ Apex Pro + Chuột Gaming Prime',
      price: 3490000,
      originalPrice: 5900000,
      imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400',
      isNew: true
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Bàn phím cơ Bluetooth RGB không dây Pro-X',
      price: 2890000,
      originalPrice: 4500000,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Bàn phím cơ Gaming Silent Switch chống ồn',
      price: 2490000,
      originalPrice: 3800000,
      imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Chuột Gaming siêu nhẹ Ergonomic Wireless 26.000 DPI',
      price: 2690000,
      originalPrice: 4200000,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      name: 'Màn hình Gaming ROG OLED 360Hz 0.03ms (TẠM HẾT HÀNG)',
      price: 18990000,
      originalPrice: 24900000,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=400',
      isSoldOut: true
    }
  ];

  const defaultUpcomingProducts: ProductItem[] = [
    {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Apex Pro Keyboard + Mouse Prime',
      price: 3490000,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=400',
      time: upcomingTime1,
      label: 'Thời gian mở bán'
    },
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Apex Keyboard + Mouse Prime',
      price: 3490000,
      imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400',
      time: upcomingTime2,
      label: 'Đếm ngược đợt 2'
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Apex Keyboard Combo Special Edition',
      price: 3490000,
      imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=400',
      time: upcomingTime3,
      label: 'Sắp ra mắt'
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      name: 'Razer Pro Monitor + Mice Combo Wireless',
      price: 3490000,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=400',
      time: upcomingTime4,
      label: 'Thời gian mở bán'
    }
  ];

  const defaultBestsellingGear: ProductItem[] = [
    {
      id: '00000000-0000-0000-0000-000000000006',
      name: 'Tai nghe Gaming không dây SteelSeries Arctis Nova Pro',
      price: 5990000,
      originalPrice: 8490000,
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400',
      badge: 'Hi-Res Audio',
      rating: 5.0,
      reviews: 256
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Chuột Gaming siêu nhẹ Razer Viper V3 Pro',
      price: 2890000,
      originalPrice: 3890000,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=400',
      badge: 'Trọng lượng 54g',
      rating: 4.9,
      reviews: 184
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      name: 'Màn hình Gaming Asus ROG Swift OLED 360Hz',
      price: 18990000,
      originalPrice: 22990000,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=400',
      badge: 'OLED 0.03ms',
      rating: 5.0,
      reviews: 92
    },
    {
      id: '00000000-0000-0000-0000-000000000007',
      name: 'Bộ Keycap Artisan PBT Double-shot Cyberpunk',
      price: 990000,
      originalPrice: 1800000,
      imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=400',
      badge: 'Double-shot PBT',
      rating: 4.8,
      reviews: 310
    }
  ];

  // Dynamic product arrays
  const displayElectronicProducts = apiProducts.length >= 5 ? apiProducts.slice(0, 5) : defaultElectronicProducts;
  const displayBestsellingGear = apiProducts.length >= 4 ? apiProducts.slice(0, 4) : defaultBestsellingGear;

  const flashVouchers = [
    {
      code: 'FLASH50K',
      discount: 'Giảm 50.000 ₫',
      minSpend: 'Đơn tối thiểu 500k',
      expiry: 'Hạn dùng: Hôm nay'
    },
    {
      code: 'GAMING100K',
      discount: 'Giảm 100.000 ₫',
      minSpend: 'Đơn Gaming Gear từ 1.5M',
      expiry: 'Hạn dùng: Số lượng có hạn'
    },
    {
      code: 'FREESHIP',
      discount: 'Freeship 0 ₫',
      minSpend: 'Toàn quốc cho mọi đơn hàng',
      expiry: 'Hạn dùng: Áp dụng tự động'
    }
  ];

  const heroFeaturedProduct = displayElectronicProducts[0] || defaultElectronicProducts[0];

  return (
    <div className="space-y-16 pb-16 bg-[#07070c] text-white">
      {/* 1. HERO SECTION */}
      <section className="relative rounded-3xl overflow-hidden border border-[#1f1625] p-6 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 group min-h-[640px]">
        {/* Ambient Radial Gradient Mesh Backdrops */}
        <div className="absolute inset-0 bg-[#07070c] z-0" />
        <div className="absolute right-[0%] top-[0%] w-[65%] h-[95%] rounded-full bg-[#FF1E27] opacity-[0.22] blur-[160px] pointer-events-none z-0" />
        <div className="absolute right-[20%] bottom-[0%] w-[55%] h-[70%] rounded-full bg-purple-700 opacity-[0.22] blur-[140px] pointer-events-none z-0" />
        
        {/* Subtle glowing wave lines */}
        <div className="absolute inset-0 pointer-events-none opacity-40 z-0 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1440 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 320 C 300 480, 200 120, 600 280 C 1000 440, 900 180, 1540 320" stroke="url(#gradient-wave-1)" strokeWidth="2.5" opacity="0.6"/>
            <path d="M-50 280 C 400 380, 300 200, 700 320 C 1100 440, 800 120, 1500 240" stroke="url(#gradient-wave-2)" strokeWidth="1.5" opacity="0.4"/>
            <defs>
              <linearGradient id="gradient-wave-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF1E27" />
                <stop offset="50%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#E02424" />
              </linearGradient>
              <linearGradient id="gradient-wave-2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#FF1E27" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Hero Left Content */}
        <div className="relative z-10 max-w-xl space-y-6 flex-shrink-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF1E27]/15 border border-[#FF1E27]/30 text-[#FF1E27] text-[10px] font-extrabold uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF1E27] animate-pulse" />
            <span>SIÊU SALE BÙNG NỔ 2026</span>
          </div>

          <div className="text-xs font-semibold text-[#8E92B2]">
            Danh mục <span className="mx-1">&gt;</span> Thiết bị Điện tử & Gaming
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-none">
            SỰ KIỆN FLASH<br/>
            SALE CỰC ĐẠI
          </h1>

          {/* Countdown Clock */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center bg-[#0d0d16] border border-[#FF1E27]/30 rounded-2xl px-4 py-3 min-w-[72px] shadow-[0_0_20px_rgba(255,30,39,0.12)]">
                <span className="font-mono text-3xl font-extrabold text-white tracking-widest">{formatDigit(heroTime.hours)}</span>
              </div>
              <span className="text-[10px] text-[#8E92B2] font-bold uppercase mt-1">Giờ</span>
            </div>
            <span className="font-mono text-2xl font-bold text-white mb-4">:</span>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center bg-[#0d0d16] border border-[#FF1E27]/30 rounded-2xl px-4 py-3 min-w-[72px] shadow-[0_0_20px_rgba(255,30,39,0.12)]">
                <span className="font-mono text-3xl font-extrabold text-white tracking-widest">{formatDigit(heroTime.minutes)}</span>
              </div>
              <span className="text-[10px] text-[#8E92B2] font-bold uppercase mt-1">Phút</span>
            </div>
            <span className="font-mono text-2xl font-bold text-white mb-4">:</span>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center bg-[#0d0d16] border border-[#FF1E27]/30 rounded-2xl px-4 py-3 min-w-[72px] shadow-[0_0_20px_rgba(255,30,39,0.12)]">
                <span className="font-mono text-3xl font-extrabold text-white tracking-widest">{formatDigit(heroTime.seconds)}</span>
              </div>
              <span className="text-[10px] text-[#8E92B2] font-bold uppercase mt-1">Giây</span>
            </div>
          </div>

          <p className="text-[#8E92B2] text-sm md:text-base font-medium">
            {heroFeaturedProduct.name}
          </p>

          <div className="flex items-baseline gap-3">
            {heroFeaturedProduct.originalPrice && (
              <span className="text-[#8E92B2] text-sm line-through font-medium">{formatVND(heroFeaturedProduct.originalPrice)}</span>
            )}
            <span className="text-4xl font-black text-[#FF1E27] tracking-tight">{formatVND(heroFeaturedProduct.price)}</span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 max-w-xs">
            <div className="w-full bg-[#1A1A2A] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#FF1E27] h-full rounded-full w-[45%]" />
            </div>
            <div className="text-[10px] text-[#8E92B2] font-semibold tracking-wide uppercase">
              Số lượng ưu đãi: <span className="text-white">Đã bán 45% ({formatVND(heroFeaturedProduct.price)})</span>
            </div>
          </div>

          {/* Nested CTA Button */}
          <div className="pt-2">
            <Link 
              to={`/products/${heroFeaturedProduct.id}`}
              className="group inline-flex items-center gap-4 bg-gradient-to-r from-[#FF1E27] to-[#E02424] text-white font-bold text-sm px-8 py-4 rounded-full shadow-[0_10px_35px_rgba(255,30,39,0.45)] hover:shadow-[0_15px_45px_rgba(255,30,39,0.7)] transition-all duration-300 active:scale-95"
            >
              <span>MUA NGAY (FLASH BUY)</span>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight size={16} />
              </div>
            </Link>
          </div>
        </div>

        {/* Hero Right: Video Visual */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full lg:w-auto">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FF1E27]/35 via-purple-600/30 to-transparent rounded-full blur-[130px] opacity-95 pointer-events-none z-0" />

          <div className="relative z-10 w-full max-w-[860px] flex flex-col items-center justify-center">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto max-h-[640px] object-cover rounded-3xl drop-shadow-[0_40px_100px_rgba(0,0,0,0.98)] transition-transform duration-700 hover:scale-[1.03]"
              style={{
                maskImage: 'radial-gradient(circle at center, black 70%, transparent 99%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 70%, transparent 99%)'
              }}
            >
              <source src={heroVideo} type="video/mp4" />
            </video>

            <div className="mt-1 text-xs font-semibold text-[#8E92B2] flex items-center gap-2 bg-[#0d0d16]/80 px-5 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-xl">
              <Zap size={14} className="text-[#FF1E27] fill-[#FF1E27]" />
              <span>Bộ đôi Bàn phím Apex Pro & Chuột Prime</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THIẾT BỊ ĐIỆN TỬ & GAMING SECTION */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-[#FF1E27] uppercase tracking-wider block mb-1">Danh mục hot</span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Thiết Bị Điện Tử & Gaming</h2>
          </div>
          
          {/* Interactive Scroll Buttons */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => scrollContainer(electronicScrollRef, 'left')}
              className="w-9 h-9 rounded-full border border-[#232338] bg-[#0D0D16] hover:border-[#FF1E27] hover:bg-[#FF1E27]/15 text-[#8E92B2] hover:text-white flex items-center justify-center transition-all active:scale-90 shadow-md"
              title="Cuộn sang trái"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => scrollContainer(electronicScrollRef, 'right')}
              className="w-9 h-9 rounded-full border border-[#232338] bg-[#0D0D16] hover:border-[#FF1E27] hover:bg-[#FF1E27]/15 text-[#8E92B2] hover:text-white flex items-center justify-center transition-all active:scale-90 shadow-md"
              title="Cuộn sang phải"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div ref={electronicScrollRef} className="flex overflow-x-auto no-scrollbar gap-5 pb-4 scroll-smooth">
          {displayElectronicProducts.map((product) => (
            <Link 
              key={product.id} 
              to={`/products/${product.id}`}
              className="flex-shrink-0 w-[240px] bg-[#0D0D16] red-card-border p-4 rounded-2xl flex flex-col justify-between relative group overflow-hidden"
            >
              {product.isSoldOut && (
                <div className="absolute inset-0 bg-[#07070c]/85 backdrop-blur-xs flex flex-col items-center justify-center z-20">
                  <span className="bg-[#FF1E27] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                    SOLD OUT
                  </span>
                  <span className="text-white text-base font-extrabold tracking-widest">
                    CHÁY HÀNG
                  </span>
                </div>
              )}

              <div>
                <div className="relative mb-4 overflow-hidden rounded-xl bg-[#08080E] aspect-square w-full">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.onerror = null;
                      t.src = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-semibold text-white line-clamp-2 text-sm mb-2 h-10 group-hover:text-[#FF1E27] transition-colors">
                  {product.name}
                </h3>
              </div>

              <div className="pt-3 border-t border-[#1E1E2E] flex flex-col gap-1">
                {product.originalPrice && (
                  <span className="text-[11px] text-[#8E92B2] line-through font-medium">{formatVND(product.originalPrice)}</span>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-[#FF1E27]">{formatVND(product.price)}</span>
                  {!product.isSoldOut && (
                    <button 
                      onClick={(e) => handleAddToCart(product, e)}
                      className="p-2 rounded-lg bg-[#FF1E27]/10 hover:bg-[#FF1E27] text-[#FF1E27] hover:text-white transition-colors"
                      title="Thêm vào giỏ hàng"
                    >
                      <ShoppingBag size={14} />
                    </button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. SẮP DIỄN RA SECTION */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-[#FF1E27] uppercase tracking-wider block mb-1">Đợt Sale Tiếp Theo</span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">SẮP DIỄN RA</h2>
          </div>

          {/* Interactive Scroll Buttons */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => scrollContainer(upcomingScrollRef, 'left')}
              className="w-9 h-9 rounded-full border border-[#232338] bg-[#0D0D16] hover:border-[#FF1E27] hover:bg-[#FF1E27]/15 text-[#8E92B2] hover:text-white flex items-center justify-center transition-all active:scale-90 shadow-md"
              title="Cuộn sang trái"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => scrollContainer(upcomingScrollRef, 'right')}
              className="w-9 h-9 rounded-full border border-[#232338] bg-[#0D0D16] hover:border-[#FF1E27] hover:bg-[#FF1E27]/15 text-[#8E92B2] hover:text-white flex items-center justify-center transition-all active:scale-90 shadow-md"
              title="Cuộn sang phải"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div ref={upcomingScrollRef} className="flex overflow-x-auto no-scrollbar gap-5 pb-4 scroll-smooth">
          {defaultUpcomingProducts.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="flex-shrink-0 w-[260px] bg-[#0D0D16] red-card-border p-4 rounded-2xl flex flex-col justify-between relative group"
            >
              <div>
                <div className="relative mb-3 overflow-hidden rounded-xl bg-[#08080E] aspect-square w-full">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.onerror = null;
                      t.src = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Localized Countdown box below image */}
                {product.time && (
                  <div className="bg-[#121220] border border-[#232338] rounded-xl p-2.5 mb-3 text-center shadow-inner">
                    <span className="font-mono text-sm font-extrabold text-white tracking-widest">
                      {formatDigit(product.time.hours)} : {formatDigit(product.time.minutes)} : {formatDigit(product.time.seconds)}
                    </span>
                    <span className="block text-[8px] text-[#8E92B2] font-semibold uppercase tracking-wider mt-0.5">
                      {product.label}
                    </span>
                  </div>
                )}

                <h3 className="font-semibold text-white line-clamp-2 text-sm mb-2 h-10 group-hover:text-[#FF1E27] transition-colors">
                  {product.name}
                </h3>
              </div>

              <div className="pt-3 border-t border-[#1E1E2E] flex items-center justify-between">
                <span className="text-base font-extrabold text-[#FF1E27]">{formatVND(product.price)}</span>
                <span className="text-[10px] text-[#FF1E27] font-extrabold uppercase tracking-wider border border-[#FF1E27]/40 bg-[#FF1E27]/10 px-3 py-1 rounded-full">
                  Sắp Mở Bán
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. REPLACEMENT SECTION: TOP PHỤ KIỆN GAMING BÁN CHẠY */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FF1E27] uppercase tracking-widest mb-1">
              <Zap size={14} className="fill-[#FF1E27]" />
              <span>Thiết Bị Nổi Bật</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Top Phụ Kiện Gaming Bán Chạy</h2>
          </div>

          {/* Interactive Scroll Buttons */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => scrollContainer(bestsellingScrollRef, 'left')}
              className="w-9 h-9 rounded-full border border-[#232338] bg-[#0D0D16] hover:border-[#FF1E27] hover:bg-[#FF1E27]/15 text-[#8E92B2] hover:text-white flex items-center justify-center transition-all active:scale-90 shadow-md"
              title="Cuộn sang trái"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => scrollContainer(bestsellingScrollRef, 'right')}
              className="w-9 h-9 rounded-full border border-[#232338] bg-[#0D0D16] hover:border-[#FF1E27] hover:bg-[#FF1E27]/15 text-[#8E92B2] hover:text-white flex items-center justify-center transition-all active:scale-90 shadow-md"
              title="Cuộn sang phải"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div ref={bestsellingScrollRef} className="flex overflow-x-auto no-scrollbar gap-5 pb-4 scroll-smooth">
          {displayBestsellingGear.map((product) => (
            <Link 
              key={product.id} 
              to={`/products/${product.id}`}
              className="flex-shrink-0 w-[260px] bg-[#0D0D16] red-card-border p-4 rounded-2xl flex flex-col justify-between relative group hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="relative mb-4 overflow-hidden rounded-xl bg-[#08080E] aspect-square w-full">
                  <span className="absolute top-2 left-2 bg-[#FF1E27]/20 border border-[#FF1E27]/40 text-[#FF1E27] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider z-10 backdrop-blur-md">
                    {product.badge || 'Chính hãng'}
                  </span>
                  
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.onerror = null;
                      t.src = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-amber-400 text-xs mb-2">
                  <Star size={13} fill="currentColor" />
                  <span className="font-extrabold text-white">{product.rating || 5.0}</span>
                  <span className="text-[#8E92B2] text-[11px]">({product.reviews || 150} đánh giá)</span>
                </div>

                <h3 className="font-semibold text-white line-clamp-2 text-sm mb-2 h-10 group-hover:text-[#FF1E27] transition-colors">
                  {product.name}
                </h3>
              </div>

              <div className="pt-3 border-t border-[#1E1E2E] flex items-center justify-between mt-2">
                <div>
                  {product.originalPrice && (
                    <span className="text-[11px] text-[#8E92B2] line-through block font-medium">{formatVND(product.originalPrice)}</span>
                  )}
                  <span className="text-lg font-extrabold text-[#FF1E27]">{formatVND(product.price)}</span>
                </div>
                <button 
                  onClick={(e) => handleAddToCart(product, e)}
                  className="p-2.5 rounded-xl bg-[#FF1E27]/10 hover:bg-[#FF1E27] text-[#FF1E27] hover:text-white transition-colors shadow-md"
                  title="Thêm vào giỏ hàng"
                >
                  <ShoppingBag size={16} />
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* Glassmorphic Voucher Hub */}
        <div className="mt-8 bg-gradient-to-r from-[#121220] via-[#1A1A2E] to-[#121220] border border-[#FF1E27]/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#FF1E27]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 max-w-sm">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF1E27]">
              <Tag size={14} />
              <span>VOUCHER ƯU ĐÃI ĐỘC QUYỀN</span>
            </div>
            <h3 className="text-2xl font-black text-white">Glassmorphic Voucher Hub</h3>
            <p className="text-xs text-[#8E92B2]">Nhập mã khi thanh toán để nhận ngay ưu đãi giảm giá và miễn phí vận chuyển toàn quốc!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
            {flashVouchers.map((v) => (
              <div key={v.code} className="bg-[#07070c] border border-[#232338] hover:border-[#FF1E27]/50 rounded-2xl p-3.5 flex flex-col justify-between transition-all group">
                <div>
                  <div className="text-sm font-extrabold text-[#FF1E27]">{v.discount}</div>
                  <div className="text-[10px] text-white font-medium mt-0.5">{v.minSpend}</div>
                  <div className="text-[9px] text-[#8E92B2] mt-1">{v.expiry}</div>
                </div>

                <button 
                  onClick={() => copyVoucher(v.code)}
                  className="mt-3 w-full py-1.5 px-3 rounded-lg bg-[#181826] hover:bg-[#FF1E27] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                >
                  {copiedCode === v.code ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedCode === v.code ? 'ĐÃ SAO CHÉP' : v.code}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. VALUE PROPS BAR */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-4 p-5 rounded-2xl bg-[#0D0D16] border border-[#1A1A2A] hover:border-[#FF1E27]/30 transition-all">
          <div className="p-3.5 rounded-xl bg-[#FF1E27]/10 text-[#FF1E27]">
            <Truck size={24} />
          </div>
          <div>
            <h5 className="font-extrabold text-sm text-white">Giao Hàng Hỏa Tốc</h5>
            <p className="text-xs text-[#8E92B2]">Miễn phí vận chuyển toàn quốc cho mọi đơn hàng</p>
          </div>
        </div>

        <div className="flex items-center justify-center sm:justify-start gap-4 p-5 rounded-2xl bg-[#0D0D16] border border-[#1A1A2A] hover:border-[#FF1E27]/30 transition-all">
          <div className="p-3.5 rounded-xl bg-[#FF1E27]/10 text-[#FF1E27]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h5 className="font-extrabold text-sm text-white">Bảo Hành Chính Hãng</h5>
            <p className="text-xs text-[#8E92B2]">Cam kết 100% sản phẩm chính hãng 1 đổi 1</p>
          </div>
        </div>

        <div className="flex items-center justify-center sm:justify-start gap-4 p-5 rounded-2xl bg-[#0D0D16] border border-[#1A1A2A] hover:border-[#FF1E27]/30 transition-all">
          <div className="p-3.5 rounded-xl bg-[#FF1E27]/10 text-[#FF1E27]">
            <Headphones size={24} />
          </div>
          <div>
            <h5 className="font-extrabold text-sm text-white">Hỗ Trợ 24/7</h5>
            <p className="text-xs text-[#8E92B2]">Đội ngũ kỹ thuật hỗ trợ tư vấn tức thì</p>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="pt-16 border-t border-transparent relative mt-24">
        {/* Red gradient separator line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF1E27] to-transparent opacity-80" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 max-w-7xl mx-auto px-4 md:px-0">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white tracking-widest uppercase">LIÊN KẾT NHANH</h4>
            <ul className="space-y-2 text-xs text-[#8E92B2]">
              <li><Link to="/" className="hover:text-white transition-colors">Trang chủ</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Danh mục sản phẩm</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Flash Sale hôm nay</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Theo dõi đơn hàng</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Trung tâm trợ giúp</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white tracking-widest uppercase">HỖ TRỢ KHÁCH HÀNG</h4>
            <ul className="space-y-2 text-xs text-[#8E92B2]">
              <li><Link to="/" className="hover:text-white transition-colors">Sơ đồ trang web</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Cửa hàng trực tuyến</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Hợp tác thương hiệu</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Truyền thông & Báo chí</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Liên hệ tư vấn</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white tracking-widest uppercase">TÀI KHOẢN & CHÍNH SÁCH</h4>
            <ul className="space-y-2 text-xs text-[#8E92B2]">
              <li><Link to="/profile" className="hover:text-white transition-colors">Thông tin tài khoản</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Điều khoản dịch vụ</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Chính sách đổi trả 1-đổi-1</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Quy định bảo hành</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white tracking-widest uppercase">KÊNH TRUYỀN THÔNG</h4>
            <div className="flex items-center space-x-3 text-[#8E92B2]">
              <a href="#" className="w-8 h-8 rounded-full border border-[#232338] hover:border-white hover:text-white flex items-center justify-center transition-all duration-300" title="Cộng đồng">
                <MessageCircle size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-[#232338] hover:border-white hover:text-white flex items-center justify-center transition-all duration-300" title="Chia sẻ">
                <Share2 size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-[#232338] hover:border-white hover:text-white flex items-center justify-center transition-all duration-300" title="Kênh Telegram">
                <Send size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-[#232338] hover:border-white hover:text-white flex items-center justify-center transition-all duration-300" title="Kênh Podcast">
                <Radio size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-[#232338] hover:border-white hover:text-white flex items-center justify-center transition-all duration-300" title="Website chính thức">
                <Globe size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#121220] pt-6 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto text-xs text-[#8E92B2] gap-4 px-4 md:px-0 relative">
          <p>© 2026 FlashShop Inc. | Tất cả quyền được bảo lưu. Phát triển bởi Nhóm 8 (Group 8)</p>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-[#FF1E27] fill-[#FF1E27]" />
            <span className="font-extrabold tracking-tight text-white text-sm">
              <span className="text-[#FF1E27]">Flash</span>Shop
            </span>
          </div>

          <Sparkles className="absolute right-4 bottom-[-10px] text-gray-500/30" size={32} />
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
