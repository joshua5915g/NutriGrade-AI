'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Bug,
  AlertCircle,
} from 'lucide-react';

import type { GlycemicImpactLevel, GutDisruptor } from '../types/nutrition';

interface GlycemicAndGutCardProps {
  glycemicIndexEstimate: number;
  glycemicLoad: number;
  glycemicImpactLevel: GlycemicImpactLevel;
  gutHealthScore: number;
  gutDisruptors: GutDisruptor[];
}

export const GlycemicAndGutCard: React.FC<GlycemicAndGutCardProps> = ({
  glycemicIndexEstimate,
  glycemicLoad,
  glycemicImpactLevel,
  gutHealthScore,
  gutDisruptors,
}) => {
  // Glycemic impact color
  const glImpactConfig = {
    Low: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', hex: '#10b981' },
    Moderate: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', hex: '#f59e0b' },
    High: { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', hex: '#ef4444' },
  }[glycemicImpactLevel];

  // Gut gauge color
  const getGutColor = (score: number) => {
    if (score >= 75) return { color: 'text-emerald-500', hex: '#10b981', label: 'Excellent' };
    if (score >= 50) return { color: 'text-amber-500', hex: '#f59e0b', label: 'Fair' };
    if (score >= 25) return { color: 'text-orange-500', hex: '#f97316', label: 'Poor' };
    return { color: 'text-rose-500', hex: '#ef4444', label: 'Critical' };
  };
  const gutConfig = getGutColor(gutHealthScore);

  // SVG glucose curve path
  const generateGlucoseCurve = () => {
    if (glycemicImpactLevel === 'High') {
      // Sharp spike curve
      return 'M 0 80 Q 30 80 50 15 Q 60 0 70 20 Q 90 70 120 78 Q 160 85 200 82';
    } else if (glycemicImpactLevel === 'Moderate') {
      // Moderate hump
      return 'M 0 80 Q 40 75 70 35 Q 90 25 110 45 Q 140 70 170 78 Q 190 82 200 80';
    } else {
      // Gentle sustained curve
      return 'M 0 80 Q 30 78 60 55 Q 90 45 120 50 Q 150 55 180 65 Q 195 72 200 75';
    }
  };

  // Gut gauge arc
  const gaugeRadius = 60;
  const gaugeCircumference = Math.PI * gaugeRadius;
  const gaugeFill = (gutHealthScore / 100) * gaugeCircumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* ════════ GLYCEMIC IMPACT CARD ════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-violet-500/10 text-violet-500">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Glycemic Impact
              </h3>
              <p className="text-[10px] text-slate-400">Blood sugar response estimate</p>
            </div>
          </div>
          <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${glImpactConfig.bg} ${glImpactConfig.color} ${glImpactConfig.border}`}>
            {glycemicImpactLevel} GL
          </span>
        </div>

        {/* GI and GL values */}
        <div className="flex items-center gap-4">
          <div className="flex-1 text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-700/40">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Est. GI</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{glycemicIndexEstimate}</span>
            <span className="text-[10px] text-slate-400 block">/100</span>
          </div>
          <div className={`flex-1 text-center p-3 rounded-2xl border ${glImpactConfig.bg} ${glImpactConfig.border}`}>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Glyc. Load</span>
            <span className={`text-2xl font-black ${glImpactConfig.color}`}>{glycemicLoad}</span>
            <span className="text-[10px] text-slate-400 block">
              {glycemicLoad <= 10 ? '≤ 10 (Low)' : glycemicLoad <= 19 ? '11-19 (Mod)' : '≥ 20 (High)'}
            </span>
          </div>
        </div>

        {/* SVG Glucose Curve */}
        <div className="relative rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-700/40 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold uppercase text-slate-400">Glucose Response Curve</span>
            <span className={`text-[9px] font-bold ${glImpactConfig.color}`}>
              {glycemicImpactLevel === 'High' ? '⚡ Rapid Spike' : glycemicImpactLevel === 'Moderate' ? '〰 Moderate Rise' : '🌿 Sustained Energy'}
            </span>
          </div>
          <svg viewBox="0 0 200 90" className="w-full h-20" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="30" x2="200" y2="30" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="0.5" strokeDasharray="4,4" />
            <line x1="0" y1="55" x2="200" y2="55" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="0.5" strokeDasharray="4,4" />
            {/* Baseline */}
            <line x1="0" y1="80" x2="200" y2="80" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="0.5" />
            {/* Filled area */}
            <path
              d={`${generateGlucoseCurve()} L 200 90 L 0 90 Z`}
              fill={glImpactConfig.hex}
              opacity="0.1"
            />
            {/* Main curve */}
            <motion.path
              d={generateGlucoseCurve()}
              fill="none"
              stroke={glImpactConfig.hex}
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
            {/* Labels */}
            <text x="5" y="88" className="text-[6px] fill-slate-400">0 min</text>
            <text x="90" y="88" className="text-[6px] fill-slate-400">60 min</text>
            <text x="175" y="88" className="text-[6px] fill-slate-400">120 min</text>
          </svg>
        </div>
      </motion.div>

      {/* ════════ GUT MICROBIOME HEALTH CARD ════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-teal-500/10 text-teal-500">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Gut Microbiome Health
              </h3>
              <p className="text-[10px] text-slate-400">Microbiota disruption analysis</p>
            </div>
          </div>
          <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 ${gutConfig.color} border border-slate-200/40 dark:border-slate-700/40`}>
            {gutConfig.label}
          </span>
        </div>

        {/* Semicircle Gauge */}
        <div className="flex flex-col items-center pt-2">
          <svg width="160" height="90" viewBox="0 0 160 90">
            {/* Background arc */}
            <path
              d="M 10 80 A 60 60 0 0 1 150 80"
              fill="none"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-700"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Gradient colored arc */}
            <defs>
              <linearGradient id="gutGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="35%" stopColor="#f97316" />
                <stop offset="65%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <motion.path
              d="M 10 80 A 60 60 0 0 1 150 80"
              fill="none"
              stroke="url(#gutGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={gaugeCircumference}
              strokeDashoffset={gaugeCircumference - gaugeFill}
              initial={{ strokeDashoffset: gaugeCircumference }}
              animate={{ strokeDashoffset: gaugeCircumference - gaugeFill }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            {/* Score text */}
            <text x="80" y="70" textAnchor="middle" className="text-2xl font-black" fill={gutConfig.hex}>
              {gutHealthScore}
            </text>
            <text x="80" y="85" textAnchor="middle" className="text-[8px]" fill="#94a3b8">
              / 100
            </text>
          </svg>
        </div>

        {/* Disruptors List */}
        {gutDisruptors.length > 0 ? (
          <div className="space-y-2 max-h-36 overflow-y-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {gutDisruptors.length} Gut Disruptor{gutDisruptors.length !== 1 ? 's' : ''} Detected
            </span>
            {gutDisruptors.map((d, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/15 flex items-start gap-2.5"
              >
                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md shrink-0 mt-0.5 ${
                  d.risk === 'High' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' :
                  d.risk === 'Moderate' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                  'bg-slate-500/15 text-slate-500'
                }`}>
                  {d.risk}
                </span>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate">
                    {d.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {d.effect}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-center">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              ✓ No gut-disrupting ingredients detected
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
