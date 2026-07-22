import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { 
  User, Settings, LogOut, Package, Wallet, Bell, PlusCircle, Sparkles, Loader2, 
  CheckCircle2, Phone, MapPin, Zap, Tag, Check, Trash2 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import MaintenanceOverlay from '../../components/MaintenanceOverlay';
import { formatVND } from './HomePage';

const ProfilePage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('settings');
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);

  // Notification Store Binding
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount());
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const clearAll = useNotificationStore((state) => state.clearAll);
  const fetchServerNotifications = useNotificationStore((state) => state.fetchServerNotifications);

  useEffect(() => {
    fetchServerNotifications();
  }, [fetchServerNotifications]);

  const displayNotifications = notifications;

  // Profile Shipping Information State
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem('flashshop_user_shipping_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setRecipientName(parsed.recipientName || user.email.split('@')[0]);
          setRecipientPhone(parsed.recipientPhone || '0912345678');
          setShippingAddress(parsed.shippingAddress || '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh');
        } catch (e) {
          setRecipientName(user.email.split('@')[0]);
          setRecipientPhone('0912345678');
          setShippingAddress('123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh');
        }
      } else {
        const defaultProfile = {
          recipientName: user.email.split('@')[0],
          recipientPhone: '0912345678',
          shippingAddress: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'
        };
        setRecipientName(defaultProfile.recipientName);
        setRecipientPhone(defaultProfile.recipientPhone);
        setShippingAddress(defaultProfile.shippingAddress);
        localStorage.setItem('flashshop_user_shipping_profile', JSON.stringify(defaultProfile));
      }
    }
  }, [user]);

  const handleSaveProfile = () => {
    const profile = { recipientName, recipientPhone, shippingAddress };
    localStorage.setItem('flashshop_user_shipping_profile', JSON.stringify(profile));
    toast.success('Đã cập nhật thông tin giao hàng mặc định!');
  };

  // Fetch real wallet balance from Identity API
  const { data: walletData, isLoading: isWalletLoading } = useQuery({
    queryKey: ['my-wallet', user?.id || user?.email],
    queryFn: async () => {
      try {
        const res: any = await axiosClient.get('/wallets/my-wallet');
        const raw = res.data?.balance ?? res?.balance ?? 0;
        return { balance: Number(raw) };
      } catch (e) {
        return { balance: 0 };
      }
    },
    staleTime: 0,
    refetchOnMount: 'always'
  });

  const walletBalance = walletData?.balance ?? 0;

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công!');
    navigate('/login');
  };

  const handleTopUpAmount = async (amount: number) => {
    if (isTopUpLoading) return;
    setIsTopUpLoading(true);
    try {
      const res: any = await axiosClient.post('/wallets/topup', { amount });
      const walletPayload = res.data || res;
      const updatedBalance = walletPayload?.balance ?? walletPayload?.data?.balance;

      if (updatedBalance !== undefined) {
        queryClient.setQueryData(['my-wallet'], { balance: Number(updatedBalance) });
      }
      queryClient.invalidateQueries({ queryKey: ['my-wallet'] });
      toast.success(`Nạp thành công +${formatVND(amount)} vào ví FlashPay!`);
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || 'Nạp tiền thất bại. Vui lòng đăng nhập lại.';
      toast.error(errorMsg);
    } finally {
      setTimeout(() => setIsTopUpLoading(false), 500);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  // Membership tier based on wallet balance
  const getMembershipTier = (balance: number) => {
    if (balance >= 50000000) return { label: 'DIAMOND', color: '#00D4FF', bg: 'rgba(0,212,255,0.15)', border: 'rgba(0,212,255,0.35)' };
    if (balance >= 20000000) return { label: 'GOLD', color: '#FFB800', bg: 'rgba(255,184,0,0.15)', border: 'rgba(255,184,0,0.35)' };
    if (balance >= 5000000) return { label: 'SILVER', color: '#C0C0C0', bg: 'rgba(192,192,192,0.15)', border: 'rgba(192,192,192,0.35)' };
    return { label: 'BRONZE', color: '#CD7F32', bg: 'rgba(205,127,50,0.15)', border: 'rgba(205,127,50,0.35)' };
  };

  const membershipTier = getMembershipTier(walletBalance);
  const flashPoints = Math.floor(walletBalance / 10000);

  return (
    <div className="pb-16 max-w-5xl mx-auto flex flex-col md:flex-row gap-8 text-white">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-2">
        <div className="glass-effect p-6 rounded-2xl border border-white/5 flex flex-col items-center mb-4 bg-[#0D0D16] space-y-3">
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center border-2"
              style={{ borderColor: membershipTier.color, boxShadow: `0 0 20px ${membershipTier.color}40` }}
            >
              <div className="w-full h-full rounded-full bg-[#FF1E27]/20 flex items-center justify-center">
                <User size={38} className="text-[#FF1E27]" />
              </div>
            </div>
            {/* Tier badge */}
            <span
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black whitespace-nowrap border"
              style={{ color: membershipTier.color, background: membershipTier.bg, borderColor: membershipTier.border }}
            >
              {membershipTier.label}
            </span>
          </div>
          <h2 className="text-white font-bold text-lg mt-2">{recipientName || user.email.split('@')[0]}</h2>
          <p className="text-[#8E92B2] text-sm">{user.email}</p>
          {/* Mini stats */}
          <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-[#1A1A2A] text-center">
            <div>
              <div className="text-xs font-black text-white font-mono">{formatVND(walletBalance)}</div>
              <div className="text-[10px] text-[#5A5E7A]">Ví FlashPay</div>
            </div>
            <div>
              <div className="text-xs font-black text-white font-mono">{flashPoints.toLocaleString('vi-VN')}</div>
              <div className="text-[10px] text-[#5A5E7A]">Flash Points</div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-[#FF1E27]/10 text-[#FF1E27] font-semibold border border-[#FF1E27]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Settings size={20} /> Cài Đặt Tài Khoản
        </button>
        <Link 
          to="/orders"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Package size={20} /> Đơn Hàng Của Tôi
        </Link>
        <button 
          onClick={() => setActiveTab('wallet')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'wallet' ? 'bg-[#FF1E27]/10 text-[#FF1E27] font-semibold border border-[#FF1E27]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Wallet size={20} /> Ví Điện Tử & Thanh Toán
        </button>
        <button 
          onClick={() => setActiveTab('notifications')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${activeTab === 'notifications' ? 'bg-[#FF1E27]/10 text-[#FF1E27] font-semibold border border-[#FF1E27]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <div className="flex items-center gap-3">
            <Bell size={20} /> Thông Báo Hệ Thống
          </div>
          {unreadCount > 0 && (
            <span className="bg-[#FF1E27] text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
        
        <div className="pt-4 mt-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-medium"
          >
            <LogOut size={20} /> Đăng Xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow glass-effect p-8 rounded-2xl border border-white/5 min-h-[500px] bg-[#0D0D16]">
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white mb-6">Cài Đặt Hồ Sơ & Giao Hàng</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#8E92B2] mb-2">Họ và Tên Người Nhận Mặc Định</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="input-field pl-10 w-full bg-[#121220] border border-[#232338] rounded-xl py-2.5 text-white" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8E92B2] mb-2">Số Điện Thoại Nhận Hàng</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="input-field pl-10 w-full bg-[#121220] border border-[#232338] rounded-xl py-2.5 text-white" 
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#8E92B2] mb-2">Địa Chỉ Email Tài Khoản</label>
                <input type="email" value={user.email} disabled className="input-field w-full bg-[#121220] border border-[#232338] rounded-xl py-2.5 text-white opacity-50 cursor-not-allowed" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#8E92B2] mb-2">Địa Chỉ Giao Hàng Mặc Định</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3.5 top-4 text-gray-500" />
                  <textarea 
                    rows={3} 
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Nhập địa chỉ giao hàng mặc định của bạn..." 
                    className="input-field pl-10 py-3.5 w-full bg-[#121220] border border-[#232338] rounded-xl text-white resize-none min-h-[90px]" 
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <button onClick={handleSaveProfile} className="bg-[#FF1E27] hover:bg-[#E02424] text-white py-3.5 px-8 rounded-xl font-bold flex items-center gap-2 transition-all">
                <CheckCircle2 size={18} /> Lưu Thay Đổi Hồ Sơ
              </button>
              <span className="text-xs text-[#8E92B2]">Thông tin này sẽ được tự động điền khi thanh toán đơn hàng.</span>
            </div>
          </div>
        )}
        
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Ví Điện Tử FlashPay</h1>
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold">Tài Khoản Đang Hoạt Động</span>
            </div>

            {/* Wallet Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#FF1E27]/20 via-[#161622] to-amber-500/10 border border-[#FF1E27]/40 flex flex-col justify-between h-56 relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2 text-[#FF1E27] font-bold tracking-wide">
                  <Wallet size={24} />
                  <span>SỐ DƯ VÍ FLASHPAY</span>
                </div>
                <Sparkles className="text-amber-400 animate-pulse" size={24} />
              </div>

              <div className="z-10">
                <span className="text-[#8E92B2] text-xs uppercase tracking-wider block mb-1">Số Dư Khả Dụng</span>
                {isWalletLoading ? (
                  <div className="animate-spin text-[#FF1E27]"><Loader2 size={32} /></div>
                ) : (
                  <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    {formatVND(walletBalance)}
                  </span>
                )}
              </div>

              <div className="text-xs text-[#8E92B2] z-10 flex justify-between items-center">
                <span>Tài khoản: {user.email}</span>
                <span className="text-green-400 font-mono">100% Nạp Tiền Tức Thì</span>
              </div>

              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#FF1E27]/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Top Up Options in VND */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle size={20} className="text-[#FF1E27]" />
                Nạp Tiền Nhanh Vào Ví
              </h3>

              {/* 50M VIP BUTTON */}
              <button 
                type="button"
                onClick={() => handleTopUpAmount(50000000)}
                disabled={isTopUpLoading}
                className="w-full py-5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-[#FF1E27] text-black font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-amber-500/30 flex items-center justify-center gap-3 border-2 border-yellow-300"
              >
                {isTopUpLoading ? (
                  <Loader2 size={24} className="animate-spin text-black" />
                ) : (
                  <>
                    <Sparkles size={24} className="animate-bounce" />
                    NẠP NGAY +50.000.000 ₫ (VIP CASH TỨC THÌ)
                  </>
                )}
              </button>

              <div className="grid grid-cols-3 gap-4">
                <button 
                  type="button"
                  onClick={() => handleTopUpAmount(1000000)}
                  disabled={isTopUpLoading}
                  className="py-3 rounded-xl bg-[#121220] border border-[#232338] hover:border-[#FF1E27] text-white font-bold transition-all text-sm"
                >
                  +1.000.000 ₫
                </button>
                <button 
                  type="button"
                  onClick={() => handleTopUpAmount(5000000)}
                  disabled={isTopUpLoading}
                  className="py-3 rounded-xl bg-[#121220] border border-[#232338] hover:border-[#FF1E27] text-white font-bold transition-all text-sm"
                >
                  +5.000.000 ₫
                </button>
                <button 
                  type="button"
                  onClick={() => handleTopUpAmount(10000000)}
                  disabled={isTopUpLoading}
                  className="py-3 rounded-xl bg-[#121220] border border-[#232338] hover:border-[#FF1E27] text-white font-bold transition-all text-sm"
                >
                  +10.000.000 ₫
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Real-time Notifications Tab */}
        {activeTab === 'notifications' && (
          <MaintenanceOverlay serviceName="notification">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1E1E2E] pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Bell size={24} className="text-[#FF1E27]" /> Thông Báo Hệ Thống
                  </h1>
                  <p className="text-xs text-[#8E92B2] mt-1">Danh sách thông báo khuyến mãi, đơn hàng và sự kiện Flash Sale.</p>
                </div>

                <div className="flex items-center gap-3">
                  {displayNotifications.length > 0 && (
                    <button
                      onClick={() => {
                        markAllAsRead();
                        toast.success('Đã đánh dấu tất cả thông báo là đã đọc!');
                      }}
                      className="bg-[#121220] hover:bg-[#1C1C30] border border-[#232338] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Check size={14} /> Đánh Dấu Đã Đọc ({unreadCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Notification Cards List */}
              {displayNotifications.length === 0 ? (
                <div className="text-center py-16 text-[#8E92B2]">
                  <Bell size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-medium">Bạn chưa có thông báo mới nào.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayNotifications.map((item: any) => (
                    <div
                      key={item.id}
                      onClick={() => markAsRead(item.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                        item.isRead
                          ? 'bg-[#08080E]/60 border-[#1A1A2A] opacity-75'
                          : 'bg-[#121220] border-[#FF1E27]/40 shadow-lg'
                      }`}
                    >
                      <div className="p-3 rounded-2xl bg-[#1A1A2A] text-[#FF1E27] flex-shrink-0">
                        {item.type === 'flash_sale' && <Zap size={20} className="fill-[#FF1E27]" />}
                        {item.type === 'voucher' && <Tag size={20} className="text-amber-400" />}
                        {item.type === 'order' && <Package size={20} className="text-emerald-400" />}
                        {item.type === 'system' && <Sparkles size={20} className="text-purple-400" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap md:flex-nowrap items-start justify-between gap-2">
                          <h4 className="font-extrabold text-sm text-white flex items-center gap-2 flex-1">
                            <span>{item.title}</span>
                            {!item.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#FF1E27] animate-pulse flex-shrink-0" />
                            )}
                          </h4>
                          <span className="text-[11px] text-[#5A5E7A] font-mono flex-shrink-0 whitespace-nowrap ml-auto">{item.timestamp}</span>
                        </div>
                        <p className="text-xs text-[#8E92B2] mt-1.5 leading-relaxed break-words">{item.message}</p>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={clearAll}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold transition-colors"
                    >
                      <Trash2 size={14} /> Xóa tất cả thông báo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </MaintenanceOverlay>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
