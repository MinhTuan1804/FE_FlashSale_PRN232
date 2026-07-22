import { create } from 'zustand';

export type ServiceName = 'identity' | 'catalog' | 'inventory' | 'ordering' | 'notification';

export const SERVICE_NAMES_VI: Record<string, string> = {
  identity: 'Xác thực & Tài khoản (Identity Service)',
  catalog: 'Sản phẩm & Danh mục (Catalog Service)',
  inventory: 'Quản lý Tồn kho (Inventory Service)',
  ordering: 'Giỏ hàng & Đặt hàng (Ordering Service)',
  notification: 'Thông báo & Email (Notification Service)',
};

interface ServiceHealthState {
  services: Record<ServiceName, boolean>;
  modalOpen: boolean;
  interruptedService: string | null;
  setServiceStatus: (service: ServiceName, isHealthy: boolean, triggerModal?: boolean) => void;
  setServicesStatus: (statuses: Partial<Record<ServiceName, boolean>>) => void;
  closeModal: () => void;
  triggerMaintenanceModal: (serviceName: string) => void;
}

export const useServiceHealthStore = create<ServiceHealthState>((set) => ({
  services: {
    identity: true,
    catalog: true,
    inventory: true,
    ordering: true,
    notification: true,
  },
  modalOpen: false,
  interruptedService: null,

  setServiceStatus: (service, isHealthy, triggerModal = true) => {
    set((state) => {
      const wasHealthy = state.services[service];
      const newServices = { ...state.services, [service]: isHealthy };
      const shouldShowModal = !isHealthy && wasHealthy && triggerModal;

      return {
        services: newServices,
        modalOpen: shouldShowModal ? true : state.modalOpen,
        interruptedService: shouldShowModal ? service : state.interruptedService,
      };
    });
  },

  setServicesStatus: (statuses) => {
    set((state) => {
      let newlyFailedService: string | null = null;
      const updatedServices = { ...state.services };

      (Object.keys(statuses) as ServiceName[]).forEach((key) => {
        const isHealthy = statuses[key];
        if (isHealthy !== undefined) {
          if (!isHealthy && state.services[key]) {
            newlyFailedService = key;
          }
          updatedServices[key] = isHealthy;
        }
      });

      return {
        services: updatedServices,
        modalOpen: newlyFailedService ? true : state.modalOpen,
        interruptedService: newlyFailedService || state.interruptedService,
      };
    });
  },

  closeModal: () => {
    set({ modalOpen: false, interruptedService: null });
  },

  triggerMaintenanceModal: (serviceName) => {
    set({
      modalOpen: true,
      interruptedService: serviceName,
    });
  },
}));
