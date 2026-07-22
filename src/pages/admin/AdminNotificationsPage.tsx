import { useState } from 'react';
import { Bell, Send, Tag, Zap, Package, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNotificationStore } from '../../stores/useNotificationStore';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

const AdminNotificationsPage = () => {
  const addNotification = useNotificationStore((state) => state.addNotification);
  const notifications = useNotificationStore((state) => state.notifications);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'flash_sale' | 'voucher' | 'order' | 'system'>('flash_sale');

  const handleBroadcastNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo!');
      return;
    }

    try {
      // 1. Call Backend Notification Microservice API
      await axiosClient.post('/notifications/push-test', {
        title: title.trim(),
        message: message.trim()
      }).catch(() => {});

      // 2. Broadcast live to Client Store
      addNotification({
        title: title.trim(),
        message: message.trim(),
        type: type
      });

      toast.success(`Đã phát thông báo PUSH "${title}" tới tất cả người dùng!`);
      setTitle('');
      setMessage('');
    } catch {
      toast.error('Phát thông báo thất bại.');
    }
  };

  const getNotifIcon = (t: string) => {
    switch (t) {
      case 'flash_sale': return <Zap size={16} className="text-white fill-white" />;
      case 'voucher': return <Tag size={16} className="text-white" />;
      case 'order': return <Package size={16} className="text-white" />;
      default: return <Sparkles size={16} className="text-white" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 text-[#FAFAFA]">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121215] border border-[#27272A] p-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-bold">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Quản Lý & Đẩy Thông Báo Push</h1>
            <p className="text-xs text-[#A1A1AA]">Đẩy thông báo thời gian thực đến toàn bộ chuông thông báo người dùng</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Form Broadcast Notification */}
        <div className="lg:col-span-2 bg-[#121215] border border-[#27272A] p-6 md:p-8 rounded-3xl space-y-5">
          <div className="flex items-center gap-2 border-b border-[#27272A] pb-4">
            <Send size={20} className="text-white" />
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">Tạo Thông Báo Push Hệ Thống</h2>
          </div>

          <form onSubmit={handleBroadcastNotification} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#A1A1AA] font-semibold mb-1.5 uppercase tracking-wide">Loại Thông Báo</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'flash_sale', label: 'Flash Sale', icon: Zap },
                  { key: 'voucher', label: 'Voucher / Sale', icon: Tag },
                  { key: 'order', label: 'Đơn Hàng', icon: Package },
                  { key: 'system', label: 'Hệ Thống', icon: Sparkles },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = type === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setType(item.key as any)}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all font-bold ${
                        isSelected
                          ? 'border-white bg-white text-black shadow-lg'
                          : 'border-[#27272A] bg-[#18181C] text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      <Icon size={18} className={isSelected ? 'text-black' : ''} />
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Tiêu Đề Thông Báo *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: BÙNG NỔ FLASH SALE 12:00 — GIẢM TỚI 50%!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-dark bg-[#18181C] border-[#27272A] focus:border-white text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Nội Dung Chi Tiết *</label>
              <textarea
                rows={4}
                required
                placeholder="Nhập nội dung gửi tới chuông thông báo..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-dark bg-[#18181C] border-[#27272A] focus:border-white text-sm"
              />
            </div>

            <button type="submit" className="btn-admin-primary w-full py-4 text-sm rounded-2xl">
              <Send size={18} /> GỬI THÔNG BÁO PUSH NGAY TỨC THÌ
            </button>
          </form>
        </div>

        {/* Notification History Sidebar */}
        <div className="bg-[#121215] border border-[#27272A] p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-tight">
              <Bell size={18} /> Lịch Sử Thông Báo ({notifications.length})
            </h2>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 no-scrollbar">
            {notifications.map((n) => (
              <div key={n.id} className="bg-[#18181C] border border-[#27272A] p-3.5 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-white truncate">
                    {getNotifIcon(n.type)}
                    <span className="truncate">{n.title}</span>
                  </div>
                  <span className="text-[9px] text-[#71717A] font-mono flex-shrink-0">{n.timestamp}</span>
                </div>
                <p className="text-[#A1A1AA] text-[11px] leading-snug line-clamp-2">{n.message}</p>
                <div className="flex items-center gap-1 text-[10px] text-white font-semibold pt-1">
                  <CheckCircle2 size={12} /> Đã gửi đến tất cả người dùng
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminNotificationsPage;
