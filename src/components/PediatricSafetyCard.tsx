'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Baby,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  HeartHandshake,
} from 'lucide-react';
import { PediatricSafetyResult, ChildSafeTier } from '../lib/algorithms/pediatricSafetyEngine';

interface PediatricSafetyCardProps {
  safetyResult: PediatricSafetyResult;
}

const TIER_CONFIG: Record<
  ChildSafeTier,
  { bg: string; text: string; border: string; badgeBg: string; icon: any }
> = {
  'Child Safe (Green)': {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500 text-white',
    icon: ShieldCheck,
  },
  'Caution for Children (Yellow)': {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    badgeBg: 'bg-amber-500 text-white',
    icon: AlertTriangle,
  },
  'Hazard for Kids (Red)': {
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/40',
    badgeBg: 'bg-rose-600 text-white',
    icon: ShieldAlert,
  },
};

export const PediatricSafetyCard: React.FC<PediatricSafetyCardProps> = ({ safetyResult }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = TIER_CONFIG[safetyResult.tier];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-6 backdrop-blur-xl border transition-all ${config.bg} ${config.border} shadow-xl space-y-5`}
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-forest/20 text-brand-lime border border-brand-lime/30">
            <Baby className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-brand-cream/70">
                Pediatric &amp; Toddler Safety
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-brand-darkBg text-slate-600 dark:text-brand-cream font-semibold">
                AAP Guidelines
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Child Health Index:{' '}
              <span className={config.text}>{safetyResult.safetyScore}/100</span>
            </h3>
          </div>
        </div>

        {/* Severity Badge */}
        <div
          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm self-start sm:self-auto ${config.badgeBg}`}
        >
          <IconComponent className="w-3.5 h-3.5" />
          <span>{safetyResult.tier}</span>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 dark:text-brand-cream/80 leading-relaxed">
        {safetyResult.pediatricVerdict}
      </p>

      {/* TODDLER & CHILD AGE TIERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Toddler (< 2 yo) */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-brand-darkCard/70 border border-slate-200/50 dark:border-brand-cream/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Toddlers (&lt; 2 Years Old)
            </span>
            <span className="text-[11px] text-slate-400">
              AAP: Zero added sugar, minimal sodium
            </span>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
              safetyResult.isApprovedForToddlers
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}
          >
            {safetyResult.isApprovedForToddlers ? '✅ Safe' : '🚫 Not Advised'}
          </span>
        </div>

        {/* Children (2 - 12 yo) */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-brand-darkCard/70 border border-slate-200/50 dark:border-brand-cream/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Kids (Ages 2 – 12)
            </span>
            <span className="text-[11px] text-slate-400">
              Max 12g sugar, no synthetic dyes
            </span>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
              safetyResult.isApprovedForChildren
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}
          >
            {safetyResult.isApprovedForChildren ? '✅ Safe' : '⚠️ Use Caution'}
          </span>
        </div>
      </div>

      {/* HAZARDS DETECTED */}
      {safetyResult.hazards.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
            ⚠️ Pediatric Red Flags Detected ({safetyResult.hazards.length}):
          </span>
          <div className="space-y-2">
            {safetyResult.hazards.map((h) => (
              <div
                key={h.id}
                className="p-3.5 rounded-2xl bg-white/60 dark:bg-brand-darkBg/60 border border-slate-200/50 dark:border-brand-cream/10 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>{h.name}</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    {h.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-brand-cream/70 leading-relaxed">
                  {h.clinicalImpact}
                </p>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Standard: {h.guidelineSource}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PARENT CLINICAL TIPS */}
      <div className="p-4 rounded-2xl bg-white/60 dark:bg-brand-darkCard/60 border border-slate-200/50 dark:border-brand-cream/10 text-xs space-y-1">
        <span className="font-bold text-slate-900 dark:text-white block uppercase tracking-wider text-[10px]">
          💡 Pediatric Nutrition Guidance:
        </span>
        {safetyResult.parentTips.map((tip, idx) => (
          <p key={idx} className="text-slate-600 dark:text-brand-cream/80 leading-relaxed">
            • {tip}
          </p>
        ))}
      </div>
    </motion.div>
  );
};
