'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  ChevronDown,
  Info,
  MinusCircle,
  PlusCircle,
  Equal,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

import { NutriScoreBreakdown, NutriScoreGrade } from '../types/nutrition';

interface NutriScoreAccordionProps {
  nutriScore: NutriScoreBreakdown;
}

export const NutriScoreAccordion: React.FC<NutriScoreAccordionProps> = ({
  nutriScore,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { negativePoints, positivePoints, score, grade } = nutriScore;

  // Total Negative Points (N)
  const totalN =
    negativePoints.energy +
    negativePoints.sugars +
    negativePoints.saturated_fat +
    negativePoints.sodium;

  // Determine if protein points are counted (Nutri-Score rule: N < 11 or fruit_veg >= 5)
  const isProteinCounted = totalN < 11 || positivePoints.fruit_veg_pct >= 5;
  const countedProtein = isProteinCounted ? positivePoints.protein : 0;

  // Total Positive Points (P)
  const totalP = positivePoints.fiber + countedProtein + positivePoints.fruit_veg_pct;

  // Grade Range Legend
  const GRADE_LEGEND: { grade: NutriScoreGrade; range: string; bg: string; text: string }[] = [
    { grade: 'A', range: '<= -1', bg: 'bg-[#008B4C]', text: 'text-white' },
    { grade: 'B', range: '0 to 2', bg: 'bg-[#80BB2D]', text: 'text-white' },
    { grade: 'C', range: '3 to 10', bg: 'bg-[#FECB02]', text: 'text-slate-950' },
    { grade: 'D', range: '11 to 18', bg: 'bg-[#EE8100]', text: 'text-white' },
    { grade: 'E', range: '>= 19', bg: 'bg-[#E63312]', text: 'text-white' },
  ];

  return (
    <div className="w-full rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden transition-all">
      {/* Header Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 md:p-6 text-left flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Nutri-Score Calculation Breakdown
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Score: {score}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mathematical point breakdown of negative nutrients (N) vs. positive nutrients (P)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
            {isOpen ? 'Hide Formula' : 'View Formula'}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
              isOpen ? 'rotate-180 text-emerald-500' : ''
            }`}
          />
        </div>
      </button>

      {/* Expandable Accordion Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="border-t border-slate-200/60 dark:border-slate-800/60 p-6 bg-slate-50/40 dark:bg-slate-950/40 space-y-6"
          >
            {/* Grid of Negative (N) & Positive (P) Point Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. NEGATIVE POINTS TABLE (N) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/60 dark:border-rose-900/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-rose-100 dark:border-rose-950">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4" />
                    Negative Points (N)
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    Total N = +{totalN} pts
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 dark:text-slate-400">Energy Density (kJ/100g)</span>
                    <span className="font-mono font-semibold text-rose-500">+{negativePoints.energy} pts</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 dark:text-slate-400">Total Sugars (g/100g)</span>
                    <span className="font-mono font-semibold text-rose-500">+{negativePoints.sugars} pts</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 dark:text-slate-400">Saturated Fat (g/100g)</span>
                    <span className="font-mono font-semibold text-rose-500">+{negativePoints.saturated_fat} pts</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 dark:text-slate-400">Sodium (mg/100g)</span>
                    <span className="font-mono font-semibold text-rose-500">+{negativePoints.sodium} pts</span>
                  </div>
                </div>
              </div>

              {/* 2. POSITIVE POINTS TABLE (P) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-900/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-100 dark:border-emerald-950">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <MinusCircle className="w-4 h-4" />
                    Positive Points (P)
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Total P = -{totalP} pts
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 dark:text-slate-400">Dietary Fiber (g/100g)</span>
                    <span className="font-mono font-semibold text-emerald-500">-{positivePoints.fiber} pts</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      Protein (g/100g)
                      {!isProteinCounted && (
                        <span className="text-[10px] text-amber-500 font-semibold">(Excluded: N ≥ 11)</span>
                      )}
                    </span>
                    <span className={`font-mono font-semibold ${isProteinCounted ? 'text-emerald-500' : 'text-slate-400 line-through'}`}>
                      -{positivePoints.protein} pts
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 dark:text-slate-400">Fruit, Veg, Pulses & Nuts %</span>
                    <span className="font-mono font-semibold text-emerald-500">-{positivePoints.fruit_veg_pct} pts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. MATHEMATICAL CALCULATION EQUATION BANNER */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Equal className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">
                    Mathematical Equation
                  </span>
                  <div className="text-sm font-mono font-bold tracking-wide mt-0.5">
                    Score = Total N ({totalN}) - Total P ({totalP}) = <span className="text-emerald-400 text-base">{score}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Mapped Grade:</span>
                <span className="px-3 py-1 rounded-xl bg-emerald-500 text-white font-black text-sm shadow-md">
                  Grade {grade}
                </span>
              </div>
            </div>

            {/* 4. OFFICIAL GRADE RANGE LEGEND MAP */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Official Nutri-Score Grade Range Legend
              </span>
              <div className="grid grid-cols-5 gap-2">
                {GRADE_LEGEND.map((item) => {
                  const isActive = item.grade === grade;

                  return (
                    <div
                      key={item.grade}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isActive
                          ? `${item.bg} ${item.text} shadow-lg ring-2 ring-emerald-400 border-transparent font-black`
                          : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                      }`}
                    >
                      <div className="text-sm font-bold">{item.grade}</div>
                      <div className="text-[10px] font-mono mt-0.5 opacity-90">{item.range}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
