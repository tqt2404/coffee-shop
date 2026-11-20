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
import type { BookingStatusCode, TastingBookingRecord } from '../types/shop';
import { BLUEPRINT_LIMITS } from '../utils/shop';

const BOOKINGS_COLLECTION = 'bookings';

function timestampToIso(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

export async function createBookingInCloud(
  userId: string,
  booking: TastingBookingRecord
): Promise<TastingBookingRecord> {
  const docId = booking.bookingCode.replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `${BOOKINGS_COLLECTION}/${docId}`;

  const payload = {
    bookingCode: booking.bookingCode,
    userId,
    branchId: booking.branchId,
    branchName: booking.branchName.trim().slice(0, BLUEPRINT_LIMITS.NAME_MAX),
    guestName: booking.guestName.trim().slice(0, BLUEPRINT_LIMITS.NAME_MAX),
    guestPhone: booking.guestPhone.trim().slice(0, BLUEPRINT_LIMITS.PHONE_MAX),
    date: booking.date.trim(),
    timeSlot: booking.timeSlot.trim().slice(0, 24),
    guests: Math.min(
      BLUEPRINT_LIMITS.MAX_GUESTS,
      Math.max(BLUEPRINT_LIMITS.MIN_GUESTS, Math.round(booking.guests))
    ),
    note: booking.note.trim().slice(0, BLUEPRINT_LIMITS.NOTE_MAX),
    status: 'pending' as BookingStatusCode,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, BOOKINGS_COLLECTION, docId), payload);
    return {
      ...booking,
      id: docId,
      status: 'pending',
      source: 'cloud',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeUserBookings(
  userId: string,
  onBookings: (bookings: TastingBookingRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: TastingBookingRecord[] = snapshot.docs.map((snap) => {
        const d = snap.data();
        return {
          id: snap.id,
          bookingCode: String(d.bookingCode || snap.id),
          branchId: d.branchId === 'hanoi' ? 'hanoi' : 'dalat',
          branchName: String(d.branchName || ''),
          guestName: String(d.guestName || ''),
          guestPhone: String(d.guestPhone || ''),
          date: String(d.date || ''),
          timeSlot: String(d.timeSlot || ''),
          guests: Number(d.guests || 2),
          note: String(d.note || ''),
          status: (d.status || 'pending') as BookingStatusCode,
          createdAt: timestampToIso(d.createdAt),
          source: 'cloud',
        };
      });

      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onBookings(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export async function cancelBookingInCloud(bookingId: string): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${bookingId}`;
  try {
    await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeAllBookingsForAdmin(
  onBookings: (bookings: TastingBookingRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    collection(db, BOOKINGS_COLLECTION),
    (snapshot) => {
      const list: TastingBookingRecord[] = snapshot.docs.map((snap) => {
        const d = snap.data();
        return {
          id: snap.id,
          bookingCode: String(d.bookingCode || snap.id),
          branchId: d.branchId === 'hanoi' ? 'hanoi' : 'dalat',
          branchName: String(d.branchName || ''),
          guestName: String(d.guestName || ''),
          guestPhone: String(d.guestPhone || ''),
          date: String(d.date || ''),
          timeSlot: String(d.timeSlot || ''),
          guests: Number(d.guests || 2),
          note: String(d.note || ''),
          status: (d.status || 'pending') as BookingStatusCode,
          createdAt: timestampToIso(d.createdAt),
          source: 'cloud',
        };
      });

      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onBookings(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export async function updateBookingStatusInCloud(
  bookingId: string,
  status: BookingStatusCode
): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${bookingId}`;
  try {
    await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
