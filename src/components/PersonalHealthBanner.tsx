'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Info,
} from 'lucide-react';

import { NormalizedNutritionData } from '../types/nutrition';
import { UserProfile, PersonalizedAlert } from '../types/user';

interface PersonalHealthBannerProps {
  profile: UserProfile;
  normalizedData: NormalizedNutritionData;
  alerts: PersonalizedAlert[];
  ingredients?: string[];
}

interface ConditionCheckResult {
  title: string;
  isPassed: boolean;
  reasoning: string;
}

export const PersonalHealthBanner: React.FC<PersonalHealthBannerProps> = ({
  profile,
  normalizedData,
  alerts,
  ingredients = [],
}) => {
  const { medicalFlags } = profile;

  // 1. Build check evaluations
  const checks: ConditionCheckResult[] = [];

  // Check A: Diabetic
  if (medicalFlags.isDiabetic) {
    const isPassed = normalizedData.sugars_per_100g <= 10;
    checks.push({
      title: 'Diabetic Compliance',
      isPassed,
      reasoning: isPassed
        ? `Diabetic Safe: Sugar content ${normalizedData.sugars_per_100g}g/100g is below the 10g/100g safety threshold.`
        : `High Sugar Warning: Sugar content ${normalizedData.sugars_per_100g}g/100g exceeds the 10g/100g diabetic safety limit.`,
    });
  }

  // Check B: Hypertension / Low Sodium
  if (medicalFlags.hasHypertension || medicalFlags.lowSodiumDiet) {
    const isPassed = normalizedData.sodium_mg_per_100g <= 400;
    checks.push({
      title: 'Hypertension / Low Sodium',
      isPassed,
      reasoning: isPassed
        ? `Low Sodium Safe: Sodium content ${normalizedData.sodium_mg_per_100g}mg/100g is below the 400mg safety threshold.`
        : `High Sodium Alert: Sodium content ${normalizedData.sodium_mg_per_100g}mg/100g exceeds 400mg/100g limit.`,
    });
  }

  // Check C: Celiac
  if (medicalFlags.isCeliac) {
    const celiacAlert = alerts.find((a) => a.type === 'celiac');
    const isPassed = !celiacAlert;
    checks.push({
      title: 'Celiac Disease',
      isPassed,
      reasoning: isPassed
        ? 'Gluten Free Verified: No gluten-containing ingredients detected in product packaging.'
        : `Gluten Warning: ${celiacAlert?.message || 'Gluten ingredients detected in product.'}`,
    });
  }

  // Calculate pass rates
  const totalActiveChecks = checks.length;
  const passedCount = checks.filter((c) => c.isPassed).length;
  const allPassed = totalActiveChecks > 0 && passedCount === totalActiveChecks;

  if (totalActiveChecks === 0) {
    return null; // Do not render banner if user has no active medical conditions selected
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-3xl backdrop-blur-xl border p-5 md:p-6 shadow-xl transition-all ${
        allPassed
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
      }`}
    >
      {/* Banner Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/40 dark:border-slate-800/40">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-2xl text-white shadow-md ${
              allPassed ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-amber-500 shadow-amber-500/30'
            }`}
          >
            {allPassed ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold tracking-tight flex items-center gap-2">
              Personal Health Check: {passedCount}/{totalActiveChecks} Passed
            </h3>
            <p className="text-xs opacity-80">
              Evaluated against your active medical conditions selected in your profile
            </p>
          </div>
        </div>

        <span
          className={`self-start sm:self-auto text-xs font-mono font-bold px-3 py-1 rounded-full shadow-sm ${
            allPassed
              ? 'bg-emerald-500 text-white'
              : 'bg-amber-500 text-white'
          }`}
        >
          {allPassed ? 'SUITABLE' : 'HEALTH RISK DETECTED'}
        </span>
      </div>

      {/* Individual Condition Check Items */}
      <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {checks.map((check, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-2xl border flex items-start gap-3 bg-white/70 dark:bg-slate-900/70 ${
              check.isPassed
                ? 'border-emerald-200 dark:border-emerald-900/50'
                : 'border-rose-200 dark:border-rose-900/50'
            }`}
          >
            {check.isPassed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <span className="text-xs font-bold block text-slate-900 dark:text-white">
                {check.title}
              </span>
              <p className="text-[11px] opacity-90 leading-relaxed text-slate-700 dark:text-slate-300">
                {check.isPassed ? '✅ ' : '⚠️ '}
                {check.reasoning}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
