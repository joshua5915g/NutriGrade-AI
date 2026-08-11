/**
 * fdaFopSimulator.ts
 *
 * FDA Front-of-Package (FOP) Nutrition Compliance Simulator.
 * Simulates US FDA 2024 standardized front-of-package warning labels for:
 *   - Saturated Fat (Reference Daily Value = 20g)
 *   - Sodium (Reference Daily Value = 2300mg)
 *   - Added Sugars (Reference Daily Value = 50g)
 *
 * Thresholds:
 *   - Low: < 5% DV per serving
 *   - Medium: 5% - 20% DV per serving
 *   - High: > 20% DV per serving (triggers mandatory FDA high-content symbol)
 */

import { NormalizedNutritionData } from '../../types/nutrition';

export type FopRating = 'Low' | 'Medium' | 'High';

export interface FopMetric {
  name: string;
  amount: number;
  unit: 'g' | 'mg';
  pctDV: number;
  rating: FopRating;
  referenceDV: number;
}

export interface FdaFopResult {
  addedSugars: FopMetric;
  saturatedFat: FopMetric;
  sodium: FopMetric;
  highWarningTriggered: boolean;
  warningCount: number;
  summaryMessage: string;
}

// FDA Reference Daily Values (DV)
const FDA_DV = {
  SATURATED_FAT_G: 20,
  SODIUM_MG: 2300,
  ADDED_SUGARS_G: 50,
};

function getFopRating(pctDV: number): FopRating {
  if (pctDV < 5) return 'Low';
  if (pctDV <= 20) return 'Medium';
  return 'High';
}

/**
 * Calculates FDA Front-of-Package (FOP) warning label metrics.
 *
 * @param data Normalized nutrition data per 100g (or serving)
 * @returns FdaFopResult containing ratings, % DVs, and warning flags
 */
export function calculateFdaFop(data: NormalizedNutritionData): FdaFopResult {
  // Added sugars (fall back to total sugars if added sugars not explicitly declared)
  const addedSugarsG = data.added_sugars_per_100g > 0 ? data.added_sugars_per_100g : data.sugars_per_100g;
  const sugarsPctDV = Math.round((addedSugarsG / FDA_DV.ADDED_SUGARS_G) * 100);
  const sugarsRating = getFopRating(sugarsPctDV);

  // Saturated Fat
  const satFatG = data.saturated_fat_per_100g;
  const satFatPctDV = Math.round((satFatG / FDA_DV.SATURATED_FAT_G) * 100);
  const satFatRating = getFopRating(satFatPctDV);

  // Sodium
  const sodiumMg = data.sodium_mg_per_100g;
  const sodiumPctDV = Math.round((sodiumMg / FDA_DV.SODIUM_MG) * 100);
  const sodiumRating = getFopRating(sodiumPctDV);

  const highWarnings = [sugarsRating, satFatRating, sodiumRating].filter(
    (r) => r === 'High'
  );
  const warningCount = highWarnings.length;
  const highWarningTriggered = warningCount > 0;

  let summaryMessage = 'Complies with FDA healthy baseline metrics.';
  if (warningCount === 1) {
    summaryMessage = 'Triggers 1 FDA Front-of-Package High Warning symbol.';
  } else if (warningCount > 1) {
    summaryMessage = `Triggers ${warningCount} mandatory FDA High Warning symbols!`;
  }

  return {
    addedSugars: {
      name: 'Added Sugars',
      amount: addedSugarsG,
      unit: 'g',
      pctDV: sugarsPctDV,
      rating: sugarsRating,
      referenceDV: FDA_DV.ADDED_SUGARS_G,
    },
    saturatedFat: {
      name: 'Saturated Fat',
      amount: satFatG,
      unit: 'g',
      pctDV: satFatPctDV,
      rating: satFatRating,
      referenceDV: FDA_DV.SATURATED_FAT_G,
    },
    sodium: {
      name: 'Sodium',
      amount: sodiumMg,
      unit: 'mg',
      pctDV: sodiumPctDV,
      rating: sodiumRating,
      referenceDV: FDA_DV.SODIUM_MG,
    },
    highWarningTriggered,
    warningCount,
    summaryMessage,
  };
}
