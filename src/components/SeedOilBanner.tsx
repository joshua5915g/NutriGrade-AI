'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  AlertTriangle,
  Sparkles,
  Droplets,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

import { SeedOilRadarResult } from '../lib/algorithms/seedOilRadar';

interface SeedOilBannerProps {
  result: SeedOilRadarResult;
}

export const SeedOilBanner: React.FC<SeedOilBannerProps> = ({ result }) => {
  if (!result.hasSeedOils || result.detectedOils.length === 0) {
    return (
      <div className="rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
              100% Industrial Seed Oil Free
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                Clean Fats
              </span>
            </h4>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
              No refined canola, soy, corn, cottonseed, or hydrogenated oils detected.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl backdrop-blur-xl bg-amber-500/10 border border-amber-500/30 p-6 md:p-8 shadow-xl space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-950 dark:text-amber-100 flex items-center gap-2">
              Seed Oil & Inflammatory Fat Radar
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                {result.overallRiskCategory}
              </span>
            </h3>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
              High-temperature solvent extraction produces oxidized linoleic acid and lipid peroxides
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/60 dark:bg-slate-900/60 text-amber-700 dark:text-amber-300 self-start sm:self-center">
          {result.detectedOils.length} Seed Oil{result.detectedOils.length !== 1 ? 's' : ''} Found
        </span>
      </div>

      {/* Detected Oils Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {result.detectedOils.map((oil, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-amber-300/50 dark:border-amber-900/40 space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-xs text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                {oil.name}
              </span>
              <span
                className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${
                  oil.riskLevel === 'Hydrogenated Trans Fat'
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
                }`}
              >
                {oil.riskLevel}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {oil.reason}
            </p>
          </div>
        ))}
      </div>

      {/* Clean Swaps Recommendations */}
      {result.cleanSwaps.length > 0 && (
        <div className="pt-3 border-t border-amber-500/20 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Healthy Unrefined Fat Alternatives
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.cleanSwaps.map((swap, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5"
              >
                <div className="p-1 rounded-lg bg-emerald-500 text-white shrink-0 mt-0.5">
                  <Droplets className="w-3 h-3" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block">
                    {swap.name}
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 line-clamp-2">
                    {swap.benefits}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
