'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Flame,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  PieChart,
  Activity,
  HeartPulse,
  Clock,
  Apple,
  Utensils,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

import {
  DailyLogEntry,
  DailyTotals,
  getDailyLogEntries,
  addDailyLogEntry,
  removeDailyLogEntry,
  calculateDailyTotals,
  getTodayDateString,
  DEFAULT_DAILY_RDA,
} from '../lib/storage/dailyLogStore';
import { getHistoryRecords, ScanHistoryRecord } from '../lib/storage/historyManager';
import { SAMPLE_COMPARE_PRODUCTS } from '../lib/data/sampleFoods';
import { NutriScoreBadge } from './NutriScoreBadge';

export const DailyFuelTrackerView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [entries, setEntries] = useState<DailyLogEntry[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanHistoryRecord[]>([]);

  // Add Item Form State
  const [selectedMealType, setSelectedMealType] = useState<DailyLogEntry['mealType']>('snack');
  const [portionSizeGrams, setPortionSizeGrams] = useState<number>(100);
  const [notification, setNotification] = useState<string | null>(null);

  // Load entries whenever selectedDate changes
  useEffect(() => {
    refreshEntries();
  }, [selectedDate]);

  // Load recent scans for quick logging
  useEffect(() => {
    async function loadScans() {
      try {
        const history = await getHistoryRecords();
        setRecentScans(history);
      } catch (err) {
        console.error(err);
      }
    }
    loadScans();
  }, []);

  const refreshEntries = () => {
    const list = getDailyLogEntries(selectedDate);
    setEntries(list);
  };

  const totals: DailyTotals = calculateDailyTotals(entries, selectedDate);

  // Date Navigation Handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yr}-${mo}-${dy}`);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yr}-${mo}-${dy}`);
  };

  const handleJumpToToday = () => {
    setSelectedDate(getTodayDateString());
  };

  const handleDeleteItem = (id: string) => {
    removeDailyLogEntry(id, selectedDate);
    refreshEntries();
  };

  const handleLogFromScan = (record: ScanHistoryRecord) => {
    if (!record.analysis) return;
    addDailyLogEntry(
      record.analysis,
      record.productName,
      record.brand,
      portionSizeGrams,
      selectedMealType,
      selectedDate,
      record.imagePreview
    );
    refreshEntries();
    setIsAddModalOpen(false);
    showNotice(`Logged ${record.productName} (${portionSizeGrams}g) to ${selectedMealType}!`);
  };

  const handleLogFromSample = (key: string) => {
    const sample = SAMPLE_COMPARE_PRODUCTS[key];
    if (!sample) return;
    addDailyLogEntry(
      sample.analysis,
      sample.name,
      sample.brand,
      portionSizeGrams,
      selectedMealType,
      selectedDate
    );
    refreshEntries();
    setIsAddModalOpen(false);
    showNotice(`Logged ${sample.name} (${portionSizeGrams}g) to ${selectedMealType}!`);
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const isToday = selectedDate === getTodayDateString();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Toast Notice */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-brand-forest text-brand-cream border border-brand-lime/40 shadow-2xl flex items-center gap-2 text-sm font-semibold"
          >
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER WITH DATE NAVIGATOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/30 text-brand-lime text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>Daily Intake &amp; Biological Ledger</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Daily <span className="text-brand-lime">Fuel Log</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-brand-cream/80 mt-1">
            Track daily calories, added sugars, cardiovascular sodium, and ultra-processed food intake.
          </p>
        </div>

        {/* Date Selector Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-white/70 dark:bg-brand-darkCard/70 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/60 dark:border-brand-cream/15 shadow-sm">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-brand-darkBg text-slate-600 dark:text-brand-cream transition-all"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3 text-center">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              {isToday ? 'Today' : selectedDate}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-brand-cream/60">
              {new Date(selectedDate).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-brand-darkBg text-slate-600 dark:text-brand-cream transition-all"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={handleJumpToToday}
              className="ml-2 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-brand-lime/15 text-brand-lime hover:bg-brand-lime/25 transition-all"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* HERO SCORE & UPF RATIO BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Score Card */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-brand-darkCard/80 backdrop-blur-xl border border-slate-200/60 dark:border-brand-cream/20 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-brand-cream/60">
              Diet Quality Index
            </span>
            <span className="p-2 rounded-xl bg-brand-forest/20 text-brand-lime">
              <Activity className="w-4 h-4" />
            </span>
          </div>

          <div className="my-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
              {entries.length > 0 ? totals.dailyHealthScore : '--'}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-brand-cream/70 leading-relaxed">
            {entries.length === 0
              ? 'No meals logged yet today. Scan or tap "Log Meal" to start tracking.'
              : totals.dailyHealthScore >= 80
              ? '🌟 Outstanding! High nutrient density with controlled free sugars.'
              : totals.dailyHealthScore >= 60
              ? '👍 Balanced diet. Watch added sugars and ultra-processed additives.'
              : '⚠️ High processing and sugar density. Try healthy whole food swaps.'}
          </p>
        </div>

        {/* Ultra-Processed (NOVA 4) Meter */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-brand-darkCard/80 backdrop-blur-xl border border-slate-200/60 dark:border-brand-cream/20 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-brand-cream/60">
              UPF Food Ratio
            </span>
            <span className="p-2 rounded-xl bg-brand-rust/20 text-brand-rust">
              <PieChart className="w-4 h-4" />
            </span>
          </div>

          <div className="my-4">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {totals.upfPercentage}%
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-brand-cream/70">
                NOVA 4 Ultra-Processed
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-brand-darkBg overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${
                    totals.itemCount > 0
                      ? Math.max(
                          0,
                          100 - totals.upfPercentage
                        )
                      : 100
                  }%`,
                }}
                title="Whole & Minimally Processed Foods"
              />
              <div
                className="h-full bg-brand-rust transition-all duration-500"
                style={{ width: `${totals.upfPercentage}%` }}
                title="Ultra-Processed Industrial Formulations"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-brand-cream/70">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Whole/Culinary ({totals.itemCount > 0 ? 100 - totals.upfPercentage : 0}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-brand-rust" /> UPF Formulations ({totals.upfPercentage}%)
            </span>
          </div>
        </div>

        {/* Quick Action Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-forest to-brand-darkBg text-brand-cream border border-brand-lime/30 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand-lime text-xs font-bold uppercase tracking-wider mb-1">
              <Utensils className="w-4 h-4" />
              <span>Log Items</span>
            </div>
            <h3 className="text-xl font-bold text-white">Daily Intake Tracker</h3>
            <p className="text-xs text-brand-cream/80 mt-1 leading-relaxed">
              Log foods from your scans or demo pantry to track cumulative micro-nutrients.
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 py-2.5 rounded-xl bg-brand-lime text-brand-darkBg font-bold text-xs hover:bg-brand-lime/90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Food Item</span>
            </button>
            <Link
              href="/"
              className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center justify-center"
              title="Open Scanner to Scan New Product"
            >
              <Apple className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* CLINICAL NUTRIENT THRESHOLD DIALS */}
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-brand-darkCard/80 backdrop-blur-xl border border-slate-200/60 dark:border-brand-cream/20 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-lime" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Cumulative Daily Nutrient Gauges
            </h3>
          </div>
          <span className="text-xs text-slate-400 dark:text-brand-cream/60">
            Clinical WHO / FDA Targets
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Calories */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-brand-darkBg/60 border border-slate-200/50 dark:border-brand-cream/10 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-brand-cream/60 uppercase">
              <span>Calories</span>
              <span>{Math.round((totals.totalCalories / DEFAULT_DAILY_RDA.calories) * 100)}%</span>
            </div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">
              {totals.totalCalories}{' '}
              <span className="text-xs font-normal text-slate-400">kcal</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-lime transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (totals.totalCalories / DEFAULT_DAILY_RDA.calories) * 100
                  )}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              Target: {DEFAULT_DAILY_RDA.calories} kcal
            </span>
          </div>

          {/* 2. Added Sugars (WHO 25g limit) */}
          <div
            className={`p-3.5 rounded-2xl border space-y-2 ${
              totals.exceededLimits.sugar
                ? 'bg-rose-500/10 border-rose-500/30'
                : 'bg-slate-50 dark:bg-brand-darkBg/60 border-slate-200/50 dark:border-brand-cream/10'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-brand-cream/60 uppercase">
              <span className={totals.exceededLimits.sugar ? 'text-rose-500 font-bold' : ''}>
                {totals.exceededLimits.sugar ? '⚠️ Sugar Over' : 'Added Sugar'}
              </span>
              <span>{Math.round((totals.totalAddedSugars / DEFAULT_DAILY_RDA.addedSugarsMax) * 100)}%</span>
            </div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">
              {totals.totalAddedSugars} <span className="text-xs font-normal text-slate-400">g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  totals.exceededLimits.sugar ? 'bg-rose-500' : 'bg-amber-400'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    (totals.totalAddedSugars / DEFAULT_DAILY_RDA.addedSugarsMax) * 100
                  )}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              Max: {DEFAULT_DAILY_RDA.addedSugarsMax}g WHO limit
            </span>
          </div>

          {/* 3. Sodium (FDA 2300mg limit) */}
          <div
            className={`p-3.5 rounded-2xl border space-y-2 ${
              totals.exceededLimits.sodium
                ? 'bg-rose-500/10 border-rose-500/30'
                : 'bg-slate-50 dark:bg-brand-darkBg/60 border-slate-200/50 dark:border-brand-cream/10'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-brand-cream/60 uppercase">
              <span className={totals.exceededLimits.sodium ? 'text-rose-500 font-bold' : ''}>
                {totals.exceededLimits.sodium ? '⚠️ Sodium Over' : 'Sodium'}
              </span>
              <span>{Math.round((totals.totalSodiumMg / DEFAULT_DAILY_RDA.sodiumMgMax) * 100)}%</span>
            </div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">
              {totals.totalSodiumMg} <span className="text-xs font-normal text-slate-400">mg</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  totals.exceededLimits.sodium ? 'bg-rose-500' : 'bg-brand-lime'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    (totals.totalSodiumMg / DEFAULT_DAILY_RDA.sodiumMgMax) * 100
                  )}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              Max: {DEFAULT_DAILY_RDA.sodiumMgMax}mg limit
            </span>
          </div>

          {/* 4. Saturated Fat */}
          <div
            className={`p-3.5 rounded-2xl border space-y-2 ${
              totals.exceededLimits.saturatedFat
                ? 'bg-rose-500/10 border-rose-500/30'
                : 'bg-slate-50 dark:bg-brand-darkBg/60 border-slate-200/50 dark:border-brand-cream/10'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-brand-cream/60 uppercase">
              <span>Sat Fat</span>
              <span>{Math.round((totals.totalSaturatedFat / DEFAULT_DAILY_RDA.saturatedFatMax) * 100)}%</span>
            </div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">
              {totals.totalSaturatedFat} <span className="text-xs font-normal text-slate-400">g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-rust transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (totals.totalSaturatedFat / DEFAULT_DAILY_RDA.saturatedFatMax) * 100
                  )}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              Max: {DEFAULT_DAILY_RDA.saturatedFatMax}g AHA limit
            </span>
          </div>

          {/* 5. Dietary Fiber */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-brand-darkBg/60 border border-slate-200/50 dark:border-brand-cream/10 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-brand-cream/60 uppercase">
              <span>Fiber</span>
              <span>{Math.round((totals.totalFiber / DEFAULT_DAILY_RDA.fiberMin) * 100)}%</span>
            </div>
            <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              {totals.totalFiber} <span className="text-xs font-normal text-slate-400">g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (totals.totalFiber / DEFAULT_DAILY_RDA.fiberMin) * 100
                  )}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              Goal: {DEFAULT_DAILY_RDA.fiberMin}g prebiotic
            </span>
          </div>

          {/* 6. Protein */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-brand-darkBg/60 border border-slate-200/50 dark:border-brand-cream/10 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-brand-cream/60 uppercase">
              <span>Protein</span>
              <span>{Math.round((totals.totalProtein / DEFAULT_DAILY_RDA.proteinTarget) * 100)}%</span>
            </div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">
              {totals.totalProtein} <span className="text-xs font-normal text-slate-400">g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (totals.totalProtein / DEFAULT_DAILY_RDA.proteinTarget) * 100
                  )}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              Target: {DEFAULT_DAILY_RDA.proteinTarget}g
            </span>
          </div>
        </div>
      </div>

      {/* LOGGED MEALS TIMELINE */}
      <div className="rounded-3xl bg-white/80 dark:bg-brand-darkCard/80 backdrop-blur-xl border border-slate-200/60 dark:border-brand-cream/20 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200/60 dark:border-brand-cream/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-brand-lime" />
            <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-white">
              Food Timeline ({entries.length} items)
            </h3>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-brand-forest/20 text-brand-lime hover:bg-brand-forest/30 font-bold text-xs flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-brand-darkBg flex items-center justify-center mx-auto text-slate-400">
              <Utensils className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-700 dark:text-brand-cream text-sm">
              No entries logged for {isToday ? 'today' : selectedDate}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Scan a barcode or nutrition panel on the main page and tap "Log to Daily Fuel", or pick from sample foods.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-brand-lime text-brand-darkBg font-bold text-xs hover:bg-brand-lime/90 transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Log Item
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/60 dark:divide-brand-cream/10">
            {entries.map((item) => (
              <div
                key={item.id}
                className="p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-brand-darkBg/30 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <NutriScoreBadge grade={item.grade} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {item.productName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-brand-darkBg text-slate-500 uppercase font-bold tracking-wider">
                        {item.mealType}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-brand-cream/60 block mt-0.5">
                      {item.portionGrams}g serving • {item.calories} kcal • {item.sugars}g sugar • {item.sodiumMg}mg sodium • {item.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-brand-darkBg text-slate-600 dark:text-brand-cream border border-slate-200/60 dark:border-brand-cream/10">
                    NOVA {item.novaGroup}
                  </span>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all"
                    title="Remove from log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUICK LOG MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
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
                    Log Food to Daily Fuel
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-brand-cream/70">
                    Choose meal category, serving portion, and food source
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-brand-darkBg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Serving & Meal Type Selector */}
              <div className="p-4 border-b border-slate-200 dark:border-brand-cream/15 bg-slate-50/50 dark:bg-brand-darkBg/40 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] font-bold text-slate-400 dark:text-brand-cream/60 uppercase block mb-1">
                      Meal Category:
                    </label>
                    <select
                      value={selectedMealType}
                      onChange={(e) => setSelectedMealType(e.target.value as any)}
                      className="w-full py-1.5 px-3 rounded-xl text-xs bg-white dark:bg-brand-darkCard border border-slate-200 dark:border-brand-cream/20 text-slate-900 dark:text-white"
                    >
                      <option value="breakfast">🍳 Breakfast</option>
                      <option value="lunch">🥗 Lunch</option>
                      <option value="dinner">🍲 Dinner</option>
                      <option value="snack">🍎 Snack</option>
                    </select>
                  </div>

                  <div className="w-1/3">
                    <label className="text-[11px] font-bold text-slate-400 dark:text-brand-cream/60 uppercase block mb-1">
                      Portion:
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="10"
                        max="1000"
                        value={portionSizeGrams}
                        onChange={(e) => setPortionSizeGrams(Math.max(10, Number(e.target.value) || 100))}
                        className="w-full py-1.5 px-2 rounded-xl text-xs bg-white dark:bg-brand-darkCard border border-slate-200 dark:border-brand-cream/20 text-slate-900 dark:text-white text-center font-bold"
                      />
                      <span className="text-xs text-slate-400">g</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {/* Recent Scans */}
                {recentScans.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-brand-cream/60 uppercase tracking-wider block mb-2">
                      Recent Scans:
                    </span>
                    <div className="space-y-2">
                      {recentScans.map((rec) => (
                        <button
                          key={rec.id}
                          onClick={() => handleLogFromScan(rec)}
                          className="w-full text-left p-3 rounded-2xl bg-slate-50 dark:bg-brand-darkBg/60 hover:bg-brand-lime/10 dark:hover:bg-brand-lime/10 border border-slate-200/50 dark:border-brand-cream/10 transition-all flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">
                              {rec.productName}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {rec.brand || 'Scanned'} • {rec.caloriesPer100g} kcal/100g
                            </span>
                          </div>
                          <NutriScoreBadge grade={rec.grade} size="sm" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Demo Foods */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-brand-cream/60 uppercase tracking-wider block mb-2">
                    Or Pick from Demo Staples:
                  </span>
                  <div className="space-y-2">
                    {Object.entries(SAMPLE_COMPARE_PRODUCTS).map(([key, item]) => (
                      <button
                        key={key}
                        onClick={() => handleLogFromSample(key)}
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
                        <NutriScoreBadge grade={item.analysis.nutriScore.grade} size="sm" />
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
