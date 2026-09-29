'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  X,
  Sparkles,
  Camera,
  Search,
  ShieldAlert,
  Activity,
  HeartPulse,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { SampleType } from './SampleDemos';

interface FloatingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPersonalize?: () => void;
  onSelectSample?: (sampleType: SampleType) => void;
}

export const FloatingGuideModal: React.FC<FloatingGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenPersonalize,
  onSelectSample,
}) => {
  const [activeTab, setActiveTab] = useState<'how_it_works' | 'demos' | 'score_key' | 'personalize'>('how_it_works');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleLaunchSample = (sample: SampleType) => {
    if (onSelectSample) {
      onSelectSample(sample);
      onClose();
      // Smooth scroll to top/dashboard area
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-white dark:bg-[#0e1608] border border-slate-200 dark:border-brand-forest/40 rounded-3xl shadow-2xl overflow-hidden z-10 my-auto flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient background glow */}
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-brand-lime/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-brand-forest/20 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="relative px-6 py-5 border-b border-slate-200 dark:border-brand-cream/15 flex items-center justify-between bg-slate-50/80 dark:bg-brand-darkCard/90 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-forest to-brand-lime text-brand-darkBg shadow-md shadow-brand-lime/20">
                  <Sparkles className="w-5 h-5 font-bold" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    NutriGrade AI <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-lime/20 text-brand-lime border border-brand-lime/40 font-extrabold uppercase tracking-wide">Interactive Guide</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-brand-cream/70">
                    Discover how clinical AI grades your food, exposes deceptive claims, and guards your health.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-brand-forest/40 text-slate-500 dark:text-brand-cream/80 transition-colors"
                aria-label="Close guide modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation Pill Bar */}
            <div className="px-6 pt-4 pb-2 bg-slate-100/60 dark:bg-[#0a1104]/80 border-b border-slate-200 dark:border-brand-cream/10">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setActiveTab('how_it_works')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    activeTab === 'how_it_works'
                      ? 'bg-brand-forest text-brand-lime shadow-md border border-brand-lime/30'
                      : 'text-slate-600 dark:text-brand-cream/70 hover:bg-slate-200/60 dark:hover:bg-brand-darkCard'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>1. How It Works</span>
                </button>

                <button
                  onClick={() => setActiveTab('demos')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    activeTab === 'demos'
                      ? 'bg-brand-forest text-brand-lime shadow-md border border-brand-lime/30'
                      : 'text-slate-600 dark:text-brand-cream/70 hover:bg-slate-200/60 dark:hover:bg-brand-darkCard'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>2. Try Live Demos</span>
                  <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
                </button>

                <button
                  onClick={() => setActiveTab('score_key')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    activeTab === 'score_key'
                      ? 'bg-brand-forest text-brand-lime shadow-md border border-brand-lime/30'
                      : 'text-slate-600 dark:text-brand-cream/70 hover:bg-slate-200/60 dark:hover:bg-brand-darkCard'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>3. Scores &amp; Badges Key</span>
                </button>

                <button
                  onClick={() => setActiveTab('personalize')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    activeTab === 'personalize'
                      ? 'bg-brand-forest text-brand-lime shadow-md border border-brand-lime/30'
                      : 'text-slate-600 dark:text-brand-cream/70 hover:bg-slate-200/60 dark:hover:bg-brand-darkCard'
                  }`}
                >
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>4. Medical Safety &amp; Privacy</span>
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: HOW IT WORKS */}
              {activeTab === 'how_it_works' && (
                <div className="space-y-6">
                  <div className="text-center max-w-xl mx-auto space-y-1.5">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      From Food Label to Clinical Truth in 4 Steps
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-brand-cream/80">
                      NutriGrade combines multimodal Vision AI with rigorous European &amp; FDA biological nutrition algorithms.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Step 1 */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-brand-darkCard border border-slate-200/80 dark:border-brand-cream/15 space-y-2 relative overflow-hidden group hover:border-brand-lime/40 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-brand-forest text-brand-lime text-xs font-black flex items-center justify-center">
                            1
                          </span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">Capture or Search</span>
                        </div>
                        <Camera className="w-4 h-4 text-brand-lime" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-brand-cream/75 leading-relaxed">
                        Snap a photo of the nutrition label, scan the barcode, or search any of 3M+ items in the global database.
                      </p>
                      <div className="pt-1 flex items-center gap-2 text-[11px] text-brand-lime font-medium">
                        <span>• Barcode OCR</span>
                        <span>• Multimodal Vision AI</span>
                        <span>• Dual Front/Back Scan</span>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-brand-darkCard border border-slate-200/80 dark:border-brand-cream/15 space-y-2 relative overflow-hidden group hover:border-brand-lime/40 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-brand-forest text-brand-lime text-xs font-black flex items-center justify-center">
                            2
                          </span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">Greenwashing Audit</span>
                        </div>
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-brand-cream/75 leading-relaxed">
                        Cross-references front marketing claims (<em>"All Natural"</em>, <em>"High Protein"</em>) directly against the chemistry on the back panel.
                      </p>
                      <div className="pt-1 flex items-center gap-2 text-[11px] text-amber-400 font-medium">
                        <span>• Marketing Verification</span>
                        <span>• Deceptive Claim Flags</span>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-brand-darkCard border border-slate-200/80 dark:border-brand-cream/15 space-y-2 relative overflow-hidden group hover:border-brand-lime/40 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-brand-forest text-brand-lime text-xs font-black flex items-center justify-center">
                            3
                          </span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">Algorithmic Grading</span>
                        </div>
                        <Activity className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-brand-cream/75 leading-relaxed">
                        Computes official European Nutri-Score (A-E), NOVA Ultra-Processing Group (1-4), Glycemic Load, and Gut Microbiome index.
                      </p>
                      <div className="pt-1 flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                        <span>• Official Nutri-Score</span>
                        <span>• NOVA 1–4</span>
                        <span>• Seed Oil Radar</span>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-brand-darkCard border border-slate-200/80 dark:border-brand-cream/15 space-y-2 relative overflow-hidden group hover:border-brand-lime/40 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-brand-forest text-brand-lime text-xs font-black flex items-center justify-center">
                            4
                          </span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">Personal Health Shield</span>
                        </div>
                        <HeartPulse className="w-4 h-4 text-rose-400" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-brand-cream/75 leading-relaxed">
                        Zero cloud-stored data. Evaluates against your specific conditions: Diabetes, Hypertension, Celiac, or Vegan preferences.
                      </p>
                      <div className="pt-1 flex items-center gap-2 text-[11px] text-rose-400 font-medium">
                        <span>• Clinical Overlays</span>
                        <span>• 100% Local Encryption</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-forest/40 to-brand-darkCard border border-brand-lime/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-brand-cream">
                      <span className="font-bold text-white">Ready to see it in action?</span> Click below to load a simulated 1-click test scan.
                    </div>
                    <button
                      onClick={() => setActiveTab('demos')}
                      className="px-4 py-2 rounded-xl bg-brand-lime text-brand-darkBg font-bold text-xs hover:bg-emerald-300 transition-all flex items-center gap-1.5 shadow-lg active:scale-95 shrink-0"
                    >
                      <span>Try 10-Second Live Demos</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: INSTANT LIVE DEMOS */}
              {activeTab === 'demos' && (
                <div className="space-y-4">
                  <div className="text-center max-w-xl mx-auto space-y-1">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Instant 1-Click Interactive Showcase
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-brand-cream/80">
                      Pick any sample food below. NutriGrade will instantly execute the full vision OCR &amp; health grading pipeline.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {/* Sample 1: Oats */}
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-brand-darkCard border border-emerald-500/30 hover:border-emerald-500/70 transition-all flex flex-col justify-between space-y-4 shadow-lg group">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">🥣</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-black text-xs shadow-sm">
                            Grade A
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          Organic Rolled Oats
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-brand-cream/70 leading-relaxed">
                          Clean single-ingredient whole grain. High beta-glucan fiber, zero added sugar, NOVA Group 1 unprocessed.
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-brand-cream/10 text-[11px]">
                        <div className="flex justify-between text-slate-500 dark:text-brand-cream/60">
                          <span>Nutri-Score:</span>
                          <span className="font-bold text-emerald-400">A (Clean)</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-brand-cream/60">
                          <span>NOVA Level:</span>
                          <span className="font-bold text-emerald-400">1 (Unprocessed)</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-brand-cream/60">
                          <span>Gut Health:</span>
                          <span className="font-bold text-emerald-400">95 / 100</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleLaunchSample('oats')}
                        className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-300 hover:text-white font-bold text-xs transition-all border border-emerald-500/30 flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Run Live Scan</span>
                      </button>
                    </div>

                    {/* Sample 2: Strawberry Yogurt */}
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-brand-darkCard border border-amber-500/30 hover:border-amber-500/70 transition-all flex flex-col justify-between space-y-4 shadow-lg group">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">🍓</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-900 font-black text-xs shadow-sm">
                            Grade C
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          Strawberry Fruit Yogurt
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-brand-cream/70 leading-relaxed">
                          Front claims <em>"Real Fruit"</em>, but back panel unmasks 13g sugar, modified corn starch, and Carmine (E120) colorant.
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-brand-cream/10 text-[11px]">
                        <div className="flex justify-between text-slate-500 dark:text-brand-cream/60">
                          <span>Nutri-Score:</span>
                          <span className="font-bold text-amber-400">C (Moderate)</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-brand-cream/60">
                          <span>NOVA Level:</span>
                          <span className="font-bold text-amber-400">4 (Ultra-Processed)</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-brand-cream/60">
                          <span>Greenwashing:</span>
                          <span className="font-bold text-rose-400">Misleading Fruit Claim</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleLaunchSample('yogurt')}
                        className="w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-slate-900 font-bold text-xs transition-all border border-amber-500/30 flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Run Live Scan</span>
                      </button>
                    </div>

                    {/* Sample 3: Chocolate Drink */}
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-brand-darkCard border border-rose-500/30 hover:border-rose-500/70 transition-all flex flex-col justify-between space-y-4 shadow-lg group">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">🍫</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-xs shadow-sm">
                            Grade E
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          Sugary Chocolate Drink
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-brand-cream/70 leading-relaxed">
                          34g sugar per 100g, High Fructose Corn Syrup, Carrageenan (E407), and preservative Sodium Benzoate (E211).
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-brand-cream/10 text-[11px]">
                        <div className="flex justify-between text-slate-500 dark:text-brand-cream/60">
                          <span>Nutri-Score:</span>
                          <span className="font-bold text-rose-500">E (Hazardous)</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-brand-cream/60">
                          <span>NOVA Level:</span>
                          <span className="font-bold text-rose-500">4 (Ultra-Processed)</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-brand-cream/60">
                          <span>Gut Toxicity:</span>
                          <span className="font-bold text-rose-500">High Risk (E407)</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleLaunchSample('chocolate_milk')}
                        className="w-full py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-700 dark:text-rose-300 hover:text-white font-bold text-xs transition-all border border-rose-500/30 flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Run Live Scan</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SCORECARD & BADGES KEY */}
              {activeTab === 'score_key' && (
                <div className="space-y-6">
                  {/* Nutri-Score Explanation */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-brand-darkCard border border-slate-200 dark:border-brand-cream/15 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        European Nutri-Score Standard (A to E)
                      </h4>
                      <span className="text-[10px] text-slate-400">Santé Publique France Algorithm</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-brand-cream/75 leading-relaxed">
                      Balances negative nutrient density (excess calories, saturated fat, simple sugars, sodium) against positive components (fiber, protein, fruit/vegetable percentage).
                    </p>

                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      <div className="p-2 rounded-xl bg-[#008B4C]/20 border border-[#008B4C] text-center">
                        <span className="block font-black text-[#008B4C] text-base">A</span>
                        <span className="text-[9px] font-semibold text-slate-600 dark:text-brand-cream/80">Excellent</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#80BB2D]/20 border border-[#80BB2D] text-center">
                        <span className="block font-black text-[#80BB2D] text-base">B</span>
                        <span className="text-[9px] font-semibold text-slate-600 dark:text-brand-cream/80">Good</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#FECB02]/20 border border-[#FECB02] text-center">
                        <span className="block font-black text-[#FECB02] text-base">C</span>
                        <span className="text-[9px] font-semibold text-slate-600 dark:text-brand-cream/80">Moderate</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#EE8100]/20 border border-[#EE8100] text-center">
                        <span className="block font-black text-[#EE8100] text-base">D</span>
                        <span className="text-[9px] font-semibold text-slate-600 dark:text-brand-cream/80">Poor</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#E63312]/20 border border-[#E63312] text-center">
                        <span className="block font-black text-[#E63312] text-base">E</span>
                        <span className="text-[9px] font-semibold text-slate-600 dark:text-brand-cream/80">Hazardous</span>
                      </div>
                    </div>
                  </div>

                  {/* NOVA Processing Classification */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-brand-darkCard border border-slate-200 dark:border-brand-cream/15 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-brand-lime" />
                        NOVA Food Processing Classification (1 to 4)
                      </h4>
                      <span className="text-[10px] text-slate-400">Univ. of São Paulo Standard</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
                        <span className="font-bold text-emerald-400">NOVA 1: Unprocessed / Minimally Processed</span>
                        <p className="text-[11px] text-slate-600 dark:text-brand-cream/70">Whole foods: fresh oats, raw fruits, clean pasteurized milk.</p>
                      </div>

                      <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/25 space-y-1">
                        <span className="font-bold text-teal-400">NOVA 2: Culinary Ingredients</span>
                        <p className="text-[11px] text-slate-600 dark:text-brand-cream/70">Pressed olive oil, natural butter, sea salt, cane sugar.</p>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                        <span className="font-bold text-amber-400">NOVA 3: Processed Foods</span>
                        <p className="text-[11px] text-slate-600 dark:text-brand-cream/70">Canned vegetables, artisanal cheeses, fresh bakery breads.</p>
                      </div>

                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1">
                        <span className="font-bold text-rose-400">NOVA 4: Ultra-Processed Formulations</span>
                        <p className="text-[11px] text-slate-600 dark:text-brand-cream/70">Industrial additives: emulsifiers, high-fructose corn syrup, artificial colors.</p>
                      </div>
                    </div>
                  </div>

                  {/* Biological Radars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-brand-darkCard border border-slate-200 dark:border-brand-cream/15 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-rose-400" />
                        Seed Oil &amp; Inflammatory Fat Radar
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-brand-cream/70">
                        Flags high-heat solvent-extracted seed oils (Canola, Soybean, Cottonseed) with high Omega-6 linoleic acid ratios.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-brand-darkCard border border-slate-200 dark:border-brand-cream/15 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        Hidden Sugar Radar
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-brand-cream/70">
                        Detects over 60+ deceptive aliases like Maltodextrin, Dextrose, Invert Sugar, Agave Nectar, and Rice Syrup.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MEDICAL SAFETY & PERSONALIZATION */}
              {activeTab === 'personalize' && (
                <div className="space-y-5">
                  <div className="text-center max-w-xl mx-auto space-y-1">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      100% Private, Client-Side Health Filters
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-brand-cream/80">
                      Your medical conditions and dietary preferences never leave your device. All calculations execute locally.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-brand-darkCard border border-slate-200 dark:border-brand-cream/15 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <span className="text-base">🩸</span>
                        <span>Diabetes &amp; Glycemic Alert</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-brand-cream/70">
                        Flags products with a Glycemic Load &gt; 10 or high rapid-acting carbohydrate density.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-brand-darkCard border border-slate-200 dark:border-brand-cream/15 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <span className="text-base">🫀</span>
                        <span>Hypertension &amp; Sodium Alert</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-brand-cream/70">
                        Flags foods exceeding strict daily cardiovascular sodium thresholds (over 400mg/serving).
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-brand-darkCard border border-slate-200 dark:border-brand-cream/15 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <span className="text-base">🌾</span>
                        <span>Celiac &amp; Gluten Shield</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-brand-cream/70">
                        Identifies wheat, rye, barley, malt, spelt, and hidden cross-contamination warnings.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-brand-darkCard border border-slate-200 dark:border-brand-cream/15 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <span className="text-base">🌱</span>
                        <span>Dietary Compatibility</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-brand-cream/70">
                        Checks for Vegan, Vegetarian, Dairy/Lactose, Pork Derivatives, and Palm Oil avoidance.
                      </p>
                    </div>
                  </div>

                  {onOpenPersonalize && (
                    <div className="pt-2 text-center">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenPersonalize();
                        }}
                        className="px-6 py-3 rounded-2xl bg-brand-forest hover:bg-emerald-700 text-brand-lime font-bold text-xs transition-all border border-brand-lime/40 shadow-lg inline-flex items-center gap-2 active:scale-95"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Open Personalize My Scan Settings</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 dark:border-brand-cream/15 bg-slate-50/80 dark:bg-brand-darkCard/90 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <div className="text-slate-500 dark:text-brand-cream/60 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-brand-lime" />
                <span>NutriGrade uses deterministic algorithms based on published clinical guidelines.</span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-brand-forest/30 hover:bg-slate-300 dark:hover:bg-brand-forest/60 text-slate-700 dark:text-brand-cream font-bold transition-all text-xs"
              >
                Got It, Let&apos;s Explore
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface FloatingGuideButtonProps {
  onOpen: () => void;
}

export const FloatingGuideButton: React.FC<FloatingGuideButtonProps> = ({ onOpen }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show first-time welcome tooltip after 1.5 seconds if user hasn't seen it yet
    if (typeof window !== 'undefined') {
      const hasSeenPrompt = localStorage.getItem('nutrigrade_guide_seen');
      if (!hasSeenPrompt) {
        const timer = setTimeout(() => {
          setShowTooltip(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleDismissTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nutrigrade_guide_seen', 'true');
    }
  };

  const handleButtonClick = () => {
    setShowTooltip(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nutrigrade_guide_seen', 'true');
    }
    onOpen();
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Floating First-Time Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-3 max-w-xs p-3.5 rounded-2xl bg-white dark:bg-[#121c0b] border border-brand-lime/40 shadow-2xl text-slate-900 dark:text-white text-xs relative backdrop-blur-xl"
            onClick={handleButtonClick}
          >
            <button
              onClick={handleDismissTooltip}
              className="absolute top-2 right-2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              aria-label="Dismiss guide prompt"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-start gap-2.5 pr-4">
              <div className="p-1.5 rounded-xl bg-brand-forest text-brand-lime shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[13px] text-brand-lime">New to NutriGrade?</p>
                <p className="text-[11px] text-slate-600 dark:text-brand-cream/80 leading-snug">
                  Click here for a 30-second interactive preview and 1-click live sample scans!
                </p>
              </div>
            </div>
            {/* Arrow pointer */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white dark:bg-[#121c0b] border-b border-r border-brand-lime/40 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Floating Glow Pill Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleButtonClick}
        className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/90 dark:bg-brand-darkCard/95 backdrop-blur-xl border border-brand-lime/40 hover:border-brand-lime text-white dark:text-brand-lime shadow-xl shadow-brand-forest/30 transition-all cursor-pointer overflow-hidden"
        aria-label="Open NutriGrade Guide and Interactive Preview"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-lime/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <div className="relative flex items-center gap-2">
          <div className="p-1 rounded-full bg-brand-forest text-brand-lime">
            <HelpCircle className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs tracking-tight">How It Works &amp; Guide</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-lime opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-lime" />
          </span>
        </div>
      </motion.button>
    </div>
  );
};
