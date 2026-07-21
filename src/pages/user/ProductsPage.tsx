import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Star, Search, PackageX, Layers, X, ArrowUpDown, Check, LayoutGrid, List } from 'lucide-react';
import { getProducts, getCategories } from '../../api/catalog.api';
import { useCartStore } from '../../stores/useCartStore';
import toast from 'react-hot-toast';
import { formatVND } from './HomePage';

const ProductCardSkeleton = () => (
  <div className="bg-[#0D0D16] border border-[#1A1A2A] p-5 rounded-2xl flex flex-col gap-4 animate-pulse">
    <div className="skeleton h-44 w-full rounded-xl" />
    <div className="space-y-2">
      <div className="skeleton h-4 w-4/5 rounded" />
      <div className="skeleton h-3 w-2/5 rounded" />
    </div>
    <div className="flex justify-between items-center pt-3 border-t border-[#1A1A2A]">
      <div className="skeleton h-5 w-28 rounded" />
      <div className="skeleton h-10 w-10 rounded-xl" />
    </div>
  </div>
);

const PRODUCT_BADGES: Record<string, { label: string; className: string }> = {
  bestseller: { label: 'BÁN CHẠY', className: 'badge-hot' },
  new: { label: 'MỚI VỀ', className: 'badge-new' },
  flash: { label: 'FLASH', className: 'badge-flash' },
};

const getProductBadge = (index: number) => {
  if (index % 7 === 0) return PRODUCT_BADGES.flash;
  if (index % 4 === 0) return PRODUCT_BADGES.new;
  if (index % 3 === 0) return PRODUCT_BADGES.bestseller;
  return null;
};

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const { data: categoriesResult } = useQuery({
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

  const { data: productsResult, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', selectedCategoryId, search, sortBy],
    queryFn: async () => {
      try {
        const res: any = await getProducts({
          page: 1,
          pageSize: 100,
          categoryId: selectedCategoryId,
          search: search.trim() || undefined,
          sortBy: sortBy !== 'default' ? sortBy : undefined
        });
        return res.data || res || [];
      } catch {
        return [];
      }
    }
  });

  const categories = Array.isArray(categoriesResult) ? categoriesResult : (categoriesResult?.items || []);
  const rawProducts = Array.isArray(productsResult) ? productsResult : (productsResult?.items || productsResult?.data || []);

  const allProducts = rawProducts.map((p: any) => {
    const rawPrice = Number(p.price || p.unitPrice) || 3490000;
    const convertedPrice = rawPrice < 10000 ? rawPrice * 25000 : rawPrice;
    return { ...p, price: convertedPrice };
  });

  // Direct backend API returned filtered list
  let filteredProducts = allProducts;
  if (allProducts.length > 0 && (selectedCategoryId !== null || search !== '' || sortBy !== 'default')) {
    filteredProducts = allProducts.filter((product: any) => {
      const matchesCategory = selectedCategoryId === null || product.categoryId === selectedCategoryId;
      const matchesSearch = !search || product.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'price-asc') {
      filteredProducts = [...filteredProducts].sort((a: any, b: any) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filteredProducts = [...filteredProducts].sort((a: any, b: any) => b.price - a.price);
    }
  }

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=400',
      quantity: 1
    });
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  const selectedCategory = categories.find((c: any) => c.id === selectedCategoryId);

  return (
    <div className="pb-16 space-y-6 text-white">

      {/* ─── Header Banner ─── */}
      <div className="bg-[#0D0D16] border border-[#1A1A2A] p-6 md:p-8 rounded-3xl space-y-5">
        {/* Title Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF1E27]/10 flex items-center justify-center text-[#FF1E27] border border-[#FF1E27]/20">
              <Layers size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Danh Sách Sản Phẩm</h1>
              <p className="text-sm text-[#8E92B2]">
                Khám phá <strong className="text-white">{allProducts.length || '120+'}</strong> thiết bị công nghệ chính hãng mới nhất
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* View Toggle */}
            <div className="flex items-center border border-[#232338] rounded-xl bg-[#121220] overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-[#FF1E27] text-white' : 'text-[#8E92B2] hover:text-white'}`}
                title="Lưới"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-[#FF1E27] text-white' : 'text-[#8E92B2] hover:text-white'}`}
                title="Danh sách"
              >
                <List size={16} />
              </button>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={16} className="text-[#FF1E27]" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-[#121220] border border-[#232338] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-[#FF1E27] transition-colors cursor-pointer font-medium"
              >
                <option value="default">Mới nhất</option>
                <option value="price-asc">Giá: Thấp → Cao</option>
                <option value="price-desc">Giá: Cao → Thấp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF1E27] z-10 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121220] border border-[#232338] rounded-xl pl-12 pr-10 py-3.5 text-white text-sm focus:border-[#FF1E27] focus:outline-none transition-colors placeholder-[#5A5E7A]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5A5E7A] hover:text-white transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#5A5E7A]">Lọc Theo Danh Mục</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border ${
                selectedCategoryId === null
                  ? 'bg-[#FF1E27] text-white border-[#FF1E27] shadow-lg shadow-[#FF1E27]/25'
                  : 'bg-[#121220] text-[#8E92B2] hover:text-white border-[#232338] hover:border-[#FF1E27]/50'
              }`}
            >
              {selectedCategoryId === null && <Check size={14} />}
              Tất Cả
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedCategoryId === null ? 'bg-black/20' : 'bg-white/5 text-[#5A5E7A]'}`}>
                {allProducts.length || '120+'}
              </span>
            </button>

            {categories.map((cat: any) => {
              const isSelected = selectedCategoryId === cat.id;
              const catCount = allProducts.filter((p: any) => p.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#FF1E27] text-white border-[#FF1E27] shadow-lg shadow-[#FF1E27]/25'
                      : 'bg-[#121220] text-[#8E92B2] hover:text-white border-[#232338] hover:border-[#FF1E27]/50'
                  }`}
                >
                  {isSelected && <Check size={14} />}
                  {cat.name}
                  {catCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-black/20' : 'bg-white/5 text-[#5A5E7A]'}`}>
                      {catCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Results Info Bar ─── */}
      <div className="flex items-center justify-between text-sm text-[#8E92B2] px-1">
        <span>
          {selectedCategory ? (
            <>Danh mục: <strong className="text-[#FF1E27]">{selectedCategory.name}</strong> — </>
          ) : null}
          Hiển thị <strong className="text-white font-bold">{filteredProducts.length}</strong> sản phẩm
          {search && <> cho "<strong className="text-white">{search}</strong>"</>}
        </span>
        {(selectedCategoryId !== null || search !== '') && (
          <button
            onClick={() => { setSearch(''); setSelectedCategoryId(null); setSortBy('default'); }}
            className="text-[#FF1E27] hover:underline text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <X size={14} /> Xóa bộ lọc
          </button>
        )}
      </div>

      {/* ─── Products Grid ─── */}
      {isLoadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-[#0D0D16] rounded-3xl border border-[#1A1A2A] space-y-4 text-center">
          <PackageX size={64} className="text-[#FF1E27]/30" />
          <h2 className="text-xl font-bold text-white">Không tìm thấy sản phẩm</h2>
          <p className="text-sm text-[#8E92B2] max-w-md">Không có sản phẩm nào phù hợp với từ khóa hoặc danh mục đã chọn.</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategoryId(null); setSortBy('default'); }}
            className="btn-primary"
          >
            Xóa Bộ Lọc
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product: any, idx: number) => {
            const badge = getProductBadge(idx);
            const discountPct = product.originalPrice && product.originalPrice > product.price
              ? Math.round((1 - product.price / product.originalPrice) * 100)
              : 0;
            return (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="card-base p-4 rounded-2xl flex flex-col justify-between group overflow-hidden relative"
              >
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                  {badge && <span className={badge.className}>{badge.label}</span>}
                  {discountPct > 0 && <span className="discount-badge">-{discountPct}%</span>}
                </div>

                {/* Image */}
                <div className="relative mb-4 overflow-hidden rounded-xl bg-[#08080E] p-4 flex justify-center aspect-square">
                  <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=400'}
                    alt={product.name}
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.onerror = null;
                      t.src = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=400';
                    }}
                    className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500"
                    style={{ maxHeight: '160px' }}
                  />

                  {/* Quick add overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-3">
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="bg-[#FF1E27] text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform"
                    >
                      <ShoppingBag size={14} /> Thêm Vào Giỏ
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-white line-clamp-2 text-sm group-hover:text-[#FF1E27] transition-colors leading-snug">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <span className="text-[#8E92B2] ml-0.5">(128)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#1E1E2E]">
                  <div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-[11px] text-[#5A5E7A] line-through block leading-none mb-0.5">
                        {formatVND(product.originalPrice < 10000 ? product.originalPrice * 25000 : product.originalPrice)}
                      </span>
                    )}
                    <span className="text-base font-bold text-[#FF1E27]">{formatVND(product.price)}</span>
                  </div>
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="p-2.5 rounded-xl bg-[#FF1E27]/10 hover:bg-[#FF1E27] text-[#FF1E27] hover:text-white transition-all active:scale-90"
                    title="Thêm vào giỏ"
                  >
                    <ShoppingBag size={16} />
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* ─── List View ─── */
        <div className="space-y-3">
          {filteredProducts.map((product: any, idx: number) => {
            const badge = getProductBadge(idx);
            const discountPct = product.originalPrice && product.originalPrice > product.price
              ? Math.round((1 - product.price / product.originalPrice) * 100)
              : 0;
            return (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="card-base p-4 rounded-2xl flex items-center gap-5 group"
              >
                <div className="w-24 h-24 flex-shrink-0 bg-[#08080E] rounded-xl flex items-center justify-center border border-[#1E1E2E] overflow-hidden p-2">
                  <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=200'}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {badge && <span className={badge.className}>{badge.label}</span>}
                    {discountPct > 0 && <span className="discount-badge">-{discountPct}%</span>}
                  </div>
                  <h3 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-[#FF1E27] transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-1 text-amber-400 text-xs mt-1">
                    {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                    <span className="text-[#8E92B2] ml-1">(128)</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-[11px] text-[#5A5E7A] line-through block">
                        {formatVND(product.originalPrice < 10000 ? product.originalPrice * 25000 : product.originalPrice)}
                      </span>
                    )}
                    <span className="text-lg font-bold text-[#FF1E27]">{formatVND(product.price)}</span>
                  </div>
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="p-3 rounded-xl bg-[#FF1E27]/10 hover:bg-[#FF1E27] text-[#FF1E27] hover:text-white transition-all active:scale-90 flex-shrink-0"
                  >
                    <ShoppingBag size={18} />
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
