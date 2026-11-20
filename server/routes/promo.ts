import { Router } from 'express';
import {
  calculateOrderTotals,
  PROMO_CODES,
} from '../../src/utils/shop.ts';
import type { CartItem } from '../../src/types/shop.ts';

export const promoRouter = Router();

promoRouter.post('/validate', (req, res) => {
  const body = req.body as { code?: string; items?: CartItem[] };
  const cleaned = String(body?.code || '').trim().toUpperCase().slice(0, 32);

  if (!cleaned) {
    res.status(400).json({
      valid: false,
      error: 'Vui lòng nhập mã ưu đãi.',
    });
    return;
  }

  const found = PROMO_CODES[cleaned];
  if (!found) {
    res.status(404).json({
      valid: false,
      code: cleaned,
      error: 'Mã ưu đãi không hợp lệ. Thử LACSON10 để giảm 10%.',
    });
    return;
  }

  const items = Array.isArray(body?.items) ? body.items : [];
  const totals = calculateOrderTotals(items, cleaned);

  res.json({
    valid: true,
    code: cleaned,
    rate: found.rate,
    label: found.label,
    totals,
  });
});
