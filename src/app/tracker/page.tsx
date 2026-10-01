'use client';

import React from 'react';
import { DailyFuelTrackerView } from '../../components/DailyFuelTrackerView';
import { Navbar } from '../../components/Navbar';

export default function TrackerPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans pb-16 bg-slate-50 dark:bg-brand-darkBg text-slate-900 dark:text-brand-cream transition-colors">
      <Navbar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 pt-8">
        <DailyFuelTrackerView />
      </main>
    </div>
  );
}
