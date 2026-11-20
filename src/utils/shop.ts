import {
  CartItem,
  CheckoutFormData,
  CheckoutValidationResult,
  OrderRecord,
  OrderTotals,
  Product,
  ProductCategory,
  SortOption,
  WeightOption,
} from '../types/shop';

export const FREE_SHIPPING_THRESHOLD = 500000;
export const STANDARD_SHIPPING_FEE = 30000;

export const PROMO_CODES: Record<string, { rate: number; label: string }> = {
  LACSON10: { rate: 0.1, label: 'Giảm 10% đơn hàng' },
  CHAO2026: { rate: 0.05, label: 'Ưu đãi thành viên 5%' },
};

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
  const cleanedCode = rawPromoCode.trim().toUpperCase();

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
  }

  const compactPhone = form.phone.replace(/[\s.-]/g, '');
  if (!/^(0|\+84)[0-9]{8,10}$/.test(compactPhone)) {
    errors.phone = 'Số điện thoại Việt Nam không hợp lệ (ví dụ: 0912345678).';
  }

  if (form.address.trim().length < 8) {
    errors.address = 'Vui lòng nhập địa chỉ giao hàng chi tiết (số nhà, tên đường).';
  }

  if (form.city.trim().length < 2) {
    errors.city = 'Vui lòng nhập tỉnh hoặc thành phố.';
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

  return {
    orderNumber: `LS-${year}${month}${day}-${suffix}`,
    createdAt: now.toISOString(),
    customer: {
      ...form,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      note: form.note.trim(),
    },
    items: items.map((item) => ({ ...item })),
    totals: { ...totals },
    status: 'Đã xác nhận · Đang chuẩn bị rang & đóng gói',
  };
}
