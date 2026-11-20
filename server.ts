import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, type Content } from '@google/genai';
import { PRODUCTS, STORE_BRANCHES } from './src/data/products.ts';
import { formatVnd } from './src/utils/shop.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

function buildSystemInstruction(cartSummary?: string, activeProduct?: string): string {
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
    cartSummary ? `Ngữ cảnh giỏ hàng hiện tại của khách:\n${cartSummary}` : 'Giỏ hàng hiện tại của khách đang trống.',
    activeProduct ? `Sản phẩm khách đang xem chi tiết: ${activeProduct}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

interface IncomingChatMessage {
  role: 'user' | 'model';
  text: string;
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        res.status(503).json({
          error:
            'Chưa cấu hình GEMINI_API_KEY trên máy chủ. Vui lòng kiểm tra mục Settings > Secrets.',
        });
        return;
      }

      const body = req.body as {
        messages?: IncomingChatMessage[];
        cartSummary?: string;
        activeProduct?: string;
      };

      const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
      const sanitized = rawMessages
        .filter(
          (m): m is IncomingChatMessage =>
            Boolean(m) &&
            (m.role === 'user' || m.role === 'model') &&
            typeof m.text === 'string' &&
            m.text.trim().length > 0
        )
        .slice(-20);

      if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== 'user') {
        res.status(400).json({ error: 'Tin nhắn người dùng không hợp lệ.' });
        return;
      }

      const latestMessage = sanitized[sanitized.length - 1].text.trim();
      const history: Content[] = sanitized.slice(0, -1).map((m) => ({
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

      const sendWithRetry = async () => {
        let lastErr: unknown;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const chat = ai.chats.create({
              model: 'gemini-4-hydrogen',
              history,
              config: {
                systemInstruction: buildSystemInstruction(
                  body.cartSummary,
                  body.activeProduct
                ),
                thinkingConfig: {
                  thinkingLevel: ThinkingLevel.LOW,
                },
              },
            });
            return await chat.sendMessage({
              message: latestMessage,
            });
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
      };

      const response = await sendWithRetry();

      const replyText = response.text?.trim();
      if (!replyText) {
        res.status(502).json({
          error: 'Trợ lý chưa trả về nội dung. Vui lòng thử gửi lại câu hỏi.',
        });
        return;
      }

      res.json({ reply: replyText });
    } catch (error) {
      console.error('[/api/chat] error:', error);
      const message =
        error instanceof Error ? error.message : 'Lỗi kết nối dịch vụ tư vấn Gemini.';
      const status =
        message.includes('429') || message.includes('RESOURCE_EXHAUSTED')
          ? 429
          : message.includes('403') || message.includes('API_KEY_INVALID')
            ? 403
            : 500;
      res.status(status).json({
        error: `Không thể kết nối trợ lý tư vấn lúc này: ${message}`,
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nhà Rang Lạc Sơn server listening on http://localhost:${PORT}`);
  });
}

createServer();
