'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldBan,
  Candy,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Ban,
  Info,
  Shell,
} from 'lucide-react';

import type { RegulatoryAlert, HiddenSugar, AllergenWarning } from '../types/nutrition';

interface RegulatoryAndHiddenSugarsCardProps {
  regulatoryAlerts: RegulatoryAlert[];
  hiddenSugars: HiddenSugar[];
  allergenWarnings: AllergenWarning[];
}

export const RegulatoryAndHiddenSugarsCard: React.FC<RegulatoryAndHiddenSugarsCardProps> = ({
  regulatoryAlerts,
  hiddenSugars,
  allergenWarnings,
}) => {
  const [isSugarDrawerOpen, setIsSugarDrawerOpen] = useState(false);

  const hasAnyContent = regulatoryAlerts.length > 0 || hiddenSugars.length > 0 || allergenWarnings.length > 0;
  if (!hasAnyContent) return null;

  const statusConfig = {
    Banned: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20', pillBg: 'bg-rose-500', pillText: 'text-white' },
    Restricted: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', pillBg: 'bg-amber-500', pillText: 'text-white' },
    Warning: { bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-500/20', pillBg: 'bg-sky-500', pillText: 'text-white' },
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ════════ 1. REGULATORY ALERTS BANNER ════════ */}
      {regulatoryAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 shadow-xl space-y-5"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500">
              <ShieldBan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Regulatory Safety Alerts
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  {regulatoryAlerts.length} Flagged
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ingredients banned or restricted in EU / FDA jurisdictions
              </p>
            </div>
          </div>

          {/* Alert Pills Summary */}
          <div className="flex flex-wrap gap-2">
            {regulatoryAlerts.map((alert, idx) => {
              const config = statusConfig[alert.status];
              return (
                <span
                  key={idx}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${config.pillBg} ${config.pillText} shadow-sm`}
                >
                  {alert.status === 'Banned' ? '🚫' : alert.status === 'Restricted' ? '⚠️' : 'ℹ️'} {alert.ingredient} — {alert.region}
                </span>
              );
            })}
          </div>

          {/* Detailed Alert Cards */}
          <div className="space-y-3">
            {regulatoryAlerts.map((alert, idx) => {
              const config = statusConfig[alert.status];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${config.bg} ${config.border}`}
                >
                  <Ban className={`w-5 h-5 shrink-0 mt-0.5 ${config.text}`} />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold text-sm ${config.text}`}>{alert.ingredient}</span>
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
                        {alert.status}
                      </span>
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20">
                        {alert.region}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed opacity-90 ${config.text}`}>
                      {alert.reason}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ════════ 2. HIDDEN SUGAR UNMASKER ════════ */}
      {hiddenSugars.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 shadow-xl space-y-4"
        >
          {/* Header + Expand Toggle */}
          <button
            onClick={() => setIsSugarDrawerOpen(!isSugarDrawerOpen)}
            className="w-full flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-pink-500/10 text-pink-500">
                <Candy className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Hidden Sugar Unmasker
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20">
                    {hiddenSugars.length} Found
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sugar aliases detected under non-obvious ingredient names
                </p>
              </div>
            </div>
            <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-all">
              {isSugarDrawerOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </div>
          </button>

          {/* Summary Pill Row (Always visible) */}
          <div className="flex flex-wrap gap-1.5">
            {hiddenSugars.slice(0, isSugarDrawerOpen ? hiddenSugars.length : 6).map((sugar, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/15 capitalize"
              >
                🍬 {sugar.alias}
              </span>
            ))}
            {!isSugarDrawerOpen && hiddenSugars.length > 6 && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                +{hiddenSugars.length - 6} more
              </span>
            )}
          </div>

          {/* Expanded Drawer */}
          <AnimatePresence>
            {isSugarDrawerOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {hiddenSugars.map((sugar, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-pink-500/5 border border-pink-500/10 flex items-center gap-3"
                    >
                      <span className="text-lg">🍬</span>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white capitalize block truncate">
                          {sugar.alias}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                          = {sugar.common_name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                    These ingredients are all forms of added sugar but appear under scientific, marketing, or regional names that most consumers don't recognize. A single product can contain 5+ different sugar types to avoid listing "sugar" as the #1 ingredient.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ════════ 3. ALLERGEN RADAR BANNER ════════ */}
      {allergenWarnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 shadow-xl space-y-4"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-500">
              <Shell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Allergen Radar
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  {allergenWarnings.length} Detected
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Major EU (14) and FDA Big-9 allergen detection
              </p>
            </div>
          </div>

          {/* Allergen Warning List */}
          <div className="space-y-2">
            {allergenWarnings.map((aw, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                  aw.severity === 'High'
                    ? 'bg-rose-500/5 border-rose-500/15'
                    : 'bg-amber-500/5 border-amber-500/15'
                }`}
              >
                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                  aw.severity === 'High' ? 'text-rose-500' : 'text-amber-500'
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {aw.type}
                    </span>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      aw.severity === 'High'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    }`}>
                      {aw.severity} Severity
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {aw.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Cross-contamination Fine Print */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-700/40 text-center">
            <span className="text-[10px] text-slate-400 italic">
              ⚠ This analysis is based on declared ingredients only. Cross-contamination from shared manufacturing facilities may pose additional allergen risks. Always verify "May contain" statements on physical packaging.
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
