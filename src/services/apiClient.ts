import type { CartItem, OrderTotals, Product } from '../types/shop';

export interface ProductsApiResponse {
  total: number;
  products: Product[];
}

export interface PromoValidationResponse {
  valid: boolean;
  code?: string;
  rate?: number;
  label?: string;
  totals?: OrderTotals;
  error?: string;
}

export async function fetchProductsFromApi(): Promise<Product[] | null> {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) return null;
    const data = (await res.json()) as ProductsApiResponse;
    if (!Array.isArray(data.products) || data.products.length === 0) return null;
    return data.products;
  } catch {
    return null;
  }
}

export async function validatePromoViaApi(
  code: string,
  items: CartItem[]
): Promise<PromoValidationResponse | null> {
  try {
    const res = await fetch('/api/promo/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, items }),
    });
    const data = (await res.json()) as PromoValidationResponse;
    return data;
  } catch {
    return null;
  }
}
