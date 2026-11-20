import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FAST_MORPH_SPRING, ORGANIC_SPRING, SILK_EASE } from '../../utils/motion';

type RoastProfileId = 'light' | 'medium' | 'dark';

interface MilestonePoint {
  id: string;
  label: string;
  timeLabel: string;
  tempC: number;
  note: string;
  x: number;
  y: number;
}

interface RoastProfileSpec {
  id: RoastProfileId;
  name: string;
  coffeeExamples: string;
  dropTempC: number;
  totalTime: string;
  developmentRatio: string;
  curvePath: string;
  milestones: MilestonePoint[];
}

const ROAST_PROFILES: RoastProfileSpec[] = [
  {
    id: 'light',
    name: 'Rang sáng',
    coffeeExamples: 'Midnight Bloom · Ethiopia Guji · Alo Honey',
    dropTempC: 199,
    totalTime: '09 phút 35 giây',
    developmentRatio: '14,5% DTR',
    curvePath: 'M 42 152 Q 86 218 118 208 C 175 186 245 128 318 82 C 356 64 388 54 416 48',
    milestones: [
      {
        id: 'charge',
        label: 'Nạp hạt',
        timeLabel: '00:00',
        tempC: 178,
        note: 'Nạp 12 kg hạt xanh Ethiopia vào trống gang Giesen đã ổn định nhiệt.',
        x: 42,
        y: 152,
      },
      {
        id: 'tp',
        label: 'Điểm đảo nhiệt',
        timeLabel: '01:28',
        tempC: 88,
        note: 'Hạt hấp thụ nhiệt ban đầu, bắt đầu giai đoạn sấy đều lõi hạt.',
        x: 108,
        y: 210,
      },
      {
        id: 'maillard',
        label: 'Phản ứng Maillard',
        timeLabel: '05:10',
        tempC: 154,
        note: 'Hạt chuyển vàng mật ong, hương bánh mì nướng và hoa trắng hình thành.',
        x: 244,
        y: 129,
      },
      {
        id: 'fc',
        label: 'Tiếng nổ đầu',
        timeLabel: '08:12',
        tempC: 193,
        note: 'Cấu trúc tế bào nở bung, giải phóng tầng hương quả mọng và cam Bergamot.',
        x: 356,
        y: 64,
      },
      {
        id: 'drop',
        label: 'Xả khay nguội',
        timeLabel: '09:35',
        tempC: 199,
        note: 'Xả hạt ngay khi độ chua thanh và hương hoa đạt đỉnh cân bằng.',
        x: 416,
        y: 48,
      },
    ],
  },
  {
    id: 'medium',
    name: 'Rang vừa',
    coffeeExamples: 'Lạc Sơn Tuyển Chọn · Mẻ Giesen',
    dropTempC: 207,
    totalTime: '11 phút 10 giây',
    developmentRatio: '18,2% DTR',
    curvePath: 'M 42 146 Q 86 214 118 202 C 180 174 252 114 328 68 C 368 48 400 38 432 32',
    milestones: [
      {
        id: 'charge',
        label: 'Nạp hạt',
        timeLabel: '00:00',
        tempC: 185,
        note: 'Nạp bản phối Cầu Đất & Bảo Lộc vào trống gang giữ nhiệt cao.',
        x: 42,
        y: 146,
      },
      {
        id: 'tp',
        label: 'Điểm đảo nhiệt',
        timeLabel: '01:32',
        tempC: 92,
        note: 'Ổn định độ ẩm đồng nhất trước khi bước vào pha tăng nhiệt mượt.',
        x: 108,
        y: 204,
      },
      {
        id: 'maillard',
        label: 'Caramel hóa',
        timeLabel: '05:45',
        tempC: 162,
        note: 'Đường tự nhiên trong hạt caramel hóa tạo nốt hạnh nhân nướng & kẹo bơ.',
        x: 252,
        y: 114,
      },
      {
        id: 'fc',
        label: 'Tiếng nổ đầu',
        timeLabel: '09:08',
        tempC: 196,
        note: 'Giảm gas chủ động để kéo dài thời gian phát triển hậu vị ngọt.',
        x: 358,
        y: 52,
      },
      {
        id: 'drop',
        label: 'Xả khay nguội',
        timeLabel: '11:10',
        tempC: 207,
        note: 'Làm nguội nhanh trong 3 phút, đạt điểm cân bằng hoàn hảo cho Phin & Espresso.',
        x: 432,
        y: 32,
      },
    ],
  },
  {
    id: 'dark',
    name: 'Rang đậm',
    coffeeExamples: 'Rừng Già · Phin Cổ Điển',
    dropTempC: 215,
    totalTime: '12 phút 20 giây',
    developmentRatio: '21,8% DTR',
    curvePath: 'M 42 140 Q 86 208 120 194 C 186 164 258 102 336 56 C 378 36 410 26 444 20',
    milestones: [
      {
        id: 'charge',
        label: 'Nạp hạt',
        timeLabel: '00:00',
        tempC: 192,
        note: 'Nhiệt nạp cao cho bản phối Fine Robusta Đắk Lắk và Arabica Cầu Đất.',
        x: 42,
        y: 140,
      },
      {
        id: 'tp',
        label: 'Điểm đảo nhiệt',
        timeLabel: '01:35',
        tempC: 96,
        note: 'Truyền nhiệt đối lưu kết hợp dẫn nhiệt trống gang giúp chín sâu từ lõi.',
        x: 108,
        y: 197,
      },
      {
        id: 'maillard',
        label: 'Phát triển thể chất',
        timeLabel: '06:05',
        tempC: 168,
        note: 'Xây dựng độ sánh dày cổ điển và tầng hương ca cao đậm.',
        x: 256,
        y: 103,
      },
      {
        id: 'fc',
        label: 'Tiếng nổ đầu',
        timeLabel: '09:35',
        tempC: 198,
        note: 'Kiểm soát luồng gió cẩn trọng để loại bỏ khói chát, giữ hậu ngọt sạch.',
        x: 364,
        y: 42,
      },
      {
        id: 'drop',
        label: 'Xả trước nổ hai',
        timeLabel: '12:20',
        tempC: 215,
        note: 'Kết thúc ngay sát điểm nổ hai — sô-cô-la đen 75%, không cháy dầu bề mặt.',
        x: 444,
        y: 20,
      },
    ],
  },
];

/**
 * Interactive Museum-Grade Giesen Cast-Iron Roast Profile Telemetry Graph.
 * Zero gradients: pure solid architectural lines, pulsing bronze/pine nodes, and interactive milestone telemetry.
 */
export function RoastCurveVisual() {
  const [profileId, setProfileId] = useState<RoastProfileId>('medium');
  const [activeMilestoneIdx, setActiveMilestoneIdx] = useState<number>(3);

  const profile =
    ROAST_PROFILES.find((p) => p.id === profileId) || ROAST_PROFILES[1];
  const milestone =
    profile.milestones[activeMilestoneIdx] || profile.milestones[3];

  return (
    <div className="bg-[#FFFFFF] border border-[#DDD8CE] p-5 sm:p-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-[#DDD8CE]">
        <div>
          <p className="text-xs tracking-[0.06em] text-[#7A5C38] font-medium mb-1">
            Hồ sơ nhiệt trống gang Giesen 12 kg
          </p>
          <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#191715] leading-[1.22]">
            Biểu đồ phát triển nhiệt độ từng giây
          </h3>
        </div>

        <div
          role="tablist"
          aria-label="Chọn biểu đồ mức rang"
          className="inline-flex bg-[#EFECE6] p-1 border border-[#DDD8CE] self-start lg:self-auto"
        >
          {ROAST_PROFILES.map((item) => {
            const selected = item.id === profileId;
            return (
              <motion.button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                whileTap={{ scale: 0.96 }}
                onClick={() => setProfileId(item.id)}
                className={`relative px-3.5 py-2 min-h-[40px] text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  selected
                    ? 'text-[#F8F7F4]'
                    : 'text-[#5C574F] hover:text-[#191715]'
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="roast-profile-tab"
                    transition={FAST_MORPH_SPRING}
                    aria-hidden="true"
                    className="absolute inset-0 bg-[#191715]"
                  />
                )}
                <span className="relative z-10">{item.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Interactive SVG Temperature Chart */}
        <div className="lg:col-span-8 bg-[#F8F7F4] border border-[#DDD8CE] p-4">
          <svg
            viewBox="0 0 480 250"
            role="img"
            aria-label={`Biểu đồ nhiệt độ rang cho hồ sơ ${profile.name}`}
            className="w-full h-auto"
          >
            {/* Grid Lines */}
            <g stroke="#DDD8CE" strokeWidth="1">
              <line x1="42" y1="30" x2="462" y2="30" />
              <line x1="42" y1="78" x2="462" y2="78" />
              <line x1="42" y1="126" x2="462" y2="126" />
              <line x1="42" y1="174" x2="462" y2="174" />
              <line x1="42" y1="222" x2="462" y2="222" />
              <line x1="42" y1="20" x2="42" y2="222" stroke="#191715" strokeWidth="1.2" />
              <line x1="42" y1="222" x2="462" y2="222" stroke="#191715" strokeWidth="1.2" />
            </g>

            {/* Y-Axis Temperature Labels */}
            <g fill="#5C574F" fontSize="9.5" fontFamily="'JetBrains Mono', monospace">
              <text x="34" y="34" textAnchor="end">220°</text>
              <text x="34" y="82" textAnchor="end">185°</text>
              <text x="34" y="130" textAnchor="end">150°</text>
              <text x="34" y="178" textAnchor="end">115°</text>
              <text x="34" y="225" textAnchor="end">80°</text>
            </g>

            {/* X-Axis Time Labels */}
            <g fill="#5C574F" fontSize="9.5" fontFamily="'JetBrains Mono', monospace">
              <text x="42" y="240">00:00</text>
              <text x="145" y="240" textAnchor="middle">03:00</text>
              <text x="252" y="240" textAnchor="middle">06:00</text>
              <text x="358" y="240" textAnchor="middle">09:00</text>
              <text x="456" y="240" textAnchor="end">12:30</text>
            </g>

            {/* Subtle Reference Target Band (First Crack zone — flat solid fill) */}
            <rect x="43" y="42" width="419" height="24" fill="#EFECE6" opacity="0.8" />
            <text
              x="52"
              y="57"
              textAnchor="start"
              fill="#7A5C38"
              fontSize="8.5"
              fontFamily="'JetBrains Mono', monospace"
            >
              VÙNG TIẾNG NỔ ĐẦU (193–198°C)
            </text>

            {/* Active Milestone Crosshair */}
            <motion.line
              x1={milestone.x}
              x2={milestone.x}
              y1="20"
              y2="222"
              stroke="#7A5C38"
              strokeWidth="1"
              strokeDasharray="3 3"
              animate={{ x1: milestone.x, x2: milestone.x }}
              transition={ORGANIC_SPRING}
            />

            {/* Self-Drawing Animated Roast Temperature Curve */}
            <AnimatePresence mode="wait">
              <motion.path
                key={profile.id}
                d={profile.curvePath}
                fill="none"
                stroke="#1F3A2E"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.4 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: SILK_EASE }}
              />
            </AnimatePresence>

            {/* Interactive Milestone Nodes */}
            {profile.milestones.map((pt, idx) => {
              const isSelected = idx === activeMilestoneIdx;
              return (
                <g
                  key={`${profile.id}-${pt.id}`}
                  onClick={() => setActiveMilestoneIdx(idx)}
                  onMouseEnter={() => setActiveMilestoneIdx(idx)}
                  className="cursor-pointer"
                >
                  {isSelected && (
                    <motion.circle
                      cx={pt.x}
                      cy={pt.y}
                      r="11"
                      fill="#7A5C38"
                      animate={{ scale: [1, 1.35, 1], opacity: [0.22, 0.05, 0.22] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 6 : 4.5}
                    fill={isSelected ? '#7A5C38' : '#FFFFFF'}
                    stroke="#1F3A2E"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Milestone Selector Strip */}
          <div className="mt-3 pt-3 border-t border-[#DDD8CE] flex flex-wrap gap-1.5">
            {profile.milestones.map((pt, idx) => {
              const isSelected = idx === activeMilestoneIdx;
              return (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => setActiveMilestoneIdx(idx)}
                  className={`px-2.5 py-1.5 text-[11px] font-mono border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#191715] text-[#F8F7F4] border-[#191715]'
                      : 'bg-[#FFFFFF] text-[#5C574F] border-[#DDD8CE] hover:border-[#191715] hover:text-[#191715]'
                  }`}
                >
                  0{idx + 1}. {pt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Telemetry Inspector Panel */}
        <div className="lg:col-span-4 bg-[#F8F7F4] border border-[#DDD8CE] p-5 flex flex-col justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#7A5C38]">
              Mốc kiểm soát 0{activeMilestoneIdx + 1} / 05
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${profile.id}-${milestone.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: SILK_EASE }}
                className="mt-2"
              >
                <h4 className="font-display text-2xl font-semibold text-[#191715]">
                  {milestone.label}
                </h4>
                <div className="mt-3 grid grid-cols-2 border border-[#DDD8CE] bg-[#FFFFFF]">
                  <div className="p-3 border-r border-[#DDD8CE]">
                    <p className="text-[11px] text-[#5C574F]">Nhiệt độ hạt</p>
                    <p className="font-mono text-xl font-semibold text-[#1F3A2E] tabular-nums">
                      {milestone.tempC}°C
                    </p>
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] text-[#5C574F]">Thời điểm</p>
                    <p className="font-mono text-xl font-semibold text-[#191715] tabular-nums">
                      {milestone.timeLabel}
                    </p>
                  </div>
                </div>
                <p className="mt-3.5 text-sm leading-relaxed text-[#5C574F]">
                  {milestone.note}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <dl className="mt-5 pt-4 border-t border-[#DDD8CE] space-y-2 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-[#5C574F]">Nhiệt xả khay</dt>
              <dd className="font-mono font-medium text-[#191715]">{profile.dropTempC}°C</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[#5C574F]">Tổng thời gian</dt>
              <dd className="font-mono font-medium text-[#191715]">{profile.totalTime}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[#5C574F]">Tỷ lệ phát triển</dt>
              <dd className="font-mono font-medium text-[#7A5C38]">
                {profile.developmentRatio}
              </dd>
            </div>
            <div className="pt-2 border-t border-[#DDD8CE]">
              <dt className="text-[#5C574F]">Áp dụng cho mẻ rang</dt>
              <dd className="mt-0.5 text-[#191715] font-medium">
                {profile.coffeeExamples}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
