'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Zap,
  Flame,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';
import { UpfAddictionResult, AddictionRiskLevel } from '../lib/algorithms/upfAddictionRadar';

interface AddictionRiskCardProps {
  result: UpfAddictionResult;
}

const RISK_CONFIG: Record<
  AddictionRiskLevel,
  { bg: string; text: string; border: string; badgeBg: string }
> = {
  'Low / Natural Satiety': {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500 text-white',
  },
  'Moderate Reward Potential': {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
    badgeBg: 'bg-blue-500 text-white',
  },
  'High Craving Risk': {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    badgeBg: 'bg-amber-500 text-white',
  },
  'Severe Hyper-Palatable Formulation': {
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/40',
    badgeBg: 'bg-rose-600 text-white',
  },
};

export const AddictionRiskCard: React.FC<AddictionRiskCardProps> = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = RISK_CONFIG[result.riskLevel];

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
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-brand-cream/70">
                Nutritional Neurobiology
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-brand-darkBg text-slate-600 dark:text-brand-cream font-semibold">
                YFAS Proxy Scale
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Cravings &amp; Reward Index:{' '}
              <span className={config.text}>{result.cravingScore}/100</span>
            </h3>
          </div>
        </div>

        {/* Severity Badge */}
        <div
          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm self-start sm:self-auto ${config.badgeBg}`}
        >
          {result.isHyperPalatable ? (
            <Zap className="w-3.5 h-3.5" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          <span>{result.riskLevel}</span>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 dark:text-brand-cream/80 leading-relaxed">
        {result.neuroClinicalNote}
      </p>

      {/* SATIETY FORECAST BANNER */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-brand-darkCard/70 border border-slate-200/60 dark:border-brand-cream/15 flex items-start gap-3 text-xs md:text-sm">
        <Clock className="w-4 h-4 text-brand-lime flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900 dark:text-white block text-[11px] uppercase tracking-wider">
            Satiety Duration Forecast:
          </span>
          <span className="text-slate-600 dark:text-brand-cream/90 font-medium">
            {result.satietyForecast}
          </span>
        </div>
      </div>

      {/* TRIGGERS DETECTED */}
      {result.triggersDetected.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-brand-cream/70 block">
            Hyper-Palatable Biochemical Drivers ({result.triggersDetected.length}):
          </span>
          <div className="space-y-2">
            {result.triggersDetected.map((trigger) => (
              <div
                key={trigger.id}
                className="p-3.5 rounded-2xl bg-white/60 dark:bg-brand-darkBg/60 border border-slate-200/50 dark:border-brand-cream/10 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-brand-rust" />
                    <span>{trigger.name}</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    {trigger.severity} trigger
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-brand-cream/70 leading-relaxed">
                  {trigger.mechanism}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
