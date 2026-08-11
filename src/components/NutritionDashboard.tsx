'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Eye,
  HeartPulse,
} from 'lucide-react';

import { AnalysisResult } from '../types/nutrition';
import { UserProfile, PersonalizedAnalysis, PersonalizedAlert } from '../types/user';
import { GreenwashingResult } from '../lib/algorithms/greenwashingDetector';
import { NutriScoreBadge } from './NutriScoreBadge';
import { NutriScoreAccordion } from './NutriScoreAccordion';
import { PersonalHealthBanner } from './PersonalHealthBanner';
import { AdditiveInspector } from './AdditiveInspector';
import { HealthySwaps } from './HealthySwaps';
import { PortionScaler } from './PortionScaler';
import { GlycemicAndGutCard } from './GlycemicAndGutCard';
import { RegulatoryAndHiddenSugarsCard } from './RegulatoryAndHiddenSugarsCard';
import { SeedOilBanner } from './SeedOilBanner';
import { FopNutritionBox } from './FopNutritionBox';
import { detectSeedOils } from '../lib/algorithms/seedOilRadar';
import { calculateFdaFop } from '../lib/algorithms/fdaFopSimulator';

interface NutritionDashboardProps {
  analysis: AnalysisResult;
  personalizedAnalysis?: PersonalizedAnalysis | null;
  greenwashingResult?: GreenwashingResult | null;
  profile?: UserProfile | null;
  ingredients?: string[];
}

export const NutritionDashboard: React.FC<NutritionDashboardProps> = ({
  analysis,
  personalizedAnalysis,
  greenwashingResult,
  profile,
  ingredients = [],
}) => {
  const { normalizedData, nutriScore, novaGroup, additives, explanation } = analysis;
  const alerts: PersonalizedAlert[] = personalizedAnalysis?.personalizedAlerts || [];

  // Compute Seed Oil Radar & FDA FOP Compliance metrics dynamically
  const ingredientStrings = ingredients.length > 0
    ? ingredients
    : additives.map((a) => a.commonName).concat(explanation ? [explanation] : []);
  const seedOilResult = detectSeedOils(ingredientStrings);
  const fdaFopResult = calculateFdaFop(normalizedData);

  // Default active profile fallback
  const userProfile: UserProfile = profile || {
    medicalFlags: {
      isDiabetic: true,
      hasHypertension: true,
      isCeliac: false,
      lowSodiumDiet: false,
    },
    goals: {},
  };

  // Helper for NOVA group configurations
  const getNovaConfig = (group: number) => {
    switch (group) {
      case 1:
        return {
          title: 'NOVA 1: Unprocessed Food',
          desc: 'Minimal or no industrial processing. Natural whole food.',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          badgeBg: 'bg-emerald-500',
        };
      case 2:
        return {
          title: 'NOVA 2: Processed Culinary Ingredient',
          desc: 'Direct culinary substances like oils, salt, or butter.',
          color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
          badgeBg: 'bg-sky-500',
        };
      case 3:
        return {
          title: 'NOVA 3: Processed Food',
          desc: 'Simple foods combined with culinary ingredients (e.g. canned beans, cheese).',
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          badgeBg: 'bg-amber-500',
        };
      case 4:
      default:
        return {
          title: 'NOVA 4: Ultra-Processed Food',
          desc: 'Formulated with industrial additives, emulsifiers, and flavor enhancers.',
          color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          badgeBg: 'bg-rose-500',
        };
    }
  };

  const novaInfo = getNovaConfig(novaGroup);

  // Helper status functions for 6 macro cards
  const getSugarStatus = (sugars: number) => {
    if (sugars <= 5) return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Healthy' };
    if (sugars <= 15) return { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Moderate' };
    return { color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'High Risk' };
  };

  const getSodiumStatus = (sodiumMg: number) => {
    if (sodiumMg <= 120) return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Low Sodium' };
    if (sodiumMg <= 400) return { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Moderate' };
    return { color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'High Sodium' };
  };

  const getFatStatus = (fat: number) => {
    if (fat <= 3) return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Low Fat' };
    if (fat <= 10) return { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Moderate' };
    return { color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'High Fat' };
  };

  const getProteinStatus = (protein: number) => {
    if (protein >= 8.0) return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'High Protein' };
    if (protein >= 5.0) return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Source of Protein' };
    if (protein >= 3.2) return { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Moderate' };
    return { color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Low Protein' };
  };

  const getFiberStatus = (fiber: number) => {
    if (fiber >= 3.0) return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'High Fiber' };
    if (fiber >= 1.4) return { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Moderate' };
    return { color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Low Fiber' };
  };

  const sugarStatus = getSugarStatus(normalizedData.sugars_per_100g);
  const sodiumStatus = getSodiumStatus(normalizedData.sodium_mg_per_100g);
  const fatStatus = getFatStatus(normalizedData.total_fat_per_100g);
  const proteinStatus = getProteinStatus(normalizedData.protein_per_100g);
  const fiberStatus = getFiberStatus(normalizedData.fiber_per_100g);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto space-y-6 md:space-y-8"
    >
      {/* 1. PERSONAL HEALTH VERIFICATION BANNER */}
      <PersonalHealthBanner
        profile={userProfile}
        normalizedData={normalizedData}
        alerts={alerts}
      />

      {/* 2. HERO VERDICT CARD */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 shadow-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>AI Analysis Complete</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Food Nutritional Rating
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              {explanation}
            </p>
          </div>

          {/* Nutri-Score Hero Component */}
          <div className="shrink-0 flex flex-col items-center p-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-700/40">
            <NutriScoreBadge grade={nutriScore.grade} score={nutriScore.score} size="lg" />
          </div>
        </div>
      </div>

      {/* 3. NUTRI-SCORE CALCULATION ACCORDION */}
      <NutriScoreAccordion nutriScore={nutriScore} />

      {/* 3B. FDA FRONT-OF-PACKAGE (FOP) COMPLIANCE SIMULATOR */}
      <FopNutritionBox fopResult={fdaFopResult} />

      {/* 4. PERSONAL HEALTH ALERTS BANNER */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl backdrop-blur-xl bg-rose-500/10 border border-rose-500/30 p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200">
                Personalized Health Warnings ({alerts.length})
              </h3>
              <p className="text-xs text-rose-700/80 dark:text-rose-300/80">
                Flagged based on your medical profile and dietary restrictions
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-rose-950 dark:text-rose-100">
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 5. KEY METRICS GRID (6 Cards: 3x2 Desktop, 2x3 Tablet) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Card 1: Energy Density */}
        <div className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Energy Density
            </span>
            <div className="p-2 rounded-2xl bg-orange-500/10 text-orange-500">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {normalizedData.calories_per_100g}
              <span className="text-sm font-normal text-slate-500 ml-1">kcal / 100g</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {(normalizedData.calories_per_100g * 4.184).toFixed(0)} kJ per 100g
            </span>
          </div>
        </div>

        {/* Card 2: Sugars */}
        <div className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sugars
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${sugarStatus.bg} ${sugarStatus.color}`}
            >
              {sugarStatus.label}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {normalizedData.sugars_per_100g}
              <span className="text-sm font-normal text-slate-500 ml-1">g / 100g</span>
            </div>
            {normalizedData.added_sugars_per_100g > 0 && (
              <span className="text-xs text-rose-500 mt-1 block truncate">
                Includes {normalizedData.added_sugars_per_100g}g added sugars
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Total Fat */}
        <div className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Fat
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${fatStatus.bg} ${fatStatus.color}`}
            >
              {fatStatus.label}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {normalizedData.total_fat_per_100g}
              <span className="text-sm font-normal text-slate-500 ml-1">g / 100g</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block truncate">
              Saturated: {normalizedData.saturated_fat_per_100g}g / 100g
            </span>
          </div>
        </div>

        {/* Card 4: Sodium */}
        <div className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sodium
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${sodiumStatus.bg} ${sodiumStatus.color}`}
            >
              {sodiumStatus.label}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {normalizedData.sodium_mg_per_100g}
              <span className="text-sm font-normal text-slate-500 ml-1">mg / 100g</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block truncate">
              Salt eq: {(normalizedData.sodium_mg_per_100g / 400).toFixed(2)}g
            </span>
          </div>
        </div>

        {/* Card 5: Protein */}
        <div className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Protein
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${proteinStatus.bg} ${proteinStatus.color}`}
            >
              {proteinStatus.label}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {normalizedData.protein_per_100g}
              <span className="text-sm font-normal text-slate-500 ml-1">g / 100g</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block truncate">
              {((normalizedData.protein_per_100g * 4 / (normalizedData.calories_per_100g || 1)) * 100).toFixed(0)}% of total energy
            </span>
          </div>
        </div>

        {/* Card 6: Dietary Fiber */}
        <div className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Dietary Fiber
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${fiberStatus.bg} ${fiberStatus.color}`}
            >
              {fiberStatus.label}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {normalizedData.fiber_per_100g}
              <span className="text-sm font-normal text-slate-500 ml-1">g / 100g</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block truncate">
              Digestion & gut health
            </span>
          </div>
        </div>
      </div>

      {/* 6. PORTION SIZE SCALER */}
      <PortionScaler
        normalizedData={normalizedData}
        glycemicLoad={analysis.glycemic_load ?? 0}
      />

      {/* 7. GLYCEMIC IMPACT & GUT MICROBIOME HEALTH */}
      <GlycemicAndGutCard
        glycemicIndexEstimate={analysis.glycemic_index_estimate ?? 0}
        glycemicLoad={analysis.glycemic_load ?? 0}
        glycemicImpactLevel={analysis.glycemic_impact_level ?? 'Low'}
        gutHealthScore={analysis.gut_health_score ?? 100}
        gutDisruptors={analysis.gut_disruptors_detected ?? []}
      />

      {/* 8. REGULATORY ALERTS, HIDDEN SUGARS & ALLERGENS */}
      <RegulatoryAndHiddenSugarsCard
        regulatoryAlerts={analysis.regulatory_alerts ?? []}
        hiddenSugars={analysis.hidden_sugars_found ?? []}
        allergenWarnings={analysis.allergen_warnings ?? []}
      />

      {/* 8B. SEED OIL & INFLAMMATORY FAT RADAR BANNER */}
      <SeedOilBanner result={seedOilResult} />

      {/* 9. NOVA ULTRA-PROCESSING LEVEL CARD */}
      <div
        className={`rounded-3xl backdrop-blur-xl border p-6 md:p-8 shadow-xl transition-all ${novaInfo.color}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span
              className={`w-8 h-8 rounded-full ${novaInfo.badgeBg} text-white flex items-center justify-center font-black text-sm shadow-md`}
            >
              {novaGroup}
            </span>
            <h3 className="text-lg font-bold tracking-tight">{novaInfo.title}</h3>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/50 dark:bg-black/30 backdrop-blur-md">
            NOVA System
          </span>
        </div>
        <p className="text-sm opacity-90 leading-relaxed ml-11">{novaInfo.desc}</p>
      </div>

      {/* 7. SCIENTIFIC ADDITIVE HAZARD INSPECTOR */}
      <AdditiveInspector additives={additives} />

      {/* 8. HEALTHY SWAPS RECOMMENDATIONS ENGINE (Triggered for Nutri-Score C, D, E) */}
      <HealthySwaps
        productName={explanation}
        currentGrade={nutriScore.grade}
      />

      {/* 9. FRONT VS. BACK GREENWASHING AUDIT CARD */}
      {greenwashingResult && greenwashingResult.claims.length > 0 && (
        <div className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-500">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Front vs. Back Marketing Audit
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verifying packaging claims against back-of-package nutritional facts
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {greenwashingResult.claims.map((claim, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex items-start gap-4 ${
                  claim.isMisleading
                    ? 'bg-rose-500/5 border-rose-500/20 text-rose-950 dark:text-rose-100'
                    : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-950 dark:text-emerald-100'
                }`}
              >
                {claim.isMisleading ? (
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{claim.claim}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        claim.isMisleading
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {claim.isMisleading ? 'MISLEADING CLAIM' : 'VERIFIED CLAIM'}
                    </span>
                  </div>
                  <p className="text-xs opacity-90 leading-relaxed">{claim.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
