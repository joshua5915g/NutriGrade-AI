'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  Trophy,
  ArrowRightLeft,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  HelpCircle,
  Plus,
  ShoppingCart,
  PackageCheck,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Activity,
  HeartPulse,
} from 'lucide-react';
import Link from 'next/link';

import {
  CompareProductItem,
  compareProducts,
  ComparisonVerdict,
  ComparisonMetric,
} from '../lib/algorithms/productComparator';
import {
  SAMPLE_COMPARE_PRODUCTS,
  CURATED_CLASH_MATCHUPS,
} from '../lib/data/sampleFoods';
import { getHistoryRecords, ScanHistoryRecord } from '../lib/storage/historyManager';
import { NutriScoreBadge } from './NutriScoreBadge';
import { getLists, addToList } from '../lib/storage/shoppingLists';
import { addToPantry } from '../lib/storage/pantryStore';

interface ProductComparisonViewProps {
  initialItemA?: CompareProductItem;
  initialItemB?: CompareProductItem;
}

export const ProductComparisonView: React.FC<ProductComparisonViewProps> = ({
  initialItemA,
  initialItemB,
}) => {
  const [itemA, setItemA] = useState<CompareProductItem>(
    initialItemA || SAMPLE_COMPARE_PRODUCTS.organic_oats
  );
  const [itemB, setItemB] = useState<CompareProductItem>(
    initialItemB || SAMPLE_COMPARE_PRODUCTS.frosted_cereal
  );

  const [recentScans, setRecentScans] = useState<ScanHistoryRecord[]>([]);
  const [selectingSlot, setSelectingSlot] = useState<'A' | 'B' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Compute live comparison verdict
  const verdict: ComparisonVerdict = compareProducts(itemA, itemB);

  // Load recent scan history for quick comparison
  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await getHistoryRecords();
        setRecentScans(history);
      } catch (err) {
        console.error('Failed to load scan history for comparison:', err);
      }
    }
    loadHistory();
  }, []);

  // Handle Search for Open Food Facts
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/search-products?q=${encodeURIComponent(searchQuery.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.products || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFromHistory = (record: ScanHistoryRecord) => {
    if (!record.analysis) return;
    const newItem: CompareProductItem = {
      id: record.id,
      name: record.productName,
      brand: record.brand,
      imagePreview: record.imagePreview,
      rawData: {
        calories: record.caloriesPer100g,
        total_fat: record.fatPer100g,
        saturated_fat: record.fatPer100g * 0.4,
        trans_fat: 0,
        sugars: record.sugarsPer100g,
        added_sugars: record.sugarsPer100g * 0.8,
        sodium_mg: record.sodiumMgPer100g,
        fiber: record.fiberPer100g,
        protein: record.proteinPer100g,
        serving_size_g: 100,
        is_per_100g: true,
      },
      analysis: record.analysis,
    };

    if (selectingSlot === 'A') setItemA(newItem);
    if (selectingSlot === 'B') setItemB(newItem);
    setSelectingSlot(null);
  };

  const handleSelectFromSearch = (prod: any) => {
    if (!prod.analysis) return;
    const newItem: CompareProductItem = {
      id: prod.id || prod.barcode,
      name: prod.productName,
      brand: prod.brand,
      imagePreview: prod.imageThumbUrl,
      ingredients: prod.ingredients,
      rawData: prod.rawData,
      analysis: prod.analysis,
    };

    if (selectingSlot === 'A') setItemA(newItem);
    if (selectingSlot === 'B') setItemB(newItem);
    setSelectingSlot(null);
  };

  const handleSwapSlots = () => {
    const temp = itemA;
    setItemA(itemB);
    setItemB(temp);
  };

  const handleAddWinnerToShoppingList = async () => {
    if (!verdict.winnerItem) return;
    try {
      const lists = getLists();
      if (lists.length > 0) {
        addToList(lists[0].id, {
          productName: verdict.winnerItem.name,
          brand: verdict.winnerItem.brand,
          grade: verdict.winnerItem.analysis.nutriScore.grade,
          novaGroup: verdict.winnerItem.analysis.novaGroup,
        });
      }
      setActionNotice(`✅ Added "${verdict.winnerItem.name}" to your shopping list!`);
      setTimeout(() => setActionNotice(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddWinnerToPantry = async () => {
    if (!verdict.winnerItem) return;
    try {
      addToPantry(verdict.winnerItem.analysis, verdict.winnerItem.name);
      setActionNotice(`🥫 Added "${verdict.winnerItem.name}" to your Smart Pantry!`);
      setTimeout(() => setActionNotice(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Notice notification */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-brand-forest text-brand-cream border border-brand-lime/40 shadow-2xl flex items-center gap-2 text-sm font-semibold"
          >
            <span>{actionNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BANNER */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-lime/10 border border-brand-lime/30 text-brand-lime text-xs font-bold tracking-wide uppercase shadow-sm">
          <Scale className="w-4 h-4" />
          <span>Aisle Duel: Head-to-Head Food Clash</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Product <span className="text-brand-lime">Comparison</span> Engine
        </h1>
        <p className="text-slate-600 dark:text-brand-cream/80 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Stuck in the grocery aisle between two options? NutriGrade AI compares
          Nutri-Score, NOVA processing, hidden sugars, gut disruptors, and seed oils to declare the clinical winner.
        </p>
      </div>

      {/* CURATED MATCHUPS SHORTCUTS */}
      <div className="bg-white/60 dark:bg-brand-darkCard/60 backdrop-blur-md rounded-2xl p-4 border border-slate-200/50 dark:border-brand-cream/15 shadow-sm">
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-500 dark:text-brand-cream/70 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-lime" /> Try Popular Matchups:
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {CURATED_CLASH_MATCHUPS.map((matchup, idx) => (
            <button
              key={idx}
              onClick={() => {
                setItemA(SAMPLE_COMPARE_PRODUCTS[matchup.itemAId]);
                setItemB(SAMPLE_COMPARE_PRODUCTS[matchup.itemBId]);
              }}
              className="text-left p-3 rounded-xl bg-slate-50 dark:bg-brand-darkBg/60 hover:bg-brand-lime/10 dark:hover:bg-brand-lime/10 border border-slate-200/60 dark:border-brand-cream/10 transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-lime transition-colors block">
                  {matchup.title}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-brand-cream/70 line-clamp-1 mt-0.5">
                  {matchup.subtitle}
                </span>
              </div>
              <span className="text-[10px] text-brand-forest dark:text-brand-lime font-semibold mt-2 inline-block">
                ⚡ {matchup.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2-COLUMN HERO MATCHUP STAGE */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch">
        {/* ITEM A CARD */}
        <div
          className={`relative rounded-3xl p-6 backdrop-blur-xl border transition-all ${
            verdict.winnerId === 'A'
              ? 'bg-emerald-500/5 dark:bg-brand-forest/20 border-emerald-500/50 dark:border-brand-lime/40 shadow-xl'
              : 'bg-white/80 dark:bg-brand-darkCard/80 border-slate-200/70 dark:border-brand-cream/20 shadow-md'
          }`}
        >
          {verdict.winnerId === 'A' && (
            <div className="absolute -top-3.5 left-6 px-3 py-1 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md">
              <Trophy className="w-3.5 h-3.5" />
              <span>CLINICAL WINNER</span>
            </div>
          )}

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-brand-cream/60">
                Option A {itemA.brand ? `• ${itemA.brand}` : ''}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 leading-snug">
                {itemA.name}
              </h3>
            </div>
            <button
              onClick={() => setSelectingSlot('A')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-brand-darkBg hover:bg-slate-200 dark:hover:bg-brand-forest/40 text-slate-700 dark:text-brand-cream border border-slate-200 dark:border-brand-cream/20 transition-all flex items-center gap-1"
            >
              <span>Change</span>
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <NutriScoreBadge grade={itemA.analysis.nutriScore.grade} size="md" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-700 dark:text-brand-cream">
                NOVA {itemA.analysis.novaGroup} Processing
              </span>
              <span className="text-[11px] text-slate-500 dark:text-brand-cream/70">
                Health Score: {verdict.scoreA}/100
              </span>
            </div>
          </div>

          {/* Quick macro chips */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-100/70 dark:bg-brand-darkBg/60">
              <span className="text-[10px] text-slate-400 dark:text-brand-cream/60 block">Calories</span>
              <span className="font-bold text-slate-800 dark:text-white">
                {itemA.analysis.normalizedData.calories_per_100g}
              </span>
              <span className="text-[9px] text-slate-400">kcal/100g</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100/70 dark:bg-brand-darkBg/60">
              <span className="text-[10px] text-slate-400 dark:text-brand-cream/60 block">Sugar</span>
              <span className="font-bold text-slate-800 dark:text-white">
                {itemA.analysis.normalizedData.sugars_per_100g.toFixed(1)}g
              </span>
              <span className="text-[9px] text-slate-400">/100g</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100/70 dark:bg-brand-darkBg/60">
              <span className="text-[10px] text-slate-400 dark:text-brand-cream/60 block">Gut Health</span>
              <span className="font-bold text-slate-800 dark:text-white">
                {itemA.analysis.gut_health_score}/100
              </span>
              <span className="text-[9px] text-slate-400">microbiome</span>
            </div>
          </div>
        </div>

        {/* SWAP BUTTON (IN CENTER ON DESKTOP) */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button
            onClick={handleSwapSlots}
            className="p-3 rounded-full bg-slate-900 dark:bg-brand-lime text-white dark:text-brand-darkBg shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 border-slate-50 dark:border-brand-darkBg"
            title="Swap sides"
            aria-label="Swap sides"
          >
            <ArrowRightLeft className="w-4 h-4 font-bold" />
          </button>
        </div>

        {/* ITEM B CARD */}
        <div
          className={`relative rounded-3xl p-6 backdrop-blur-xl border transition-all ${
            verdict.winnerId === 'B'
              ? 'bg-emerald-500/5 dark:bg-brand-forest/20 border-emerald-500/50 dark:border-brand-lime/40 shadow-xl'
              : 'bg-white/80 dark:bg-brand-darkCard/80 border-slate-200/70 dark:border-brand-cream/20 shadow-md'
          }`}
        >
          {verdict.winnerId === 'B' && (
            <div className="absolute -top-3.5 left-6 px-3 py-1 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md">
              <Trophy className="w-3.5 h-3.5" />
              <span>CLINICAL WINNER</span>
            </div>
          )}

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-brand-cream/60">
                Option B {itemB.brand ? `• ${itemB.brand}` : ''}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 leading-snug">
                {itemB.name}
              </h3>
            </div>
            <button
              onClick={() => setSelectingSlot('B')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-brand-darkBg hover:bg-slate-200 dark:hover:bg-brand-forest/40 text-slate-700 dark:text-brand-cream border border-slate-200 dark:border-brand-cream/20 transition-all flex items-center gap-1"
            >
              <span>Change</span>
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <NutriScoreBadge grade={itemB.analysis.nutriScore.grade} size="md" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-700 dark:text-brand-cream">
                NOVA {itemB.analysis.novaGroup} Processing
              </span>
              <span className="text-[11px] text-slate-500 dark:text-brand-cream/70">
                Health Score: {verdict.scoreB}/100
              </span>
            </div>
          </div>

          {/* Quick macro chips */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-100/70 dark:bg-brand-darkBg/60">
              <span className="text-[10px] text-slate-400 dark:text-brand-cream/60 block">Calories</span>
              <span className="font-bold text-slate-800 dark:text-white">
                {itemB.analysis.normalizedData.calories_per_100g}
              </span>
              <span className="text-[9px] text-slate-400">kcal/100g</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100/70 dark:bg-brand-darkBg/60">
              <span className="text-[10px] text-slate-400 dark:text-brand-cream/60 block">Sugar</span>
              <span className="font-bold text-slate-800 dark:text-white">
                {itemB.analysis.normalizedData.sugars_per_100g.toFixed(1)}g
              </span>
              <span className="text-[9px] text-slate-400">/100g</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100/70 dark:bg-brand-darkBg/60">
              <span className="text-[10px] text-slate-400 dark:text-brand-cream/60 block">Gut Health</span>
              <span className="font-bold text-slate-800 dark:text-white">
                {itemB.analysis.gut_health_score}/100
              </span>
              <span className="text-[9px] text-slate-400">microbiome</span>
            </div>
          </div>
        </div>
      </div>

      {/* VERDICT SUMMARY BANNER */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-brand-forest/90 to-brand-darkBg text-brand-cream border border-brand-lime/30 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-brand-lime font-bold text-xs uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              <span>Algorithmic Verdict</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              {verdict.headline}
            </h2>
          </div>

          {verdict.winnerItem && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAddWinnerToShoppingList}
                className="px-4 py-2 rounded-xl bg-brand-lime hover:bg-brand-lime/90 text-brand-darkBg font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add Winner to List</span>
              </button>
              <button
                onClick={handleAddWinnerToPantry}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20 active:scale-95 flex items-center gap-1.5"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Add to Pantry</span>
              </button>
            </div>
          )}
        </div>

        <p className="text-sm md:text-base text-brand-cream/90 leading-relaxed max-w-3xl">
          {verdict.clinicalSummary}
        </p>

        {/* Weekly Real-World Impact Callout */}
        <div className="p-4 rounded-2xl bg-black/30 border border-brand-lime/20 flex items-start gap-3 text-xs md:text-sm text-brand-lime font-medium">
          <Sparkles className="w-5 h-5 flex-shrink-0 text-brand-lime mt-0.5" />
          <div>
            <span className="font-bold block uppercase tracking-wider text-[11px] text-brand-cream">
              Weekly Lifestyle Compounding:
            </span>
            <span>{verdict.swapImpactWeekly}</span>
          </div>
        </div>
      </div>

      {/* METRIC-BY-METRIC HEAD-TO-HEAD TABLE */}
      <div className="rounded-3xl bg-white/80 dark:bg-brand-darkCard/80 backdrop-blur-xl border border-slate-200/70 dark:border-brand-cream/20 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200/60 dark:border-brand-cream/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-lime" />
            <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-white">
              Clinical Breakdown Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-brand-cream/70 font-medium">
            Per 100g standard normalization
          </span>
        </div>

        <div className="divide-y divide-slate-200/60 dark:divide-brand-cream/10">
          {verdict.metrics.map((metric) => (
            <div
              key={metric.id}
              className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-brand-darkBg/30 transition-colors"
            >
              {/* Metric Label & Clinical Note */}
              <div className="md:w-1/3 space-y-0.5">
                <span className="font-bold text-sm text-slate-900 dark:text-white block">
                  {metric.label}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-brand-cream/70 block">
                  {metric.clinicalImpact}
                </span>
              </div>

              {/* Side-by-side values */}
              <div className="flex-1 grid grid-cols-2 gap-3 text-center">
                {/* Value A */}
                <div
                  className={`p-2.5 rounded-xl border text-xs md:text-sm font-bold flex flex-col items-center justify-center ${
                    metric.winner === 'A'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-slate-100/60 dark:bg-brand-darkBg/60 border-transparent text-slate-700 dark:text-brand-cream'
                  }`}
                >
                  <span>{metric.displayA}</span>
                  {metric.winner === 'A' && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Superior
                    </span>
                  )}
                </div>

                {/* Value B */}
                <div
                  className={`p-2.5 rounded-xl border text-xs md:text-sm font-bold flex flex-col items-center justify-center ${
                    metric.winner === 'B'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-slate-100/60 dark:bg-brand-darkBg/60 border-transparent text-slate-700 dark:text-brand-cream'
                  }`}
                >
                  <span>{metric.displayB}</span>
                  {metric.winner === 'B' && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Superior
                    </span>
                  )}
                </div>
              </div>

              {/* Difference Delta Badge */}
              <div className="md:w-1/4 text-right">
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-brand-darkBg text-slate-700 dark:text-brand-cream border border-slate-200/50 dark:border-brand-cream/20">
                  {metric.differenceText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRODUCT SELECTOR MODAL / DRAWER */}
      <AnimatePresence>
        {selectingSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white dark:bg-brand-darkCard rounded-3xl shadow-2xl border border-slate-200 dark:border-brand-cream/20 overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 dark:border-brand-cream/20 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    Select Product for Slot {selectingSlot}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-brand-cream/70">
                    Choose from your scan history, demo presets, or search live
                  </p>
                </div>
                <button
                  onClick={() => setSelectingSlot(null)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-brand-darkBg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-slate-200 dark:border-brand-cream/15 bg-slate-50/50 dark:bg-brand-darkBg/40">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search food by name (e.g., Oat Milk, Cheerios)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-brand-darkCard border border-slate-200 dark:border-brand-cream/20 text-slate-900 dark:text-white focus:outline-none focus:border-brand-lime"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-4 py-2 rounded-xl bg-brand-forest text-brand-cream font-bold text-xs hover:bg-brand-forest/90 transition-all disabled:opacity-50"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </form>
              </div>

              {/* Items List */}
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {/* Search Results if available */}
                {searchResults.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-brand-cream/60 uppercase tracking-wider block mb-2">
                      Search Results:
                    </span>
                    <div className="space-y-2">
                      {searchResults.map((prod) => (
                        <button
                          key={prod.id || prod.barcode}
                          onClick={() => handleSelectFromSearch(prod)}
                          className="w-full text-left p-3 rounded-2xl bg-slate-50 dark:bg-brand-darkBg/60 hover:bg-brand-lime/10 dark:hover:bg-brand-lime/10 border border-slate-200/50 dark:border-brand-cream/10 transition-all flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">
                              {prod.productName}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {prod.brand} • Grade {prod.nutriScoreGrade}
                            </span>
                          </div>
                          <NutriScoreBadge grade={prod.nutriScoreGrade} size="sm" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Scans */}
                {recentScans.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-brand-cream/60 uppercase tracking-wider block mb-2">
                      Your Recent Scans:
                    </span>
                    <div className="space-y-2">
                      {recentScans.map((rec) => (
                        <button
                          key={rec.id}
                          onClick={() => handleSelectFromHistory(rec)}
                          className="w-full text-left p-3 rounded-2xl bg-slate-50 dark:bg-brand-darkBg/60 hover:bg-brand-lime/10 dark:hover:bg-brand-lime/10 border border-slate-200/50 dark:border-brand-cream/10 transition-all flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">
                              {rec.productName}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {rec.brand || 'Scanned item'} • Grade {rec.grade}
                            </span>
                          </div>
                          <NutriScoreBadge grade={rec.grade} size="sm" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Demo Presets */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-brand-cream/60 uppercase tracking-wider block mb-2">
                    Or Pick from Demo Fixtures:
                  </span>
                  <div className="space-y-2">
                    {Object.values(SAMPLE_COMPARE_PRODUCTS).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (selectingSlot === 'A') setItemA(item);
                          if (selectingSlot === 'B') setItemB(item);
                          setSelectingSlot(null);
                        }}
                        className="w-full text-left p-3 rounded-2xl bg-slate-50 dark:bg-brand-darkBg/60 hover:bg-brand-lime/10 dark:hover:bg-brand-lime/10 border border-slate-200/50 dark:border-brand-cream/10 transition-all flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {item.brand} • NOVA {item.analysis.novaGroup}
                          </span>
                        </div>
                        <NutriScoreBadge
                          grade={item.analysis.nutriScore.grade}
                          size="sm"
                        />
                      </button>
                    ))}
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
