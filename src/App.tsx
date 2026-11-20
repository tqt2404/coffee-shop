/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, MotionConfig } from 'motion/react';
import { PRODUCTS } from './data/products';
import { useFlyToCart } from './hooks/useFlyToCart';
import { FirebaseProvider, useFirebase } from './lib/firebase/FirebaseProvider';
import { fetchProductsFromApi } from './services/apiClient';
import {
  cancelBookingInCloud,
  createBookingInCloud,
  subscribeUserBookings,
} from './services/bookingService';
import {
  cancelOrderInCloud,
  createOrderInCloud,
  subscribeUserOrders,
} from './services/orderService';
import type {
  CartItem,
  GrindOption,
  OrderRecord,
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
import { EditorialCurtain } from './components/motion/EditorialCurtain';
import { FlyToCartLayer } from './components/motion/FlyToCartLayer';
import { KineticMarquee } from './components/motion/KineticMarquee';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { CartDrawer } from './features/cart/CartDrawer';
import { CatalogSection } from './features/catalog/CatalogSection';
import { ProductModal } from './features/catalog/ProductModal';
import { ChatWidget } from './features/chat/ChatWidget';
import { CraftSection } from './features/craft/CraftSection';
import { HeroMorphDeck } from './features/hero/HeroMorphDeck';
import { Footer } from './features/layout/Footer';
import { Header } from './features/layout/Header';
import { PageRail } from './features/layout/PageRail';
import { OrderHistorySection } from './features/orders/OrderHistorySection';
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
  const { user, authReady } = useFirebase();
  const { parcels, cartPulseKey, launchToCart } = useFlyToCart();

  const [catalog, setCatalog] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadStoredJson<CartItem[]>(CART_STORAGE_KEY, [])
  );
  const [localOrders, setLocalOrders] = useState<OrderRecord[]>(() =>
    loadStoredJson<OrderRecord[]>(ORDERS_STORAGE_KEY, [])
  );
  const [cloudOrders, setCloudOrders] = useState<OrderRecord[]>([]);
  const [localBookings, setLocalBookings] = useState<TastingBookingRecord[]>(() =>
    loadStoredJson<TastingBookingRecord[]>(BOOKINGS_STORAGE_KEY, [])
  );
  const [cloudBookings, setCloudBookings] = useState<TastingBookingRecord[]>([]);

  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [promoCode, setPromoCode] = useState('');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingChatPrompt, setPendingChatPrompt] = useState<string | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);

  // Hydrate catalog from modular Express backend API (/api/products)
  useEffect(() => {
    let active = true;
    void fetchProductsFromApi().then((items) => {
      if (active && items && items.length > 0) {
        setCatalog(items);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Subscribe to Firestore orders & bookings ONLY when authenticated & authReady
  useEffect(() => {
    if (!authReady || !user) {
      setCloudOrders([]);
      setCloudBookings([]);
      return;
    }

    const unsubOrders = subscribeUserOrders(
      user.uid,
      (list) => setCloudOrders(list),
      (err) => console.error('[Orders subscription]', err)
    );

    const unsubBookings = subscribeUserBookings(
      user.uid,
      (list) => setCloudBookings(list),
      (err) => console.error('[Bookings subscription]', err)
    );

    return () => {
      unsubOrders();
      unsubBookings();
    };
  }, [authReady, user]);

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

  // Merge cloud & local orders without duplicate orderNumbers
  const orders = useMemo(() => {
    const map = new Map<string, OrderRecord>();
    for (const o of cloudOrders) map.set(o.orderNumber, o);
    for (const o of localOrders) {
      if (!map.has(o.orderNumber)) map.set(o.orderNumber, o);
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [cloudOrders, localOrders]);

  const bookings = useMemo(() => {
    const map = new Map<string, TastingBookingRecord>();
    for (const b of cloudBookings) map.set(b.bookingCode, b);
    for (const b of localBookings) {
      if (!map.has(b.bookingCode)) map.set(b.bookingCode, b);
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [cloudBookings, localBookings]);

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

  const handleQuickAdd = (product: Product, origin?: { x: number; y: number }) => {
    launchToCart(product.name, origin);
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

  const handleAddFromModal = (payload: {
    product: Product;
    weight: WeightOption;
    grind: GrindOption;
    quantity: number;
    unitPrice: number;
  }) => {
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
    }
    setLocalOrders((prev) => [finalOrder, ...prev]);
    setCart([]);
    setPromoCode('');
    return finalOrder;
  };

  const handleCancelOrder = async (order: OrderRecord): Promise<void> => {
    if (order.source === 'cloud' && order.id && user) {
      await cancelOrderInCloud(order.id);
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
    }
    setLocalBookings((prev) => [saved, ...prev]);
    setToastText(`Đã lưu lịch thử nếm ${saved.bookingCode} tại ${saved.branchName}.`);
  };

  const handleCancelBooking = async (booking: TastingBookingRecord): Promise<void> => {
    if (booking.source === 'cloud' && user) {
      await cancelBookingInCloud(booking.id);
    }
    setLocalBookings((prev) =>
      prev.map((b) =>
        b.bookingCode === booking.bookingCode ? { ...b, status: 'cancelled' } : b
      )
    );
    setToastText(`Đã hủy lịch hẹn ${booking.bookingCode}.`);
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
          <EditorialCurtain />
          <FlyToCartLayer parcels={parcels} />

          <Header
            cartCount={cartCount}
            cartPulseKey={cartPulseKey}
            onOpenCart={() => setIsCartOpen(true)}
          />
          <PageRail />

          <main className="flex-1">
            <HeroMorphDeck />
            <KineticMarquee items={MARQUEE_ROASTERY} baseVelocity={-2.5} variant="ink" />
            <CatalogSection
              products={filteredProducts}
              activeCategory={activeCategory}
              searchQuery={searchQuery}
              sortBy={sortBy}
              onCategoryChange={setActiveCategory}
              onSearchChange={setSearchQuery}
              onSortChange={setSortBy}
              onSelectProduct={setSelectedProduct}
              onQuickAdd={handleQuickAdd}
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

          <Footer />

          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddFromModal}
          />

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

          <ChatWidget
            isOpen={isChatOpen}
            onToggle={setIsChatOpen}
            cartItems={cart}
            promoCode={promoCode}
            activeProduct={selectedProduct}
            pendingPrompt={pendingChatPrompt}
            onClearPendingPrompt={() => setPendingChatPrompt(null)}
          />

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
