import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Star, ShieldCheck, Truck, RotateCcw, Minus, Plus, Loader2, ArrowLeft, Zap } from 'lucide-react';
import { getProductById, getProducts } from '../../api/catalog.api';
import { useCartStore } from '../../stores/useCartStore';
import toast from 'react-hot-toast';
import { formatVND } from './HomePage';

// Fallback product catalog map for offline or fallback IDs with VND prices
const fallbackCatalog: Record<string, any> = {
  '00000000-0000-0000-0000-000000000001': {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Bộ đôi Bàn phím cơ Apex Pro + Chuột Gaming Prime',
    price: 3490000,
    originalPrice: 5900000,
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600',
    description: 'Bộ đôi Bàn phím cơ Apex Pro switch OmniPoint tùy chỉnh hành trình phím và chuột siêu nhẹ Prime mang lại hiệu năng thi đấu đỉnh cao.'
  },
  '00000000-0000-0000-0000-000000000002': {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Bàn phím cơ Bluetooth RGB không dây Pro-X Custom',
    price: 2890000,
    originalPrice: 4500000,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600',
    description: 'Bàn phím cơ không dây đa kết nối Bluetooth 5.2 / 2.4Ghz / Type-C. Switch gõ cực êm, LED RGB 16.8 triệu màu.'
  },
  '00000000-0000-0000-0000-000000000003': {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Bàn phím cơ Gaming Silent Switch chống ồn',
    price: 2490000,
    originalPrice: 3800000,
    imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600',
    description: 'Bàn phím cơ trang bị Silent Red Switch triệt tiêu tiếng ồn tối đa, keycap PBT Double-shot.'
  },
  '00000000-0000-0000-0000-000000000004': {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Chuột Gaming siêu nhẹ Ergonomic Wireless 26.000 DPI',
    price: 2890000,
    originalPrice: 3890000,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600',
    description: 'Chuột gaming trọng lượng siêu nhẹ 54g trang bị cảm biến Focus Pro 26K DPI, pin 90h.'
  },
  '00000000-0000-0000-0000-000000000005': {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Màn hình Gaming ROG OLED 360Hz 0.03ms',
    price: 18990000,
    originalPrice: 22990000,
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600',
    description: 'Màn hình Gaming OLED 27 inch 2K 360Hz tần số quét cực cao, phản hồi 0.03ms siêu tốc.',
    isSoldOut: true
  },
  '00000000-0000-0000-0000-000000000006': {
    id: '00000000-0000-0000-0000-000000000006',
    name: 'Tai nghe Gaming không dây SteelSeries Arctis Nova Pro',
    price: 5990000,
    originalPrice: 8490000,
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600',
    description: 'Tai nghe gaming không dây Hi-Res Audio kết nối Dual Wireless 2.4G & Bluetooth.'
  },
  '00000000-0000-0000-0000-000000000007': {
    id: '00000000-0000-0000-0000-000000000007',
    name: 'Bộ Keycap Artisan PBT Double-shot Cyberpunk',
    price: 990000,
    originalPrice: 1800000,
    imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600',
    description: 'Bộ keycap 128 phím chất liệu PBT Double-shot màu sắc Cyberpunk độc đáo.'
  },
  '00000000-0000-0000-0000-000000000008': {
    id: '00000000-0000-0000-0000-000000000008',
    name: 'Màn hình Cong Samsung Odyssey G9 Dual QHD 240Hz',
    price: 24990000,
    originalPrice: 34990000,
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600',
    description: 'Màn hình OLED 49 inch cong siêu rộng 1000R, tần số quét 240Hz, độ phân giải Dual QHD cực nét.'
  },
  '00000000-0000-0000-0000-000000000009': {
    id: '00000000-0000-0000-0000-000000000009',
    name: 'Chuột Gaming Logitech G Pro X Superlight 2 DEX',
    price: 3290000,
    originalPrice: 4200000,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600',
    description: 'Chuột không dây siêu nhẹ 60g trang bị cảm biến HERO 2 44K DPI, LIGHTSPEED Wireless 8K polling rate.'
  },
  '00000000-0000-0000-0000-000000000010': {
    id: '00000000-0000-0000-0000-000000000010',
    name: 'Micro Thu Âm Gaming Elgato Wave:3 USB Condenser',
    price: 3190000,
    originalPrice: 4400000,
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600',
    description: 'Microphone condenser thu âm chuẩn studio dành cho Streamer & Gamer, công nghệ Clipguard chống méo tiếng.'
  },
  '00000000-0000-0000-0000-000000000011': {
    id: '00000000-0000-0000-0000-000000000011',
    name: 'Ghế Gaming Công Thái Học Secretlab TITAN Evo 2024',
    price: 10990000,
    originalPrice: 14900000,
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600',
    description: 'Ghế công thái học chất liệu da NEO Hybrid cao cấp, hỗ trợ thắt lưng L-ADAPT 4 chiều vượt trội.'
  },
  '00000000-0000-0000-0000-000000000012': {
    id: '00000000-0000-0000-0000-000000000012',
    name: 'Card Đồ Họa Asus ROG Strix RTX 4090 OC 24GB',
    price: 45990000,
    originalPrice: 54990000,
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600',
    description: 'VGA quái thú RTX 4090 24GB GDDR6X trang bị tản nhiệt buồng hơi Vapor Chamber, nguồn tản nhiệt khung kim loại nguyên khối.'
  },
  '00000000-0000-0000-0000-000000000013': {
    id: '00000000-0000-0000-0000-000000000013',
    name: 'Tay Cầm Controller Wireless Xbox Elite Series 2 Core',
    price: 2490000,
    originalPrice: 3490000,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600',
    description: 'Tay cầm chơi game không dây cao cấp với cần gạt tùy chỉnh lực cản, tay cầm bọc cao su chống trượt.'
  },
  '00000000-0000-0000-0000-000000000014': {
    id: '00000000-0000-0000-0000-000000000014',
    name: 'Loa Gaming Soundbar Razer Leviathan V2 Pro 3D Audio',
    price: 8490000,
    originalPrice: 10900000,
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600',
    description: 'Soundbar gaming tích hợp công nghệ Beamforming theo dõi chuyển động đầu bằng Camera AI, âm thanh vòm 3D THX.'
  },
  '00000000-0000-0000-0000-000000000015': {
    id: '00000000-0000-0000-0000-000000000015',
    name: 'Đèn Nền Màn Hình BenQ WiT ScreenBar Halo Controller',
    price: 3690000,
    originalPrice: 4690000,
    imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600',
    description: 'Đèn treo màn hình cảm ứng không dây, hệ thống chiếu sáng đôi bảo vệ mắt tuyệt đối khi chơi game ban đêm.'
  },
  '00000000-0000-0000-0000-000000000016': {
    id: '00000000-0000-0000-0000-000000000016',
    name: 'Thảm Lót Bàn Phím Cỡ Lớn Artisan Ninja FX Zero XL Soft',
    price: 1490000,
    originalPrice: 2200000,
    imageUrl: 'https://images.unsplash.com/photo-1626266028802-36fda22b7ebd?auto=format&fit=crop&q=80&w=600',
    description: 'Lót chuột cao cấp nhập khẩu Nhật Bản, bề mặt sợi dệt siêu mịn cho độ chính xác cao nhất cho game thủ CS2 & Valorant.'
  }
};

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        // Try real Backend API first
        const res: any = await getProductById(id);
        const data = res?.data || res;
        if (data && (data.id || data.name)) {
          const rawPrice = Number(data.price || data.unitPrice) || 3490000;
          const convertedPrice = rawPrice < 10000 ? rawPrice * 25000 : rawPrice;
          return {
            id: data.id || id,
            name: data.name || data.productName || 'Thiết Bị Gaming High-End',
            price: convertedPrice,
            originalPrice: data.originalPrice ? Number(data.originalPrice) : convertedPrice * 1.3,
            imageUrl: data.imageUrl || data.image || 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600',
            description: data.description || 'Sản phẩm công nghệ chính hãng chất lượng cao, thiết kế hiện đại, đáp ứng tối đa nhu cầu làm việc và giải trí.',
            isSoldOut: data.isSoldOut || id === '00000000-0000-0000-0000-000000000005'
          };
        }
      } catch (err) {
        console.warn('API getProductById offline or non-GUID id, searching list API / catalog fallback...');
      }

      // Try fetching list API
      try {
        const listRes: any = await getProducts(1, 50);
        const items = listRes?.items || listRes?.data || (Array.isArray(listRes) ? listRes : []);
        const found = items.find((p: any) => p.id === id || p.productId === id);
        if (found) {
          const rawPrice = Number(found.price || found.unitPrice) || 3490000;
          const convertedPrice = rawPrice < 10000 ? rawPrice * 25000 : rawPrice;
          return {
            id: found.id || found.productId,
            name: found.name || found.productName,
            price: convertedPrice,
            originalPrice: found.originalPrice ? Number(found.originalPrice) : convertedPrice * 1.3,
            imageUrl: found.imageUrl || found.image || 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600',
            description: found.description || 'Sản phẩm công nghệ chính hãng chất lượng cao.',
            isSoldOut: found.isSoldOut || id === '00000000-0000-0000-0000-000000000005'
          };
        }
      } catch (e) {
        // quiet fallback
      }

      // Check fallback catalog
      if (id && fallbackCatalog[id]) {
        return {
          ...fallbackCatalog[id],
          isSoldOut: fallbackCatalog[id]?.isSoldOut || id === '00000000-0000-0000-0000-000000000005'
        };
      }

      // Smart dynamic fallback
      return {
        id: id || '00000000-0000-0000-0000-000000000001',
        name: 'Bộ đôi Bàn phím cơ Apex Pro + Chuột Gaming Prime',
        price: 3490000,
        originalPrice: 5900000,
        imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600',
        description: 'Sản phẩm công nghệ chính hãng FlashShop phân phối, bảo hành 1-đổi-1 toàn quốc 12 tháng.',
        isSoldOut: id === '00000000-0000-0000-0000-000000000005'
      };
    },
    enabled: !!id
  });

  const handleAddToCart = () => {
    if (!product || product.isSoldOut) return;
    addItem({
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      imageUrl: product.imageUrl,
      quantity
    });
    toast.success(`Đã thêm ${quantity} x ${product.name} vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    if (!product || product.isSoldOut) return;
    handleAddToCart();
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#FF1E27]" size={40} />
      </div>
    );
  }

  return (
    <div className="pb-16 max-w-6xl mx-auto space-y-8 text-white">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-[#8E92B2] hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft size={18} /> Quay lại
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-[#0D0D16] red-card-border p-8 md:p-12 rounded-3xl relative overflow-hidden">
        {product.isSoldOut && (
          <div className="absolute top-6 right-6 bg-[#FF1E27] text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest z-30 shadow-lg animate-pulse">
            ĐÃ BÁN HẾT 100% (CHÁY HÀNG)
          </div>
        )}

        {/* Product Image */}
        <div className="flex justify-center items-center p-8 bg-[#08080E] rounded-2xl border border-[#1E1E2E] relative">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              t.onerror = null;
              t.src = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600';
            }}
            className={`max-h-96 object-contain transition-transform duration-300 ${product.isSoldOut ? 'grayscale opacity-60' : 'hover:scale-105'}`}
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF1E27]/15 border border-[#FF1E27]/30 text-[#FF1E27] text-xs font-extrabold uppercase">
              <Zap size={14} className="fill-[#FF1E27]" />
              <span>SẢN PHẨM CHÍNH HÃNG 100%</span>
            </div>

            <h1 className="text-3xl font-extrabold text-white leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <span className="font-extrabold text-white">5.0</span>
              <span className="text-[#8E92B2]">(184 đánh giá từ khách hàng)</span>
            </div>

            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-black text-[#FF1E27] tracking-tight">
                {formatVND(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-[#8E92B2] line-through font-medium">
                  {formatVND(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-[#8E92B2] text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="space-y-6 pt-6 border-t border-[#1E1E2E]">
            {/* Quantity Selector & Stock Status */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-white">Số lượng:</span>
              <div className="flex items-center border border-[#232338] rounded-xl bg-[#121220]">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={product.isSoldOut}
                  className="p-2.5 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 font-bold text-white text-sm">{product.isSoldOut ? 0 : quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={product.isSoldOut}
                  className="p-2.5 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                </button>
              </div>

              {product.isSoldOut ? (
                <span className="text-xs text-[#FF1E27] font-bold ml-2">✕ Đã cháy hàng (Hết hàng trong kho)</span>
              ) : (
                <span className="text-xs text-emerald-400 font-bold ml-2">✓ Còn hàng trong kho</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={product.isSoldOut}
                className={`py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                  product.isSoldOut
                    ? 'bg-[#1F1F30] text-[#5A5E7A] cursor-not-allowed border border-[#232338]'
                    : 'bg-[#121220] hover:bg-[#1E1E30] border border-[#232338] hover:border-[#FF1E27] text-white active:scale-95 shadow-md'
                }`}
              >
                <ShoppingBag size={18} /> {product.isSoldOut ? 'Hàng Đã Hết' : 'Thêm Vào Giỏ Hàng'}
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={product.isSoldOut}
                className={`py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                  product.isSoldOut
                    ? 'bg-[#1F1F30] text-[#5A5E7A] cursor-not-allowed border border-[#232338]'
                    : 'bg-gradient-to-r from-[#FF1E27] to-[#E02424] hover:opacity-90 text-white active:scale-95 shadow-[0_5px_20px_rgba(255,30,39,0.4)]'
                }`}
              >
                <Zap size={18} className={product.isSoldOut ? 'fill-[#5A5E7A]' : 'fill-white'} />
                {product.isSoldOut ? 'Đã Cháy Hàng' : 'Mua Ngay Tức Thì'}
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#1E1E2E] text-xs text-[#8E92B2] text-center">
              <div className="flex flex-col items-center gap-1.5">
                <Truck size={20} className="text-[#FF1E27]" />
                <span>Giao hàng miễn phí</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck size={20} className="text-[#FF1E27]" />
                <span>Bảo hành 12 tháng</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RotateCcw size={20} className="text-[#FF1E27]" />
                <span>Đổi trả trong 7 ngày</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
