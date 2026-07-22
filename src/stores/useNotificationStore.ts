import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

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
  deletedNotificationIds: string[];
  unreadCount: () => number;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;
  fetchServerNotifications: () => Promise<void>;
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
  }
];

// Global BroadcastChannel for instant cross-tab real-time push notifications
const notifChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('flashshop_notifications_channel')
  : null;

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: initialNotifications,
      deletedNotificationIds: [],
      unreadCount: () => {
        return get().notifications.filter((n) => !n.isRead).length;
      },
      addNotification: (item) => {
        const newNotif: NotificationItem = {
          id: `n_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: item.title,
          message: item.message,
          type: item.type,
          timestamp: 'Vừa xong',
          isRead: false
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications]
        }));

        // Broadcast to all open tabs in real-time
        if (notifChannel) {
          try {
            notifChannel.postMessage({ type: 'NEW_NOTIFICATION', payload: newNotif });
          } catch (e) {
            // Ignore channel post errors
          }
        }
      },
      fetchServerNotifications: async () => {
        try {
          // Dynamic import to prevent circular dependency
          const axiosClient = (await import('../api/axiosClient')).default;
          const res: any = await axiosClient.get('/notifications/my-notifications');
          const rawItems = res.data?.data || res.data || [];
          
          if (Array.isArray(rawItems) && rawItems.length > 0) {
            const state = get();
            const currentIds = new Set(state.notifications.map((n) => n.id));
            const deletedIds = new Set((state.deletedNotificationIds || []).map((id) => id.toString().toLowerCase()));
            let hasNew = false;
            const newNotifs: NotificationItem[] = [];

            for (const item of rawItems) {
              const rawNotifId = (item.id || `sn_${item.timestamp}`).toString();
              const notifIdLower = rawNotifId.toLowerCase();

              // Skip if already in list or if user previously deleted it
              if (currentIds.has(rawNotifId) || deletedIds.has(notifIdLower)) {
                continue;
              }

              hasNew = true;

              // Format timestamp cleanly into VN date time
              let formattedTime = 'Vừa xong';
              if (item.timestamp) {
                try {
                  const d = new Date(item.timestamp);
                  if (!isNaN(d.getTime())) {
                    formattedTime = `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
                  } else {
                    formattedTime = String(item.timestamp).split('T')[0] || item.timestamp;
                  }
                } catch {
                  formattedTime = item.timestamp;
                }
              }

              // Strip HTML tags and translate English template text to clean Vietnamese
              let rawTitle = item.title || item.subject || 'Thông Báo Hệ Thống';
              rawTitle = rawTitle.replace(/Your order (FS-[A-Z0-9]+) is awaiting payment/i, 'Đơn hàng $1 đang chờ thanh toán');

              let rawMsg = item.message || item.body || '';
              rawMsg = rawMsg
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/Order Awaiting Payment/gi, 'Đơn hàng chờ thanh toán.')
                .replace(/Dear Customer,/gi, 'Kính gửi quý khách,')
                .replace(/has been confirmed and is awaiting payment\./gi, 'đã được hệ thống xác nhận và đang chờ thanh toán.')
                .replace(/Total Amount:/gi, 'Tổng tiền:')
                .replace(/Please complete payment before:/gi, 'Vui lòng hoàn tất thanh toán trước:')
                .replace(/Best regards,?\s*FlashShop Team/gi, '')
                .replace(/\s+/g, ' ')
                .trim();

              const formatted: NotificationItem = {
                id: rawNotifId,
                title: rawTitle,
                message: rawMsg,
                timestamp: formattedTime,
                isRead: false,
                type: (item.type as any) || 'flash_sale'
              };
              newNotifs.push(formatted);
            }

            if (hasNew && newNotifs.length > 0) {
              set((s) => ({
                notifications: [...newNotifs, ...s.notifications]
              }));
              const newest = newNotifs[0];
              toast.success(newest.title, {
                duration: 4000,
                position: 'top-right'
              });
            }
          }
        } catch {
          // Silent catch for network polling
        }
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
      clearAll: () => {
        const state = get();
        const deleted = state.notifications.map((n) => n.id.toString().toLowerCase());
        set((s) => ({
          deletedNotificationIds: Array.from(new Set([...(s.deletedNotificationIds || []), ...deleted])),
          notifications: []
        }));
      },
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

// Listen to BroadcastChannel and window storage events for instantaneous tab-sync
if (typeof window !== 'undefined') {
  if (notifChannel) {
    notifChannel.onmessage = (event) => {
      if (event.data?.type === 'NEW_NOTIFICATION' && event.data?.payload) {
        const item = event.data.payload;
        useNotificationStore.setState((state) => {
          if (state.notifications.some((n) => n.id === item.id)) return state;
          return { notifications: [item, ...state.notifications] };
        });
        toast.success(`🔔 [THÔNG BÁO MỚI] ${item.title}`, { duration: 5000, position: 'top-right' });
      }
    };
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'flashshop-notifications-storage' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed?.state?.notifications) {
          useNotificationStore.setState({ notifications: parsed.state.notifications });
        }
      } catch (err) {
        // ignore parse error
      }
    }
  });
}
