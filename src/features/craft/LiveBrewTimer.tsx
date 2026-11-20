import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';
import { playBrewCompleteChime, playBrewStageChime } from '../../utils/brewAudio';
import {
  buildBrewSchedule,
  formatTimerSeconds,
  getActiveBrewStage,
  type BrewMethodId,
} from '../../utils/experienceLogic';
import { FAST_MORPH_SPRING, ORGANIC_SPRING, SILK_EASE } from '../../utils/motion';

interface LiveBrewTimerProps {
  methodId: BrewMethodId;
  methodName: string;
  cups: 1 | 2 | 4;
}

const RING_RADIUS = 58;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function LiveBrewTimer({ methodId, methodName, cups }: LiveBrewTimerProps) {
  const schedule = useMemo(() => buildBrewSchedule(methodId, cups), [methodId, cups]);

  const [elapsedSec, setElapsedSec] = useState(0);
  const [running, setRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevStageIndexRef = useRef<number>(0);
  const finishedChimedRef = useRef<boolean>(false);

  // Reset timer cleanly when switching brew method or cup count
  useEffect(() => {
    setRunning(false);
    setElapsedSec(0);
    prevStageIndexRef.current = 0;
    finishedChimedRef.current = false;
  }, [methodId, cups]);

  // 1-second interval while running
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setElapsedSec((prev) => {
        const next = prev + 1;
        if (next >= schedule.totalDurationSec) {
          setRunning(false);
          return schedule.totalDurationSec;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, schedule.totalDurationSec]);

  const { stage, isFinished, progressRatio } = useMemo(
    () => getActiveBrewStage(schedule, elapsedSec),
    [schedule, elapsedSec]
  );

  // Trigger bronze chimes on pour-stage transition or completion
  useEffect(() => {
    if (elapsedSec === 0) return;

    if (isFinished && !finishedChimedRef.current) {
      finishedChimedRef.current = true;
      playBrewCompleteChime(soundEnabled);
      return;
    }

    if (stage.index !== prevStageIndexRef.current) {
      prevStageIndexRef.current = stage.index;
      playBrewStageChime(soundEnabled);
    }
  }, [stage.index, isFinished, elapsedSec, soundEnabled]);

  const handleToggleRun = () => {
    if (isFinished) {
      setElapsedSec(0);
      prevStageIndexRef.current = 0;
      finishedChimedRef.current = false;
      setRunning(true);
      playBrewStageChime(soundEnabled);
      return;
    }
    if (!running && elapsedSec === 0) {
      playBrewStageChime(soundEnabled);
    }
    setRunning((r) => !r);
  };

  const handleReset = () => {
    setRunning(false);
    setElapsedSec(0);
    prevStageIndexRef.current = 0;
    finishedChimedRef.current = false;
  };

  const handleNextStage = () => {
    const nextStage = schedule.stages[stage.index + 1];
    if (nextStage) {
      setElapsedSec(nextStage.startSec);
    } else {
      setElapsedSec(schedule.totalDurationSec);
      setRunning(false);
    }
  };

  const dashOffset = RING_CIRCUMFERENCE * (1 - progressRatio);
  const waterFillPercent = Math.round(
    (stage.targetWaterMl / Math.max(1, schedule.totalWaterMl)) * 100
  );

  return (
    <div
      data-testid="live-brew-timer"
      className="mt-6 pt-6 border-t border-[#DDD8CE] bg-[#F8F7F4] border p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#DDD8CE]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#7A5C38] inline-flex items-center gap-2">
            {running && (
              <motion.span
                aria-hidden="true"
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 1.1, repeat: Infinity }}
                className="inline-block w-2 h-2 bg-[#1F3A2E]"
              />
            )}
            <span>
              ĐỒNG HỒ CHIẾT XUẤT TRỰC TIẾP · {methodName.toUpperCase()} ({cups} LY)
            </span>
          </p>
          <p className="font-display text-xl font-semibold text-[#191715] mt-0.5">
            {isFinished
              ? 'Chiết xuất hoàn tất — Chúc bạn thưởng thức trọn vị'
              : `Chặng 0${stage.index + 1}: ${stage.title}`}
          </p>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => setSoundEnabled((s) => !s)}
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? 'Tắt âm thanh chuông đồng' : 'Bật âm thanh chuông đồng'}
          className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] border text-xs font-medium transition-colors cursor-pointer ${
            soundEnabled
              ? 'border-[#7A5C38] bg-[#FFFFFF] text-[#191715]'
              : 'border-[#DDD8CE] bg-[#EFECE6] text-[#5C574F]'
          }`}
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-[#7A5C38]" aria-hidden="true" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span>{soundEnabled ? 'Chuông đồng: Bật' : 'Chuông đồng: Tắt'}</span>
        </motion.button>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Geometric Hairline Ring + Flat Water Extraction Column */}
        <div className="lg:col-span-5 flex items-center justify-center gap-5 bg-[#FFFFFF] border border-[#DDD8CE] p-5">
          {/* Circular Flat Progress Dial */}
          <div className="relative w-[144px] h-[144px] shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90" aria-hidden="true">
              <circle
                cx="70"
                cy="70"
                r={RING_RADIUS}
                fill="none"
                stroke="#EFECE6"
                strokeWidth="5"
              />
              <motion.circle
                cx="70"
                cy="70"
                r={RING_RADIUS}
                fill="none"
                stroke={isFinished ? '#7A5C38' : '#1F3A2E'}
                strokeWidth="5"
                strokeDasharray={RING_CIRCUMFERENCE}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 0.45, ease: SILK_EASE }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                data-testid="brew-timer-display"
                className="font-mono text-2xl font-semibold text-[#191715] tabular-nums"
              >
                {formatTimerSeconds(elapsedSec)}
              </span>
              <span className="font-mono text-[10px] text-[#5C574F] tabular-nums mt-0.5">
                / {formatTimerSeconds(schedule.totalDurationSec)}
              </span>
            </div>
          </div>

          {/* Flat Vertical Water Level Column */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-28 bg-[#EFECE6] border border-[#DDD8CE] relative overflow-hidden flex items-end">
              <motion.div
                className="w-full bg-[#1F3A2E]"
                initial={false}
                animate={{
                  height: `${Math.max(
                    10,
                    Math.round(progressRatio * 100) || (elapsedSec > 0 ? waterFillPercent : 10)
                  )}%`,
                }}
                transition={{ duration: 0.6, ease: SILK_EASE }}
              />
            </div>
            <span className="font-mono text-[11px] text-[#191715] tabular-nums">
              {stage.targetWaterMl} ml
            </span>
            <span className="text-[10px] text-[#5C574F]">Mục tiêu chặng</span>
          </div>
        </div>

        {/* Right: Pour Stages + Live Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-2">
            {schedule.stages.map((st) => {
              const active = !isFinished && stage.index === st.index;
              const done = isFinished || elapsedSec >= st.endSec;
              return (
                <div
                  key={`${methodId}-${st.index}`}
                  className={`relative p-3 border transition-colors ${
                    active
                      ? 'bg-[#FFFFFF] border-[#191715]'
                      : done
                        ? 'bg-[#EFECE6] border-[#DDD8CE]'
                        : 'bg-[#FFFFFF] border-[#DDD8CE] opacity-80'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="active-brew-stage-bar"
                      transition={FAST_MORPH_SPRING}
                      aria-hidden="true"
                      className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#7A5C38]"
                    />
                  )}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-[#191715]">
                      0{st.index + 1}. {st.title}
                    </span>
                    <span className="font-mono text-[#7A5C38] tabular-nums shrink-0">
                      {formatTimerSeconds(st.startSec)}–{formatTimerSeconds(st.endSec)} ·{' '}
                      {st.targetWaterMl} ml
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#5C574F] leading-relaxed">
                    {st.instruction}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <motion.button
              type="button"
              data-cursor="Bấm giờ"
              whileHover={{ y: -1.5 }}
              whileTap={{ scale: 0.96 }}
              transition={ORGANIC_SPRING}
              onClick={handleToggleRun}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[42px] bg-[#1F3A2E] text-[#F8F7F4] text-xs sm:text-sm font-medium hover:bg-[#162B22] transition-colors cursor-pointer"
            >
              {running ? (
                <>
                  <Pause className="w-4 h-4" aria-hidden="true" />
                  <span>Tạm dừng</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" aria-hidden="true" />
                  <span>{isFinished ? 'Pha lại từ đầu' : elapsedSec > 0 ? 'Tiếp tục' : 'Bắt đầu bấm giờ'}</span>
                </>
              )}
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={handleNextStage}
              disabled={isFinished}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[42px] border border-[#DDD8CE] bg-[#FFFFFF] text-xs font-medium text-[#191715] hover:border-[#191715] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Chặng kế</span>
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[42px] border border-[#DDD8CE] bg-[#FFFFFF] text-xs font-medium text-[#5C574F] hover:text-[#191715] hover:border-[#191715] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Đặt lại</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
