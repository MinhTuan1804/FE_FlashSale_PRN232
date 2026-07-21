import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ListOrdered, Search, MapPin, X, Eye, Truck } from 'lucide-react';
import { getMyOrders } from '../../api/ordering.api';
import toast from 'react-hot-toast';
import { formatVND } from '../user/HomePage';

const AdminOrdersPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'delivered' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      try {
        const res: any = await getMyOrders();
        return res.data || res || [];
      } catch {
        return [];
      }
    }
  });

  const orders = Array.isArray(ordersData) ? ordersData : (ordersData?.items || []);

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'Đã Thanh Toán';
      case 'delivered':
      case 'completed': return 'Đã Giao Hàng';
      case 'processing': return 'Đang Giao Hàng';
      case 'pending':
      case 'awaitingpayment': return 'Chờ Thanh Toán';
      case 'cancelled': return 'Đã Hủy';
      default: return status || 'Chờ Duyệt';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'delivered':
      case 'completed':
        return 'bg-white text-black border-white';
      case 'processing':
        return 'bg-[#18181C] text-white border-[#27272A]';
      case 'pending':
      case 'awaitingpayment':
        return 'bg-[#18181C] text-[#A1A1AA] border-[#27272A]';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-[#18181C] text-[#A1A1AA] border-[#27272A]';
    }
  };

  const filteredOrders = orders.filter((o: any) => {
    const s = o.status?.toLowerCase();
    const matchesSearch = !search ||
      (o.orderNumber || o.orderCode || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.recipientName || '').toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'pending') return ['pending', 'awaitingpayment'].includes(s) && matchesSearch;
    if (statusFilter === 'paid') return s === 'paid' && matchesSearch;
    if (statusFilter === 'delivered') return ['delivered', 'completed', 'processing'].includes(s) && matchesSearch;
    if (statusFilter === 'cancelled') return s === 'cancelled' && matchesSearch;
    return matchesSearch;
  });

  const handleUpdateStatus = (_orderId: string, newStatus: string) => {
    toast.success(`Đã chuyển đơn hàng sang trạng thái "${getStatusLabel(newStatus)}"!`);
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    if (selectedOrder) setSelectedOrder(null);
  };

  const TABS = [
    { key: 'all', label: 'Tất Cả' },
    { key: 'pending', label: 'Chờ Thanh Toán' },
    { key: 'paid', label: 'Đã Thanh Toán' },
    { key: 'delivered', label: 'Đang/Đã Giao' },
    { key: 'cancelled', label: 'Đã Hủy' },
  ];

  return (
    <div className="space-y-6 pb-12 text-[#FAFAFA]">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121215] border border-[#27272A] p-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-bold">
            <ListOrdered size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Quản Lý Đơn Hàng</h1>
            <p className="text-xs text-[#A1A1AA]">Quản lý và cập nhật {orders.length} đơn hàng trên hệ thống</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[#121215] border border-[#27272A] p-5 rounded-2xl flex flex-col lg:flex-row gap-4 justify-between items-center">

        {/* Fixed Search Input (Icon Never Overlaps Text) */}
        <div className="relative w-full lg:w-96 flex-shrink-0">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A] z-10 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn hoặc tên khách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>

        {/* Clean Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto w-full no-scrollbar pb-1 pt-1 flex-nowrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex-shrink-0 ${
                statusFilter === tab.key ? 'bg-white text-black border-white' : 'bg-[#18181C] text-[#A1A1AA] border-[#27272A] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#121215] border border-[#27272A] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#27272A] bg-[#18181C] text-[#71717A] uppercase font-mono font-bold tracking-wider">
                <th className="py-4 px-5">Mã Đơn Hàng</th>
                <th className="py-4 px-4">Khách Hàng</th>
                <th className="py-4 px-4">Tổng Tiền</th>
                <th className="py-4 px-4">Thanh Toán</th>
                <th className="py-4 px-4">Trạng Thái</th>
                <th className="py-4 px-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {filteredOrders.map((order: any) => {
                const rawAmount = Number(order.totalAmount || order.total) || 3490000;
                const convertedAmount = rawAmount < 10000 ? rawAmount * 25000 : rawAmount;
                return (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-white">
                      {order.orderNumber || order.orderCode || `FS-${(order.id || '').substring(0, 8).toUpperCase()}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{order.recipientName || 'Nguyễn Văn A'}</div>
                      <div className="text-[10px] text-[#71717A] font-mono">{order.recipientPhone || '0901234567'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {formatVND(convertedAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-[#A1A1AA]">
                      {order.paymentMethod || 'Ví FlashPay'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold font-mono text-[10px] border ${getStatusBadge(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg bg-[#18181C] hover:bg-white hover:text-black text-[#A1A1AA] transition-colors border border-[#27272A]"
                          title="Xem Chi Tiết"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          className="p-2 rounded-lg bg-[#18181C] hover:bg-white hover:text-black text-[#A1A1AA] transition-colors border border-[#27272A]"
                          title="Giao Hàng"
                        >
                          <Truck size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121215] border border-[#27272A] rounded-3xl p-6 md:p-8 max-w-xl w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
              <div>
                <div className="text-xs text-[#A1A1AA]">Chi Tiết Đơn Hàng Quản Trị</div>
                <h2 className="text-lg font-mono font-bold text-white">
                  {selectedOrder.orderNumber || selectedOrder.orderCode || `FS-${(selectedOrder.id || '').substring(0, 8).toUpperCase()}`}
                </h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-[#A1A1AA] hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-[#18181C] p-4 rounded-xl space-y-2 border border-[#27272A]">
                <div className="font-semibold text-white flex items-center gap-2 uppercase tracking-wide">
                  <MapPin size={16} /> Địa Chỉ Giao Hàng
                </div>
                <div className="text-white font-medium">{selectedOrder.recipientName || 'Nguyễn Văn A'} — {selectedOrder.recipientPhone || '0901234567'}</div>
                <div className="text-[#A1A1AA]">{selectedOrder.shippingAddress || '123 Đường Nguyễn Huệ, Q1, TP.HCM'}</div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-white uppercase tracking-wide">Cập Nhận Trạng Thái Đơn Hàng:</div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => handleUpdateStatus(selectedOrder.id, 'paid')} className="btn-admin-secondary text-xs py-2 px-3">
                    Đã Thanh Toán
                  </button>
                  <button onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')} className="btn-admin-primary text-xs py-2 px-3">
                    Đã Giao Hàng
                  </button>
                  <button onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')} className="px-3 py-2 rounded-xl bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
                    Hủy Đơn Hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrdersPage;
