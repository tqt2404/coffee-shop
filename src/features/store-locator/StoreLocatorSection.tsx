import { useState } from 'react';
import {
  Calendar,
  Check,
  Compass,
  Copy,
  ExternalLink,
  MapPin,
  MessageSquare,
  Navigation,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { STORE_BRANCHES, type StoreBranch } from '../../data/products';
import type { TastingBookingInput, TastingBookingRecord } from '../../types/shop';
import {
  FAST_MORPH_SPRING,
  MORPH_SPRING,
  ORGANIC_SPRING,
  SILK_EASE,
} from '../../utils/motion';
import { createBookingRecord, validateTastingBooking } from '../../utils/shop';
import {
  BronzeCorners,
  MorphLayer,
  MorphPage,
  MorphRule,
  SplitHeadline,
} from '../../components/motion/MorphStage';

interface StoreLocatorSectionProps {
  onOpenBookingChat: (branchName: string) => void;
  onCreateBooking: (booking: TastingBookingRecord) => Promise<void>;
}

const TIME_SLOTS = ['09:00 – 10:30', '14:00 – 15:30', '16:30 – 18:00'];

function getDefaultDate(): string {
  const tomorrow = new Date(Date.now() + 86400000);
  const y = tomorrow.getFullYear();
  const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const d = String(tomorrow.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function StoreLocatorSection({
  onOpenBookingChat,
  onCreateBooking,
}: StoreLocatorSectionProps) {
  const [selectedId, setSelectedId] = useState<'dalat' | 'hanoi'>('dalat');
  const [showRoute, setShowRoute] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mapHovered, setMapHovered] = useState(false);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<TastingBookingRecord | null>(null);
  const [bookingErrors, setBookingErrors] = useState<
    Partial<Record<keyof TastingBookingInput, string>>
  >({});
  const [bookingForm, setBookingForm] = useState({
    guestName: '',
    guestPhone: '',
    date: getDefaultDate(),
    timeSlot: TIME_SLOTS[0],
    guests: 2,
    note: '',
  });

  const branch: StoreBranch =
    STORE_BRANCHES.find((b) => b.id === selectedId) || STORE_BRANCHES[0];

  const handleCopyAddress = async () => {
    const fullAddress = `${branch.address}, ${branch.district}`;
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopiedId(branch.id);
      window.setTimeout(() => setCopiedId(null), 2200);
    } catch {
      setCopiedId(branch.id);
      window.setTimeout(() => setCopiedId(null), 2200);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const input: TastingBookingInput = {
      branchId: branch.id,
      branchName: branch.name,
      ...bookingForm,
    };
    const validation = validateTastingBooking(input);
    if (!validation.isValid) {
      setBookingErrors(validation.errors);
      return;
    }

    setBookingSubmitting(true);
    setBookingErrors({});
    try {
      const record = createBookingRecord(input);
      await onCreateBooking(record);
      setBookingSuccess(record);
      setBookingForm({
        guestName: '',
        guestPhone: '',
        date: getDefaultDate(),
        timeSlot: TIME_SLOTS[0],
        guests: 2,
        note: '',
      });
    } finally {
      setBookingSubmitting(false);
    }
  };

  const originPoint =
    branch.id === 'dalat' ? { x: 155, y: 150 } : { x: 345, y: 132 };

  const routePathD =
    branch.id === 'dalat'
      ? `M ${originPoint.x} ${originPoint.y} L 216 148 L ${branch.pinPos.x} ${branch.pinPos.y}`
      : `M ${originPoint.x} ${originPoint.y} L 280 135 L ${branch.pinPos.x} ${branch.pinPos.y}`;

  const dalatRoads = [
    'M 35 162 L 160 150 L 278 145 L 445 110',
    'M 160 150 L 185 275',
    'M 278 30 L 278 275',
    'M 110 215 L 430 225',
  ];

  const hanoiRoads = [
    'M 45 138 L 215 138 L 345 132 L 455 128',
    'M 110 40 L 110 265',
    'M 215 40 L 215 265',
    'M 345 40 L 345 265',
    'M 85 215 L 345 215',
  ];

  return (
    <MorphPage
      id="cua-hang"
      pageNumber="06"
      chapterTitle="Hệ Thống Không Gian & Chỉ Đường"
      bgClass="bg-[#F8F7F4]"
    >
      {/* Multi-vector Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 relative">
        <MorphLayer vector="left" stagger={0}>
          <p className="text-xs tracking-[0.06em] text-[#7A5C38] font-medium mb-2">
            Hệ thống không gian thử nếm &amp; chỉ đường
          </p>
          <SplitHeadline
            as="h2"
            mode="inView"
            text="Ghé thăm Nhà Rang Lạc Sơn"
            className="font-display text-3xl sm:text-4xl font-semibold leading-[1.2] text-[#191715]"
          />
        </MorphLayer>

        <MorphLayer vector="right" stagger={0.025} className="self-start md:self-auto">
          <div
            role="tablist"
            aria-label="Chọn chi nhánh cửa hàng"
            className="inline-flex bg-[#EFECE6] p-1 border border-[#DDD8CE]"
          >
            {STORE_BRANCHES.map((item) => {
              const active = item.id === selectedId;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  role="tab"
                  whileTap={{ scale: 0.96 }}
                  aria-selected={active}
                  onClick={() => setSelectedId(item.id)}
                  className={`relative px-4 py-2 min-h-[40px] text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                    active
                      ? 'text-[#F8F7F4]'
                      : 'text-[#5C574F] hover:text-[#191715]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="store-branch-indicator"
                      transition={FAST_MORPH_SPRING}
                      aria-hidden="true"
                      className="absolute inset-0 bg-[#191715]"
                    />
                  )}
                  <span className="relative z-10">
                    {item.id === 'dalat' ? 'Đà Lạt · Xưởng rang' : 'Hà Nội · Hàng Bông'}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </MorphLayer>

        <div className="absolute bottom-0 left-0 right-0">
          <MorphRule stagger={0.02} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Architectural Flat Cartographic Map */}
        <MorphLayer
          vector="tilt-left"
          stagger={0.025}
          className="lg:col-span-7 relative bg-[#FFFFFF] border border-[#DDD8CE] flex flex-col transition-colors duration-300 hover:border-[#7A5C38]"
        >
          <div
            onMouseEnter={() => setMapHovered(true)}
            onMouseLeave={() => setMapHovered(false)}
            className="flex flex-col flex-1 relative"
          >
            <BronzeCorners active={mapHovered} size="sm" />

            <div className="px-5 py-3.5 border-b border-[#DDD8CE] flex flex-wrap items-center justify-between gap-3 bg-[#EFECE6]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#191715]">
                <motion.span
                  animate={{ rotate: branch.id === 'dalat' ? 0 : 180 }}
                  transition={ORGANIC_SPRING}
                  className="inline-flex"
                >
                  <Compass className="w-4 h-4 text-[#1F3A2E]" aria-hidden="true" />
                </motion.span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={branch.coordsLabel}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.28, ease: SILK_EASE }}
                  >
                    {branch.coordsLabel}
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowRoute((prev) => !prev)}
                  aria-pressed={showRoute}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-medium border cursor-pointer transition-colors ${
                    showRoute
                      ? 'bg-[#1F3A2E] text-[#F8F7F4] border-[#1F3A2E]'
                      : 'bg-[#FFFFFF] text-[#191715] border-[#DDD8CE] hover:border-[#191715]'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>
                    {showRoute ? 'Đang hiện tuyến chỉ đường' : 'Hiển thị chỉ đường'}
                  </span>
                </motion.button>
              </div>
            </div>

            <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] bg-[#EFECE6] p-4 flex items-center justify-center">
              <svg
                viewBox="0 0 480 290"
                role="img"
                aria-label={`Bản đồ vị trí và tuyến đường tới ${branch.name}`}
                className="w-full h-full max-h-[380px] border border-[#DDD8CE] bg-[#F8F7F4]"
              >
                <g stroke="#E6E1D7" strokeWidth="1">
                  <line x1="80" y1="0" x2="80" y2="290" />
                  <line x1="160" y1="0" x2="160" y2="290" />
                  <line x1="240" y1="0" x2="240" y2="290" />
                  <line x1="320" y1="0" x2="320" y2="290" />
                  <line x1="400" y1="0" x2="400" y2="290" />
                  <line x1="0" y1="70" x2="480" y2="70" />
                  <line x1="0" y1="145" x2="480" y2="145" />
                  <line x1="0" y1="220" x2="480" y2="220" />
                </g>

                <AnimatePresence mode="wait">
                  <motion.g
                    key={`map-layer-${branch.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: SILK_EASE }}
                  >
                    {branch.id === 'dalat' ? (
                      <>
                        <motion.path
                          d="M 28 70 Q 95 44 150 92 Q 160 130 105 135 Q 45 128 28 70 Z"
                          fill="#DFDDD4"
                          stroke="#C8C2B6"
                          strokeWidth="1.2"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.55, ease: SILK_EASE }}
                        />
                        <g
                          stroke="#D4CEC2"
                          strokeWidth="7"
                          fill="none"
                          strokeLinecap="square"
                        >
                          {dalatRoads.map((d, i) => (
                            <motion.path
                              key={d}
                              d={d}
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{
                                duration: 0.65,
                                delay: i * 0.08,
                                ease: SILK_EASE,
                              }}
                            />
                          ))}
                        </g>
                        <motion.g
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, delay: 0.25, ease: SILK_EASE }}
                          fill="#5C574F"
                          fontSize="10"
                          fontFamily="'Be Vietnam Pro', sans-serif"
                        >
                          <text x="184" y="122">
                            Đường Trần Hưng Đạo
                          </text>
                          <text x="64" y="182">
                            Trần Quốc Toản
                          </text>
                        </motion.g>
                      </>
                    ) : (
                      <>
                        <motion.ellipse
                          cx="392"
                          cy="204"
                          rx="46"
                          ry="56"
                          fill="#DFDDD4"
                          stroke="#C8C2B6"
                          strokeWidth="1.2"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.55, ease: SILK_EASE }}
                        />
                        <g
                          stroke="#D4CEC2"
                          strokeWidth="7"
                          fill="none"
                          strokeLinecap="square"
                        >
                          {hanoiRoads.map((d, i) => (
                            <motion.path
                              key={d}
                              d={d}
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{
                                duration: 0.65,
                                delay: i * 0.07,
                                ease: SILK_EASE,
                              }}
                            />
                          ))}
                        </g>
                        <motion.g
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, delay: 0.25, ease: SILK_EASE }}
                          fill="#5C574F"
                          fontSize="10"
                          fontFamily="'Be Vietnam Pro', sans-serif"
                        >
                          <text x="118" y="126">
                            Phố Hàng Bông
                          </text>
                          <text x="284" y="158">
                            Phố Hàng Gai
                          </text>
                        </motion.g>
                      </>
                    )}

                    {branch.landmarks.map((lm, idx) => (
                      <motion.g
                        key={lm.label}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.18 + idx * 0.07,
                          ease: SILK_EASE,
                        }}
                      >
                        <rect
                          x={lm.x - 3}
                          y={lm.y - 3}
                          width="6"
                          height="6"
                          fill="#7A5C38"
                        />
                        <text
                          x={lm.x}
                          y={lm.y - 10}
                          textAnchor="middle"
                          fill="#5C574F"
                          fontSize="10"
                          fontFamily="'Be Vietnam Pro', sans-serif"
                        >
                          {lm.label}
                        </text>
                      </motion.g>
                    ))}
                  </motion.g>
                </AnimatePresence>

                <AnimatePresence>
                  {showRoute && (
                    <motion.g
                      key={`route-${branch.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <motion.path
                        d={routePathD}
                        fill="none"
                        stroke="#1F3A2E"
                        strokeWidth="3.5"
                        strokeDasharray="6 4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.85, delay: 0.15, ease: SILK_EASE }}
                      />
                      <motion.circle
                        cx={originPoint.x}
                        cy={originPoint.y}
                        r="5"
                        fill="#FFFFFF"
                        stroke="#1F3A2E"
                        strokeWidth="2.5"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={FAST_MORPH_SPRING}
                      />
                    </motion.g>
                  )}
                </AnimatePresence>

                <motion.g
                  initial={false}
                  animate={{ x: branch.pinPos.x, y: branch.pinPos.y }}
                  transition={MORPH_SPRING}
                >
                  <motion.circle
                    r="16"
                    fill="#1F3A2E"
                    animate={{ scale: [1, 1.45, 1], opacity: [0.18, 0.04, 0.18] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <circle r="8" fill="#1F3A2E" stroke="#F8F7F4" strokeWidth="2.5" />
                  <rect x="-56" y="15" width="112" height="22" fill="#191715" />
                  <text
                    x="0"
                    y="29"
                    textAnchor="middle"
                    fill="#F8F7F4"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="'Be Vietnam Pro', sans-serif"
                  >
                    Nhà Rang Lạc Sơn
                  </text>
                </motion.g>

                <g transform="translate(445, 34)">
                  <rect
                    x="-14"
                    y="-14"
                    width="28"
                    height="28"
                    fill="#FFFFFF"
                    stroke="#DDD8CE"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#191715"
                    fontSize="11"
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight="500"
                  >
                    N
                  </text>
                </g>
              </svg>
            </div>

            <div className="px-5 py-3.5 border-t border-[#DDD8CE] bg-[#FFFFFF] flex flex-wrap items-center justify-between gap-3 text-xs text-[#5C574F]">
              <MorphLayer vector="left" stagger={0.05} distance={0.3}>
                <span>
                  Tuyến từ{' '}
                  <strong className="text-[#191715]">{branch.directionsOrigin}</strong>:{' '}
                  <span className="font-mono text-[#191715]">{branch.distanceLabel}</span> (
                  {branch.durationLabel})
                </span>
              </MorphLayer>
              <MorphLayer vector="right" stagger={0.055} distance={0.3}>
                <a
                  href={branch.osmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-[#1F3A2E] hover:underline"
                >
                  <span>Mở trên OpenStreetMap</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </MorphLayer>
            </div>
          </div>
        </MorphLayer>

        {/* Right: Branch Details & Step-by-Step Directions */}
        <MorphLayer
          vector="tilt-right"
          stagger={0.045}
          className="lg:col-span-5 relative bg-[#FFFFFF] border border-[#DDD8CE] p-6 sm:p-8 flex flex-col justify-between"
        >
          <BronzeCorners size="sm" />
          <AnimatePresence mode="wait">
            <div key={`details-${branch.id}`}>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.34, ease: SILK_EASE }}
                className="text-xs text-[#7A5C38] font-medium"
              >
                {branch.role}
              </motion.p>

              <SplitHeadline
                as="h3"
                mode="animate"
                baseDelay={0.04}
                text={branch.name}
                className="mt-1.5 font-display text-2xl sm:text-3xl font-semibold leading-[1.24] text-[#191715]"
              />

              <dl className="mt-5 divide-y divide-[#DDD8CE] border-y border-[#DDD8CE] text-sm">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08, ease: SILK_EASE }}
                  className="py-3 flex items-start gap-3"
                >
                  <MapPin
                    className="w-4 h-4 text-[#1F3A2E] mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="sr-only">Địa chỉ</dt>
                    <dd className="text-[#191715] font-medium">{branch.address}</dd>
                    <dd className="text-[#5C574F]">{branch.district}</dd>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.14, ease: SILK_EASE }}
                  className="py-3 flex justify-between gap-4"
                >
                  <dt className="text-[#5C574F]">Giờ mở cửa</dt>
                  <dd className="text-[#191715] text-right">{branch.hours}</dd>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: SILK_EASE }}
                  className="py-3 flex justify-between gap-4"
                >
                  <dt className="text-[#5C574F]">Điện thoại</dt>
                  <dd className="text-[#191715] font-mono text-right">{branch.phone}</dd>
                </motion.div>
              </dl>

              <div className="mt-6">
                <motion.h4
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.22 }}
                  className="text-xs font-semibold text-[#191715] mb-3"
                >
                  Chỉ đường từ {branch.directionsOrigin}
                </motion.h4>
                <ol className="space-y-2.5 text-sm text-[#5C574F]">
                  {branch.routeSteps.map((step, idx) => (
                    <motion.li
                      key={step}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.44,
                        delay: 0.24 + idx * 0.075,
                        ease: SILK_EASE,
                      }}
                      className="flex gap-2.5 leading-relaxed"
                    >
                      <span className="font-mono text-xs text-[#7A5C38] pt-0.5 shrink-0">
                        0{idx + 1}.
                      </span>
                      <span>{step}</span>
                    </motion.li>
                  ))}
                </ol>
              </div>
            </div>
          </AnimatePresence>

          <div className="mt-7 pt-5 relative space-y-2.5">
            <div className="absolute top-0 left-0 right-0">
              <MorphRule stagger={0.07} />
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={ORGANIC_SPRING}
                onClick={handleCopyAddress}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] border border-[#DDD8CE] bg-[#F8F7F4] text-sm font-medium text-[#191715] hover:border-[#191715] transition-colors cursor-pointer"
              >
                {copiedId === branch.id ? (
                  <>
                    <Check className="w-4 h-4 text-[#1F3A2E]" aria-hidden="true" />
                    <span>Đã sao chép địa chỉ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" aria-hidden="true" />
                    <span>Sao chép địa chỉ</span>
                  </>
                )}
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={ORGANIC_SPRING}
                onClick={() => {
                  setBookingSuccess(null);
                  setBookingErrors({});
                  setBookingModalOpen(true);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-[#1F3A2E] text-[#F8F7F4] text-sm font-medium hover:bg-[#162B22] transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span>Đặt lịch thử nếm</span>
              </motion.button>
            </div>

            <button
              type="button"
              onClick={() => onOpenBookingChat(branch.name)}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs text-[#5C574F] hover:text-[#1F3A2E] transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Hoặc trò chuyện cùng chuyên viên tư vấn lịch hẹn</span>
            </button>
          </div>
        </MorphLayer>
      </div>

      {/* Tasting Booking Modal (Persists to Firestore /bookings or Local) */}
      <AnimatePresence>
        {bookingModalOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: SILK_EASE }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setBookingModalOpen(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#191715]/60 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={MORPH_SPRING}
              className="relative w-full max-w-lg bg-[#F8F7F4] border border-[#DDD8CE] p-6 sm:p-8"
            >
              <BronzeCorners size="sm" />
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#DDD8CE]">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#7A5C38]">
                    Đặt bàn Cupping &amp; Thử nếm
                  </p>
                  <h3
                    id="booking-modal-title"
                    className="mt-1 font-display text-2xl font-semibold text-[#191715]"
                  >
                    {branch.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  aria-label="Đóng biểu mẫu đặt lịch thử nếm"
                  className="w-10 h-10 inline-flex items-center justify-center border border-[#DDD8CE] bg-[#FFFFFF] text-[#191715] hover:bg-[#EFECE6] cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="pt-5 space-y-4">
                  <p className="text-sm font-medium text-[#1F3A2E]">
                    Đã ghi nhận lịch hẹn thử nếm thành công.
                  </p>
                  <div className="p-4 bg-[#FFFFFF] border border-[#DDD8CE] space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#5C574F]">Mã giữ chỗ</span>
                      <span className="font-mono font-semibold text-[#191715]">
                        {bookingSuccess.bookingCode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C574F]">Thời gian</span>
                      <span className="font-mono text-[#191715]">
                        {bookingSuccess.date} · {bookingSuccess.timeSlot}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C574F]">Số khách</span>
                      <span className="font-mono text-[#191715]">
                        {bookingSuccess.guests} khách
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <a
                      href="#don-hang"
                      onClick={() => setBookingModalOpen(false)}
                      className="flex-1 py-3 px-4 bg-[#1F3A2E] text-[#F8F7F4] text-sm font-medium text-center hover:bg-[#162B22] transition-colors"
                    >
                      Xem trong sổ lịch hẹn
                    </a>
                    <button
                      type="button"
                      onClick={() => setBookingModalOpen(false)}
                      className="py-3 px-4 border border-[#DDD8CE] bg-[#FFFFFF] text-sm font-medium text-[#191715] cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitBooking} noValidate className="pt-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor="booking-name"
                        className="block text-xs font-medium text-[#191715] mb-1"
                      >
                        Họ và tên *
                      </label>
                      <input
                        id="booking-name"
                        type="text"
                        value={bookingForm.guestName}
                        onChange={(e) =>
                          setBookingForm((p) => ({ ...p, guestName: e.target.value }))
                        }
                        placeholder="Trần Gia Bảo"
                        className="w-full px-3 py-2.5 min-h-[42px] bg-[#FFFFFF] border border-[#DDD8CE] text-sm"
                      />
                      {bookingErrors.guestName && (
                        <p role="alert" className="mt-1 text-xs text-[#8E2A2A]">
                          {bookingErrors.guestName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="booking-phone"
                        className="block text-xs font-medium text-[#191715] mb-1"
                      >
                        Số điện thoại *
                      </label>
                      <input
                        id="booking-phone"
                        type="tel"
                        value={bookingForm.guestPhone}
                        onChange={(e) =>
                          setBookingForm((p) => ({ ...p, guestPhone: e.target.value }))
                        }
                        placeholder="0912345678"
                        className="w-full px-3 py-2.5 min-h-[42px] bg-[#FFFFFF] border border-[#DDD8CE] text-sm font-mono"
                      />
                      {bookingErrors.guestPhone && (
                        <p role="alert" className="mt-1 text-xs text-[#8E2A2A]">
                          {bookingErrors.guestPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label
                        htmlFor="booking-date"
                        className="block text-xs font-medium text-[#191715] mb-1"
                      >
                        Ngày dự kiến *
                      </label>
                      <input
                        id="booking-date"
                        type="date"
                        value={bookingForm.date}
                        onChange={(e) =>
                          setBookingForm((p) => ({ ...p, date: e.target.value }))
                        }
                        className="w-full px-3 py-2.5 min-h-[42px] bg-[#FFFFFF] border border-[#DDD8CE] text-sm font-mono"
                      />
                      {bookingErrors.date && (
                        <p role="alert" className="mt-1 text-xs text-[#8E2A2A]">
                          {bookingErrors.date}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="booking-slot"
                        className="block text-xs font-medium text-[#191715] mb-1"
                      >
                        Khung giờ *
                      </label>
                      <select
                        id="booking-slot"
                        value={bookingForm.timeSlot}
                        onChange={(e) =>
                          setBookingForm((p) => ({ ...p, timeSlot: e.target.value }))
                        }
                        className="w-full px-3 py-2.5 min-h-[42px] bg-[#FFFFFF] border border-[#DDD8CE] text-sm"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="booking-guests"
                        className="block text-xs font-medium text-[#191715] mb-1"
                      >
                        Số khách (1–12)
                      </label>
                      <input
                        id="booking-guests"
                        type="number"
                        min={1}
                        max={12}
                        value={bookingForm.guests}
                        onChange={(e) =>
                          setBookingForm((p) => ({
                            ...p,
                            guests: Number(e.target.value) || 1,
                          }))
                        }
                        className="w-full px-3 py-2.5 min-h-[42px] bg-[#FFFFFF] border border-[#DDD8CE] text-sm font-mono"
                      />
                      {bookingErrors.guests && (
                        <p role="alert" className="mt-1 text-xs text-[#8E2A2A]">
                          {bookingErrors.guests}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="booking-note"
                      className="block text-xs font-medium text-[#191715] mb-1"
                    >
                      Yêu cầu riêng (tùy chọn)
                    </label>
                    <textarea
                      id="booking-note"
                      rows={2}
                      value={bookingForm.note}
                      onChange={(e) =>
                        setBookingForm((p) => ({ ...p, note: e.target.value }))
                      }
                      placeholder="Ví dụ: Muốn thử các dòng Ethiopia Pour-over và Rừng Già pha phin"
                      className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#DDD8CE] text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="w-full py-3.5 px-5 min-h-[46px] bg-[#1F3A2E] text-[#F8F7F4] text-sm font-medium hover:bg-[#162B22] disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {bookingSubmitting ? 'Đang lưu lịch hẹn...' : 'Xác nhận đặt lịch thử nếm'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MorphPage>
  );
}
