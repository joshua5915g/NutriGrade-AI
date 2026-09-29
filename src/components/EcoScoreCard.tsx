'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Leaf,
  Droplets,
  TreeDeciduous,
  Recycle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Car,
} from 'lucide-react';
import { EcoScoreResult, EcoGrade } from '../lib/algorithms/ecoScoreEngine';

interface EcoScoreCardProps {
  ecoResult: EcoScoreResult;
}

const ECO_GRADE_CONFIG: Record<
  EcoGrade,
  { bg: string; text: string; badgeBg: string; border: string; label: string }
> = {
  A: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-[#1E7D32]',
    border: 'border-emerald-500/30',
    label: 'Very Low Environmental Impact',
  },
  B: {
    bg: 'bg-teal-500/10',
    text: 'text-teal-600 dark:text-teal-400',
    badgeBg: 'bg-[#2E7D32]',
    border: 'border-teal-500/30',
    label: 'Low Environmental Impact',
  },
  C: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-[#F9A825]',
    border: 'border-amber-500/30',
    label: 'Moderate Environmental Impact',
  },
  D: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    badgeBg: 'bg-[#EF6C00]',
    border: 'border-orange-500/30',
    label: 'High Environmental Impact',
  },
  E: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-[#C62828]',
    border: 'border-rose-500/30',
    label: 'Severe Environmental Impact',
  },
};

export const EcoScoreCard: React.FC<EcoScoreCardProps> = ({ ecoResult }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = ECO_GRADE_CONFIG[ecoResult.grade];

  // Car distance equivalent (average gas car: 0.12 kg CO2 / km)
  const carKm = (ecoResult.co2PerServing / 0.12).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-6 backdrop-blur-xl border transition-all ${config.bg} ${config.border} shadow-xl space-y-5`}
    >
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-forest/20 text-brand-lime border border-brand-lime/30">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-brand-cream/70">
                Planetary Health Index
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-brand-darkBg text-slate-600 dark:text-brand-cream font-semibold">
                Eco-Score
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Environmental Impact: <span className={config.text}>Grade {ecoResult.grade}</span>
            </h3>
          </div>
        </div>

        {/* 5-Color Eco-Score Official Strip */}
        <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-white/60 dark:bg-brand-darkCard/60 border border-slate-200/50 dark:border-brand-cream/15 self-start sm:self-auto">
          {(['A', 'B', 'C', 'D', 'E'] as EcoGrade[]).map((letter) => {
            const isTarget = ecoResult.grade === letter;
            return (
              <div
                key={letter}
                className={`w-7 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-all ${
                  isTarget
                    ? `${ECO_GRADE_CONFIG[letter].badgeBg} text-white shadow-md scale-110 z-10`
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 opacity-40'
                }`}
              >
                {letter}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 dark:text-brand-cream/80 leading-relaxed">
        {ecoResult.summary}
      </p>

      {/* METRICS PILL GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Carbon Footprint */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-brand-darkCard/70 border border-slate-200/50 dark:border-brand-cream/10 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-brand-cream/60 text-[11px] font-bold uppercase">
            <Leaf className="w-3.5 h-3.5 text-brand-lime" />
            <span>Carbon Footprint</span>
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white">
            {ecoResult.co2PerKg} <span className="text-xs font-normal text-slate-400">kg CO₂/kg</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-brand-cream/70 flex items-center gap-1">
            <Car className="w-3 h-3 text-slate-400" /> ~{carKm} km gas car equiv./serving
          </span>
        </div>

        {/* Freshwater Demand */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-brand-darkCard/70 border border-slate-200/50 dark:border-brand-cream/10 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-brand-cream/60 text-[11px] font-bold uppercase">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span>Water Footprint</span>
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white">
            {ecoResult.waterFootprint} Demand
          </div>
          <span className="text-[10px] text-slate-500 dark:text-brand-cream/70">
            {ecoResult.waterFootprint === 'Minimal'
              ? 'Low freshwater depletion'
              : 'Requires irrigation during agricultural phase'}
          </span>
        </div>

        {/* Packaging Recyclability */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-brand-darkCard/70 border border-slate-200/50 dark:border-brand-cream/10 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-brand-cream/60 text-[11px] font-bold uppercase">
            <Recycle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Packaging</span>
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white truncate">
            {ecoResult.packagingAssessment.material}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-brand-cream/70">
            {ecoResult.packagingAssessment.recyclable ? '✅ Curbside Recyclable' : '⚠️ Difficult to recycle'}
          </span>
        </div>
      </div>

      {/* DEFORESTATION WARNING BANNER */}
      {ecoResult.deforestationRisk.detected && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-900 dark:text-rose-200 font-medium">
          <TreeDeciduous className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block uppercase tracking-wider text-[11px]">
              Deforestation &amp; Habitat Threat Detected:
            </span>
            <span>{ecoResult.deforestationRisk.reason}</span>
          </div>
        </div>
      )}

      {/* EXPANDABLE ACCORDION: ECO BONUSES & PENALTIES */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-brand-cream/80 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
            <span>View Detailed Lifecycle Factors &amp; Recycling Guide</span>
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 space-y-3 overflow-hidden text-xs"
            >
              {/* Bonuses */}
              {ecoResult.ecoBonuses.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider text-[10px]">
                    Positive Planetary Credits:
                  </span>
                  {ecoResult.ecoBonuses.map((bonus, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-brand-cream/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{bonus}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Penalties */}
              {ecoResult.ecoPenalties.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400 block uppercase tracking-wider text-[10px]">
                    Ecological Impact Penalties:
                  </span>
                  {ecoResult.ecoPenalties.map((penalty, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-brand-cream/90">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>{penalty}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recycling Guide */}
              <div className="p-3 rounded-xl bg-white/60 dark:bg-brand-darkCard/60 border border-slate-200/50 dark:border-brand-cream/10 text-slate-600 dark:text-brand-cream/80 text-[11px] leading-relaxed">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  ♻️ Disposal Tip:
                </span>
                {ecoResult.packagingAssessment.tip}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
