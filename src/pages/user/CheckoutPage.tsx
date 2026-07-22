import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/useCartStore';
import { CreditCard, Wallet, MapPin, CheckCircle2, Loader2, User, Phone, ChevronRight, ShieldCheck, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { checkout, addToCart } from '../../api/ordering.api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { useAuthStore } from '../../stores/useAuthStore';
import { formatVND } from './HomePage';

type Step = 1 | 2 | 3;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { items, totalPrice, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('flashshop_user_shipping_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.recipientName) setRecipientName(parsed.recipientName);
        if (parsed.recipientPhone) setRecipientPhone(parsed.recipientPhone);
        if (parsed.shippingAddress) setShippingAddress(parsed.shippingAddress);
        setIsAutoFilled(true);
      } catch {
        if (user?.email) {
          setRecipientName(user.email.split('@')[0]);
          setRecipientPhone('0912345678');
          setShippingAddress('123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh');
        }
      }
    } else if (user?.email) {
      setRecipientName(user.email.split('@')[0]);
      setRecipientPhone('0912345678');
      setShippingAddress('123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh');
      setIsAutoFilled(true);
    }
  }, [user]);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  const { data: walletData } = useQuery({
    queryKey: ['my-wallet', user?.id || user?.email],
    queryFn: async () => {
      try {
        const res: any = await axiosClient.get('/wallets/my-wallet');
        const raw = res.data?.balance ?? res?.balance ?? 0;
        return { balance: Number(raw) };
      } catch {
        return { balance: 0 };
      }
    },
    staleTime: 0,
    refetchOnMount: 'always'
  });

  const walletBalance = walletData?.balance ?? 0;

  const rawTotal = totalPrice();
  const calculatedTotal = rawTotal;

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!recipientName || !recipientPhone || !shippingAddress) {
        toast.error('Vui lòng điền đầy đủ thông tin giao hàng!');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    if (!recipientName || !recipientPhone || !shippingAddress) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng!');
      return;
    }
    if (items.length === 0) {
      toast.error('Giỏ hàng của bạn đang rỗng!');
      return;
    }

    setIsProcessing(true);
    try {
      await axiosClient.delete('/cart').catch(() => {});
      for (const item of items) {
        const rawItemPrice = Number(item.unitPrice) || 3490000;
        const convertedItemPrice = rawItemPrice < 10000 ? rawItemPrice * 25000 : rawItemPrice;
        await addToCart({
          productId: item.productId,
          productName: item.productName,
          unitPrice: convertedItemPrice,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        });
      }

      const checkoutRes: any = await checkout({
        shippingAddress,
        recipientName,
        recipientPhone,
        paymentMethod: paymentMethod === 'wallet' ? 'Ví FlashPay' : 'Thanh toán khi nhận hàng (COD)',
        notes,
        isFlashSaleOrder: false
      });

      const resData = checkoutRes?.data || checkoutRes;

      if (resData?.success === false) {
        const err = resData?.message || 'Đặt hàng thất bại. Vui lòng kiểm tra lại.';
        toast.error(err);
        return;
      }

      if (paymentMethod === 'wallet') {
        toast.success('Đặt hàng & Thanh toán qua ví FlashPay thành công!');
      } else {
        toast.success('Đặt hàng thành công!');
      }

      clearCart();
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      navigate('/orders');
    } catch (e: any) {
      const serverMessage = e?.response?.data?.message || e?.message || 'Đặt hàng thất bại. Vui lòng kiểm tra số dư ví!';
      toast.error(serverMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  const STEPS = [
    { num: 1, label: 'Giao Hàng', icon: <MapPin size={14} /> },
    { num: 2, label: 'Thanh Toán', icon: <Wallet size={14} /> },
    { num: 3, label: 'Xác Nhận', icon: <CheckCircle2 size={14} /> },
  ];

  return (
    <div className="pb-16 max-w-5xl mx-auto text-white space-y-6">

      {/* ─── Page Header ─── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Thanh Toán Đơn Hàng</h1>
        <p className="text-[#8E92B2] text-sm mt-1">Hoàn tất {items.length} sản phẩm trong giỏ hàng</p>
      </div>

      {/* ─── Progress Stepper ─── */}
      <div className="bg-[#0D0D16] border border-[#1A1A2A] p-5 rounded-2xl">
        <div className="flex items-center">
          {STEPS.map((step, idx) => (
            <div key={step.num} className="flex items-center flex-1">
              <div
                className={`stepper-dot cursor-pointer ${
                  currentStep > step.num ? 'done' : currentStep === step.num ? 'active' : 'pending'
                }`}
                onClick={() => { if (step.num < currentStep) setCurrentStep(step.num as Step); }}
              >
                {currentStep > step.num ? <CheckCircle2 size={14} /> : step.icon}
              </div>
              <div className="ml-2 mr-3 hidden sm:block">
                <div className={`text-xs font-bold ${currentStep >= step.num ? 'text-white' : 'text-[#5A5E7A]'}`}>
                  Bước {step.num}
                </div>
                <div className={`text-[10px] ${currentStep >= step.num ? 'text-[#8E92B2]' : 'text-[#3A3A4A]'}`}>
                  {step.label}
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 stepper-line ${currentStep > step.num ? 'done' : 'pending'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left: Steps ─── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Step 1 — Shipping Info */}
          {currentStep === 1 && (
            <div className="bg-[#0D0D16] border border-[#1A1A2A] p-6 rounded-2xl space-y-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="text-[#FF1E27]" size={20} /> Thông Tin Giao Hàng
                </h2>
                {isAutoFilled && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold">
                    <CheckCircle2 size={12} /> Tự động điền
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#8E92B2] block mb-1.5 uppercase tracking-wide">Họ và Tên *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A5E7A]" />
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      className="bg-[#121220] border border-[#232338] rounded-xl pl-10 pr-4 py-3 w-full text-white text-sm focus:border-[#FF1E27] focus:outline-none transition-colors placeholder-[#5A5E7A]"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8E92B2] block mb-1.5 uppercase tracking-wide">Số Điện Thoại *</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A5E7A]" />
                    <input
                      type="text"
                      placeholder="0901 234 567"
                      className="bg-[#121220] border border-[#232338] rounded-xl pl-10 pr-4 py-3 w-full text-white text-sm focus:border-[#FF1E27] focus:outline-none transition-colors placeholder-[#5A5E7A]"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8E92B2] block mb-1.5 uppercase tracking-wide">Địa Chỉ Giao Hàng *</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-3.5 text-[#5A5E7A]" />
                  <textarea
                    rows={2}
                    placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố..."
                    className="bg-[#121220] border border-[#232338] rounded-xl pl-10 pr-4 py-3 w-full text-white text-sm focus:border-[#FF1E27] focus:outline-none resize-none transition-colors placeholder-[#5A5E7A]"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8E92B2] block mb-1.5 uppercase tracking-wide">Ghi Chú (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Ghi chú cho shipper (Vd: Giao giờ hành chính, để ở bảo vệ...)"
                  className="bg-[#121220] border border-[#232338] rounded-xl px-4 py-3 w-full text-white text-sm focus:border-[#FF1E27] focus:outline-none transition-colors placeholder-[#5A5E7A]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button onClick={handleNextStep} className="btn-primary w-full py-3.5">
                Tiếp Tục <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Step 2 — Payment */}
          {currentStep === 2 && (
            <div className="bg-[#0D0D16] border border-[#1A1A2A] p-6 rounded-2xl space-y-4 animate-slide-up">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="text-[#FF1E27]" size={20} /> Phương Thức Thanh Toán
              </h2>

              <div className="space-y-3">
                {/* Wallet Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all text-left ${
                    paymentMethod === 'wallet'
                      ? 'border-[#FF1E27] bg-[#FF1E27]/8 shadow-lg shadow-[#FF1E27]/10'
                      : 'border-[#232338] bg-[#121220] hover:border-[#FF1E27]/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'wallet' ? 'bg-[#FF1E27]/20' : 'bg-[#1A1A2E]'}`}>
                      <Wallet size={22} className={paymentMethod === 'wallet' ? 'text-[#FF1E27]' : 'text-[#8E92B2]'} />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Ví Điện Tử FlashPay</div>
                      <div className="text-xs text-[#8E92B2] mt-0.5">
                        Số dư: <span className="text-[#FF1E27] font-bold font-mono">{formatVND(walletBalance)}</span>
                      </div>
                      <div className="text-[10px] text-green-400 mt-0.5">✓ Thanh toán tức thì — Hoàn tiền 5%</div>
                    </div>
                  </div>
                  {paymentMethod === 'wallet' && <CheckCircle2 size={22} className="text-[#FF1E27] flex-shrink-0" />}
                </button>

                {/* COD Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all text-left ${
                    paymentMethod === 'cod'
                      ? 'border-[#FF1E27] bg-[#FF1E27]/8 shadow-lg shadow-[#FF1E27]/10'
                      : 'border-[#232338] bg-[#121220] hover:border-[#FF1E27]/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-[#FF1E27]/20' : 'bg-[#1A1A2E]'}`}>
                      <CreditCard size={22} className={paymentMethod === 'cod' ? 'text-[#FF1E27]' : 'text-[#8E92B2]'} />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Thanh Toán Khi Nhận Hàng (COD)</div>
                      <div className="text-xs text-[#8E92B2] mt-0.5">Thanh toán tiền mặt khi nhận hàng</div>
                      <div className="text-[10px] text-amber-400 mt-0.5">Giao trong 2-5 ngày làm việc</div>
                    </div>
                  </div>
                  {paymentMethod === 'cod' && <CheckCircle2 size={22} className="text-[#FF1E27] flex-shrink-0" />}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setCurrentStep(1)} className="btn-secondary flex-1 py-3.5">
                  ← Quay Lại
                </button>
                <button onClick={handleNextStep} className="btn-primary flex-1 py-3.5">
                  Xem Lại Đơn <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Confirm */}
          {currentStep === 3 && (
            <div className="bg-[#0D0D16] border border-[#1A1A2A] p-6 rounded-2xl space-y-5 animate-slide-up">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="text-[#FF1E27]" size={20} /> Xác Nhận Đơn Hàng
              </h2>

              {/* Summary rows */}
              <div className="space-y-3">
                <div className="bg-[#121220] rounded-xl p-4 space-y-1">
                  <div className="text-xs font-bold text-[#5A5E7A] uppercase tracking-wider mb-2">Địa Chỉ Giao Hàng</div>
                  <div className="text-white font-semibold text-sm">{recipientName} — {recipientPhone}</div>
                  <div className="text-[#8E92B2] text-xs">{shippingAddress}</div>
                  {notes && <div className="text-[#5A5E7A] text-xs italic">Ghi chú: {notes}</div>}
                </div>
                <div className="bg-[#121220] rounded-xl p-4">
                  <div className="text-xs font-bold text-[#5A5E7A] uppercase tracking-wider mb-2">Phương Thức Thanh Toán</div>
                  <div className="text-white font-semibold text-sm flex items-center gap-2">
                    {paymentMethod === 'wallet' ? <Wallet size={16} className="text-[#FF1E27]" /> : <CreditCard size={16} className="text-[#8E92B2]" />}
                    {paymentMethod === 'wallet' ? 'Ví Điện Tử FlashPay' : 'COD — Thanh toán khi nhận hàng'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-400">
                <ShieldCheck size={16} /> Đơn hàng được bảo vệ bởi FlashShop Buyer Protection
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setCurrentStep(2)} className="btn-secondary flex-1 py-3.5">
                  ← Quay Lại
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="btn-primary flex-1 py-3.5 disabled:opacity-60"
                >
                  {isProcessing ? (
                    <><Loader2 size={18} className="animate-spin" /> Đang xử lý...</>
                  ) : (
                    <>Xác Nhận & Đặt Hàng ({formatVND(calculatedTotal)})</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Right: Order Summary (sticky) ─── */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-[#0D0D16] border border-[#1A1A2A] p-5 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Package size={18} className="text-[#FF1E27]" /> Đơn Hàng ({items.length} sp)
            </h2>

            <div className="divide-y divide-[#1E1E2E] max-h-56 overflow-y-auto pr-1 no-scrollbar">
              {items.map((item) => {
                const rawItemPrice = Number(item.unitPrice) || 3490000;
                const convertedItemPrice = rawItemPrice < 10000 ? rawItemPrice * 25000 : rawItemPrice;
                return (
                  <div key={item.productId} className="py-3 flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img src={item.imageUrl} alt={item.productName} className="w-12 h-12 rounded-xl object-contain bg-[#08080E] p-1 border border-[#1E1E2E]" />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#FF1E27] rounded-full text-white text-[10px] font-black flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-xs line-clamp-1">{item.productName}</div>
                      <div className="text-[#8E92B2] text-[10px] mt-0.5">{formatVND(convertedItemPrice)} / cái</div>
                    </div>
                    <div className="font-bold text-white text-xs flex-shrink-0">{formatVND(convertedItemPrice * item.quantity)}</div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#1E1E2E] pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-[#8E92B2]">
                <span>Tạm tính</span>
                <span>{formatVND(calculatedTotal)}</span>
              </div>
              <div className="flex justify-between text-[#8E92B2]">
                <span>Vận chuyển</span>
                <span className="text-green-400 font-semibold">MIỄN PHÍ</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-[#1E1E2E]">
                <span>Tổng cộng</span>
                <span className="text-[#FF1E27]">{formatVND(calculatedTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
