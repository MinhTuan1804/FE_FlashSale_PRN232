import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShoppingBag, Clock, Flame, Sparkles } from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import toast from 'react-hot-toast';
import { getActiveFlashSales, getProducts } from '../../api/catalog.api';
import { formatVND } from './HomePage';

interface FlashProduct {
  id: string;
  name: string;
  originalPrice: number;
  flashPrice: number;
  discountPercent: number;
  imageUrl: string;
  soldPercent: number;
  stockLeft: number;
  isSoldOut?: boolean;
  badge?: string;
}

const FlashSalePage = () => {
  const addItem = useCartStore((state) => state.addItem);
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'night'>('active');

  // Real-time countdown to next 12-hour slot boundary (00:00, 12:00)
  const computeTimeLeft = () => {
    const now = new Date();
    const h = now.getHours();
    const target = new Date(now);
    if (h < 12) {
      target.setHours(12, 0, 0, 0);
    } else {
      target.setHours(24, 0, 0, 0);
    }
    const diffMs = target.getTime() - now.getTime();
    const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
    return {
      hours: Math.floor(totalSecs / 3600),
      minutes: Math.floor((totalSecs % 3600) / 60),
      seconds: totalSecs % 60,
    };
  };

  const [timeLeft, setTimeLeft] = useState(computeTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(computeTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigit = (num: number) => num.toString().padStart(2, '0');

  // API data state
  const [apiProducts, setApiProducts] = useState<FlashProduct[]>([]);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const [saleRes, prodRes] = await Promise.allSettled([
          getActiveFlashSales(),
          getProducts(1, 20)
        ]);

        let mappedSales: FlashProduct[] = [];

        if (saleRes.status === 'fulfilled' && saleRes.value) {
          const rawVal = saleRes.value as any;
          const data = rawVal?.data?.data || rawVal?.data || rawVal;
          const campaignList = Array.isArray(data) ? data : (data ? [data] : []);
          let items: any[] = [];

          campaignList.forEach((camp: any) => {
            if (Array.isArray(camp.items)) {
              items.push(...camp.items);
            } else if (camp.productId) {
              items.push(camp);
            }
          });

          if (items.length === 0 && Array.isArray((data as any).items)) {
            items = (data as any).items;
          }

          if (items.length > 0) {
            mappedSales = items.map((item: any) => {
              const rawPrice = Number(item.flashSalePrice || item.price) || 3490000;
              const convertedPrice = rawPrice < 10000 ? rawPrice * 25000 : rawPrice;
              const origPrice = Number(item.originalPrice) > 0 ? Number(item.originalPrice) : convertedPrice * 1.4;
              const totalStock = item.flashSaleQuantity || 50;
              const soldQty = item.soldQuantity || 0;
              const stockLeft = item.stockQuantity !== undefined ? Number(item.stockQuantity) : Math.max(0, totalStock - soldQty);
              const isSoldOut = stockLeft <= 0;
              const soldPercent = isSoldOut ? 100 : Math.min(99, Math.round(((totalStock - stockLeft) / totalStock) * 100));

              return {
                id: item.productId || item.id,
                name: item.productName || item.name || 'Thiết bị Gaming High-End',
                originalPrice: origPrice,
                flashPrice: convertedPrice,
                discountPercent: Math.round((1 - convertedPrice / origPrice) * 100),
                imageUrl: item.productImageUrl || item.imageUrl || 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400',
                soldPercent,
                stockLeft,
                isSoldOut,
                badge: isSoldOut ? 'Cháy hàng' : 'Flash Sale Live'
              };
            });
          }
        }

        if (prodRes.status === 'fulfilled' && prodRes.value) {
          const val = prodRes.value as any;
          const paged = val?.data?.items ? val.data.items : (val?.data ? val.data : (val?.items ? val.items : val));
          const items = Array.isArray(paged) ? paged : (Array.isArray(paged?.items) ? paged.items : []);
          if (Array.isArray(items) && items.length > 0) {
            const mappedProds = items.map((p: any) => {
              const rawPrice = Number(p.price || p.unitPrice) || 3490000;
              const convertedPrice = rawPrice < 10000 ? rawPrice * 25000 : rawPrice;
              const origPrice = Math.round(convertedPrice * 1.3);
              const stockLeft = p.stockQuantity !== undefined ? Number(p.stockQuantity) : 15;
              const totalStock = 50;
              const isSoldOut = stockLeft <= 0;
              const soldPercent = isSoldOut ? 100 : Math.min(99, Math.round(((totalStock - stockLeft) / totalStock) * 100));

              return {
                id: p.id,
                name: p.name,
                originalPrice: origPrice,
                flashPrice: convertedPrice,
                discountPercent: 23,
                imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400',
                soldPercent,
                stockLeft,
                isSoldOut,
                badge: isSoldOut ? 'Cháy hàng' : 'Chính hãng'
              };
            });

            const allMap = new Map<string, FlashProduct>();
            mappedSales.forEach(s => allMap.set(s.id, s));
            mappedProds.forEach(pr => { if (!allMap.has(pr.id)) allMap.set(pr.id, pr); });
            console.log('FLASH_SALE_DEBUG_FINAL:', mappedSales, mappedProds, Array.from(allMap.values()));
            setApiProducts(Array.from(allMap.values()));
            return;
          }
        }

        if (mappedSales.length > 0) {
          setApiProducts(mappedSales);
        }
      } catch (err) {
        console.warn('API FlashSale notice:', err);
      }
    };
    fetchFlashSales();
  }, []);

  const handleAddToCart = (product: FlashProduct, e: React.MouseEvent) => {
    e.preventDefault();
    if (product.isSoldOut) return;
    addItem({
      productId: product.id,
      productName: product.name,
      unitPrice: product.flashPrice,
      imageUrl: product.imageUrl,
      quantity: 1
    });
    toast.success(`Đã thêm ${product.name} vào giỏ với giá Flash Sale!`);
  };

  // 1. SESSION 1: ĐANG DIỄN RA (00:00 - 12:00) - 5 Products in VND
  const activeProducts: FlashProduct[] = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Bộ đôi Bàn phím cơ SteelSeries Apex Pro + Chuột Prime',
      originalPrice: 5900000,
      flashPrice: 3490000,
      discountPercent: 40,
      imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400',
      soldPercent: 88,
      stockLeft: 4,
      badge: 'Bán chạy nhất'
    },
    {
      id: '00000000-0000-0000-0000-000000000006',
      name: 'Tai nghe không dây SteelSeries Arctis Nova Pro Wireless',
      originalPrice: 8490000,
      flashPrice: 5990000,
      discountPercent: 29,
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400',
      soldPercent: 75,
      stockLeft: 12,
      badge: 'Hi-Res Audio'
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Chuột Gaming siêu nhẹ Razer Viper V3 Pro Ultra-light',
      originalPrice: 3890000,
      flashPrice: 2890000,
      discountPercent: 31,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=400',
      soldPercent: 94,
      stockLeft: 2,
      badge: 'Giảm cực sâu'
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      name: 'Màn hình Gaming Asus ROG Swift OLED 360Hz 0.03ms',
      originalPrice: 22990000,
      flashPrice: 18990000,
      discountPercent: 22,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=400',
      soldPercent: 100,
      stockLeft: 0,
      isSoldOut: true,
      badge: 'Cháy hàng'
    },
    {
      id: '00000000-0000-0000-0000-000000000007',
      name: 'Bộ Keycap Artisan PBT Double-shot Cyberpunk Edition',
      originalPrice: 1800000,
      flashPrice: 990000,
      discountPercent: 50,
      imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=400',
      soldPercent: 60,
      stockLeft: 20,
      badge: 'Giảm 50%'
    }
  ];

  // 2. SESSION 2: SẮP DIỄN RA (12:00 - 18:00) - 5 Products in VND
  const upcomingProducts: FlashProduct[] = [
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Bàn phím cơ Bluetooth RGB không dây Pro-X Custom',
      originalPrice: 4500000,
      flashPrice: 2890000,
      discountPercent: 40,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600',
      soldPercent: 15,
      stockLeft: 45,
      badge: 'Sắp mở bán'
    },
    {
      id: '00000000-0000-0000-0000-000000000008',
      name: 'Màn hình Cong Samsung Odyssey G9 Dual QHD 240Hz',
      originalPrice: 34990000,
      flashPrice: 24990000,
      discountPercent: 28,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=400',
      soldPercent: 10,
      stockLeft: 15,
      badge: 'OLED 240Hz'
    },
    {
      id: '00000000-0000-0000-0000-000000000009',
      name: 'Chuột Gaming Logitech G Pro X Superlight 2 DEX',
      originalPrice: 4200000,
      flashPrice: 3290000,
      discountPercent: 18,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=400',
      soldPercent: 25,
      stockLeft: 30,
      badge: 'HERO 2 Sensor'
    },
    {
      id: '00000000-0000-0000-0000-000000000010',
      name: 'Micro Thu Âm Gaming Elgato Wave:3 USB Condenser',
      originalPrice: 4400000,
      flashPrice: 3190000,
      discountPercent: 28,
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400',
      soldPercent: 30,
      stockLeft: 25,
      badge: 'Studio Quality'
    },
    {
      id: '00000000-0000-0000-0000-000000000011',
      name: 'Ghế Gaming Công Thái Học Secretlab TITAN Evo 2024',
      originalPrice: 14900000,
      flashPrice: 10990000,
      discountPercent: 25,
      imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400',
      soldPercent: 5,
      stockLeft: 20,
      badge: 'Ergo VIP'
    }
  ];

  // 3. SESSION 3: ĐỢT CUỐI NGÀY (18:00 - 24:00) - 5 Products in VND
  const nightProducts: FlashProduct[] = [
    {
      id: '00000000-0000-0000-0000-000000000012',
      name: 'Card Đồ Họa Asus ROG Strix RTX 4090 OC 24GB',
      originalPrice: 54990000,
      flashPrice: 45990000,
      discountPercent: 18,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=400',
      soldPercent: 50,
      stockLeft: 5,
      badge: 'Sale Cuối Ngày'
    },
    {
      id: '00000000-0000-0000-0000-000000000013',
      name: 'Tay Cầm Controller Wireless Xbox Elite Series 2 Core',
      originalPrice: 3490000,
      flashPrice: 2490000,
      discountPercent: 28,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=400',
      soldPercent: 40,
      stockLeft: 18,
      badge: 'Bluetooth 5.0'
    },
    {
      id: '00000000-0000-0000-0000-000000000014',
      name: 'Loa Gaming Soundbar Razer Leviathan V2 Pro 3D Audio',
      originalPrice: 10900000,
      flashPrice: 8490000,
      discountPercent: 22,
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400',
      soldPercent: 65,
      stockLeft: 8,
      badge: 'THX Spatial'
    },
    {
      id: '00000000-0000-0000-0000-000000000015',
      name: 'Đèn Nền Màn Hình BenQ WiT ScreenBar Halo Controller',
      originalPrice: 4690000,
      flashPrice: 3690000,
      discountPercent: 21,
      imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=400',
      soldPercent: 80,
      stockLeft: 6,
      badge: 'Chống Mỏi Mắt'
    },
    {
      id: '00000000-0000-0000-0000-000000000016',
      name: 'Thảm Lót Bàn Phím Cỡ Lớn Artisan Ninja FX Zero XL Soft',
      originalPrice: 2200000,
      flashPrice: 1490000,
      discountPercent: 33,
      imageUrl: 'https://images.unsplash.com/photo-1626266028802-36fda22b7ebd?auto=format&fit=crop&q=80&w=400',
      soldPercent: 90,
      stockLeft: 3,
      badge: 'Made in Japan'
    }
  ];

  // Determine current products list based on Active Tab
  const getProductsForActiveTab = (): FlashProduct[] => {
    if (apiProducts.length > 0) {
      if (activeTab === 'upcoming') {
        const upcomingSlice = apiProducts.slice(Math.floor(apiProducts.length / 3), Math.floor((apiProducts.length * 2) / 3));
        return upcomingSlice.length > 0 ? upcomingSlice : apiProducts;
      } else if (activeTab === 'night') {
        const nightSlice = apiProducts.slice(Math.floor((apiProducts.length * 2) / 3));
        return nightSlice.length > 0 ? nightSlice : apiProducts;
      } else {
        return apiProducts;
      }
    }

    if (activeTab === 'upcoming') {
      return upcomingProducts;
    } else if (activeTab === 'night') {
      return nightProducts;
    } else {
      return activeProducts;
    }
  };

  const flashProductsToDisplay = getProductsForActiveTab();

  return (
    <div className="space-y-12 pb-16 bg-transparent text-white">
      {/* 1. FLASH SALE HEADER HERO BANNER */}
      <section className="relative rounded-3xl overflow-hidden border border-[#FF1E27]/40 p-8 md:p-12 bg-gradient-to-r from-[#12070A] via-[#1A0A10] to-[#07070C] shadow-[0_0_60px_rgba(255,30,39,0.25)]">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#FF1E27]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF1E27]/20 border border-[#FF1E27]/50 text-[#FF1E27] text-xs font-extrabold tracking-widest uppercase">
              <Zap className="w-4 h-4 fill-[#FF1E27]" />
              <span>SỰ KIỆN FLASH SALE GIỜ VÀNG</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-tight">
              GIẢM SỐC TỚI <span className="text-[#FF1E27]">50%</span><br />
              THIẾT BỊ GAMING HIGH-END
            </h1>

            <p className="text-xs md:text-sm text-[#8E92B2]">
              Sản phẩm Flash Sale có số lượng giới hạn theo từng khung giờ. Đặt hàng ngay trước khi kết thúc đợt sale!
            </p>
          </div>

          {/* Real-time High Tension Countdown Box */}
          <div className="bg-[#0D0D16] border border-[#FF1E27]/50 rounded-3xl p-6 shadow-[0_10px_40px_rgba(255,30,39,0.3)] flex flex-col items-center gap-3 min-w-[280px]">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>KẾT THÚC SAU</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div className="bg-[#07070C] border border-[#FF1E27]/40 rounded-2xl px-4 py-3 min-w-[68px] text-center shadow-inner">
                  <span className="font-mono text-3xl font-black text-white tracking-widest">{formatDigit(timeLeft.hours)}</span>
                </div>
                <span className="text-[10px] text-[#8E92B2] font-bold uppercase mt-1">Giờ</span>
              </div>
              <span className="font-mono text-2xl font-bold text-[#FF1E27] mb-4">:</span>
              <div className="flex flex-col items-center">
                <div className="bg-[#07070C] border border-[#FF1E27]/40 rounded-2xl px-4 py-3 min-w-[68px] text-center shadow-inner">
                  <span className="font-mono text-3xl font-black text-white tracking-widest">{formatDigit(timeLeft.minutes)}</span>
                </div>
                <span className="text-[10px] text-[#8E92B2] font-bold uppercase mt-1">Phút</span>
              </div>
              <span className="font-mono text-2xl font-bold text-[#FF1E27] mb-4">:</span>
              <div className="flex flex-col items-center">
                <div className="bg-[#07070C] border border-[#FF1E27]/40 rounded-2xl px-4 py-3 min-w-[68px] text-center shadow-inner">
                  <span className="font-mono text-3xl font-black text-white tracking-widest">{formatDigit(timeLeft.seconds)}</span>
                </div>
                <span className="text-[10px] text-[#8E92B2] font-bold uppercase mt-1">Giây</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TIME SLOT SELECTOR TABS */}
      <section className="flex flex-wrap items-center justify-center gap-4 border-b border-[#1A1A2A] pb-6">
        {/* ACTIVE session tab */}
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-sm transition-all duration-300 ${
            activeTab === 'active'
              ? 'bg-[#FF1E27] text-white shadow-[0_10px_25px_rgba(255,30,39,0.4)] scale-105'
              : 'bg-[#0D0D16] border border-[#232338] text-[#8E92B2] hover:text-white'
          }`}
        >
          {/* Live pulsing dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
          </span>
          <Flame className="w-4 h-4 fill-current" />
          <span>ĐANG DIỄN RA (00:00–12:00)</span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-sm transition-all duration-300 ${
            activeTab === 'upcoming'
              ? 'bg-[#FF1E27] text-white shadow-[0_10px_25px_rgba(255,30,39,0.4)] scale-105'
              : 'bg-[#0D0D16] border border-[#232338] text-[#8E92B2] hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>SẮP DIỄN RA (12:00–18:00)</span>
        </button>

        <button
          onClick={() => setActiveTab('night')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-sm transition-all duration-300 ${
            activeTab === 'night'
              ? 'bg-[#FF1E27] text-white shadow-[0_10px_25px_rgba(255,30,39,0.4)] scale-105'
              : 'bg-[#0D0D16] border border-[#232338] text-[#8E92B2] hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>ĐỢT CUỐI NGÀY (18:00–24:00)</span>
        </button>
      </section>

      {/* 3. FLASH SALE PRODUCT GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashProductsToDisplay.map((product) => {
          const stockLeft = product.stockLeft !== undefined 
            ? product.stockLeft 
            : ((product as any).stockQuantity !== undefined ? Number((product as any).stockQuantity) : 15);
          const totalStock = (product as any).stockTotal || 50;
          const isSoldOut = stockLeft <= 0 || product.isSoldOut === true;
          const soldPercent = isSoldOut ? 100 : Math.min(99, Math.round(((totalStock - stockLeft) / totalStock) * 100));

          return (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              state={{ product: { id: product.id, name: product.name, price: product.flashPrice || product.price, originalPrice: product.originalPrice, imageUrl: product.imageUrl, description: (product as any).description } }}
              className="bg-[#0D0D16] red-card-border rounded-3xl p-5 flex flex-col justify-between relative group hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
            >
              {/* Discount Ribbon Badge */}
              <div className="absolute top-3 left-3 bg-[#FF1E27] text-white font-black text-xs px-3 py-1 rounded-full shadow-lg z-20 flex items-center gap-1">
                <Zap className="w-3 h-3 fill-white" />
                <span>-{product.discountPercent}%</span>
              </div>

              {product.badge && !isSoldOut && (
                <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full z-20">
                  {product.badge}
                </div>
              )}

              {isSoldOut && (
                <div className="absolute inset-0 bg-[#07070C]/90 backdrop-blur-xs flex flex-col items-center justify-center z-30">
                  <span className="bg-[#FF1E27] text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-2 shadow-lg">
                    CHÁY HÀNG
                  </span>
                  <span className="text-white text-lg font-black tracking-widest uppercase">
                    ĐÃ BÁN HẾT 100%
                  </span>
                </div>
              )}

              <div>
                <div className="relative mb-5 overflow-hidden rounded-2xl bg-[#08080E] aspect-square w-full">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.onerror = null;
                      t.src = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <h3 className="font-bold text-white text-base line-clamp-2 h-12 mb-3 group-hover:text-[#FF1E27] transition-colors">
                  {product.name}
                </h3>
              </div>

              {/* Inventory Progress Bar */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#8E92B2]">Đã bán {soldPercent}%</span>
                  <span className={stockLeft > 0 && stockLeft < 5 ? 'text-amber-400 animate-pulse font-black' : 'text-[#8E92B2]'}>
                    {isSoldOut ? 'Hết hàng' : `Còn ${stockLeft} sp`}
                  </span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className={`progress-bar-fill ${soldPercent >= 90 ? 'almost-sold' : ''}`}
                    style={{ width: `${soldPercent}%` }}
                  />
                </div>
                {stockLeft > 0 && stockLeft < 5 && (
                  <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                    ⚠️ Sắp hết hàng — Chỉ còn {stockLeft} sản phẩm!
                  </div>
                )}
              </div>

            {/* Price & Action Button */}
            <div className="pt-4 border-t border-[#1E1E2E] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#8E92B2] line-through block font-medium">
                  {formatVND(product.originalPrice)}
                </span>
                <span className="text-2xl font-black text-[#FF1E27] tracking-tight">
                  {formatVND(product.flashPrice)}
                </span>
              </div>

              <button
                onClick={(e) => handleAddToCart(product, e)}
                disabled={isSoldOut}
                className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                  isSoldOut
                    ? 'bg-[#1F1F30] text-[#5A5E7A] cursor-not-allowed'
                    : 'bg-[#FF1E27] hover:bg-[#E02424] text-white active:scale-95 shadow-[0_5px_15px_rgba(255,30,39,0.4)]'
                }`}
              >
                <ShoppingBag size={14} />
                <span>{isSoldOut ? 'Hết hàng' : 'MUA NGAY'}</span>
              </button>
            </div>
          </Link>
        );
      })}
      </section>
    </div>
  );
};

export default FlashSalePage;
