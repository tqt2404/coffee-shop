export type ProductCategory = 'single-origin' | 'phin-blend' | 'cold-brew';

export type RoastLevel = 'Rang sáng' | 'Rang sáng vừa' | 'Rang vừa' | 'Rang đậm';

export type WeightOption = '250g' | '500g' | '1kg' | '350ml';

export type GrindOption =
  | 'Nguyên hạt'
  | 'Xay Pha Phin'
  | 'Xay Pour-over'
  | 'Xay Espresso'
  | 'Uống liền';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export type PaymentMethod = 'cod' | 'bank-transfer';

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  categoryLabel: string;
  origin: string;
  elevation: string;
  process: string;
  roastLevel: RoastLevel;
  tastingNotes: string[];
  description: string;
  basePrice: number; // Price for default weight (250g or 350ml)
  defaultWeight: WeightOption;
  availableWeights: WeightOption[];
  availableGrinds: GrindOption[];
  isSingleUnit?: boolean;
  batchCode: string;
  stock: number;
  statusNote?: string;
  image: string;
  imageAlt: string;
}

export interface CartItem {
  lineId: string;
  productId: string;
  name: string;
  image: string;
  weight: WeightOption;
  grind: GrindOption;
  unitPrice: number;
  quantity: number;
}

export interface OrderTotals {
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  freeShippingRemaining: number;
  promoApplied: string | null;
  promoError: string | null;
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  note: string;
  paymentMethod: PaymentMethod;
}

export interface CheckoutValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof CheckoutFormData, string>>;
}

export interface OrderRecord {
  orderNumber: string;
  createdAt: string;
  customer: CheckoutFormData;
  items: CartItem[];
  totals: OrderTotals;
  status: string;
}

export interface BrewMethodSpec {
  id: 'phin' | 'v60' | 'espresso';
  name: string;
  originNote: string;
  coffeeGramsPerCup: number;
  waterMlPerCup: number;
  waterTempC: number;
  ratioLabel: string;
  brewTime: string;
  grindRecommendation: string;
  steps: string[];
}
