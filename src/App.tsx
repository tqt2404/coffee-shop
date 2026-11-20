/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, MotionConfig } from 'motion/react';
import { PRODUCTS } from './data/products';
import { useFlyToCart } from './hooks/useFlyToCart';
import { FirebaseProvider, useFirebase } from './lib/firebase/FirebaseProvider';
import {
  adminCreateProductApi,
  adminDeleteProductApi,
  adminUpdateBookingStatusApi,
  adminUpdateOrderStatusApi,
  adminUpdateProductApi,
  cancelAccountBookingApi,
  cancelAccountOrderApi,
  fetchAccountRecordsApi,
  fetchAdminOverviewApi,
  fetchProductsFromApi,
  saveBookingToAccountApi,
  saveOrderToAccountApi,
} from './services/apiClient';
import {
  cancelBookingInCloud,
  createBookingInCloud,
  subscribeAllBookingsForAdmin,
  subscribeUserBookings,
  updateBookingStatusInCloud,
} from './services/bookingService';
import {
  cancelOrderInCloud,
  createOrderInCloud,
  subscribeAllOrdersForAdmin,
  subscribeUserOrders,
  updateOrderStatusInCloud,
} from './services/orderService';
import {
  deleteProductInCloud,
  saveProductInCloud,
  subscribeCloudProducts,
} from './services/productService';
import type {
  BookingStatusCode,
  CartItem,
  GrindOption,
  OrderRecord,
  OrderStatusCode,
  Product,
  ProductCategory,
  SortOption,
  TastingBookingRecord,
  WeightOption,
} from './types/shop';
import { EDITORIAL_EASE } from './utils/motion';
import {
  addToCart,
  filterAndSortProducts,
  getCartItemCount,
  removeCartItem,
  updateCartQuantity,
} from './utils/shop';
import { ArtisanCursor } from './components/motion/ArtisanCursor';
import { EditorialCurtain } from './components/motion/EditorialCurtain';
import { FlyToCartLayer } from './components/motion/FlyToCartLayer';
import { KineticMarquee } from './components/motion/KineticMarquee';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { AdminConsole, type AdminProductDraft } from './features/admin/AdminConsole';
import { AuthModal } from './features/auth/AuthModal';
import { CartDrawer } from './features/cart/CartDrawer';
import { CatalogSection } from './features/catalog/CatalogSection';
import { CompareDockAndModal } from './features/catalog/CompareDockAndModal';
import { ProductModal } from './features/catalog/ProductModal';
import { ChatWidget } from './features/chat/ChatWidget';
import { CraftSection } from './features/craft/CraftSection';
import { GiftBoxBuilderSection } from './features/giftbox/GiftBoxBuilderSection';
import { HeroMorphDeck } from './features/hero/HeroMorphDeck';
import { Footer } from './features/layout/Footer';
import { Header } from './features/layout/Header';
import { PageRail } from './features/layout/PageRail';
import { OrderHistorySection } from './features/orders/OrderHistorySection';
import { SommelierQuizSection } from './features/quiz/SommelierQuizSection';
import { StoreLocatorSection } from './features/store-locator/StoreLocatorSection';

const CART_STORAGE_KEY = 'lacson_cart_v1';
const ORDERS_STORAGE_KEY = 'lacson_orders_v1';
const BOOKINGS_STORAGE_KEY = 'lacson_bookings_v1';

const MARQUEE_ROASTERY = [
  'CẦU ĐẤT 1.650M',
  'TRỐNG GANG GIESEN 12KG',
  'RANG MỚI TRONG 48 GIỜ',
  'ETHIOPIA YIRGACHEFFE & GUJI',
  'VAN MỘT CHIỀU NGUYÊN BẢN',
  'ĐÀ LẠT · HÀ NỘI',
];

const MARQUEE_CRAFT = [
  'TIẾNG NỔ ĐẦU 196°C',
  'NGHỈ HẠT 24 GIỜ',
  'PHIN CỔ ĐIỂN & POUR-OVER V60',
  'MIỄN PHÍ GIAO HÀNG TỪ 500.000 ₫',
  'MÃ ƯU ĐÃI LACSON10',
];

const ORDER_STATUS_TEXT: Record<OrderStatusCode, string> = {
  confirmed: 'Đã xác nhận · Đang chuẩn bị rang & đóng gói',
  roasting: 'Đang rang mẻ mới trên trống gang Giesen',
  shipped: 'Đang giao hàng toàn quốc',
  completed: 'Đã giao thành công',
  cancelled: 'Đã hủy đơn hàng',
};

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  'single-origin': 'Hạt Đơn Vùng',
  'phin-blend': 'Phối Trộn Phin',
  'cold-brew': 'Cà Phê Ủ Lạnh',
};

function loadStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function StorefrontShell() {
  const { user, appUser, passwordToken, isAdmin, authReady } = useFirebase();
  const { parcels, cartPulseKey, launchToCart } = useFlyToCart();

  const [activeView, setActiveView] = useState<'storefront' | 'admin'>('storefront');
  const [catalog, setCatalog] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadStoredJson<CartItem[]>(CART_STORAGE_KEY, [])
  );
  const [localOrders, setLocalOrders] = useState<OrderRecord[]>(() =>
    loadStoredJson<OrderRecord[]>(ORDERS_STORAGE_KEY, [])
  );
  const [cloudOrders, setCloudOrders] = useState<OrderRecord[]>([]);
  const [serverOrders, setServerOrders] = useState<OrderRecord[]>([]);
  const [localBookings, setLocalBookings] = useState<TastingBookingRecord[]>(() =>
    loadStoredJson<TastingBookingRecord[]>(BOOKINGS_STORAGE_KEY, [])
  );
  const [cloudBookings, setCloudBookings] = useState<TastingBookingRecord[]>([]);
  const [serverBookings, setServerBookings] = useState<TastingBookingRecord[]>([]);

  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [promoCode, setPromoCode] = useState('');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingChatPrompt, setPendingChatPrompt] = useState<string | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);

  // Guard: non-admins cannot stay in admin view
  useEffect(() => {
    if (!isAdmin && activeView === 'admin') {
      setActiveView('storefront');
    }
  }, [isAdmin, activeView]);

  // Hydrate catalog from Express / Vercel API (/api/products)
  const refreshCatalogFromApi = useCallback(async () => {
    const items = await fetchProductsFromApi();
    if (items && items.length > 0) {
      setCatalog(items);
    }
  }, []);

  useEffect(() => {
    void refreshCatalogFromApi();
  }, [refreshCatalogFromApi]);

  // Subscribe to public Firestore /products overlay if admin saved cloud products
  useEffect(() => {
    const unsub = subscribeCloudProducts(
      (cloudProducts) => {
        if (cloudProducts.length > 0) {
          setCatalog(cloudProducts);
        }
      },
      () => {
        // Silently keep API/default catalog if Firestore offline or empty
      }
    );
    return () => unsub();
  }, []);

  // Subscribe to Firestore orders & bookings for Google-authenticated users / admins
  useEffect(() => {
    if (!authReady || !user) {
      setCloudOrders([]);
      setCloudBookings([]);
      return;
    }

    const unsubOrders = isAdmin
      ? subscribeAllOrdersForAdmin(
          (list) => setCloudOrders(list),
          (err) => console.error('[Admin orders subscription]', err)
        )
      : subscribeUserOrders(
          user.uid,
          (list) => setCloudOrders(list),
          (err) => console.error('[Orders subscription]', err)
        );

    const unsubBookings = isAdmin
      ? subscribeAllBookingsForAdmin(
          (list) => setCloudBookings(list),
          (err) => console.error('[Admin bookings subscription]', err)
        )
      : subscribeUserBookings(
          user.uid,
          (list) => setCloudBookings(list),
          (err) => console.error('[Bookings subscription]', err)
        );

    return () => {
      unsubOrders();
      unsubBookings();
    };
  }, [authReady, user, isAdmin]);

  // Fetch server-side records for SHA-256 Password-authenticated users / admins
  useEffect(() => {
    if (!authReady || !passwordToken || !appUser || appUser.provider !== 'password') {
      setServerOrders([]);
      setServerBookings([]);
      return;
    }

    let active = true;
    if (isAdmin) {
      void fetchAdminOverviewApi(passwordToken).then((overview) => {
        if (!active || !overview) return;
        setServerOrders(overview.orders);
        setServerBookings(overview.bookings);
        if (overview.products.length > 0) {
          setCatalog(overview.products);
        }
      });
    } else {
      void fetchAccountRecordsApi(passwordToken).then((records) => {
        if (!active || !records) return;
        setServerOrders(records.orders);
        setServerBookings(records.bookings);
      });
    }

    return () => {
      active = false;
    };
  }, [authReady, passwordToken, appUser, isAdmin, activeView]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(localOrders));
    } catch {
      // Ignore storage quota errors
    }
  }, [localOrders]);

  useEffect(() => {
    try {
      window.localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(localBookings));
    } catch {
      // Ignore storage quota errors
    }
  }, [localBookings]);

  useEffect(() => {
    if (!toastText) return;
    const timer = window.setTimeout(() => setToastText(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toastText]);

  // Merge cloud, password-API, and local orders without duplicate orderNumbers
  const orders = useMemo(() => {
    const map = new Map<string, OrderRecord>();
    for (const o of cloudOrders) map.set(o.orderNumber, o);
    for (const o of serverOrders) {
      if (!map.has(o.orderNumber)) map.set(o.orderNumber, o);
    }
    for (const o of localOrders) {
      if (!map.has(o.orderNumber)) map.set(o.orderNumber, o);
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [cloudOrders, serverOrders, localOrders]);

  const bookings = useMemo(() => {
    const map = new Map<string, TastingBookingRecord>();
    for (const b of cloudBookings) map.set(b.bookingCode, b);
    for (const b of serverBookings) {
      if (!map.has(b.bookingCode)) map.set(b.bookingCode, b);
    }
    for (const b of localBookings) {
      if (!map.has(b.bookingCode)) map.set(b.bookingCode, b);
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [cloudBookings, serverBookings, localBookings]);

  const filteredProducts = useMemo(
    () =>
      filterAndSortProducts(catalog, {
        category: activeCategory,
        query: searchQuery,
        sortBy,
      }),
    [catalog, activeCategory, searchQuery, sortBy]
  );

  const cartCount = useMemo(() => getCartItemCount(cart), [cart]);

  const compareProducts = useMemo(
    () =>
      compareIds
        .map((id) => catalog.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [compareIds, catalog]
  );

  const handleToggleCompare = (product: Product) => {
    setCompareIds((prev) => {
      if (prev.includes(product.id)) {
        return prev.filter((id) => id !== product.id);
      }
      if (prev.length >= 2) {
        setToastText(`Đã đổi lô so sánh sang ${product.name}. Bấm Đối chiếu vị giác bên dưới.`);
        return [prev[1], product.id];
      }
      if (prev.length === 1) {
        setToastText(`Đã đủ 2 lô so sánh. Bấm "Đối chiếu vị giác" để mở biểu đồ chồng lớp.`);
      } else {
        setToastText(`Đã thêm ${product.name} vào khay so sánh. Chọn thêm 1 lô nữa.`);
      }
      return [...prev, product.id];
    });
  };

  const handleQuickAdd = (product: Product, origin?: { x: number; y: number }) => {
    launchToCart(product.name, origin, product.image);
    setCart((prev) =>
      addToCart(prev, {
        productId: product.id,
        name: product.name,
        image: product.image,
        weight: product.defaultWeight,
        grind: product.availableGrinds[0],
        unitPrice: product.basePrice,
        quantity: 1,
      })
    );
    setToastText(`Đã thêm ${product.name} (${product.defaultWeight}) vào giỏ hàng.`);
  };

  const handleAddGiftBox = (
    payload: Omit<CartItem, 'lineId'>,
    origin?: { x: number; y: number }
  ) => {
    launchToCart(payload.name, origin, payload.image);
    setCart((prev) => addToCart(prev, payload));
    setToastText('Đã thêm Hộp Quà Biếu 3 Vị (ưu đãi 12%) kèm thiệp chúc vào giỏ hàng.');
  };

  const handleAddFromModal = (payload: {
    product: Product;
    weight: WeightOption;
    grind: GrindOption;
    quantity: number;
    unitPrice: number;
  }) => {
    launchToCart(payload.product.name, undefined, payload.product.image);
    setCart((prev) =>
      addToCart(prev, {
        productId: payload.product.id,
        name: payload.product.name,
        image: payload.product.image,
        weight: payload.weight,
        grind: payload.grind,
        unitPrice: payload.unitPrice,
        quantity: payload.quantity,
      })
    );
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (lineId: string, delta: number) => {
    setCart((prev) => updateCartQuantity(prev, lineId, delta));
  };

  const handleRemoveItem = (lineId: string) => {
    setCart((prev) => removeCartItem(prev, lineId));
  };

  const handleCompleteOrder = async (order: OrderRecord): Promise<OrderRecord> => {
    let finalOrder = order;
    if (user && user.emailVerified) {
      try {
        finalOrder = await createOrderInCloud(user.uid, order);
      } catch (err) {
        console.error('[Order cloud save fallback to local]', err);
      }
    } else if (passwordToken) {
      const saved = await saveOrderToAccountApi(passwordToken, order);
      if (saved) {
        finalOrder = saved;
        setServerOrders((prev) => [saved, ...prev]);
      }
    }
    setLocalOrders((prev) => [finalOrder, ...prev]);
    setCart([]);
    setPromoCode('');
    return finalOrder;
  };

  const handleCancelOrder = async (order: OrderRecord): Promise<void> => {
    if (order.source === 'cloud' && order.id && user) {
      await cancelOrderInCloud(order.id);
    } else if (passwordToken) {
      await cancelAccountOrderApi(passwordToken, order.orderNumber);
      setServerOrders((prev) =>
        prev.map((o) =>
          o.orderNumber === order.orderNumber
            ? {
                ...o,
                statusCode: 'cancelled',
                status: 'Đã hủy theo yêu cầu khách hàng',
              }
            : o
        )
      );
    }
    setLocalOrders((prev) =>
      prev.map((o) =>
        o.orderNumber === order.orderNumber
          ? {
              ...o,
              statusCode: 'cancelled',
              status: 'Đã hủy theo yêu cầu khách hàng',
            }
          : o
      )
    );
    setToastText(`Đã cập nhật trạng thái hủy cho đơn ${order.orderNumber}.`);
  };

  const handleCreateBooking = async (booking: TastingBookingRecord): Promise<void> => {
    let saved = booking;
    if (user && user.emailVerified) {
      try {
        saved = await createBookingInCloud(user.uid, booking);
      } catch (err) {
        console.error('[Booking cloud save fallback to local]', err);
      }
    } else if (passwordToken) {
      const stored = await saveBookingToAccountApi(passwordToken, booking);
      if (stored) {
        saved = stored;
        setServerBookings((prev) => [stored, ...prev]);
      }
    }
    setLocalBookings((prev) => [saved, ...prev]);
    setToastText(`Đã lưu lịch thử nếm ${saved.bookingCode} tại ${saved.branchName}.`);
  };

  const handleCancelBooking = async (booking: TastingBookingRecord): Promise<void> => {
    if (booking.source === 'cloud' && user) {
      await cancelBookingInCloud(booking.id);
    } else if (passwordToken) {
      await cancelAccountBookingApi(passwordToken, booking.bookingCode);
      setServerBookings((prev) =>
        prev.map((b) =>
          b.bookingCode === booking.bookingCode ? { ...b, status: 'cancelled' } : b
        )
      );
    }
    setLocalBookings((prev) =>
      prev.map((b) =>
        b.bookingCode === booking.bookingCode ? { ...b, status: 'cancelled' } : b
      )
    );
    setToastText(`Đã hủy lịch hẹn ${booking.bookingCode}.`);
  };

  // === Admin Operations ===
  const handleAdminUpdateOrderStatus = async (
    order: OrderRecord,
    status: OrderStatusCode
  ): Promise<void> => {
    if (user && isAdmin && order.source === 'cloud' && order.id) {
      await updateOrderStatusInCloud(order.id, status);
    }
    if (passwordToken && isAdmin) {
      await adminUpdateOrderStatusApi(passwordToken, order.orderNumber, status);
    }
    const nextLabel = ORDER_STATUS_TEXT[status];
    setServerOrders((prev) =>
      prev.map((o) =>
        o.orderNumber === order.orderNumber
          ? { ...o, statusCode: status, status: nextLabel }
          : o
      )
    );
    setLocalOrders((prev) =>
      prev.map((o) =>
        o.orderNumber === order.orderNumber
          ? { ...o, statusCode: status, status: nextLabel }
          : o
      )
    );
    setToastText(`Đã cập nhật đơn ${order.orderNumber} → ${nextLabel}.`);
  };

  const handleAdminUpdateBookingStatus = async (
    booking: TastingBookingRecord,
    status: BookingStatusCode
  ): Promise<void> => {
    if (user && isAdmin && booking.source === 'cloud') {
      await updateBookingStatusInCloud(booking.id, status);
    }
    if (passwordToken && isAdmin) {
      await adminUpdateBookingStatusApi(passwordToken, booking.bookingCode, status);
    }
    setServerBookings((prev) =>
      prev.map((b) =>
        b.bookingCode === booking.bookingCode ? { ...b, status } : b
      )
    );
    setLocalBookings((prev) =>
      prev.map((b) =>
        b.bookingCode === booking.bookingCode ? { ...b, status } : b
      )
    );
    setToastText(`Đã cập nhật lịch thử nếm ${booking.bookingCode}.`);
  };

  const handleAdminSaveProduct = async (
    draft: AdminProductDraft
  ): Promise<{ ok: true } | { ok: false; error: string }> => {
    const tastingNotes = draft.tastingNotesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6);

    const payload = {
      name: draft.name.trim(),
      subtitle: draft.subtitle.trim(),
      category: draft.category,
      origin: draft.origin.trim(),
      elevation: draft.elevation.trim(),
      process: draft.process.trim(),
      roastLevel: draft.roastLevel,
      tastingNotes,
      sensoryProfile: draft.sensoryProfile,
      description: draft.description.trim(),
      basePrice: Number(draft.basePrice),
      batchCode: draft.batchCode.trim(),
      stock: Number(draft.stock),
      statusNote: draft.statusNote.trim(),
      image: draft.image,
    };

    if (passwordToken && isAdmin) {
      const apiRes = draft.id
        ? await adminUpdateProductApi(passwordToken, draft.id, payload)
        : await adminCreateProductApi(passwordToken, payload);

      if (!apiRes.ok) {
        return apiRes;
      }

      setCatalog((prev) => {
        const exists = prev.some((p) => p.id === apiRes.product.id);
        if (exists) {
          return prev.map((p) => (p.id === apiRes.product.id ? apiRes.product : p));
        }
        return [apiRes.product, ...prev];
      });
      setToastText(
        draft.id
          ? `Đã cập nhật sản phẩm ${apiRes.product.name}.`
          : `Đã thêm mới ${apiRes.product.name} vào bộ sưu tập.`
      );
      return { ok: true };
    }

    // Google Admin direct Firestore persistence
    if (user && isAdmin) {
      const slug =
        draft.id ||
        draft.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/gi, 'd')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') ||
        `lot-${Date.now()}`;
      const isCold = draft.category === 'cold-brew';
      const normalized: Product = {
        id: slug,
        slug,
        name: payload.name,
        subtitle: payload.subtitle,
        category: payload.category,
        categoryLabel: CATEGORY_LABELS[payload.category],
        origin: payload.origin,
        elevation: payload.elevation,
        process: payload.process,
        roastLevel: payload.roastLevel,
        tastingNotes: tastingNotes.length > 0 ? tastingNotes : ['Ca cao thanh'],
        sensoryProfile: payload.sensoryProfile,
        description: payload.description,
        basePrice: payload.basePrice,
        defaultWeight: isCold ? '350ml' : '250g',
        availableWeights: isCold ? ['350ml'] : ['250g', '500g', '1kg'],
        availableGrinds: isCold
          ? ['Uống liền']
          : ['Nguyên hạt', 'Xay Pha Phin', 'Xay Pour-over', 'Xay Espresso'],
        isSingleUnit: isCold || undefined,
        batchCode: payload.batchCode,
        stock: payload.stock,
        statusNote: payload.statusNote,
        image: payload.image,
        imageAlt: `${payload.name} — Nhà Rang Lạc Sơn`,
      };

      await saveProductInCloud(normalized);
      setCatalog((prev) => {
        const exists = prev.some((p) => p.id === normalized.id);
        return exists
          ? prev.map((p) => (p.id === normalized.id ? normalized : p))
          : [normalized, ...prev];
      });
      setToastText(`Đã lưu sản phẩm ${normalized.name} lên Firestore.`);
      return { ok: true };
    }

    return { ok: false, error: 'Bạn không có quyền quản trị để lưu sản phẩm.' };
  };

  const handleAdminDeleteProduct = async (product: Product): Promise<void> => {
    if (passwordToken && isAdmin) {
      await adminDeleteProductApi(passwordToken, product.id);
    }
    if (user && isAdmin) {
      await deleteProductInCloud(product.id).catch(() => undefined);
    }
    setCatalog((prev) => prev.filter((p) => p.id !== product.id));
    setToastText(`Đã xóa sản phẩm ${product.name} khỏi danh mục.`);
  };

  const handleOpenBookingChat = (branchName: string) => {
    setPendingChatPrompt(
      `Tôi muốn đặt lịch thử nếm cà phê tại ${branchName}. Vui lòng hướng dẫn tôi các bước đặt chỗ.`
    );
    setIsChatOpen(true);
  };

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup>
        <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#191715]">
          <ArtisanCursor />
          <EditorialCurtain />
          <FlyToCartLayer parcels={parcels} />

          <Header
            cartCount={cartCount}
            cartPulseKey={cartPulseKey}
            activeView={activeView}
            onSwitchView={(view) => {
              setActiveView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenCart={() => setIsCartOpen(true)}
          />

          {activeView === 'admin' && isAdmin && appUser ? (
            <AdminConsole
              adminUser={appUser}
              products={catalog}
              orders={orders}
              bookings={bookings}
              onBackToStorefront={() => {
                setActiveView('storefront');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onUpdateOrderStatus={handleAdminUpdateOrderStatus}
              onUpdateBookingStatus={handleAdminUpdateBookingStatus}
              onSaveProduct={handleAdminSaveProduct}
              onDeleteProduct={handleAdminDeleteProduct}
            />
          ) : (
            <>
              <PageRail />
              <main className="flex-1">
                <HeroMorphDeck />
                <KineticMarquee items={MARQUEE_ROASTERY} baseVelocity={-2.5} variant="ink" />
                <SommelierQuizSection
                  products={catalog}
                  onSelectProduct={setSelectedProduct}
                  onQuickAdd={handleQuickAdd}
                />
                <CatalogSection
                  products={filteredProducts}
                  activeCategory={activeCategory}
                  searchQuery={searchQuery}
                  sortBy={sortBy}
                  compareIds={compareIds}
                  onCategoryChange={setActiveCategory}
                  onSearchChange={setSearchQuery}
                  onSortChange={setSortBy}
                  onSelectProduct={setSelectedProduct}
                  onQuickAdd={handleQuickAdd}
                  onToggleCompare={handleToggleCompare}
                />
                <GiftBoxBuilderSection
                  products={catalog}
                  onAddGiftBox={handleAddGiftBox}
                />
                <CraftSection />
                <KineticMarquee items={MARQUEE_CRAFT} baseVelocity={2.2} variant="parchment" />
                <StoreLocatorSection
                  onOpenBookingChat={handleOpenBookingChat}
                  onCreateBooking={handleCreateBooking}
                />
                <OrderHistorySection
                  orders={orders}
                  bookings={bookings}
                  onCancelOrder={handleCancelOrder}
                  onCancelBooking={handleCancelBooking}
                />
              </main>
            </>
          )}

          <Footer />

          <AuthModal />

          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddFromModal}
          />

          {activeView === 'storefront' && (
            <CompareDockAndModal
              compareProducts={compareProducts}
              isOpen={isCompareOpen}
              onOpenModal={() => setIsCompareOpen(true)}
              onCloseModal={() => setIsCompareOpen(false)}
              onRemoveFromCompare={(id) =>
                setCompareIds((prev) => prev.filter((x) => x !== id))
              }
              onClearCompare={() => {
                setCompareIds([]);
                setIsCompareOpen(false);
              }}
              onSelectProduct={setSelectedProduct}
              onQuickAdd={handleQuickAdd}
            />
          )}

          <CartDrawer
            isOpen={isCartOpen}
            items={cart}
            promoCode={promoCode}
            onPromoCodeChange={setPromoCode}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClose={() => setIsCartOpen(false)}
            onCompleteOrder={handleCompleteOrder}
          />

          {activeView === 'storefront' && (
            <ChatWidget
              isOpen={isChatOpen}
              onToggle={setIsChatOpen}
              cartItems={cart}
              promoCode={promoCode}
              activeProduct={selectedProduct}
              pendingPrompt={pendingChatPrompt}
              onClearPendingPrompt={() => setPendingChatPrompt(null)}
            />
          )}

          <AnimatePresence>
            {toastText && (
              <motion.div
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.24, ease: EDITORIAL_EASE }}
                className="fixed bottom-20 left-4 sm:left-6 z-40 max-w-sm bg-[#191715] text-[#F8F7F4] border border-[#34302B] px-4 py-3 text-xs sm:text-sm flex items-center justify-between gap-4"
              >
                <span>{toastText}</span>
                {activeView === 'storefront' && (
                  <button
                    type="button"
                    onClick={() => {
                      setToastText(null);
                      setIsCartOpen(true);
                    }}
                    className="underline text-[#EFECE6] hover:text-[#FFFFFF] whitespace-nowrap cursor-pointer"
                  >
                    Xem giỏ
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <StorefrontShell />
      </FirebaseProvider>
    </ErrorBoundary>
  );
}
