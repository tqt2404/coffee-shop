import { useEffect, useRef, useState } from 'react';
import { MessageSquare, RotateCcw, Send, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CartItem, Product } from '../types/shop';
import { EDITORIAL_EASE, MORPH_SPRING } from '../utils/motion';
import { calculateOrderTotals, formatVnd } from '../utils/shop';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  cartItems: CartItem[];
  promoCode: string;
  activeProduct: Product | null;
  pendingPrompt: string | null;
  onClearPendingPrompt: () => void;
}

const INITIAL_WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'model',
  text: 'Kính chào quý khách đến với Nhà Rang Lạc Sơn. Tôi có thể tư vấn chọn mẻ rang theo gu pha chế, giải đáp về đơn hàng hiện tại hoặc hỗ trợ quý khách đặt lịch thử nếm tại Đà Lạt và Hà Nội.',
};

const QUICK_PROMPTS = [
  'Tư vấn chọn hạt pha phin đậm đà không gắt',
  'Đặt lịch thử nếm cà phê tại phòng nếm Hà Nội',
  'Giỏ hàng hiện tại của tôi có đạt miễn phí giao hàng chưa?',
];

function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export function ChatWidget({
  isOpen,
  onToggle,
  cartItems,
  promoCode,
  activeProduct,
  pendingPrompt,
  onClearPendingPrompt,
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  const buildCartSummary = (): string => {
    if (cartItems.length === 0) return 'Giỏ hàng đang trống.';
    const totals = calculateOrderTotals(cartItems, promoCode);
    const lines = cartItems.map(
      (i) =>
        `- ${i.quantity}x ${i.name} (${i.weight}, ${i.grind}): ${formatVnd(i.unitPrice * i.quantity)}`
    );
    return [
      ...lines,
      `Tạm tính: ${formatVnd(totals.subtotal)}`,
      totals.promoApplied
        ? `Mã ưu đãi đang dùng: ${totals.promoApplied} (-${formatVnd(totals.discountAmount)})`
        : 'Chưa áp dụng mã ưu đãi.',
      totals.shippingFee === 0
        ? 'Đã đạt miễn phí vận chuyển.'
        : `Còn thiếu ${formatVnd(totals.freeShippingRemaining)} để miễn phí vận chuyển.`,
      `Tổng dự kiến: ${formatVnd(totals.total)}`,
    ].join('\n');
  };

  const sendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const apiMessages = nextHistory
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, text: m.text }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          cartSummary: buildCartSummary(),
          activeProduct: activeProduct
            ? `${activeProduct.name} (${activeProduct.roastLevel}, ${formatVnd(activeProduct.basePrice)})`
            : undefined,
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok || !data.reply) {
        setErrorMessage(
          data.error || 'Không thể kết nối trợ lý tư vấn lúc này. Vui lòng thử lại.'
        );
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'model',
          text: data.reply!,
        },
      ]);
    } catch {
      setErrorMessage(
        'Mất kết nối tới máy chủ tư vấn. Vui lòng kiểm tra kết nối mạng và thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && pendingPrompt) {
      const promptToSend = pendingPrompt;
      onClearPendingPrompt();
      void sendMessage(promptToSend);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pendingPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleReset = () => {
    setMessages([INITIAL_WELCOME]);
    setErrorMessage(null);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="chat-trigger"
            layoutId="concierge-morph-box"
            transition={MORPH_SPRING}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => onToggle(true)}
            aria-label="Mở trợ lý tư vấn cà phê và đặt lịch thử nếm"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 min-h-[44px] bg-[#191715] text-[#F8F7F4] border border-[#191715] text-xs sm:text-sm font-medium hover:bg-[#1F3A2E] transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="sm:hidden whitespace-nowrap">Tư vấn</span>
            <span className="hidden sm:inline whitespace-nowrap">
              Tư vấn &amp; Đặt lịch
            </span>
          </motion.button>
        ) : (
          <motion.section
            key="chat-panel"
            layoutId="concierge-morph-box"
            transition={MORPH_SPRING}
            aria-label="Trợ lý tư vấn Nhà Rang Lạc Sơn"
            className="w-[calc(100vw-2rem)] sm:w-[400px] h-[min(560px,calc(100vh-5rem))] bg-[#F8F7F4] border border-[#191715] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-[#191715] text-[#F8F7F4] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-lg font-semibold leading-tight truncate">
                  Chuyên viên tư vấn Lạc Sơn
                </h2>
                <p className="text-[11px] text-[#DDD8CE] truncate">
                  Tư vấn hạt rang &amp; đặt lịch thử nếm nhiều bước
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  aria-label="Bắt đầu cuộc hội thoại mới"
                  title="Cuộc hội thoại mới"
                  className="w-9 h-9 inline-flex items-center justify-center text-[#DDD8CE] hover:text-[#FFFFFF] hover:bg-[#2E2A26] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onToggle(false)}
                  aria-label="Thu gọn khung tư vấn"
                  className="w-9 h-9 inline-flex items-center justify-center text-[#DDD8CE] hover:text-[#FFFFFF] hover:bg-[#2E2A26] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8F7F4]"
            >
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: EDITORIAL_EASE }}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-[#1F3A2E] text-[#F8F7F4]'
                          : 'bg-[#FFFFFF] text-[#191715] border border-[#DDD8CE]'
                      }`}
                    >
                      {renderFormattedText(msg.text)}
                    </div>
                  </motion.div>
                );
              })}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="px-3.5 py-2.5 bg-[#FFFFFF] border border-[#DDD8CE] text-xs text-[#5C574F]">
                    Chuyên viên đang phản hồi...
                  </div>
                </motion.div>
              )}

              {errorMessage && (
                <div
                  role="alert"
                  className="p-3 bg-[#FFFFFF] border border-[#8E2A2A] text-xs text-[#8E2A2A] leading-relaxed"
                >
                  {errorMessage}
                </div>
              )}

              {/* Quick Starter Prompts on first screen */}
              {messages.length === 1 && !isLoading && (
                <div className="pt-2 space-y-1.5">
                  <p className="text-[11px] text-[#5C574F]">Gợi ý câu hỏi nhanh:</p>
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="block w-full text-left px-3 py-2 text-xs bg-[#EFECE6] text-[#191715] border border-[#DDD8CE] hover:border-[#191715] transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input Composer */}
            <form
              onSubmit={handleSubmit}
              className="p-3 bg-[#FFFFFF] border-t border-[#DDD8CE] flex items-center gap-2"
            >
              <label htmlFor="chat-message-input" className="sr-only">
                Nhập câu hỏi tư vấn cà phê hoặc thông tin đặt lịch
              </label>
              <input
                id="chat-message-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Hỏi về hạt rang, đơn hàng hoặc đặt lịch..."
                className="flex-1 px-3 py-2.5 min-h-[42px] bg-[#F8F7F4] border border-[#DDD8CE] text-sm text-[#191715] placeholder:text-[#5C574F] disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Gửi tin nhắn tư vấn"
                className="w-11 h-11 shrink-0 inline-flex items-center justify-center bg-[#1F3A2E] text-[#F8F7F4] hover:bg-[#162B22] disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
