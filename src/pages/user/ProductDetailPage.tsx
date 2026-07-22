import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Star, ShieldCheck, Truck, RotateCcw, Minus, Plus, Loader2, ArrowLeft, Zap, Check } from 'lucide-react';
import { getProductById, getProducts } from '../../api/catalog.api';
import { useCartStore } from '../../stores/useCartStore';
import toast from 'react-hot-toast';
import { formatVND } from './HomePage';

// Fallback product catalog map for offline or static seed IDs matching seed data 100%
const fallbackCatalog: Record<string, any> = {
  'seed-1': {
    id: 'seed-1',
    name: 'iPhone 17 Pro 256GB',
    price: 33990000,
    originalPrice: 34990000,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
    description: 'iPhone 17 Pro 256GB với thiết kế nguyên khối Titanium, chip A19 Pro siêu mạnh mẽ và hệ thống camera Pro đỉnh cao.'
  },
  'seed-2': {
    id: 'seed-2',
    name: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên',
    price: 29990000,
    originalPrice: 34990000,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
    description: 'iPhone 15 Pro Max 256GB với khung vỏ Titan chuẩn hàng không vũ trụ, chip A17 Pro và camera zoom quang học 5x.'
  },
  'seed-3': {
    id: 'seed-3',
    name: 'Samsung Galaxy S24 Ultra 512GB',
    price: 31990000,
    originalPrice: 37490000,
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800',
    description: 'Samsung Galaxy S24 Ultra 512GB tích hợp trí tuệ nhân tạo Galaxy AI, camera 200MP và màn hình QHD+ 120Hz siêu sáng.'
  },
  'seed-4': {
    id: 'seed-4',
    name: 'MacBook Pro 16 inch M3 Max 36GB/1TB',
    price: 89990000,
    originalPrice: 99990000,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    description: 'MacBook Pro 16 inch M3 Max quái thú hiệu năng dành cho lập trình viên, chuyên gia dựng phim và thiết kế đồ họa 3D.'
  },
  '00000000-0000-0000-0000-000000000001': {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Bộ Đôi Bàn Phím Cơ Apex Pro + Chuột Gaming Prime',
    price: 2890000,
    originalPrice: 4500000,
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
    description: 'Bộ đôi Bàn phím cơ Apex Pro switch OmniPoint tùy chỉnh hành trình phím và chuột siêu nhẹ Prime mang lại hiệu năng thi đấu đỉnh cao.'
  }
};

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const passedProduct = location.state?.product;

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('cam');
  const [selectedStorage, setSelectedStorage] = useState('256 GB');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const addItem = useCartStore((state) => state.addItem);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;

      // 1. Check if passedProduct in location.state matches the requested URL id
      if (passedProduct && (passedProduct.id === id || passedProduct.productId === id || passedProduct.code === id)) {
        const rawPrice = Number(passedProduct.price || passedProduct.unitPrice) || 33990000;
        const convertedPrice = rawPrice < 10000 ? rawPrice * 25000 : rawPrice;
        return {
          id: passedProduct.id || id,
          name: passedProduct.name || passedProduct.productName || 'Sản Phẩm FlashShop',
          price: convertedPrice,
          originalPrice: passedProduct.originalPrice ? Number(passedProduct.originalPrice) : Math.round(convertedPrice * 1.2),
          imageUrl: passedProduct.imageUrl || passedProduct.image || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
          description: passedProduct.description || `${passedProduct.name || 'Sản phẩm'} chính hãng FlashShop phân phối, bảo hành 1-đổi-1 toàn quốc 12 tháng.`,
          isSoldOut: passedProduct.isSoldOut || false
        };
      }

      // 2. Try fetching directly from Backend API getProductById(id)
      try {
        const res: any = await getProductById(id);
        const data = res?.data || res;
        if (data && (data.id || data.name)) {
          const rawPrice = Number(data.price || data.unitPrice) || 33990000;
          const convertedPrice = rawPrice < 10000 ? rawPrice * 25000 : rawPrice;
          return {
            id: data.id || id,
            name: data.name || data.productName || 'Thiết Bị Công Nghệ Chính Hãng',
            price: convertedPrice,
            originalPrice: data.originalPrice ? Number(data.originalPrice) : Math.round(convertedPrice * 1.2),
            imageUrl: data.imageUrl || data.image || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
            description: data.description || `${data.name || 'Sản phẩm'} chính hãng FlashShop phân phối, bảo hành 1-đổi-1 toàn quốc 12 tháng.`,
            isSoldOut: data.isSoldOut || false
          };
        }
      } catch (err) {
        // Continue to search in products list API
      }

      // 3. Try searching product in list API getProducts(1, 100)
      try {
        const listRes: any = await getProducts(1, 100);
        const items = listRes?.items || listRes?.data || (Array.isArray(listRes) ? listRes : []);
        const found = items.find((p: any) => p.id === id || p.productId === id || p.code === id);
        if (found) {
          const rawPrice = Number(found.price || found.unitPrice) || 33990000;
          const convertedPrice = rawPrice < 10000 ? rawPrice * 25000 : rawPrice;
          return {
            id: found.id || found.productId || id,
            name: found.name || found.productName,
            price: convertedPrice,
            originalPrice: found.originalPrice ? Number(found.originalPrice) : Math.round(convertedPrice * 1.2),
            imageUrl: found.imageUrl || found.image || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
            description: found.description || `${found.name} chính hãng FlashShop phân phối, bảo hành 12 tháng.`,
            isSoldOut: found.isSoldOut || false
          };
        }
      } catch (e) {
        // Quiet fallback
      }

      // 4. Check fallback catalog dictionary by ID
      if (id && fallbackCatalog[id]) {
        return fallbackCatalog[id];
      }

      // 5. Dynamic fallback matching requested ID
      return {
        id: id,
        name: passedProduct?.name || 'Sản Phẩm Công Nghệ FlashShop',
        price: passedProduct?.price || 15990000,
        originalPrice: passedProduct?.originalPrice || 18990000,
        imageUrl: passedProduct?.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
        description: 'Sản phẩm công nghệ chính hãng FlashShop phân phối, bảo hành 1-đổi-1 toàn quốc 12 tháng.',
        isSoldOut: false
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

  if (isLoading && !product) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#FF1E27]" size={40} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-white space-y-4">
        <h2 className="text-2xl font-bold">Sản phẩm không tồn tại</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#FF1E27] rounded-xl text-white font-bold">
          Trở về Trang Chủ
        </button>
      </div>
    );
  }

  // Active Main Photo
  const mainImage = selectedImage || product.imageUrl;

  // Gallery Thumbnails
  const galleryThumbnails = [
    product.imageUrl,
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800'
  ];

  // Check if product is a Phone
  const isPhone = (() => {
    const name = product.name.toLowerCase();
    return (
      name.includes('phone') ||
      name.includes('iphone') ||
      name.includes('galaxy s') ||
      name.includes('pixel') ||
      name.includes('xiaomi') ||
      name.includes('oppo') ||
      name.includes('vivo') ||
      name.includes('oneplus') ||
      name.includes('redmagic') ||
      name.includes('poco') ||
      name.includes('find x') ||
      name.includes('magic') ||
      name.includes('xperia')
    );
  })();

  return (
    <div className="pb-16 max-w-6xl mx-auto space-y-8 text-white">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-[#8E92B2] hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft size={18} /> Quay lại
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left: Product Image Gallery */}
        <div className="space-y-4">
          {/* Large Main Photo Box */}
          <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#18182E] via-[#0D0D16] to-[#08080E] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center p-4 group">
            {product.isSoldOut && (
              <div className="absolute top-4 right-4 bg-[#FF1E27] text-white text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider z-10 shadow-lg">
                Cháy Hàng
              </div>
            )}

            <img 
              src={mainImage} 
              alt={product.name} 
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.onerror = null;
                t.src = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800';
              }}
              className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 shadow-2xl" 
            />
          </div>

          {/* 4 Interactive Gallery Thumbnails */}
          <div className="grid grid-cols-4 gap-3">
            {galleryThumbnails.map((thumb, idx) => {
              const isSelected = (selectedImage || product.imageUrl) === thumb;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(thumb)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-[#0D0D16] p-1 ${
                    isSelected ? 'border-[#FF1E27] scale-105 shadow-[0_0_15px_rgba(255,30,39,0.5)]' : 'border-white/10 hover:border-white/40'
                  }`}
                >
                  <img 
                    src={thumb} 
                    alt={`Góc xem ${idx + 1}`} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF1E27]/10 border border-[#FF1E27]/30 text-[#FF1E27] text-xs font-extrabold uppercase tracking-wider">
              <Zap size={14} className="fill-[#FF1E27]" />
              <span>Chính Hãng FlashShop VN/A</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center text-amber-400 gap-1">
                <Star size={16} fill="currentColor" />
                <span className="font-bold text-white">5.0</span>
              </div>
              <span className="text-[#8E92B2]">|</span>
              <span className="text-[#8E92B2]">Đã bán 340+ sản phẩm</span>
            </div>

            {/* Pricing Container */}
            <div className="p-5 rounded-2xl bg-[#0D0D16] border border-[#232338] space-y-1 shadow-inner">
              <div className="text-xs font-bold text-[#8E92B2] uppercase tracking-wider">Giá ưu đãi Flash Sale</div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl lg:text-4xl font-black text-[#FF1E27] tracking-tight">{formatVND(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-sm text-[#8E92B2] line-through font-medium">{formatVND(product.originalPrice)}</span>
                )}
              </div>
            </div>

            {/* Product Description */}
            <p className="text-[#8E92B2] text-sm leading-relaxed">
              {product.description}
            </p>

            {/* Interactive Color Selection */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-[#8E92B2] uppercase tracking-wider block">Màu sắc sản phẩm:</label>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedColor('trang')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                    selectedColor === 'trang' ? 'border-[#FF1E27] bg-[#FF1E27]/10 text-white' : 'border-[#232338] bg-[#0D0D16] text-[#8E92B2]'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-300" />
                  <span>Trắng Titanium</span>
                </button>
                <button 
                  onClick={() => setSelectedColor('den')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                    selectedColor === 'den' ? 'border-[#FF1E27] bg-[#FF1E27]/10 text-white' : 'border-[#232338] bg-[#0D0D16] text-[#8E92B2]'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600" />
                  <span>Titanium Đen</span>
                </button>
                <button 
                  onClick={() => setSelectedColor('cam')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                    selectedColor === 'cam' ? 'border-[#FF1E27] bg-[#FF1E27]/10 text-white' : 'border-[#232338] bg-[#0D0D16] text-[#8E92B2]'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-amber-600 border border-amber-500" />
                  <span>Cam Titan</span>
                </button>
              </div>
            </div>

            {/* Storage Selection ONLY for Phones */}
            {isPhone && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-[#8E92B2] uppercase tracking-wider block">Dung lượng lưu trữ:</label>
                <div className="grid grid-cols-3 gap-3">
                  {['256 GB', '512 GB', '1 TB'].map((size) => {
                    const isSelected = selectedStorage === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedStorage(size)}
                        className={`relative py-3 px-2 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center ${
                          isSelected 
                            ? 'border-[#FF1E27] text-white bg-[#FF1E27]/20 shadow-md' 
                            : 'border-[#232338] text-[#8E92B2] bg-[#0D0D16] hover:bg-white/5'
                        }`}
                      >
                        <span>{size}</span>
                        {isSelected && (
                          <div className="absolute top-0 right-0 w-4 h-4 bg-[#FF1E27] rounded-bl-lg rounded-tr-md flex items-center justify-center text-white text-[8px]">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Quantity Controls & Purchase Buttons */}
          <div className="space-y-4 pt-4 border-t border-[#1E1E2E]">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#8E92B2] uppercase tracking-wider">Số lượng:</span>
              <div className="flex items-center border border-[#232338] bg-[#0D0D16] rounded-xl overflow-hidden">
                <button 
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 hover:bg-white/10 text-white transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="px-5 font-extrabold text-sm text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2.5 hover:bg-white/10 text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.isSoldOut}
                className="w-full py-4 rounded-2xl border border-[#FF1E27] bg-[#FF1E27]/10 hover:bg-[#FF1E27] text-white font-extrabold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shadow-md"
              >
                <ShoppingBag size={18} />
                <span>Thêm Vào Giỏ</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.isSoldOut}
                className="w-full py-4 rounded-2xl bg-[#FF1E27] hover:bg-[#E02424] text-white font-extrabold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_10px_35px_rgba(255,30,39,0.45)] active:scale-95 disabled:opacity-50"
              >
                <span>Mua Ngay</span>
              </button>
            </div>

            {/* Value Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-[#8E92B2] font-semibold">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#FF1E27]" />
                <span>100% Chính hãng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck size={14} className="text-[#FF1E27]" />
                <span>Freeship toàn quốc</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw size={14} className="text-[#FF1E27]" />
                <span>1 Đổi 1 trong 30 ngày</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductDetailPage;
