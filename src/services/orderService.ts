import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { handleFirestoreError, OperationType } from '../lib/firebase/errors';
import type { CartItem, OrderRecord, OrderStatusCode } from '../types/shop';
import { BLUEPRINT_LIMITS } from '../utils/shop';

const ORDERS_COLLECTION = 'orders';

function timestampToIso(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

export async function createOrderInCloud(
  userId: string,
  order: OrderRecord
): Promise<OrderRecord> {
  const docId = order.orderNumber.replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `${ORDERS_COLLECTION}/${docId}`;

  const safeItems = order.items
    .slice(0, BLUEPRINT_LIMITS.MAX_ORDER_ITEMS)
    .map((item) => ({
      lineId: String(item.lineId).slice(0, 120),
      productId: String(item.productId).slice(0, 64),
      name: String(item.name).slice(0, 120),
      image: String(item.image).slice(0, 300),
      weight: item.weight,
      grind: item.grind,
      unitPrice: Number(item.unitPrice),
      quantity: Math.max(1, Math.round(Number(item.quantity))),
    }));

  const payload = {
    orderNumber: order.orderNumber,
    userId,
    customerName: order.customer.fullName.trim().slice(0, BLUEPRINT_LIMITS.NAME_MAX),
    customerPhone: order.customer.phone.trim().slice(0, BLUEPRINT_LIMITS.PHONE_MAX),
    customerAddress: order.customer.address.trim().slice(0, BLUEPRINT_LIMITS.ADDRESS_MAX),
    customerCity: order.customer.city.trim().slice(0, BLUEPRINT_LIMITS.CITY_MAX),
    customerNote: order.customer.note.trim().slice(0, BLUEPRINT_LIMITS.NOTE_MAX),
    paymentMethod: order.customer.paymentMethod,
    items: safeItems,
    subtotal: Math.max(0, Number(order.totals.subtotal)),
    discountAmount: Math.max(0, Number(order.totals.discountAmount)),
    shippingFee: Math.max(0, Number(order.totals.shippingFee)),
    total: Math.max(0, Number(order.totals.total)),
    promoApplied: (order.totals.promoApplied || '').slice(0, BLUEPRINT_LIMITS.PROMO_MAX),
    status: 'confirmed' as OrderStatusCode,
    statusLabel: order.status.slice(0, 120),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, ORDERS_COLLECTION, docId), payload);
    return {
      ...order,
      id: docId,
      statusCode: 'confirmed',
      source: 'cloud',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeUserOrders(
  userId: string,
  onOrders: (orders: OrderRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: OrderRecord[] = snapshot.docs.map((snap) => {
        const d = snap.data();
        const items: CartItem[] = Array.isArray(d.items) ? d.items : [];
        const subtotal = Number(d.subtotal || 0);
        const discountAmount = Number(d.discountAmount || 0);
        const shippingFee = Number(d.shippingFee || 0);
        const total = Number(d.total || 0);
        const promoApplied = d.promoApplied ? String(d.promoApplied) : null;

        return {
          id: snap.id,
          orderNumber: String(d.orderNumber || snap.id),
          createdAt: timestampToIso(d.createdAt),
          customer: {
            fullName: String(d.customerName || ''),
            phone: String(d.customerPhone || ''),
            address: String(d.customerAddress || ''),
            city: String(d.customerCity || ''),
            note: String(d.customerNote || ''),
            paymentMethod: d.paymentMethod === 'bank-transfer' ? 'bank-transfer' : 'cod',
          },
          items,
          totals: {
            subtotal,
            discountRate: subtotal > 0 ? discountAmount / subtotal : 0,
            discountAmount,
            shippingFee,
            total,
            freeShippingRemaining: 0,
            promoApplied,
            promoError: null,
          },
          status: String(d.statusLabel || 'Đã xác nhận'),
          statusCode: (d.status || 'confirmed') as OrderStatusCode,
          source: 'cloud',
        };
      });

      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onOrders(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, ORDERS_COLLECTION);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export async function cancelOrderInCloud(orderId: string): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      status: 'cancelled',
      statusLabel: 'Đã hủy theo yêu cầu khách hàng',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
