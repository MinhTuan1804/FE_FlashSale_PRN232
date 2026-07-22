import { useState, useEffect } from 'react';
import { Lock, ShieldAlert, X } from 'lucide-react';

const WalletLockedModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleLockedEvent = (e: any) => {
      const msg = e.detail?.message || 'Tài khoản và Ví FlashPay của bạn hiện đang bị KHOÁ. Vui lòng liên hệ Quản trị viên để được hỗ trợ!';
      setMessage(msg);
      setIsOpen(true);
    };

    window.addEventListener('wallet-locked-event', handleLockedEvent);
    return () => window.removeEventListener('wallet-locked-event', handleLockedEvent);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-[#07070C]/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0D0D16] border border-[#FF1E27]/50 rounded-3xl p-6 md:p-8 text-center space-y-5 shadow-[0_0_60px_rgba(255,30,39,0.35)]">
        <div className="w-16 h-16 rounded-2xl bg-[#FF1E27]/10 text-[#FF1E27] border border-[#FF1E27]/30 flex items-center justify-center mx-auto animate-pulse">
          <Lock size={32} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF1E27]/10 border border-[#FF1E27]/20 text-[#FF1E27] text-[10px] font-extrabold uppercase tracking-widest">
            <ShieldAlert size={12} />
            THÔNG BÁO TỪ HỆ THỐNG
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Ví FlashPay / Tài Khoản Đã Bị Khóa</h2>
          <p className="text-xs text-[#8E92B2] leading-relaxed">
            {message}
          </p>
        </div>

        <div className="pt-2">
          <button 
            onClick={() => setIsOpen(false)}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#FF1E27] hover:bg-[#E02424] text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-[#FF1E27]/30 active:scale-95 flex items-center justify-center gap-2"
          >
            <X size={16} /> Đã Hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletLockedModal;
