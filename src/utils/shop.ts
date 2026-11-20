import {
  BookingValidationResult,
  CartItem,
  CheckoutFormData,
  CheckoutValidationResult,
  OrderRecord,
  OrderTotals,
  Product,
  ProductCategory,
  SortOption,
  TastingBookingInput,
  TastingBookingRecord,
  WeightOption,
} from '../types/shop';

export const FREE_SHIPPING_THRESHOLD = 500000;
export const STANDARD_SHIPPING_FEE = 30000;

export const PROMO_CODES: Record<string, { rate: number; label: string }> = {
  LACSON10: { rate: 0.1, label: 'Giảm 10% đơn hàng' },
  CHAO2026: { rate: 0.05, label: 'Ưu đãi thành viên 5%' },
};

/** Blueprint-aligned volumetric limits matching firebase-blueprint.json & firestore.rules */
export const BLUEPRINT_LIMITS = {
  NAME_MAX: 120,
  PHONE_MAX: 24,
  ADDRESS_MAX: 240,
  CITY_MAX: 80,
  NOTE_MAX: 300,
  PROMO_MAX: 32,
  MAX_ORDER_ITEMS: 30,
  MIN_GUESTS: 1,
  MAX_GUESTS: 12,
  DATE_PATTERN: /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/,
  ORDER_NUMBER_PATTERN: /^LS-[0-9]{6}-[0-9]{4}$/,
  BOOKING_CODE_PATTERN: /^LS-CUP-[0-9]{4}$/,
} as const;

export function formatVnd(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted} ₫`;
}

export function normalizeVietnamese(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

export function calculateItemUnitPrice(
  basePrice: number,
  weight: WeightOption,
  isSingleUnit = false
): number {
  if (isSingleUnit || weight === '350ml' || weight === '250g') {
    return basePrice;
  }
  if (weight === '500g') {
    // 5% multi-pack saving rounded to nearest 1,000 VND
    return Math.round((basePrice * 2 * 0.95) / 1000) * 1000;
  }
  if (weight === '1kg') {
    // 10% bulk roast saving rounded to nearest 1,000 VND
    return Math.round((basePrice * 4 * 0.9) / 1000) * 1000;
  }
  return basePrice;
}

export function buildCartLineId(
  productId: string,
  weight: WeightOption,
  grind: string
): string {
  return `${productId}__${weight}__${grind}`;
}

export function addToCart(
  items: CartItem[],
  incoming: Omit<CartItem, 'lineId'>
): CartItem[] {
  const lineId = buildCartLineId(incoming.productId, incoming.weight, incoming.grind);
  const existingIndex = items.findIndex((item) => item.lineId === lineId);
  if (existingIndex === -1) {
    return [...items, { ...incoming, lineId, quantity: Math.max(1, incoming.quantity) }];
  }
  return items.map((item, idx) =>
    idx === existingIndex
      ? { ...item, quantity: item.quantity + Math.max(1, incoming.quantity) }
      : item
  );
}

export function updateCartQuantity(
  items: CartItem[],
  lineId: string,
  delta: number
): CartItem[] {
  return items
    .map((item) =>
      item.lineId === lineId ? { ...item, quantity: item.quantity + delta } : item
    )
    .filter((item) => item.quantity > 0);
}

export function removeCartItem(items: CartItem[], lineId: string): CartItem[] {
  return items.filter((item) => item.lineId !== lineId);
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function calculateOrderTotals(
  items: CartItem[],
  rawPromoCode: string
): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cleanedCode = rawPromoCode.trim().toUpperCase().slice(0, BLUEPRINT_LIMITS.PROMO_MAX);

  let discountRate = 0;
  let promoApplied: string | null = null;
  let promoError: string | null = null;

  if (cleanedCode.length > 0) {
    const found = PROMO_CODES[cleanedCode];
    if (found) {
      discountRate = found.rate;
      promoApplied = cleanedCode;
    } else {
      promoError = 'Mã ưu đãi không hợp lệ. Thử LACSON10 để giảm 10%.';
    }
  }

  const discountAmount = Math.round(subtotal * discountRate);
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const shippingFee =
    items.length === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD
      ? 0
      : STANDARD_SHIPPING_FEE;
  const freeShippingRemaining =
    items.length === 0
      ? FREE_SHIPPING_THRESHOLD
      : Math.max(0, FREE_SHIPPING_THRESHOLD - afterDiscount);

  return {
    subtotal,
    discountRate,
    discountAmount,
    shippingFee,
    total: afterDiscount + shippingFee,
    freeShippingRemaining,
    promoApplied,
    promoError,
  };
}

export interface FilterOptions {
  category: ProductCategory | 'all';
  query: string;
  sortBy: SortOption;
}

export function filterAndSortProducts(
  products: Product[],
  options: FilterOptions
): Product[] {
  const normalizedQuery = normalizeVietnamese(options.query);

  const filtered = products.filter((product) => {
    const matchesCategory =
      options.category === 'all' || product.category === options.category;
    if (!matchesCategory) return false;

    if (!normalizedQuery) return true;
    const haystack = normalizeVietnamese(
      [
        product.name,
        product.subtitle,
        product.origin,
        product.roastLevel,
        product.categoryLabel,
        ...product.tastingNotes,
      ].join(' ')
    );
    return haystack.includes(normalizedQuery);
  });

  const sorted = [...filtered];
  if (options.sortBy === 'price-asc') {
    sorted.sort((a, b) => a.basePrice - b.basePrice);
  } else if (options.sortBy === 'price-desc') {
    sorted.sort((a, b) => b.basePrice - a.basePrice);
  } else if (options.sortBy === 'name-asc') {
    sorted.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }

  return sorted;
}

export function validateCheckoutForm(form: CheckoutFormData): CheckoutValidationResult {
  const errors: Partial<Record<keyof CheckoutFormData, string>> = {};

  if (form.fullName.trim().length < 2) {
    errors.fullName = 'Vui lòng nhập họ và tên người nhận (tối thiểu 2 ký tự).';
  } else if (form.fullName.trim().length > BLUEPRINT_LIMITS.NAME_MAX) {
    errors.fullName = `Họ và tên tối đa ${BLUEPRINT_LIMITS.NAME_MAX} ký tự.`;
  }

  const compactPhone = form.phone.replace(/[\s.-]/g, '');
  if (!/^(0|\+84)[0-9]{8,10}$/.test(compactPhone)) {
    errors.phone = 'Số điện thoại Việt Nam không hợp lệ (ví dụ: 0912345678).';
  }

  if (form.address.trim().length < 8) {
    errors.address = 'Vui lòng nhập địa chỉ giao hàng chi tiết (số nhà, tên đường).';
  } else if (form.address.trim().length > BLUEPRINT_LIMITS.ADDRESS_MAX) {
    errors.address = `Địa chỉ tối đa ${BLUEPRINT_LIMITS.ADDRESS_MAX} ký tự.`;
  }

  if (form.city.trim().length < 2) {
    errors.city = 'Vui lòng nhập tỉnh hoặc thành phố.';
  } else if (form.city.trim().length > BLUEPRINT_LIMITS.CITY_MAX) {
    errors.city = `Tên tỉnh/thành phố tối đa ${BLUEPRINT_LIMITS.CITY_MAX} ký tự.`;
  }

  if (form.note.trim().length > BLUEPRINT_LIMITS.NOTE_MAX) {
    errors.note = `Ghi chú tối đa ${BLUEPRINT_LIMITS.NOTE_MAX} ký tự.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateTastingBooking(
  input: TastingBookingInput
): BookingValidationResult {
  const errors: Partial<Record<keyof TastingBookingInput, string>> = {};

  if (input.guestName.trim().length < 2) {
    errors.guestName = 'Vui lòng nhập họ tên khách tham dự (tối thiểu 2 ký tự).';
  } else if (input.guestName.trim().length > BLUEPRINT_LIMITS.NAME_MAX) {
    errors.guestName = `Họ tên tối đa ${BLUEPRINT_LIMITS.NAME_MAX} ký tự.`;
  }

  const compactPhone = input.guestPhone.replace(/[\s.-]/g, '');
  if (!/^(0|\+84)[0-9]{8,10}$/.test(compactPhone)) {
    errors.guestPhone = 'Số điện thoại Việt Nam không hợp lệ (ví dụ: 0912345678).';
  }

  if (!BLUEPRINT_LIMITS.DATE_PATTERN.test(input.date.trim())) {
    errors.date = 'Vui lòng chọn ngày thử nếm hợp lệ (YYYY-MM-DD).';
  }

  if (input.timeSlot.trim().length < 3 || input.timeSlot.trim().length > 24) {
    errors.timeSlot = 'Vui lòng chọn khung giờ thử nếm.';
  }

  if (
    !Number.isFinite(input.guests) ||
    input.guests < BLUEPRINT_LIMITS.MIN_GUESTS ||
    input.guests > BLUEPRINT_LIMITS.MAX_GUESTS
  ) {
    errors.guests = `Số khách từ ${BLUEPRINT_LIMITS.MIN_GUESTS} đến ${BLUEPRINT_LIMITS.MAX_GUESTS} người.`;
  }

  if (input.note.trim().length > BLUEPRINT_LIMITS.NOTE_MAX) {
    errors.note = `Ghi chú tối đa ${BLUEPRINT_LIMITS.NOTE_MAX} ký tự.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function createOrderRecord(
  form: CheckoutFormData,
  items: CartItem[],
  totals: OrderTotals,
  now = new Date()
): OrderRecord {
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const suffix = String((now.getTime() % 9000) + 1000);
  const orderNumber = `LS-${year}${month}${day}-${suffix}`;

  return {
    id: orderNumber,
    orderNumber,
    createdAt: now.toISOString(),
    customer: {
      ...form,
      fullName: form.fullName.trim().slice(0, BLUEPRINT_LIMITS.NAME_MAX),
      phone: form.phone.trim().slice(0, BLUEPRINT_LIMITS.PHONE_MAX),
      address: form.address.trim().slice(0, BLUEPRINT_LIMITS.ADDRESS_MAX),
      city: form.city.trim().slice(0, BLUEPRINT_LIMITS.CITY_MAX),
      note: form.note.trim().slice(0, BLUEPRINT_LIMITS.NOTE_MAX),
    },
    items: items.slice(0, BLUEPRINT_LIMITS.MAX_ORDER_ITEMS).map((item) => ({ ...item })),
    totals: { ...totals },
    status: 'Đã xác nhận · Đang chuẩn bị rang & đóng gói',
    statusCode: 'confirmed',
    source: 'local',
  };
}

export function createBookingRecord(
  input: TastingBookingInput,
  now = new Date()
): TastingBookingRecord {
  const suffix = String((now.getTime() % 9000) + 1000);
  const bookingCode = `LS-CUP-${suffix}`;

  return {
    id: bookingCode,
    bookingCode,
    branchId: input.branchId,
    branchName: input.branchName.trim().slice(0, BLUEPRINT_LIMITS.NAME_MAX),
    guestName: input.guestName.trim().slice(0, BLUEPRINT_LIMITS.NAME_MAX),
    guestPhone: input.guestPhone.trim().slice(0, BLUEPRINT_LIMITS.PHONE_MAX),
    date: input.date.trim(),
    timeSlot: input.timeSlot.trim().slice(0, 24),
    guests: Math.min(
      BLUEPRINT_LIMITS.MAX_GUESTS,
      Math.max(BLUEPRINT_LIMITS.MIN_GUESTS, Math.round(input.guests))
    ),
    note: input.note.trim().slice(0, BLUEPRINT_LIMITS.NOTE_MAX),
    status: 'pending',
    createdAt: now.toISOString(),
    source: 'local',
  };
}
