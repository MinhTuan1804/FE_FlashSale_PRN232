import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Wallet, Plus, Lock, Unlock, X, Check } from 'lucide-react';
import { adminGetAllUsers, adminToggleUserActive, adminTopUpWallet } from '../../api/admin.api';
import toast from 'react-hot-toast';
import { formatVND } from '../user/HomePage';

const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('50000000');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        const res: any = await adminGetAllUsers();
        return res.data?.items || res.items || res.data || res || [];
      } catch {
        return [];
      }
    },
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const usersList = Array.isArray(usersData) ? usersData : [];

  const filteredUsers = usersList.filter((u: any) =>
    !search || 
    (u.email || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.id || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.fullName || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenTopUp = (u: any) => {
    setSelectedUser(u);
    setTopUpAmount('50000000');
    setIsTopUpOpen(true);
  };

  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(topUpAmount) || 0;
    if (amountNum <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    try {
      await adminTopUpWallet(selectedUser.id, amountNum);
      toast.success(`Đã nạp +${formatVND(amountNum)} cho tài khoản ${selectedUser.email || selectedUser.fullName}!`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsTopUpOpen(false);
    } catch {
      toast.error('Nạp tiền vào ví thất bại!');
    }
  };

  const handleToggleLock = async (userId: string) => {
    try {
      await adminToggleUserActive(userId);
      toast.success('Đã cập nhật trạng thái tài khoản thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch {
      toast.error('Cập nhật trạng thái thất bại.');
    }
  };

  return (
    <div className="space-y-6 pb-12 text-[#FAFAFA]">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121215] border border-[#27272A] p-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-bold">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Quản Lý Khách Hàng & Ví FlashPay</h1>
            <p className="text-xs text-[#A1A1AA]">Quản lý tài khoản, phân quyền và số dư ví điện tử</p>
          </div>
        </div>
      </div>

      {/* Fixed Search Input */}
      <div className="bg-[#121215] border border-[#27272A] p-5 rounded-2xl">
        <div className="relative w-full md:w-96 flex-shrink-0">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A] z-10 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo email hoặc User ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#121215] border border-[#27272A] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#27272A] bg-[#18181C] text-[#71717A] uppercase font-mono font-bold tracking-wider">
                <th className="py-4 px-5">User ID</th>
                <th className="py-4 px-4">Email Khách Hàng</th>
                <th className="py-4 px-4">Vai Trò</th>
                <th className="py-4 px-4">Số Dư Ví FlashPay</th>
                <th className="py-4 px-4">Trạng Thái</th>
                <th className="py-4 px-4 text-right">Quản Lý Ví / Khóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#A1A1AA]">
                    Đang tải danh sách người dùng từ hệ thống...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u: any) => {
                  const role = u.role || (u.roles && u.roles[0]) || 'Customer';
                  const isActive = u.isActive ?? u.status === 'ACTIVE';
                  const balance = u.walletBalance !== undefined ? Number(u.walletBalance) : (u.balance !== undefined ? Number(u.balance) : 0);
                  return (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-white max-w-[120px] truncate">
                        {(u.id || '').substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div>{u.fullName || u.userName}</div>
                        <div className="text-[10px] text-[#A1A1AA]">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] ${
                          role.toUpperCase() === 'ADMIN' ? 'bg-white text-black border border-white' : 'bg-[#18181C] text-[#A1A1AA] border border-[#27272A]'
                        }`}>
                          {role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {formatVND(balance)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold font-mono text-[10px] ${
                          isActive ? 'bg-white/10 text-white border border-white/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {isActive ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenTopUp(u)}
                            className="btn-admin-primary text-[11px] py-1.5 px-3"
                          >
                            <Plus size={14} /> Nạp Ví
                          </button>
                          <button
                            onClick={() => handleToggleLock(u.id)}
                            className="p-2 rounded-lg bg-[#18181C] hover:bg-white hover:text-black text-[#A1A1AA] transition-colors border border-[#27272A]"
                            title={isActive ? 'Khóa Tài Khoản' : 'Mở Khóa'}
                          >
                            {isActive ? <Lock size={14} /> : <Unlock size={14} className="text-white" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#A1A1AA]">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOP UP MODAL */}
      {isTopUpOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121215] border border-[#27272A] rounded-[2rem] p-6 md:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                <Wallet size={20} className="text-white" />
                Nạp Số Dư Ví Cho Khách Hàng
              </h2>
              <button onClick={() => setIsTopUpOpen(false)} className="w-8 h-8 rounded-full bg-[#18181C] hover:bg-white hover:text-black text-[#A1A1AA] flex items-center justify-center transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTopUpSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Email Nhận Tiền</label>
                <input type="text" disabled value={selectedUser.email || selectedUser.fullName} className="input-dark bg-[#18181C] border-[#27272A] opacity-60 font-semibold" />
              </div>

              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Số Dư Hiện Tại</label>
                <div className="text-lg font-bold font-mono text-white bg-[#18181C] border border-[#27272A] px-4 py-2.5 rounded-xl">
                  {formatVND(Number(selectedUser.walletBalance ?? selectedUser.balance ?? 0) || 0)}
                </div>
              </div>

              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Số Tiền Nạp Thêm (₫) *</label>
                <input
                  type="number"
                  required
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="input-dark bg-[#18181C] border-[#27272A] focus:border-white text-base font-mono font-bold text-white"
                />
              </div>

              <div className="flex gap-2">
                {[10000000, 50000000, 100000000].map((quickAmt) => (
                  <button
                    key={quickAmt}
                    type="button"
                    onClick={() => setTopUpAmount(quickAmt.toString())}
                    className="btn-admin-secondary text-[11px] flex-1 py-2.5 px-2 font-mono whitespace-nowrap"
                  >
                    +{formatVND(quickAmt)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button type="button" onClick={() => setIsTopUpOpen(false)} className="btn-admin-secondary py-3 px-6 font-semibold text-xs rounded-xl whitespace-nowrap">
                  Hủy
                </button>
                <button type="submit" className="btn-admin-primary flex-1 py-3 px-6 whitespace-nowrap font-bold text-xs rounded-xl flex items-center justify-center gap-2">
                  <Check size={16} /> Xác Nhận Nạp Tiền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsersPage;
