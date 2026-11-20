import { Router, type NextFunction, type Response } from 'express';
import type { BookingStatusCode, OrderStatusCode } from '../../src/types/shop.ts';
import {
  createProductInStore,
  deleteProductInStore,
  listAllBookingsInStore,
  listAllOrdersInStore,
  listProducts,
  updateBookingStatusInStore,
  updateOrderStatusInStore,
  updateProductInStore,
} from '../services/storeService.ts';
import { requireSessionAuth, type AuthenticatedRequest } from './account.ts';

function requireAdminRole(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.sessionUser) {
    res.status(401).json({ error: 'Chưa xác thực phiên đăng nhập.' });
    return;
  }
  if (req.sessionUser.role !== 'admin') {
    res.status(403).json({ error: 'Chỉ tài khoản quản trị (admin) mới có quyền truy cập.' });
    return;
  }
  next();
}

export const adminRouter = Router();

adminRouter.use(requireSessionAuth, requireAdminRole);

adminRouter.get('/overview', (_req, res) => {
  const orders = listAllOrdersInStore();
  const bookings = listAllBookingsInStore();
  const products = listProducts();

  const totalRevenue = orders
    .filter((o) => o.statusCode !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.totals?.total || 0), 0);

  const pendingOrders = orders.filter(
    (o) => o.statusCode === 'confirmed' || o.statusCode === 'roasting'
  ).length;

  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;

  res.json({
    orders,
    bookings,
    products,
    summary: {
      totalOrders: orders.length,
      pendingOrders,
      totalRevenue,
      totalBookings: bookings.length,
      pendingBookings,
      totalProducts: products.length,
    },
  });
});

adminRouter.post('/products', (req, res) => {
  const result = createProductInStore(req.body ?? {});
  if (!result.ok) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.status(201).json({ product: result.product });
});

adminRouter.put('/products/:id', (req, res) => {
  const result = updateProductInStore(req.params.id, req.body ?? {});
  if (!result.ok) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json({ product: result.product });
});

adminRouter.delete('/products/:id', (req, res) => {
  const removed = deleteProductInStore(req.params.id);
  if (!removed) {
    res.status(404).json({ error: 'Không tìm thấy sản phẩm cần xóa.' });
    return;
  }
  res.json({ ok: true, id: req.params.id });
});

adminRouter.patch('/orders/:orderNumber/status', (req, res) => {
  const status = String(req.body?.status || '') as OrderStatusCode;
  const updated = updateOrderStatusInStore(req.params.orderNumber, status);
  if (!updated) {
    res.status(400).json({ error: 'Không thể cập nhật trạng thái đơn hàng.' });
    return;
  }
  res.json({ order: updated });
});

adminRouter.patch('/bookings/:bookingCode/status', (req, res) => {
  const status = String(req.body?.status || '') as BookingStatusCode;
  const updated = updateBookingStatusInStore(req.params.bookingCode, status);
  if (!updated) {
    res.status(400).json({ error: 'Không thể cập nhật trạng thái lịch thử nếm.' });
    return;
  }
  res.json({ booking: updated });
});
