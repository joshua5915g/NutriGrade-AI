'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Flame,
  CheckCircle2,
  Factory,
  UserX,
} from 'lucide-react';
import { AllergenScanResult, DetectedAllergen } from '../lib/algorithms/allergenMatrix';

interface AllergenMatrixCardProps {
  allergenScan: AllergenScanResult;
}

export const AllergenMatrixCard: React.FC<AllergenMatrixCardProps> = ({ allergenScan }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasHighRisk = allergenScan.detectedAllergens.some(
    (d) => d.allergen.severity === 'high_anaphylaxis' && d.presence === 'DIRECT'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-6 backdrop-blur-xl border transition-all shadow-xl space-y-5 ${
        allergenScan.personalConflictCount > 0
          ? 'bg-rose-500/10 border-rose-500/50 ring-2 ring-rose-500/20'
          : allergenScan.hasDirectAllergens
          ? 'bg-amber-500/10 border-amber-500/30'
          : allergenScan.hasCrossContamination
          ? 'bg-amber-500/5 border-amber-500/20'
          : 'bg-emerald-500/10 border-emerald-500/30'
      }`}
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
              allergenScan.personalConflictCount > 0 || hasHighRisk
                ? 'bg-rose-500/20 text-rose-500'
                : allergenScan.hasDirectAllergens
                ? 'bg-amber-500/20 text-amber-500'
                : 'bg-emerald-500/20 text-emerald-500'
            }`}
          >
            {allergenScan.personalConflictCount > 0 ? (
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            ) : allergenScan.hasDirectAllergens ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                FDA Big-9 & EU-14 Matrix
              </span>
              {allergenScan.personalConflictCount > 0 && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                  Personal Conflict
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              Allergen & Cross-Contamination Scanner
            </h3>
          </div>
        </div>

        {/* SUMMARY BADGES */}
        <div className="flex flex-wrap items-center gap-2">
          {allergenScan.totalDirectCount > 0 && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              {allergenScan.totalDirectCount} Direct Allergen{allergenScan.totalDirectCount > 1 ? 's' : ''}
            </span>
          )}
          {allergenScan.totalCrossCount > 0 && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Factory className="w-3.5 h-3.5" />
              {allergenScan.totalCrossCount} Facility Warning{allergenScan.totalCrossCount > 1 ? 's' : ''}
            </span>
          )}
          {allergenScan.detectedAllergens.length === 0 && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Big-9 Safe
            </span>
          )}
        </div>
      </div>

      {/* PERSONAL PROFILE CONFLICT BANNER */}
      {allergenScan.personalConflictCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
          <UserX className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500 animate-bounce" />
          <div>
            <p className="font-black text-rose-900 dark:text-rose-100">
              Warning: Direct conflict with your active dietary profile!
            </p>
            <p className="text-xs mt-0.5 opacity-90">
              This product contains ingredients that violate your saved medical conditions or allergen preferences (e.g. Celiac gluten-free, lactose intolerance, or soy-free).
            </p>
          </div>
        </div>
      )}

      {/* SUMMARY NOTE */}
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
        {allergenScan.summaryNote}
      </p>

      {/* DETECTED ALLERGEN CARDS */}
      {allergenScan.detectedAllergens.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Detected Allergen Triggers ({allergenScan.detectedAllergens.length})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allergenScan.detectedAllergens.map((item) => (
              <div
                key={item.allergen.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.isPersonalConflict
                    ? 'bg-rose-500/15 border-rose-500/40 shadow-sm'
                    : item.presence === 'DIRECT'
                    ? 'bg-slate-900/5 dark:bg-white/5 border-slate-200 dark:border-slate-800'
                    : 'bg-amber-500/5 border-amber-500/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.allergen.icon}</span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {item.allergen.name}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      item.presence === 'DIRECT'
                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {item.presence === 'DIRECT' ? 'Recipe Ingredient' : 'Shared Equipment'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                  {item.warningNote}
                </p>

                {item.matchedTerms.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-400">Found:</span>
                    {item.matchedTerms.map((term, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXPANDABLE CERTIFIED ALLERGEN-FREE MATRIX */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Verified Allergen-Free List ({allergenScan.safeAllergens.length} Cleared)
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3 space-y-3"
            >
              <div className="flex flex-wrap gap-2">
                {allergenScan.safeAllergens.map((safe) => (
                  <div
                    key={safe.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-300"
                  >
                    <span>{safe.icon}</span>
                    <span>No {safe.name}</span>
                  </div>
                ))}
              </div>

              {allergenScan.advisoryTextFound.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-bold block mb-1">Manufacturer Statement Excerpt:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {allergenScan.advisoryTextFound.map((text, i) => (
                      <li key={i}>{text}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
