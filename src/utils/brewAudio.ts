/**
 * Synthesizes warm antique-bronze bell chimes via Web Audio API.
 * Zero external audio assets; silently no-ops if AudioContext is unavailable or muted.
 */

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedCtx) {
    sharedCtx = new Ctor();
  }
  if (sharedCtx.state === 'suspended') {
    void sharedCtx.resume().catch(() => undefined);
  }
  return sharedCtx;
}

function strikeBronzeTone(
  ctx: AudioContext,
  freq: number,
  startOffsetSec: number,
  durationSec: number,
  peakGain: number
) {
  const now = ctx.currentTime + startOffsetSec;
  const oscMain = ctx.createOscillator();
  const oscHarmonic = ctx.createOscillator();
  const gain = ctx.createGain();

  oscMain.type = 'sine';
  oscMain.frequency.setValueAtTime(freq, now);

  oscHarmonic.type = 'triangle';
  oscHarmonic.frequency.setValueAtTime(freq * 2.01, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

  const harmGain = ctx.createGain();
  harmGain.gain.setValueAtTime(0.22, now);

  oscMain.connect(gain);
  oscHarmonic.connect(harmGain);
  harmGain.connect(gain);
  gain.connect(ctx.destination);

  oscMain.start(now);
  oscHarmonic.start(now);
  oscMain.stop(now + durationSec + 0.04);
  oscHarmonic.stop(now + durationSec + 0.04);
}

/** Gentle single antique-bronze chime on pour stage transition */
export function playBrewStageChime(enabled: boolean): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    strikeBronzeTone(ctx, 587.33, 0, 1.15, 0.14); // D5
    strikeBronzeTone(ctx, 880, 0.06, 0.9, 0.06); // A5 overtone
  } catch {
    // Ignore autoplay or headless audio restrictions
  }
}

/** Warm 3-note chord chime when extraction finishes */
export function playBrewCompleteChime(enabled: boolean): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    strikeBronzeTone(ctx, 523.25, 0, 1.4, 0.14); // C5
    strikeBronzeTone(ctx, 659.25, 0.16, 1.4, 0.13); // E5
    strikeBronzeTone(ctx, 783.99, 0.34, 1.8, 0.15); // G5
  } catch {
    // Ignore autoplay or headless audio restrictions
  }
}
