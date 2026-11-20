import { motion } from 'motion/react';
import { OrderRecord } from '../types/shop';
import { ORGANIC_SPRING } from '../utils/motion';
import { formatVnd } from '../utils/shop';
import {
  BronzeCorners,
  MorphLayer,
  MorphPage,
  MorphRule,
  SplitHeadline,
} from './MorphStage';

interface OrderHistorySectionProps {
  orders: OrderRecord[];
}

export function OrderHistorySection({ orders }: OrderHistorySectionProps) {
  return (
    <MorphPage
      id="don-hang"
      pageNumber="07"
      chapterTitle="Sổ Đơn Hàng Đã Đặt"
      bgClass="bg-[#EFECE6]"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 relative">
        <MorphLayer vector="left" stagger={0}>
          <p className="text-xs tracking-[0.06em] text-[#7A5C38] font-medium mb-1.5">
            Lưu trữ biên nhận trên trình duyệt
          </p>
          <SplitHeadline
            as="h2"
            mode="inView"
            text="Sổ đơn hàng đã đặt"
            className="font-display text-3xl sm:text-4xl font-semibold leading-[1.2] text-[#191715]"
          />
        </MorphLayer>

        <MorphLayer vector="right" stagger={0.025}>
          <p className="font-mono text-xs text-[#5C574F] tabular-nums">
            Tổng số biên nhận: {orders.length}
          </p>
        </MorphLayer>

        <div className="absolute bottom-0 left-0 right-0">
          <MorphRule stagger={0.02} />
        </div>
      </div>

      {orders.length === 0 ? (
        <MorphLayer
          vector="plate"
          stagger={0.04}
          className="relative mt-8 bg-[#FFFFFF] border border-[#DDD8CE] p-8 sm:p-10 text-center"
        >
          <BronzeCorners size="sm" />
          <MorphLayer vector="up" stagger={0.055} distance={0.4}>
            <p className="font-display text-2xl leading-[1.25] text-[#191715]">
              Chưa có đơn hàng nào được ghi nhận
            </p>
          </MorphLayer>
          <MorphLayer vector="up" stagger={0.07} distance={0.35}>
            <p className="mt-2 text-sm text-[#5C574F] max-w-md mx-auto">
              Sau khi hoàn tất đặt hàng trong giỏ, biên nhận chi tiết và mã theo dõi của
              bạn sẽ xuất hiện tại đây.
            </p>
          </MorphLayer>
        </MorphLayer>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order, idx) => {
            const st = Math.min(0.06, 0.025 + idx * 0.02);
            return (
              <MorphLayer
                key={order.orderNumber}
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
                    <MorphLayer
                      vector="left"
                      stagger={st + 0.015}
                      distance={0.3}
                      className="flex flex-wrap items-baseline gap-x-4 gap-y-1"
                    >
                      <h3 className="font-mono text-sm font-semibold text-[#191715]">
                        {order.orderNumber}
                      </h3>
                      <span className="text-xs text-[#1F3A2E] font-medium">
                        {order.status}
                      </span>
                    </MorphLayer>
                    <MorphLayer vector="right" stagger={st + 0.02} distance={0.3}>
                      <p className="font-mono text-base font-semibold text-[#191715] tabular-nums">
                        {formatVnd(order.totals.total)}
                      </p>
                    </MorphLayer>
                    <div className="absolute bottom-0 left-0 right-0">
                      <MorphRule stagger={st + 0.015} />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 text-sm">
                    <MorphLayer
                      vector="left"
                      stagger={st + 0.03}
                      distance={0.3}
                      className="md:col-span-5 text-[#5C574F] space-y-1"
                    >
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
                    </MorphLayer>

                    <ul className="md:col-span-7 divide-y divide-[#DDD8CE] border-t md:border-t-0 md:border-l border-[#DDD8CE] md:pl-5">
                      {order.items.map((item, itemIdx) => (
                        <MorphLayer
                          key={item.lineId}
                          vector="right"
                          stagger={st + 0.035 + itemIdx * 0.01}
                          distance={0.28}
                        >
                          <li className="py-2 first:pt-0 last:pb-0 flex justify-between gap-3 text-xs sm:text-sm">
                            <span className="text-[#191715]">
                              {item.quantity}× {item.name} ({item.weight} · {item.grind})
                            </span>
                            <span className="font-mono tabular-nums text-[#5C574F] shrink-0">
                              {formatVnd(item.unitPrice * item.quantity)}
                            </span>
                          </li>
                        </MorphLayer>
                      ))}
                    </ul>
                  </div>
                </motion.article>
              </MorphLayer>
            );
          })}
        </div>
      )}
    </MorphPage>
  );
}
