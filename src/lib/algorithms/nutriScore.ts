import { NormalizedNutritionData, NutriScoreBreakdown, NutriScoreGrade } from '../../types/nutrition';

// Constants for converting Calories (kcal) to Kilojoules (kJ)
const KCAL_TO_KJ = 4.184;

// Threshold arrays for negative point allocation (N points, up to 10 points)
const ENERGY_THRESHOLDS = [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350];
const SUGARS_THRESHOLDS = [4.5, 9.0, 13.5, 18.0, 22.5, 27.0, 31.0, 36.0, 40.0, 45.0];
const SAT_FAT_THRESHOLDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SODIUM_THRESHOLDS = [90, 180, 270, 360, 450, 540, 630, 720, 810, 900];

// Threshold arrays for positive point allocation (P points, up to 5 points)
const FIBER_THRESHOLDS = [0.7, 1.4, 2.1, 2.8, 3.5];
const PROTEIN_THRESHOLDS = [1.6, 3.2, 4.8, 6.4, 8.0];

/**
 * Calculates the number of points for a nutrient based on a series of thresholds.
 * Returns a value from 0 up to thresholds.length.
 */
function calculatePoints(value: number, thresholds: number[]): number {
  let points = 0;
  for (const threshold of thresholds) {
    if (value > threshold) {
      points++;
    } else {
      break;
    }
  }
  return points;
}

/**
 * Maps a calculated Nutri-Score to its corresponding letter grade.
 * Range mapping:
 * - Score <= -1: 'A'
 * - Score 0 to 2: 'B'
 * - Score 3 to 10: 'C'
 * - Score 11 to 18: 'D'
 * - Score >= 19: 'E'
 */
function mapScoreToGrade(score: number): NutriScoreGrade {
  if (score <= -1) return 'A';
  if (score <= 2) return 'B';
  if (score <= 10) return 'C';
  if (score <= 18) return 'D';
  return 'E';
}

/**
 * Calculates the official Nutri-Score breakdown and grade for solid foods.
 *
 * @param data - NormalizedNutritionData per 100g/ml
 * @returns NutriScoreBreakdown details (score, grade, positive/negative points breakdown)
 */
export function calculateNutriScore(data: NormalizedNutritionData): NutriScoreBreakdown {
  // Convert calories (kcal) to kJ
  const energyKj = data.calories_per_100g * KCAL_TO_KJ;

  // Calculate individual negative points (N)
  const energyPoints = calculatePoints(energyKj, ENERGY_THRESHOLDS);
  const sugarPoints = calculatePoints(data.sugars_per_100g, SUGARS_THRESHOLDS);
  const satFatPoints = calculatePoints(data.saturated_fat_per_100g, SAT_FAT_THRESHOLDS);
  const sodiumPoints = calculatePoints(data.sodium_mg_per_100g, SODIUM_THRESHOLDS);

  const totalNegativePoints = energyPoints + sugarPoints + satFatPoints + sodiumPoints;

  // Calculate individual positive points (P)
  const fiberPoints = calculatePoints(data.fiber_per_100g, FIBER_THRESHOLDS);
  const proteinPoints = calculatePoints(data.protein_per_100g, PROTEIN_THRESHOLDS);
  
  // Default fruit and vegetable points to 0 since we only have raw macronutrients
  const fruitVegPoints = 0;

  // Determine whether to count protein points based on Nutri-Score rules:
  // If negative points >= 11, protein points are ONLY counted if fruitVegPoints >= 5.
  // Since fruitVegPoints is defaulted to 0, protein points are excluded if totalNegativePoints >= 11.
  const shouldCountProtein = totalNegativePoints < 11 || fruitVegPoints >= 5;

  const countedProteinPoints = shouldCountProtein ? proteinPoints : 0;
  const totalPositivePoints = fiberPoints + countedProteinPoints + fruitVegPoints;

  // Final score calculation
  const score = totalNegativePoints - totalPositivePoints;
  const grade = mapScoreToGrade(score);

  return {
    score,
    grade,
    negativePoints: {
      energy: energyPoints,
      sugars: sugarPoints,
      saturated_fat: satFatPoints,
      sodium: sodiumPoints,
    },
    positivePoints: {
      fiber: fiberPoints,
      protein: proteinPoints, // Return the actual protein points calculated, regardless of exclusion
      fruit_veg_pct: fruitVegPoints,
    },
  };
}
