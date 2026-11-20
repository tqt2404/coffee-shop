import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Minus, Plus, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { validatePromoViaApi } from '../../services/apiClient';
import type { CartItem, CheckoutFormData, OrderRecord } from '../../types/shop';
import { EDITORIAL_EASE, MORPH_SPRING } from '../../utils/motion';
import {
  calculateOrderTotals,
  createOrderRecord,
  formatVnd,
  FREE_SHIPPING_THRESHOLD,
  validateCheckoutForm,
} from '../../utils/shop';
import { SafeImage } from '../../components/ui/SafeImage';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
  onUpdateQuantity: (lineId: string, delta: number) => void;
  onRemoveItem: (lineId: string) => void;
  onClose: () => void;
  onCompleteOrder: (order: OrderRecord) => Promise<OrderRecord>;
}

type DrawerStep = 'cart' | 'checkout' | 'confirmation';

const INITIAL_FORM: CheckoutFormData = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  note: '',
  paymentMethod: 'cod',
};

export function CartDrawer({
  isOpen,
  items,
  promoCode,
  onPromoCodeChange,
  onUpdateQuantity,
  onRemoveItem,
  onClose,
  onCompleteOrder,
}: CartDrawerProps) {
  const [step, setStep] = useState<DrawerStep>('cart');
  const [promoInput, setPromoInput] = useState(promoCode);
  const [promoServerError, setPromoServerError] = useState<string | null>(null);
  const [form, setForm] = useState<CheckoutFormData>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof CheckoutFormData, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    setPromoInput(promoCode);
  }, [promoCode]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const totals = calculateOrderTotals(items, promoCode);
  const freeShippingProgress = Math.min(
    100,
    Math.round(
      ((totals.subtotal - totals.discountAmount) / FREE_SHIPPING_THRESHOLD) * 100
    )
  );

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = promoInput.trim();
    setPromoServerError(null);

    if (!trimmed) {
      onPromoCodeChange('');
      return;
    }

    const apiResult = await validatePromoViaApi(trimmed, items);
    if (apiResult && !apiResult.valid) {
      setPromoServerError(apiResult.error || 'Mã ưu đãi không hợp lệ.');
      onPromoCodeChange(trimmed);
      return;
    }
    onPromoCodeChange(trimmed);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCheckoutForm(form);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      const draftOrder = createOrderRecord(form, items, totals);
      const savedOrder = await onCompleteOrder(draftOrder);
      setConfirmedOrder(savedOrder);
      setFormErrors({});
      setForm(INITIAL_FORM);
      setStep('confirmation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDrawer = () => {
    if (step === 'confirmation') {
      setStep('cart');
      setConfirmedOrder(null);
    }
    onClose();
  };

  const activePromoError = promoServerError || totals.promoError;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Giỏ hàng và thanh toán"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: EDITORIAL_EASE }}
          className="fixed inset-0 z-50 flex justify-end bg-[#191715]/55"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseDrawer();
          }}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={MORPH_SPRING}
            className="w-full max-w-lg bg-[#F8F7F4] border-l border-[#DDD8CE] h-full flex flex-col"
          >
            {/* Drawer Header */}
            <div className="px-5 sm:px-6 py-4 bg-[#FFFFFF] border-b border-[#DDD8CE] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {step === 'checkout' && (
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    aria-label="Quay lại giỏ hàng"
                    className="inline-flex items-center justify-center w-9 h-9 border border-[#DDD8CE] bg-[#F8F7F4] text-[#191715] hover:bg-[#EFECE6] cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
                <h2 className="font-display text-2xl font-semibold text-[#191715]">
                  {step === 'cart' && 'Giỏ hàng của bạn'}
                  {step === 'checkout' && 'Thông tin giao hàng'}
                  {step === 'confirmation' && 'Biên nhận đặt hàng'}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseDrawer}
                aria-label="Đóng giỏ hàng"
                className="inline-flex items-center justify-center w-10 h-10 border border-[#DDD8CE] bg-[#F8F7F4] text-[#191715] hover:bg-[#EFECE6] cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1: CART */}
              {step === 'cart' && (
                <motion.div
                  key="step-cart"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25, ease: EDITORIAL_EASE }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                      <p className="font-display text-2xl text-[#191715]">
                        Giỏ hàng hiện đang trống
                      </p>
                      <p className="mt-2 text-sm text-[#5C574F] max-w-xs leading-relaxed">
                        Hãy chọn cho mình một mẻ rang mới từ bộ sưu tập Cầu Đất hoặc các lô
                        Ethiopia đơn vùng.
                      </p>
                      <button
                        type="button"
                        onClick={handleCloseDrawer}
                        className="mt-6 px-6 py-3 min-h-[44px] bg-[#1F3A2E] text-[#F8F7F4] text-sm font-medium hover:bg-[#162B22] transition-colors cursor-pointer"
                      >
                        Tiếp tục xem sản phẩm
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="px-5 sm:px-6 py-3.5 bg-[#EFECE6] border-b border-[#DDD8CE]">
                        <p className="text-xs text-[#191715]">
                          {totals.freeShippingRemaining === 0 ? (
                            <span className="font-medium text-[#1F3A2E]">
                              Đơn hàng đã đạt mức miễn phí vận chuyển toàn quốc.
                            </span>
                          ) : (
                            <span>
                              Thêm{' '}
                              <strong className="font-mono tabular-nums">
                                {formatVnd(totals.freeShippingRemaining)}
                              </strong>{' '}
                              để được miễn phí vận chuyển toàn quốc.
                            </span>
                          )}
                        </p>
                        <div className="mt-2 h-1.5 w-full bg-[#DDD8CE] overflow-hidden">
                          <motion.div
                            className="h-full bg-[#1F3A2E]"
                            initial={false}
                            animate={{ width: `${freeShippingProgress}%` }}
                            transition={MORPH_SPRING}
                          />
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto px-5 sm:px-6 divide-y divide-[#DDD8CE]">
                        <AnimatePresence initial={false}>
                          {items.map((item) => (
                            <motion.div
                              key={item.lineId}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: 24 }}
                              transition={{ duration: 0.25, ease: EDITORIAL_EASE }}
                              className="py-5 flex gap-4"
                            >
                              <div className="w-20 h-20 shrink-0 bg-[#EFECE6] border border-[#DDD8CE] overflow-hidden">
                                <SafeImage
                                  src={item.image}
                                  alt={item.name}
                                  fallbackTitle={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-display text-lg font-semibold text-[#191715] leading-snug">
                                    {item.name}
                                  </h3>
                                  <button
                                    type="button"
                                    onClick={() => onRemoveItem(item.lineId)}
                                    aria-label={`Xóa ${item.name} (${item.weight}) khỏi giỏ hàng`}
                                    className="p-1.5 text-[#5C574F] hover:text-[#8E2A2A] transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                                  </button>
                                </div>

                                <p className="text-xs text-[#5C574F] mt-0.5">
                                  {item.weight} · {item.grind}
                                </p>

                                <div className="mt-3 flex items-center justify-between gap-3">
                                  <div className="inline-flex items-center border border-[#DDD8CE] bg-[#FFFFFF]">
                                    <button
                                      type="button"
                                      onClick={() => onUpdateQuantity(item.lineId, -1)}
                                      aria-label={`Giảm số lượng ${item.name}`}
                                      className="w-9 h-9 flex items-center justify-center text-[#191715] hover:bg-[#EFECE6] cursor-pointer"
                                    >
                                      <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                                    </button>
                                    <span className="w-9 text-center font-mono text-xs font-medium tabular-nums">
                                      {item.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => onUpdateQuantity(item.lineId, 1)}
                                      aria-label={`Tăng số lượng ${item.name}`}
                                      className="w-9 h-9 flex items-center justify-center text-[#191715] hover:bg-[#EFECE6] cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                                    </button>
                                  </div>

                                  <span className="font-mono text-sm font-medium text-[#191715] tabular-nums">
                                    {formatVnd(item.unitPrice * item.quantity)}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      <div className="p-5 sm:p-6 bg-[#FFFFFF] border-t border-[#DDD8CE] space-y-4">
                        <form onSubmit={handleApplyPromo} className="flex gap-2">
                          <label htmlFor="promo-code-input" className="sr-only">
                            Mã ưu đãi
                          </label>
                          <input
                            id="promo-code-input"
                            type="text"
                            value={promoInput}
                            onChange={(e) => {
                              setPromoInput(e.target.value);
                              setPromoServerError(null);
                            }}
                            placeholder="Mã ưu đãi (ví dụ: LACSON10)"
                            className="flex-1 px-3.5 py-2.5 min-h-[42px] bg-[#F8F7F4] border border-[#DDD8CE] text-sm font-mono text-[#191715] uppercase placeholder:normal-case placeholder:font-sans placeholder:text-[#5C574F]"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2.5 min-h-[42px] border border-[#191715] bg-[#FFFFFF] text-xs sm:text-sm font-medium text-[#191715] hover:bg-[#191715] hover:text-[#F8F7F4] transition-colors whitespace-nowrap cursor-pointer"
                          >
                            Áp dụng
                          </button>
                        </form>

                        {activePromoError && (
                          <p role="alert" className="text-xs text-[#8E2A2A]">
                            {activePromoError}
                          </p>
                        )}
                        {totals.promoApplied && (
                          <div className="flex items-center justify-between text-xs text-[#1F3A2E]">
                            <span>
                              Đã áp dụng mã {totals.promoApplied} (-
                              {Math.round(totals.discountRate * 100)}%)
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setPromoInput('');
                                setPromoServerError(null);
                                onPromoCodeChange('');
                              }}
                              className="underline hover:text-[#191715] cursor-pointer"
                            >
                              Gỡ mã
                            </button>
                          </div>
                        )}

                        <dl className="space-y-2 text-sm border-t border-[#DDD8CE] pt-4">
                          <div className="flex justify-between">
                            <dt className="text-[#5C574F]">Tạm tính</dt>
                            <dd className="font-mono text-[#191715] tabular-nums">
                              {formatVnd(totals.subtotal)}
                            </dd>
                          </div>
                          {totals.discountAmount > 0 && (
                            <div className="flex justify-between text-[#1F3A2E]">
                              <dt>Ưu đãi ({totals.promoApplied})</dt>
                              <dd className="font-mono tabular-nums">
                                -{formatVnd(totals.discountAmount)}
                              </dd>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <dt className="text-[#5C574F]">Phí vận chuyển</dt>
                            <dd className="font-mono text-[#191715] tabular-nums">
                              {totals.shippingFee === 0
                                ? 'Miễn phí'
                                : formatVnd(totals.shippingFee)}
                            </dd>
                          </div>
                          <div className="flex justify-between pt-3 border-t border-[#DDD8CE] text-base font-semibold text-[#191715]">
                            <dt>Tổng thanh toán</dt>
                            <dd className="font-mono tabular-nums">
                              {formatVnd(totals.total)}
                            </dd>
                          </div>
                        </dl>

                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.985 }}
                          onClick={() => setStep('checkout')}
                          className="w-full py-3.5 px-6 min-h-[48px] bg-[#1F3A2E] text-[#F8F7F4] text-sm font-medium hover:bg-[#162B22] transition-colors cursor-pointer"
                        >
                          Tiến hành thanh toán
                        </motion.button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* STEP 2: CHECKOUT FORM */}
              {step === 'checkout' && (
                <motion.form
                  key="step-checkout"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.26, ease: EDITORIAL_EASE }}
                  onSubmit={handleCheckoutSubmit}
                  noValidate
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                    <div className="p-4 bg-[#FFFFFF] border border-[#DDD8CE] text-sm">
                      <div className="flex justify-between font-medium text-[#191715]">
                        <span>
                          Đơn hàng gồm {items.reduce((s, i) => s + i.quantity, 0)} sản phẩm
                        </span>
                        <span className="font-mono tabular-nums">
                          {formatVnd(totals.total)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#5C574F]">
                        {totals.shippingFee === 0
                          ? 'Miễn phí giao hàng toàn quốc · Đóng gói van một chiều.'
                          : `Bao gồm phí vận chuyển tiêu chuẩn ${formatVnd(totals.shippingFee)}.`}
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-name"
                        className="block text-xs font-medium text-[#191715] mb-1.5"
                      >
                        Họ và tên người nhận *
                      </label>
                      <input
                        id="checkout-name"
                        type="text"
                        required
                        value={form.fullName}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, fullName: e.target.value }));
                          if (formErrors.fullName) {
                            setFormErrors((prev) => ({ ...prev, fullName: undefined }));
                          }
                        }}
                        placeholder="Nguyễn Minh Quân"
                        className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#FFFFFF] border border-[#DDD8CE] text-sm text-[#191715]"
                      />
                      {formErrors.fullName && (
                        <p role="alert" className="mt-1 text-xs text-[#8E2A2A]">
                          {formErrors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-phone"
                        className="block text-xs font-medium text-[#191715] mb-1.5"
                      >
                        Số điện thoại liên hệ *
                      </label>
                      <input
                        id="checkout-phone"
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, phone: e.target.value }));
                          if (formErrors.phone) {
                            setFormErrors((prev) => ({ ...prev, phone: undefined }));
                          }
                        }}
                        placeholder="0912345678"
                        className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#FFFFFF] border border-[#DDD8CE] text-sm font-mono text-[#191715]"
                      />
                      {formErrors.phone && (
                        <p role="alert" className="mt-1 text-xs text-[#8E2A2A]">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-address"
                        className="block text-xs font-medium text-[#191715] mb-1.5"
                      >
                        Địa chỉ nhận hàng *
                      </label>
                      <input
                        id="checkout-address"
                        type="text"
                        required
                        value={form.address}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, address: e.target.value }));
                          if (formErrors.address) {
                            setFormErrors((prev) => ({ ...prev, address: undefined }));
                          }
                        }}
                        placeholder="Số 42 Hàng Bông, Quận Hoàn Kiếm"
                        className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#FFFFFF] border border-[#DDD8CE] text-sm text-[#191715]"
                      />
                      {formErrors.address && (
                        <p role="alert" className="mt-1 text-xs text-[#8E2A2A]">
                          {formErrors.address}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-city"
                        className="block text-xs font-medium text-[#191715] mb-1.5"
                      >
                        Tỉnh / Thành phố *
                      </label>
                      <input
                        id="checkout-city"
                        type="text"
                        required
                        value={form.city}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, city: e.target.value }));
                          if (formErrors.city) {
                            setFormErrors((prev) => ({ ...prev, city: undefined }));
                          }
                        }}
                        placeholder="Hà Nội / TP. Hồ Chí Minh / Đà Lạt"
                        className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#FFFFFF] border border-[#DDD8CE] text-sm text-[#191715]"
                      />
                      {formErrors.city && (
                        <p role="alert" className="mt-1 text-xs text-[#8E2A2A]">
                          {formErrors.city}
                        </p>
                      )}
                    </div>

                    <fieldset>
                      <legend className="text-xs font-medium text-[#191715] mb-2">
                        Phương thức thanh toán
                      </legend>
                      <div className="space-y-2">
                        <label className="flex items-start gap-3 p-3.5 bg-[#FFFFFF] border border-[#DDD8CE] cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={form.paymentMethod === 'cod'}
                            onChange={() =>
                              setForm((prev) => ({ ...prev, paymentMethod: 'cod' }))
                            }
                            className="mt-1 accent-[#1F3A2E]"
                          />
                          <span className="text-sm">
                            <strong className="block text-[#191715] font-medium">
                              Thanh toán khi nhận hàng (COD)
                            </strong>
                            <span className="text-xs text-[#5C574F]">
                              Kiểm tra tem niêm phong và ngày rang trước khi thanh toán.
                            </span>
                          </span>
                        </label>

                        <label className="flex items-start gap-3 p-3.5 bg-[#FFFFFF] border border-[#DDD8CE] cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="bank-transfer"
                            checked={form.paymentMethod === 'bank-transfer'}
                            onChange={() =>
                              setForm((prev) => ({
                                ...prev,
                                paymentMethod: 'bank-transfer',
                              }))
                            }
                            className="mt-1 accent-[#1F3A2E]"
                          />
                          <span className="text-sm">
                            <strong className="block text-[#191715] font-medium">
                              Chuyển khoản ngân hàng
                            </strong>
                            <span className="text-xs text-[#5C574F]">
                              Thông tin tài khoản sẽ hiển thị ngay trên biên nhận xác nhận.
                            </span>
                          </span>
                        </label>
                      </div>
                    </fieldset>

                    <div>
                      <label
                        htmlFor="checkout-note"
                        className="block text-xs font-medium text-[#191715] mb-1.5"
                      >
                        Ghi chú giao hàng (tùy chọn)
                      </label>
                      <textarea
                        id="checkout-note"
                        rows={2}
                        value={form.note}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, note: e.target.value }))
                        }
                        placeholder="Ví dụ: Giao trong giờ hành chính, gọi trước 15 phút"
                        className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#DDD8CE] text-sm text-[#191715]"
                      />
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 bg-[#FFFFFF] border-t border-[#DDD8CE]">
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileTap={{ scale: 0.985 }}
                      className="w-full py-3.5 px-6 min-h-[48px] bg-[#1F3A2E] text-[#F8F7F4] text-sm font-medium hover:bg-[#162B22] disabled:opacity-50 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>{submitting ? 'Đang ghi nhận đơn...' : 'Xác nhận đặt hàng'}</span>
                      <span className="font-mono tabular-nums">
                        {formatVnd(totals.total)}
                      </span>
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* STEP 3: ORDER CONFIRMATION RECEIPT */}
              {step === 'confirmation' && confirmedOrder && (
                <motion.div
                  key="step-confirmation"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: EDITORIAL_EASE }}
                  className="flex-1 flex flex-col overflow-y-auto p-6 sm:p-8 justify-between"
                >
                  <div>
                    <div className="inline-flex items-center gap-2 text-[#1F3A2E] mb-3">
                      <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                      <span className="text-xs font-medium">
                        Đặt hàng thành công
                        {confirmedOrder.source === 'cloud' ? ' · Đã đồng bộ Firestore' : ''}
                      </span>
                    </div>

                    <h3 className="font-display text-3xl font-semibold text-[#191715]">
                      Cảm ơn {confirmedOrder.customer.fullName}
                    </h3>
                    <p className="mt-2 text-sm text-[#5C574F] leading-relaxed">
                      Đơn hàng đã được ghi nhận vào sổ lệnh rang của Nhà Rang Lạc Sơn.
                    </p>

                    <div className="mt-6 bg-[#FFFFFF] border border-[#DDD8CE] p-5 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#DDD8CE]">
                        <span className="text-xs text-[#5C574F]">Mã đơn hàng</span>
                        <span className="font-mono text-sm font-semibold text-[#191715]">
                          {confirmedOrder.orderNumber}
                        </span>
                      </div>

                      <dl className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between gap-4">
                          <dt className="text-[#5C574F]">Trạng thái</dt>
                          <dd className="text-[#1F3A2E] font-medium text-right">
                            {confirmedOrder.status}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-[#5C574F]">Người nhận</dt>
                          <dd className="text-[#191715] text-right">
                            {confirmedOrder.customer.fullName} ·{' '}
                            {confirmedOrder.customer.phone}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-[#5C574F]">Địa chỉ</dt>
                          <dd className="text-[#191715] text-right">
                            {confirmedOrder.customer.address},{' '}
                            {confirmedOrder.customer.city}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-[#5C574F]">Thanh toán</dt>
                          <dd className="text-[#191715] text-right">
                            {confirmedOrder.customer.paymentMethod === 'cod'
                              ? 'Thanh toán khi nhận hàng (COD)'
                              : 'Chuyển khoản · Vietcombank 1029 8841 002 · CTY LAC SON'}
                          </dd>
                        </div>
                      </dl>

                      <ul className="pt-3 border-t border-[#DDD8CE] space-y-2 text-xs sm:text-sm">
                        {confirmedOrder.items.map((item) => (
                          <li key={item.lineId} className="flex justify-between gap-3">
                            <span className="text-[#191715]">
                              {item.quantity}× {item.name} ({item.weight} · {item.grind})
                            </span>
                            <span className="font-mono tabular-nums shrink-0">
                              {formatVnd(item.unitPrice * item.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-3 border-t border-[#DDD8CE] flex justify-between font-semibold text-[#191715]">
                        <span>Tổng cộng</span>
                        <span className="font-mono tabular-nums">
                          {formatVnd(confirmedOrder.totals.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2.5">
                    <a
                      href="#don-hang"
                      onClick={handleCloseDrawer}
                      className="w-full py-3.5 px-6 min-h-[44px] bg-[#1F3A2E] text-[#F8F7F4] text-sm font-medium text-center hover:bg-[#162B22] transition-colors"
                    >
                      Xem sổ lịch sử đơn hàng
                    </a>
                    <button
                      type="button"
                      onClick={handleCloseDrawer}
                      className="w-full py-3 px-6 min-h-[44px] border border-[#DDD8CE] bg-[#FFFFFF] text-sm font-medium text-[#191715] hover:border-[#191715] transition-colors cursor-pointer"
                    >
                      Tiếp tục khám phá cửa hàng
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
