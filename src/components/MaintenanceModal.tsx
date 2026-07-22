import React from 'react';
import { Wrench, ShieldAlert, X, AlertTriangle } from 'lucide-react';
import { useServiceHealthStore, SERVICE_NAMES_VI } from '../stores/useServiceHealthStore';

const MaintenanceModal: React.FC = () => {
  const { modalOpen, interruptedService, closeModal } = useServiceHealthStore();

  if (!modalOpen) return null;

  const serviceDisplayName = interruptedService
    ? SERVICE_NAMES_VI[interruptedService] || interruptedService
    : 'Hệ thống Dịch vụ';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#0D0D16] border border-[#FF1E27]/40 shadow-[0_0_50px_rgba(255,30,39,0.25)] p-6 md:p-8 space-y-6 text-center">
        {/* Close Icon Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#FF1E27]/10 border border-[#FF1E27]/30 flex items-center justify-center text-[#FF1E27] shadow-[0_0_20px_rgba(255,30,39,0.2)]">
          <Wrench className="w-8 h-8 animate-pulse" />
        </div>

        {/* Header Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF1E27]/10 border border-[#FF1E27]/30 text-xs font-semibold text-[#FF1E27] uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" /> Thông báo bảo trì hệ thống
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Chức năng đang bảo trì
          </h2>
        </div>

        {/* Modal Description */}
        <div className="p-4 rounded-2xl bg-[#131320] border border-white/5 space-y-2 text-left">
          <div className="flex items-center gap-2 text-[#FFB800] font-medium text-sm">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Dịch vụ bị gián đoạn:</span>
          </div>
          <p className="text-white font-semibold text-base pl-6">
            {serviceDisplayName}
          </p>
          <p className="text-gray-400 text-xs leading-relaxed pt-2 border-t border-white/5">
            Rất tiếc! Chức năng liên quan đến dịch vụ này hiện đang được nâng cấp hoặc ngắt kết nối tạm thời. Vui lòng quay lại sau ít phút hoặc sử dụng các tính năng khác trên hệ thống FlashShop.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={closeModal}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FF1E27] to-[#D91B23] text-white font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,30,39,0.4)]"
        >
          Đã hiểu & Tiếp tục
        </button>
      </div>
    </div>
  );
};

export default MaintenanceModal;
