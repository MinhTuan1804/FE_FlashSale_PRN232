import React from 'react';
import { Lock, Wrench } from 'lucide-react';
import { useServiceHealthStore, type ServiceName, SERVICE_NAMES_VI } from '../stores/useServiceHealthStore';

interface MaintenanceOverlayProps {
  serviceName: ServiceName;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const MaintenanceOverlay: React.FC<MaintenanceOverlayProps> = ({
  serviceName,
  children,
  title,
  className = '',
}) => {
  const isHealthy = useServiceHealthStore((state) => state.services[serviceName] ?? true);

  if (isHealthy) {
    return <>{children}</>;
  }

  const displayName = title || SERVICE_NAMES_VI[serviceName] || serviceName;

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      {/* Covered UI Content with disabled pointer events & grayscale/blur effect */}
      <div className="pointer-events-none select-none opacity-40 filter blur-[1px] grayscale transition-all duration-300">
        {children}
      </div>

      {/* Maintenance Overlay Backdrop & Banner */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/65 backdrop-blur-sm text-center border-2 border-dashed border-[#FF1E27]/40 rounded-2xl animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-[#FF1E27]/20 border border-[#FF1E27]/50 flex items-center justify-center text-[#FF1E27] mb-3 shadow-[0_0_20px_rgba(255,30,39,0.3)]">
          <Lock className="w-6 h-6" />
        </div>

        <h4 className="text-white font-bold text-base md:text-lg flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#FFB800]" />
          Chức năng tạm ngưng
        </h4>

        <p className="text-gray-300 text-xs md:text-sm max-w-md mt-1 font-medium">
          Dịch vụ <span className="text-[#FF1E27] font-semibold">{displayName}</span> hiện đang bảo trì hệ thống.
        </p>

        <span className="inline-block mt-3 px-3 py-1 text-[11px] font-semibold text-gray-400 bg-white/5 border border-white/10 rounded-full">
          Vui lòng thử lại sau
        </span>
      </div>
    </div>
  );
};

export default MaintenanceOverlay;
