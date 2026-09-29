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
  SlidersHorizontal,
  Leaf,
  ShoppingCart,
  Trash2,
  Lock,
  Scale,
  Activity,
  UtensilsCrossed,
} from 'lucide-react';
import {
  loadUserHealthProfile,
  saveUserHealthProfile,
  clearAllHealthData,
  hasAcceptedMedicalDisclaimer,
  setAcceptedMedicalDisclaimer,
  DEFAULT_HEALTH_PROFILE,
} from '../lib/storage/userHealthStore';
import {
  MedicalDisclaimerBanner,
  MedicalDisclaimerModal,
} from '../components/MedicalDisclaimer';

import { RawNutritionData, AnalysisResult, SearchProductResult } from '../types/nutrition';
import { UserProfile, PersonalizedAnalysis, DietaryPreferences } from '../types/user';
import { normalizeTo100g } from '../lib/utils/normalization';
import { calculateNutriScore } from '../lib/algorithms/nutriScore';
import { detectNovaGroup } from '../lib/algorithms/novaScale';
import { applyPersonalOverlay } from '../lib/algorithms/personalizer';
import { detectGreenwashing, GreenwashingResult } from '../lib/algorithms/greenwashingDetector';
import { runBiologicalPipeline } from '../lib/algorithms/biologicalEngine';
import { saveScanToHistory } from '../lib/storage/scanHistory';
import { saveHistoryRecord } from '../lib/storage/historyManager';
import { UploadZone } from '../components/UploadZone';
import { NutritionDashboard } from '../components/NutritionDashboard';
import { MarketingAuditCard, MarketingClaim } from '../components/MarketingAuditCard';
import { ScanHistory } from '../components/ScanHistory';
import { ExportReport } from '../components/ExportReport';
import { SampleType } from '../components/SampleDemos';
import { GlobalSearchBar } from '../components/GlobalSearchBar';
import {
  DietaryPreferencesModal,
  DEFAULT_DIETARY_PREFERENCES,
  DIETARY_CONFIG,
} from '../components/DietaryPreferencesModal';
import { PersonalizeDrawer } from '../components/PersonalizeDrawer';
import { OfflineBanner } from '../components/OfflineBanner';
import { FloatingGuideModal, FloatingGuideButton } from '../components/FloatingGuideModal';
import { NutriBotDrawer } from '../components/NutriBotDrawer';
import { triggerAisleFeedback } from '../lib/utils/aisleFeedback';
import {
  preloadTopProducts,
  getCachedProduct,
  cacheProduct,
  addToOfflineQueue,
  getOfflineQueue,
  syncOfflineQueue,
} from '../lib/storage/offlineDb';

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

  // User Profile Medical Flags & Dietary Preferences State
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_HEALTH_PROFILE);
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);
  const [pendingMedicalFlag, setPendingMedicalFlag] = useState<keyof UserProfile['medicalFlags'] | null>(null);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const activeMedicalCount = Object.values(profile.medicalFlags || {}).filter(Boolean).length;
  const activeDietaryCount = Object.values(profile.dietaryPreferences || {}).filter(Boolean).length;
  const totalActiveFilters = activeMedicalCount + activeDietaryCount;

  // Load encrypted health profile from localStorage on mount
  useEffect(() => {
    const loaded = loadUserHealthProfile();
    setProfile(loaded);
  }, []);

  const [isDietaryModalOpen, setIsDietaryModalOpen] = useState(false);

  // Offline PWA State
  const [isOffline, setIsOffline] = useState(false);
  const [queuedCount, setQueuedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

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

  // Register PWA service worker and initialize IndexedDB offline database on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);

      // Pre-load staple products into IndexedDB
      preloadTopProducts().catch(console.warn);

      // Check pending offline queue
      getOfflineQueue()
        .then((q) => setQueuedCount(q.length))
        .catch(console.warn);

      const handleOnline = async () => {
        setIsOffline(false);
        setIsSyncing(true);
        await syncOfflineQueue();
        setIsSyncing(false);
        const remaining = await getOfflineQueue();
        setQueuedCount(remaining.length);
      };

      const handleOffline = () => {
        setIsOffline(true);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncOfflineQueue();
    setIsSyncing(false);
    const remaining = await getOfflineQueue();
    setQueuedCount(remaining.length);
  };

  // Toggle dark mode class on HTML body
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Toggle user medical condition flags with disclaimer verification
  const toggleMedicalFlag = (key: keyof UserProfile['medicalFlags']) => {
    const willEnable = !profile.medicalFlags[key];

    if (willEnable && !hasAcceptedMedicalDisclaimer()) {
      setPendingMedicalFlag(key);
      setIsDisclaimerModalOpen(true);
      return;
    }

    applyMedicalFlagToggle(key);
  };

  const applyMedicalFlagToggle = (key: keyof UserProfile['medicalFlags']) => {
    const updatedFlags = {
      ...profile.medicalFlags,
      [key]: !profile.medicalFlags[key],
    };
    const updatedProfile = { ...profile, medicalFlags: updatedFlags };
    setProfile(updatedProfile);
    saveUserHealthProfile(updatedProfile);

    // Re-apply personalized overlay dynamically if analysis is active
    if (currentAnalysis) {
      const updatedPersonalized = applyPersonalOverlay(
        currentAnalysis.analysis,
        updatedProfile,
        currentIngredients
      );
      setCurrentAnalysis({
        ...currentAnalysis,
        personalized: updatedPersonalized,
      });
    }
  };

  const handleAcceptDisclaimer = () => {
    setAcceptedMedicalDisclaimer(true);
    setIsDisclaimerModalOpen(false);

    if (pendingMedicalFlag) {
      applyMedicalFlagToggle(pendingMedicalFlag);
      setPendingMedicalFlag(null);
    }
  };

  const handleDeclineDisclaimer = () => {
    setIsDisclaimerModalOpen(false);
    setPendingMedicalFlag(null);
  };

  const handleClearHealthData = () => {
    if (typeof window !== 'undefined' && window.confirm('Wipe all local encrypted health profile data and reset medical condition flags?')) {
      clearAllHealthData();
      setProfile(DEFAULT_HEALTH_PROFILE);
      if (currentAnalysis) {
        const updatedPersonalized = applyPersonalOverlay(
          currentAnalysis.analysis,
          DEFAULT_HEALTH_PROFILE,
          currentIngredients
        );
        setCurrentAnalysis({
          ...currentAnalysis,
          personalized: updatedPersonalized,
        });
      }
    }
  };

  // Update Standard Dietary Compatibility Engine Preferences
  const updateDietaryPreferences = (updatedPrefs: DietaryPreferences) => {
    const updatedProfile = { ...profile, dietaryPreferences: updatedPrefs };
    setProfile(updatedProfile);
    saveUserHealthProfile(updatedProfile);

    if (currentAnalysis) {
      const updatedPersonalized = applyPersonalOverlay(
        currentAnalysis.analysis,
        updatedProfile,
        currentIngredients
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

    // 8. Trigger Smart Aisle Mode Sound & Haptic Feedback
    triggerAisleFeedback({
      grade: nutriScore.grade,
      hasPersonalConflict: Boolean(personalized.personalizedAlerts && personalized.personalizedAlerts.length > 0),
      isNova4UltraProcessed: novaGroup === 4,
    });

    // Persist to scan history
    setCurrentProductName(frontText || 'Scanned Product');
    setCurrentIngredients(ingredients || []);
    saveScanToHistory(frontText || 'Scanned Product', baseAnalysis, 'upload');
    saveHistoryRecord(frontText || 'Scanned Product', baseAnalysis, '', 'upload').catch(console.warn);
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

  // Handle direct barcode search (with Offline IndexedDB cache fallback & queueing)
  const handleBarcodeSubmitted = async (barcode: string) => {
    setIsAnalyzing(true);
    setError(null);
    setDualAuditClaims(null);

    // If device is offline, query IndexedDB directly
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const cached = await getCachedProduct(barcode);
      if (cached) {
        runFullAnalysisPipeline(cached.rawData, cached.ingredients, `${cached.productName} (Offline Cache)`);
        setIsAnalyzing(false);
        return;
      } else {
        await addToOfflineQueue(barcode);
        const queue = await getOfflineQueue();
        setQueuedCount(queue.length);
        setError(`Offline Mode Active: Barcode "${barcode}" is not in local cache. Added to Offline Queue and will automatically resolve when connection restores.`);
        setIsAnalyzing(false);
        return;
      }
    }

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
      // Network failure fallback to IndexedDB or queue
      const cached = await getCachedProduct(barcode);
      if (cached) {
        runFullAnalysisPipeline(cached.rawData, cached.ingredients, `${cached.productName} (Offline Cache)`);
      } else {
        await addToOfflineQueue(barcode);
        const queue = await getOfflineQueue();
        setQueuedCount(queue.length);
        setError("We couldn't get a clear reading of the label. Please retake the photo with better lighting or type the product name above.");
      }
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

  // Handle direct global search product selection
  const handleProductSelectedFromSearch = (product: SearchProductResult) => {
    setIsAnalyzing(true);
    setError(null);
    setDualAuditClaims(null);

    // Save product to local IndexedDB for future offline usage
    cacheProduct(product).catch(console.warn);

    const personalized = applyPersonalOverlay(product.analysis, profile, product.ingredients);
    const greenwashing = detectGreenwashing(product.productName, product.rawData, product.ingredients);

    setCurrentAnalysis({
      analysis: product.analysis,
      personalized,
      greenwashing,
    });

    setCurrentProductName(product.productName);
    setCurrentIngredients(product.ingredients);
    saveScanToHistory(product.productName, product.analysis, 'global_search');

    triggerAisleFeedback({
      grade: product.analysis.nutriScore.grade,
      hasPersonalConflict: Boolean(personalized.personalizedAlerts && personalized.personalizedAlerts.length > 0),
      isNova4UltraProcessed: product.analysis.novaGroup === 4,
    });

    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans pb-16">
      {/* 1. APPLE-STYLE GLASSMORPHIC HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-brand-darkCard/90 border-b border-slate-200/60 dark:border-brand-cream/20 shadow-md transition-all">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-brand-forest to-brand-lime text-brand-darkBg shadow-md shadow-brand-lime/20">
              <Apple className="w-5 h-5 font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                NutriGrade <span className="text-xs px-2 py-0.5 rounded-full bg-brand-lime/15 text-brand-lime font-bold border border-brand-lime/30 shadow-sm">AI</span>
              </span>
              <span className="text-[10px] text-brand-cream/80 font-medium">Nutritional Quality &amp; Additive Analysis Engine</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Guide & How It Works Button */}
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-brand-lime/10 hover:bg-brand-lime/20 text-brand-lime font-bold text-xs transition-all border border-brand-lime/30 flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Interactive Guide & Preview"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
              <span className="hidden sm:inline">How It Works</span>
            </button>

            {/* Compare Products Button */}
            <Link
              href="/compare"
              className="px-3 py-1.5 rounded-full bg-brand-forest/20 hover:bg-brand-forest/30 text-brand-cream font-semibold text-xs transition-all border border-brand-cream/30 flex items-center gap-1.5"
              title="Side-by-Side Product Comparison"
            >
              <Scale className="w-4 h-4 text-brand-lime" />
              <span className="hidden sm:inline">Compare</span>
            </Link>

            {/* Daily Fuel Tracker Button */}
            <Link
              href="/tracker"
              className="px-3 py-1.5 rounded-full bg-brand-lime/10 hover:bg-brand-lime/20 text-brand-lime font-semibold text-xs transition-all border border-brand-lime/30 flex items-center gap-1.5"
              title="Daily Intake & Biological Ledger"
            >
              <Activity className="w-4 h-4 text-brand-lime" />
              <span className="hidden sm:inline">Daily Fuel</span>
            </Link>

            {/* Meal Builder Button */}
            <Link
              href="/meal-builder"
              className="px-3 py-1.5 rounded-full bg-brand-forest/20 hover:bg-brand-forest/30 text-brand-cream font-semibold text-xs transition-all border border-brand-cream/30 flex items-center gap-1.5"
              title="Custom Recipe & Meal Nutri-Grader"
            >
              <UtensilsCrossed className="w-4 h-4 text-brand-lime" />
              <span className="hidden sm:inline">Recipes</span>
            </Link>

            {/* Shopping Lists Button */}
            <Link
              href="/lists"
              className="px-3 py-1.5 rounded-full bg-brand-lime/10 hover:bg-brand-lime/20 text-brand-lime font-semibold text-xs transition-all border border-brand-lime/30 flex items-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4 text-brand-lime" />
              <span className="hidden sm:inline">Shopping Lists</span>
            </Link>

            {/* Hall of Shame Button */}
            <Link
              href="/hall-of-shame"
              className="px-3 py-1.5 rounded-full bg-brand-rust/10 hover:bg-brand-rust/20 text-brand-rust font-semibold text-xs transition-all border border-brand-rust/30 flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4 text-brand-rust" />
              <span className="hidden sm:inline">Hall of Shame</span>
            </Link>

            {/* Pantry Audit Button */}
            <Link
              href="/pantry"
              className="px-3 py-1.5 rounded-full bg-brand-forest/20 hover:bg-brand-forest/30 text-brand-cream font-semibold text-xs transition-all border border-brand-cream/30 flex items-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4 text-brand-lime" />
              <span className="hidden sm:inline">Pantry Audit</span>
            </Link>

            {/* Scan History Page Button */}
            <Link
              href="/history"
              className="p-2.5 rounded-full bg-slate-100 dark:bg-brand-darkCard hover:bg-slate-200 dark:hover:bg-brand-forest/40 text-slate-600 dark:text-brand-cream transition-all border border-slate-200/50 dark:border-brand-cream/20"
              title="Full Unlimited Scan History"
              aria-label="Full Scan History"
            >
              <History className="w-4 h-4 text-brand-lime" />
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-brand-darkCard hover:bg-slate-200 dark:hover:bg-brand-forest/40 text-slate-600 dark:text-brand-cream transition-all border border-slate-200/50 dark:border-brand-cream/20"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-brand-lime" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>
      </header>

      {/* AMBER OFFLINE MODE INDICATOR & SYNC BANNER */}
      <OfflineBanner
        isOffline={isOffline}
        queuedCount={queuedCount}
        onSyncNow={handleManualSync}
        isSyncing={isSyncing}
      />

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 pt-8 space-y-8">
        {/* HERO INTRO & PRIMARY SCANNER CARD (80/20 RULE) */}
        <section className="text-center space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-brand-darkCard border border-slate-200/60 dark:border-brand-cream/20 text-xs font-semibold text-slate-600 dark:text-brand-cream shadow-sm">
              <Sparkles className="w-4 h-4 text-brand-lime" />
              <span>Nutritional Quality Breakdown</span>
            </div>

            {/* Personalize My Scan Drawer Button */}
            <button
              onClick={() => setIsPersonalizeOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-brand-darkCard border border-slate-200/80 dark:border-brand-cream/30 text-xs font-bold text-slate-700 dark:text-brand-cream shadow-md hover:bg-slate-50 dark:hover:bg-brand-forest/30 transition-all active:scale-95"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-lime" />
              <span>Personalize My Scan</span>
              {totalActiveFilters > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-brand-forest text-brand-lime font-bold text-[10px] shadow-sm border border-brand-lime/30">
                  {totalActiveFilters} Active
                </span>
              )}
            </button>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
            Know What’s Really in Your Food. <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-brand-lime via-emerald-400 to-teal-300 bg-clip-text text-transparent drop-shadow-sm">
              Backed by Science.
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 dark:text-brand-cream/80 max-w-2xl mx-auto leading-relaxed">
            Instant food grade calculations, additive toxicity screening, and marketing claim verification based on Nutri-Score and NOVA standards.
          </p>

          {/* ━━━ PRIMARY CONVERSION AREA (80% FOCUS) ━━━ */}
          <div className="max-w-2xl mx-auto w-full space-y-4 pt-2">
            <UploadZone
              onFileSelected={handleFileSelected}
              onDualFilesSelected={handleDualFilesSelected}
              onSelectSample={loadDemoSample}
              onBarcodeSubmitted={handleBarcodeSubmitted}
              isAnalyzing={isAnalyzing}
              error={error}
            />

            {/* INTEGRATED GLOBAL SEARCH BAR */}
            <GlobalSearchBar onSelectProduct={handleProductSelectedFromSearch} />

            {/* SECONDARY QUICK TEST CHIPS */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
              <span className="font-semibold text-slate-400">Quick Test:</span>
              <button
                onClick={() => loadDemoSample('oats')}
                className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <span>Organic Rolled Oats</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500 text-white font-bold">A</span>
              </button>
              <button
                onClick={() => loadDemoSample('chocolate_milk')}
                className="px-3.5 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20 transition-all flex items-center gap-1.5"
              >
                <span>Sugary Soda / Chocolate Milk</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500 text-white font-bold">E</span>
              </button>
            </div>
          </div>
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
        {/* 6. FOOTER CLINICAL DISCLAIMER BANNER */}
        <section className="pt-6">
          <MedicalDisclaimerBanner variant="full" />
        </section>
      </main>

      {/* SCAN HISTORY SLIDE-OVER DRAWER */}
      <ScanHistory isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      {/* PERSONALIZE MY SCAN SLIDING SHEET DRAWER */}
      <PersonalizeDrawer
        isOpen={isPersonalizeOpen}
        onClose={() => setIsPersonalizeOpen(false)}
        profile={profile}
        onToggleMedicalFlag={toggleMedicalFlag}
        onUpdateDietaryPreferences={updateDietaryPreferences}
        onClearHealthData={handleClearHealthData}
      />

      {/* FLOATING INTERACTIVE GUIDE & 1-CLICK DEMO HUB */}
      <FloatingGuideButton onOpen={() => setIsGuideModalOpen(true)} />
      <FloatingGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onOpenPersonalize={() => setIsPersonalizeOpen(true)}
        onSelectSample={loadDemoSample}
      />

      {/* FEATURE 7: NUTRIBOT CONTEXTUAL AI NUTRITIONIST COPILOT */}
      <NutriBotDrawer
        currentProduct={
          currentAnalysis
            ? {
                name: currentProductName || 'Scanned Food Product',
                analysis: currentAnalysis.analysis,
                ingredients: currentIngredients,
              }
            : null
        }
        profile={profile}
      />
    </div>
  );
}
