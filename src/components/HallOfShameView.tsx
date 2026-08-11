'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  AlertTriangle,
  Sparkles,
  TrendingDown,
  ThumbsUp,
  Plus,
  X,
  Search,
  Filter,
  ShieldAlert,
} from 'lucide-react';

import { ShameFeedItem } from '../app/api/hall-of-shame/route';
import { HallOfShameCard } from './HallOfShameCard';

export const HallOfShameView: React.FC = () => {
  const [items, setItems] = useState<ShameFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'discrepancy' | 'upvotes'>('discrepancy');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  // Form state for submission modal
  const [newProductName, setNewProductName] = useState('');
  const [newFrontClaim, setNewFrontClaim] = useState('');
  const [newActualGrade, setNewActualGrade] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('E');
  const [newActualDetails, setNewActualDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = async (sortOption = sortBy) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hall-of-shame?sortBy=${sortOption}`);
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Error fetching Hall of Shame items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(sortBy);
  }, [sortBy]);

  const handleSortChange = (newSort: 'discrepancy' | 'upvotes') => {
    setSortBy(newSort);
  };

  const handleNewSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newFrontClaim) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/hall-of-shame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          productName: newProductName,
          frontClaim: newFrontClaim,
          actualGrade: newActualGrade,
          actualDetails: newActualDetails || 'High Sugar & Processing Discrepancy',
          discrepancyScore: 92,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSubmitOpen(false);
        setNewProductName('');
        setNewFrontClaim('');
        setNewActualDetails('');
        fetchItems();
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.productName.toLowerCase().includes(q) ||
      item.frontClaim.toLowerCase().includes(q) ||
      item.actualDetails.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
      {/* HERO BANNER SECTION */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-500 font-bold text-xs border border-rose-500/20 shadow-sm">
          <Flame className="w-4 h-4" />
          <span>Public Greenwashing Watchdog</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          Greenwashing <br />
          <span className="bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
            Hall of Shame
          </span>
        </h1>

        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Exposing misleading front-of-package marketing claims against laboratory-verified nutrition facts. Vote, submit, and share deceptive products!
        </p>

        {/* Action Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Expose a Product</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 shadow-lg">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search misleading products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all"
          />
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Sort By:
          </span>
          <button
            onClick={() => handleSortChange('discrepancy')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              sortBy === 'discrepancy'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Highest Discrepancy
          </button>
          <button
            onClick={() => handleSortChange('upvotes')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              sortBy === 'upvotes'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Most Upvoted
          </button>
        </div>
      </div>

      {/* ITEMS GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Flame className="w-8 h-8 text-rose-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-400">
            Loading Greenwashing Community Feed...
          </span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 shadow-xl space-y-3">
          <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No greenwashing products match your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <HallOfShameCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* SUBMISSION MODAL */}
      <AnimatePresence>
        {isSubmitOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSubmitOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-20 z-50 max-w-lg mx-auto p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-rose-500/30 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                  <Flame className="w-5 h-5" />
                  <span>Expose a Greenwashing Product</span>
                </div>
                <button
                  onClick={() => setIsSubmitOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleNewSubmission} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FitBerry Energy Smoothie"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Front Package Marketing Claim
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 100% Natural, Low Sugar, High Protein"
                    value={newFrontClaim}
                    onChange={(e) => setNewFrontClaim(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Actual Nutri-Score Grade
                    </label>
                    <select
                      value={newActualGrade}
                      onChange={(e) => setNewActualGrade(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                    >
                      <option value="E">Grade E (Worst)</option>
                      <option value="D">Grade D</option>
                      <option value="C">Grade C</option>
                      <option value="B">Grade B</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Reality Details
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 38g Added Sugar, NOVA 4"
                      value={newActualDetails}
                      onChange={(e) => setNewActualDetails(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Flame className="w-4 h-4" />
                  <span>{isSubmitting ? 'Publishing...' : 'Expose to Hall of Shame'}</span>
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
