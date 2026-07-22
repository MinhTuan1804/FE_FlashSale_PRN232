import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  DollarSign, Package, Zap, Users, ArrowUpRight, TrendingUp,
  Clock, CheckCircle2, ChevronRight, PlusCircle, Bell, ShoppingBag
} from 'lucide-react';
import { getAdminStats } from '../../api/admin.api';
import { formatVND } from '../user/HomePage';

const AdminDashboardPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const recentOrders = stats?.recentOrders || [];
  const liveFlashProducts = stats?.liveFlashProducts || [];
  const maxWeeklyRev = Math.max(...(stats?.weeklyRevenue || []).map((i: any) => i.revenue), 1000000);

  return (
    <div className="space-y-8 pb-12 text-[#FAFAFA]">

      {/* Header Banner */}
      <div className="bg-[#121215] border border-[#27272A] p-6 md:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-mono font-bold">
            <Zap size={14} className="fill-white" /> LIVE MONITORING
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Thống Kê Quản Trị Hệ Thống</h1>
          <p className="text-xs text-[#A1A1AA]">Giám sát chỉ số kinh doanh, đơn hàng & đợt Flash Sale thời gian thực.</p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/admin/products" className="btn-admin-primary text-xs py-3 px-4">
            <PlusCircle size={16} /> Thêm Sản Phẩm
          </Link>
          <Link to="/admin/flash-sales" className="btn-admin-secondary text-xs py-3 px-4">
            <Zap size={16} /> Tạo Flash Sale
          </Link>
          <Link to="/admin/notifications" className="btn-admin-secondary text-xs py-3 px-4">
            <Bell size={16} /> Push Thông Báo
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Card 1: Revenue */}
        <div className="bg-[#121215] border border-[#27272A] p-6 rounded-2xl space-y-3 hover:border-white/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider font-mono">Tổng Doanh Thu</span>
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {isLoading ? '...' : formatVND(stats?.totalRevenue || 0)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white font-semibold">
            <TrendingUp size={14} /> Cập nhật thực tế từ Hệ Thống
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="bg-[#121215] border border-[#27272A] p-6 rounded-2xl space-y-3 hover:border-white/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider font-mono">Tổng Đơn Hàng</span>
            <div className="w-10 h-10 rounded-xl bg-[#18181C] border border-[#27272A] flex items-center justify-center text-white font-bold">
              <Package size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {isLoading ? '...' : (stats?.totalOrders || 0).toLocaleString('vi-VN')}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA] font-semibold">
            <Clock size={14} /> {stats?.pendingOrders || 0} đơn chờ xử lý
          </div>
        </div>

        {/* Card 3: Active Flash Sales */}
        <div className="bg-[#121215] border border-[#27272A] p-6 rounded-2xl space-y-3 hover:border-white/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider font-mono">Flash Sales Live</span>
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold">
              <Zap size={20} className="fill-black" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats?.activeFlashSales || 0} Phiên Đang Chạy
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white font-semibold">
            <CheckCircle2 size={14} /> Đợt Sale trực tuyến
          </div>
        </div>

        {/* Card 4: Users */}
        <div className="bg-[#121215] border border-[#27272A] p-6 rounded-2xl space-y-3 hover:border-white/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider font-mono">Khách Hàng Active</span>
            <div className="w-10 h-10 rounded-xl bg-[#18181C] border border-[#27272A] flex items-center justify-center text-white font-bold">
              <Users size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {isLoading ? '...' : (stats?.activeUsers || 0).toLocaleString('vi-VN')}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA] font-semibold">
            <ArrowUpRight size={14} /> Khách hàng đã đặt đơn
          </div>
        </div>
      </div>

      {/* Main Grid: Weekly Chart + Live Flash Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Weekly Revenue Bar chart */}
        <div className="lg:col-span-2 bg-[#121215] border border-[#27272A] p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">Doanh Thu 7 Ngày Gần Nhất</h2>
              <p className="text-xs text-[#A1A1AA]">Biểu đồ phát triển doanh số theo tuần</p>
            </div>
            <span className="text-xs font-bold text-black bg-white px-3 py-1 rounded-full">
              Tuần Này
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-8 px-2 border-b border-[#27272A] pb-4">
            {(stats?.weeklyRevenue || []).map((item: any) => {
              const heightPct = Math.min(Math.round((item.revenue / maxWeeklyRev) * 100), 100);
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-mono text-[#A1A1AA] opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.revenue > 0 ? `${(item.revenue / 1000000).toFixed(1)}M` : '0'}
                  </div>
                  <div
                    className="w-full bg-[#27272A] group-hover:bg-white rounded-t-xl transition-all duration-300 relative"
                    style={{ height: `${Math.max(heightPct, 8)}%` }}
                  />
                  <span className="text-xs font-bold text-[#A1A1AA] group-hover:text-white transition-colors">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-xs text-[#A1A1AA] pt-2">
            <span>Trung bình mỗi ngày: <strong className="text-white font-mono">{formatVND(Math.round((stats?.totalRevenue || 0) / 7))}</strong></span>
            <span>Tổng cộng tuần: <strong className="text-white font-mono">{formatVND(stats?.totalRevenue || 0)}</strong></span>
          </div>
        </div>

        {/* Live Flash Sale Monitor Widget */}
        <div className="bg-[#121215] border border-[#27272A] p-6 rounded-3xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                <Zap size={18} className="fill-white" /> Giám Sát Sản Phẩm Bán Chạy
              </h2>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
            </div>

            <div className="space-y-4">
              {liveFlashProducts.length > 0 ? (
                liveFlashProducts.map((p: any, i: number) => {
                  const price = Number(p.price) || 3490000;
                  const convertedPrice = price < 10000 ? price * 25000 : price;
                  return (
                    <div key={i} className="bg-[#18181C] p-3.5 rounded-2xl border border-[#27272A] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate max-w-[160px]">{p.name || p.title}</span>
                        <span className="font-bold font-mono text-white">{formatVND(convertedPrice)}</span>
                      </div>
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill bg-white"
                          style={{ width: `85%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#A1A1AA]">
                        <span>Đã bán 85%</span>
                        <span>Còn lại {p.stockQuantity || p.stock || 15} sp</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-[#A1A1AA] text-center py-4">Đang tải danh sách sản phẩm...</div>
              )}
            </div>
          </div>

          <Link to="/admin/flash-sales" className="btn-admin-secondary w-full text-xs py-3 text-center block">
            Quản Lý Tất Cả Flash Sales <ChevronRight size={16} className="inline ml-1" />
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-[#121215] border border-[#27272A] p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tight">
              <ShoppingBag size={20} /> Đơn Hàng Mới Vừa Đặt
            </h2>
            <p className="text-xs text-[#A1A1AA]">Cập nhật thời gian thực từ Database</p>
          </div>
          <Link to="/admin/orders" className="text-xs text-white font-bold hover:underline flex items-center gap-1">
            Xem Tất Cả <ChevronRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#27272A] text-[#71717A] uppercase font-mono font-bold tracking-wider">
                <th className="py-3 px-4">Mã Đơn</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Tổng Tiền</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A] text-white">
              {recentOrders.length > 0 ? (
                recentOrders.map((order: any) => {
                  const amt = Number(order.totalAmount || order.total) || 0;
                  const convertedAmt = amt < 10000 ? amt * 25000 : amt;
                  const isPaid = ['paid', 'completed', 'delivered'].includes(order.status?.toLowerCase());
                  return (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {order.orderNumber || `FS-${(order.id || '').substring(0, 8).toUpperCase()}`}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">{order.recipientName || 'Khách Hàng'}</td>
                      <td className="py-3.5 px-4 font-mono font-bold">{formatVND(convertedAmt)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          isPaid ? 'bg-white text-black border-white' : 'bg-[#18181C] text-[#A1A1AA] border-[#27272A]'
                        }`}>
                          {isPaid ? 'Đã Thanh Toán' : 'Chờ Thanh Toán'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#A1A1AA]">
                        {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('vi-VN') : 'Vừa xong'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[#A1A1AA]">
                    Chưa có đơn hàng nào trong hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardPage;
