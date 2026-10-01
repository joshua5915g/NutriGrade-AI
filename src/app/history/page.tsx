'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import {
  Apple,
  Search,
  History,
  Trash2,
  Filter,
  ArrowLeft,
  Calendar,
  Sparkles,
  Flame,
  AlertTriangle,
  ChevronRight,
  Package,
} from 'lucide-react';

import { NutriScoreGrade } from '../../types/nutrition';
import {
  ScanHistoryRecord,
  getHistoryRecords,
  deleteHistoryRecord,
  clearAllHistoryRecords,
} from '../../lib/storage/historyManager';

const GRADE_FILTERS: (NutriScoreGrade | 'ALL')[] = ['ALL', 'A', 'B', 'C', 'D', 'E'];

export default function HistoryPage() {
  const [records, setRecords] = useState<ScanHistoryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<NutriScoreGrade | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const loadHistory = async () => {
    setIsLoading(true);
    const data = await getHistoryRecords({
      query: searchQuery,
      grade: selectedGrade,
    });
    setRecords(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, [searchQuery, selectedGrade]);

  const handleDeleteItem = async (id: string) => {
    await deleteHistoryRecord(id);
    await loadHistory();
  };

  const handleClearAll = async () => {
    await clearAllHistoryRecords();
    setIsConfirmingClear(false);
    await loadHistory();
  };

  const getGradeBadgeColor = (grade: NutriScoreGrade) => {
    switch (grade) {
      case 'A':
        return 'bg-emerald-500 text-white';
      case 'B':
        return 'bg-teal-500 text-white';
      case 'C':
        return 'bg-amber-400 text-slate-900';
      case 'D':
        return 'bg-orange-500 text-white';
      case 'E':
        return 'bg-rose-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans pb-16 bg-slate-50 dark:bg-brand-darkBg text-slate-900 dark:text-brand-cream transition-colors">
      <Navbar />

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 pt-8 space-y-6">
        {/* HERO TITLE & CONTROLS */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                <History className="w-7 h-7 text-brand-lime" />
                Unlimited Scan History
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-brand-cream/70 mt-1">
                IndexedDB storage containing all analyzed food products, barcode lookups, and nutritional audits.
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              {records.length > 0 && (
                <button
                  onClick={() => setIsConfirmingClear(true)}
                  className="px-3.5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-all border border-rose-500/20 flex items-center gap-1.5 shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Clear History</span>
                </button>
              )}

              {/* SEARCH INPUT */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search history by product name or brand..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* NUTRI-SCORE GRADE FILTER PILLS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Grade:
            </span>
            {GRADE_FILTERS.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                  selectedGrade === grade
                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {grade === 'ALL' ? 'All Grades' : `Grade ${grade}`}
              </button>
            ))}
          </div>
        </div>

        {/* CONFIRM CLEAR MODAL */}
        <AnimatePresence>
          {isConfirmingClear && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
            >
              <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Clear All Scan History?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  This action will permanently delete all stored scan logs from IndexedDB. This cannot be undone.
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsConfirmingClear(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    Clear History
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GRID OF HISTORICAL SCAN CARDS */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold">
            Loading scan history records...
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              No Scan History Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Scanned food packaging labels, barcode lookups, and global search products will automatically appear here.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-md hover:bg-emerald-600 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Scan First Product</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map((record) => (
              <div
                key={record.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-md hover:shadow-xl transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Timestamp & Grade Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(record.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shadow-sm ${getGradeBadgeColor(
                        record.grade
                      )}`}
                    >
                      {record.grade}
                    </span>
                  </div>

                  {/* Title & Brand */}
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white truncate group-hover:text-indigo-500 transition-colors">
                      {record.productName}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      {record.brand || 'Verified Product'}
                    </span>
                  </div>

                  {/* Key Macros Summary */}
                  <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 block">Calories</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {record.caloriesPer100g}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Sugar</span>
                      <span className="font-bold text-emerald-500">
                        {record.sugarsPer100g}g
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">NOVA</span>
                      <span className="font-bold text-indigo-500">
                        Group {record.novaGroup}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Source: {record.source}
                  </span>

                  <button
                    onClick={() => handleDeleteItem(record.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
