import { GoogleGenAI, ThinkingLevel, type Content } from '@google/genai';
import { PRODUCTS, STORE_BRANCHES } from '../../src/data/products.ts';
import { formatVnd } from '../../src/utils/shop.ts';

export interface IncomingChatMessage {
  role: 'user' | 'model';
  text: string;
}

export function buildSystemInstruction(
  cartSummary?: string,
  activeProduct?: string
): string {
  const catalogLines = PRODUCTS.map(
    (p) =>
      `- ${p.name} (${p.categoryLabel} | ${p.roastLevel} | ${p.origin} | Giá chuẩn ${p.defaultWeight}: ${formatVnd(p.basePrice)} | Hương vị: ${p.tastingNotes.join(', ')} | Tùy chọn xay: ${p.availableGrinds.join(', ')})`
  ).join('\n');

  const branchLines = STORE_BRANCHES.map(
    (b) =>
      `- ${b.name}: ${b.address}, ${b.district}. Giờ mở cửa: ${b.hours}. SĐT: ${b.phone}. Chỉ đường tiêu biểu từ ${b.directionsOrigin}: ${b.distanceLabel} (${b.durationLabel}).`
  ).join('\n');

  return [
    'Bạn là Chuyên viên Tư vấn & Đặt lịch Thử nếm của Nhà Rang Lạc Sơn (cửa hàng cà phê đặc sản rang thủ công cao cấp tại Đà Lạt & Hà Nội).',
    'Phong cách giao tiếp: Trang trọng, điềm đạm, lịch thiệp, ngắn gọn (2–4 câu súc tích mỗi lượt, trình bày mạch lạc, không dùng quá nhiều emoji). Trả lời bằng tiếng Việt (hoặc theo ngôn ngữ khách dùng).',
    '',
    'Danh mục cà phê hiện có:',
    catalogLines,
    '',
    'Chính sách bán hàng:',
    '- Miễn phí vận chuyển toàn quốc cho đơn từ 500.000 ₫ (dưới mức này phí đồng giá 30.000 ₫).',
    '- Mã ưu đãi đang mở: LACSON10 (giảm 10% đơn hàng) và CHAO2026 (giảm 5%).',
    '- Hỗ trợ Thanh toán khi nhận hàng (COD) và Chuyển khoản ngân hàng.',
    '- Quy cách khối lượng: 250g (giá chuẩn), 500g (tiết kiệm 5%), 1kg (tiết kiệm 10%). Cold Brew đóng chai 350ml uống liền.',
    '',
    'Địa chỉ cửa hàng & phòng thử nếm:',
    branchLines,
    '',
    'Hướng dẫn đặt lịch thử nếm (cupping / tasting) nhiều bước:',
    '- Nếu khách muốn đặt bàn thử nếm hoặc đặt đơn quà tặng doanh nghiệp, hãy hỏi lần lượt từng thông tin còn thiếu và ghi nhớ các thông tin khách đã cung cấp trong hội thoại: (1) Chi nhánh Đà Lạt hay Hà Nội, (2) Ngày và khung giờ mong muốn, (3) Số lượng khách, (4) Họ tên & số điện thoại liên hệ.',
    '- Khi đã đủ 4 thông tin, hãy tóm tắt trang trọng toàn bộ lịch hẹn với mã giữ chỗ dạng LS-CUP-XXXX để khách xác nhận.',
    '',
    cartSummary
      ? `Ngữ cảnh giỏ hàng hiện tại của khách:\n${cartSummary}`
      : 'Giỏ hàng hiện tại của khách đang trống.',
    activeProduct ? `Sản phẩm khách đang xem chi tiết: ${activeProduct}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function generateConciergeReply(params: {
  apiKey: string;
  messages: IncomingChatMessage[];
  cartSummary?: string;
  activeProduct?: string;
}): Promise<string> {
  const { apiKey, messages, cartSummary, activeProduct } = params;
  const latestMessage = messages[messages.length - 1].text.trim();
  const history: Content[] = messages.slice(0, -1).map((m) => ({
    role: m.role,
    parts: [{ text: m.text.trim() }],
  }));

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const chat = ai.chats.create({
        model: 'gemini-4-hydrogen',
        history,
        config: {
          systemInstruction: buildSystemInstruction(cartSummary, activeProduct),
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });
      const response = await chat.sendMessage({ message: latestMessage });
      const replyText = response.text?.trim();
      if (!replyText) {
        throw new Error('EMPTY_MODEL_RESPONSE');
      }
      return replyText;
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : '';
      const isClientErr =
        msg.includes('400') || msg.includes('403') || msg.includes('404');
      if (isClientErr || attempt === 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }
  throw lastErr;
}
