/**
 * Smart Grocery Aisle Scanning Mode (Audio Feedback Chimes & Haptic Vibration Matrix)
 * 
 * Provides instant sensory feedback for in-store grocery shoppers:
 * - Web Audio API synthesized chimes (Grade A positive chord vs Grade D/E dissonant buzz)
 * - Mobile navigator.vibrate haptic pulses
 * - Safe browser audio unlock on initial user gesture
 */

export interface AisleFeedbackOptions {
  grade?: string;
  hasPersonalConflict?: boolean;
  isNova4UltraProcessed?: boolean;
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Check if sound is muted in user preferences
 */
export function isSoundMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('nutrigrade_sound_muted') === 'true';
}

export function setSoundMuted(muted: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('nutrigrade_sound_muted', muted ? 'true' : 'false');
}

/**
 * Check if haptic vibration is enabled
 */
export function isHapticsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem('nutrigrade_haptics_enabled') !== 'false';
}

export function setHapticsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('nutrigrade_haptics_enabled', enabled ? 'true' : 'false');
}

/**
 * Synthesizes a clean tone with exponential gain decay
 */
function playTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainLevel: number = 0.2
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(gainLevel, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

/**
 * Triggers sound synthesis according to Nutri-Score grade and safety conditions
 */
export function playAisleSound(options: AisleFeedbackOptions): void {
  if (isSoundMuted()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const grade = (options.grade || 'C').toUpperCase();

  // 1. Critical Conflict / Anaphylaxis Risk -> Staccato Urgent Alarm
  if (options.hasPersonalConflict) {
    playTone(ctx, 880, now, 0.1, 'sawtooth', 0.25);
    playTone(ctx, 880, now + 0.15, 0.1, 'sawtooth', 0.25);
    playTone(ctx, 880, now + 0.3, 0.15, 'sawtooth', 0.3);
    return;
  }

  // 2. Nutri-Score A & B -> Joyful Ascending Major Triad (C5 - E5 - G5)
  if (grade === 'A' || grade === 'B') {
    playTone(ctx, 523.25, now, 0.2, 'sine', 0.2); // C5
    playTone(ctx, 659.25, now + 0.08, 0.25, 'sine', 0.22); // E5
    playTone(ctx, 783.99, now + 0.16, 0.4, 'sine', 0.25); // G5
    return;
  }

  // 3. Nutri-Score C -> Neutral Double Harmonic Chime (A4 - C5)
  if (grade === 'C') {
    playTone(ctx, 440.0, now, 0.2, 'triangle', 0.18); // A4
    playTone(ctx, 523.25, now + 0.12, 0.3, 'triangle', 0.18); // C5
    return;
  }

  // 4. Nutri-Score D & E / Ultra-Processed Warning -> Dissonant Low Buzzer (F#3 + C3)
  playTone(ctx, 185.0, now, 0.35, 'sawtooth', 0.22); // F#3
  playTone(ctx, 130.81, now, 0.35, 'sawtooth', 0.25); // C3
  playTone(ctx, 110.0, now + 0.15, 0.3, 'sine', 0.2);
}

/**
 * Triggers mobile hardware vibration according to grade severity
 */
export function triggerAisleHaptic(options: AisleFeedbackOptions): void {
  if (typeof window === 'undefined' || !isHapticsEnabled()) return;
  if (!('vibrate' in navigator)) return;

  try {
    if (options.hasPersonalConflict) {
      // Triple urgent pulse
      navigator.vibrate([150, 60, 150, 60, 250]);
      return;
    }

    const grade = (options.grade || 'C').toUpperCase();
    if (grade === 'A' || grade === 'B') {
      // Quick crisp positive pulse
      navigator.vibrate(50);
    } else if (grade === 'C') {
      // Double medium pulse
      navigator.vibrate([60, 40, 60]);
    } else {
      // Heavy warning vibration
      navigator.vibrate([100, 50, 100, 50, 180]);
    }
  } catch {
    // Graceful fallback on non-vibrating devices
  }
}

/**
 * Unified one-shot trigger for both sound and haptics
 */
export function triggerAisleFeedback(options: AisleFeedbackOptions): void {
  playAisleSound(options);
  triggerAisleHaptic(options);
}
