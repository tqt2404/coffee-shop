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
import {
  fetchSessionUserApi,
  loginWithPasswordApi,
  registerWithPasswordApi,
} from '../../services/apiClient';
import type { AppUser, UserRole } from '../../types/shop';
import { auth, db, googleProvider } from './config';
import { handleFirestoreError, OperationType } from './errors';

const TOKEN_STORAGE_KEY = 'lacson_auth_token_v1';
const BOOTSTRAP_ADMIN_EMAIL = 'tqt2k40424@gmail.com';

interface FirebaseContextValue {
  /** Raw Firebase Auth user (non-null only for Google Sign-In sessions). */
  user: User | null;
  /** Unified session user across both SHA-256 Password Auth and Google Auth. */
  appUser: AppUser | null;
  /** Signed HMAC-SHA256 Bearer token for Password Auth sessions. */
  passwordToken: string | null;
  isAdmin: boolean;
  authReady: boolean;
  authBusy: boolean;
  authError: string | null;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithPassword: (
    username: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<boolean>;
  registerWithPassword: (input: {
    username: string;
    password: string;
    displayName: string;
  }) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
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

async function resolveGoogleUserRole(user: User): Promise<UserRole> {
  if (
    user.emailVerified &&
    user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()
  ) {
    return 'admin';
  }
  try {
    const adminSnap = await getDoc(doc(db, 'admins', user.uid));
    return adminSnap.exists() ? 'admin' : 'user';
  } catch {
    return 'user';
  }
}

function readStoredToken(): string | null {
  try {
    return (
      window.localStorage.getItem(TOKEN_STORAGE_KEY) ||
      window.sessionStorage.getItem(TOKEN_STORAGE_KEY)
    );
  } catch {
    return null;
  }
}

function writeStoredToken(token: string | null, rememberMe = true): void {
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    if (token) {
      const target = rememberMe ? window.localStorage : window.sessionStorage;
      target.setItem(TOKEN_STORAGE_KEY, token);
    }
  } catch {
    // Ignore storage restriction
  }
}

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [googleAppUser, setGoogleAppUser] = useState<AppUser | null>(null);
  const [passwordAppUser, setPasswordAppUser] = useState<AppUser | null>(null);
  const [passwordToken, setPasswordToken] = useState<string | null>(() => readStoredToken());

  const [firebaseChecked, setFirebaseChecked] = useState(false);
  const [passwordChecked, setPasswordChecked] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Hydrate stateless HMAC-SHA256 Password session if present
  useEffect(() => {
    let active = true;
    const saved = readStoredToken();
    if (!saved) {
      setPasswordChecked(true);
      return;
    }
    void fetchSessionUserApi(saved).then((restored) => {
      if (!active) return;
      if (restored) {
        setPasswordAppUser(restored);
        setPasswordToken(saved);
      } else {
        writeStoredToken(null);
        setPasswordAppUser(null);
        setPasswordToken(null);
      }
      setPasswordChecked(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Listen to Firebase Google Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setFirebaseUser(nextUser);
      setFirebaseChecked(true);

      if (!nextUser) {
        setGoogleAppUser(null);
        return;
      }

      // Google login takes precedence over any stale password token
      writeStoredToken(null);
      setPasswordToken(null);
      setPasswordAppUser(null);

      void resolveGoogleUserRole(nextUser).then((role) => {
        setGoogleAppUser({
          uid: nextUser.uid,
          email: nextUser.email || undefined,
          displayName:
            nextUser.displayName?.trim() ||
            nextUser.email?.split('@')[0] ||
            'Khách hàng Lạc Sơn',
          photoURL: nextUser.photoURL || undefined,
          role,
          provider: 'google',
        });
      });

      void syncUserProfile(nextUser).catch((err) => {
        console.error('[FirebaseProvider] profile sync error:', err);
      });
    });
    return () => unsub();
  }, []);

  const signInWithPassword = useCallback(
    async (username: string, password: string, rememberMe = true): Promise<boolean> => {
      setAuthBusy(true);
      setAuthError(null);
      try {
        const res = await loginWithPasswordApi(username, password);
        if (!res.ok) {
          setAuthError(res.error);
          return false;
        }
        // Ensure clean single active provider
        if (auth.currentUser) {
          await signOut(auth).catch(() => undefined);
        }
        writeStoredToken(res.token, rememberMe);
        setPasswordToken(res.token);
        setPasswordAppUser(res.user);
        setAuthModalOpen(false);
        return true;
      } finally {
        setAuthBusy(false);
      }
    },
    []
  );

  const registerWithPassword = useCallback(
    async (input: {
      username: string;
      password: string;
      displayName: string;
    }): Promise<boolean> => {
      setAuthBusy(true);
      setAuthError(null);
      try {
        const res = await registerWithPasswordApi(input);
        if (!res.ok) {
          setAuthError(res.error);
          return false;
        }
        if (auth.currentUser) {
          await signOut(auth).catch(() => undefined);
        }
        writeStoredToken(res.token, true);
        setPasswordToken(res.token);
        setPasswordAppUser(res.user);
        setAuthModalOpen(false);
        return true;
      } finally {
        setAuthBusy(false);
      }
    },
    []
  );

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setAuthModalOpen(false);
      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (!msg.includes('popup-closed-by-user')) {
        setAuthError('Không thể đăng nhập Google lúc này. Vui lòng thử lại.');
      }
      return false;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      writeStoredToken(null);
      setPasswordToken(null);
      setPasswordAppUser(null);
      if (auth.currentUser) {
        await signOut(auth);
      }
      setGoogleAppUser(null);
    } catch {
      setAuthError('Không thể đăng xuất lúc này.');
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const openAuthModal = useCallback(() => {
    setAuthError(null);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthError(null);
    setAuthModalOpen(false);
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const appUser = googleAppUser || passwordAppUser;
  const authReady = firebaseChecked && passwordChecked;
  const isAdmin = appUser?.role === 'admin';

  const value = useMemo<FirebaseContextValue>(
    () => ({
      user: firebaseUser,
      appUser,
      passwordToken,
      isAdmin,
      authReady,
      authBusy,
      authError,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      signInWithPassword,
      registerWithPassword,
      signInWithGoogle,
      signOutUser,
      clearAuthError,
    }),
    [
      firebaseUser,
      appUser,
      passwordToken,
      isAdmin,
      authReady,
      authBusy,
      authError,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      signInWithPassword,
      registerWithPassword,
      signInWithGoogle,
      signOutUser,
      clearAuthError,
    ]
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
