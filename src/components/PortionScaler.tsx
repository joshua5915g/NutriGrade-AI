'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  AlertTriangle,
  Minus,
  Plus,
} from 'lucide-react';

import { NormalizedNutritionData } from '../types/nutrition';

interface PortionScalerProps {
  normalizedData: NormalizedNutritionData;
  glycemicLoad: number;
}

const PORTION_OPTIONS = [
  { label: '½×', multiplier: 0.5 },
  { label: '1×', multiplier: 1 },
  { label: '1.5×', multiplier: 1.5 },
  { label: '2×', multiplier: 2 },
  { label: '3×', multiplier: 3 },
];

export const PortionScaler: React.FC<PortionScalerProps> = ({
  normalizedData,
  glycemicLoad,
}) => {
  const [activeMultiplier, setActiveMultiplier] = useState(1);

  const scaled = useMemo(() => ({
    calories: Math.round(normalizedData.calories_per_100g * activeMultiplier * 10) / 10,
    sugars: Math.round(normalizedData.sugars_per_100g * activeMultiplier * 10) / 10,
    sodium: Math.round(normalizedData.sodium_mg_per_100g * activeMultiplier * 10) / 10,
    satFat: Math.round(normalizedData.saturated_fat_per_100g * activeMultiplier * 10) / 10,
    gl: Math.round(glycemicLoad * activeMultiplier * 10) / 10,
  }), [normalizedData, glycemicLoad, activeMultiplier]);

  const isHighPortion = activeMultiplier >= 2;

  const macros = [
    { label: 'Calories', value: scaled.calories, unit: 'kcal', base: normalizedData.calories_per_100g },
    { label: 'Sugars', value: scaled.sugars, unit: 'g', base: normalizedData.sugars_per_100g },
    { label: 'Sodium', value: scaled.sodium, unit: 'mg', base: normalizedData.sodium_mg_per_100g },
    { label: 'Sat. Fat', value: scaled.satFat, unit: 'g', base: normalizedData.saturated_fat_per_100g },
    { label: 'Glyc. Load', value: scaled.gl, unit: 'GL', base: glycemicLoad },
  ];

  return (
    <div className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-500">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Portion Size Scaler
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Recalculate macros for your actual serving size
            </p>
          </div>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-bold">
          {activeMultiplier === 1 ? '100g Base' : `${Math.round(100 * activeMultiplier)}g`}
        </span>
      </div>

      {/* Portion Toggle Buttons */}
      <div className="flex items-center justify-center gap-2">
        {PORTION_OPTIONS.map(({ label, multiplier }) => (
          <button
            key={multiplier}
            onClick={() => setActiveMultiplier(multiplier)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMultiplier === multiplier
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 scale-105'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="px-2">
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.1}
          value={activeMultiplier}
          onChange={(e) => setActiveMultiplier(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-emerald-400 via-sky-400 to-rose-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-sky-500 [&::-webkit-slider-thumb]:cursor-grab"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
          <span>0.5×</span>
          <span>1×</span>
          <span>1.5×</span>
          <span>2×</span>
          <span>3×</span>
        </div>
      </div>

      {/* High Portion Warning */}
      <AnimatePresence>
        {isHighPortion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>⚠️ Caution: High macro load at this portion size.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scaled Macro Grid */}
      <div className="grid grid-cols-5 gap-2">
        {macros.map((m) => {
          const delta = activeMultiplier !== 1 ? ((m.value - m.base) / (m.base || 1)) * 100 : 0;
          const isIncreased = delta > 0;

          return (
            <div
              key={m.label}
              className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-700/40 p-3 text-center transition-all"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {m.label}
              </span>
              <motion.span
                key={m.value}
                initial={{ scale: 1.2, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-lg font-black text-slate-900 dark:text-white block"
              >
                {m.value}
              </motion.span>
              <span className="text-[10px] text-slate-400">{m.unit}</span>
              {activeMultiplier !== 1 && (
                <span
                  className={`text-[9px] font-bold block mt-0.5 ${
                    isIncreased ? 'text-rose-500' : 'text-emerald-500'
                  }`}
                >
                  {isIncreased ? '+' : ''}{delta.toFixed(0)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
