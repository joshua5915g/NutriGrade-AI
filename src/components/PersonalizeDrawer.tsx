'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  SlidersHorizontal,
  HeartPulse,
  Leaf,
  Check,
  Trash2,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { UserProfile, DietaryPreferences } from '../types/user';
import { DIETARY_CONFIG, DEFAULT_DIETARY_PREFERENCES } from './DietaryPreferencesModal';

interface PersonalizeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onToggleMedicalFlag: (key: keyof UserProfile['medicalFlags']) => void;
  onUpdateDietaryPreferences: (updated: DietaryPreferences) => void;
  onClearHealthData: () => void;
}

export const PersonalizeDrawer: React.FC<PersonalizeDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  onToggleMedicalFlag,
  onUpdateDietaryPreferences,
  onClearHealthData,
}) => {
  const activeMedicalCount = Object.values(profile.medicalFlags || {}).filter(Boolean).length;
  const activeDietaryCount = Object.values(profile.dietaryPreferences || {}).filter(Boolean).length;
  const totalActiveCount = activeMedicalCount + activeDietaryCount;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Right Sliding Sheet Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-white dark:bg-brand-darkCard border-l border-slate-200 dark:border-brand-cream/20 shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* DRAWER HEADER */}
              <div className="p-6 border-b border-slate-200/80 dark:border-brand-cream/20 flex items-center justify-between bg-slate-50/50 dark:bg-brand-darkBg/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-brand-lime/15 text-brand-lime">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Personalize My Scan
                      {totalActiveCount > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand-forest text-brand-lime font-bold shadow-sm border border-brand-lime/30">
                          {totalActiveCount} Active
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-brand-cream/80">
                      Configure active medical overlays &amp; dietary restrictions
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-brand-forest/40 text-slate-400 hover:text-slate-700 dark:hover:text-brand-cream transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* DRAWER SCROLLABLE BODY */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* SECTION 1: MEDICAL CONDITION OVERLAYS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-brand-cream/80">
                    <span className="flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-brand-rust" />
                      Medical Condition Overlays
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({activeMedicalCount}/4 Active)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { key: 'isDiabetic', label: 'Diabetic' },
                      { key: 'hasHypertension', label: 'Hypertension' },
                      { key: 'isCeliac', label: 'Celiac' },
                      { key: 'lowSodiumDiet', label: 'Low Sodium' },
                    ].map(({ key, label }) => {
                      const isActive = profile.medicalFlags[key as keyof UserProfile['medicalFlags']];
                      return (
                        <button
                          key={key}
                          onClick={() => onToggleMedicalFlag(key as keyof UserProfile['medicalFlags'])}
                          className={`py-3 px-3.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all border ${
                            isActive
                              ? 'bg-brand-forest text-brand-lime border-brand-lime/40 shadow-md shadow-brand-lime/10'
                              : 'bg-slate-100/80 dark:bg-brand-darkBg/60 text-slate-700 dark:text-brand-cream border-slate-200/80 dark:border-brand-cream/20 hover:bg-slate-200 dark:hover:bg-brand-forest/30'
                          }`}
                        >
                          <span>{label}</span>
                          {isActive ? (
                            <Check className="w-4 h-4 text-brand-lime shrink-0" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 2: LIFESTYLE DIETARY RESTRICTIONS */}
                <div className="space-y-3 pt-4 border-t border-slate-200/60 dark:border-brand-cream/20">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-brand-cream/80">
                    <span className="flex items-center gap-1.5">
                      <Leaf className="w-4 h-4 text-brand-lime" />
                      Dietary Preference Engine
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({activeDietaryCount} Active)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {DIETARY_CONFIG.map((item) => {
                      const isActive = profile.dietaryPreferences?.[item.key] || false;
                      return (
                        <button
                          key={item.key}
                          onClick={() => {
                            const updated = {
                              ...(profile.dietaryPreferences || DEFAULT_DIETARY_PREFERENCES),
                              [item.key]: !isActive,
                            };
                            onUpdateDietaryPreferences(updated);
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                            isActive
                              ? 'bg-brand-forest text-brand-lime border-brand-lime/40 shadow-md shadow-brand-lime/10'
                              : 'bg-slate-100/80 dark:bg-brand-darkBg/60 text-slate-700 dark:text-brand-cream border-slate-200/80 dark:border-brand-cream/20 hover:bg-slate-200 dark:hover:bg-brand-forest/30'
                          }`}
                        >
                          {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                          <span>{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PRIVACY & DATA WIPE BOX */}
                <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-brand-darkBg/80 border border-slate-200/60 dark:border-brand-cream/20 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-brand-cream">
                    <span className="flex items-center gap-1.5 text-brand-lime font-bold">
                      <Lock className="w-3.5 h-3.5" />
                      Client-Encrypted (Zero Telemetry)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-brand-cream/70 leading-relaxed">
                    Personal medical flags &amp; dietary filters are encrypted on your local device and never transmitted to backend servers.
                  </p>
                  <button
                    onClick={onClearHealthData}
                    className="w-full py-2.5 px-3 rounded-xl bg-brand-rust/10 hover:bg-brand-rust/20 text-brand-rust font-bold text-xs transition-all border border-brand-rust/30 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Wipe Local Health Data</span>
                  </button>
                </div>
              </div>

              {/* DRAWER FOOTER ACTION */}
              <div className="p-4 border-t border-slate-200/80 dark:border-brand-cream/20 bg-slate-50/50 dark:bg-brand-darkBg/50">
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-forest to-brand-lime hover:brightness-110 text-slate-950 font-black text-xs transition-all shadow-md"
                >
                  Apply Personalization Settings
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
