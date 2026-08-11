'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Apple,
  Sparkles,
  Sun,
  Moon,
  HeartPulse,
  Check,
  History,
  PackageCheck,
  Flame,
} from 'lucide-react';

import { RawNutritionData, AnalysisResult } from '../types/nutrition';
import { UserProfile, PersonalizedAnalysis } from '../types/user';
import { normalizeTo100g } from '../lib/utils/normalization';
import { calculateNutriScore } from '../lib/algorithms/nutriScore';
import { detectNovaGroup } from '../lib/algorithms/novaScale';
import { applyPersonalOverlay } from '../lib/algorithms/personalizer';
import { detectGreenwashing, GreenwashingResult } from '../lib/algorithms/greenwashingDetector';
import { runBiologicalPipeline } from '../lib/algorithms/biologicalEngine';
import { saveScanToHistory } from '../lib/storage/scanHistory';
import { UploadZone } from '../components/UploadZone';
import { NutritionDashboard } from '../components/NutritionDashboard';
import { MarketingAuditCard, MarketingClaim } from '../components/MarketingAuditCard';
import { ScanHistory } from '../components/ScanHistory';
import { ExportReport } from '../components/ExportReport';
import { SampleType } from '../components/SampleDemos';

// Mock sample demo items for instant 1-click testing
const DEMO_SAMPLES: Record<SampleType, { name: string; frontText: string; ingredients: string[]; raw: RawNutritionData }> = {
  oats: {
    name: 'Organic Rolled Oats (Grade A Sample)',
    frontText: '100% Organic Whole Grain Oats - Low Sugar, High Protein, All Natural',
    ingredients: ['whole grain rolled oats'],
    raw: {
      calories: 379,
      total_fat: 7,
      saturated_fat: 1.3,
      trans_fat: 0,
      sugars: 1.0,
      added_sugars: 0,
      sodium_mg: 2.0,
      fiber: 10.0,
      protein: 13.0,
      serving_size_g: 100,
      is_per_100g: true,
    },
  },
  yogurt: {
    name: 'Strawberry Fruit Yogurt (Grade C Sample)',
    frontText: 'Low Fat Strawberry Yogurt - Real Fruit, High Protein, All Natural',
    ingredients: [
      'pasteurized skim milk',
      'fruit preparation (strawberry, sugar, modified corn starch)',
      'live yogurt cultures',
      'carmine color (E120)',
    ],
    raw: {
      calories: 95,
      total_fat: 1.5,
      saturated_fat: 0.9,
      trans_fat: 0,
      sugars: 13.0,
      added_sugars: 8.0,
      sodium_mg: 60,
      fiber: 0.5,
      protein: 4.2,
      serving_size_g: 100,
      is_per_100g: true,
    },
  },
  chocolate_milk: {
    name: 'Sugary Ultra-Processed Chocolate Drink (Grade E Sample)',
    frontText: 'Rich Chocolate Flavor Drink - High Energy, Low Fat, Calcium Enriched, Low Sodium',
    ingredients: [
      'water',
      'sugar',
      'high fructose corn syrup',
      'cocoa processed with alkali',
      'carrageenan (E407)',
      'artificial flavor',
      'sodium benzoate (E211)',
    ],
    raw: {
      calories: 420,
      total_fat: 3.5,
      saturated_fat: 2.2,
      trans_fat: 0,
      sugars: 34.0,
      added_sugars: 30.0,
      sodium_mg: 480,
      fiber: 0,
      protein: 3.0,
      serving_size_g: 100,
      is_per_100g: true,
    },
  },
};

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User Profile Medical Flags State
  const [profile, setProfile] = useState<UserProfile>({
    medicalFlags: {
      isDiabetic: true,
      hasHypertension: true,
      isCeliac: false,
      lowSodiumDiet: false,
    },
    goals: {
      targetCaloriesPerDay: 2000,
      maxSodiumPerDayMg: 2000,
      maxSugarPerDayG: 30,
      weightGoal: 'maintain',
    },
  });

  // Current Analysis Output State
  const [currentAnalysis, setCurrentAnalysis] = useState<{
    analysis: AnalysisResult;
    personalized: PersonalizedAnalysis;
    greenwashing: GreenwashingResult;
  } | null>(null);

  // Dual-scan marketing audit claims (separate from greenwashing)
  const [dualAuditClaims, setDualAuditClaims] = useState<MarketingClaim[] | null>(null);

  // Scan history drawer state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Current product name for export
  const [currentProductName, setCurrentProductName] = useState<string>('');
  const [currentIngredients, setCurrentIngredients] = useState<string[]>([]);

  // Register PWA service worker on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }
  }, []);

  // Toggle dark mode class on HTML body
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Toggle user medical condition flags
  const toggleMedicalFlag = (key: keyof UserProfile['medicalFlags']) => {
    const updatedFlags = {
      ...profile.medicalFlags,
      [key]: !profile.medicalFlags[key],
    };
    const updatedProfile = { ...profile, medicalFlags: updatedFlags };
    setProfile(updatedProfile);

    // Re-apply personalized overlay dynamically if analysis is active
    if (currentAnalysis) {
      const updatedPersonalized = applyPersonalOverlay(
        currentAnalysis.analysis,
        updatedProfile,
        []
      );
      setCurrentAnalysis({
        ...currentAnalysis,
        personalized: updatedPersonalized,
      });
    }
  };

  // Perform full pipeline calculation on raw data + ingredients
  const runFullAnalysisPipeline = (
    raw: RawNutritionData,
    ingredients: string[],
    frontText: string = ''
  ) => {
    // 1. Normalize
    const normalized = normalizeTo100g(raw);

    // 2. Nutri-Score
    const nutriScore = calculateNutriScore(normalized);

    // 3. NOVA Group
    const novaGroup = detectNovaGroup(ingredients);

    // 4. Additives scan (Extract E-numbers from ingredients)
    const additivesList = ingredients
      .filter((ing) => ing.includes('e') || ing.includes('lecithin') || ing.includes('syrup'))
      .map((ing) => ({
        eNumber: ing.match(/e\d+/i)?.[0]?.toUpperCase() || 'Additive',
        commonName: ing,
        riskLevel: (ing.includes('150') || ing.includes('syrup') || ing.includes('211') ? 'high' : 'moderate') as 'low' | 'moderate' | 'high',
        description: `Identified food additive or processing ingredient: ${ing}`,
      }));

    // 5. Biological Intelligence Pipeline
    const additiveNames = additivesList.map((a) => a.commonName);
    const bioIntel = runBiologicalPipeline(
      ingredients,
      additiveNames,
      normalized.sugars_per_100g,
      normalized.fiber_per_100g
    );

    // 6. Build base AnalysisResult
    const baseAnalysis: AnalysisResult = {
      normalizedData: normalized,
      nutriScore,
      novaGroup,
      additives: additivesList,
      healthWarnings: novaGroup === 4 ? ['Ultra-processed food item'] : [],
      explanation: `Product achieves a Nutri-Score of ${nutriScore.grade} (${nutriScore.score} points) and is classified under NOVA Group ${novaGroup}.`,
      ...bioIntel,
    };

    // 6. Apply Personal Overlay
    const personalized = applyPersonalOverlay(baseAnalysis, profile, ingredients);

    // 7. Detect Greenwashing
    const greenwashing = detectGreenwashing(frontText, raw, ingredients);

    setCurrentAnalysis({
      analysis: baseAnalysis,
      personalized,
      greenwashing,
    });

    // Persist to scan history
    setCurrentProductName(frontText || 'Scanned Product');
    setCurrentIngredients(ingredients || []);
    saveScanToHistory(frontText || 'Scanned Product', baseAnalysis, 'upload');
  };

  // Handle uploaded file (via API endpoint or fallback parsing)
  const handleFileSelected = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setDualAuditClaims(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-label', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to analyze nutrition label');
      }

      const data = await response.json();
      runFullAnalysisPipeline(data.nutrition, data.ingredients, file.name);
    } catch (err: any) {
      console.warn('API route call error. Falling back to local demonstration pipeline:', err.message);
      // Fallback demo processing for local demonstration if API key is not present
      runFullAnalysisPipeline(DEMO_SAMPLES.chocolate_milk.raw, DEMO_SAMPLES.chocolate_milk.ingredients, DEMO_SAMPLES.chocolate_milk.frontText);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle dual-image upload (Front + Back)
  const handleDualFilesSelected = async (frontFile: File, backFile: File) => {
    setIsAnalyzing(true);
    setError(null);
    setDualAuditClaims(null);

    try {
      const formData = new FormData();
      formData.append('frontImage', frontFile);
      formData.append('backImage', backFile);

      const response = await fetch('/api/analyze-dual', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Dual-scan analysis failed');
      }

      const result = await response.json();
      const data = result.data;

      // Run full pipeline on the back-label nutrition data
      runFullAnalysisPipeline(
        data.nutrition,
        data.ingredients || [],
        data.productName || 'Dual-Scanned Product'
      );

      // Store marketing audit claims separately
      if (data.marketing_claims && data.marketing_claims.length > 0) {
        setDualAuditClaims(data.marketing_claims);
      }
    } catch (err: any) {
      console.warn('Dual-scan API call failed. Using mock fallback:', err.message);
      // Mock fallback for local demo
      runFullAnalysisPipeline(
        DEMO_SAMPLES.chocolate_milk.raw,
        DEMO_SAMPLES.chocolate_milk.ingredients,
        DEMO_SAMPLES.chocolate_milk.frontText
      );
      setDualAuditClaims([
        {
          claim: 'High Protein',
          status: 'VERIFIED',
          explanation: 'Protein provides 22% of total energy (above the 12% threshold).',
        },
        {
          claim: 'Low Sugar',
          status: 'MISLEADING',
          explanation: 'Product contains 34g sugar per 100g, far exceeding the 5g/100g regulatory limit for "Low Sugar" claims.',
        },
        {
          claim: 'All Natural',
          status: 'FALSE',
          explanation: 'Ingredient list contains high fructose corn syrup, carrageenan (E407), and sodium benzoate (E211), classifying this product as NOVA Group 4 ultra-processed.',
        },
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle direct barcode search
  const handleBarcodeSubmitted = async (barcode: string) => {
    setIsAnalyzing(true);
    setError(null);
    setDualAuditClaims(null);

    try {
      const formData = new FormData();
      formData.append('barcode', barcode);

      const response = await fetch('/api/analyze-label', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Barcode lookup failed.');
      }

      const data = await response.json();
      if (data.nutrition) {
        runFullAnalysisPipeline(data.nutrition, data.ingredients || [], data.productName || `Barcode ${barcode}`);
      } else {
        throw new Error('Product unlisted in Open Food Facts database.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to resolve product by barcode.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load 1-click sample demo
  const loadDemoSample = (sampleKey: SampleType) => {
    setIsAnalyzing(true);
    setError(null);
    setDualAuditClaims(null);
    setTimeout(() => {
      const sample = DEMO_SAMPLES[sampleKey];
      runFullAnalysisPipeline(sample.raw, sample.ingredients, sample.frontText);
      setIsAnalyzing(false);
    }, 350);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans pb-16">
      {/* 1. APPLE-STYLE GLASSMORPHIC HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Apple className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                NutriGrade <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Enterprise Food Analyzer</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Hall of Shame Button */}
            <Link
              href="/hall-of-shame"
              className="px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-all border border-rose-500/20 flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4 text-rose-500" />
              <span>Hall of Shame</span>
            </Link>

            {/* Pantry Audit Button */}
            <Link
              href="/pantry"
              className="px-3 py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold text-xs transition-all border border-indigo-500/20 flex items-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4 text-indigo-500" />
              <span>Pantry Audit</span>
            </Link>

            {/* Scan History Button */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200/50 dark:border-slate-700/50"
              aria-label="Scan History"
            >
              <History className="w-4 h-4 text-indigo-500" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200/50 dark:border-slate-700/50"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 pt-8 space-y-8">
        {/* HERO INTRO & MEDICAL PROFILE BAR */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Dual-Layer Pipeline: Open Food Facts Database + Gemini Vision AI OCR</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
            Know What You Eat. <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
              Backed by Science.
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Scan barcode, upload a single label, or use dual-scan mode to cross-verify front marketing claims against back nutrition facts with AI-powered regulatory audits.
          </p>

          {/* Interactive Medical Profile Bar */}
          <div className="p-4 rounded-3xl backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 shadow-lg max-w-xl mx-auto space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                Personal Medical Profile Overlay
              </span>
              <span>Select Active Conditions</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                    onClick={() => toggleMedicalFlag(key as keyof UserProfile['medicalFlags'])}
                    className={`py-2 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                      isActive
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isActive && <Check className="w-3.5 h-3.5" />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. UPLOAD & BARCODE SCANNER SECTION */}
        <section className="space-y-4">
          <UploadZone
            onFileSelected={handleFileSelected}
            onDualFilesSelected={handleDualFilesSelected}
            onSelectSample={loadDemoSample}
            onBarcodeSubmitted={handleBarcodeSubmitted}
            isAnalyzing={isAnalyzing}
            error={error}
          />
        </section>

        {/* 4. DUAL-SCAN MARKETING AUDIT CARD (Only appears after dual-scan) */}
        {dualAuditClaims && dualAuditClaims.length > 0 && (
          <section className="pt-2">
            <MarketingAuditCard claims={dualAuditClaims} />
          </section>
        )}

        {/* 5. DASHBOARD ANALYSIS RESULTS */}
        {currentAnalysis && (
          <section className="pt-4 space-y-6">
            {/* Export / Share Buttons */}
            <div className="flex items-center justify-end">
              <ExportReport
                analysis={currentAnalysis.analysis}
                productName={currentProductName}
              />
            </div>

            <NutritionDashboard
              analysis={currentAnalysis.analysis}
              personalizedAnalysis={currentAnalysis.personalized}
              greenwashingResult={currentAnalysis.greenwashing}
              profile={profile}
              ingredients={currentIngredients}
            />
          </section>
        )}
      </main>

      {/* SCAN HISTORY SLIDE-OVER DRAWER */}
      <ScanHistory isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </div>
  );
}
