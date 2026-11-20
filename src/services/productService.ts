import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { handleFirestoreError, OperationType } from '../lib/firebase/errors';
import type { Product } from '../types/shop';

const PRODUCTS_COLLECTION = 'products';

export function subscribeCloudProducts(
  onProducts: (products: Product[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    collection(db, PRODUCTS_COLLECTION),
    (snapshot) => {
      if (snapshot.empty) {
        onProducts([]);
        return;
      }
      const list: Product[] = snapshot.docs.map((snap) => {
        const d = snap.data();
        return {
          id: String(d.id || snap.id),
          slug: String(d.slug || snap.id),
          name: String(d.name || ''),
          subtitle: String(d.subtitle || ''),
          category: d.category || 'single-origin',
          categoryLabel: String(d.categoryLabel || 'Hạt Đơn Vùng'),
          origin: String(d.origin || ''),
          elevation: String(d.elevation || ''),
          process: String(d.process || ''),
          roastLevel: d.roastLevel || 'Rang vừa',
          tastingNotes: Array.isArray(d.tastingNotes) ? d.tastingNotes : [],
          sensoryProfile: d.sensoryProfile || {
            acidity: 3.5,
            sweetness: 4.5,
            body: 4.0,
            aroma: 4.5,
            aftertaste: 4.5,
          },
          description: String(d.description || ''),
          basePrice: Number(d.basePrice || 0),
          defaultWeight: d.defaultWeight || '250g',
          availableWeights: Array.isArray(d.availableWeights)
            ? d.availableWeights
            : ['250g'],
          availableGrinds: Array.isArray(d.availableGrinds)
            ? d.availableGrinds
            : ['Nguyên hạt'],
          isSingleUnit: Boolean(d.isSingleUnit) || undefined,
          batchCode: String(d.batchCode || ''),
          stock: Number(d.stock || 0),
          statusNote: d.statusNote ? String(d.statusNote) : undefined,
          image: String(d.image || ''),
          imageAlt: String(d.imageAlt || d.name || ''),
        };
      });
      onProducts(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export async function saveProductInCloud(product: Product): Promise<void> {
  const docId = product.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `${PRODUCTS_COLLECTION}/${docId}`;
  const payload: Record<string, unknown> = {
    id: docId,
    slug: product.slug.replace(/[^a-zA-Z0-9_-]/g, '') || docId,
    name: product.name.trim().slice(0, 120),
    subtitle: product.subtitle.trim().slice(0, 160),
    category: product.category,
    categoryLabel: product.categoryLabel.trim().slice(0, 60),
    origin: product.origin.trim().slice(0, 120),
    elevation: product.elevation.trim().slice(0, 60),
    process: product.process.trim().slice(0, 100),
    roastLevel: product.roastLevel,
    tastingNotes: product.tastingNotes.slice(0, 6),
    sensoryProfile: product.sensoryProfile,
    description: product.description.trim().slice(0, 600),
    basePrice: Math.round(Number(product.basePrice)),
    defaultWeight: product.defaultWeight,
    availableWeights: product.availableWeights.slice(0, 4),
    availableGrinds: product.availableGrinds.slice(0, 5),
    batchCode: product.batchCode.trim().slice(0, 32),
    stock: Math.max(0, Math.round(Number(product.stock))),
    statusNote: (product.statusNote || '').trim().slice(0, 80),
    image: product.image.trim().slice(0, 300),
    imageAlt: product.imageAlt.trim().slice(0, 240),
    updatedAt: serverTimestamp(),
  };
  if (typeof product.isSingleUnit === 'boolean') {
    payload.isSingleUnit = product.isSingleUnit;
  }

  try {
    await setDoc(doc(db, PRODUCTS_COLLECTION, docId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductInCloud(productId: string): Promise<void> {
  const docId = productId.replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `${PRODUCTS_COLLECTION}/${docId}`;
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
