import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Package, Search, Plus, Edit2, Trash2, X, Check, Loader2, Star
} from 'lucide-react';
import { getProducts, getCategories } from '../../api/catalog.api';
import { adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from '../../api/admin.api';
import toast from 'react-hot-toast';
import { formatVND } from '../user/HomePage';

const AdminProductsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    categoryId: '1',
    stock: '50',
    imageUrl: '',
    description: ''
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', selectedCategory, search],
    queryFn: async () => {
      try {
        const res: any = await getProducts({
          page: 1,
          pageSize: 100,
          categoryId: selectedCategory,
          search: search.trim() || undefined
        });
        return res.data || res || [];
      } catch {
        return [];
      }
    }
  });

  const { data: categoriesData } = useQuery({
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
  const rawProducts = Array.isArray(productsData) ? productsData : (productsData?.items || productsData?.data || []);

  const products = rawProducts.map((p: any) => {
    const rawPrice = Number(p.price || p.unitPrice) || 3490000;
    const convertedPrice = rawPrice < 10000 ? rawPrice * 25000 : rawPrice;
    return { ...p, price: convertedPrice };
  });

  const filteredProducts = products.filter((p: any) => {
    const matchCat = selectedCategory === null || p.categoryId === selectedCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        price: (product.price || 3490000).toString(),
        originalPrice: (product.originalPrice || product.price * 1.3).toString(),
        categoryId: (product.categoryId || '1').toString(),
        stock: (product.stockQuantity !== undefined ? product.stockQuantity : (product.stock || 15)).toString(),
        imageUrl: product.imageUrl || '',
        description: product.description || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '3490000',
        originalPrice: '4990000',
        categoryId: categories[0]?.id?.toString() || '1',
        stock: '50',
        imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=400',
        description: 'Thiết bị công nghệ gaming cao cấp chính hãng.'
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error('Vui lòng nhập đầy đủ tên và giá sản phẩm!');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price) || 0,
      imageUrl: formData.imageUrl.trim() || undefined,
      categoryId: Number(formData.categoryId) || 1,
      stockQuantity: Number(formData.stock) || 15
    };

    try {
      if (editingProduct) {
        await adminUpdateProduct(editingProduct.id, payload);
        toast.success(`Đã cập nhật sản phẩm "${formData.name}" thành công!`);
      } else {
        await adminCreateProduct(payload);
        toast.success(`Đã thêm sản phẩm mới "${formData.name}" thành công!`);
      }
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch {
      toast.error('Lưu sản phẩm thất bại.');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) {
      try {
        await adminDeleteProduct(id);
        toast.success(`Đã xóa sản phẩm "${name}"!`);
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      } catch {
        toast.error('Xóa sản phẩm thất bại.');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 text-[#FAFAFA]">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121215] border border-[#27272A] p-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-bold">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Quản Lý Sản Phẩm</h1>
            <p className="text-xs text-[#A1A1AA]">Quản lý {products.length} mặt hàng trong danh mục hệ thống</p>
          </div>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-admin-primary">
          <Plus size={18} /> Thêm Sản Phẩm Mới
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#121215] border border-[#27272A] p-5 rounded-2xl flex flex-col lg:flex-row gap-4 justify-between items-center">

        {/* Fixed Search Input (Icon Never Overlaps Text) */}
        <div className="relative w-full lg:w-96 flex-shrink-0">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A] z-10 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>

        {/* Clean Overflow Category Pills Bar (No Text Clipping) */}
        <div className="flex items-center gap-2 overflow-x-auto w-full no-scrollbar pb-1 pt-1 scroll-smooth">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex-shrink-0 ${
              selectedCategory === null ? 'bg-white text-black border-white' : 'bg-[#18181C] text-[#A1A1AA] border-[#27272A] hover:text-white'
            }`}
          >
            Tất Cả
          </button>
          {categories.map((c: any) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex-shrink-0 ${
                selectedCategory === c.id ? 'bg-white text-black border-white' : 'bg-[#18181C] text-[#A1A1AA] border-[#27272A] hover:text-white'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={36} className="animate-spin text-white" />
        </div>
      ) : (
        <div className="bg-[#121215] border border-[#27272A] rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#27272A] bg-[#18181C] text-[#71717A] uppercase font-mono font-bold tracking-wider">
                  <th className="py-4 px-5">Sản Phẩm</th>
                  <th className="py-4 px-4">Giá Bán</th>
                  <th className="py-4 px-4">Tồn Kho</th>
                  <th className="py-4 px-4">Đánh Giá</th>
                  <th className="py-4 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {filteredProducts.map((product: any) => (
                  <tr key={product.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600'}
                          alt={product.name}
                          onError={(e) => {
                            const t = e.target as HTMLImageElement;
                            t.onerror = null;
                            t.src = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600';
                          }}
                          className="w-12 h-12 rounded-xl object-contain bg-[#09090B] p-1 border border-[#27272A] flex-shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <div className="font-bold text-white text-xs line-clamp-1">{product.name}</div>
                          <div className="text-[10px] text-[#71717A] font-mono mt-0.5">ID: {product.id?.substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {formatVND(product.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      {(() => {
                        const stockQty = product.stockQuantity !== undefined ? Number(product.stockQuantity) : (product.stock !== undefined ? Number(product.stock) : 15);
                        const isOut = stockQty <= 0;
                        const isLow = stockQty > 0 && stockQty < 5;

                        return (
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] border ${
                            isOut
                              ? 'bg-red-500/20 text-red-400 border-red-500/40'
                              : isLow
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {isOut ? 'Hết hàng (0)' : isLow ? `Sắp hết (${stockQty})` : `Còn hàng (${stockQty})`}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-white font-bold">
                        <Star size={12} fill="currentColor" /> 4.9 <span className="text-[#71717A] text-[10px] font-normal">(128)</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="p-2 rounded-lg bg-[#18181C] hover:bg-white hover:text-black text-[#A1A1AA] transition-colors border border-[#27272A]"
                          title="Sửa"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="p-2 rounded-lg bg-[#18181C] hover:bg-red-500/20 hover:text-red-400 text-[#71717A] transition-colors border border-[#27272A]"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121215] border border-[#27272A] rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                <Package size={20} />
                {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A1A1AA] hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Tên Sản Phẩm *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bàn phím cơ Apex Pro..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-dark bg-[#18181C] border-[#27272A] focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Giá Bán (₫) *</label>
                  <input
                    type="number"
                    required
                    placeholder="3490000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-dark bg-[#18181C] border-[#27272A] focus:border-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Giá Gốc (₫)</label>
                  <input
                    type="number"
                    placeholder="4990000"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="input-dark bg-[#18181C] border-[#27272A] focus:border-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Danh Mục</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="input-dark bg-[#18181C] border-[#27272A] focus:border-white cursor-pointer"
                  >
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Tồn Kho</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="input-dark bg-[#18181C] border-[#27272A] focus:border-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">URL Hình Ảnh</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="input-dark bg-[#18181C] border-[#27272A] focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1 uppercase tracking-wide">Mô Tả</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả sản phẩm..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-dark bg-[#18181C] border-[#27272A] focus:border-white"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-admin-secondary flex-1 py-3">
                  Hủy
                </button>
                <button type="submit" className="btn-admin-primary flex-1 py-3">
                  <Check size={16} /> Lưu Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProductsPage;
