import type {
  AppUser,
  BookingStatusCode,
  CartItem,
  OrderRecord,
  OrderStatusCode,
  OrderTotals,
  Product,
  TastingBookingRecord,
} from '../types/shop';

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

export interface PasswordAuthResponse {
  user?: {
    id: string;
    username: string;
    displayName: string;
    role: 'admin' | 'user';
    provider: 'password';
  };
  token?: string;
  error?: string;
}

export interface AdminOverviewResponse {
  orders: OrderRecord[];
  bookings: TastingBookingRecord[];
  products: Product[];
  summary: {
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    totalBookings: number;
    pendingBookings: number;
    totalProducts: number;
  };
}

function authHeaders(token: string | null): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
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

export async function loginWithPasswordApi(
  username: string,
  password: string
): Promise<{ ok: true; user: AppUser; token: string } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = (await res.json()) as PasswordAuthResponse;
    if (!res.ok || !data.user || !data.token) {
      return { ok: false, error: data.error || 'Đăng nhập thất bại.' };
    }
    return {
      ok: true,
      token: data.token,
      user: {
        uid: data.user.id,
        username: data.user.username,
        displayName: data.user.displayName,
        role: data.user.role,
        provider: 'password',
      },
    };
  } catch {
    return { ok: false, error: 'Không thể kết nối máy chủ xác thực.' };
  }
}

export async function registerWithPasswordApi(input: {
  username: string;
  password: string;
  displayName: string;
}): Promise<{ ok: true; user: AppUser; token: string } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as PasswordAuthResponse;
    if (!res.ok || !data.user || !data.token) {
      return { ok: false, error: data.error || 'Không thể tạo tài khoản.' };
    }
    return {
      ok: true,
      token: data.token,
      user: {
        uid: data.user.id,
        username: data.user.username,
        displayName: data.user.displayName,
        role: data.user.role,
        provider: 'password',
      },
    };
  } catch {
    return { ok: false, error: 'Không thể kết nối máy chủ đăng ký.' };
  }
}

export async function fetchSessionUserApi(token: string): Promise<AppUser | null> {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as PasswordAuthResponse;
    if (!data.user) return null;
    return {
      uid: data.user.id,
      username: data.user.username,
      displayName: data.user.displayName,
      role: data.user.role,
      provider: 'password',
    };
  } catch {
    return null;
  }
}

export async function fetchAccountRecordsApi(
  token: string
): Promise<{ orders: OrderRecord[]; bookings: TastingBookingRecord[] } | null> {
  try {
    const res = await fetch('/api/account/records', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as {
      orders: OrderRecord[];
      bookings: TastingBookingRecord[];
    };
  } catch {
    return null;
  }
}

export async function saveOrderToAccountApi(
  token: string,
  order: OrderRecord
): Promise<OrderRecord | null> {
  try {
    const res = await fetch('/api/account/orders', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ order }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { order?: OrderRecord };
    return data.order || null;
  } catch {
    return null;
  }
}

export async function cancelAccountOrderApi(
  token: string,
  orderNumber: string
): Promise<boolean> {
  try {
    const res = await fetch(`/api/account/orders/${encodeURIComponent(orderNumber)}/cancel`, {
      method: 'PATCH',
      headers: authHeaders(token),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveBookingToAccountApi(
  token: string,
  booking: TastingBookingRecord
): Promise<TastingBookingRecord | null> {
  try {
    const res = await fetch('/api/account/bookings', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ booking }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { booking?: TastingBookingRecord };
    return data.booking || null;
  } catch {
    return null;
  }
}

export async function cancelAccountBookingApi(
  token: string,
  bookingCode: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/account/bookings/${encodeURIComponent(bookingCode)}/cancel`,
      {
        method: 'PATCH',
        headers: authHeaders(token),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchAdminOverviewApi(
  token: string
): Promise<AdminOverviewResponse | null> {
  try {
    const res = await fetch('/api/admin/overview', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as AdminOverviewResponse;
  } catch {
    return null;
  }
}

export async function adminCreateProductApi(
  token: string,
  payload: Record<string, unknown>
): Promise<{ ok: true; product: Product } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { product?: Product; error?: string };
    if (!res.ok || !data.product) {
      return { ok: false, error: data.error || 'Không thể tạo sản phẩm.' };
    }
    return { ok: true, product: data.product };
  } catch {
    return { ok: false, error: 'Lỗi kết nối máy chủ quản trị.' };
  }
}

export async function adminUpdateProductApi(
  token: string,
  productId: string,
  payload: Record<string, unknown>
): Promise<{ ok: true; product: Product } | { ok: false; error: string }> {
  try {
    const res = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { product?: Product; error?: string };
    if (!res.ok || !data.product) {
      return { ok: false, error: data.error || 'Không thể cập nhật sản phẩm.' };
    }
    return { ok: true, product: data.product };
  } catch {
    return { ok: false, error: 'Lỗi kết nối máy chủ quản trị.' };
  }
}

export async function adminDeleteProductApi(
  token: string,
  productId: string
): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminUpdateOrderStatusApi(
  token: string,
  orderNumber: string,
  status: OrderStatusCode
): Promise<OrderRecord | null> {
  try {
    const res = await fetch(
      `/api/admin/orders/${encodeURIComponent(orderNumber)}/status`,
      {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({ status }),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { order?: OrderRecord };
    return data.order || null;
  } catch {
    return null;
  }
}

export async function adminUpdateBookingStatusApi(
  token: string,
  bookingCode: string,
  status: BookingStatusCode
): Promise<TastingBookingRecord | null> {
  try {
    const res = await fetch(
      `/api/admin/bookings/${encodeURIComponent(bookingCode)}/status`,
      {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({ status }),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { booking?: TastingBookingRecord };
    return data.booking || null;
  } catch {
    return null;
  }
}
