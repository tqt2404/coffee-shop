import { useMemo, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  Calendar,
  Check,
  Coffee,
  Edit3,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { BronzeCorners } from '../../components/motion/MorphStage';
import { SafeImage } from '../../components/ui/SafeImage';
import type {
  AppUser,
  BookingStatusCode,
  OrderRecord,
  OrderStatusCode,
  Product,
  ProductCategory,
  RoastLevel,
  TastingBookingRecord,
} from '../../types/shop';
import { FAST_MORPH_SPRING, SILK_EASE } from '../../utils/motion';
import { formatVnd } from '../../utils/shop';

const LOCAL_PRODUCT_IMAGES = [
  {
    label: 'Phin Rừng Già',
    url: '/src/assets/images/coffee_phin_heritage_1795140496250.jpg',
  },
  {
    label: 'Midnight Bloom',
    url: '/src/assets/images/coffee_cau_dat_arabica_1795140494061.jpg',
  },
  {
    label: 'Hộp Thiếc Guji',
    url: '/src/assets/images/coffee_buon_ma_thuot_robusta_1795140497128.jpg',
  },
  {
    label: 'Alo Mật Ong',
    url: '/src/assets/images/coffee_typica_honey_1795140497612.jpg',
  },
  {
    label: 'Chai Cold Brew',
    url: '/src/assets/images/coffee_cold_brew_bottle_1795140494932.jpg',
  },
  {
    label: 'Trống Gang Giesen',
    url: '/src/assets/images/roastery_craft_drum_1795140496311.jpg',
  },
  {
    label: 'Phòng Nếm Pour-over',
    url: '/src/assets/images/hero_coffee_atelier_1795140495466.jpg',
  },
];

const ORDER_STATUS_OPTIONS: { value: OrderStatusCode; label: string }[] = [
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'roasting', label: 'Đang rang mẻ' },
  { value: 'shipped', label: 'Đang giao hàng' },
  { value: 'completed', label: 'Hoàn tất' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const BOOKING_STATUS_OPTIONS: { value: BookingStatusCode; label: string }[] = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã giữ bàn' },
  { value: 'completed', label: 'Hoàn tất' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export interface AdminProductDraft {
  id?: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  origin: string;
  elevation: string;
  process: string;
  roastLevel: RoastLevel;
  tastingNotesText: string;
  description: string;
  basePrice: number;
  batchCode: string;
  stock: number;
  statusNote: string;
  image: string;
  sensoryProfile: {
    acidity: number;
    sweetness: number;
    body: number;
    aroma: number;
    aftertaste: number;
  };
}

interface AdminConsoleProps {
  adminUser: AppUser;
  products: Product[];
  orders: OrderRecord[];
  bookings: TastingBookingRecord[];
  onBackToStorefront: () => void;
  onUpdateOrderStatus: (order: OrderRecord, status: OrderStatusCode) => Promise<void>;
  onUpdateBookingStatus: (
    booking: TastingBookingRecord,
    status: BookingStatusCode
  ) => Promise<void>;
  onSaveProduct: (
    draft: AdminProductDraft
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  onDeleteProduct: (product: Product) => Promise<void>;
}

function createEmptyDraft(): AdminProductDraft {
  return {
    name: '',
    subtitle: '',
    category: 'single-origin',
    origin: 'Cầu Đất, Đà Lạt',
    elevation: '1.650 m',
    process: 'Chế biến ướt (Washed)',
    roastLevel: 'Rang sáng vừa',
    tastingNotesText: 'Hoa nhài, Mật ong rừng, Cam vàng',
    description:
      'Mẻ rang thủ công 12 kg trên trống gang Giesen tại Đà Lạt, đóng gói van một chiều trong 48 giờ.',
    basePrice: 320000,
    batchCode: `LS-2611-${Math.floor(10 + Math.random() * 89)}`,
    stock: 20,
    statusNote: 'Mẻ rang mới tuần này',
    image: LOCAL_PRODUCT_IMAGES[1].url,
    sensoryProfile: {
      acidity: 4.2,
      sweetness: 4.6,
      body: 3.8,
      aroma: 4.7,
      aftertaste: 4.5,
    },
  };
}

function productToDraft(product: Product): AdminProductDraft {
  return {
    id: product.id,
    name: product.name,
    subtitle: product.subtitle,
    category: product.category,
    origin: product.origin,
    elevation: product.elevation,
    process: product.process,
    roastLevel: product.roastLevel,
    tastingNotesText: product.tastingNotes.join(', '),
    description: product.description,
    basePrice: product.basePrice,
    batchCode: product.batchCode,
    stock: product.stock,
    statusNote: product.statusNote || '',
    image: product.image,
    sensoryProfile: { ...product.sensoryProfile },
  };
}

/**
 * Full-width Architectural Editorial Admin Console (NO left sidebar, ZERO gradients).
 * Provides Orders Management, Tasting Bookings Queue, and Product CRUD with sensory controls.
 */
export function AdminConsole({
  adminUser,
  products,
  orders,
  bookings,
  onBackToStorefront,
  onUpdateOrderStatus,
  onUpdateBookingStatus,
  onSaveProduct,
  onDeleteProduct,
}: AdminConsoleProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'bookings' | 'products'>('orders');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatusCode | 'all'>('all');
  const [bookingBranchFilter, setBookingBranchFilter] = useState<'all' | 'dalat' | 'hanoi'>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<AdminProductDraft>(() => createEmptyDraft());
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorSaving, setEditorSaving] = useState(false);

  const kpis = useMemo(() => {
    const activeOrders = orders.filter((o) => o.statusCode !== 'cancelled');
    const revenue = activeOrders.reduce((sum, o) => sum + Number(o.totals?.total || 0), 0);
    const pendingOrders = orders.filter(
      (o) => !o.statusCode || o.statusCode === 'confirmed' || o.statusCode === 'roasting'
    ).length;
    const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
    return {
      totalOrders: orders.length,
      revenue,
      pendingOrders,
      pendingBookings,
    };
  }, [orders, bookings]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((o) => {
      const code = o.statusCode || 'confirmed';
      if (orderStatusFilter !== 'all' && code !== orderStatusFilter) return false;
      if (!q) return true;
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.phone.toLowerCase().includes(q)
      );
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (bookingBranchFilter !== 'all' && b.branchId !== bookingBranchFilter) return false;
      return true;
    });
  }, [bookings, bookingBranchFilter]);

  const openCreateEditor = () => {
    setDraft(createEmptyDraft());
    setEditorError(null);
    setEditorOpen(true);
  };

  const openEditEditor = (product: Product) => {
    setDraft(productToDraft(product));
    setEditorError(null);
    setEditorOpen(true);
  };

  const handleSaveEditor = async (e: FormEvent) => {
    e.preventDefault();
    setEditorSaving(true);
    setEditorError(null);
    try {
      const result = await onSaveProduct(draft);
      if (!result.ok) {
        setEditorError(result.error);
        return;
      }
      setEditorOpen(false);
    } finally {
      setEditorSaving(false);
    }
  };

  return (
    <section
      aria-label="Bảng quản trị Nhà Rang Lạc Sơn"
      className="flex-1 bg-[#F8F7F4] py-8 sm:py-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Contextual Admin Bar (Horizontal, zero left sidebar) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#DDD8CE]">
          <div>
            <p className="text-xs font-mono text-[#7A5C38] inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                Nhà Rang Lạc Sơn / Quản trị vận hành · {adminUser.displayName} (
                {adminUser.provider === 'google' ? 'Google Admin' : 'SHA-256 Admin'})
              </span>
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#191715] mt-1.5">
              Bảng điều hành xưởng rang & đơn hàng
            </h1>
          </div>

          <button
            type="button"
            onClick={onBackToStorefront}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] border border-[#191715] bg-[#FFFFFF] text-sm font-medium text-[#191715] hover:bg-[#191715] hover:text-[#F8F7F4] transition-colors whitespace-nowrap self-start md:self-auto cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Quay về Cửa hàng</span>
          </button>
        </div>

        {/* 4-Column Flat KPI Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border border-[#DDD8CE] bg-[#FFFFFF] divide-y lg:divide-y-0 lg:divide-x divide-[#DDD8CE]">
          <div className="p-5">
            <p className="text-xs text-[#5C574F]">Tổng đơn hàng</p>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#191715] tabular-nums mt-1">
              {kpis.totalOrders}
            </p>
          </div>
          <div className="p-5 border-l lg:border-l-0 border-[#DDD8CE]">
            <p className="text-xs text-[#5C574F]">Doanh thu dự kiến</p>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#1F3A2E] tabular-nums mt-1">
              {formatVnd(kpis.revenue)}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs text-[#5C574F]">Đơn cần rang / xử lý</p>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#7A5C38] tabular-nums mt-1">
              {kpis.pendingOrders}
            </p>
          </div>
          <div className="p-5 border-l lg:border-l-0 border-[#DDD8CE]">
            <p className="text-xs text-[#5C574F]">Lịch thử nếm · Sản phẩm</p>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#191715] tabular-nums mt-1">
              {bookings.length} · {products.length}
            </p>
          </div>
        </div>

        {/* Horizontal Segmented Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label="Chọn phân hệ quản trị"
            className="inline-flex bg-[#EFECE6] p-1 border border-[#DDD8CE]"
          >
            {(
              [
                { id: 'orders', label: `Đơn hàng (${orders.length})`, icon: Package },
                { id: 'bookings', label: `Lịch thử nếm (${bookings.length})`, icon: Calendar },
                { id: 'products', label: `Sản phẩm (${products.length})`, icon: Coffee },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 min-h-[40px] text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer inline-flex items-center gap-2 ${
                    selected ? 'text-[#F8F7F4]' : 'text-[#5C574F] hover:text-[#191715]'
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="admin-console-tab"
                      transition={FAST_MORPH_SPRING}
                      aria-hidden="true"
                      className="absolute inset-0 bg-[#191715]"
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" aria-hidden="true" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === 'products' && (
            <button
              type="button"
              onClick={openCreateEditor}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] bg-[#1F3A2E] text-[#F8F7F4] text-sm font-medium hover:bg-[#162B22] transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Thêm sản phẩm mới</span>
            </button>
          )}
        </div>

        {/* Tab Views */}
        <AnimatePresence mode="wait">
          {activeTab === 'orders' && (
            <motion.div
              key="admin-orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: SILK_EASE }}
              className="space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter('all')}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                      orderStatusFilter === 'all'
                        ? 'bg-[#191715] text-[#F8F7F4] border-[#191715]'
                        : 'bg-[#FFFFFF] text-[#5C574F] border-[#DDD8CE] hover:border-[#191715]'
                    }`}
                  >
                    Tất cả
                  </button>
                  {ORDER_STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setOrderStatusFilter(opt.value)}
                      className={`px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                        orderStatusFilter === opt.value
                          ? 'bg-[#191715] text-[#F8F7F4] border-[#191715]'
                          : 'bg-[#FFFFFF] text-[#5C574F] border-[#DDD8CE] hover:border-[#191715]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <Search
                    className="w-4 h-4 text-[#5C574F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Tìm mã đơn, khách hàng, SĐT..."
                    aria-label="Tìm kiếm đơn hàng"
                    className="w-full h-10 pl-9 pr-3 bg-[#FFFFFF] border border-[#DDD8CE] text-xs sm:text-sm text-[#191715] focus:outline-none focus:border-[#1F3A2E]"
                  />
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="relative bg-[#FFFFFF] border border-[#DDD8CE] p-10 text-center">
                  <BronzeCorners size="sm" />
                  <p className="font-display text-2xl text-[#191715]">
                    Chưa có đơn hàng phù hợp bộ lọc
                  </p>
                  <p className="mt-1.5 text-sm text-[#5C574F]">
                    Các đơn hàng mới từ khách hàng sẽ xuất hiện trực tiếp tại bảng này để cập
                    nhật tiến trình rang và giao vận.
                  </p>
                </div>
              ) : (
                <div className="bg-[#FFFFFF] border border-[#DDD8CE] overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[780px]">
                    <thead>
                      <tr className="border-b border-[#DDD8CE] bg-[#EFECE6] text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C574F]">
                        <th className="py-3 px-4 font-medium">Mã đơn</th>
                        <th className="py-3 px-4 font-medium">Khách hàng</th>
                        <th className="py-3 px-4 font-medium">Mặt hàng</th>
                        <th className="py-3 px-4 font-medium text-right">Tổng thanh toán</th>
                        <th className="py-3 px-4 font-medium">Trạng thái xử lý</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DDD8CE] text-sm">
                      {filteredOrders.map((order) => {
                        const code = order.statusCode || 'confirmed';
                        return (
                          <tr
                            key={order.id || order.orderNumber}
                            className="hover:bg-[#F8F7F4] transition-colors align-top"
                          >
                            <td className="py-3.5 px-4 font-mono text-xs font-semibold text-[#191715] whitespace-nowrap">
                              <div>{order.orderNumber}</div>
                              <div className="text-[11px] font-normal text-[#5C574F] mt-0.5">
                                {order.customer.paymentMethod === 'cod'
                                  ? 'COD'
                                  : 'Chuyển khoản'}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-medium text-[#191715]">
                                {order.customer.fullName}
                              </div>
                              <div className="text-xs font-mono text-[#5C574F]">
                                {order.customer.phone}
                              </div>
                              <div className="text-xs text-[#5C574F] mt-0.5 max-w-xs">
                                {order.customer.address}, {order.customer.city}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-xs text-[#191715] space-y-1">
                              {order.items.map((item) => (
                                <div key={item.lineId}>
                                  {item.quantity}× {item.name} ({item.weight} · {item.grind})
                                </div>
                              ))}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#191715] tabular-nums whitespace-nowrap">
                              {formatVnd(order.totals.total)}
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                aria-label={`Cập nhật trạng thái đơn ${order.orderNumber}`}
                                value={code}
                                disabled={busyId === order.orderNumber}
                                onChange={async (e) => {
                                  const next = e.target.value as OrderStatusCode;
                                  setBusyId(order.orderNumber);
                                  try {
                                    await onUpdateOrderStatus(order, next);
                                  } finally {
                                    setBusyId(null);
                                  }
                                }}
                                className={`h-9 px-2.5 border text-xs font-medium bg-[#FFFFFF] cursor-pointer focus:outline-none focus:border-[#1F3A2E] ${
                                  code === 'cancelled'
                                    ? 'border-[#8E2A2A] text-[#8E2A2A]'
                                    : code === 'completed'
                                      ? 'border-[#1F3A2E] text-[#1F3A2E]'
                                      : 'border-[#DDD8CE] text-[#191715]'
                                }`}
                              >
                                {ORDER_STATUS_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div
              key="admin-bookings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: SILK_EASE }}
              className="space-y-4"
            >
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'all', label: 'Tất cả chi nhánh' },
                    { id: 'dalat', label: 'Đà Lạt · Xưởng rang' },
                    { id: 'hanoi', label: 'Hà Nội · Hàng Bông' },
                  ] as const
                ).map((br) => (
                  <button
                    key={br.id}
                    type="button"
                    onClick={() => setBookingBranchFilter(br.id)}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                      bookingBranchFilter === br.id
                        ? 'bg-[#191715] text-[#F8F7F4] border-[#191715]'
                        : 'bg-[#FFFFFF] text-[#5C574F] border-[#DDD8CE] hover:border-[#191715]'
                    }`}
                  >
                    {br.label}
                  </button>
                ))}
              </div>

              {filteredBookings.length === 0 ? (
                <div className="relative bg-[#FFFFFF] border border-[#DDD8CE] p-10 text-center">
                  <BronzeCorners size="sm" />
                  <p className="font-display text-2xl text-[#191715]">
                    Chưa có lịch hẹn thử nếm nào
                  </p>
                  <p className="mt-1.5 text-sm text-[#5C574F]">
                    Khi khách đặt chỗ tại Trang 06 (Hệ thống không gian), lịch hẹn sẽ hiển thị
                    tại đây để xác nhận giữ bàn.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBookings.map((bk) => (
                    <article
                      key={bk.id}
                      className="relative bg-[#FFFFFF] border border-[#DDD8CE] p-5 flex flex-col justify-between gap-4"
                    >
                      <BronzeCorners size="sm" />
                      <div>
                        <div className="flex items-baseline justify-between gap-2 pb-3 border-b border-[#DDD8CE]">
                          <span className="font-mono text-sm font-semibold text-[#191715]">
                            {bk.bookingCode}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              bk.status === 'cancelled'
                                ? 'text-[#8E2A2A]'
                                : bk.status === 'confirmed' || bk.status === 'completed'
                                  ? 'text-[#1F3A2E]'
                                  : 'text-[#7A5C38]'
                            }`}
                          >
                            {BOOKING_STATUS_OPTIONS.find((s) => s.value === bk.status)?.label ||
                              bk.status}
                          </span>
                        </div>

                        <div className="mt-3 space-y-1 text-sm">
                          <p className="font-display text-lg font-semibold text-[#191715]">
                            {bk.branchName}
                          </p>
                          <p className="font-mono text-xs text-[#191715]">
                            {bk.date} · {bk.timeSlot} · {bk.guests} khách
                          </p>
                          <p className="text-xs text-[#5C574F]">
                            {bk.guestName} · {bk.guestPhone}
                          </p>
                          {bk.note && (
                            <p className="text-xs text-[#5C574F] italic pt-1">
                              Ghi chú: {bk.note}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#DDD8CE] flex flex-wrap gap-2">
                        {(
                          [
                            { status: 'confirmed', label: 'Xác nhận giữ bàn' },
                            { status: 'completed', label: 'Hoàn tất' },
                            { status: 'cancelled', label: 'Hủy lịch' },
                          ] as const
                        ).map((act) => (
                          <button
                            key={act.status}
                            type="button"
                            disabled={busyId === bk.bookingCode || bk.status === act.status}
                            onClick={async () => {
                              setBusyId(bk.bookingCode);
                              try {
                                await onUpdateBookingStatus(bk, act.status);
                              } finally {
                                setBusyId(null);
                              }
                            }}
                            className={`px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer disabled:opacity-45 ${
                              act.status === 'cancelled'
                                ? 'border-[#DDD8CE] text-[#8E2A2A] hover:border-[#8E2A2A]'
                                : 'border-[#191715] text-[#191715] hover:bg-[#191715] hover:text-[#F8F7F4]'
                            }`}
                          >
                            {act.label}
                          </button>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div
              key="admin-products"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: SILK_EASE }}
              className="bg-[#FFFFFF] border border-[#DDD8CE] overflow-x-auto"
            >
              <table className="w-full text-left border-collapse min-w-[780px]">
                <thead>
                  <tr className="border-b border-[#DDD8CE] bg-[#EFECE6] text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C574F]">
                    <th className="py-3 px-4 font-medium">Sản phẩm</th>
                    <th className="py-3 px-4 font-medium">Dòng · Mức rang</th>
                    <th className="py-3 px-4 font-medium text-right">Giá cơ bản</th>
                    <th className="py-3 px-4 font-medium text-right">Tồn kho</th>
                    <th className="py-3 px-4 font-medium text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD8CE] text-sm">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-[#F8F7F4] transition-colors align-middle"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 shrink-0 border border-[#DDD8CE] bg-[#EFECE6] overflow-hidden">
                            <SafeImage
                              src={product.image}
                              alt={product.imageAlt}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-[#191715]">{product.name}</div>
                            <div className="font-mono text-[11px] text-[#7A5C38]">
                              {product.batchCode} · {product.origin}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#5C574F]">
                        <div>{product.categoryLabel}</div>
                        <div className="text-[#191715] font-medium mt-0.5">
                          {product.roastLevel}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#191715] tabular-nums whitespace-nowrap">
                        {formatVnd(product.basePrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#191715]">
                        {product.stock}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditEditor(product)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-[#DDD8CE] bg-[#FFFFFF] text-xs font-medium text-[#191715] hover:border-[#191715] transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Sửa</span>
                          </button>

                          {confirmDeleteId === product.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                disabled={busyId === product.id}
                                onClick={async () => {
                                  setBusyId(product.id);
                                  try {
                                    await onDeleteProduct(product);
                                    setConfirmDeleteId(null);
                                  } finally {
                                    setBusyId(null);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#8E2A2A] text-[#F8F7F4] text-xs font-medium cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Xác nhận</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1.5 border border-[#DDD8CE] text-xs text-[#5C574F] cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(product.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-[#DDD8CE] bg-[#FFFFFF] text-xs font-medium text-[#8E2A2A] hover:border-[#8E2A2A] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Xóa</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Create / Edit Modal */}
      <AnimatePresence>
        {editorOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-product-editor-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditorOpen(false)}
              className="fixed inset-0 bg-[#191715]/60"
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.24, ease: SILK_EASE }}
              className="relative z-10 w-full max-w-2xl bg-[#F8F7F4] border border-[#191715] max-h-[90vh] overflow-y-auto"
            >
              <BronzeCorners size="sm" />
              <div className="flex items-center justify-between gap-4 px-6 py-4 bg-[#FFFFFF] border-b border-[#DDD8CE] sticky top-0 z-10">
                <h2
                  id="admin-product-editor-title"
                  className="font-display text-2xl font-semibold text-[#191715]"
                >
                  {draft.id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới vào danh mục'}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  aria-label="Đóng biểu mẫu sản phẩm"
                  className="w-9 h-9 inline-flex items-center justify-center border border-[#DDD8CE] text-[#191715] hover:border-[#191715] cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleSaveEditor} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="prod-name"
                      className="block text-xs font-medium text-[#191715] mb-1"
                    >
                      Tên sản phẩm *
                    </label>
                    <input
                      id="prod-name"
                      type="text"
                      required
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      placeholder="Ví dụ: Cầu Đất Bourbon · Mẻ Thu Đông"
                      className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#DDD8CE] text-sm focus:outline-none focus:border-[#1F3A2E]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="prod-subtitle"
                      className="block text-xs font-medium text-[#191715] mb-1"
                    >
                      Mô tả ngắn *
                    </label>
                    <input
                      id="prod-subtitle"
                      type="text"
                      required
                      value={draft.subtitle}
                      onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                      placeholder="Ví dụ: Hạt Bourbon đỏ chế biến mật ong vàng"
                      className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#DDD8CE] text-sm focus:outline-none focus:border-[#1F3A2E]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="prod-category"
                      className="block text-xs font-medium text-[#191715] mb-1"
                    >
                      Dòng sản phẩm
                    </label>
                    <select
                      id="prod-category"
                      value={draft.category}
                      onChange={(e) =>
                        setDraft({ ...draft, category: e.target.value as ProductCategory })
                      }
                      className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#DDD8CE] text-sm focus:outline-none focus:border-[#1F3A2E]"
                    >
                      <option value="single-origin">Hạt Đơn Vùng</option>
                      <option value="phin-blend">Phối Trộn Phin</option>
                      <option value="cold-brew">Cà Phê Ủ Lạnh</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="prod-roast"
                      className="block text-xs font-medium text-[#191715] mb-1"
                    >
                      Mức độ rang
                    </label>
                    <select
                      id="prod-roast"
                      value={draft.roastLevel}
                      onChange={(e) =>
                        setDraft({ ...draft, roastLevel: e.target.value as RoastLevel })
                      }
                      className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#DDD8CE] text-sm focus:outline-none focus:border-[#1F3A2E]"
                    >
                      <option value="Rang sáng">Rang sáng</option>
                      <option value="Rang sáng vừa">Rang sáng vừa</option>
                      <option value="Rang vừa">Rang vừa</option>
                      <option value="Rang đậm">Rang đậm</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="prod-price"
                      className="block text-xs font-medium text-[#191715] mb-1"
                    >
                      Giá cơ bản (VNĐ) *
                    </label>
                    <input
                      id="prod-price"
                      type="number"
                      min={20000}
                      step={5000}
                      required
                      value={draft.basePrice}
                      onChange={(e) =>
                        setDraft({ ...draft, basePrice: Number(e.target.value) })
                      }
                      className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#DDD8CE] text-sm font-mono focus:outline-none focus:border-[#1F3A2E]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="prod-stock"
                      className="block text-xs font-medium text-[#191715] mb-1"
                    >
                      Tồn kho (túi/chai) *
                    </label>
                    <input
                      id="prod-stock"
                      type="number"
                      min={0}
                      max={10000}
                      required
                      value={draft.stock}
                      onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })}
                      className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#DDD8CE] text-sm font-mono focus:outline-none focus:border-[#1F3A2E]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="prod-origin"
                      className="block text-xs font-medium text-[#191715] mb-1"
                    >
                      Vùng trồng
                    </label>
                    <input
                      id="prod-origin"
                      type="text"
                      value={draft.origin}
                      onChange={(e) => setDraft({ ...draft, origin: e.target.value })}
                      className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#DDD8CE] text-sm focus:outline-none focus:border-[#1F3A2E]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="prod-batch"
                      className="block text-xs font-medium text-[#191715] mb-1"
                    >
                      Mã mẻ rang
                    </label>
                    <input
                      id="prod-batch"
                      type="text"
                      value={draft.batchCode}
                      onChange={(e) => setDraft({ ...draft, batchCode: e.target.value })}
                      className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#DDD8CE] text-sm font-mono focus:outline-none focus:border-[#1F3A2E]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="prod-notes"
                      className="block text-xs font-medium text-[#191715] mb-1"
                    >
                      Nốt hương (ngăn cách bằng dấu phẩy)
                    </label>
                    <input
                      id="prod-notes"
                      type="text"
                      value={draft.tastingNotesText}
                      onChange={(e) =>
                        setDraft({ ...draft, tastingNotesText: e.target.value })
                      }
                      className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#DDD8CE] text-sm focus:outline-none focus:border-[#1F3A2E]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="prod-desc"
                      className="block text-xs font-medium text-[#191715] mb-1"
                    >
                      Mô tả chi tiết
                    </label>
                    <textarea
                      id="prod-desc"
                      rows={3}
                      value={draft.description}
                      onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                      className="w-full p-3 bg-[#FFFFFF] border border-[#DDD8CE] text-sm focus:outline-none focus:border-[#1F3A2E]"
                    />
                  </div>
                </div>

                {/* Curated Local Image Picker */}
                <div>
                  <p className="text-xs font-medium text-[#191715] mb-2">
                    Ảnh sản phẩm (kho ảnh studio nội bộ)
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {LOCAL_PRODUCT_IMAGES.map((img) => {
                      const active = draft.image === img.url;
                      return (
                        <button
                          key={img.url}
                          type="button"
                          onClick={() => setDraft({ ...draft, image: img.url })}
                          title={img.label}
                          className={`border p-0.5 cursor-pointer transition-colors ${
                            active
                              ? 'border-[#1F3A2E] ring-1 ring-[#1F3A2E]'
                              : 'border-[#DDD8CE] hover:border-[#191715]'
                          }`}
                        >
                          <SafeImage
                            src={img.url}
                            alt={img.label}
                            className="w-full aspect-square object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5-Axis Sensory Profile Sliders */}
                <div className="bg-[#FFFFFF] border border-[#DDD8CE] p-4 space-y-3">
                  <p className="text-xs font-mono uppercase tracking-[0.08em] text-[#7A5C38]">
                    Hồ sơ cảm quan 5 chiều (Thang 1.0 – 5.0)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(
                      [
                        { key: 'aroma', label: 'Hương hoa' },
                        { key: 'acidity', label: 'Độ chua' },
                        { key: 'sweetness', label: 'Độ ngọt' },
                        { key: 'body', label: 'Thể chất' },
                        { key: 'aftertaste', label: 'Hậu vị' },
                      ] as const
                    ).map((axis) => (
                      <label
                        key={axis.key}
                        className="flex items-center justify-between gap-3 text-xs text-[#191715]"
                      >
                        <span className="w-20">{axis.label}</span>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          step={0.1}
                          value={draft.sensoryProfile[axis.key]}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              sensoryProfile: {
                                ...draft.sensoryProfile,
                                [axis.key]: Number(e.target.value),
                              },
                            })
                          }
                          className="flex-1 accent-[#1F3A2E]"
                        />
                        <span className="font-mono tabular-nums w-8 text-right text-[#7A5C38]">
                          {draft.sensoryProfile[axis.key].toFixed(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {editorError && (
                  <p
                    role="alert"
                    className="text-xs text-[#8E2A2A] bg-[#FFFFFF] border border-[#8E2A2A] px-3 py-2"
                  >
                    {editorError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#DDD8CE]">
                  <button
                    type="button"
                    onClick={() => setEditorOpen(false)}
                    className="px-4 py-2.5 border border-[#DDD8CE] bg-[#FFFFFF] text-sm font-medium text-[#5C574F] hover:text-[#191715] cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={editorSaving}
                    className="px-5 py-2.5 bg-[#1F3A2E] text-[#F8F7F4] text-sm font-medium hover:bg-[#162B22] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {editorSaving
                      ? 'Đang lưu...'
                      : draft.id
                        ? 'Lưu thay đổi'
                        : 'Tạo sản phẩm'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
