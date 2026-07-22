import { useEffect, useState } from 'react';
import { useCartStore } from '../../stores/useCartStore';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShoppingCart, Tag, X, Info } from 'lucide-react';
import { formatVND } from './HomePage';

const VOUCHER_CODES: Record<string, number> = {
  'FLASH10': 0.10,
  'GAMING50K': 50000,
  'SALE20': 0.20,
  'FLASHVIP': 0.15,
};

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const validItems = items.filter(
    (item) => item.unitPrice !== undefined && !isNaN(item.unitPrice) && Number(item.unitPrice) > 0
  );

  useEffect(() => {
    if (items.length !== validItems.length) {
      const brokenItems = items.filter(
        (item) => item.unitPrice === undefined || isNaN(item.unitPrice) || Number(item.unitPrice) <= 0
      );
      brokenItems.forEach((b) => removeItem(b.productId));
    }
  }, [items, validItems, removeItem]);

  const rawTotal = totalPrice();
  const calculatedTotal = rawTotal < 10000 ? rawTotal * 25000 : rawTotal;

  const discount = appliedVoucher && VOUCHER_CODES[appliedVoucher]
    ? typeof VOUCHER_CODES[appliedVoucher] === 'number' && VOUCHER_CODES[appliedVoucher] < 1
      ? Math.round(calculatedTotal * VOUCHER_CODES[appliedVoucher])
      : VOUCHER_CODES[appliedVoucher] as number
    : 0;

  const finalTotal = Math.max(0, calculatedTotal - discount);

  const handleApplyVoucher = () => {
    const code = voucherInput.trim().toUpperCase();
    if (!code) { setVoucherError('Vui lòng nhập mã voucher.'); return; }
    if (VOUCHER_CODES[code]) {
      setAppliedVoucher(code);
      setVoucherError('');
      setVoucherInput('');
    } else {
      setVoucherError('Mã voucher không hợp lệ hoặc đã hết hạn.');
    }
  };

  const handleRemoveWithAnimation = (productId: string) => {
    setRemovingId(productId);
    setTimeout(() => {
      removeItem(productId);
      setRemovingId(null);
    }, 300);
  };

  if (validItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-[#0D0D16] rounded-3xl border border-[#1A1A2A] text-center space-y-5 max-w-2xl mx-auto text-white animate-slide-up">
        <div className="w-24 h-24 rounded-full bg-[#FF1E27]/10 flex items-center justify-center text-[#FF1E27] animate-float">
          <ShoppingCart size={44} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Giỏ Hàng Của Bạn Đang Rỗng</h2>
          <p className="text-[#8E92B2] text-sm max-w-md mx-auto">Hãy khám phá cửa hàng công nghệ của chúng tôi và chọn các sản phẩm yêu thích.</p>
        </div>
        <Link to="/products" className="btn-primary">
          <ShoppingBag size={18} /> Khám Phá Sản Phẩm Ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-16 max-w-5xl mx-auto space-y-6 text-white">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <ShoppingCart className="text-[#FF1E27]" size={30} />
          Giỏ Hàng <span className="text-[#8E92B2] text-xl font-medium">({validItems.length} sản phẩm)</span>
        </h1>
        <button
          onClick={clearCart}
          className="text-[#5A5E7A] hover:text-red-400 text-xs font-semibold flex items-center gap-1 transition-colors hover:underline"
        >
          <Trash2 size={14} /> Xóa tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Cart Items ─── */}
        <div className="lg:col-span-2 space-y-3">
          {validItems.map((item) => {
            const rawItemPrice = Number(item.unitPrice) || 3490000;
            const convertedItemPrice = rawItemPrice < 10000 ? rawItemPrice * 25000 : rawItemPrice;
            const isRemoving = removingId === item.productId;
            return (
              <div
                key={item.productId}
                className={`bg-[#0D0D16] border border-[#1A1A2A] hover:border-[#FF1E27]/40 p-4 md:p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 ${isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
              >
                {/* Product Image */}
                <Link to={`/products/${item.productId}`} className="flex-shrink-0">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600'}
                    alt={item.productName}
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.onerror = null;
                      t.src = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600';
                    }}
                    className="w-18 h-18 md:w-20 md:h-20 rounded-xl object-contain bg-[#08080E] p-2 border border-[#1E1E2E] hover:scale-105 transition-transform"
                    style={{ width: 72, height: 72 }}
                  />
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.productId}`}>
                    <h3 className="font-bold text-white text-sm line-clamp-2 hover:text-[#FF1E27] transition-colors leading-snug">{item.productName}</h3>
                  </Link>
                  <div className="text-sm font-bold text-[#FF1E27] mt-1">{formatVND(convertedItemPrice)}</div>
                  <div className="text-xs text-[#5A5E7A] mt-0.5">
                    Thành tiền: <span className="text-white font-semibold">{formatVND(convertedItemPrice * item.quantity)}</span>
                  </div>
                </div>

                {/* Quantity + Remove */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center border border-[#232338] rounded-xl bg-[#121220] overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                      className="p-2 text-[#8E92B2] hover:text-white hover:bg-[#1A1A2E] transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 font-bold text-white text-sm min-w-[2rem] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-2 text-[#8E92B2] hover:text-white hover:bg-[#1A1A2E] transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveWithAnimation(item.productId)}
                    className="text-[#5A5E7A] hover:text-red-400 p-2 transition-colors rounded-lg hover:bg-red-500/10"
                    title="Xóa sản phẩm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Order Summary Sidebar ─── */}
        <div className="lg:sticky lg:top-24 h-fit space-y-4">
          {/* Voucher */}
          <div className="bg-[#0D0D16] border border-[#1A1A2A] p-5 rounded-2xl space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Tag size={16} className="text-amber-400" /> Mã Giảm Giá / Voucher
            </h3>
            {appliedVoucher ? (
              <div className="relative flex items-center justify-between bg-gradient-to-r from-emerald-950/60 to-emerald-900/40 border border-emerald-500/40 rounded-xl px-3.5 py-2.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <span className="text-emerald-400 font-mono font-black text-xs uppercase tracking-wider">{appliedVoucher}</span>
                  <span className="text-emerald-300/80 text-[11px] font-semibold">Đã áp dụng</span>
                </div>
                <button 
                  onClick={() => { setAppliedVoucher(null); setVoucherError(''); }} 
                  className="text-emerald-400/60 hover:text-white p-1 rounded-lg hover:bg-emerald-500/20 transition-colors flex-shrink-0"
                  title="Hủy mã giảm giá"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div className="relative flex items-center bg-[#121220] border border-[#232338] focus-within:border-[#FF1E27] rounded-xl p-1 transition-all">
                <input
                  type="text"
                  placeholder="Nhập mã voucher..."
                  value={voucherInput}
                  onChange={(e) => { setVoucherInput(e.target.value.toUpperCase()); setVoucherError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                  className="w-full bg-transparent px-3 py-1.5 text-white text-xs font-mono outline-none placeholder-[#5A5E7A] uppercase min-w-0"
                />
                <button 
                  onClick={handleApplyVoucher} 
                  className="bg-[#FF1E27] hover:bg-[#E02424] text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex-shrink-0"
                >
                  Áp dụng
                </button>
              </div>
            )}
            {voucherError && <p className="text-red-400 text-xs flex items-center gap-1"><Info size={12} /> {voucherError}</p>}
            <p className="text-[10px] text-[#5A5E7A]">Thử: FLASH10, GAMING50K, SALE20, FLASHVIP</p>
          </div>

          {/* Summary */}
          <div className="bg-[#0D0D16] border border-[#1A1A2A] p-5 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white pb-3 border-b border-[#1E1E2E]">Tóm Tắt Đơn Hàng</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#8E92B2]">
                <span>Tạm tính ({validItems.length} sp)</span>
                <span className="font-semibold text-white">{formatVND(calculatedTotal)}</span>
              </div>
              <div className="flex justify-between text-[#8E92B2]">
                <span>Phí vận chuyển</span>
                <span className="text-green-400 font-semibold">MIỄN PHÍ</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Giảm giá ({appliedVoucher})</span>
                  <span className="font-semibold">-{formatVND(discount)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="bg-gradient-to-r from-emerald-950/60 via-[#121220] to-[#121220] border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-400 shadow-md">
                  <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 flex-shrink-0">
                    <Tag size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[#8E92B2]">Tiết kiệm: </span>
                    <strong className="text-emerald-400 font-extrabold text-sm tracking-tight">{formatVND(discount)}</strong>
                    <span className="text-[#8E92B2] text-[10px] block font-medium">Áp dụng mã ưu đãi thành công</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-[#1E1E2E]">
                <span>Tổng thanh toán</span>
                <span className="text-[#FF1E27]">{formatVND(finalTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary py-4 text-base rounded-2xl"
            >
              Tiến Hành Thanh Toán <ArrowRight size={18} />
            </button>

            <Link to="/products" className="block text-center text-xs text-[#8E92B2] hover:text-[#FF1E27] transition-colors pt-1">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
