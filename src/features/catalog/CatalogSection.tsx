import { Search, SlidersHorizontal } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { Product, ProductCategory, SortOption } from '../../types/shop';
import { FAST_MORPH_SPRING, SILK_EASE } from '../../utils/motion';
import {
  MorphLayer,
  MorphPage,
  MorphRule,
  SplitHeadline,
} from '../../components/motion/MorphStage';
import { ProductCard } from './ProductCard';

interface CatalogSectionProps {
  products: Product[];
  activeCategory: ProductCategory | 'all';
  searchQuery: string;
  sortBy: SortOption;
  onCategoryChange: (cat: ProductCategory | 'all') => void;
  onSearchChange: (q: string) => void;
  onSortChange: (sort: SortOption) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, origin?: { x: number; y: number }) => void;
}

const CATEGORIES: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'single-origin', label: 'Hạt Đơn Vùng' },
  { value: 'phin-blend', label: 'Phối Trộn Phin' },
  { value: 'cold-brew', label: 'Cà Phê Ủ Lạnh' },
];

export function CatalogSection({
  products,
  activeCategory,
  searchQuery,
  sortBy,
  onCategoryChange,
  onSearchChange,
  onSortChange,
  onSelectProduct,
  onQuickAdd,
}: CatalogSectionProps) {
  return (
    <MorphPage
      id="bo-suu-tap"
      pageNumber="04"
      chapterTitle="Bộ Sưu Tập Hạt & Cà Phê Thủ Công"
      bgClass="bg-[#F8F7F4]"
    >
      {/* Multi-vector Morph Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 relative">
        <MorphLayer vector="left" stagger={0}>
          <p className="text-xs tracking-[0.06em] text-[#7A5C38] font-medium mb-2">
            Danh mục rang mới hằng tuần
          </p>
          <SplitHeadline
            as="h2"
            mode="inView"
            text="Bộ sưu tập hạt & cà phê thủ công"
            className="font-display text-3xl sm:text-4xl font-semibold leading-[1.2] text-[#191715]"
          />
        </MorphLayer>

        <MorphLayer vector="right" stagger={0.025}>
          <p className="text-sm text-[#5C574F] max-w-md leading-relaxed border-l-2 border-[#7A5C38]/40 pl-4">
            Mỗi túi cà phê đều đóng van một chiều sau 24 giờ nghỉ hạt. Nhập mã{' '}
            <span className="font-mono font-medium text-[#191715]">LACSON10</span> tại
            giỏ hàng để nhận ưu đãi 10%.
          </p>
        </MorphLayer>

        <div className="absolute bottom-0 left-0 right-0">
          <MorphRule stagger={0.02} />
        </div>
      </div>

      {/* Horizontal Filter & Search Bar */}
      <div className="py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <MorphLayer vector="left" stagger={0.03} distance={0.65}>
          <div
            role="group"
            aria-label="Lọc theo dòng sản phẩm"
            className="flex flex-wrap items-center gap-1 bg-[#EFECE6] p-1 border border-[#DDD8CE]"
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <motion.button
                  key={cat.value}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onCategoryChange(cat.value)}
                  aria-pressed={isActive}
                  className={`relative px-3.5 py-2 min-h-[40px] text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-[#F8F7F4]'
                      : 'text-[#5C574F] hover:text-[#191715]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="catalog-category-indicator"
                      transition={FAST_MORPH_SPRING}
                      aria-hidden="true"
                      className="absolute inset-0 bg-[#191715]"
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                </motion.button>
              );
            })}
          </div>
        </MorphLayer>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <MorphLayer
            vector="up"
            stagger={0.04}
            distance={0.5}
            className="relative flex-1 sm:w-64"
          >
            <Search
              className="w-4 h-4 text-[#5C574F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <label htmlFor="catalog-search" className="sr-only">
              Tìm kiếm sản phẩm cà phê
            </label>
            <input
              id="catalog-search"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm hương vị, vùng trồng..."
              className="w-full pl-10 pr-4 py-2.5 min-h-[42px] bg-[#FFFFFF] border border-[#DDD8CE] text-sm text-[#191715] placeholder:text-[#5C574F] transition-colors focus:border-[#1F3A2E]"
            />
          </MorphLayer>

          <MorphLayer
            vector="right"
            stagger={0.05}
            distance={0.5}
            className="relative flex items-center"
          >
            <SlidersHorizontal
              className="w-4 h-4 text-[#5C574F] absolute left-3.5 pointer-events-none"
              aria-hidden="true"
            />
            <label htmlFor="catalog-sort" className="sr-only">
              Sắp xếp sản phẩm
            </label>
            <select
              id="catalog-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full sm:w-auto pl-10 pr-8 py-2.5 min-h-[42px] bg-[#FFFFFF] border border-[#DDD8CE] text-sm text-[#191715] cursor-pointer transition-colors focus:border-[#1F3A2E]"
            >
              <option value="featured">Sắp xếp: Tuyển chọn</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="name-asc">Tên: A đến Z</option>
            </select>
          </MorphLayer>
        </div>
      </div>

      {/* Granular Multi-Component 3D Tilt Product Grid */}
      {products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: SILK_EASE }}
          className="my-6 py-16 px-6 bg-[#FFFFFF] border border-[#DDD8CE] text-center"
        >
          <p className="font-display text-2xl leading-[1.25] text-[#191715]">
            Không tìm thấy mẻ rang phù hợp
          </p>
          <p className="mt-2 text-sm text-[#5C574F]">
            Thử từ khóa khác hoặc đặt lại bộ lọc để xem toàn bộ danh mục hiện có.
          </p>
          <button
            type="button"
            onClick={() => {
              onCategoryChange('all');
              onSearchChange('');
              onSortChange('featured');
            }}
            className="mt-5 px-5 py-2.5 min-h-[42px] bg-[#191715] text-[#F8F7F4] text-sm font-medium hover:bg-[#1F3A2E] transition-colors cursor-pointer"
          >
            Xem tất cả sản phẩm
          </button>
        </motion.div>
      ) : (
        <motion.div
          layout
          data-testid="product-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onSelect={onSelectProduct}
                onQuickAdd={onQuickAdd}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </MorphPage>
  );
}
