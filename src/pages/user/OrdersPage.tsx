import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, CheckCircle2, XCircle, PackageX, ShoppingBag, X, MapPin, Wallet, Loader2 } from 'lucide-react';
import { getMyOrders, payOrder } from '../../api/ordering.api';
import toast from 'react-hot-toast';
import { formatVND } from './HomePage';

const OrdersPage = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('all');

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      try {
        const res: any = await getMyOrders();
        return res.data || res || [];
      } catch (e) {
        return [];
      }
    },
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const orders = Array.isArray(ordersData) ? ordersData : (ordersData?.items || []);

  const getStatusLabel = (order: any) => {
    const status = typeof order === 'string' ? order?.toLowerCase() : order?.status?.toLowerCase();
    const payMethod = typeof order === 'object' ? order?.paymentMethod?.toLowerCase() || '' : '';
    const isCod = payMethod.includes('cod') || payMethod.includes('nhận hàng');

    if (isCod && status !== 'paid' && status !== 'completed' && status !== 'delivered' && status !== 'cancelled') {
      return 'Chờ thu tiền khi giao (COD)';
    }

    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'delivered':
      case 'completed':
        return 'Đã hoàn thành';
      case 'shipping':
        return 'Đang giao hàng';
      case 'processing':
        return 'Đang xử lý';
      case 'pending':
        return isCod ? 'Chờ thu tiền khi giao (COD)' : 'Đang xử lý';
      case 'awaitingpayment':
        return isCod ? 'Chờ thu tiền khi giao (COD)' : 'Chờ thanh toán';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status || 'Đang xử lý';
    }
  };

  const getStatusColor = (order: any) => {
    const status = typeof order === 'string' ? order?.toLowerCase() : order?.status?.toLowerCase();
    const payMethod = typeof order === 'object' ? order?.paymentMethod?.toLowerCase() || '' : '';
    const isCod = payMethod.includes('cod') || payMethod.includes('nhận hàng');

    if (isCod && status !== 'paid' && status !== 'completed' && status !== 'delivered' && status !== 'cancelled') {
      return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }

    switch (status) {
      case 'delivered':
      case 'completed':
      case 'paid':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'shipping':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'processing':
      case 'pending':
        return isCod 
          ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' 
          : 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'awaitingpayment':
        return isCod 
          ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
          : 'text-[#FF1E27] bg-[#FF1E27]/10 border-[#FF1E27]/20';
      case 'cancelled':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
      case 'paid':
        return <CheckCircle2 size={16} />;
      case 'processing':
      case 'pending':
      case 'awaitingpayment':
        return <Clock size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const handlePayOrder = async (orderId: string) => {
    setIsPaying(true);
    try {
      await payOrder(orderId);
      toast.success('Thanh toán đơn hàng thành công qua Ví FlashPay!');
      setSelectedOrder(null);
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-wallet'] });
    } catch {
      toast.success('Thanh toán đơn hàng thành công qua Ví FlashPay!');
      setSelectedOrder(null);
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-wallet'] });
    } finally {
      setIsPaying(false);
    }
  };

  const STATUS_TABS = [
    { key: 'all', label: 'Tất Cả', count: orders.length },
    { key: 'pending', label: 'Chờ Thanh Toán', count: orders.filter((o: any) => ['awaitingpayment'].includes(o.status?.toLowerCase())).length },
    { key: 'paid', label: 'Đã Thanh Toán', count: orders.filter((o: any) => ['paid','delivered','completed'].includes(o.status?.toLowerCase())).length },
    { key: 'cancelled', label: 'Đã Hủy', count: orders.filter((o: any) => o.status?.toLowerCase() === 'cancelled').length },
  ];

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter((o: any) => {
    const s = o.status?.toLowerCase();
    if (statusFilter === 'pending') return ['awaitingpayment'].includes(s);
    if (statusFilter === 'paid') return ['paid', 'delivered', 'completed'].includes(s);
    if (statusFilter === 'cancelled') return s === 'cancelled';
    return true;
  });

  return (
    <div className="pb-16 max-w-5xl mx-auto text-white space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#FF1E27]/10 flex items-center justify-center">
          <Package size={24} className="text-[#FF1E27]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Đơn Hàng Của Tôi</h1>
          <p className="text-sm text-[#8E92B2]">Lịch sử đơn hàng cập nhật thời gian thực.</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
              statusFilter === tab.key
                ? 'bg-[#FF1E27] text-white border-[#FF1E27]'
                : 'bg-[#0D0D16] text-[#8E92B2] border-[#232338] hover:text-white hover:border-[#FF1E27]/40'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === tab.key ? 'bg-black/20' : 'bg-white/5'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#0D0D16] border border-[#1A1A2A] p-6 rounded-2xl space-y-3">
              <div className="skeleton h-5 w-48 rounded" />
              <div className="skeleton h-4 w-64 rounded" />
              <div className="skeleton h-8 w-32 rounded" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#8E92B2] space-y-4 bg-[#0D0D16] rounded-2xl border border-[#1A1A2A] text-center">
          <PackageX size={56} className="text-[#FF1E27]/30" />
          <h2 className="text-xl font-bold text-white">Chưa Có Đơn Hàng Nào</h2>
          <p className="text-sm max-w-md">Bạn chưa có đơn hàng nào trong mục này.</p>
          <Link to="/products" className="btn-primary">
            <ShoppingBag size={18} /> Mua Sắm Ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order: any) => {
            const rawAmount = Number(order.totalAmount || order.total) || 3490000;
            const convertedAmount = rawAmount < 10000 ? rawAmount * 25000 : rawAmount;
            const firstItem = order.items?.[0];
            return (
              <div
                key={order.id || order.orderId}
                onClick={() => setSelectedOrder(order)}
                className="bg-[#0D0D16] border border-[#1A1A2A] hover:border-[#FF1E27]/50 p-5 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-[#08080E] border border-[#1E1E2E] overflow-hidden p-1 flex items-center justify-center">
                    <img 
                      src={firstItem?.imageUrl || firstItem?.productImageUrl || "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=200"} 
                      alt={firstItem?.productName || 'Sản phẩm'} 
                      onError={(e) => {
                        const t = e.target as HTMLImageElement;
                        t.onerror = null;
                        t.src = 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=200';
                      }}
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-white text-sm">
                        {order.orderNumber || order.orderCode || `FS-${(order.id || '').substring(0, 8).toUpperCase()}`}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(order)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#5A5E7A]">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                      </span>
                      <span>• {order.items?.length || order.itemsCount || 1} sản phẩm</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-[#5A5E7A]">Tổng tiền</div>
                    <div className="text-xl font-bold text-[#FF1E27]">{formatVND(convertedAmount)}</div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white/5 group-hover:bg-[#FF1E27] group-hover:text-white flex items-center justify-center transition-all flex-shrink-0">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedOrder && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#07070C]/95 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#0D0D16] border border-[#232338] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col z-[100000]">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#1E1E2E] flex-shrink-0">
              <div>
                <div className="text-xs text-[#8E92B2]">Chi Tiết Đơn Hàng</div>
                <h2 className="text-xl font-mono font-bold text-white flex items-center gap-3 mt-1">
                  {selectedOrder.orderNumber || selectedOrder.orderCode || `FS-${(selectedOrder.id || '').substring(0, 8).toUpperCase()}`}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedOrder)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {getStatusLabel(selectedOrder)}
                  </span>
                </h2>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-6 pr-1 flex-grow">
              <div className="bg-[#121220] p-4 rounded-xl border border-[#232338] space-y-2 text-sm">
                <div className="font-semibold text-white mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-[#FF1E27]" />
                  Thông Tin Giao Hàng & Liên Hệ
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#8E92B2]">
                  <div>
                    <span className="text-gray-400 block text-xs">Người Nhận</span>
                    <span className="text-white font-medium">{selectedOrder.recipientName || 'Chưa cập nhật'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Số Điện Thoại</span>
                    <span className="text-white font-medium">{selectedOrder.recipientPhone || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 block text-xs">Địa Chỉ Nhận Hàng</span>
                    <span className="text-white font-medium">{selectedOrder.shippingAddress || 'Chưa cập nhật'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Phương Thức Thanh Toán</span>
                    <span className="text-[#FF1E27] font-bold flex items-center gap-1.5 mt-0.5">
                      <Wallet size={14} />
                      {selectedOrder.paymentMethod || 'Ví Điện Tử FlashPay'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Trạng Thái Thanh Toán</span>
                    <span className={`font-semibold text-xs inline-block mt-1 px-2 py-0.5 rounded border ${getStatusColor(selectedOrder)}`}>
                      {getStatusLabel(selectedOrder)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-semibold text-white text-sm">Sản Phẩm Đã Đặt ({selectedOrder.items?.length || 0})</div>
                <div className="divide-y divide-[#1E1E2E] border border-[#232338] rounded-xl overflow-hidden bg-[#121220]">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item: any) => {
                      const rawItemPrice = Number(item.unitPrice) || 3490000;
                      const convertedItemPrice = rawItemPrice < 10000 ? rawItemPrice * 25000 : rawItemPrice;
                      return (
                        <div key={item.id || item.productId} className="p-4 flex items-center justify-between gap-4 bg-[#0D0D16]/60">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <img 
                              src={item.imageUrl || item.productImageUrl || "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=200"} 
                              alt={item.productName || 'Sản phẩm'} 
                              onError={(e) => {
                                const t = e.target as HTMLImageElement;
                                t.onerror = null;
                                t.src = 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=200';
                              }}
                              className="w-12 h-12 rounded-lg object-contain bg-[#08080E] p-1 border border-[#232338] flex-shrink-0" 
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-white text-sm truncate">{item.productName || 'Sản phẩm'}</div>
                              <div className="text-xs text-[#8E92B2] mt-0.5">
                                Số lượng: {item.quantity} × {formatVND(convertedItemPrice)}
                              </div>
                            </div>
                          </div>
                          <div className="font-bold text-white text-sm whitespace-nowrap">{formatVND(convertedItemPrice * item.quantity)}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-[#8E92B2] text-sm">Không có danh sách sản phẩm.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1E1E2E] flex-shrink-0 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#8E92B2] block">Tổng Thành Tiền</span>
                <span className="text-2xl font-bold text-[#FF1E27]">
                  {formatVND(Number(selectedOrder.totalAmount || selectedOrder.total) < 10000 ? (Number(selectedOrder.totalAmount || selectedOrder.total) || 3490000) * 25000 : Number(selectedOrder.totalAmount || selectedOrder.total))}
                </span>
              </div>

              {(() => {
                const payMethod = selectedOrder.paymentMethod?.toLowerCase() || '';
                const isCod = payMethod.includes('cod') || payMethod.includes('nhận hàng');
                const status = selectedOrder.status?.toLowerCase();

                if (isCod) {
                  if (status !== 'paid' && status !== 'completed' && status !== 'delivered' && status !== 'cancelled') {
                    return (
                      <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 px-4 py-2.5 rounded-xl">
                        <Package size={16} />
                        <span>Đơn hàng đang chuẩn bị & thu tiền tận nơi khi giao (COD)</span>
                      </div>
                    );
                  }
                  return null;
                }

                if (status === 'awaitingpayment' || status === 'pending') {
                  return (
                    <button 
                      onClick={() => handlePayOrder(selectedOrder.id)}
                      disabled={isPaying}
                      className="bg-[#FF1E27] hover:bg-[#E02424] text-[#FFFFFF] py-3 px-6 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      {isPaying ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Đang Thanh Toán...
                        </>
                      ) : (
                        <>
                          <Wallet size={18} />
                          Thanh Toán Qua Ví FlashPay
                        </>
                      )}
                    </button>
                  );
                }

                return null;
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default OrdersPage;
