'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PackageCheck,
  Trash2,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Plus,
  RefreshCw,
  Award,
  Flame,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react';

import {
  PantryItem,
  PantryStats,
  getPantryItems,
  getPantryStats,
  removeFromPantry,
  clearPantry,
  addToPantry,
} from '../lib/storage/pantryStore';
import { NutriScoreGrade } from '../types/nutrition';
import { HealthySwaps } from './HealthySwaps';

interface PantryViewProps {
  onNavigateHome?: () => void;
}

const GRADE_HEX: Record<NutriScoreGrade, string> = {
  A: '#008B4C',
  B: '#80BB2D',
  C: '#F5C400',
  D: '#E77B00',
  E: '#E63312',
};

const GRADE_BG_CLASS: Record<NutriScoreGrade, string> = {
  A: 'bg-[#008B4C] text-white',
  B: 'bg-[#80BB2D] text-white',
  C: 'bg-[#F5C400] text-slate-900',
  D: 'bg-[#E77B00] text-white',
  E: 'bg-[#E63312] text-white',
};

export const PantryView: React.FC<PantryViewProps> = ({ onNavigateHome }) => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [stats, setStats] = useState<PantryStats | null>(null);
  const [selectedSwapProduct, setSelectedSwapProduct] = useState<{
    name: string;
    grade: NutriScoreGrade;
  } | null>(null);

  const refreshData = () => {
    setItems(getPantryItems());
    setStats(getPantryStats());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleRemove = (id: string) => {
    removeFromPantry(id);
    refreshData();
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your entire household pantry?')) {
      clearPantry();
      refreshData();
    }
  };

  // Pre-fill sample pantry items for 1-click test drive if empty
  const handleSeedDemoPantry = () => {
    const demoItems = [
      {
        name: 'Organic Rolled Oats',
        grade: 'A' as NutriScoreGrade,
        score: -4,
        nova: 1 as const,
        cals: 379,
        sugars: 1.0,
        fat: 7.0,
        sodium: 2,
        protein: 13,
        fiber: 10,
      },
      {
        name: 'Greek Yogurt Plain',
        grade: 'A' as NutriScoreGrade,
        score: -2,
        nova: 1 as const,
        cals: 97,
        sugars: 4.0,
        fat: 5.0,
        sodium: 40,
        protein: 9,
        fiber: 0,
      },
      {
        name: 'Whole Grain Bread',
        grade: 'B' as NutriScoreGrade,
        score: 1,
        nova: 3 as const,
        cals: 247,
        sugars: 4.2,
        fat: 3.4,
        sodium: 380,
        protein: 12,
        fiber: 7,
      },
      {
        name: 'Fruit Yogurt Snack',
        grade: 'C' as NutriScoreGrade,
        score: 6,
        nova: 4 as const,
        cals: 110,
        sugars: 14.5,
        fat: 2.5,
        sodium: 65,
        protein: 3.5,
        fiber: 0,
      },
      {
        name: 'Chocolate Flavored Milk',
        grade: 'E' as NutriScoreGrade,
        score: 22,
        nova: 4 as const,
        cals: 420,
        sugars: 34.0,
        fat: 3.5,
        sodium: 480,
        protein: 3,
        fiber: 0,
      },
      {
        name: 'Instant Ramen Soup',
        grade: 'E' as NutriScoreGrade,
        score: 28,
        nova: 4 as const,
        cals: 450,
        sugars: 3.0,
        fat: 20.0,
        sodium: 1800,
        protein: 9,
        fiber: 1.5,
      },
    ];

    demoItems.forEach((d) => {
      addToPantry(
        {
          normalizedData: {
            calories_per_100g: d.cals,
            total_fat_per_100g: d.fat,
            saturated_fat_per_100g: d.fat * 0.4,
            trans_fat_per_100g: 0,
            sugars_per_100g: d.sugars,
            added_sugars_per_100g: d.sugars * 0.8,
            sodium_mg_per_100g: d.sodium,
            fiber_per_100g: d.fiber,
            protein_per_100g: d.protein,
          },
          nutriScore: {
            score: d.score,
            grade: d.grade,
            negativePoints: { energy: 4, sugars: 3, saturated_fat: 2, sodium: 3 },
            positivePoints: { fiber: 3, protein: 4, fruit_veg_pct: 0 },
          },
          novaGroup: d.nova,
          additives: [],
          healthWarnings: d.nova === 4 ? ['Ultra-processed product'] : [],
          explanation: `Sample audit item ${d.name}.`,
          glycemic_index_estimate: 55,
          glycemic_load: Math.round((d.sugars * 55) / 100),
          glycemic_impact_level: d.sugars > 15 ? 'High' : 'Low',
          gut_health_score: d.nova === 4 ? 45 : 90,
          gut_disruptors_detected: [],
          hidden_sugars_found: [],
          regulatory_alerts: [],
          allergen_warnings: [],
        },
        d.name
      );
    });

    refreshData();
  };

  if (!stats) return null;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 font-semibold text-xs border border-indigo-500/20 mb-2">
            <PackageCheck className="w-4 h-4" />
            <span>Household Pantry Audit</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Pantry Health Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time audit of all food products stored in your kitchen cabinet
          </p>
        </div>

        <div className="flex items-center gap-3">
          {items.length === 0 && (
            <button
              onClick={handleSeedDemoPantry}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Load Sample Pantry Items
            </button>
          )}

          {items.length > 0 && (
            <button
              onClick={handleClear}
              className="px-4 py-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all font-semibold text-xs flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Pantry
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        /* EMPTY STATE CARD */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-12 text-center shadow-xl space-y-5"
        >
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center">
            <PackageCheck className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Your Pantry is Empty
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Scan product labels on the main scanner screen and click <strong>"Add to Pantry"</strong> to start building your kitchen audit score.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleSeedDemoPantry}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Load Sample Pantry Audit
            </button>
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-xs transition-all flex items-center gap-2"
              >
                <span>Scan Food Item Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <>
          {/* 1. PANTRY HEALTH OVERVIEW HERO CARD */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Health Score Hero Badge Card */}
            <div className="lg:col-span-2 rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 shadow-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 text-center md:text-left flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Overall Pantry Health Index
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                  Pantry Grade: <span style={{ color: GRADE_HEX[stats.letterGrade] }}>Grade {stats.letterGrade}</span>
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                  Your kitchen contains <strong>{stats.totalItems} saved products</strong> with a composite health score of <strong>{stats.healthScore}/100</strong>.
                </p>

                <div className="flex items-center gap-4 pt-2">
                  <div className="px-3.5 py-1.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{stats.nova4Percentage}% Ultra-Processed (NOVA 4)</span>
                  </div>
                </div>
              </div>

              {/* Big Score Radial Badge */}
              <div className="shrink-0 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-700/40 min-w-[160px] text-center">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-xl mb-2"
                  style={{ backgroundColor: GRADE_HEX[stats.letterGrade] }}
                >
                  {stats.letterGrade}
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.healthScore}<span className="text-sm font-normal text-slate-400">/100</span>
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Health Score
                </span>
              </div>
            </div>

            {/* Quick Metrics Column */}
            <div className="space-y-4">
              <div className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block">Total Audited Items</span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalItems}</span>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                  <PackageCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block">Ultra-Processed Foods</span>
                  <span className="text-3xl font-black text-rose-500">{stats.nova4Percentage}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                  <Flame className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. VISUAL GRADE DISTRIBUTION BAR */}
          <div className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                Pantry Grade Distribution
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {stats.totalItems} Total Products
              </span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="h-6 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
              {(['A', 'B', 'C', 'D', 'E'] as const).map((grade) => {
                const pct = stats.gradeDistribution[grade].percentage;
                if (pct === 0) return null;
                return (
                  <div
                    key={grade}
                    style={{ width: `${pct}%`, backgroundColor: GRADE_HEX[grade] }}
                    className="h-full flex items-center justify-center text-[10px] font-black text-white transition-all duration-500"
                    title={`Grade ${grade}: ${pct}% (${stats.gradeDistribution[grade].count} items)`}
                  >
                    {pct >= 8 ? `${grade} ${pct}%` : ''}
                  </div>
                );
              })}
            </div>

            {/* Legend Pills */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {(['A', 'B', 'C', 'D', 'E'] as const).map((grade) => {
                const data = stats.gradeDistribution[grade];
                return (
                  <div
                    key={grade}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-700/40 text-center"
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: GRADE_HEX[grade] }}
                      />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Grade {grade}
                      </span>
                    </div>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 block">
                      {data.count} <span className="text-[10px] font-normal text-slate-400">({data.percentage}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. "CLEAR THE CABINET" SECTION (WORST ITEMS WITH HEALTHIER REPLACEMENT TRIGGER) */}
          {stats.worstItems.length > 0 && (
            <div className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-rose-500/20 p-6 md:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Clear the Cabinet
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        Priority Replacements
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Lowest-rated food products currently in your pantry that harm your audit score
                    </p>
                  </div>
                </div>
              </div>

              {/* Worst items list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.worstItems.map((item) => {
                  const grade = item.analysis.nutriScore.grade;
                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/15 flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                            {item.productName}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {item.analysis.normalizedData.calories_per_100g} kcal · Sugars: {item.analysis.normalizedData.sugars_per_100g}g
                          </span>
                        </div>
                        <div
                          className={`w-9 h-9 rounded-xl ${GRADE_BG_CLASS[grade]} flex items-center justify-center font-black text-sm shrink-0 shadow-md`}
                        >
                          {grade}
                        </div>
                      </div>

                      {item.analysis.novaGroup === 4 && (
                        <div className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-500 text-[10px] font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          <span>NOVA 4 Ultra-Processed</span>
                        </div>
                      )}

                      <button
                        onClick={() =>
                          setSelectedSwapProduct({
                            name: item.productName,
                            grade: item.analysis.nutriScore.grade,
                          })
                        }
                        className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Find Healthier Replacement</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* HEALTHY SWAP MODAL / INLINE RECOMMENDATION */}
          <AnimatePresence>
            {selectedSwapProduct && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Recommended Swaps for "{selectedSwapProduct.name}"
                  </span>
                  <button
                    onClick={() => setSelectedSwapProduct(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 underline"
                  >
                    Close Swaps
                  </button>
                </div>
                <HealthySwaps
                  productName={selectedSwapProduct.name}
                  currentGrade={selectedSwapProduct.grade}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4. CLEANEST ITEMS IN PANTRY */}
          {stats.cleanestItems.length > 0 && (
            <div className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-emerald-500/20 p-6 md:p-8 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Pantry MVP Champions
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Highest-rated clean products in your cabinet boosting your health score
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.cleanestItems.map((item) => {
                  const grade = item.analysis.nutriScore.grade;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                          {item.productName}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {item.analysis.normalizedData.calories_per_100g} kcal · Protein: {item.analysis.normalizedData.protein_per_100g}g
                        </span>
                      </div>
                      <div
                        className={`w-9 h-9 rounded-xl ${GRADE_BG_CLASS[grade]} flex items-center justify-center font-black text-sm shrink-0 shadow-md`}
                      >
                        {grade}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. ALL PANTRY ITEMS LIST */}
          <div className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                All Audited Items ({items.length})
              </h3>
            </div>

            <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="py-3.5 flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl ${GRADE_BG_CLASS[item.analysis.nutriScore.grade]} flex items-center justify-center font-black text-sm shrink-0 shadow-md`}
                    >
                      {item.analysis.nutriScore.grade}
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                        {item.productName}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        NOVA {item.analysis.novaGroup} · {item.analysis.normalizedData.calories_per_100g} kcal · Sugars: {item.analysis.normalizedData.sugars_per_100g}g · Sodium: {item.analysis.normalizedData.sodium_mg_per_100g}mg
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-80 group-hover:opacity-100"
                    title="Remove from Pantry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
