import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  ShoppingBag,
  Store,
  User,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import { useFirebase } from '../../lib/firebase/FirebaseProvider';
import { useMagnetic } from '../../hooks/useMagnetic';
import {
  FAST_MORPH_SPRING,
  ORGANIC_SPRING,
  SILK_EASE,
  SILKY_SCROLL_SPRING,
} from '../../utils/motion';

interface HeaderProps {
  cartCount: number;
  cartPulseKey: number;
  activeView: 'storefront' | 'admin';
  onSwitchView: (view: 'storefront' | 'admin') => void;
  onOpenCart: () => void;
}

const NAV_LINKS = [
  { href: '#bo-suu-tap', label: 'Bộ sưu tập' },
  { href: '#triet-ly-rang', label: 'Triết lý rang' },
  { href: '#cua-hang', label: 'Cửa hàng' },
  { href: '#don-hang', label: 'Đơn hàng' },
];

export function Header({
  cartCount,
  cartPulseKey,
  activeView,
  onSwitchView,
  onOpenCart,
}: HeaderProps) {
  const { appUser, isAdmin, authReady, authBusy, openAuthModal, signOutUser } =
    useFirebase();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const cartMagnet = useMagnetic(0.2);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, SILKY_SCROLL_SPRING);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, [accountMenuOpen]);

  const shortName = isAdmin
    ? 'Admin'
    : appUser?.displayName?.split(' ').slice(-1)[0] ||
      appUser?.username ||
      appUser?.email?.split('@')[0] ||
      'Tài khoản';

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (activeView !== 'storefront') {
      onSwitchView('storefront');
      window.setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b border-[#DDD8CE] transition-colors duration-300 ${
        scrolled ? 'bg-[#FFFFFF]' : 'bg-[#F8F7F4]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <motion.a
          href="#top"
          onClick={() => {
            if (activeView !== 'storefront') onSwitchView('storefront');
          }}
          whileHover={{ x: 2 }}
          transition={ORGANIC_SPRING}
          className="font-display text-2xl sm:text-[26px] font-semibold tracking-tight text-[#191715] whitespace-nowrap shrink-0"
        >
          Lạc Sơn
        </motion.a>

        {/* Zone 2: 4 concise single-line text links with morphing underline */}
        <nav
          aria-label="Điều hướng chính"
          onMouseLeave={() => setHoveredNav(null)}
          className="hidden md:flex items-center gap-7 lg:gap-8 text-sm font-medium text-[#5C574F]"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => handleNavClick(link.href)}
              onMouseEnter={() => setHoveredNav(link.href)}
              onFocus={() => setHoveredNav(link.href)}
              className="relative py-2 whitespace-nowrap shrink-0 hover:text-[#191715] transition-colors"
            >
              <span>{link.label}</span>
              {hoveredNav === link.href && (
                <motion.span
                  layoutId="header-nav-underline"
                  transition={FAST_MORPH_SPRING}
                  aria-hidden="true"
                  className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-[#1F3A2E]"
                />
              )}
            </a>
          ))}
        </nav>

        {/* Zone 3: Account Menu (with Admin switch for role=admin) + Primary Cart CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {authReady && (
            appUser ? (
              <div ref={accountMenuRef} className="relative hidden sm:block">
                <button
                  type="button"
                  disabled={authBusy}
                  aria-label={`Tài khoản ${appUser.displayName}`}
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => setAccountMenuOpen((o) => !o)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] border text-xs font-medium transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 ${
                    isAdmin
                      ? 'border-[#7A5C38] bg-[#FFFFFF] text-[#191715] hover:border-[#191715]'
                      : 'border-[#DDD8CE] bg-[#FFFFFF] text-[#191715] hover:border-[#191715]'
                  }`}
                >
                  {isAdmin ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#7A5C38]" aria-hidden="true" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-[#1F3A2E]" aria-hidden="true" />
                  )}
                  <span className="max-w-[92px] truncate">{shortName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#5C574F]" aria-hidden="true" />
                </button>

                <AnimatePresence>
                  {accountMenuOpen && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.16, ease: SILK_EASE }}
                      className="absolute right-0 mt-1.5 w-64 bg-[#FFFFFF] border border-[#191715] z-50 divide-y divide-[#DDD8CE]"
                    >
                      <div className="px-4 py-3 bg-[#F8F7F4]">
                        <p className="text-sm font-semibold text-[#191715] truncate">
                          {appUser.displayName}
                        </p>
                        <p className="text-xs font-mono text-[#5C574F] truncate mt-0.5">
                          {appUser.username ? `@${appUser.username}` : appUser.email}
                        </p>
                        <p className="text-[11px] font-mono text-[#7A5C38] mt-1">
                          {isAdmin ? 'Quản trị viên (Admin)' : 'Thành viên (User)'} ·{' '}
                          {appUser.provider === 'google' ? 'Google' : 'SHA-256'}
                        </p>
                      </div>

                      <div className="py-1">
                        {isAdmin && (
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setAccountMenuOpen(false);
                              onSwitchView(activeView === 'admin' ? 'storefront' : 'admin');
                            }}
                            className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#1F3A2E] hover:bg-[#EFECE6] inline-flex items-center gap-2 cursor-pointer"
                          >
                            {activeView === 'admin' ? (
                              <>
                                <Store className="w-4 h-4" aria-hidden="true" />
                                <span>Quay về Cửa hàng</span>
                              </>
                            ) : (
                              <>
                                <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                                <span>Mở Bảng Quản Trị</span>
                              </>
                            )}
                          </button>
                        )}

                        <a
                          href="#don-hang"
                          role="menuitem"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            handleNavClick('#don-hang');
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#191715] hover:bg-[#EFECE6] inline-flex items-center gap-2"
                        >
                          <Package className="w-4 h-4 text-[#5C574F]" aria-hidden="true" />
                          <span>Sổ đơn hàng & lịch hẹn</span>
                        </a>

                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            void signOutUser();
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#8E2A2A] hover:bg-[#EFECE6] inline-flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" aria-hidden="true" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                type="button"
                disabled={authBusy}
                onClick={openAuthModal}
                aria-label="Mở cửa sổ đăng nhập tài khoản"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] border border-[#DDD8CE] bg-[#FFFFFF] text-xs font-medium text-[#191715] hover:border-[#191715] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-3.5 h-3.5 text-[#1F3A2E]" aria-hidden="true" />
                <span>Đăng nhập</span>
              </button>
            )
          )}

          <motion.button
            id="header-cart-button"
            type="button"
            key={`cart-pulse-${cartPulseKey}`}
            style={{ x: cartMagnet.x, y: cartMagnet.y }}
            onMouseMove={cartMagnet.onMouseMove}
            onMouseLeave={cartMagnet.onMouseLeave}
            initial={cartPulseKey > 0 ? { scale: 1.09 } : false}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.96 }}
            transition={ORGANIC_SPRING}
            onClick={onOpenCart}
            aria-label={`Mở giỏ hàng, hiện có ${cartCount} sản phẩm`}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 min-h-[40px] bg-[#1F3A2E] text-[#F8F7F4] text-sm font-medium hover:bg-[#162B22] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
            <span className="tabular-nums inline-flex items-center gap-1">
              <span>Giỏ hàng</span>
              <span className="inline-flex items-center overflow-hidden h-5">
                (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={cartCount}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -12, opacity: 0 }}
                    transition={{ duration: 0.24, ease: SILK_EASE }}
                    className="inline-block"
                  >
                    {cartCount}
                  </motion.span>
                </AnimatePresence>
                )
              </span>
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={
              mobileMenuOpen ? 'Đóng danh mục điều hướng' : 'Mở danh mục điều hướng'
            }
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 border border-[#DDD8CE] bg-[#FFFFFF] text-[#191715] hover:bg-[#EFECE6] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Silky flat reading progress hairline */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: smoothProgress, transformOrigin: '0% 50%' }}
        className="h-[2px] w-full bg-[#1F3A2E] will-change-transform"
      />

      {/* Mobile navigation dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            aria-label="Điều hướng di động"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.26, ease: SILK_EASE }}
            className="md:hidden bg-[#FFFFFF] border-t border-[#DDD8CE] px-4 py-3"
          >
            <ul className="divide-y divide-[#DDD8CE]">
              {NAV_LINKS.map((link, idx) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.045, ease: SILK_EASE }}
                >
                  <a
                    href={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="block py-3 text-base font-medium text-[#191715] hover:text-[#1F3A2E] transition-colors"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
              {authReady && (
                <li className="pt-3 pb-1 space-y-2">
                  {appUser ? (
                    <>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            onSwitchView(activeView === 'admin' ? 'storefront' : 'admin');
                          }}
                          className="w-full py-2.5 px-3 bg-[#1F3A2E] text-[#F8F7F4] text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                          <span>
                            {activeView === 'admin'
                              ? 'Quay về Cửa hàng'
                              : 'Mở Bảng Quản Trị (Admin)'}
                          </span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          void signOutUser();
                        }}
                        className="w-full py-2.5 px-3 border border-[#DDD8CE] bg-[#F8F7F4] text-sm font-medium text-[#191715] flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate">
                          {appUser.displayName} ({isAdmin ? 'Admin' : 'User'})
                        </span>
                        <span className="text-xs text-[#8E2A2A] shrink-0 ml-2">
                          Đăng xuất
                        </span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthModal();
                      }}
                      className="w-full py-2.5 px-3 border border-[#191715] bg-[#FFFFFF] text-sm font-medium text-[#191715] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4 text-[#1F3A2E]" aria-hidden="true" />
                      <span>Đăng nhập / Tạo tài khoản</span>
                    </button>
                  )}
                </li>
              )}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
