/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, MotionConfig } from 'motion/react';
import { PRODUCTS } from './data/products';
import {
  CartItem,
  GrindOption,
  OrderRecord,
  Product,
  ProductCategory,
  SortOption,
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
import { Header } from './components/Header';
import { HeroMorphDeck } from './components/HeroMorphDeck';
import { PageRail } from './components/PageRail';
import { CatalogSection } from './components/CatalogSection';
import { CraftSection } from './components/CraftSection';
import { StoreLocatorSection } from './components/StoreLocatorSection';
import { OrderHistorySection } from './components/OrderHistorySection';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { ChatWidget } from './components/ChatWidget';
import { Footer } from './components/Footer';

const CART_STORAGE_KEY = 'lacson_cart_v1';
const ORDERS_STORAGE_KEY = 'lacson_orders_v1';

function loadStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadStoredJson<CartItem[]>(CART_STORAGE_KEY, [])
  );
  const [orders, setOrders] = useState<OrderRecord[]>(() =>
    loadStoredJson<OrderRecord[]>(ORDERS_STORAGE_KEY, [])
  );

  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [promoCode, setPromoCode] = useState('');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingChatPrompt, setPendingChatPrompt] = useState<string | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Ignore storage quota errors
    }
  }, [orders]);

  useEffect(() => {
    if (!toastText) return;
    const timer = window.setTimeout(() => setToastText(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastText]);

  const filteredProducts = useMemo(
    () =>
      filterAndSortProducts(PRODUCTS, {
        category: activeCategory,
        query: searchQuery,
        sortBy,
      }),
    [activeCategory, searchQuery, sortBy]
  );

  const cartCount = useMemo(() => getCartItemCount(cart), [cart]);

  const handleQuickAdd = (product: Product) => {
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

  const handleCompleteOrder = (order: OrderRecord) => {
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setPromoCode('');
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
          <Header cartCount={cartCount} onOpenCart={() => setIsCartOpen(true)} />
          <PageRail />

          <main className="flex-1">
            <HeroMorphDeck />
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
            <StoreLocatorSection onOpenBookingChat={handleOpenBookingChat} />
            <OrderHistorySection orders={orders} />
          </main>

          <Footer />

          {/* Product Detail & Variant Selector Modal (Shared-Element Morph from Catalog Cards) */}
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddFromModal}
          />

          {/* Slide-over Cart, Checkout & Receipt Drawer */}
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

          {/* Context-Aware Gemini Concierge Chat */}
          <ChatWidget
            isOpen={isChatOpen}
            onToggle={setIsChatOpen}
            cartItems={cart}
            promoCode={promoCode}
            activeProduct={selectedProduct}
            pendingPrompt={pendingChatPrompt}
            onClearPendingPrompt={() => setPendingChatPrompt(null)}
          />

          {/* Subtle Flat Animated Toast Feedback for Quick Add */}
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
