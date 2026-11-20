import { useState } from 'react';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Product, ProductCategory, SortOption } from '../types/shop';
import {
  FAST_MORPH_SPRING,
  MORPH_SPRING,
  ORGANIC_SPRING,
  SILK_EASE,
} from '../utils/motion';
import { formatVnd } from '../utils/shop';
import {
  BronzeCorners,
  MorphLayer,
  MorphPage,
  MorphParallaxImage,
  MorphRule,
  SplitHeadline,
  type MorphVector,
} from './MorphStage';
import { SafeImage } from './SafeImage';

interface CatalogSectionProps {
  products: Product[];
  activeCategory: ProductCategory | 'all';
  searchQuery: string;
  sortBy: SortOption;
  onCategoryChange: (cat: ProductCategory | 'all') => void;
  onSearchChange: (q: string) => void;
  onSortChange: (sort: SortOption) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

const CATEGORIES: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'single-origin', label: 'Hạt Đơn Vùng' },
  { value: 'phin-blend', label: 'Phối Trộn Phin' },
  { value: 'cold-brew', label: 'Cà Phê Ủ Lạnh' },
];

function getCardVector(index: number): MorphVector {
  const col = index % 3;
  if (col === 0) return 'tilt-left';
  if (col === 1) return 'plate';
  return 'tilt-right';
}

interface ProductCardProps {
  product: Product;
  index: number;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

/**
 * Individually choreographed coffee card where EVERY sub-component
 * (frame, bronze corners, parallax photo, meta row, title, each tasting note,
 * drawing divider, price, and action buttons) animates on its own organic layer.
 */
function ProductCard({ product, index, onSelect, onQuickAdd }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const row = Math.floor(index / 3);
  const col = index % 3;
  const baseStagger = Math.min(0.06, 0.015 + row * 0.022 + col * 0.012);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={MORPH_SPRING}
      className="flex"
    >
      <MorphLayer
        vector={getCardVector(index)}
        stagger={baseStagger}
        distance={0.92}
        className="flex flex-1 w-full"
      >
        <motion.article
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          whileHover={{ y: -5 }}
          transition={ORGANIC_SPRING}
          className="group relative flex flex-col flex-1 bg-[#FFFFFF] border border-[#DDD8CE] hover:border-[#7A5C38] transition-colors duration-300"
        >
          {/* 1. Animated Antique-Bronze Corner Marks */}
          <BronzeCorners active={hovered} size="sm" />

          {/* 2. Shared-Element Morph + Continuous Scroll Parallax Photo */}
          <motion.button
            layoutId={`product-image-${product.id}`}
            transition={MORPH_SPRING}
            type="button"
            onClick={() => onSelect(product)}
            aria-label={`Xem chi tiết ${product.name}`}
            className="block w-full aspect-[4/3] overflow-hidden bg-[#EFECE6] border-b border-[#DDD8CE] text-left cursor-pointer"
          >
            <MorphParallaxImage drift={11}>
              <SafeImage
                src={product.image}
                alt={product.imageAlt}
                fallbackTitle={product.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
            </MorphParallaxImage>
          </motion.button>

          {/* Uniform Card Body with Granular Per-Element Choreography */}
          <div className="flex flex-col flex-1 p-5 sm:p-6">
            {/* 3. Opposing Micro-Layers: Category glides from LEFT, Weight glides from RIGHT */}
            <div className="flex items-center justify-between gap-2 text-xs text-[#5C574F] overflow-hidden">
              <MorphLayer
                vector="left"
                stagger={baseStagger + 0.02}
                distance={0.3}
                className="truncate"
              >
                <span>
                  {product.categoryLabel} · {product.roastLevel}
                </span>
              </MorphLayer>
              <MorphLayer
                vector="right"
                stagger={baseStagger + 0.025}
                distance={0.3}
                className="font-mono shrink-0"
              >
                <span>{product.defaultWeight}</span>
              </MorphLayer>
            </div>

            {/* 4. Product Title rises independently */}
            <MorphLayer
              vector="up"
              stagger={baseStagger + 0.032}
              distance={0.35}
            >
              <motion.h3
                layoutId={`product-title-${product.id}`}
                transition={MORPH_SPRING}
                className="mt-2.5 font-display text-xl font-semibold leading-[1.3] text-[#191715]"
              >
                <button
                  type="button"
                  onClick={() => onSelect(product)}
                  className="text-left hover:text-[#1F3A2E] transition-colors cursor-pointer"
                >
                  {product.name}
                </button>
              </motion.h3>
            </MorphLayer>

            {/* 5. Individual Cascading Tasting Notes */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-[#5C574F] leading-relaxed">
              {product.tastingNotes.map((note, noteIdx) => (
                <MorphLayer
                  key={note}
                  vector="up"
                  stagger={baseStagger + 0.04 + noteIdx * 0.012}
                  distance={0.28}
                  className="inline-flex items-center gap-1.5"
                >
                  {noteIdx > 0 && (
                    <span aria-hidden="true" className="text-[#7A5C38]">
                      ·
                    </span>
                  )}
                  <motion.span
                    animate={{ x: hovered ? 1.5 : 0 }}
                    transition={{
                      duration: 0.28,
                      delay: noteIdx * 0.035,
                      ease: SILK_EASE,
                    }}
                  >
                    {note}
                  </motion.span>
                </MorphLayer>
              ))}
            </div>

            {/* 6. Self-Drawing Architectural Separator Rule */}
            <div className="mt-auto pt-5">
              <MorphRule
                stagger={baseStagger + 0.045}
                className="h-[1px] w-full bg-[#DDD8CE] mb-4"
              />

              {/* 7. Opposing Price & Action Buttons Micro-Layers */}
              <div className="flex items-center justify-between gap-3">
                <MorphLayer
                  vector="left"
                  stagger={baseStagger + 0.05}
                  distance={0.28}
                >
                  <p className="font-mono text-base font-medium text-[#191715] tabular-nums">
                    {formatVnd(product.basePrice)}
                  </p>
                  <p className="text-xs text-[#7A5C38] mt-0.5">
                    {product.statusNote || 'Còn hàng'}
                  </p>
                </MorphLayer>

                <MorphLayer
                  vector="right"
                  stagger={baseStagger + 0.058}
                  distance={0.32}
                  className="flex items-center gap-2 shrink-0"
                >
                  <motion.button
                    type="button"
                    whileHover={{ y: -1.5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={ORGANIC_SPRING}
                    onClick={() => onSelect(product)}
                    className="px-3 py-2 min-h-[40px] border border-[#DDD8CE] bg-[#F8F7F4] text-xs font-medium text-[#191715] hover:border-[#191715] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Chi tiết
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ y: -1.5 }}
                    whileTap={{ scale: 0.94 }}
                    transition={ORGANIC_SPRING}
                    onClick={() => onQuickAdd(product)}
                    aria-label={`Thêm nhanh ${product.name} vào giỏ hàng`}
                    className="group/btn inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] bg-[#1F3A2E] text-[#F8F7F4] text-xs font-medium hover:bg-[#162B22] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Plus
                      className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:rotate-90"
                      aria-hidden="true"
                    />
                    <span>Thêm giỏ</span>
                  </motion.button>
                </MorphLayer>
              </div>
            </div>
          </div>
        </motion.article>
      </MorphLayer>
    </motion.div>
  );
}

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

      {/* Horizontal Filter & Search Bar: Each control group glides independently */}
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
          <MorphLayer vector="up" stagger={0.04} distance={0.5} className="relative flex-1 sm:w-64">
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

          <MorphLayer vector="right" stagger={0.05} distance={0.5} className="relative flex items-center">
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

      {/* Granular Multi-Component Morph Product Grid */}
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
