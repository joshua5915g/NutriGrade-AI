'use client';

import React from 'react';
import Link from 'next/link';
import { Apple, ArrowLeft, Sun, Moon, ShoppingCart, PackageCheck, Scale, Flame } from 'lucide-react';
import { DailyFuelTrackerView } from '../../components/DailyFuelTrackerView';

export default function TrackerPage() {
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans pb-16 bg-slate-50 dark:bg-brand-darkBg text-slate-900 dark:text-brand-cream transition-colors">
      {/* GLASSMORPHIC HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-brand-darkCard/70 border-b border-slate-200/60 dark:border-brand-cream/15 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-2xl bg-slate-100 dark:bg-brand-darkBg hover:bg-slate-200 dark:hover:bg-brand-forest/40 text-slate-600 dark:text-brand-cream transition-all border border-slate-200/50 dark:border-brand-cream/20 flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Scanner</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-gradient-to-tr from-brand-forest to-brand-lime text-brand-darkBg shadow-md shadow-brand-lime/20">
                <Apple className="w-5 h-5 font-bold" />
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                NutriGrade{' '}
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-lime/15 text-brand-lime font-bold border border-brand-lime/30">
                  Daily Fuel
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/compare"
              className="hidden sm:flex px-3 py-1.5 rounded-full bg-brand-forest/20 hover:bg-brand-forest/30 text-brand-cream font-semibold text-xs transition-all border border-brand-cream/30 items-center gap-1.5"
            >
              <Scale className="w-4 h-4 text-brand-lime" />
              <span>Compare</span>
            </Link>

            <Link
              href="/pantry"
              className="hidden sm:flex px-3 py-1.5 rounded-full bg-brand-forest/20 hover:bg-brand-forest/30 text-brand-cream font-semibold text-xs transition-all border border-brand-cream/30 items-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4 text-brand-lime" />
              <span>Pantry</span>
            </Link>

            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-brand-darkBg hover:bg-slate-200 dark:hover:bg-brand-forest/40 text-slate-600 dark:text-brand-cream transition-all border border-slate-200/50 dark:border-brand-cream/20"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-brand-lime" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 pt-8">
        <DailyFuelTrackerView />
      </main>
    </div>
  );
}
