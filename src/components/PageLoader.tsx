import { Zap } from 'lucide-react';

const PageLoader = ({ message = 'ĐANG TẢI DỮ LIỆU FLASHSALE...' }: { message?: string }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing aura */}
        <div className="w-24 h-24 rounded-full bg-[#FF1E27]/20 animate-ping absolute inset-0 pointer-events-none" />

        {/* Outer spinning border ring */}
        <div className="w-20 h-20 rounded-full border-2 border-t-[#FF1E27] border-r-transparent border-b-[#FF1E27]/40 border-l-transparent animate-spin" />

        {/* Center glowing logo pill */}
        <div className="absolute w-12 h-12 rounded-2xl bg-[#0D0D16] border border-[#FF1E27] shadow-[0_0_25px_rgba(255,30,39,0.6)] flex items-center justify-center">
          <Zap size={24} className="text-[#FF1E27] fill-[#FF1E27] animate-pulse" />
        </div>
      </div>

      {/* Loading Text */}
      <div className="mt-6 space-y-1.5">
        <div className="text-xs font-mono font-extrabold text-[#FF1E27] uppercase tracking-widest animate-pulse flex items-center justify-center gap-1.5">
          <span>{message}</span>
        </div>
        <p className="text-[11px] text-[#71717A] font-mono">Vui lòng chờ trong giây lát...</p>
      </div>
    </div>
  );
};

export default PageLoader;
