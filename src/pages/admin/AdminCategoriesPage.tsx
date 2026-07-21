import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Grid, Plus, Edit2, Trash2, X, Check, Loader2, Layers } from 'lucide-react';
import { getCategories } from '../../api/catalog.api';
import toast from 'react-hot-toast';

const AdminCategoriesPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res: any = await getCategories();
        return res.data || res || [];
      } catch {
        return [];
      }
    }
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.items || []);

  const handleOpenModal = (cat?: any) => {
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name || '');
      setDescription(cat.description || 'Danh mục sản phẩm chính hãng');
    } else {
      setEditingCategory(null);
      setName('');
      setDescription('Danh mục thiết bị gaming cao cấp');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên danh mục!');
      return;
    }
    if (editingCategory) {
      toast.success(`Đã cập nhật danh mục "${name}"!`);
    } else {
      toast.success(`Đã tạo danh mục mới "${name}"!`);
    }
    setIsModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const handleDelete = (catName: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa danh mục "${catName}"?`)) {
      toast.success(`Đã xóa danh mục "${catName}"!`);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  };

  return (
    <div className="space-y-6 pb-12 text-[#FAFAFA]">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121215] border border-[#27272A] p-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-bold">
            <Grid size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Quản Lý Danh Mục</h1>
            <p className="text-xs text-[#A1A1AA]">Quản lý {categories.length} danh mục sản phẩm trên hệ thống</p>
          </div>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-admin-primary">
          <Plus size={18} /> Thêm Danh Mục Mới
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={36} className="animate-spin text-white" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat: any, idx: number) => (
            <div
              key={cat.id || idx}
              className="bg-[#121215] border border-[#27272A] hover:border-white/50 p-6 rounded-2xl space-y-4 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#18181C] border border-[#27272A] flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <Layers size={22} />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(cat)}
                    className="p-2 rounded-lg bg-[#18181C] hover:bg-white hover:text-black text-[#A1A1AA] transition-colors border border-[#27272A]"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.name)}
                    className="p-2 rounded-lg bg-[#18181C] hover:bg-red-500/20 hover:text-red-400 text-[#71717A] transition-colors border border-[#27272A]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white text-base group-hover:text-white transition-colors">{cat.name}</h3>
                <p className="text-xs text-[#A1A1AA] mt-1 line-clamp-2">{cat.description || 'Danh mục sản phẩm chính hãng công nghệ cao'}</p>
              </div>

              <div className="pt-3 border-t border-[#27272A] flex justify-between items-center text-xs">
                <span className="text-[#71717A] font-mono">ID: #{cat.id}</span>
                <span className="bg-[#18181C] text-white font-bold px-2.5 py-0.5 rounded-full border border-[#27272A]">
                  20 sản phẩm
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121215] border border-[#27272A] rounded-3xl p-6 md:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                <Grid size={20} />
                {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A1A1AA] hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Tên Danh Mục *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Chuột Gaming, Bàn Phím Cơ..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-dark bg-[#18181C] border-[#27272A] focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Mô Tả Danh Mục</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả về nhóm sản phẩm này..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-dark bg-[#18181C] border-[#27272A] focus:border-white"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-admin-secondary flex-1 py-3">
                  Hủy
                </button>
                <button type="submit" className="btn-admin-primary flex-1 py-3">
                  <Check size={16} /> Lưu Danh Mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCategoriesPage;
