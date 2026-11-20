import { Router } from 'express';
import { STORE_BRANCHES } from '../../src/data/products.ts';
import type { ProductCategory, SortOption } from '../../src/types/shop.ts';
import { filterAndSortProducts } from '../../src/utils/shop.ts';
import { findProductByIdOrSlug, listProducts } from '../services/storeService.ts';

export const productsRouter = Router();

const VALID_CATEGORIES = new Set<string>([
  'all',
  'single-origin',
  'phin-blend',
  'cold-brew',
]);
const VALID_SORTS = new Set<string>([
  'featured',
  'price-asc',
  'price-desc',
  'name-asc',
]);

productsRouter.get('/', (req, res) => {
  const rawCategory = String(req.query.category || 'all');
  const rawSort = String(req.query.sort || 'featured');
  const query = String(req.query.q || '').slice(0, 120);

  const category = (
    VALID_CATEGORIES.has(rawCategory) ? rawCategory : 'all'
  ) as ProductCategory | 'all';
  const sortBy = (VALID_SORTS.has(rawSort) ? rawSort : 'featured') as SortOption;

  const items = filterAndSortProducts(listProducts(), { category, query, sortBy });
  res.json({
    total: items.length,
    products: items,
    branches: STORE_BRANCHES,
  });
});

productsRouter.get('/:id', (req, res) => {
  const product = findProductByIdOrSlug(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Không tìm thấy sản phẩm yêu cầu.' });
    return;
  }
  res.json({ product });
});
