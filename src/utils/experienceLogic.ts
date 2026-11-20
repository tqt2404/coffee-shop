import type {
  CartItem,
  GiftSealStyle,
  Product,
  SensoryProfile,
} from '../types/shop';

/* ============================================================================
 * 1. COFFEE SOMMELIER 3-STEP MORPH QUIZ ENGINE
 * ========================================================================== */

export type QuizBrewChoice = 'phin' | 'pourover' | 'espresso' | 'coldbrew';
export type QuizFlavorChoice = 'floral-fruity' | 'rich-cocoa' | 'balanced-honey';
export type QuizMomentChoice = 'morning-light' | 'midday-bold' | 'weekend-slow';

export interface QuizAnswers {
  brew: QuizBrewChoice;
  flavor: QuizFlavorChoice;
  moment: QuizMomentChoice;
}

export interface QuizRecommendation {
  product: Product;
  matchPercent: number;
  reasons: string[];
  recommendedGrind: string;
}

export interface QuizResult {
  primary: QuizRecommendation;
  runnerUp: QuizRecommendation | null;
  profileHeadline: string;
}

export const QUIZ_BREW_OPTIONS: {
  id: QuizBrewChoice;
  label: string;
  tag: string;
  detail: string;
}[] = [
  {
    id: 'phin',
    label: 'Phin truyền thống',
    tag: '01 · Pha chậm',
    detail: 'Giọt sánh đậm, hương ca cao & đường thắng cổ điển.',
  },
  {
    id: 'pourover',
    label: 'Pour-over V60 / Giấy lọc',
    tag: '02 · Trong trẻo',
    detail: 'Tôn vinh hương hoa nhài, cam quýt và hậu vị thanh sạch.',
  },
  {
    id: 'espresso',
    label: 'Máy Espresso / Moka Pot',
    tag: '03 · Cân bằng',
    detail: 'Lớp crema mịn dày, vị ngọt caramel dùng nóng hay sữa đá.',
  },
  {
    id: 'coldbrew',
    label: 'Ủ lạnh Cold Brew',
    tag: '04 · Tiện lợi',
    detail: 'Chiết xuất lạnh êm dịu, uống ngay cùng đá viên lớn.',
  },
];

export const QUIZ_FLAVOR_OPTIONS: {
  id: QuizFlavorChoice;
  label: string;
  tag: string;
  detail: string;
}[] = [
  {
    id: 'floral-fruity',
    label: 'Chua thanh & Hoa trái',
    tag: 'Hương sáng',
    detail: 'Hoa nhài, việt quất, vỏ cam vàng, hậu vị tươi mát.',
  },
  {
    id: 'rich-cocoa',
    label: 'Đậm đà Sô-cô-la & Hạt rang',
    tag: 'Thể chất dày',
    detail: 'Sô-cô-la đen, hạt dẻ rang, ít chua, đọng lâu nơi vòm họng.',
  },
  {
    id: 'balanced-honey',
    label: 'Ngọt mật ong & Cân bằng',
    tag: 'Dịu êm',
    detail: 'Đào chín, caramel mặn, mật hoa rừng, dễ uống mỗi ngày.',
  },
];

export const QUIZ_MOMENT_OPTIONS: {
  id: QuizMomentChoice;
  label: string;
  tag: string;
  detail: string;
}[] = [
  {
    id: 'morning-light',
    label: 'Sáng sớm nhẹ nhàng',
    tag: 'Tỉnh thức êm',
    detail: 'Hương thơm lan tỏa dịu dàng, không gắt cổ, khởi đầu tinh tế.',
  },
  {
    id: 'midday-bold',
    label: 'Giữa ngày tỉnh táo đậm vị',
    tag: 'Năng lượng cao',
    detail: 'Cần chiều sâu thể chất rõ rệt để tập trung làm việc.',
  },
  {
    id: 'weekend-slow',
    label: 'Cuối tuần thưởng thức chậm',
    tag: 'Thử nếm sâu',
    detail: 'Khám phá nhiều tầng hương chuyển biến khi cà phê nguội dần.',
  },
];

function scoreProductForQuiz(
  product: Product,
  answers: QuizAnswers
): { rawScore: number; reasons: string[]; recommendedGrind: string } {
  let score = 40;
  const reasons: string[] = [];
  const p = product.sensoryProfile;
  let recommendedGrind = product.availableGrinds[0] || 'Nguyên hạt';

  // Step 1: Brew method match
  if (answers.brew === 'coldbrew') {
    if (product.category === 'cold-brew') {
      score += 38;
      reasons.push('Ủ lạnh sẵn 18 giờ, mở nắp thưởng thức ngay với đá');
      recommendedGrind = 'Uống liền';
    } else if (product.roastLevel === 'Rang sáng' || product.roastLevel === 'Rang sáng vừa') {
      score += 12;
      reasons.push('Hạt rang sáng giữ hương trái cây rất hợp ủ lạnh tại gia');
    }
  } else if (answers.brew === 'phin') {
    if (product.category === 'phin-blend') {
      score += 34;
      reasons.push('Bản phối chuyên biệt cho phin với thể chất dày và ít gắt');
      recommendedGrind = 'Xay Pha Phin';
    } else if (product.availableGrinds.includes('Xay Pha Phin')) {
      score += 15;
      recommendedGrind = 'Xay Pha Phin';
    }
  } else if (answers.brew === 'pourover') {
    if (product.category === 'single-origin') {
      score += 34;
      reasons.push('Hạt đơn vùng độ cao lớn mở tầng hương rõ nét qua giấy lọc V60');
      recommendedGrind = 'Xay Pour-over';
    } else if (product.roastLevel === 'Rang vừa') {
      score += 14;
    }
  } else if (answers.brew === 'espresso') {
    if (product.availableGrinds.includes('Xay Espresso')) {
      score += 28;
      reasons.push('Cấu trúc rang ổn định tạo lớp crema dày và vị ngọt caramel');
      recommendedGrind = 'Xay Espresso';
    }
    if (product.roastLevel === 'Rang vừa' || product.roastLevel === 'Rang đậm') {
      score += 10;
    }
  }

  // Step 2: Flavor profile match
  if (answers.flavor === 'floral-fruity') {
    score += p.acidity * 4.5 + p.aroma * 3.5;
    if (p.acidity >= 4.0) {
      reasons.push(`Độ chua thanh ${p.acidity.toFixed(1)}/5 cùng nốt ${product.tastingNotes[0].toLowerCase()}`);
    }
  } else if (answers.flavor === 'rich-cocoa') {
    score += p.body * 5.0 + (5 - p.acidity) * 2.8 + p.aftertaste * 2.0;
    if (p.body >= 4.2) {
      reasons.push(`Thể chất đậm ${p.body.toFixed(1)}/5 với hậu vị ${product.tastingNotes[0].toLowerCase()}`);
    }
  } else {
    score += p.sweetness * 5.2 + p.aftertaste * 3.0;
    if (p.sweetness >= 4.5) {
      reasons.push(`Độ ngọt tự nhiên đạt ${p.sweetness.toFixed(1)}/5, cân bằng êm dịu`);
    }
  }

  // Step 3: Moment & intensity match
  if (answers.moment === 'morning-light') {
    score += p.aroma * 2.2 + p.sweetness * 1.8 - (product.roastLevel === 'Rang đậm' ? 4 : 0);
  } else if (answers.moment === 'midday-bold') {
    score += p.body * 2.8 + p.aftertaste * 1.6;
  } else {
    score += p.aroma * 2.4 + p.aftertaste * 2.2 + (product.category === 'single-origin' ? 5 : 0);
    if (product.category === 'single-origin') {
      reasons.push('Chuyển tầng hương phong phú khi thưởng thức chậm theo nhiệt độ ly');
    }
  }

  if (reasons.length === 0) {
    reasons.push(`Hồ sơ rang ${product.roastLevel.toLowerCase()} hài hòa với gu vị bạn chọn`);
  }

  return {
    rawScore: score,
    reasons: reasons.slice(0, 3),
    recommendedGrind,
  };
}

export function recommendCoffeeLots(
  products: Product[],
  answers: QuizAnswers
): QuizResult | null {
  if (products.length === 0) return null;

  const scored = products
    .map((product) => {
      const evalRes = scoreProductForQuiz(product, answers);
      return { product, ...evalRes };
    })
    .sort((a, b) => b.rawScore - a.rawScore);

  const maxRaw = Math.max(scored[0].rawScore, 1);

  const toRec = (
    entry: (typeof scored)[number],
    rank: number
  ): QuizRecommendation => {
    const ratio = entry.rawScore / maxRaw;
    const matchPercent =
      rank === 0
        ? Math.min(99, Math.max(88, Math.round(86 + (entry.rawScore / 130) * 13)))
        : Math.min(94, Math.max(76, Math.round(ratio * 93)));
    return {
      product: entry.product,
      matchPercent,
      reasons: entry.reasons,
      recommendedGrind: entry.recommendedGrind,
    };
  };

  const primary = toRec(scored[0], 0);
  const runnerUp = scored.length > 1 ? toRec(scored[1], 1) : null;

  const headlineMap: Record<QuizFlavorChoice, string> = {
    'floral-fruity': 'Hồ sơ vị giác: Thanh sáng & Thơm hương hoa trái',
    'rich-cocoa': 'Hồ sơ vị giác: Đậm đà cổ điển & Thể chất dày',
    'balanced-honey': 'Hồ sơ vị giác: Ngọt mật tròn vị & Cân bằng tinh tế',
  };

  return {
    primary,
    runnerUp,
    profileHeadline: headlineMap[answers.flavor],
  };
}

/* ============================================================================
 * 2. CUSTOM 3-SLOT GIFT BOX BUILDER LOGIC
 * ========================================================================== */

export const GIFT_BOX_SLOT_COUNT = 3;
export const GIFT_BOX_DISCOUNT_RATE = 0.12;

export const GIFT_SEAL_OPTIONS: {
  id: GiftSealStyle;
  label: string;
  monogram: string;
  caption: string;
}[] = [
  {
    id: 'lac-son',
    label: 'Lạc Sơn Ấn',
    monogram: 'LS',
    caption: 'Dấu sáp đồng cổ khắc triện xưởng rang Đà Lạt',
  },
  {
    id: 'coffee-blossom',
    label: 'Hoa Cà Phê',
    monogram: 'HC',
    caption: 'Biểu trưng mùa hoa trắng cao nguyên tháng Ba',
  },
  {
    id: 'vintage-2026',
    label: 'Niên Hiệu 2026',
    monogram: '26',
    caption: 'Ấn kỷ niệm vụ mùa tuyển chọn 2026',
  },
];

export interface GiftBoxPricing {
  filledCount: number;
  isComplete: boolean;
  originalTotal: number;
  discountRate: number;
  savingsAmount: number;
  finalPrice: number;
}

export function getGiftEligibleProducts(products: Product[]): Product[] {
  return products.filter((p) => p.category !== 'cold-brew' && !p.isSingleUnit);
}

export function calculateGiftBoxPricing(
  slots: (Product | null)[]
): GiftBoxPricing {
  const filled = slots.filter((p): p is Product => Boolean(p));
  const originalTotal = filled.reduce((sum, p) => sum + p.basePrice, 0);
  const isComplete = filled.length === GIFT_BOX_SLOT_COUNT;

  if (!isComplete) {
    return {
      filledCount: filled.length,
      isComplete: false,
      originalTotal,
      discountRate: GIFT_BOX_DISCOUNT_RATE,
      savingsAmount: 0,
      finalPrice: originalTotal,
    };
  }

  const discountedRaw = originalTotal * (1 - GIFT_BOX_DISCOUNT_RATE);
  const finalPrice = Math.round(discountedRaw / 1000) * 1000;
  const savingsAmount = Math.max(0, originalTotal - finalPrice);

  return {
    filledCount: filled.length,
    isComplete: true,
    originalTotal,
    discountRate: GIFT_BOX_DISCOUNT_RATE,
    savingsAmount,
    finalPrice,
  };
}

export interface GiftCardInput {
  recipient: string;
  sender: string;
  message: string;
  sealStyle: GiftSealStyle;
}

export function buildGiftBoxCartPayload(
  slots: (Product | null)[],
  card: GiftCardInput
): Omit<CartItem, 'lineId'> | null {
  const pricing = calculateGiftBoxPricing(slots);
  if (!pricing.isComplete) return null;

  const filled = slots.filter((p): p is Product => Boolean(p));
  const seal =
    GIFT_SEAL_OPTIONS.find((s) => s.id === card.sealStyle) || GIFT_SEAL_OPTIONS[0];
  const slotKey = filled.map((p) => p.id.slice(0, 6)).join('-');
  const noteHash = (card.recipient.trim() + card.message.trim()).length;

  return {
    productId: `giftbox-${slotKey}-${card.sealStyle}-${noteHash}`,
    name: 'Hộp Quà Biếu Lạc Sơn · Tự Phối 3 Vị',
    image: filled[0].image,
    weight: 'Hộp 3 × 250g',
    grind: 'Hộp quà tùy phối',
    unitPrice: pricing.finalPrice,
    quantity: 1,
    giftDetails: {
      slotNames: filled.map((p) => p.name),
      recipient: card.recipient.trim() || 'Người thương mến',
      sender: card.sender.trim() || 'Nhà Rang Lạc Sơn',
      message:
        card.message.trim() ||
        'Chúc bạn những buổi sáng thật an yên cùng hương cà phê cao nguyên rang mới.',
      sealStyle: seal.id,
      sealLabel: seal.label,
      originalTotal: pricing.originalTotal,
      savingsAmount: pricing.savingsAmount,
    },
  };
}

/* ============================================================================
 * 3. DUAL LOT COMPARISON SENSORY DIFF LOGIC
 * ========================================================================== */

export interface SensoryAxisDiff {
  key: keyof SensoryProfile;
  label: string;
  valueA: number;
  valueB: number;
  diff: number; // valueA - valueB
  winner: 'A' | 'B' | 'tie';
}

export const SENSORY_AXIS_META: { key: keyof SensoryProfile; label: string }[] = [
  { key: 'aroma', label: 'Hương hoa' },
  { key: 'acidity', label: 'Độ chua' },
  { key: 'sweetness', label: 'Độ ngọt' },
  { key: 'body', label: 'Thể chất' },
  { key: 'aftertaste', label: 'Hậu vị' },
];

export function compareSensoryProfiles(
  a: SensoryProfile,
  b: SensoryProfile
): SensoryAxisDiff[] {
  return SENSORY_AXIS_META.map((axis) => {
    const valA = a[axis.key];
    const valB = b[axis.key];
    const diff = Number((valA - valB).toFixed(1));
    const winner = Math.abs(diff) < 0.05 ? 'tie' : diff > 0 ? 'A' : 'B';
    return {
      key: axis.key,
      label: axis.label,
      valueA: valA,
      valueB: valB,
      diff,
      winner,
    };
  });
}

/* ============================================================================
 * 4. LIVE BREW TIMER STAGE ENGINE (PHIN / V60 / ESPRESSO)
 * ========================================================================== */

export type BrewMethodId = 'phin' | 'v60' | 'espresso';

export interface BrewTimerStage {
  index: number;
  title: string;
  instruction: string;
  startSec: number;
  endSec: number;
  targetWaterMl: number;
}

export interface BrewSchedule {
  methodId: BrewMethodId;
  totalDurationSec: number;
  totalWaterMl: number;
  stages: BrewTimerStage[];
}

export function buildBrewSchedule(
  methodId: BrewMethodId,
  cups: 1 | 2 | 4
): BrewSchedule {
  if (methodId === 'phin') {
    const totalWater = 90 * cups;
    const bloomWater = 30 * cups;
    const mainWater = totalWater;
    const bloomEnd = 45;
    const pourEnd = 75;
    const totalDurationSec = cups === 1 ? 300 : cups === 2 ? 330 : 360;

    return {
      methodId,
      totalDurationSec,
      totalWaterMl: totalWater,
      stages: [
        {
          index: 0,
          title: 'Ủ nở hạt (Bloom)',
          instruction: `Rót đều ${bloomWater} ml nước 94°C làm ướt toàn bộ bột cà phê và chờ khí CO₂ thoát ra.`,
          startSec: 0,
          endSec: bloomEnd,
          targetWaterMl: bloomWater,
        },
        {
          index: 1,
          title: 'Rót nước chính',
          instruction: `Đặt nắp gài nhẹ tay, châm tiếp nước đạt tổng ${mainWater} ml và đậy nắp giữ nhiệt.`,
          startSec: bloomEnd,
          endSec: pourEnd,
          targetWaterMl: mainWater,
        },
        {
          index: 2,
          title: 'Chiết xuất nhỏ giọt chậm',
          instruction:
            'Giữ phin tĩnh lặng để từng giọt cà phê sánh đậm rơi đều đến khi hoàn tất.',
          startSec: pourEnd,
          endSec: totalDurationSec,
          targetWaterMl: mainWater,
        },
      ],
    };
  }

  if (methodId === 'v60') {
    const totalWater = 240 * cups;
    const bloomWater = 40 * cups;
    const pour1Water = 140 * cups;
    const totalDurationSec = cups === 1 ? 165 : cups === 2 ? 185 : 210;

    return {
      methodId,
      totalDurationSec,
      totalWaterMl: totalWater,
      stages: [
        {
          index: 0,
          title: 'Ủ Bloom vòng xoáy',
          instruction: `Rót vòng tròn ${bloomWater} ml nước 92°C từ tâm ra rìa để đánh thức hương hoa.`,
          startSec: 0,
          endSec: 40,
          targetWaterMl: bloomWater,
        },
        {
          index: 1,
          title: 'Rót đợt 1 (Cấu trúc ngọt)',
          instruction: `Rót chậm theo vòng đồng tâm đến mốc ${pour1Water} ml, giữ mực nước ổn định.`,
          startSec: 40,
          endSec: 90,
          targetWaterMl: pour1Water,
        },
        {
          index: 2,
          title: 'Rót đợt 2 (Đủ định lượng)',
          instruction: `Hoàn tất lượng nước đạt ${totalWater} ml, lắc nhẹ bình phễu cho mặt bột phẳng.`,
          startSec: 90,
          endSec: 130,
          targetWaterMl: totalWater,
        },
        {
          index: 3,
          title: 'Rút nước hoàn tất',
          instruction: 'Chờ dòng chiết xuất rút sạch hoàn toàn, xoay nhẹ bình trước khi rót tách.',
          startSec: 130,
          endSec: totalDurationSec,
          targetWaterMl: totalWater,
        },
      ],
    };
  }

  // Espresso
  const totalWater = 36 * cups;
  const totalDurationSec = 29;
  return {
    methodId: 'espresso',
    totalDurationSec,
    totalWaterMl: totalWater,
    stages: [
      {
        index: 0,
        title: 'Ủ áp suất thấp (Pre-infusion)',
        instruction: 'Thấm ướt bánh cà phê đều áp suất nhẹ để hạn chế xói rãnh (channeling).',
        startSec: 0,
        endSec: 7,
        targetWaterMl: Math.round(totalWater * 0.15),
      },
      {
        index: 1,
        title: 'Chiết xuất 9 Bar chuẩn',
        instruction: `Dòng espresso chảy sánh màu mật ong đạt mốc ${Math.round(totalWater * 0.75)} ml.`,
        startSec: 7,
        endSec: 22,
        targetWaterMl: Math.round(totalWater * 0.75),
      },
      {
        index: 2,
        title: 'Khóa lớp Crema hạt dẻ',
        instruction: `Ngắt bơm chính xác khi đạt ${totalWater} ml để giữ hậu ngọt sạch, không đắng gắt.`,
        startSec: 22,
        endSec: totalDurationSec,
        targetWaterMl: totalWater,
      },
    ],
  };
}

export function getActiveBrewStage(
  schedule: BrewSchedule,
  elapsedSec: number
): { stage: BrewTimerStage; isFinished: boolean; progressRatio: number } {
  const clamped = Math.max(0, elapsedSec);
  const isFinished = clamped >= schedule.totalDurationSec;
  const progressRatio = Math.min(1, clamped / Math.max(1, schedule.totalDurationSec));

  if (isFinished) {
    return {
      stage: schedule.stages[schedule.stages.length - 1],
      isFinished: true,
      progressRatio: 1,
    };
  }

  const active =
    schedule.stages.find((s) => clamped >= s.startSec && clamped < s.endSec) ||
    schedule.stages[0];

  return { stage: active, isFinished: false, progressRatio };
}

export function formatTimerSeconds(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
