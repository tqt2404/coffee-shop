import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addToCart,
  BLUEPRINT_LIMITS,
  calculateItemUnitPrice,
  calculateOrderTotals,
  createBookingRecord,
  createOrderRecord,
  filterAndSortProducts,
  formatVnd,
  FREE_SHIPPING_THRESHOLD,
  removeCartItem,
  STANDARD_SHIPPING_FEE,
  updateCartQuantity,
  validateCheckoutForm,
  validateTastingBooking,
} from './shop';
import { PRODUCTS } from '../data/products';

test('formatVnd formats Vietnamese currency with dot thousands separators', () => {
  assert.equal(formatVnd(245000), '245.000 ₫');
  assert.equal(formatVnd(1250000), '1.250.000 ₫');
  assert.equal(formatVnd(0), '0 ₫');
});

test('calculateItemUnitPrice applies multi-pack discounts for 500g and 1kg', () => {
  assert.equal(calculateItemUnitPrice(250000, '250g'), 250000);
  assert.equal(calculateItemUnitPrice(250000, '500g'), 475000);
  assert.equal(calculateItemUnitPrice(250000, '1kg'), 900000);
  assert.equal(calculateItemUnitPrice(135000, '350ml', true), 135000);
});

test('cart operations merge matching variants and separate distinct grinds', () => {
  const baseItem = {
    productId: 'rung-gia-phin',
    name: 'Rừng Già · Phin Cổ Điển',
    image: '/img.jpg',
    weight: '250g' as const,
    grind: 'Xay Pha Phin' as const,
    unitPrice: 245000,
    quantity: 1,
  };

  let cart = addToCart([], baseItem);
  assert.equal(cart.length, 1);

  cart = addToCart(cart, { ...baseItem, quantity: 2 });
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 3);

  cart = addToCart(cart, { ...baseItem, grind: 'Nguyên hạt', quantity: 1 });
  assert.equal(cart.length, 2);

  cart = updateCartQuantity(cart, cart[0].lineId, -2);
  assert.equal(cart[0].quantity, 1);

  cart = updateCartQuantity(cart, cart[0].lineId, -1);
  assert.equal(cart.length, 1);

  cart = removeCartItem(cart, cart[0].lineId);
  assert.equal(cart.length, 0);
});

test('calculateOrderTotals applies LACSON10 promo and free shipping threshold', () => {
  const singleCart = addToCart([], {
    productId: 'rung-gia-phin',
    name: 'Rừng Già',
    image: '/img.jpg',
    weight: '250g',
    grind: 'Nguyên hạt',
    unitPrice: 245000,
    quantity: 1,
  });

  const standard = calculateOrderTotals(singleCart, '');
  assert.equal(standard.subtotal, 245000);
  assert.equal(standard.shippingFee, STANDARD_SHIPPING_FEE);
  assert.equal(standard.total, 275000);
  assert.equal(standard.freeShippingRemaining, FREE_SHIPPING_THRESHOLD - 245000);

  const invalidPromo = calculateOrderTotals(singleCart, 'FAKE99');
  assert.equal(invalidPromo.discountAmount, 0);
  assert.ok(invalidPromo.promoError);

  const largeCart = addToCart(singleCart, {
    productId: 'midnight-bloom-ethiopia',
    name: 'Midnight Bloom',
    image: '/img2.jpg',
    weight: '250g',
    grind: 'Xay Pour-over',
    unitPrice: 340000,
    quantity: 1,
  });

  const withPromo = calculateOrderTotals(largeCart, 'lacson10');
  assert.equal(withPromo.subtotal, 585000);
  assert.equal(withPromo.discountAmount, 58500);
  assert.equal(withPromo.shippingFee, 0);
  assert.equal(withPromo.total, 526500);
  assert.equal(withPromo.promoApplied, 'LACSON10');
});

test('filterAndSortProducts supports diacritic-insensitive search and sorting', () => {
  const phinOnly = filterAndSortProducts(PRODUCTS, {
    category: 'phin-blend',
    query: '',
    sortBy: 'featured',
  });
  assert.equal(phinOnly.length, 2);

  const searchMatches = filterAndSortProducts(PRODUCTS, {
    category: 'all',
    query: 'hoa nhai',
    sortBy: 'featured',
  });
  assert.equal(searchMatches.length, 1);
  assert.equal(searchMatches[0].id, 'midnight-bloom-ethiopia');

  const ascending = filterAndSortProducts(PRODUCTS, {
    category: 'all',
    query: '',
    sortBy: 'price-asc',
  });
  assert.ok(ascending[0].basePrice <= ascending[ascending.length - 1].basePrice);
});

test('validateCheckoutForm enforces required Vietnamese fields and blueprint bounds', () => {
  const invalid = validateCheckoutForm({
    fullName: '',
    phone: '123',
    address: '12',
    city: '',
    note: 'a'.repeat(BLUEPRINT_LIMITS.NOTE_MAX + 5),
    paymentMethod: 'cod',
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.phone);
  assert.ok(invalid.errors.address);
  assert.ok(invalid.errors.city);
  assert.ok(invalid.errors.note);

  const valid = validateCheckoutForm({
    fullName: 'Nguyễn Minh Quân',
    phone: '0912345678',
    address: '42 Hàng Bông, Quận Hoàn Kiếm',
    city: 'Hà Nội',
    note: 'Giao giờ hành chính',
    paymentMethod: 'cod',
  });
  assert.equal(valid.isValid, true);
  assert.deepEqual(valid.errors, {});
});

test('createOrderRecord generates blueprint-compliant orderNumber and snapshot', () => {
  const cart = addToCart([], {
    productId: 'cold-brew-specialty',
    name: 'Cold Brew',
    image: '/cb.jpg',
    weight: '350ml',
    grind: 'Uống liền',
    unitPrice: 135000,
    quantity: 2,
  });
  const totals = calculateOrderTotals(cart, '');
  const order = createOrderRecord(
    {
      fullName: 'Trần Thu Hà',
      phone: '0987654321',
      address: '18 Trần Hưng Đạo, Phường 10',
      city: 'Đà Lạt',
      note: '',
      paymentMethod: 'bank-transfer',
    },
    cart,
    totals,
    new Date('2026-11-19T10:00:00.000Z')
  );

  assert.match(order.orderNumber, BLUEPRINT_LIMITS.ORDER_NUMBER_PATTERN);
  assert.equal(order.statusCode, 'confirmed');
  assert.equal(order.items.length, 1);
  assert.equal(order.totals.total, 300000);
});

test('validateTastingBooking and createBookingRecord enforce blueprint invariants', () => {
  const bad = validateTastingBooking({
    branchId: 'dalat',
    branchName: 'Đà Lạt',
    guestName: 'A',
    guestPhone: '000',
    date: '19-11-2026',
    timeSlot: '',
    guests: 20,
    note: '',
  });
  assert.equal(bad.isValid, false);
  assert.ok(bad.errors.guestName);
  assert.ok(bad.errors.guestPhone);
  assert.ok(bad.errors.date);
  assert.ok(bad.errors.guests);

  const goodInput = {
    branchId: 'hanoi' as const,
    branchName: 'Phòng Thử Nếm Hà Nội',
    guestName: 'Lê Hoàng Nam',
    guestPhone: '0912345678',
    date: '2026-11-25',
    timeSlot: '09:00 – 10:30',
    guests: 3,
    note: 'Thử các lô Ethiopia',
  };
  const ok = validateTastingBooking(goodInput);
  assert.equal(ok.isValid, true);

  const record = createBookingRecord(goodInput, new Date('2026-11-19T10:00:00.000Z'));
  assert.match(record.bookingCode, BLUEPRINT_LIMITS.BOOKING_CODE_PATTERN);
  assert.equal(record.status, 'pending');
  assert.equal(record.guests, 3);
});
