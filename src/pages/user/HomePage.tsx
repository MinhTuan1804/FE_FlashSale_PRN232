import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Zap, ShoppingBag, ChevronLeft, ChevronRight, ArrowRight, Star, Tag, Check, Copy, 
  Truck, Cpu, Battery, Layers, Quote, MessageSquare, Bell, Clock
} from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import toast from 'react-hot-toast';
import { getProducts, getCategories, getActiveFlashSales, getTestimonials, type TestimonialItem } from '../../api/catalog.api';
import heroVideo from '../../assets/videos/Cinematic_K_photorealistic_D.mp4';

export interface ProductItem {
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
  stockSold?: number;
  stockTotal?: number;
  time?: { hours: number; minutes: number; seconds: number };
  label?: string;
}

export const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
};

// Color Swatches Palettes for Randomized Per-Product Colors
const COLOR_PALETTES = [
  [
    { hex: '#e3e4e5', label: 'Trắng Titanium' },
    { hex: '#3b444c', label: 'Titan Đen' },
    { hex: '#c07e3a', label: 'Cam Titan' }
  ],
  [
    { hex: '#f0f1f5', label: 'Bạc Starlight' },
    { hex: '#1c2635', label: 'Xanh Midnight' },
    { hex: '#5e5061', label: 'Tím Deep Purple' }
  ],
  [
    { hex: '#f5f0eb', label: 'Vàng Gold' },
    { hex: '#2c3539', label: 'Xám Không Gian' },
    { hex: '#2e5b88', label: 'Xanh Pacific' }
  ],
  [
    { hex: '#e8e8e8', label: 'Trắng Ngọc Trai' },
    { hex: '#0f141a', label: 'Đen Phantom' },
    { hex: '#800020', label: 'Đỏ Đô Cyber' }
  ]
];

// Dark OLED Flash Sale Product Card Component
const RichFlashSaleProductCard = ({ 
  product, 
  onAddToCart 
}: { 
  product: ProductItem; 
  onAddToCart: (p: ProductItem, e: React.MouseEvent) => void 
}) => {
  // Deterministic color palette hash per product
  const paletteIndex = Math.abs(
    (product.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % COLOR_PALETTES.length;

  const colorPalette = COLOR_PALETTES[paletteIndex];
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState('256 GB');

  const origPrice = product.originalPrice || product.price + 1000000;
  const discountAmount = Math.max(origPrice - product.price, 1000000);

  // Check if product is a Phone (Storage Capacity Selectors only apply to phones, NOT laptops)
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
      name.includes('xperia') ||
      name.includes('gt5') ||
      name.includes('x100')
    );
  })();

  return (
    <div className="bg-[#0D0D16] text-white red-card-border rounded-3xl p-4 flex flex-col justify-between w-[260px] flex-shrink-0 relative group hover:-translate-y-1 transition-all duration-300 shadow-xl">
      
      {/* Clickable Area Navigating to Product Detail Page */}
      <Link to={`/products/${product.id}`} state={{ product }} className="block group/link">
        
        {/* Main Product Image Container */}
        <div className="relative mb-3.5 overflow-hidden rounded-2xl bg-[#121220] aspect-[4/3] w-full border border-white/10 shadow-inner group/img flex items-center justify-center">
          {product.badge && (
            <span className="absolute top-2 left-2 bg-[#FF1E27]/80 border border-[#FF1E27] text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider z-10 backdrop-blur-md shadow-md">
              {product.badge}
            </span>
          )}

          <img 
            src={product.imageUrl} 
            alt={product.name}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800';
            }} 
            className="w-full h-full object-cover group-hover/link:scale-108 transition-transform duration-500"
          />
        </div>

        {/* Pricing Block */}
        <div className="space-y-0.5">
          {/* Original Price */}
          <div className="text-xs text-[#8E92B2] line-through font-medium">
            {formatVND(origPrice)}
          </div>

          {/* Flash Sale Price */}
          <div className="text-xl font-black text-[#FF1E27] tracking-tight leading-tight">
            {formatVND(product.price)}
          </div>

          {/* Savings Amount */}
          <div className="text-xs font-bold text-emerald-400">
            Giảm {formatVND(discountAmount)}
          </div>

          {/* Countdown / Time remaining */}
          <div className="text-[10px] text-[#8E92B2] font-medium pt-0.5">
            Còn 09 ngày 03:18:28
          </div>
        </div>

        {/* Product Title */}
        <h3 className="font-extrabold text-white text-sm mt-2 line-clamp-1 group-hover/link:text-[#FF1E27] transition-colors">
          {product.name}
        </h3>
      </Link>

      {/* Controls & Action Area */}
      <div>
        {/* Randomized Color Swatches per Product */}
        <div className="flex items-center gap-2 mt-2.5">
          {colorPalette.map((color, idx) => (
            <button 
              key={idx}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedColor(idx); }}
              style={{ backgroundColor: color.hex }}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                selectedColor === idx ? 'border-white scale-110 ring-2 ring-[#FF1E27]/60' : 'border-white/20'
              }`}
              title={color.label}
            />
          ))}
        </div>

        {/* Storage Selectors ONLY for Phones (Not Laptops) */}
        {isPhone && (
          <div className="grid grid-cols-3 gap-1.5 mt-2.5">
            {['256 GB', '512 GB', '1 TB'].map((size) => {
              const isSelected = selectedStorage === size;
              return (
                <button
                  key={size}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedStorage(size); }}
                  className={`relative py-1 px-1 rounded-xl text-[10px] font-extrabold transition-all border ${
                    isSelected 
                      ? 'border-[#FF1E27] text-white bg-[#FF1E27]/20 shadow-xs' 
                      : 'border-[#232338] text-[#8E92B2] bg-[#121220] hover:bg-white/5'
                  }`}
                >
                  <span>{size}</span>
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#FF1E27] rounded-bl-lg rounded-tr-md flex items-center justify-center text-white text-[7px]">
                      <Check size={8} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={(e) => onAddToCart(product, e)}
          className="mt-3.5 w-full py-2.5 rounded-xl bg-[#121220] border border-[#232338] hover:border-[#FF1E27] hover:bg-[#FF1E27] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
        >
          <ShoppingBag size={14} />
          <span>MUA NGAY</span>
        </button>
      </div>
    </div>
  );
};

// Interactive Mouse Particle Effect Canvas for Hero Section
const HeroParticlesCanvas = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = containerRef.current.clientWidth);
    let height = (canvas.height = containerRef.current.clientHeight);

    const mouse = { x: -1000, y: -1000, radius: 180, clicking: false };

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleMouseDown = () => { mouse.clicking = true; };
    const handleMouseUp = () => { mouse.clicking = false; };

    const parent = containerRef.current;
    parent.addEventListener('mousemove', handleMouseMove);
    parent.addEventListener('mouseleave', handleMouseLeave);
    parent.addEventListener('mousedown', handleMouseDown);
    parent.addEventListener('mouseup', handleMouseUp);

    // Spawn burst on click
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      for (let b = 0; b < 12; b++) {
        const angle = (b / 12) * Math.PI * 2;
        const speed = Math.random() * 3 + 2;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2.5 + 1,
          color: burstColors[Math.floor(Math.random() * burstColors.length)],
          alpha: 1,
          life: 1,
          decay: Math.random() * 0.025 + 0.015,
          isBurst: true
        });
      }
    };
    parent.addEventListener('click', handleClick);

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      width = canvas.width = containerRef.current.clientWidth;
      height = canvas.height = containerRef.current.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#FF1E27', '#FFB800', '#A855F7', '#E02424', '#FF6B35', '#FF3366'];
    const burstColors = ['#FF1E27', '#FFB800', '#FF6B35', '#ffffff'];

    // Base particles
    const particleCount = 55;
    const particles: Array<{
      x: number; y: number;
      vx: number; vy: number;
      radius: number; color: string;
      alpha: number; life?: number;
      decay?: number; isBurst?: boolean;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.55 + 0.25
      });
    }

    // Orbiting ring particles for the cursor glow
    let pulseRadius = 0;
    let pulseAlpha = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw cursor glow ring when mouse inside
      if (mouse.x > 0 && mouse.y > 0) {
        const rampUp = mouse.clicking ? 1 : 0.6;
        const ringRadius = mouse.clicking ? 30 : 22;

        // Outer halo
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius * 0.5);
        grad.addColorStop(0, 'rgba(255,30,39,0.07)');
        grad.addColorStop(1, 'rgba(255,30,39,0)');
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Inner ring
        ctx.save();
        ctx.globalAlpha = rampUp * 0.7;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = mouse.clicking ? '#FFB800' : '#FF1E27';
        ctx.lineWidth = mouse.clicking ? 2 : 1.2;
        ctx.shadowBlur = 14;
        ctx.shadowColor = mouse.clicking ? '#FFB800' : '#FF1E27';
        ctx.stroke();
        ctx.restore();

        // Pulse on click
        if (mouse.clicking) {
          pulseRadius += 5;
          pulseAlpha = Math.max(0, 0.5 - pulseRadius / 120);
          ctx.save();
          ctx.globalAlpha = pulseAlpha;
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = '#FFB800';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
          if (pulseRadius > 120) pulseRadius = 0;
        }
      }

      // Render & update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Decay burst particles
        if (p.isBurst) {
          p.life = (p.life ?? 1) - (p.decay ?? 0.02);
          p.alpha = p.life ?? 0;
          if ((p.life ?? 0) <= 0) { particles.splice(i, 1); continue; }
          p.vx *= 0.96;
          p.vy *= 0.96;
        } else {
          // Mouse repel/attract physics
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius && dist > 0) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);

            if (mouse.clicking) {
              // Attract on click
              p.vx += Math.cos(angle) * force * 0.6;
              p.vy += Math.sin(angle) * force * 0.6;
            } else {
              // Repel on hover
              p.vx -= Math.cos(angle) * force * 0.35;
              p.vy -= Math.sin(angle) * force * 0.35;
            }
          }

          // Speed limit
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          const maxSpeed = 2.5;
          if (speed > maxSpeed) {
            p.vx = (p.vx / speed) * maxSpeed;
            p.vy = (p.vy / speed) * maxSpeed;
          }

          // Velocity damping
          p.vx *= 0.98;
          p.vy *= 0.98;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap particles at edges
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Particle glow dot
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = p.isBurst ? 16 : 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        // Bright center core
        ctx.globalAlpha = p.alpha * 0.8;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Mouse attraction constellation lines
        if (!p.isBurst) {
          const dx2 = mouse.x - p.x;
          const dy2 = mouse.y - p.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          if (dist2 < mouse.radius) {
            const lineAlpha = (1 - dist2 / mouse.radius) * 0.65;
            const lineGrad = ctx.createLinearGradient(p.x, p.y, mouse.x, mouse.y);
            lineGrad.addColorStop(0, p.color);
            lineGrad.addColorStop(1, mouse.clicking ? '#FFB800' : '#FF1E27');
            ctx.save();
            ctx.globalAlpha = lineAlpha;
            ctx.strokeStyle = lineGrad;
            ctx.lineWidth = mouse.clicking ? 1.2 : 0.8;
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#FF1E27';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            ctx.restore();
          }

          // Particle-to-particle constellation
          for (let j = i + 1; j < Math.min(i + 12, particles.length); j++) {
            const p2 = particles[j];
            if (p2.isBurst) continue;
            const pdx = p.x - p2.x;
            const pdy = p.y - p2.y;
            const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
            if (pDist < 90) {
              ctx.save();
              ctx.strokeStyle = p.color;
              ctx.globalAlpha = (1 - pDist / 90) * 0.18;
              ctx.lineWidth = 0.6;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseleave', handleMouseLeave);
      parent.removeEventListener('mousedown', handleMouseDown);
      parent.removeEventListener('mouseup', handleMouseUp);
      parent.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-1 overflow-hidden rounded-3xl" />;
};

const HomePage = () => {
  const addItem = useCartStore((state) => state.addItem);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Hero Container Ref for Particle Mouse Interactions
  const heroContainerRef = useRef<HTMLDivElement>(null);

  // Carousel Scroll Refs for interactive < > arrow buttons
  const electronicScrollRef = useRef<HTMLDivElement>(null);
  const upcomingScrollRef = useRef<HTMLDivElement>(null);
  const bestsellingScrollRef = useRef<HTMLDivElement>(null);
  const testimonialsScrollRef = useRef<HTMLDivElement>(null);

  // Fetch Testimonials from Backend API
  const { data: testimonials = [] } = useQuery<TestimonialItem[]>({
    queryKey: ['testimonials'],
    queryFn: getTestimonials
  });

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 320;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Real-time Countdown Timer for Hero
  const [heroTime, setHeroTime] = useState({ hours: 2, minutes: 45, seconds: 18 });
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
          return { hours: 2, minutes: 45, seconds: 18 };
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

  // Dynamic state loaded from Backend Seed Data
  const [beProducts, setBeProducts] = useState<ProductItem[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<ProductItem[]>([]);

  // Fetch real product data & active flash sale data from Backend API
  useEffect(() => {
    const fetchSeedCatalog = async () => {
      try {
        const [prodRes, saleRes] = await Promise.allSettled([
          getProducts(1, 100),
          getCategories(),
          getActiveFlashSales()
        ]);

        // Parse products from BE
        if (prodRes.status === 'fulfilled' && prodRes.value) {
          const val = prodRes.value as any;
          const items = val.items || val.data || (Array.isArray(val) ? val : []);
          if (Array.isArray(items) && items.length > 0) {
            const mapped = items.map((p: any) => {
              const rawPrice = Number(p.price || p.unitPrice) || 34990000;
              const convertedPrice = rawPrice < 10000 ? rawPrice * 25000 : rawPrice;
              return {
                id: p.id || p.productId,
                name: p.name || p.productName || 'iPhone 17 Pro 256GB',
                price: convertedPrice > 30000000 ? convertedPrice - 1000000 : convertedPrice,
                originalPrice: convertedPrice >= 30000000 ? convertedPrice : Math.round(convertedPrice * 1.3),
                imageUrl: p.imageUrl || p.image || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
                badge: p.badge || 'Chính hãng',
                rating: p.rating || 5.0,
                reviews: p.reviewsCount || 180
              };
            });
            setBeProducts(mapped);
          }
        }

        // Parse Active Flash Sales from BE Seed Data
        if (saleRes.status === 'fulfilled' && saleRes.value) {
          const val = saleRes.value as any;
          const campaigns = Array.isArray(val) ? val : (val.items || val.data || []);
          if (campaigns.length > 0) {
            const activeCampaign = campaigns[0];
            const items = activeCampaign.items || activeCampaign.flashSaleItems || [];
            if (items.length > 0) {
              const mappedSale = items.map((item: any) => {
                const p = item.product || {};
                const salePrice = Number(item.flashSalePrice || item.price) || 33990000;
                const origPrice = p.price ? Number(p.price) : 34990000;
                return {
                  id: p.id || item.productId || Guid(),
                  name: p.name || item.productName || 'iPhone 17 Pro 256GB',
                  price: salePrice < 10000 ? salePrice * 25000 : salePrice,
                  originalPrice: origPrice < 10000 ? origPrice * 25000 : origPrice,
                  imageUrl: p.imageUrl || item.imageUrl || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
                  stockSold: item.soldQuantity || 12,
                  stockTotal: item.flashSaleQuantity || 50,
                  badge: 'FLASH SALE'
                };
              });
              setFlashSaleProducts(mappedSale);
            }
          }
        }
      } catch (err) {
        console.warn('Backend API connection notice, using localized seed dataset:', err);
      }
    };

    fetchSeedCatalog();
  }, []);

  function Guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

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

  // Seed Data Fallback Catalogs (Matching Backend DataSeeder.cs 100%)
  const seedProductsCatalog: ProductItem[] = [
    {
      id: 'seed-1',
      name: 'iPhone 17 Pro 256GB',
      price: 33990000,
      originalPrice: 34990000,
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
      badge: 'Chính hãng VN/A',
      rating: 5.0,
      reviews: 320,
      isNew: true
    },
    {
      id: 'seed-2',
      name: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên',
      price: 29990000,
      originalPrice: 34990000,
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
      badge: 'Chính hãng VN/A',
      rating: 5.0,
      reviews: 320
    },
    {
      id: 'seed-3',
      name: 'Samsung Galaxy S24 Ultra 512GB',
      price: 31990000,
      originalPrice: 37490000,
      imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800',
      badge: 'Galaxy AI',
      rating: 4.9,
      reviews: 210
    },
    {
      id: 'seed-4',
      name: 'MacBook Pro 16 inch M3 Max 36GB/1TB',
      price: 89990000,
      originalPrice: 99990000,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
      badge: 'M3 Max Ultra',
      rating: 5.0,
      reviews: 94
    }
  ];

  const seedUpcomingProducts: ProductItem[] = [
    {
      id: 'upcoming-1',
      name: 'iPad Pro 13 inch M4 Wifi 256GB',
      price: 31990000,
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800',
      time: upcomingTime1,
      label: 'Thời gian mở bán'
    },
    {
      id: 'upcoming-2',
      name: 'Apple Watch Ultra 2 Titanium 49mm',
      price: 19990000,
      imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&q=80&w=800',
      time: upcomingTime2,
      label: 'Đếm ngược đợt 2'
    },
    {
      id: 'upcoming-3',
      name: 'AirPods Pro 2nd Gen USB-C',
      price: 5990000,
      imageUrl: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&q=80&w=800',
      time: upcomingTime3,
      label: 'Sắp ra mắt'
    },
    {
      id: 'upcoming-4',
      name: 'Robot Hút Bụi Roborock S8 MaxV Ultra',
      price: 31990000,
      imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800',
      time: upcomingTime4,
      label: 'Thời gian mở bán'
    }
  ];

  const seedBestsellingGear: ProductItem[] = [
    {
      id: 'bestsell-1',
      name: 'AirPods Pro 2nd Gen USB-C',
      price: 5990000,
      originalPrice: 6990000,
      imageUrl: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&q=80&w=800',
      badge: 'Chính hãng VN/A',
      rating: 5.0,
      reviews: 412
    },
    {
      id: 'bestsell-2',
      name: 'Bàn Phím Cơ Keychron Q1 Max Wireless',
      price: 4990000,
      originalPrice: 5990000,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800',
      badge: 'Hot Swap PBT',
      rating: 4.9,
      reviews: 280
    },
    {
      id: 'bestsell-3',
      name: 'Chuột Logitech MX Master 3S Quiet',
      price: 2390000,
      originalPrice: 2990000,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800',
      badge: 'Silent Clicks',
      rating: 5.0,
      reviews: 510
    },
    {
      id: 'bestsell-4',
      name: 'Sony WH-1000XM5 Chống Ồn Cao Cấp',
      price: 8490000,
      originalPrice: 9990000,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
      badge: 'Hi-Res Audio',
      rating: 5.0,
      reviews: 310
    }
  ];

  // Dynamic arrays from BE API seed data
  const displayElectronicProducts = beProducts.length >= 4 ? beProducts.slice(0, 8) : seedProductsCatalog;
  const displayFlashSaleProducts = flashSaleProducts.length > 0 ? flashSaleProducts : displayElectronicProducts.slice(0, 4);
  const displayBestsellingGear = beProducts.length >= 4 ? beProducts.slice(4, 8) : seedBestsellingGear;

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

  const heroFeaturedProduct: ProductItem = {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Bộ Đôi Bàn Phím Cơ Apex Pro + Chuột Gaming Prime',
    price: 2890000,
    originalPrice: 4500000,
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
    badge: 'SIÊU SALE BÙNG NỔ'
  };

  return (
    <div className="space-y-16 pb-16 bg-transparent text-white">

      {/* ─── 1. HERO SECTION ─── */}
      <section ref={heroContainerRef} className="relative rounded-3xl overflow-hidden border border-[#1f1625] p-6 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 group min-h-[640px]">
        {/* Interactive Mouse Particle Canvas */}
        <HeroParticlesCanvas containerRef={heroContainerRef} />

        {/* Ambient Radial Gradient Mesh Backdrops */}
        <div className="absolute inset-0 bg-[#0D0D16]/80 backdrop-blur-md z-0" />
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
            Danh mục <span className="mx-1">&gt;</span> Flash Sale Seed Catalog
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

          <p className="text-[#8E92B2] text-sm md:text-base font-medium line-clamp-1">
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
              Số lượng ưu đãi: <span className="text-white">Đã bán 12/50 ({formatVND(heroFeaturedProduct.price)})</span>
            </div>
          </div>

          {/* Nested CTA Button */}
          <div className="pt-2">
            <Link 
              to={`/products/${heroFeaturedProduct.id}`}
              state={{ product: heroFeaturedProduct }}
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
              <span>{heroFeaturedProduct.name}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. THIẾT BỊ ĐIỆN TỬ & GAMING (DARK OLED FLASH SALE CARDS) ─── */}
      <section className="bg-[#0D0D16]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-[#FF1E27] uppercase tracking-wider block mb-1">Thiết Bị Nổi Bật</span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Sản Phẩm Flash Sales Đầy Đủ Thông Tin</h2>
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

        {/* Rich Flash Sale Cards Horizontal Carousel Container */}
        <div ref={electronicScrollRef} className="flex overflow-x-auto no-scrollbar gap-5 pb-4 scroll-smooth">
          {displayFlashSaleProducts.map((product) => (
            <RichFlashSaleProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>

      {/* ─── 3. SẮP DIỄN RA SECTION ─── */}
      <section className="bg-[#0D0D16]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
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
          {seedUpcomingProducts.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              state={{ product }}
              className="flex-shrink-0 w-[260px] bg-[#0D0D16] red-card-border p-4 rounded-3xl flex flex-col justify-between relative group hover:-translate-y-1 transition-all duration-300 shadow-xl"
            >
              <div>
                {/* Main Image Box with Glassmorphism Overlay Countdown Badge */}
                <div className="relative mb-3.5 overflow-hidden rounded-2xl bg-[#121220] aspect-[4/3] w-full border border-white/10 shadow-inner group/img flex items-center justify-center">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.onerror = null;
                      t.src = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800';
                    }}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />

                  {/* Glassmorphic Overlay Countdown Badge */}
                  {product.time && (
                    <div className="absolute bottom-2 left-2 right-2 bg-[#0D0D16]/90 backdrop-blur-md border border-[#FF1E27]/40 rounded-xl px-2.5 py-1.5 flex items-center justify-between shadow-lg z-10">
                      <div className="flex items-center gap-1 text-[9px] font-extrabold text-[#FF1E27] uppercase tracking-wider">
                        <Clock size={12} className="animate-pulse" />
                        <span>Mở bán trong</span>
                      </div>
                      <span className="font-mono text-xs font-black text-white tracking-wider">
                        {formatDigit(product.time.hours)}:{formatDigit(product.time.minutes)}:{formatDigit(product.time.seconds)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Title */}
                <h3 className="font-extrabold text-white text-sm line-clamp-2 h-10 group-hover:text-[#FF1E27] transition-colors leading-snug">
                  {product.name}
                </h3>
              </div>

              {/* Price & Interactive Action Button */}
              <div className="pt-3 border-t border-[#1E1E2E] flex items-center justify-between mt-2">
                <div>
                  {product.originalPrice && (
                    <span className="text-[11px] text-[#8E92B2] line-through block font-medium">
                      {formatVND(product.originalPrice)}
                    </span>
                  )}
                  <span className="text-lg font-black text-[#FF1E27] tracking-tight">{formatVND(product.price)}</span>
                </div>

                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toast.success(`Đã đăng ký nhận thông báo Flash Sale cho ${product.name}!`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#FF1E27]/15 hover:bg-[#FF1E27] border border-[#FF1E27]/40 text-[#FF1E27] hover:text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 active:scale-95 shadow-md"
                  title="Nhận thông báo khi mở bán"
                >
                  <Bell size={12} />
                  <span>Nhắc Tôi</span>
                </button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 4. TOP PHỤ KIỆN GAMING BÁN CHẠY ─── */}
      <section className="bg-[#0D0D16]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
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
              state={{ product }}
              className="flex-shrink-0 w-[260px] bg-[#0D0D16] red-card-border p-4 rounded-2xl flex flex-col justify-between relative group hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="relative mb-4 overflow-hidden rounded-xl bg-[#121220] aspect-[4/3] w-full border border-white/10 shadow-inner">
                  <span className="absolute top-2 left-2 bg-[#FF1E27]/80 border border-[#FF1E27] text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider z-10 backdrop-blur-md shadow-md">
                    {product.badge || 'Chính hãng'}
                  </span>
                  
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.onerror = null;
                      t.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800';
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

      {/* ─── 5. ENGINEERED FOR PERFORMANCE BENTO GRID ─── */}
      <section className="bg-[#0D0D16]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        {/* Bento Grid Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Tối Ưu Cho <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Hiệu Năng Vượt Trội</span>
          </h2>
          <p className="text-xs md:text-sm text-[#8E92B2] font-medium">
            Tối ưu hóa hiệu năng & trải nghiệm mua sắm công nghệ đỉnh cao
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="doppelrand-card p-6 flex gap-4 items-start group">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 flex-shrink-0 group-hover:scale-110 transition-transform">
              <Cpu size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">Xử lý Siêu Tốc</h3>
              <p className="text-xs text-[#8E92B2] leading-relaxed">
                Hệ thống Microservices phản hồi dữ liệu thời gian thực tính bằng miligiây.
              </p>
            </div>
          </div>

          <div className="doppelrand-card p-6 flex gap-4 items-start group">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-400 flex-shrink-0 group-hover:scale-110 transition-transform">
              <Battery size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">Pin "Trâu" Suốt Ngày</h3>
              <p className="text-xs text-[#8E92B2] leading-relaxed">
                Thiết bị công nghệ chính hãng cam kết dung lượng pin chuẩn 100%.
              </p>
            </div>
          </div>

          <div className="doppelrand-card p-6 flex gap-4 items-start group">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-orange-400 flex-shrink-0 group-hover:scale-110 transition-transform">
              <Truck size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white group-hover:text-orange-300 transition-colors">Giao Hàng Siêu Tốc</h3>
              <p className="text-xs text-[#8E92B2] leading-relaxed">
                Giao hàng hỏa tốc trong 2 giờ nội thành, miễn phí vận chuyển đơn từ 500k.
              </p>
            </div>
          </div>

          <div className="doppelrand-card p-6 flex gap-4 items-start group">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400 flex-shrink-0 group-hover:scale-110 transition-transform">
              <Layers size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">Hệ điều hành Thông Minh</h3>
              <p className="text-xs text-[#8E92B2] leading-relaxed">
                Tích hợp ví điện tử FlashPay và hệ thống thông báo trạng thái đơn hàng tức thì.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. CUSTOMER TESTIMONIALS GLASSMORPHISM SLIDER ─── */}
      <section className="bg-[#0D0D16]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FF1E27] uppercase tracking-widest mb-1">
              <MessageSquare size={14} className="fill-[#FF1E27]" />
              <span>ĐÁNH GIÁ THỰC TẾ TỪ KHÁCH HÀNG</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Khách Hàng Nói Gì Về FlashShop?</h2>
          </div>

          {/* Interactive Scroll Controls */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => scrollContainer(testimonialsScrollRef, 'left')}
              className="w-9 h-9 rounded-full border border-[#232338] bg-[#0D0D16] hover:border-[#FF1E27] hover:bg-[#FF1E27]/15 text-[#8E92B2] hover:text-white flex items-center justify-center transition-all active:scale-90 shadow-md"
              title="Cuộn sang trái"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => scrollContainer(testimonialsScrollRef, 'right')}
              className="w-9 h-9 rounded-full border border-[#232338] bg-[#0D0D16] hover:border-[#FF1E27] hover:bg-[#FF1E27]/15 text-[#8E92B2] hover:text-white flex items-center justify-center transition-all active:scale-90 shadow-md"
              title="Cuộn sang phải"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Glassmorphic Testimonials Horizontal Scroll Slider */}
        <div 
          ref={testimonialsScrollRef}
          className="flex overflow-x-auto no-scrollbar gap-6 py-2 scroll-smooth"
        >
          {testimonials.map((t) => (
            <div 
              key={t.id}
              className="bg-gradient-to-b from-[#121220] via-[#0D0D16] to-[#08080E] border border-white/10 hover:border-[#FF1E27]/50 rounded-3xl p-6 w-[320px] md:w-[360px] flex-shrink-0 relative space-y-4 group transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Customer Info & Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={t.avatarUrl} 
                        alt={t.customerName} 
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#FF1E27]/40 p-0.5"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0D0D16] flex items-center justify-center text-[8px] text-white font-bold">
                        ✓
                      </div>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white group-hover:text-[#FF1E27] transition-colors">{t.customerName}</h4>
                      <p className="text-[10px] text-[#8E92B2] font-medium">{t.role}</p>
                    </div>
                  </div>

                  <Quote size={24} className="text-[#FF1E27]/20 group-hover:text-[#FF1E27]/40 transition-colors" />
                </div>

                {/* Star Rating & Purchased Product Badge */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center text-amber-400 gap-0.5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>

                  <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    Đã mua hàng
                  </span>
                </div>

                {/* Feedback Comment */}
                <p className="text-xs text-[#8E92B2] leading-relaxed italic pt-1">
                  "{t.comment}"
                </p>
              </div>

              {/* Product Purchased Tag & Date */}
              <div className="pt-3 border-t border-[#1E1E2E] flex items-center justify-between text-[10px] text-[#8E92B2]">
                <span className="font-bold text-white line-clamp-1 max-w-[200px]">📦 {t.productName}</span>
                <span>{t.createdDate}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default HomePage;
