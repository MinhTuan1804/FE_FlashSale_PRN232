import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'flash_sale' | 'order' | 'voucher' | 'system';
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: () => number;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  pushTestNotification: () => void;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Flash Sale Giờ Vàng',
    message: 'Sự kiện Flash Sale cực đại vừa bắt đầu! Giảm giá tới 50% cho bộ sản phẩm Apex Pro.',
    timestamp: '5 phút trước',
    isRead: false,
    type: 'flash_sale'
  },
  {
    id: 'n2',
    title: 'Mã Giảm Giá Độc Quyền',
    message: 'Bạn nhận được Voucher GAMING100K giảm 100.000đ cho đơn hàng từ 1.500.000đ.',
    timestamp: '1 giờ trước',
    isRead: false,
    type: 'voucher'
  },
  {
    id: 'n3',
    title: 'Xác Nhận Đơn Hàng #FS-202688',
    message: 'Đơn hàng của bạn đã được xác nhận thành công và đang được chuẩn bị giao.',
    timestamp: '2 giờ trước',
    isRead: true,
    type: 'order'
  }
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: initialNotifications,
      unreadCount: () => {
        return get().notifications.filter((n) => !n.isRead).length;
      },
      addNotification: (item) => {
        const newNotif: NotificationItem = {
          id: `n_${Date.now()}`,
          title: item.title,
          message: item.message,
          type: item.type,
          timestamp: 'Vừa xong',
          isRead: false
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications]
        }));
      },
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          )
        }));
      },
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
        }));
      },
      clearAll: () => set({ notifications: [] }),
      pushTestNotification: () => {
        const testTitles = [
          'BÁO ĐỘNG SALE SỐC 2026',
          'CHỤP NGAY VOUCHER 200K',
          'ĐƠN HÀNG ĐANG GIAO HỎA TỐC',
          'SẢN PHẨM HÀNG ĐẦU MỚI VỀ'
        ];
        const testMessages = [
          'Chuột Gaming Razer Viper V3 Pro siêu nhẹ 54g đang giảm giá shock 30%!',
          'Đã kích hoạt ưu đãi Freeship 0đ cho toàn bộ đơn hàng của bạn trong 24h.',
          'Đơn hàng thiết bị Gaming Gear của bạn đang được shipper vận chuyển.',
          'Màn hình Asus ROG Swift OLED 360Hz đã có hàng trở lại!'
        ];
        const randomIdx = Math.floor(Math.random() * testTitles.length);

        get().addNotification({
          title: testTitles[randomIdx],
          message: testMessages[randomIdx],
          type: 'flash_sale'
        });
      }
    }),
    {
      name: 'flashshop-notifications-storage'
    }
  )
);
