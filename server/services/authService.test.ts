import test from 'node:test';
import assert from 'node:assert/strict';
import {
  authenticateAccount,
  extractBearerToken,
  generateSalt,
  hashPasswordSha256,
  registerAccount,
  signSessionToken,
  verifyPasswordSha256,
  verifySessionToken,
} from './authService';
import {
  createProductInStore,
  deleteProductInStore,
  listProducts,
  updateProductInStore,
  validateAndNormalizeProduct,
} from './storeService';
import { evaluatePasswordStrength } from '../../src/utils/passwordStrength';

test('hashPasswordSha256 produces deterministic 64-char lowercase hex and varies by salt', () => {
  const saltA = generateSalt();
  const saltB = generateSalt();
  assert.equal(saltA.length, 32);
  assert.notEqual(saltA, saltB);

  const hash1 = hashPasswordSha256('admin', saltA);
  const hash2 = hashPasswordSha256('admin', saltA);
  const hashDifferentSalt = hashPasswordSha256('admin', saltB);

  assert.match(hash1, /^[a-f0-9]{64}$/);
  assert.equal(hash1, hash2);
  assert.notEqual(hash1, hashDifferentSalt);
});

test('verifyPasswordSha256 accepts matching password and rejects wrong password, salt, or malformed hash', () => {
  const salt = 'test_salt_123456';
  const expectedHash = hashPasswordSha256('SpecialtyCoffee#99', salt);

  assert.equal(verifyPasswordSha256('SpecialtyCoffee#99', salt, expectedHash), true);
  assert.equal(verifyPasswordSha256('wrong-password', salt, expectedHash), false);
  assert.equal(verifyPasswordSha256('SpecialtyCoffee#99', 'other_salt', expectedHash), false);
  assert.equal(verifyPasswordSha256('SpecialtyCoffee#99', salt, 'not-a-valid-sha256'), false);
});

test('signSessionToken and verifySessionToken reject tampered and expired tokens', () => {
  const now = 1_700_000_000;
  const token = signSessionToken(
    {
      id: 'pwd-admin-lacson',
      username: 'admin',
      displayName: 'Quản trị Nhà Rang Lạc Sơn',
      role: 'admin',
    },
    now
  );

  const verified = verifySessionToken(token, now + 60);
  assert.ok(verified);
  assert.equal(verified.username, 'admin');
  assert.equal(verified.role, 'admin');

  // Tampered signature must be rejected
  const [body, sig] = token.split('.');
  const tamperedSig = `${sig.slice(0, -2)}AA`;
  assert.equal(verifySessionToken(`${body}.${tamperedSig}`, now + 60), null);

  // Tampered payload must be rejected
  const fakePayload = Buffer.from(
    JSON.stringify({ ...verified, role: 'user' }),
    'utf8'
  ).toString('base64url');
  assert.equal(verifySessionToken(`${fakePayload}.${sig}`, now + 60), null);

  // Expired token must be rejected
  assert.equal(verifySessionToken(token, now + 60 * 60 * 24 * 8), null);
});

test('seeded admin (admin/admin) and user accounts authenticate with correct roles', () => {
  const adminRes = authenticateAccount({ username: 'admin', password: 'admin' });
  assert.equal(adminRes.ok, true);
  if (adminRes.ok) {
    assert.equal(adminRes.account.role, 'admin');
    assert.equal(adminRes.account.provider, 'password');
    const payload = verifySessionToken(adminRes.token);
    assert.equal(payload?.role, 'admin');
  }

  const userRes = authenticateAccount({ username: 'khachhang', password: 'Khach@2026' });
  assert.equal(userRes.ok, true);
  if (userRes.ok) {
    assert.equal(userRes.account.role, 'user');
    const payload = verifySessionToken(userRes.token);
    assert.equal(payload?.role, 'user');
  }

  const badPass = authenticateAccount({ username: 'admin', password: 'WrongPassword' });
  assert.equal(badPass.ok, false);
});

test('evaluatePasswordStrength classifies empty, weak, medium, and strong passwords accurately', () => {
  assert.equal(evaluatePasswordStrength('').level, 0);
  assert.equal(evaluatePasswordStrength('abc').level, 1);
  assert.equal(evaluatePasswordStrength('coffee12').level, 2);
  assert.equal(evaluatePasswordStrength('LacSon@2026!').level, 3);
});

test('registerAccount enforces validation, forces user role, rejects duplicates, and allows login', () => {
  const badUsername = registerAccount({
    username: 'A!',
    password: 'Password123',
    displayName: 'Test User',
  });
  assert.equal(badUsername.ok, false);

  const shortPass = registerAccount({
    username: 'valid_user_short',
    password: '123',
    displayName: 'Test User',
  });
  assert.equal(shortPass.ok, false);

  const uniqueUsername = `barista_${Date.now()}`;
  const created = registerAccount({
    username: uniqueUsername,
    password: 'PourOver@2026',
    displayName: 'Trần Hoàng Nam',
  });
  assert.equal(created.ok, true);
  if (created.ok) {
    assert.equal(created.account.role, 'user');
    assert.equal(created.account.username, uniqueUsername);
    const verified = verifySessionToken(created.token);
    assert.equal(verified?.role, 'user');
  }

  const duplicate = registerAccount({
    username: uniqueUsername,
    password: 'AnotherPassword',
    displayName: 'Duplicate User',
  });
  assert.equal(duplicate.ok, false);

  const login = authenticateAccount({
    username: uniqueUsername,
    password: 'PourOver@2026',
  });
  assert.equal(login.ok, true);
  if (login.ok) {
    assert.equal(login.account.role, 'user');
  }
});

test('extractBearerToken parses standard Bearer headers safely', () => {
  assert.equal(extractBearerToken('Bearer abc.def'), 'abc.def');
  assert.equal(extractBearerToken('bearer token-123'), 'token-123');
  assert.equal(extractBearerToken('Basic xyz'), null);
  assert.equal(extractBearerToken(undefined), null);
});

test('storeService validates bounds and supports full product CRUD lifecycle', () => {
  const invalidPrice = validateAndNormalizeProduct({
    name: 'Bourbon Lạc Dương',
    subtitle: 'Chế biến mật ong đỏ',
    origin: 'Lạc Dương, Lâm Đồng',
    basePrice: 5000,
    stock: 10,
  });
  assert.equal(invalidPrice.ok, false);

  const initialCount = listProducts().length;
  const created = createProductInStore({
    name: 'Geisha Cầu Đất Micro-lot',
    subtitle: 'Hoa nhài trắng, đào chín và hậu ngọt thanh',
    category: 'single-origin',
    origin: 'Cầu Đất, Đà Lạt',
    elevation: '1.650 m',
    process: 'Chế biến ướt',
    roastLevel: 'Rang sáng',
    tastingNotes: ['Hoa nhài', 'Đào chín', 'Cam Bergamot'],
    sensoryProfile: { acidity: 4.8, sweetness: 4.9, body: 3.4, aroma: 5.5, aftertaste: 4.9 },
    description: 'Mẻ rang thử nghiệm 12kg.',
    basePrice: 390000,
    batchCode: 'LS-2611-GSH',
    stock: 18,
    image: '/src/assets/images/coffee_cau_dat_arabica_1795140494061.jpg',
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;

  // Clamped sensory score (5.5 -> 5.0)
  assert.equal(created.product.sensoryProfile.aroma, 5);
  assert.equal(listProducts().length, initialCount + 1);

  const updated = updateProductInStore(created.product.id, {
    ...created.product,
    basePrice: 410000,
    stock: 12,
  });
  assert.equal(updated.ok, true);
  if (updated.ok) {
    assert.equal(updated.product.basePrice, 410000);
    assert.equal(updated.product.stock, 12);
  }

  assert.equal(deleteProductInStore(created.product.id), true);
  assert.equal(listProducts().length, initialCount);
});
