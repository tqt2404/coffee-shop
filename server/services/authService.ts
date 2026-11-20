import crypto from 'node:crypto';
import type { UserRole } from '../../src/types/shop.ts';

export interface StoredAccount {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
}

export interface PublicAccount {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  provider: 'password';
  createdAt: string;
}

export interface SessionTokenPayload {
  sub: string;
  username: string;
  displayName: string;
  role: UserRole;
  provider: 'password';
  iat: number;
  exp: number;
}

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const USERNAME_PATTERN = /^[a-z0-9_.-]{3,32}$/;

function getSessionSecret(): string {
  return (
    process.env.AUTH_SESSION_SECRET ||
    process.env.GEMINI_API_KEY ||
    'lac-son-roastery-hmac-secret-2026'
  );
}

/**
 * Generates a cryptographically strong random salt (hex).
 */
export function generateSalt(bytes = 16): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * One-way salted SHA-256 password hash.
 * Formula: SHA-256(`${salt}:${password}`) -> 64-char lowercase hex digest.
 */
export function hashPasswordSha256(password: string, salt: string): string {
  return crypto
    .createHash('sha256')
    .update(`${salt}:${password}`, 'utf8')
    .digest('hex');
}

/**
 * Constant-time verification for one-way salted SHA-256 hashes.
 */
export function verifyPasswordSha256(
  password: string,
  salt: string,
  expectedHexHash: string
): boolean {
  if (!expectedHexHash || expectedHexHash.length !== 64) return false;
  const computed = hashPasswordSha256(password, salt);
  const a = Buffer.from(computed, 'hex');
  const b = Buffer.from(expectedHexHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Signs a stateless HMAC-SHA256 session token (survives Vercel serverless cold starts).
 */
export function signSessionToken(
  account: Pick<StoredAccount, 'id' | 'username' | 'displayName' | 'role'>,
  nowSeconds = Math.floor(Date.now() / 1000)
): string {
  const payload: SessionTokenPayload = {
    sub: account.id,
    username: account.username,
    displayName: account.displayName,
    role: account.role,
    provider: 'password',
    iat: nowSeconds,
    exp: nowSeconds + SESSION_TTL_SECONDS,
  };
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(body, 'utf8')
    .digest('base64url');
  return `${body}.${sig}`;
}

/**
 * Verifies a stateless HMAC-SHA256 session token and checks expiration.
 */
export function verifySessionToken(
  token: string,
  nowSeconds = Math.floor(Date.now() / 1000)
): SessionTokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;

  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(body, 'utf8')
    .digest('base64url');

  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(body, 'base64url').toString('utf8')
    ) as SessionTokenPayload;
    if (
      !parsed ||
      typeof parsed.sub !== 'string' ||
      typeof parsed.username !== 'string' ||
      (parsed.role !== 'admin' && parsed.role !== 'user') ||
      typeof parsed.exp !== 'number' ||
      parsed.exp <= nowSeconds
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function toPublicAccount(acc: StoredAccount): PublicAccount {
  return {
    id: acc.id,
    username: acc.username,
    displayName: acc.displayName,
    role: acc.role,
    provider: 'password',
    createdAt: acc.createdAt,
  };
}

function buildSeededAccounts(): Map<string, StoredAccount> {
  const map = new Map<string, StoredAccount>();

  const adminUsername = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
  const adminSalt = process.env.ADMIN_PASSWORD_SALT || 'ls_admin_salt_2026_v1';
  const adminHash =
    process.env.ADMIN_PASSWORD_SHA256 && process.env.ADMIN_PASSWORD_SHA256.length === 64
      ? process.env.ADMIN_PASSWORD_SHA256.toLowerCase()
      : hashPasswordSha256(process.env.ADMIN_DEFAULT_PASSWORD || 'admin', adminSalt);

  map.set(adminUsername, {
    id: 'pwd-admin-lacson',
    username: adminUsername,
    displayName: 'Quản trị Nhà Rang Lạc Sơn',
    role: 'admin',
    passwordSalt: adminSalt,
    passwordHash: adminHash,
    createdAt: '2026-01-01T00:00:00.000Z',
  });

  const demoSalt = 'ls_member_salt_2026_v1';
  const demoHash = hashPasswordSha256('Khach@2026', demoSalt);
  map.set('khachhang', {
    id: 'pwd-user-khachhang',
    username: 'khachhang',
    displayName: 'Nguyễn Minh Khôi',
    role: 'user',
    passwordSalt: demoSalt,
    passwordHash: demoHash,
    createdAt: '2026-01-02T00:00:00.000Z',
  });

  return map;
}

const accountsStore = buildSeededAccounts();

export function registerAccount(input: {
  username: string;
  password: string;
  displayName: string;
}): { ok: true; account: PublicAccount; token: string } | { ok: false; error: string } {
  const normalizedUsername = String(input.username || '')
    .trim()
    .toLowerCase();
  const password = String(input.password || '');
  const displayName = String(input.displayName || '').trim().slice(0, 80);

  if (!USERNAME_PATTERN.test(normalizedUsername)) {
    return {
      ok: false,
      error:
        'Tên đăng nhập cần từ 3–32 ký tự, chỉ gồm chữ thường không dấu, số hoặc dấu _ . -',
    };
  }
  if (password.length < 6 || password.length > 128) {
    return {
      ok: false,
      error: 'Mật khẩu cần tối thiểu 6 ký tự.',
    };
  }
  if (displayName.length < 2) {
    return {
      ok: false,
      error: 'Vui lòng nhập họ tên hiển thị tối thiểu 2 ký tự.',
    };
  }
  if (accountsStore.has(normalizedUsername)) {
    return {
      ok: false,
      error: 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.',
    };
  }

  const salt = generateSalt();
  const passwordHash = hashPasswordSha256(password, salt);
  // Security invariant: self-registration ALWAYS creates standard 'user' role
  const created: StoredAccount = {
    id: `pwd-user-${crypto.randomBytes(6).toString('hex')}`,
    username: normalizedUsername,
    displayName,
    role: 'user',
    passwordSalt: salt,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  accountsStore.set(normalizedUsername, created);
  return {
    ok: true,
    account: toPublicAccount(created),
    token: signSessionToken(created),
  };
}

export function authenticateAccount(input: {
  username: string;
  password: string;
}): { ok: true; account: PublicAccount; token: string } | { ok: false; error: string } {
  const normalizedUsername = String(input.username || '')
    .trim()
    .toLowerCase();
  const password = String(input.password || '');

  if (!normalizedUsername || !password) {
    return {
      ok: false,
      error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.',
    };
  }

  const found = accountsStore.get(normalizedUsername);
  if (!found) {
    return {
      ok: false,
      error: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
    };
  }

  const valid = verifyPasswordSha256(password, found.passwordSalt, found.passwordHash);
  if (!valid) {
    return {
      ok: false,
      error: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
    };
  }

  return {
    ok: true,
    account: toPublicAccount(found),
    token: signSessionToken(found),
  };
}

export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}
