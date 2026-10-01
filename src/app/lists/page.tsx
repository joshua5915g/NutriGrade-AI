'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import {
  ShoppingCart,
  Plus,
  Check,
  Trash2,
  Share2,
  Copy,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  ListPlus,
  Tag,
  CheckSquare,
  Square,
} from 'lucide-react';

import { NutriScoreGrade } from '../../types/nutrition';
import {
  ShoppingList,
  ShoppingListItem,
  getLists,
  createList,
  deleteList,
  addToList,
  removeFromList,
  toggleListItemChecked,
  exportListAsText,
} from '../../lib/storage/shoppingLists';

export default function ListsPage() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeListId, setActiveListId] = useState<string>('');
  const [newListName, setNewListName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemGrade, setNewItemGrade] = useState<NutriScoreGrade>('A');
  const [copyNotification, setCopyNotification] = useState(false);
  const [isCreatingList, setIsCreatingList] = useState(false);

  const reloadLists = () => {
    const data = getLists();
    setLists(data);
    if (data.length > 0 && !activeListId) {
      setActiveListId(data[0].id);
    }
  };

  useEffect(() => {
    reloadLists();
  }, []);

  const activeList = lists.find((l) => l.id === activeListId) || lists[0] || null;

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const created = createList(newListName.trim());
    setNewListName('');
    setIsCreatingList(false);
    setLists(getLists());
    setActiveListId(created.id);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeList || !newItemName.trim()) return;

    addToList(activeList.id, {
      productName: newItemName.trim(),
      grade: newItemGrade,
      category: 'Healthy Staples',
    });

    setNewItemName('');
    reloadLists();
  };

  const handleToggleItem = (itemId: string) => {
    if (!activeList) return;
    toggleListItemChecked(activeList.id, itemId);
    reloadLists();
  };

  const handleRemoveItem = (itemId: string) => {
    if (!activeList) return;
    removeFromList(activeList.id, itemId);
    reloadLists();
  };

  const handleDeleteActiveList = () => {
    if (!activeList) return;
    deleteList(activeList.id);
    const remaining = getLists();
    setLists(remaining);
    if (remaining.length > 0) {
      setActiveListId(remaining[0].id);
    }
  };

  const handleCopyTextExport = () => {
    if (!activeList) return;
    const text = exportListAsText(activeList.id);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopyNotification(true);
      setTimeout(() => setCopyNotification(false), 2500);
    }
  };

  const completedCount = activeList?.items.filter((i) => i.isChecked).length || 0;
  const totalCount = activeList?.items.length || 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col font-sans pb-16 bg-slate-50 dark:bg-brand-darkBg text-slate-900 dark:text-brand-cream transition-colors">
      <Navbar />

      {/* TOAST COPY NOTIFICATION */}
      <AnimatePresence>
        {copyNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Shopping list text copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 pt-8 space-y-6">
        {/* HERO TITLE & LIST SELECTOR */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                <ShoppingCart className="w-7 h-7 text-emerald-500" />
                Healthy Grocery Lists
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Check off verified Grade A & B food items at the grocery store with 1-click text export.
              </p>
            </div>

            <button
              onClick={() => setIsCreatingList(!isCreatingList)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
            >
              <ListPlus className="w-4 h-4" />
              <span>Create New List</span>
            </button>
          </div>

          {/* CREATE LIST FORM */}
          {isCreatingList && (
            <form onSubmit={handleCreateList} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex gap-2">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name (e.g. Low Sodium Weekly Pantry)..."
                className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors"
              >
                Save List
              </button>
            </form>
          )}

          {/* LIST SELECTOR TABS */}
          {lists.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {lists.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setActiveListId(l.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border whitespace-nowrap ${
                    activeList?.id === l.id
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {l.name} ({l.items.length})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ACTIVE LIST CONTENT CARD */}
        {activeList && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xl p-6 md:p-8 space-y-6">
            {/* TOP BAR: LIST NAME, PROGRESS BAR, & DELETE */}
            <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {activeList.name}
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">
                    {completedCount} of {totalCount} items completed ({progressPct}%)
                  </span>
                </div>

                {lists.length > 1 && (
                  <button
                    onClick={handleDeleteActiveList}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* ADD ITEM FORM */}
            <form onSubmit={handleAddItem} className="flex gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Add new healthy food item (e.g. Avocado, Almond Milk)..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />

              <select
                value={newItemGrade}
                onChange={(e) => setNewItemGrade(e.target.value as NutriScoreGrade)}
                className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </form>

            {/* ITEMS CHECKLIST */}
            <div className="space-y-2 divide-y divide-slate-100 dark:divide-slate-800/60 pt-2">
              {activeList.items.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  This shopping list is currently empty. Add healthy items above or save items directly from food analysis.
                </div>
              ) : (
                activeList.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleItem(item.id)}
                    className={`py-3 px-3 rounded-2xl transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                      item.isChecked
                        ? 'bg-slate-50/50 dark:bg-slate-950/40 opacity-60'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.isChecked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-emerald-500 transition-colors" />
                      )}

                      <div className="flex flex-col min-w-0">
                        <span
                          className={`text-sm font-bold truncate ${
                            item.isChecked
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {item.productName}
                        </span>

                        {item.brand && (
                          <span className="text-[11px] text-slate-400 font-medium truncate">
                            {item.brand}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          item.grade === 'A'
                            ? 'bg-emerald-500 text-white'
                            : item.grade === 'B'
                            ? 'bg-teal-500 text-white'
                            : 'bg-amber-400 text-slate-900'
                        }`}
                      >
                        Grade {item.grade}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
