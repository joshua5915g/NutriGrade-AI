'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export type SampleType = 'oats' | 'yogurt' | 'chocolate_milk';

interface SampleDemosProps {
  onSelectSample: (sampleType: SampleType) => void;
}

export const SampleDemos: React.FC<SampleDemosProps> = ({ onSelectSample }) => {
  return (
    <div
      className="mt-5 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-wrap items-center justify-center gap-2 text-xs"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-slate-400 font-medium flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Or try with a sample package:
      </span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelectSample('oats')}
          className="px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 transition-all active:scale-95 flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-[#008B4C]" />
          <span>Organic Oats (Grade A)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectSample('yogurt')}
          className="px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20 transition-all active:scale-95 flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-[#FECB02]" />
          <span>Fruit Yogurt (Grade C)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectSample('chocolate_milk')}
          className="px-3 py-1 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20 transition-all active:scale-95 flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-[#E63312]" />
          <span>Sugary Chocolate Milk (Grade E)</span>
        </button>
      </div>
    </div>
  );
};
