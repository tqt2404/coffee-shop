import { PRODUCTS } from '../../src/data/products.ts';
import type {
  BookingStatusCode,
  OrderRecord,
  OrderStatusCode,
  Product,
  ProductCategory,
  RoastLevel,
  TastingBookingRecord,
} from '../../src/types/shop.ts';

const VALID_CATEGORIES: Record<ProductCategory, string> = {
  'single-origin': 'Hạt Đơn Vùng',
  'phin-blend': 'Phối Trộn Phin',
  'cold-brew': 'Cà Phê Ủ Lạnh',
};

const VALID_ROASTS = new Set<RoastLevel>([
  'Rang sáng',
  'Rang sáng vừa',
  'Rang vừa',
  'Rang đậm',
]);

const VALID_ORDER_STATUSES: Record<OrderStatusCode, string> = {
  confirmed: 'Đã xác nhận · Đang chuẩn bị rang & đóng gói',
  roasting: 'Đang rang mẻ mới trên trống gang Giesen',
  shipped: 'Đang giao hàng toàn quốc',
  completed: 'Đã giao thành công',
  cancelled: 'Đã hủy đơn hàng',
};

const VALID_BOOKING_STATUSES = new Set<BookingStatusCode>([
  'pending',
  'confirmed',
  'completed',
  'cancelled',
]);

const ALLOWED_LOCAL_IMAGES = new Set<string>([
  '/src/assets/images/coffee_phin_heritage_1795140496250.jpg',
  '/src/assets/images/coffee_cau_dat_arabica_1795140494061.jpg',
  '/src/assets/images/coffee_buon_ma_thuot_robusta_1795140497128.jpg',
  '/src/assets/images/coffee_typica_honey_1795140497612.jpg',
  '/src/assets/images/coffee_cold_brew_bottle_1795140494932.jpg',
  '/src/assets/images/roastery_craft_drum_1795140496311.jpg',
  '/src/assets/images/hero_coffee_atelier_1795140495466.jpg',
]);

interface StoredOrder extends OrderRecord {
  ownerId: string;
}

interface StoredBooking extends TastingBookingRecord {
  ownerId: string;
}

const productStore: Product[] = PRODUCTS.map((p) => ({
  ...p,
  tastingNotes: [...p.tastingNotes],
  availableWeights: [...p.availableWeights],
  availableGrinds: [...p.availableGrinds],
  sensoryProfile: { ...p.sensoryProfile },
}));

const orderStore = new Map<string, StoredOrder>();
const bookingStore = new Map<string, StoredBooking>();

function clampScore(val: unknown, fallback = 4.0): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(5, Math.max(1, n)) * 10) / 10;
}

function slugifyId(input: string): string {
  const base = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return base || `lot-${Date.now()}`;
}

export function listProducts(): Product[] {
  return productStore.map((p) => ({ ...p }));
}

export function findProductByIdOrSlug(idOrSlug: string): Product | undefined {
  return productStore.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}

export interface ProductUpsertInput {
  id?: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  origin: string;
  elevation: string;
  process: string;
  roastLevel: RoastLevel;
  tastingNotes: string[];
  sensoryProfile: {
    acidity: number;
    sweetness: number;
    body: number;
    aroma: number;
    aftertaste: number;
  };
  description: string;
  basePrice: number;
  batchCode: string;
  stock: number;
  statusNote?: string;
  image: string;
}

export function validateAndNormalizeProduct(
  input: Partial<ProductUpsertInput>,
  existingId?: string
): { ok: true; product: Product } | { ok: false; error: string } {
  const name = String(input.name || '').trim().slice(0, 120);
  const subtitle = String(input.subtitle || '').trim().slice(0, 160);
  const origin = String(input.origin || '').trim().slice(0, 120);
  const elevation = String(input.elevation || '1.500 – 1.800 m').trim().slice(0, 60);
  const process = String(input.process || 'Chế biến ướt').trim().slice(0, 100);
  const description = String(input.description || '').trim().slice(0, 600);
  const batchCode = String(input.batchCode || `LS-${new Date().getFullYear().toString().slice(-2)}11-NEW`)
    .trim()
    .toUpperCase()
    .slice(0, 32);
  const statusNote = String(input.statusNote || 'Rang mới trong 48 giờ').trim().slice(0, 80);

  if (name.length < 3) {
    return { ok: false, error: 'Tên sản phẩm cần tối thiểu 3 ký tự.' };
  }
  if (subtitle.length < 3) {
    return { ok: false, error: 'Vui lòng nhập mô tả ngắn cho sản phẩm.' };
  }
  if (origin.length < 2) {
    return { ok: false, error: 'Vui lòng nhập vùng trồng cà phê.' };
  }

  const category = (input.category && input.category in VALID_CATEGORIES
    ? input.category
    : 'single-origin') as ProductCategory;
  const roastLevel = (input.roastLevel && VALID_ROASTS.has(input.roastLevel)
    ? input.roastLevel
    : 'Rang vừa') as RoastLevel;

  const basePrice = Math.round(Number(input.basePrice));
  if (!Number.isFinite(basePrice) || basePrice < 20000 || basePrice > 50000000) {
    return { ok: false, error: 'Giá bán cần nằm trong khoảng 20.000 ₫ – 50.000.000 ₫.' };
  }

  const stock = Math.round(Number(input.stock));
  if (!Number.isFinite(stock) || stock < 0 || stock > 10000) {
    return { ok: false, error: 'Số lượng tồn kho không hợp lệ (0 – 10.000).' };
  }

  const rawNotes = Array.isArray(input.tastingNotes)
    ? input.tastingNotes
    : String(input.tastingNotes || '')
        .split(',')
        .map((s) => s.trim());
  const tastingNotes = rawNotes
    .map((n) => String(n).trim().slice(0, 48))
    .filter(Boolean)
    .slice(0, 6);

  if (tastingNotes.length === 0) {
    tastingNotes.push('Ca cao thanh', 'Hậu ngọt sạch');
  }

  const image =
    input.image && ALLOWED_LOCAL_IMAGES.has(input.image)
      ? input.image
      : '/src/assets/images/coffee_cau_dat_arabica_1795140494061.jpg';

  const id = existingId || slugifyId(input.id || name);
  const isColdBrew = category === 'cold-brew';

  const product: Product = {
    id,
    slug: id,
    name,
    subtitle,
    category,
    categoryLabel: VALID_CATEGORIES[category],
    origin,
    elevation,
    process,
    roastLevel,
    tastingNotes,
    sensoryProfile: {
      acidity: clampScore(input.sensoryProfile?.acidity, 3.5),
      sweetness: clampScore(input.sensoryProfile?.sweetness, 4.4),
      body: clampScore(input.sensoryProfile?.body, 4.0),
      aroma: clampScore(input.sensoryProfile?.aroma, 4.5),
      aftertaste: clampScore(input.sensoryProfile?.aftertaste, 4.5),
    },
    description:
      description ||
      'Rang mẻ nhỏ 12 kg trên trống gang Giesen tại Đà Lạt, đóng gói van một chiều giữ trọn hương thơm nguyên bản.',
    basePrice,
    defaultWeight: isColdBrew ? '350ml' : '250g',
    availableWeights: isColdBrew ? ['350ml'] : ['250g', '500g', '1kg'],
    availableGrinds: isColdBrew
      ? ['Uống liền']
      : ['Nguyên hạt', 'Xay Pha Phin', 'Xay Pour-over', 'Xay Espresso'],
    isSingleUnit: isColdBrew || undefined,
    batchCode,
    stock,
    statusNote,
    image,
    imageAlt: `${name} — Nhà Rang Lạc Sơn`,
  };

  return { ok: true, product };
}

export function createProductInStore(
  input: Partial<ProductUpsertInput>
): { ok: true; product: Product } | { ok: false; error: string } {
  const validated = validateAndNormalizeProduct(input);
  if (!validated.ok) return validated;

  let candidateId = validated.product.id;
  if (productStore.some((p) => p.id === candidateId)) {
    candidateId = `${candidateId}-${Date.now().toString().slice(-4)}`;
  }

  const created: Product = { ...validated.product, id: candidateId, slug: candidateId };
  productStore.unshift(created);
  return { ok: true, product: created };
}

export function updateProductInStore(
  id: string,
  input: Partial<ProductUpsertInput>
): { ok: true; product: Product } | { ok: false; error: string } {
  const idx = productStore.findIndex((p) => p.id === id);
  if (idx === -1) {
    return { ok: false, error: 'Không tìm thấy sản phẩm cần cập nhật.' };
  }

  const validated = validateAndNormalizeProduct(input, id);
  if (!validated.ok) return validated;

  productStore[idx] = validated.product;
  return { ok: true, product: validated.product };
}

export function deleteProductInStore(id: string): boolean {
  const idx = productStore.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  productStore.splice(idx, 1);
  return true;
}

export function upsertOrderInStore(ownerId: string, order: OrderRecord): OrderRecord {
  const statusCode: OrderStatusCode = order.statusCode || 'confirmed';
  const stored: StoredOrder = {
    ...order,
    id: order.id || order.orderNumber,
    ownerId,
    statusCode,
    status: VALID_ORDER_STATUSES[statusCode] || order.status,
    source: 'cloud',
  };
  orderStore.set(stored.orderNumber, stored);
  return stripOwner(stored);
}

export function listAllOrdersInStore(): OrderRecord[] {
  return Array.from(orderStore.values())
    .map(stripOwner)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function listUserOrdersInStore(ownerId: string): OrderRecord[] {
  return Array.from(orderStore.values())
    .filter((o) => o.ownerId === ownerId)
    .map(stripOwner)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updateOrderStatusInStore(
  orderNumber: string,
  statusCode: OrderStatusCode
): OrderRecord | null {
  if (!(statusCode in VALID_ORDER_STATUSES)) return null;
  const existing = orderStore.get(orderNumber);
  if (!existing) return null;
  const updated: StoredOrder = {
    ...existing,
    statusCode,
    status: VALID_ORDER_STATUSES[statusCode],
  };
  orderStore.set(orderNumber, updated);
  return stripOwner(updated);
}

export function cancelUserOrderInStore(ownerId: string, orderNumber: string): OrderRecord | null {
  const existing = orderStore.get(orderNumber);
  if (!existing || existing.ownerId !== ownerId) return null;
  if (existing.statusCode === 'completed' || existing.statusCode === 'cancelled') return null;
  const updated: StoredOrder = {
    ...existing,
    statusCode: 'cancelled',
    status: 'Đã hủy theo yêu cầu khách hàng',
  };
  orderStore.set(orderNumber, updated);
  return stripOwner(updated);
}

export function upsertBookingInStore(
  ownerId: string,
  booking: TastingBookingRecord
): TastingBookingRecord {
  const stored: StoredBooking = {
    ...booking,
    id: booking.id || booking.bookingCode,
    ownerId,
    source: 'cloud',
  };
  bookingStore.set(stored.bookingCode, stored);
  return stripBookingOwner(stored);
}

export function listAllBookingsInStore(): TastingBookingRecord[] {
  return Array.from(bookingStore.values())
    .map(stripBookingOwner)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function listUserBookingsInStore(ownerId: string): TastingBookingRecord[] {
  return Array.from(bookingStore.values())
    .filter((b) => b.ownerId === ownerId)
    .map(stripBookingOwner)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updateBookingStatusInStore(
  bookingCode: string,
  status: BookingStatusCode
): TastingBookingRecord | null {
  if (!VALID_BOOKING_STATUSES.has(status)) return null;
  const existing = bookingStore.get(bookingCode);
  if (!existing) return null;
  const updated: StoredBooking = { ...existing, status };
  bookingStore.set(bookingCode, updated);
  return stripBookingOwner(updated);
}

export function cancelUserBookingInStore(
  ownerId: string,
  bookingCode: string
): TastingBookingRecord | null {
  const existing = bookingStore.get(bookingCode);
  if (!existing || existing.ownerId !== ownerId) return null;
  if (existing.status === 'completed' || existing.status === 'cancelled') return null;
  const updated: StoredBooking = { ...existing, status: 'cancelled' };
  bookingStore.set(bookingCode, updated);
  return stripBookingOwner(updated);
}

function stripOwner(order: StoredOrder): OrderRecord {
  const { ownerId: _ignored, ...rest } = order;
  return rest;
}

function stripBookingOwner(booking: StoredBooking): TastingBookingRecord {
  const { ownerId: _ignored, ...rest } = booking;
  return rest;
}

export { VALID_ORDER_STATUSES };
