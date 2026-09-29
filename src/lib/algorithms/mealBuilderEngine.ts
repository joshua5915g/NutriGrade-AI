/**
 * mealBuilderEngine.ts
 *
 * Custom Meal & Recipe Blended Nutri-Grader Engine.
 * Calculates mathematically accurate composite nutritional profiles,
 * blended Nutri-Score, blended Glycemic Load, and composite NOVA group
 * for multi-ingredient meals and home recipes.
 */

import {
  NormalizedNutritionData,
  NutriScoreBreakdown,
  NovaGroup,
  NutriScoreGrade,
} from '../../types/nutrition';
import { calculateNutriScore } from './nutriScore';
import { calculateGlycemicLoad, classifyGlycemicImpact } from './biologicalEngine';

export interface MealIngredientItem {
  id: string;
  name: string;
  brand?: string;
  grade?: NutriScoreGrade;
  novaGroup?: NovaGroup;
  portionGrams: number;
  nutritionPer100g: {
    calories: number;
    total_fat: number;
    saturated_fat: number;
    sugars: number;
    sodium_mg: number;
    fiber: number;
    protein: number;
  };
  glycemicIndex?: number;
}

export interface CompositeMealAnalysis {
  totalWeightGrams: number;
  servings: number;
  // Per Serving
  perServingNutrition: {
    calories: number;
    total_fat: number;
    saturated_fat: number;
    sugars: number;
    sodium_mg: number;
    fiber: number;
    protein: number;
  };
  // Standardized per 100g
  normalizedPer100g: NormalizedNutritionData;
  nutriScore: NutriScoreBreakdown;
  blendedNovaGroup: NovaGroup;
  compositeGlycemicLoad: number;
  glycemicImpactLevel: 'Low' | 'Moderate' | 'High';
  gutMicrobiomeScore: number;
  clinicalDietitianSummary: string;
}

export function calculateCompositeMeal(
  ingredients: MealIngredientItem[],
  servingsCount: number = 1
): CompositeMealAnalysis {
  if (ingredients.length === 0) {
    const defaultNorm: NormalizedNutritionData = {
      calories_per_100g: 0,
      total_fat_per_100g: 0,
      saturated_fat_per_100g: 0,
      trans_fat_per_100g: 0,
      sugars_per_100g: 0,
      added_sugars_per_100g: 0,
      sodium_mg_per_100g: 0,
      fiber_per_100g: 0,
      protein_per_100g: 0,
    };
    return {
      totalWeightGrams: 0,
      servings: servingsCount,
      perServingNutrition: {
        calories: 0,
        total_fat: 0,
        saturated_fat: 0,
        sugars: 0,
        sodium_mg: 0,
        fiber: 0,
        protein: 0,
      },
      normalizedPer100g: defaultNorm,
      nutriScore: calculateNutriScore(defaultNorm),
      blendedNovaGroup: 1,
      compositeGlycemicLoad: 0,
      glycemicImpactLevel: 'Low',
      gutMicrobiomeScore: 100,
      clinicalDietitianSummary: 'Add ingredients to begin computing composite meal metrics.',
    };
  }

  let totalWeightGrams = 0;
  let totalCalories = 0;
  let totalFat = 0;
  let totalSaturatedFat = 0;
  let totalSugars = 0;
  let totalSodiumMg = 0;
  let totalFiber = 0;
  let totalProtein = 0;

  let weightedNovaSum = 0;
  let weightedGiSum = 0;
  let totalCarbsGrams = 0;

  for (const item of ingredients) {
    const factor = item.portionGrams / 100;
    totalWeightGrams += item.portionGrams;

    totalCalories += item.nutritionPer100g.calories * factor;
    totalFat += item.nutritionPer100g.total_fat * factor;
    totalSaturatedFat += item.nutritionPer100g.saturated_fat * factor;
    totalSugars += item.nutritionPer100g.sugars * factor;
    totalSodiumMg += item.nutritionPer100g.sodium_mg * factor;
    totalFiber += item.nutritionPer100g.fiber * factor;
    totalProtein += item.nutritionPer100g.protein * factor;

    const itemNova = item.novaGroup || 1;
    weightedNovaSum += itemNova * item.portionGrams;

    const itemGi = item.glycemicIndex || 50;
    const itemCarbs = (item.nutritionPer100g.sugars + item.nutritionPer100g.fiber) * factor;
    weightedGiSum += itemGi * itemCarbs;
    totalCarbsGrams += itemCarbs;
  }

  const effectiveWeight = Math.max(1, totalWeightGrams);
  const scaleTo100g = 100 / effectiveWeight;

  const normalizedPer100g: NormalizedNutritionData = {
    calories_per_100g: Math.round(totalCalories * scaleTo100g),
    total_fat_per_100g: Number((totalFat * scaleTo100g).toFixed(1)),
    saturated_fat_per_100g: Number((totalSaturatedFat * scaleTo100g).toFixed(1)),
    trans_fat_per_100g: 0,
    sugars_per_100g: Number((totalSugars * scaleTo100g).toFixed(1)),
    added_sugars_per_100g: Number((totalSugars * scaleTo100g * 0.7).toFixed(1)),
    sodium_mg_per_100g: Math.round(totalSodiumMg * scaleTo100g),
    fiber_per_100g: Number((totalFiber * scaleTo100g).toFixed(1)),
    protein_per_100g: Number((totalProtein * scaleTo100g).toFixed(1)),
  };

  const nutriScore = calculateNutriScore(normalizedPer100g);

  // NOVA Blended Score
  const avgNova = weightedNovaSum / effectiveWeight;
  let blendedNovaGroup: NovaGroup = 1;
  if (avgNova >= 3.5) blendedNovaGroup = 4;
  else if (avgNova >= 2.5) blendedNovaGroup = 3;
  else if (avgNova >= 1.5) blendedNovaGroup = 2;

  // Composite Glycemic Load per Serving
  const servings = Math.max(1, servingsCount);
  const netCarbsPerServing = (totalSugars / servings);
  const blendedGi = totalCarbsGrams > 0 ? weightedGiSum / totalCarbsGrams : 45;
  const compositeGlycemicLoad = calculateGlycemicLoad(netCarbsPerServing, blendedGi);
  const glycemicImpactLevel = classifyGlycemicImpact(compositeGlycemicLoad);

  // Gut Microbiome Score: High fiber boosts gut score; UPF items decrement score
  let gutMicrobiomeScore = 75;
  if (normalizedPer100g.fiber_per_100g >= 3) gutMicrobiomeScore += 15;
  if (blendedNovaGroup === 4) gutMicrobiomeScore -= 20;
  if (normalizedPer100g.sugars_per_100g > 15) gutMicrobiomeScore -= 10;
  gutMicrobiomeScore = Math.max(10, Math.min(100, gutMicrobiomeScore));

  const perServingNutrition = {
    calories: Math.round(totalCalories / servings),
    total_fat: Number((totalFat / servings).toFixed(1)),
    saturated_fat: Number((totalSaturatedFat / servings).toFixed(1)),
    sugars: Number((totalSugars / servings).toFixed(1)),
    sodium_mg: Math.round(totalSodiumMg / servings),
    fiber: Number((totalFiber / servings).toFixed(1)),
    protein: Number((totalProtein / servings).toFixed(1)),
  };

  let clinicalDietitianSummary = `Recipe yields Grade ${nutriScore.grade} Nutri-Score (${nutriScore.score} pts). `;
  if (nutriScore.grade === 'A' || nutriScore.grade === 'B') {
    clinicalDietitianSummary += `Nutritionally dense meal with excellent macronutrient balance (${perServingNutrition.protein}g protein, ${perServingNutrition.fiber}g prebiotic fiber per serving).`;
  } else {
    clinicalDietitianSummary += `Elevated caloric or sugar density (${perServingNutrition.sugars}g sugar per serving). Consider increasing leafy greens or whole pulses to boost fiber.`;
  }

  return {
    totalWeightGrams,
    servings,
    perServingNutrition,
    normalizedPer100g,
    nutriScore,
    blendedNovaGroup,
    compositeGlycemicLoad,
    glycemicImpactLevel,
    gutMicrobiomeScore,
    clinicalDietitianSummary,
  };
}
