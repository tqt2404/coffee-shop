import express, { type Express } from 'express';
import { chatRouter } from './routes/chat.ts';
import { healthRouter } from './routes/health.ts';
import { productsRouter } from './routes/products.ts';
import { promoRouter } from './routes/promo.ts';

export function createApiApp(): Express {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.use('/api/health', healthRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/promo', promoRouter);
  app.use('/api/chat', chatRouter);

  return app;
}
