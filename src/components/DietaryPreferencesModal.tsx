'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  X,
  Check,
  Trees,
  Leaf,
  Salad,
  Milk,
  Wheat,
  FlaskConical,
  CircleOff,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, DietaryPreferences } from '../types/user';

interface DietaryPreferencesModalProps {
  profile: UserProfile;
  onUpdatePreferences: (updatedPrefs: DietaryPreferences) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const DIETARY_CONFIG: {
  key: keyof DietaryPreferences;
  title: string;
  desc: string;
  icon: React.ReactNode;
  activeColor: string;
}[] = [
  {
    key: 'palmOilFree',
    title: 'Palm Oil Free',
    desc: 'Avoids palm oil, palm kernel, palmitates linked to deforestation',
    icon: <Trees className="w-4 h-4 text-emerald-500" />,
    activeColor: 'bg-emerald-600 border-emerald-600 text-white',
  },
  {
    key: 'isVegan',
    title: 'Vegan Diet',
    desc: 'Strictly 100% plant-based. Blocks meat, dairy, eggs, gelatin, carmine, honey',
    icon: <Leaf className="w-4 h-4 text-green-500" />,
    activeColor: 'bg-green-600 border-green-600 text-white',
  },
  {
    key: 'isVegetarian',
    title: 'Vegetarian',
    desc: 'Blocks animal meat, slaughter byproducts, gelatin, and carmine',
    icon: <Salad className="w-4 h-4 text-teal-500" />,
    activeColor: 'bg-teal-600 border-teal-600 text-white',
  },
  {
    key: 'isPorkFree',
    title: 'Pork Free',
    desc: 'Excludes all pork derivatives, lard, bacon, and porcine gelatin',
    icon: <CircleOff className="w-4 h-4 text-rose-500" />,
    activeColor: 'bg-rose-600 border-rose-600 text-white',
  },
  {
    key: 'isLactoseFree',
    title: 'Lactose Free',
    desc: 'Flags milk solids, whey, casein, butter, lactose, and dairy',
    icon: <Milk className="w-4 h-4 text-sky-500" />,
    activeColor: 'bg-sky-600 border-sky-600 text-white',
  },
  {
    key: 'isSoyFree',
    title: 'Soy Free',
    desc: 'Excludes soy protein, soy lecithin (E322), soybean oil, and tofu',
    icon: <FlaskConical className="w-4 h-4 text-amber-500" />,
    activeColor: 'bg-amber-600 border-amber-600 text-white',
  },
  {
    key: 'isSulfiteFree',
    title: 'Sulfite Free',
    desc: 'Flags sulfite preservatives E220–E228 triggering asthma/allergies',
    icon: <FlaskConical className="w-4 h-4 text-purple-500" />,
    activeColor: 'bg-purple-600 border-purple-600 text-white',
  },
  {
    key: 'isGlutenFree',
    title: 'Gluten Free',
    desc: 'Excludes wheat, barley, rye, oats, spelt, and malt markers',
    icon: <Wheat className="w-4 h-4 text-amber-600" />,
    activeColor: 'bg-amber-700 border-amber-700 text-white',
  },
];

export const DEFAULT_DIETARY_PREFERENCES: DietaryPreferences = {
  palmOilFree: false,
  isVegan: false,
  isVegetarian: false,
  isPorkFree: false,
  isLactoseFree: false,
  isSoyFree: false,
  isSulfiteFree: false,
  isGlutenFree: false,
};

export const DietaryPreferencesModal: React.FC<DietaryPreferencesModalProps> = ({
  profile,
  onUpdatePreferences,
  isOpen = false,
  onClose,
}) => {
  const currentPrefs: DietaryPreferences = {
    ...DEFAULT_DIETARY_PREFERENCES,
    ...(profile.dietaryPreferences || {}),
  };

  const activeCount = Object.values(currentPrefs).filter(Boolean).length;

  const togglePreference = (key: keyof DietaryPreferences) => {
    const updated = {
      ...currentPrefs,
      [key]: !currentPrefs[key],
    };
    onUpdatePreferences(updated);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* MODAL HEADER */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Yuka Dietary Preferences
                    {activeCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500 text-white font-semibold">
                        {activeCount} Active
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select your lifestyle & dietary restrictions for real-time safety warnings & smart swap filtering
                  </p>
                </div>
              </div>

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* PREFERENCES GRID */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {DIETARY_CONFIG.map((item) => {
                const isActive = currentPrefs[item.key];

                return (
                  <button
                    key={item.key}
                    onClick={() => togglePreference(item.key)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 group ${
                      isActive
                        ? item.activeColor + ' shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/30'
                        : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {item.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm truncate">{item.title}</span>
                        {isActive && <Check className="w-4 h-4 shrink-0 text-white" />}
                      </div>
                      <p
                        className={`text-xs mt-1 leading-relaxed ${
                          isActive ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* FOOTER */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Real-time ingredient scanning & swap filtering active
              </span>

              {onClose && (
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-500/20"
                >
                  Done
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
