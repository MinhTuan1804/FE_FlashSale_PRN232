import { useState } from 'react';
import { Users, Search, Wallet, Plus, Lock, Unlock, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatVND } from '../user/HomePage';

const AdminUsersPage = () => {
  const [search, setSearch] = useState('');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('50000000');

  const [usersList, setUsersList] = useState([
    { id: 'USR-001', email: 'admin@flashshop.com', role: 'ADMIN', balance: 100000000, status: 'ACTIVE', joined: '01/01/2026' },
    { id: 'USR-002', email: 'customer@gmail.com', role: 'CUSTOMER', balance: 50000000, status: 'ACTIVE', joined: '10/02/2026' },
    { id: 'USR-003', email: 'gamer_pro@yahoo.com', role: 'CUSTOMER', balance: 25000000, status: 'ACTIVE', joined: '15/03/2026' },
    { id: 'USR-004', email: 'buyer_vip@outlook.com', role: 'CUSTOMER', balance: 120000000, status: 'ACTIVE', joined: '20/03/2026' },
    { id: 'USR-005', email: 'test_account@domain.com', role: 'CUSTOMER', balance: 10000000, status: 'LOCKED', joined: '05/04/2026' },
  ]);

  const filteredUsers = usersList.filter(u =>
    !search || u.email.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenTopUp = (u: any) => {
    setSelectedUser(u);
    setTopUpAmount('50000000');
    setIsTopUpOpen(true);
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(topUpAmount) || 0;
    if (amountNum <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    setUsersList(usersList.map(u => u.id === selectedUser.id ? { ...u, balance: u.balance + amountNum } : u));
    toast.success(`Đã nạp +${formatVND(amountNum)} cho tài khoản ${selectedUser.email}!`);
    setIsTopUpOpen(false);
  };

  const handleToggleLock = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    setUsersList(usersList.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    toast.success(`Đã ${newStatus === 'LOCKED' ? 'khóa' : 'mở khóa'} tài khoản thành công!`);
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
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-white">{u.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] ${
                      u.role === 'ADMIN' ? 'bg-white text-black border border-white' : 'bg-[#18181C] text-[#A1A1AA] border border-[#27272A]'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {formatVND(u.balance)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full font-bold font-mono text-[10px] ${
                      u.status === 'ACTIVE' ? 'bg-white/10 text-white border border-white/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {u.status === 'ACTIVE' ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}
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
                        onClick={() => handleToggleLock(u.id, u.status)}
                        className="p-2 rounded-lg bg-[#18181C] hover:bg-white hover:text-black text-[#A1A1AA] transition-colors border border-[#27272A]"
                        title={u.status === 'ACTIVE' ? 'Khóa Tài Khoản' : 'Mở Khóa'}
                      >
                        {u.status === 'ACTIVE' ? <Lock size={14} /> : <Unlock size={14} className="text-white" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOP UP MODAL */}
      {isTopUpOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121215] border border-[#27272A] rounded-3xl p-6 md:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                <Wallet size={20} />
                Nạp Số Dư Ví Cho Khách Hàng
              </h2>
              <button onClick={() => setIsTopUpOpen(false)} className="text-[#A1A1AA] hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTopUpSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Email Nhận Tiền</label>
                <input type="text" disabled value={selectedUser.email} className="input-dark bg-[#18181C] border-[#27272A] opacity-60 font-semibold" />
              </div>

              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Số Dư Hiện Tại</label>
                <div className="text-base font-bold font-mono text-white">{formatVND(selectedUser.balance)}</div>
              </div>

              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Số Tiền Nạp Thêm (₫) *</label>
                <input
                  type="number"
                  required
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="input-dark bg-[#18181C] border-[#27272A] focus:border-white text-sm font-mono font-bold text-white"
                />
              </div>

              <div className="flex gap-2">
                {[10000000, 50000000, 100000000].map((quickAmt) => (
                  <button
                    key={quickAmt}
                    type="button"
                    onClick={() => setTopUpAmount(quickAmt.toString())}
                    className="btn-admin-secondary text-[10px] flex-1 py-2 px-1 font-mono"
                  >
                    +{formatVND(quickAmt)}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setIsTopUpOpen(false)} className="btn-admin-secondary flex-1 py-3">
                  Hủy
                </button>
                <button type="submit" className="btn-admin-primary flex-1 py-3">
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
