import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ShoppingBag, Star, Filter, Tag, Check, Copy, ArrowUpDown } from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import toast from 'react-hot-toast';
import { getHotDeals } from '../../api/catalog.api';
import { formatVND } from './HomePage';

interface HotDealProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  badge: string;
  rating: number;
  reviews: number;
  discountPercent: number;
  category: string;
}

const HotDealsPage = () => {
  const addItem = useCartStore((state) => state.addItem);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'discount' | 'price-asc' | 'price-desc' | 'rating'>('discount');

  // API data state
  const [apiHotDeals, setApiHotDeals] = useState<HotDealProduct[]>([]);

  useEffect(() => {
    const fetchHotDealsData = async () => {
      try {
        const res = await getHotDeals();
        if (res) {
          const data = (res as any).data || res;
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((p: any) => {
              const rawPrice = Number(p.price) || 2890000;
              const convertedPrice = rawPrice < 10000 ? rawPrice * 25000 : rawPrice;
              return {
                id: p.id,
                name: p.name || 'Thiết bị Gaming High-End',
                price: convertedPrice,
                originalPrice: convertedPrice * 1.35,
                imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400',
                badge: 'Chính hãng',
                rating: 5.0,
                reviews: 180,
                discountPercent: 26,
                category: p.categoryName || 'Gaming Gear'
              };
            });
            setApiHotDeals(mapped);
          }
        }
      } catch (err) {
        console.warn('API HotDeals offline, rendering localized Hot Deals catalog:', err);
      }
    };
    fetchHotDealsData();
  }, []);

  const copyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã voucher ${code}!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleAddToCart = (product: HotDealProduct, e: React.MouseEvent) => {
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

  // High-End Localized Hot Deals Catalog in VND
  const defaultHotDeals: HotDealProduct[] = [
    {
      id: '00000000-0000-0000-0000-000000000006',
      name: 'Tai nghe Gaming không dây SteelSeries Arctis Nova Pro',
      price: 5990000,
      originalPrice: 8490000,
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400',
      badge: 'Hi-Res Audio',
      rating: 5.0,
      reviews: 256,
      discountPercent: 29,
      category: 'Tai nghe Gaming'
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Chuột Gaming siêu nhẹ Razer Viper V3 Pro 54g Wireless',
      price: 2890000,
      originalPrice: 3890000,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=400',
      badge: 'Ultra-light 54g',
      rating: 4.9,
      reviews: 184,
      discountPercent: 26,
      category: 'Chuột Gaming'
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      name: 'Màn hình Gaming Asus ROG Swift OLED 360Hz 0.03ms',
      price: 18990000,
      originalPrice: 22990000,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=400',
      badge: 'OLED 0.03ms',
      rating: 5.0,
      reviews: 92,
      discountPercent: 17,
      category: 'Màn hình'
    },
    {
      id: '00000000-0000-0000-0000-000000000007',
      name: 'Bộ Keycap Artisan PBT Double-shot Cyberpunk Edition',
      price: 990000,
      originalPrice: 1800000,
      imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=400',
      badge: 'Double-shot PBT',
      rating: 4.8,
      reviews: 310,
      discountPercent: 45,
      category: 'Bàn phím cơ'
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Bàn phím cơ không dây Bluetooth RGB Pro-X Custom',
      price: 2890000,
      originalPrice: 4500000,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600',
      badge: 'Wireless RGB',
      rating: 4.9,
      reviews: 145,
      discountPercent: 35,
      category: 'Bàn phím cơ'
    },
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Combo Bàn phím Apex Pro + Chuột Gaming Prime Ultra',
      price: 3490000,
      originalPrice: 5900000,
      imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400',
      badge: 'Combo Siêu Tiết Kiệm',
      rating: 5.0,
      reviews: 420,
      discountPercent: 40,
      category: 'Combo Gaming'
    }
  ];

  const dealsToDisplay = apiHotDeals.length > 0 ? apiHotDeals : defaultHotDeals;

  return (
    <div className="space-y-12 pb-16 bg-transparent text-white">
      {/* 1. HOT DEALS HERO BANNER */}
      <section className="relative rounded-3xl overflow-hidden border border-amber-500/40 p-8 md:p-12 bg-gradient-to-r from-[#171206] via-[#1F180A] to-[#07070C] shadow-[0_0_60px_rgba(255,184,0,0.2)]">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 text-xs font-extrabold tracking-widest uppercase">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>DANH MỤC ƯU ĐÃI HOT NHẤT 2026</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-tight">
            TOP SẢN PHẨM GAMING<br />
            <span className="text-amber-400">SIÊU GIẢM GIÁ</span> TRONG TUẦN
          </h1>

          <p className="text-xs md:text-sm text-[#8E92B2]">
            Tổng hợp các thiết bị gaming gear bán chạy nhất với mức giảm giá hấp dẫn, bảo hành chính hãng 100% 1-đổi-1.
          </p>
        </div>
      </section>

      {/* 2. FILTER & SORT BAR */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0D0D16] border border-[#232338] rounded-2xl p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#8E92B2]">
          <Filter size={16} className="text-amber-400" />
          <span>Hiển thị <span className="text-white font-extrabold">{dealsToDisplay.length}</span> ưu đãi hot</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8E92B2] font-semibold flex items-center gap-1">
            <ArrowUpDown size={14} /> Sắp xếp:
          </span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-[#121220] border border-[#232338] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
          >
            <option value="discount">Giảm giá nhiều nhất</option>
            <option value="rating">Đánh giá cao nhất</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
          </select>
        </div>
      </section>

      {/* 3. HOT DEALS PRODUCT GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dealsToDisplay.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="bg-[#0D0D16] red-card-border rounded-3xl p-5 flex flex-col justify-between relative group hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
          >
            {/* Hot Badge */}
            <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-[#FF1E27] text-white font-black text-xs px-3 py-1 rounded-full shadow-lg z-20 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-white" />
              <span>-{product.discountPercent}% GIẢM</span>
            </div>

            <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full z-20">
              {product.badge}
            </div>

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

              <div className="flex items-center gap-1.5 text-amber-400 text-xs mb-2">
                <Star size={13} fill="currentColor" />
                <span className="font-extrabold text-white">{product.rating}</span>
                <span className="text-[#8E92B2] text-[11px]">({product.reviews} đánh giá)</span>
              </div>

              <h3 className="font-bold text-white text-base line-clamp-2 h-12 mb-3 group-hover:text-amber-400 transition-colors">
                {product.name}
              </h3>
            </div>

            {/* Price & Action Button */}
            <div className="pt-4 border-t border-[#1E1E2E] flex items-center justify-between mt-3">
              <div>
                <span className="text-xs text-[#8E92B2] line-through block font-medium">
                  {formatVND(product.originalPrice)}
                </span>
                <span className="text-2xl font-black text-amber-400 tracking-tight">
                  {formatVND(product.price)}
                </span>
              </div>

              <button
                onClick={(e) => handleAddToCart(product, e)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-[#FF1E27] hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-[0_5px_15px_rgba(255,184,0,0.3)] active:scale-95"
              >
                <ShoppingBag size={14} />
                <span>THÊM GIỎ HÀNG</span>
              </button>
            </div>
          </Link>
        ))}
      </section>

      {/* 4. FLASH VOUCHERS BANNER */}
      <section className="bg-gradient-to-r from-[#121220] via-[#1A1A2E] to-[#121220] border border-amber-500/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 max-w-md">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Tag size={14} />
            <span>MÃ GIẢM GIÁ ĐỘC QUYỀN</span>
          </div>
          <h3 className="text-xl font-extrabold text-white">Sưu Tầm Voucher Cho Đơn Hàng Hot</h3>
          <p className="text-xs text-[#8E92B2]">Áp dụng mã giảm giá trực tiếp vào giỏ hàng khi thanh toán để nhận ngay ưu đãi khủng!</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {['HOT100K', 'GAMING200K', 'FREESHIPVIP'].map((code) => (
            <div key={code} className="bg-[#07070C] border border-[#232338] hover:border-amber-500/50 rounded-2xl p-3.5 flex flex-col justify-between min-w-[140px]">
              <span className="text-xs font-extrabold text-amber-400">{code}</span>
              <span className="text-[10px] text-[#8E92B2] mt-0.5">Giảm cực sâu</span>
              <button
                onClick={() => copyVoucher(code)}
                className="mt-2 text-[10px] font-bold py-1 px-3 rounded-lg bg-[#181826] hover:bg-amber-500 text-white transition-colors flex items-center justify-center gap-1"
              >
                {copiedCode === code ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedCode === code ? 'ĐÃ COPY' : 'COPY MÃ'}</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HotDealsPage;
