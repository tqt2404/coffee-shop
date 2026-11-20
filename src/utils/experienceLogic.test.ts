import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS } from '../data/products';
import {
  buildBrewSchedule,
  buildGiftBoxCartPayload,
  calculateGiftBoxPricing,
  compareSensoryProfiles,
  formatTimerSeconds,
  getActiveBrewStage,
  getGiftEligibleProducts,
  recommendCoffeeLots,
} from './experienceLogic';

test('recommendCoffeeLots picks Cold Brew for coldbrew preference', () => {
  const result = recommendCoffeeLots(PRODUCTS, {
    brew: 'coldbrew',
    flavor: 'balanced-honey',
    moment: 'morning-light',
  });

  assert.ok(result);
  assert.equal(result.primary.product.category, 'cold-brew');
  assert.ok(result.primary.matchPercent >= 88 && result.primary.matchPercent <= 99);
  assert.ok(result.runnerUp);
});

test('recommendCoffeeLots picks dark/phin blend for Phin + Rich Cocoa + Midday Bold', () => {
  const result = recommendCoffeeLots(PRODUCTS, {
    brew: 'phin',
    flavor: 'rich-cocoa',
    moment: 'midday-bold',
  });

  assert.ok(result);
  assert.equal(result.primary.product.id, 'rung-gia-phin');
  assert.equal(result.primary.recommendedGrind, 'Xay Pha Phin');
  assert.ok(result.primary.reasons.length >= 1);
});

test('recommendCoffeeLots picks bright Ethiopian single-origin for Pour-over + Floral Fruity', () => {
  const result = recommendCoffeeLots(PRODUCTS, {
    brew: 'pourover',
    flavor: 'floral-fruity',
    moment: 'weekend-slow',
  });

  assert.ok(result);
  assert.equal(result.primary.product.category, 'single-origin');
  assert.equal(result.primary.recommendedGrind, 'Xay Pour-over');
});

test('calculateGiftBoxPricing applies 12% bundle discount only when all 3 slots are filled', () => {
  const eligible = getGiftEligibleProducts(PRODUCTS);
  assert.ok(eligible.length >= 3);

  const partial = calculateGiftBoxPricing([eligible[0], eligible[1], null]);
  assert.equal(partial.isComplete, false);
  assert.equal(partial.savingsAmount, 0);
  assert.equal(partial.finalPrice, eligible[0].basePrice + eligible[1].basePrice);

  const complete = calculateGiftBoxPricing([eligible[0], eligible[1], eligible[2]]);
  const rawTotal =
    eligible[0].basePrice + eligible[1].basePrice + eligible[2].basePrice;
  assert.equal(complete.isComplete, true);
  assert.equal(complete.originalTotal, rawTotal);
  assert.equal(complete.finalPrice, Math.round((rawTotal * 0.88) / 1000) * 1000);
  assert.equal(complete.savingsAmount, rawTotal - complete.finalPrice);
});

test('buildGiftBoxCartPayload returns complete cart item with greeting card metadata', () => {
  const eligible = getGiftEligibleProducts(PRODUCTS);
  const payload = buildGiftBoxCartPayload([eligible[0], eligible[1], eligible[2]], {
    recipient: 'Anh Minh',
    sender: 'Tuấn',
    message: 'Chúc mừng khai trương hồng phát!',
    sealStyle: 'coffee-blossom',
  });

  assert.ok(payload);
  assert.equal(payload.weight, 'Hộp 3 × 250g');
  assert.equal(payload.grind, 'Hộp quà tùy phối');
  assert.equal(payload.giftDetails?.recipient, 'Anh Minh');
  assert.equal(payload.giftDetails?.sealLabel, 'Hoa Cà Phê');
  assert.equal(payload.giftDetails?.slotNames.length, 3);
});

test('compareSensoryProfiles computes exact differences and winners', () => {
  const diffs = compareSensoryProfiles(
    PRODUCTS[0].sensoryProfile,
    PRODUCTS[1].sensoryProfile
  );
  assert.equal(diffs.length, 5);
  const bodyDiff = diffs.find((d) => d.key === 'body');
  assert.ok(bodyDiff);
  assert.equal(bodyDiff.winner, 'A');
  assert.equal(bodyDiff.diff, 1.9);

  const acidityDiff = diffs.find((d) => d.key === 'acidity');
  assert.ok(acidityDiff);
  assert.equal(acidityDiff.winner, 'B');
});

test('buildBrewSchedule and getActiveBrewStage track pour stages accurately across cups', () => {
  const v60TwoCups = buildBrewSchedule('v60', 2);
  assert.equal(v60TwoCups.totalWaterMl, 480);
  assert.equal(v60TwoCups.stages.length, 4);

  const stageAt20 = getActiveBrewStage(v60TwoCups, 20);
  assert.equal(stageAt20.stage.index, 0);
  assert.equal(stageAt20.isFinished, false);

  const stageAt100 = getActiveBrewStage(v60TwoCups, 100);
  assert.equal(stageAt100.stage.index, 2);

  const stageFinished = getActiveBrewStage(v60TwoCups, 999);
  assert.equal(stageFinished.isFinished, true);
  assert.equal(stageFinished.progressRatio, 1);

  assert.equal(formatTimerSeconds(0), '00:00');
  assert.equal(formatTimerSeconds(165), '02:45');
});
