import { Router, type NextFunction, type Request, type Response } from 'express';
import {
  extractBearerToken,
  verifySessionToken,
  type SessionTokenPayload,
} from '../services/authService.ts';
import {
  cancelUserBookingInStore,
  cancelUserOrderInStore,
  listUserBookingsInStore,
  listUserOrdersInStore,
  upsertBookingInStore,
  upsertOrderInStore,
} from '../services/storeService.ts';
import type { OrderRecord, TastingBookingRecord } from '../../src/types/shop.ts';

export interface AuthenticatedRequest extends Request {
  sessionUser?: SessionTokenPayload;
}

export function requireSessionAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const token = extractBearerToken(req.headers.authorization);
  const session = token ? verifySessionToken(token) : null;
  if (!session) {
    res.status(401).json({ error: 'Vui lòng đăng nhập để thực hiện thao tác này.' });
    return;
  }
  req.sessionUser = session;
  next();
}

export const accountRouter = Router();

accountRouter.use(requireSessionAuth);

accountRouter.get('/records', (req: AuthenticatedRequest, res) => {
  const uid = req.sessionUser!.sub;
  res.json({
    orders: listUserOrdersInStore(uid),
    bookings: listUserBookingsInStore(uid),
  });
});

accountRouter.post('/orders', (req: AuthenticatedRequest, res) => {
  const uid = req.sessionUser!.sub;
  const order = req.body?.order as OrderRecord | undefined;
  if (!order || !order.orderNumber || !Array.isArray(order.items) || order.items.length === 0) {
    res.status(400).json({ error: 'Dữ liệu đơn hàng không hợp lệ.' });
    return;
  }
  const saved = upsertOrderInStore(uid, order);
  res.status(201).json({ order: saved });
});

accountRouter.patch('/orders/:orderNumber/cancel', (req: AuthenticatedRequest, res) => {
  const uid = req.sessionUser!.sub;
  const updated = cancelUserOrderInStore(uid, req.params.orderNumber);
  if (!updated) {
    res.status(404).json({ error: 'Không tìm thấy đơn hàng hoặc đơn không thể hủy.' });
    return;
  }
  res.json({ order: updated });
});

accountRouter.post('/bookings', (req: AuthenticatedRequest, res) => {
  const uid = req.sessionUser!.sub;
  const booking = req.body?.booking as TastingBookingRecord | undefined;
  if (!booking || !booking.bookingCode || !booking.guestName) {
    res.status(400).json({ error: 'Dữ liệu lịch thử nếm không hợp lệ.' });
    return;
  }
  const saved = upsertBookingInStore(uid, booking);
  res.status(201).json({ booking: saved });
});

accountRouter.patch('/bookings/:bookingCode/cancel', (req: AuthenticatedRequest, res) => {
  const uid = req.sessionUser!.sub;
  const updated = cancelUserBookingInStore(uid, req.params.bookingCode);
  if (!updated) {
    res.status(404).json({ error: 'Không tìm thấy lịch thử nếm hoặc lịch không thể hủy.' });
    return;
  }
  res.json({ booking: updated });
});
