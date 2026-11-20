import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './config';
import { handleFirestoreError, OperationType } from './errors';

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  authBusy: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

async function syncUserProfile(user: User): Promise<void> {
  if (!user.emailVerified || !user.email) return;
  const path = `users/${user.uid}`;
  const ref = doc(db, 'users', user.uid);

  const safeName = (
    user.displayName?.trim() ||
    user.email.split('@')[0] ||
    'Khách hàng Lạc Sơn'
  ).slice(0, 120);
  const safeEmail = user.email.trim().slice(0, 200);
  const safePhoto = user.photoURL ? user.photoURL.trim().slice(0, 500) : '';

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const payload: Record<string, unknown> = {
        uid: user.uid,
        displayName: safeName,
        email: safeEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (safePhoto) {
        payload.photoURL = safePhoto;
      }
      await setDoc(ref, payload);
    } else {
      const updatePayload: Record<string, unknown> = {
        displayName: safeName,
        email: safeEmail,
        updatedAt: serverTimestamp(),
      };
      if (safePhoto) {
        updatePayload.photoURL = safePhoto;
      }
      await updateDoc(ref, updatePayload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (nextUser) {
        void syncUserProfile(nextUser).catch((err) => {
          console.error('[FirebaseProvider] profile sync error:', err);
        });
      }
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (!msg.includes('popup-closed-by-user')) {
        setAuthError('Không thể đăng nhập Google lúc này. Vui lòng thử lại.');
      }
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signOut(auth);
    } catch {
      setAuthError('Không thể đăng xuất lúc này.');
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const value = useMemo<FirebaseContextValue>(
    () => ({
      user,
      authReady,
      authBusy,
      authError,
      signInWithGoogle,
      signOutUser,
      clearAuthError,
    }),
    [user, authReady, authBusy, authError, signInWithGoogle, signOutUser, clearAuthError]
  );

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
}

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase must be used inside FirebaseProvider');
  }
  return ctx;
}
