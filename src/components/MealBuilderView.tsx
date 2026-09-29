'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Sparkles,
  Search,
  CheckCircle2,
  Bookmark,
  Activity,
  Flame,
  Scale,
  Apple,
  ShoppingCart,
  Layers,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

import {
  MealIngredientItem,
  CompositeMealAnalysis,
  calculateCompositeMeal,
} from '../lib/algorithms/mealBuilderEngine';
import {
  SavedRecipe,
  getSavedRecipes,
  saveRecipe,
  deleteRecipe,
  STARTER_RECIPES,
} from '../lib/storage/recipeStore';
import { getHistoryRecords, ScanHistoryRecord } from '../lib/storage/historyManager';
import { SAMPLE_COMPARE_PRODUCTS } from '../lib/data/sampleFoods';
import { NutriScoreBadge } from './NutriScoreBadge';
import { addDailyLogEntry } from '../lib/storage/dailyLogStore';

export const MealBuilderView: React.FC = () => {
  const [recipeName, setRecipeName] = useState('Power Breakfast Bowl');
  const [servings, setServings] = useState(1);
  const [ingredients, setIngredients] = useState<MealIngredientItem[]>(
    STARTER_RECIPES[0].ingredients
  );

  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [activeTab, setActiveTab] = useState<'builder' | 'saved'>('builder');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanHistoryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Compute live composite meal analysis
  const compositeAnalysis: CompositeMealAnalysis = calculateCompositeMeal(
    ingredients,
    servings
  );

  useEffect(() => {
    refreshSavedRecipes();
    loadScanHistory();
  }, []);

  const refreshSavedRecipes = () => {
    setSavedRecipes(getSavedRecipes());
  };

  const loadScanHistory = async () => {
    try {
      const records = await getHistoryRecords();
      setRecentScans(records);
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3200);
  };

  // Adjust ingredient gram weight
  const handleUpdatePortion = (id: string, newGrams: number) => {
    setIngredients((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, portionGrams: Math.max(5, newGrams) } : item
      )
    );
  };

  // Remove ingredient
  const handleRemoveIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  // Add from scan history
  const handleAddFromScan = (record: ScanHistoryRecord) => {
    if (!record.analysis) return;
    const newItem: MealIngredientItem = {
      id: `ing_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: record.productName,
      brand: record.brand,
      grade: record.grade,
      novaGroup: record.novaGroup,
      portionGrams: 100,
      nutritionPer100g: {
        calories: record.caloriesPer100g,
        total_fat: record.fatPer100g,
        saturated_fat: record.fatPer100g * 0.4,
        sugars: record.sugarsPer100g,
        sodium_mg: record.sodiumMgPer100g,
        fiber: record.fiberPer100g,
        protein: record.proteinPer100g,
      },
    };
    setIngredients((prev) => [...prev, newItem]);
    setIsAddModalOpen(false);
    showToast(`Added ${record.productName} (100g)`);
  };

  // Add from demo fixture
  const handleAddFromSample = (key: string) => {
    const sample = SAMPLE_COMPARE_PRODUCTS[key];
    if (!sample) return;
    const norm = sample.analysis.normalizedData;
    const newItem: MealIngredientItem = {
      id: `ing_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: sample.name,
      brand: sample.brand,
      grade: sample.analysis.nutriScore.grade,
      novaGroup: sample.analysis.novaGroup,
      portionGrams: 100,
      nutritionPer100g: {
        calories: norm.calories_per_100g,
        total_fat: norm.total_fat_per_100g,
        saturated_fat: norm.saturated_fat_per_100g,
        sugars: norm.sugars_per_100g,
        sodium_mg: norm.sodium_mg_per_100g,
        fiber: norm.fiber_per_100g,
        protein: norm.protein_per_100g,
      },
      glycemicIndex: sample.analysis.glycemic_index_estimate,
    };
    setIngredients((prev) => [...prev, newItem]);
    setIsAddModalOpen(false);
    showToast(`Added ${sample.name} (100g)`);
  };

  // Search Open Food Facts
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search-products?q=${encodeURIComponent(searchQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFromSearch = (prod: any) => {
    if (!prod.analysis) return;
    const norm = prod.analysis.normalizedData;
    const newItem: MealIngredientItem = {
      id: `ing_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: prod.productName,
      brand: prod.brand,
      grade: prod.nutriScoreGrade,
      novaGroup: prod.novaGroup,
      portionGrams: 100,
      nutritionPer100g: {
        calories: norm.calories_per_100g,
        total_fat: norm.total_fat_per_100g,
        saturated_fat: norm.saturated_fat_per_100g,
        sugars: norm.sugars_per_100g,
        sodium_mg: norm.sodium_mg_per_100g,
        fiber: norm.fiber_per_100g,
        protein: norm.protein_per_100g,
      },
    };
    setIngredients((prev) => [...prev, newItem]);
    setIsAddModalOpen(false);
    showToast(`Added ${prod.productName} (100g)`);
  };

  // Save recipe
  const handleSaveRecipe = () => {
    if (!recipeName.trim() || ingredients.length === 0) return;
    saveRecipe(recipeName, ingredients, servings);
    refreshSavedRecipes();
    showToast(`Saved recipe "${recipeName}"!`);
  };

  // Load saved recipe
  const handleLoadRecipe = (recipe: SavedRecipe) => {
    setRecipeName(recipe.name);
    setServings(recipe.servings || 1);
    setIngredients(recipe.ingredients);
    setActiveTab('builder');
    showToast(`Loaded "${recipe.name}" into builder`);
  };

  // Delete saved recipe
  const handleDeleteRecipe = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteRecipe(id);
    refreshSavedRecipes();
  };

  // 1-Click Log Meal to Daily Fuel
  const handleLogToDailyFuel = () => {
    if (ingredients.length === 0) return;
    const perServing = compositeAnalysis.perServingNutrition;
    // synthesize an AnalysisResult
    const syntheticAnalysis: any = {
      normalizedData: compositeAnalysis.normalizedPer100g,
      nutriScore: compositeAnalysis.nutriScore,
      novaGroup: compositeAnalysis.blendedNovaGroup,
      additives: [],
      healthWarnings: [],
      explanation: `Custom Meal: ${recipeName} (${servings} servings)`,
    };
    const gramsPerServing = Math.round(compositeAnalysis.totalWeightGrams / servings);
    addDailyLogEntry(syntheticAnalysis, recipeName, 'Custom Recipe', gramsPerServing, 'lunch');
    showToast(`Logged "${recipeName}" (${perServing.calories} kcal) to Today's Daily Fuel!`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Toast Notice */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-brand-forest text-brand-cream border border-brand-lime/40 shadow-2xl flex items-center gap-2 text-sm font-semibold"
          >
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/30 text-brand-lime text-xs font-bold uppercase tracking-wider mb-2">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Composite Meal Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Meal &amp; Recipe <span className="text-brand-lime">Nutri-Grader</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-brand-cream/80 mt-1">
            Combine multiple grocery items into a blended recipe to calculate composite Nutri-Score, Glycemic Load, and macros.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/70 dark:bg-brand-darkCard/70 border border-slate-200/60 dark:border-brand-cream/15 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'builder'
                ? 'bg-brand-lime text-brand-darkBg shadow-md'
                : 'text-slate-600 dark:text-brand-cream hover:bg-slate-100 dark:hover:bg-brand-darkBg'
            }`}
          >
            Recipe Builder
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-brand-lime text-brand-darkBg shadow-md'
                : 'text-slate-600 dark:text-brand-cream hover:bg-slate-100 dark:hover:bg-brand-darkBg'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Saved Recipes ({savedRecipes.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'saved' ? (
        /* SAVED RECIPES LIST */
        <div className="rounded-3xl bg-white/80 dark:bg-brand-darkCard/80 backdrop-blur-xl border border-slate-200/60 dark:border-brand-cream/20 shadow-xl p-6 space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
            Saved Kitchen Recipes ({savedRecipes.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedRecipes.map((r) => {
              const analysis = calculateCompositeMeal(r.ingredients, r.servings);
              return (
                <div
                  key={r.id}
                  onClick={() => handleLoadRecipe(r)}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-brand-darkBg/60 hover:bg-brand-lime/10 dark:hover:bg-brand-lime/10 border border-slate-200/50 dark:border-brand-cream/10 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-lime transition-colors">
                        {r.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {r.ingredients.length} ingredients • {r.servings} serving{r.servings === 1 ? '' : 's'}
                      </p>
                    </div>
                    <NutriScoreBadge grade={analysis.nutriScore.grade} size="sm" />
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-brand-cream/10 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {analysis.perServingNutrition.calories} kcal • {analysis.perServingNutrition.protein}g protein
                    </span>
                    <button
                      onClick={(e) => handleDeleteRecipe(r.id, e)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete recipe"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* BUILDER WORKSPACE */
        <div className="space-y-6">
          {/* COMPOSITE SCORE BANNER */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-brand-forest to-brand-darkBg text-brand-cream border border-brand-lime/30 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-lime uppercase tracking-wider block">
                  Blended Composite Grade
                </span>
                <div className="flex items-center gap-3">
                  <NutriScoreBadge grade={compositeAnalysis.nutriScore.grade} size="lg" />
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">
                      Nutri-Score Grade {compositeAnalysis.nutriScore.grade}
                    </h2>
                    <span className="text-xs text-brand-cream/80">
                      NOVA {compositeAnalysis.blendedNovaGroup} • Glycemic Load: {compositeAnalysis.compositeGlycemicLoad} ({compositeAnalysis.glycemicImpactLevel})
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSaveRecipe}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save Recipe</span>
                </button>
                <button
                  onClick={handleLogToDailyFuel}
                  className="px-4 py-2.5 rounded-xl bg-brand-lime text-brand-darkBg font-bold text-xs hover:bg-brand-lime/90 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Log to Daily Fuel</span>
                </button>
              </div>
            </div>

            <p className="text-xs md:text-sm text-brand-cream/90 leading-relaxed max-w-3xl">
              {compositeAnalysis.clinicalDietitianSummary}
            </p>

            {/* Per-Serving Macro Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-black/25">
                <span className="text-[10px] text-brand-cream/60 block">Calories</span>
                <span className="font-extrabold text-white text-base">
                  {compositeAnalysis.perServingNutrition.calories}
                </span>
                <span className="text-[9px] text-brand-cream/60">kcal/srv</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/25">
                <span className="text-[10px] text-brand-cream/60 block">Protein</span>
                <span className="font-extrabold text-white text-base">
                  {compositeAnalysis.perServingNutrition.protein}g
                </span>
                <span className="text-[9px] text-brand-cream/60">per srv</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/25">
                <span className="text-[10px] text-brand-cream/60 block">Fiber</span>
                <span className="font-extrabold text-brand-lime text-base">
                  {compositeAnalysis.perServingNutrition.fiber}g
                </span>
                <span className="text-[9px] text-brand-cream/60">prebiotic</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/25">
                <span className="text-[10px] text-brand-cream/60 block">Sugars</span>
                <span className="font-extrabold text-white text-base">
                  {compositeAnalysis.perServingNutrition.sugars}g
                </span>
                <span className="text-[9px] text-brand-cream/60">per srv</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/25">
                <span className="text-[10px] text-brand-cream/60 block">Sat Fat</span>
                <span className="font-extrabold text-white text-base">
                  {compositeAnalysis.perServingNutrition.saturated_fat}g
                </span>
                <span className="text-[9px] text-brand-cream/60">per srv</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/25">
                <span className="text-[10px] text-brand-cream/60 block">Sodium</span>
                <span className="font-extrabold text-white text-base">
                  {compositeAnalysis.perServingNutrition.sodium_mg}mg
                </span>
                <span className="text-[9px] text-brand-cream/60">per srv</span>
              </div>
            </div>
          </div>

          {/* INGREDIENT LIST & CONTROLS */}
          <div className="rounded-3xl bg-white/80 dark:bg-brand-darkCard/80 backdrop-blur-xl border border-slate-200/60 dark:border-brand-cream/20 shadow-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-brand-cream/15">
              <div className="flex-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Recipe Name:
                </label>
                <input
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className="text-lg font-bold text-slate-900 dark:text-white bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-brand-lime w-full"
                />
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Servings:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-brand-darkBg text-slate-700 dark:text-brand-cream font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-slate-900 dark:text-white">
                      {servings}
                    </span>
                    <button
                      onClick={() => setServings(servings + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-brand-darkBg text-slate-700 dark:text-brand-cream font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="self-end px-3.5 py-2 rounded-xl bg-brand-forest/20 text-brand-lime hover:bg-brand-forest/30 font-bold text-xs transition-all flex items-center gap-1.5 border border-brand-lime/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Ingredient</span>
                </button>
              </div>
            </div>

            {/* Ingredients table / rows */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Recipe Ingredients ({ingredients.length} items • {compositeAnalysis.totalWeightGrams}g total weight):
              </span>

              {ingredients.map((item) => {
                const itemCalories = Math.round(
                  (item.nutritionPer100g.calories * item.portionGrams) / 100
                );
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-brand-darkBg/60 border border-slate-200/50 dark:border-brand-cream/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {item.grade && <NutriScoreBadge grade={item.grade} size="sm" />}
                      <div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white block">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {item.brand ? `${item.brand} • ` : ''}
                          {itemCalories} kcal in this portion
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="flex items-center gap-1 bg-white dark:bg-brand-darkCard px-2 py-1 rounded-xl border border-slate-200 dark:border-brand-cream/20">
                        <input
                          type="number"
                          min="5"
                          max="2000"
                          value={item.portionGrams}
                          onChange={(e) =>
                            handleUpdatePortion(item.id, Number(e.target.value) || 0)
                          }
                          className="w-14 text-center font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none"
                        />
                        <span className="text-slate-400 text-[11px]">g</span>
                      </div>

                      <button
                        onClick={() => handleRemoveIngredient(item.id)}
                        className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove ingredient"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ADD INGREDIENT MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white dark:bg-brand-darkCard rounded-3xl shadow-2xl border border-slate-200 dark:border-brand-cream/20 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-5 border-b border-slate-200 dark:border-brand-cream/20 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    Add Food Ingredient
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-brand-cream/70">
                    Search Open Food Facts, pick from past scans, or select staples
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-brand-darkBg text-slate-400"
                >
                  ✕
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-slate-200 dark:border-brand-cream/15 bg-slate-50/50 dark:bg-brand-darkBg/40">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search food by name (e.g. Rolled Oats, Chia Seeds)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-brand-darkCard border border-slate-200 dark:border-brand-cream/20 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-4 py-2 rounded-xl bg-brand-forest text-brand-cream font-bold text-xs"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </form>
              </div>

              {/* Items List */}
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {searchResults.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Search Results:
                    </span>
                    <div className="space-y-2">
                      {searchResults.map((prod) => (
                        <button
                          key={prod.id || prod.barcode}
                          onClick={() => handleAddFromSearch(prod)}
                          className="w-full text-left p-3 rounded-2xl bg-slate-50 dark:bg-brand-darkBg/60 hover:bg-brand-lime/10 border border-slate-200/50 dark:border-brand-cream/10 transition-all flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">
                              {prod.productName}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {prod.brand} • {prod.rawData?.calories || 0} kcal/100g
                            </span>
                          </div>
                          <NutriScoreBadge grade={prod.nutriScoreGrade} size="sm" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Scans */}
                {recentScans.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      From Your Scans:
                    </span>
                    <div className="space-y-2">
                      {recentScans.map((rec) => (
                        <button
                          key={rec.id}
                          onClick={() => handleAddFromScan(rec)}
                          className="w-full text-left p-3 rounded-2xl bg-slate-50 dark:bg-brand-darkBg/60 hover:bg-brand-lime/10 border border-slate-200/50 dark:border-brand-cream/10 transition-all flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">
                              {rec.productName}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {rec.brand || 'Scanned'} • {rec.caloriesPer100g} kcal/100g
                            </span>
                          </div>
                          <NutriScoreBadge grade={rec.grade} size="sm" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Demo Staples */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Common Pantry Staples:
                  </span>
                  <div className="space-y-2">
                    {Object.entries(SAMPLE_COMPARE_PRODUCTS).map(([key, item]) => (
                      <button
                        key={key}
                        onClick={() => handleAddFromSample(key)}
                        className="w-full text-left p-3 rounded-2xl bg-slate-50 dark:bg-brand-darkBg/60 hover:bg-brand-lime/10 border border-slate-200/50 dark:border-brand-cream/10 transition-all flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {item.brand} • NOVA {item.analysis.novaGroup}
                          </span>
                        </div>
                        <NutriScoreBadge grade={item.analysis.nutriScore.grade} size="sm" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
