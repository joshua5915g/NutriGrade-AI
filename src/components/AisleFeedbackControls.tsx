'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Smartphone, Sparkles, Check, BellRing } from 'lucide-react';
import {
  isSoundMuted,
  setSoundMuted,
  isHapticsEnabled,
  setHapticsEnabled,
  triggerAisleFeedback,
} from '../lib/utils/aisleFeedback';

export const AisleFeedbackControls: React.FC = () => {
  const [muted, setMuted] = useState(false);
  const [haptics, setHaptics] = useState(true);
  const [testActive, setTestActive] = useState(false);

  useEffect(() => {
    setMuted(isSoundMuted());
    setHaptics(isHapticsEnabled());
  }, []);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
  };

  const toggleHaptics = () => {
    const next = !haptics;
    setHaptics(next);
    setHapticsEnabled(next);
  };

  const testHealthyChime = () => {
    setTestActive(true);
    triggerAisleFeedback({ grade: 'A' });
    setTimeout(() => setTestActive(false), 800);
  };

  const testWarningBuzzer = () => {
    setTestActive(true);
    triggerAisleFeedback({ grade: 'E' });
    setTimeout(() => setTestActive(false), 800);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-slate-200/50 dark:bg-slate-800/60 border border-slate-300/40 dark:border-slate-700/50 text-xs">
      <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mr-1">
        <BellRing className="w-3.5 h-3.5 text-emerald-500" />
        <span className="hidden sm:inline">Aisle Mode Feedback:</span>
        <span className="sm:hidden">Aisle Mode:</span>
      </div>

      {/* SOUND TOGGLE */}
      <button
        onClick={toggleSound}
        type="button"
        title={muted ? 'Unmute Audio Chimes' : 'Mute Audio Chimes'}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition-all ${
          !muted
            ? 'bg-emerald-500 text-white shadow-sm'
            : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
        }`}
      >
        {!muted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        <span>{muted ? 'Muted' : 'Sound On'}</span>
      </button>

      {/* HAPTIC TOGGLE */}
      <button
        onClick={toggleHaptics}
        type="button"
        title={haptics ? 'Disable Haptic Vibration' : 'Enable Haptic Vibration'}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition-all ${
          haptics
            ? 'bg-sky-500 text-white shadow-sm'
            : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
        }`}
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>{haptics ? 'Vibrate On' : 'Vibrate Off'}</span>
      </button>

      {/* PREVIEW BUTTONS */}
      <div className="flex items-center gap-1.5 ml-auto">
        <button
          onClick={testHealthyChime}
          type="button"
          className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-colors"
        >
          🎵 Grade A Chime
        </button>
        <button
          onClick={testWarningBuzzer}
          type="button"
          className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-colors"
        >
          ⚡ Grade E Buzz
        </button>
      </div>
    </div>
  );
};
