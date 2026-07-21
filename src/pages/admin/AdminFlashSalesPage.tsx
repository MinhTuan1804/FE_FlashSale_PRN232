import { useState } from 'react';
import { Zap, Plus, Clock, Flame, Sparkles, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatVND } from '../user/HomePage';

const AdminFlashSalesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionSlot, setSessionSlot] = useState('00:00 - 12:00');
  const [productName, setProductName] = useState('');
  const [originalPrice, setOriginalPrice] = useState('5900000');
  const [flashPrice, setFlashPrice] = useState('3490000');
  const [stockLimit, setStockLimit] = useState('20');

  const flashSessions = [
    {
      id: 1,
      title: 'Đang Diễn Ra (00:00 - 12:00)',
      status: 'ACTIVE',
      icon: Flame,
      products: [
        { name: 'Apex Pro SteelSeries + Chuột Prime', original: 5900000, flash: 3490000, sold: 88, total: 100 },
        { name: 'Tai nghe Arctis Nova Pro Wireless', original: 8490000, flash: 5990000, sold: 75, total: 100 },
        { name: 'Chuột Razer Viper V3 Pro', original: 3890000, flash: 2890000, sold: 94, total: 100 },
        { name: 'ROG Swift OLED 360Hz', original: 22990000, flash: 18990000, sold: 100, total: 100, soldOut: true },
      ]
    },
    {
      id: 2,
      title: 'Sắp Diễn Ra (12:00 - 18:00)',
      status: 'SCHEDULED',
      icon: Zap,
      products: [
        { name: 'Bàn phím Pro-X Custom Bluetooth', original: 4500000, flash: 2890000, sold: 15, total: 50 },
        { name: 'Màn hình Samsung Odyssey G9 240Hz', original: 34990000, flash: 24990000, sold: 10, total: 20 },
      ]
    },
    {
      id: 3,
      title: 'Đợt Cuối Ngày (18:00 - 24:00)',
      status: 'SCHEDULED',
      icon: Sparkles,
      products: [
        { name: 'Card RTX 4090 OC 24GB', original: 54990000, flash: 45990000, sold: 50, total: 100 },
        { name: 'Tay Cầm Xbox Elite Series 2', original: 3490000, flash: 2490000, sold: 40, total: 100 },
      ]
    }
  ];

  const handleCreateFlashSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !flashPrice) {
      toast.error('Vui lòng điền đầy đủ tên và giá Flash Sale!');
      return;
    }
    toast.success(`Đã thêm "${productName}" vào khung giờ ${sessionSlot}!`);
    setIsModalOpen(false);
    setProductName('');
  };

  return (
    <div className="space-y-6 pb-12 text-[#FAFAFA]">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121215] border border-[#27272A] p-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-bold">
            <Zap size={24} className="fill-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Quản Lý Flash Sales Giờ Vàng</h1>
            <p className="text-xs text-[#A1A1AA]">Cấu hình khung giờ giảm giá giờ vàng & phân bổ số lượng sản phẩm</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-admin-primary">
          <Plus size={18} /> Cấu Hình Flash Sale Mới
        </button>
      </div>

      {/* Sessions */}
      <div className="space-y-6">
        {flashSessions.map((session) => {
          const Icon = session.icon;
          return (
            <div key={session.id} className="bg-[#121215] border border-[#27272A] rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#18181C] text-white border border-[#27272A]">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white uppercase tracking-tight">{session.title}</h2>
                    <span className="text-xs text-[#A1A1AA] flex items-center gap-1 mt-0.5 font-mono">
                      <Clock size={12} /> {session.products.length} sản phẩm áp dụng
                    </span>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                  session.status === 'ACTIVE'
                    ? 'bg-white text-black border-white'
                    : 'bg-[#18181C] text-[#A1A1AA] border-[#27272A]'
                }`}>
                  {session.status === 'ACTIVE' ? 'LIVE NOW' : 'SCHEDULED'}
                </span>
              </div>

              {/* Product items in this session */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {session.products.map((p, idx) => (
                  <div key={idx} className="bg-[#18181C] border border-[#27272A] p-4 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-bold text-white text-xs line-clamp-1">{p.name}</div>
                      <span className="bg-white text-black font-mono font-black text-[10px] py-0.5 px-2 rounded-full">
                        -{Math.round((1 - p.flash / p.original) * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#71717A] line-through font-mono">{formatVND(p.original)}</span>
                      <span className="font-bold font-mono text-white text-sm">{formatVND(p.flash)}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill bg-white" style={{ width: `${(p.sold / p.total) * 100}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#A1A1AA]">
                        <span>Đã bán: {p.sold}/{p.total}</span>
                        <span>{p.soldOut ? 'Đã hết hàng' : `Còn lại ${p.total - p.sold}`}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121215] border border-[#27272A] rounded-3xl p-6 md:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                <Zap size={20} className="fill-white" />
                Thêm Sản Phẩm Vào Flash Sale
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A1A1AA] hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateFlashSale} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Khung Giờ Sale</label>
                <select
                  value={sessionSlot}
                  onChange={(e) => setSessionSlot(e.target.value)}
                  className="input-dark bg-[#18181C] border-[#27272A] focus:border-white cursor-pointer"
                >
                  <option value="00:00 - 12:00">Khung giờ 00:00 - 12:00 (Sáng)</option>
                  <option value="12:00 - 18:00">Khung giờ 12:00 - 18:00 (Chiều)</option>
                  <option value="18:00 - 24:00">Khung giờ 18:00 - 24:00 (Đêm)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Tên Sản Phẩm *</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên sản phẩm..."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="input-dark bg-[#18181C] border-[#27272A] focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Giá Niêm Yết (₫)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="input-dark bg-[#18181C] border-[#27272A] focus:border-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Giá Flash Sale (₫) *</label>
                  <input
                    type="number"
                    required
                    value={flashPrice}
                    onChange={(e) => setFlashPrice(e.target.value)}
                    className="input-dark bg-[#18181C] border-[#27272A] focus:border-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Số Lượng Giới Hạn</label>
                <input
                  type="number"
                  value={stockLimit}
                  onChange={(e) => setStockLimit(e.target.value)}
                  className="input-dark bg-[#18181C] border-[#27272A] focus:border-white font-mono"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-admin-secondary flex-1 py-3">
                  Hủy
                </button>
                <button type="submit" className="btn-admin-primary flex-1 py-3">
                  <Check size={16} /> Kích Hoạt Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminFlashSalesPage;
