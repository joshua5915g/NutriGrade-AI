'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  X,
  Search,
  Trash2,
  TrendingUp,
  Calendar,
  ChevronRight,
  Filter,
} from 'lucide-react';

import {
  ScanHistoryEntry,
  getScanHistory,
  deleteScanEntry,
  clearScanHistory,
  getDailyHealthIndex,
} from '../lib/storage/scanHistory';
import { NutriScoreGrade } from '../types/nutrition';

interface ScanHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRADE_COLORS: Record<NutriScoreGrade, { bg: string; text: string; ring: string }> = {
  A: { bg: 'bg-[#008B4C]', text: 'text-white', ring: 'ring-[#008B4C]/30' },
  B: { bg: 'bg-[#80BB2D]', text: 'text-white', ring: 'ring-[#80BB2D]/30' },
  C: { bg: 'bg-[#F5C400]', text: 'text-slate-900', ring: 'ring-[#F5C400]/30' },
  D: { bg: 'bg-[#E77B00]', text: 'text-white', ring: 'ring-[#E77B00]/30' },
  E: { bg: 'bg-[#E63312]', text: 'text-white', ring: 'ring-[#E63312]/30' },
};

export const ScanHistory: React.FC<ScanHistoryProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<ScanHistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<NutriScoreGrade | 'ALL'>('ALL');
  const [dailyIndex, setDailyIndex] = useState({ averageScore: 0, averageGrade: '—', scansToday: 0 });

  useEffect(() => {
    if (isOpen) {
      setEntries(getScanHistory());
      setDailyIndex(getDailyHealthIndex());
    }
  }, [isOpen]);

  const filteredEntries = entries.filter((e) => {
    const matchesSearch = searchQuery
      ? e.productName.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesGrade = filterGrade === 'ALL' ? true : e.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const handleDelete = (id: string) => {
    deleteScanEntry(id);
    setEntries(getScanHistory());
    setDailyIndex(getDailyHealthIndex());
  };

  const handleClearAll = () => {
    if (confirm('Clear all scan history? This cannot be undone.')) {
      clearScanHistory();
      setEntries([]);
      setDailyIndex({ averageScore: 0, averageGrade: '—', scansToday: 0 });
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Slide-Over Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-500">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Scan History</h2>
                  <p className="text-[11px] text-slate-400">
                    {entries.length} scan{entries.length !== 1 ? 's' : ''} saved locally
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Daily Health Index Card */}
            <div className="mx-5 mt-5 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent border border-indigo-500/20 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <span className="text-xl font-black">{dailyIndex.averageGrade}</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Daily Health Index
                </span>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-0.5">
                  {dailyIndex.scansToday > 0
                    ? `Your average scanned grade today: ${dailyIndex.averageGrade}`
                    : 'No scans today yet. Scan a product to start tracking!'}
                </p>
                <span className="text-[10px] text-slate-400">
                  {dailyIndex.scansToday} scan{dailyIndex.scansToday !== 1 ? 's' : ''} today · Avg score: {dailyIndex.averageScore}
                </span>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="px-5 pt-4 space-y-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                />
              </div>

              {/* Grade Filter Pills */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {(['ALL', 'A', 'B', 'C', 'D', 'E'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setFilterGrade(g)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      filterGrade === g
                        ? g === 'ALL'
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                          : `${GRADE_COLORS[g].bg} ${GRADE_COLORS[g].text} shadow-sm`
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Entries List (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {filteredEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <History className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="text-sm text-slate-400">
                    {entries.length === 0
                      ? 'No scans recorded yet.'
                      : 'No results match your filter.'}
                  </p>
                </div>
              ) : (
                filteredEntries.map((entry) => {
                  const gc = GRADE_COLORS[entry.grade];
                  return (
                    <div
                      key={entry.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-700/40 flex items-center gap-3 group hover:shadow-md transition-all"
                    >
                      {/* Grade Badge */}
                      <div
                        className={`w-10 h-10 rounded-xl ${gc.bg} ${gc.text} flex items-center justify-center font-black text-sm shadow-md ring-2 ${gc.ring} shrink-0`}
                      >
                        {entry.grade}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {entry.productName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{formatTime(entry.timestamp)}</span>
                          <span>·</span>
                          <span>NOVA {entry.novaGroup}</span>
                          <span>·</span>
                          <span>{entry.caloriesPer100g} kcal</span>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Clear All */}
            {entries.length > 0 && (
              <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 shrink-0">
                <button
                  onClick={handleClearAll}
                  className="w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All History
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
