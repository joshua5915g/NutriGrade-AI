'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Info,
  X,
  Globe,
  ShieldAlert,
  FileText,
  Sparkles,
} from 'lucide-react';

import { Additive } from '../types/nutrition';
import { getAdditiveDossier, AdditiveDossier } from '../lib/data/additivesDatabase';

interface AdditiveInspectorProps {
  additives: Additive[];
}

export const AdditiveInspector: React.FC<AdditiveInspectorProps> = ({ additives }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<AdditiveDossier | null>(null);

  const getRiskColors = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-500/20',
          text: 'text-rose-600 dark:text-rose-400',
          border: 'border-rose-500/30',
          badgeBg: 'bg-rose-500 text-white',
        };
      case 'moderate':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/20',
          text: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-500/30',
          badgeBg: 'bg-amber-500 text-white',
        };
      case 'low':
      default:
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
          text: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-500/30',
          badgeBg: 'bg-emerald-500 text-white',
        };
    }
  };

  return (
    <div className="w-full rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden transition-all">
      {/* Header Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
              Additive Hazard Inspector ({additives.length})
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" title="Toxicological Hazard Dossier (EFSA / WHO Joint Expert Committee on Food Additives)">
                Toxicological Hazard Dossier (EFSA / WHO Joint Expert Committee on Food Additives)
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {additives.length === 0
                ? 'Clean ingredient list free of chemical E-numbers based on EFSA/WHO safety criteria'
                : `${additives.length} additive(s) detected. Click any item to inspect Toxicological Hazard Dossier (EFSA / WHO Joint Expert Committee on Food Additives) safety notes.`}
            </p>
          </div>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-indigo-500' : ''
          }`}
        />
      </button>

      {/* Accordion Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="border-t border-slate-200/60 dark:border-slate-800/60 p-6 bg-slate-50/30 dark:bg-slate-950/30 space-y-4"
          >
            {additives.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Verified clean product free of synthetic food colorants, emulsifiers, or preservatives.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {additives.map((additive, i) => {
                  const dossier = getAdditiveDossier(additive.eNumber || additive.commonName);
                  const colors = getRiskColors(dossier.riskLevel);

                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedDossier(dossier)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-lg flex flex-col justify-between gap-3 ${colors.bg} ${colors.border}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 shadow-xs border border-slate-200/50 dark:border-slate-800/50 text-slate-900 dark:text-slate-100">
                          {dossier.eNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${colors.badgeBg}`}
                        >
                          {dossier.riskLevel} Risk
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {dossier.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                          Category: {dossier.category}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {dossier.summary}
                      </p>

                      <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        <span>Click for WHO/EFSA Safety Dossier</span>
                        <Info className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SLIDE-OVER SCIENTIFIC DOSSIER MODAL */}
      <AnimatePresence>
        {selectedDossier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDossier(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 pr-8">
                <span className="font-mono text-sm font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {selectedDossier.eNumber}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedDossier.name}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Category: {selectedDossier.category}
                  </span>
                </div>
              </div>

              {/* Summary Note */}
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                {selectedDossier.summary}
              </p>

              {/* WHO / EFSA Official Status */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  WHO / EFSA Safety Evaluation
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                  {selectedDossier.whoEfsaStatus}
                </p>
              </div>

              {/* Side Effects & Health Hazards */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Potential Side Effects & Health Hazards
                </span>
                <div className="space-y-1.5">
                  {selectedDossier.sideEffects.map((effect, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs font-medium text-rose-950 dark:text-rose-200 flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{effect}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regulatory Comparison (EU vs USA) */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  Regulatory Restrictions (EU vs. USA)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">🇪🇺 European Union (EFSA)</span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{selectedDossier.regulatoryRestrictions.eu}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">🇺🇸 United States (FDA)</span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{selectedDossier.regulatoryRestrictions.usa}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
