'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Leaf,
  ShieldCheck,
  Zap,
} from 'lucide-react';

import { NutriScoreGrade } from '../types/nutrition';
import { UserProfile } from '../types/user';
import { getHealthySwaps, SwapProduct } from '../lib/algorithms/swapsEngine';

interface HealthySwapsProps {
  productName?: string;
  currentGrade: NutriScoreGrade;
  profile?: UserProfile | null;
}

export const HealthySwaps: React.FC<HealthySwapsProps> = ({
  productName = '',
  currentGrade,
  profile,
}) => {
  // Only display swaps for Grade C, D, or E items
  if (currentGrade === 'A' || currentGrade === 'B') {
    return null;
  }

  const swaps: SwapProduct[] = getHealthySwaps(productName, currentGrade, profile || undefined);
  if (swaps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 shadow-xl space-y-6"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Smart Healthy Alternatives
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Grade A & B Upgrades
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Recommended wholefood alternatives with lower sugar, zero processing additives, and higher fiber profiles
          </p>
        </div>
      </div>

      {/* 3 Swap Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {swaps.map((swap, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-md hover:shadow-xl transition-all flex flex-col justify-between gap-4 group"
          >
            {/* Top Bar: Name & Grade Badge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {swap.category}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black shadow-sm ${
                    swap.nutriScoreGrade === 'A'
                      ? 'bg-[#008B4C] text-white'
                      : 'bg-[#80BB2D] text-white'
                  }`}
                >
                  Grade {swap.nutriScoreGrade}
                </span>
              </div>

              <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                {swap.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {swap.reasoning}
              </p>
            </div>

            {/* Comparison Tags */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap gap-1.5">
                {swap.comparisonTags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>

              {/* Quick Macros Summary */}
              <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl text-center">
                <div>
                  <span className="text-[9px] text-slate-400 block">Sugar</span>
                  <span className="font-bold text-emerald-500">{swap.sugarsPer100g}g</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">Fiber</span>
                  <span className="font-bold">{swap.fiberPer100g}g</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">Protein</span>
                  <span className="font-bold">{swap.proteinPer100g}g</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
