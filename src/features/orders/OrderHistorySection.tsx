import { useState } from 'react';
import { Calendar, Cloud, LogIn, Package } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useFirebase } from '../../lib/firebase/FirebaseProvider';
import type { OrderRecord, TastingBookingRecord } from '../../types/shop';
import { FAST_MORPH_SPRING, ORGANIC_SPRING, SILK_EASE } from '../../utils/motion';
import { formatVnd } from '../../utils/shop';
import {
  BronzeCorners,
  MorphLayer,
  MorphPage,
  MorphRule,
  SplitHeadline,
} from '../../components/motion/MorphStage';

interface OrderHistorySectionProps {
  orders: OrderRecord[];
  bookings: TastingBookingRecord[];
  onCancelOrder?: (order: OrderRecord) => Promise<void>;
  onCancelBooking?: (booking: TastingBookingRecord) => Promise<void>;
}

const BOOKING_STATUS_VN: Record<string, string> = {
  pending: 'Đã tiếp nhận · Chờ xác nhận khung giờ',
  confirmed: 'Đã xác nhận giữ bàn',
  completed: 'Đã hoàn tất buổi thử nếm',
  cancelled: 'Đã hủy lịch hẹn',
};

export function OrderHistorySection({
  orders,
  bookings,
  onCancelOrder,
  onCancelBooking,
}: OrderHistorySectionProps) {
  const { appUser, authReady, authBusy, openAuthModal } = useFirebase();
  const [activeTab, setActiveTab] = useState<'orders' | 'bookings'>('orders');
  const [busyId, setBusyId] = useState<string | null>(null);

  return (
    <MorphPage
      id="don-hang"
      pageNumber="07"
      chapterTitle="Sổ Đơn Hàng & Lịch Thử Nếm"
      bgClass="bg-[#EFECE6]"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 relative">
        <MorphLayer vector="left" stagger={0}>
          <p className="text-xs tracking-[0.06em] text-[#7A5C38] font-medium mb-1.5 inline-flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              {appUser
                ? appUser.provider === 'google'
                  ? `Đồng bộ đám mây Firestore · ${appUser.email}`
                  : `Tài khoản SHA-256 · @${appUser.username} (${appUser.role === 'admin' ? 'Admin' : 'Thành viên'})`
                : 'Lưu trên trình duyệt · Đăng nhập tài khoản hoặc Google để đồng bộ'}
            </span>
          </p>
          <SplitHeadline
            as="h2"
            mode="inView"
            text="Sổ đơn hàng & lịch hẹn thử nếm"
            className="font-display text-3xl sm:text-4xl font-semibold leading-[1.2] text-[#191715]"
          />
        </MorphLayer>

        <MorphLayer
          vector="right"
          stagger={0.025}
          className="flex flex-wrap items-center gap-3"
        >
          <div
            role="tablist"
            aria-label="Chọn sổ đơn hàng hoặc sổ lịch thử nếm"
            className="inline-flex bg-[#F8F7F4] p-1 border border-[#DDD8CE]"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'orders'}
              onClick={() => setActiveTab('orders')}
              className={`relative px-3.5 py-2 min-h-[38px] text-xs font-medium cursor-pointer transition-colors inline-flex items-center gap-1.5 ${
                activeTab === 'orders' ? 'text-[#F8F7F4]' : 'text-[#5C574F]'
              }`}
            >
              {activeTab === 'orders' && (
                <motion.span
                  layoutId="ledger-tab-indicator"
                  transition={FAST_MORPH_SPRING}
                  aria-hidden="true"
                  className="absolute inset-0 bg-[#191715]"
                />
              )}
              <Package className="w-3.5 h-3.5 relative z-10" aria-hidden="true" />
              <span className="relative z-10">Đơn hàng ({orders.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'bookings'}
              onClick={() => setActiveTab('bookings')}
              className={`relative px-3.5 py-2 min-h-[38px] text-xs font-medium cursor-pointer transition-colors inline-flex items-center gap-1.5 ${
                activeTab === 'bookings' ? 'text-[#F8F7F4]' : 'text-[#5C574F]'
              }`}
            >
              {activeTab === 'bookings' && (
                <motion.span
                  layoutId="ledger-tab-indicator"
                  transition={FAST_MORPH_SPRING}
                  aria-hidden="true"
                  className="absolute inset-0 bg-[#191715]"
                />
              )}
              <Calendar className="w-3.5 h-3.5 relative z-10" aria-hidden="true" />
              <span className="relative z-10">Lịch thử nếm ({bookings.length})</span>
            </button>
          </div>

          {authReady && !appUser && (
            <button
              type="button"
              disabled={authBusy}
              onClick={openAuthModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] border border-[#191715] bg-[#FFFFFF] text-xs font-medium text-[#191715] hover:bg-[#191715] hover:text-[#F8F7F4] transition-colors cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Đăng nhập / Đồng bộ</span>
            </button>
          )}
        </MorphLayer>

        <div className="absolute bottom-0 left-0 right-0">
          <MorphRule stagger={0.02} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'orders' ? (
          <motion.div
            key="tab-orders"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: SILK_EASE }}
          >
            {orders.length === 0 ? (
              <MorphLayer
                vector="plate"
                stagger={0.04}
                className="relative mt-8 bg-[#FFFFFF] border border-[#DDD8CE] p-8 sm:p-10 text-center"
              >
                <BronzeCorners size="sm" />
                <p className="font-display text-2xl leading-[1.25] text-[#191715]">
                  Chưa có đơn hàng nào được ghi nhận
                </p>
                <p className="mt-2 text-sm text-[#5C574F] max-w-md mx-auto">
                  Sau khi hoàn tất đặt hàng trong giỏ, biên nhận chi tiết và mã theo dõi
                  của bạn sẽ xuất hiện tại đây (và đồng bộ tự động vào Firestore khi đăng
                  nhập).
                </p>
              </MorphLayer>
            ) : (
              <div className="mt-8 space-y-4">
                {orders.map((order, idx) => {
                  const st = Math.min(0.06, 0.025 + idx * 0.02);
                  const canCancel =
                    order.statusCode !== 'cancelled' &&
                    order.statusCode !== 'completed' &&
                    Boolean(onCancelOrder);
                  const keyId = order.id || order.orderNumber;

                  return (
                    <MorphLayer
                      key={keyId}
                      vector={idx % 2 === 0 ? 'tilt-left' : 'tilt-right'}
                      stagger={st}
                    >
                      <motion.article
                        whileHover={{ y: -3 }}
                        transition={ORGANIC_SPRING}
                        className="relative bg-[#FFFFFF] border border-[#DDD8CE] p-5 sm:p-6 hover:border-[#7A5C38] transition-colors"
                      >
                        <BronzeCorners size="sm" />
                        <div className="flex flex-wrap items-baseline justify-between gap-3 pb-4 relative">
                          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                            <h3 className="font-mono text-sm font-semibold text-[#191715]">
                              {order.orderNumber}
                            </h3>
                            <span
                              className={`text-xs font-medium ${
                                order.statusCode === 'cancelled'
                                  ? 'text-[#8E2A2A]'
                                  : 'text-[#1F3A2E]'
                              }`}
                            >
                              {order.status}
                            </span>
                            {order.source === 'cloud' && (
                              <span className="font-mono text-[10px] px-2 py-0.5 bg-[#EFECE6] text-[#7A5C38] border border-[#DDD8CE]">
                                FIRESTORE
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <p className="font-mono text-base font-semibold text-[#191715] tabular-nums">
                              {formatVnd(order.totals.total)}
                            </p>
                            {canCancel && (
                              <button
                                type="button"
                                disabled={busyId === keyId}
                                onClick={async () => {
                                  if (!onCancelOrder) return;
                                  setBusyId(keyId);
                                  try {
                                    await onCancelOrder(order);
                                  } finally {
                                    setBusyId(null);
                                  }
                                }}
                                className="px-2.5 py-1 text-[11px] border border-[#DDD8CE] text-[#5C574F] hover:border-[#8E2A2A] hover:text-[#8E2A2A] transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Hủy đơn
                              </button>
                            )}
                          </div>
                          <div className="absolute bottom-0 left-0 right-0">
                            <MorphRule stagger={st + 0.015} />
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 text-sm">
                          <div className="md:col-span-5 text-[#5C574F] space-y-1">
                            <p className="text-[#191715] font-medium">
                              {order.customer.fullName} · {order.customer.phone}
                            </p>
                            <p>
                              {order.customer.address}, {order.customer.city}
                            </p>
                            <p className="text-xs">
                              {order.customer.paymentMethod === 'cod'
                                ? 'Thanh toán khi nhận hàng (COD)'
                                : 'Chuyển khoản ngân hàng'}
                            </p>
                          </div>

                          <ul className="md:col-span-7 divide-y divide-[#DDD8CE] border-t md:border-t-0 md:border-l border-[#DDD8CE] md:pl-5">
                            {order.items.map((item) => (
                              <li
                                key={item.lineId}
                                className="py-2 first:pt-0 last:pb-0 flex justify-between gap-3 text-xs sm:text-sm"
                              >
                                <span className="text-[#191715]">
                                  {item.quantity}× {item.name} ({item.weight} · {item.grind})
                                </span>
                                <span className="font-mono tabular-nums text-[#5C574F] shrink-0">
                                  {formatVnd(item.unitPrice * item.quantity)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.article>
                    </MorphLayer>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="tab-bookings"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: SILK_EASE }}
          >
            {bookings.length === 0 ? (
              <div className="relative mt-8 bg-[#FFFFFF] border border-[#DDD8CE] p-8 sm:p-10 text-center">
                <BronzeCorners size="sm" />
                <p className="font-display text-2xl leading-[1.25] text-[#191715]">
                  Chưa có lịch hẹn thử nếm nào
                </p>
                <p className="mt-2 text-sm text-[#5C574F] max-w-md mx-auto">
                  Quý khách có thể đặt lịch thử nếm cà phê miễn phí tại xưởng rang Đà Lạt
                  hoặc phòng nếm Hàng Bông (Hà Nội) ở Trang 06.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((bk) => {
                  const canCancel =
                    bk.status !== 'cancelled' &&
                    bk.status !== 'completed' &&
                    Boolean(onCancelBooking);
                  return (
                    <motion.article
                      key={bk.id}
                      whileHover={{ y: -3 }}
                      transition={ORGANIC_SPRING}
                      className="relative bg-[#FFFFFF] border border-[#DDD8CE] p-5 sm:p-6 hover:border-[#7A5C38] transition-colors"
                    >
                      <BronzeCorners size="sm" />
                      <div className="flex items-baseline justify-between gap-3 pb-3 border-b border-[#DDD8CE]">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-sm font-semibold text-[#191715]">
                            {bk.bookingCode}
                          </span>
                          {bk.source === 'cloud' && (
                            <span className="font-mono text-[10px] px-2 py-0.5 bg-[#EFECE6] text-[#7A5C38] border border-[#DDD8CE]">
                              FIRESTORE
                            </span>
                          )}
                        </div>
                        {canCancel && (
                          <button
                            type="button"
                            disabled={busyId === bk.id}
                            onClick={async () => {
                              if (!onCancelBooking) return;
                              setBusyId(bk.id);
                              try {
                                await onCancelBooking(bk);
                              } finally {
                                setBusyId(null);
                              }
                            }}
                            className="px-2.5 py-1 text-[11px] border border-[#DDD8CE] text-[#5C574F] hover:border-[#8E2A2A] hover:text-[#8E2A2A] transition-colors cursor-pointer"
                          >
                            Hủy lịch
                          </button>
                        )}
                      </div>

                      <div className="mt-3 space-y-1.5 text-sm">
                        <p className="font-display text-lg font-semibold text-[#191715]">
                          {bk.branchName}
                        </p>
                        <p
                          className={`text-xs font-medium ${
                            bk.status === 'cancelled'
                              ? 'text-[#8E2A2A]'
                              : 'text-[#1F3A2E]'
                          }`}
                        >
                          {BOOKING_STATUS_VN[bk.status] || bk.status}
                        </p>
                        <p className="font-mono text-xs text-[#191715] pt-1">
                          {bk.date} · {bk.timeSlot} · {bk.guests} khách
                        </p>
                        <p className="text-xs text-[#5C574F]">
                          {bk.guestName} · {bk.guestPhone}
                        </p>
                        {bk.note && (
                          <p className="text-xs text-[#5C574F] italic pt-1">
                            Ghi chú: {bk.note}
                          </p>
                        )}
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </MorphPage>
  );
}
