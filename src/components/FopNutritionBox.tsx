'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  Building2,
} from 'lucide-react';

import { FdaFopResult, FopMetric } from '../lib/algorithms/fdaFopSimulator';

interface FopNutritionBoxProps {
  fopResult: FdaFopResult;
}

const RATING_CONFIG = {
  Low: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    pillBg: 'bg-emerald-500',
    barColor: '#10b981',
    label: 'LOW (<5% DV)',
  },
  Medium: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    pillBg: 'bg-amber-500',
    barColor: '#f59e0b',
    label: 'MED (5-20% DV)',
  },
  High: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-600 dark:text-rose-400',
    pillBg: 'bg-rose-500',
    barColor: '#ef4444',
    label: 'HIGH (>20% DV)',
  },
};

export const FopNutritionBox: React.FC<FopNutritionBoxProps> = ({ fopResult }) => {
  const metrics: FopMetric[] = [
    fopResult.addedSugars,
    fopResult.saturatedFat,
    fopResult.sodium,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 shadow-xl space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              FDA Front-of-Package (FOP) Compliance
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                2024 Standard
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simulates US FDA guidance threshold warnings per serving based on % Daily Value (% DV)
            </p>
          </div>
        </div>

        {/* High Warning Status Pill */}
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 flex items-center gap-1.5 ${
            fopResult.highWarningTriggered
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
          }`}
        >
          {fopResult.highWarningTriggered ? (
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          )}
          <span>{fopResult.summaryMessage}</span>
        </div>
      </div>

      {/* Standardized FDA 3-Metric Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const cfg = RATING_CONFIG[metric.rating];
          const isHigh = metric.rating === 'High';

          return (
            <div
              key={metric.name}
              className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 relative overflow-hidden transition-all ${cfg.bg} ${cfg.border}`}
            >
              {/* High Warning Badge Overlay */}
              {isHigh && (
                <div className="absolute top-0 right-0 bg-rose-500 text-white font-black text-[9px] uppercase px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  FDA High Warning
                </div>
              )}

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  {metric.name}
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {metric.amount}
                  <span className="text-xs font-normal text-slate-500 ml-1">
                    {metric.unit}
                  </span>
                </div>
              </div>

              {/* % Daily Value Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className={cfg.text}>{cfg.label}</span>
                  <span className="text-slate-900 dark:text-white font-mono">
                    {metric.pctDV}% DV
                  </span>
                </div>

                <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                  {/* 20% DV FDA High Warning threshold line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 opacity-70"
                    style={{ left: '20%' }}
                    title="FDA 20% High Threshold"
                  />
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, metric.pctDV)}%`,
                      backgroundColor: cfg.barColor,
                    }}
                  />
                </div>

                <span className="text-[10px] text-slate-400 block text-right font-mono">
                  DV Ref: {metric.referenceDV}{metric.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
