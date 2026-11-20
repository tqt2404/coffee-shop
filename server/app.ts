import express, { type Express } from 'express';
import { accountRouter } from './routes/account.ts';
import { adminRouter } from './routes/admin.ts';
import { authRouter } from './routes/auth.ts';
import { chatRouter } from './routes/chat.ts';
import { healthRouter } from './routes/health.ts';
import { productsRouter } from './routes/products.ts';
import { promoRouter } from './routes/promo.ts';

export function createApiApp(): Express {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/account', accountRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/promo', promoRouter);
  app.use('/api/chat', chatRouter);

  return app;
}
