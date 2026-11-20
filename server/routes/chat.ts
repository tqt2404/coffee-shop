import { Router } from 'express';
import {
  generateConciergeReply,
  type IncomingChatMessage,
} from '../services/geminiService.ts';

export const chatRouter = Router();

chatRouter.post('/', async (req, res) => {
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

    if (
      sanitized.length === 0 ||
      sanitized[sanitized.length - 1].role !== 'user'
    ) {
      res.status(400).json({ error: 'Tin nhắn người dùng không hợp lệ.' });
      return;
    }

    const reply = await generateConciergeReply({
      apiKey,
      messages: sanitized,
      cartSummary: body.cartSummary,
      activeProduct: body.activeProduct,
    });

    res.json({ reply });
  } catch (error) {
    console.error('[/api/chat] error:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Lỗi kết nối dịch vụ tư vấn Gemini.';
    if (message === 'EMPTY_MODEL_RESPONSE') {
      res.status(502).json({
        error: 'Trợ lý chưa trả về nội dung. Vui lòng thử gửi lại câu hỏi.',
      });
      return;
    }
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
