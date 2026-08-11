import { RawNutritionData, NormalizedNutritionData } from '../../types/nutrition';

/**
 * Converts sodium content in milligrams to salt equivalent in grams.
 * Formula: Salt (g) = Sodium (mg) * 2.5 / 1000 = Sodium (mg) / 400
 *
 * @param sodiumMg - Sodium content in milligrams
 * @returns Salt content in grams
 */
export function sodiumMgToSaltG(sodiumMg: number): number {
  return sodiumMg / 400;
}

/**
 * Converts salt content in grams to sodium equivalent in milligrams.
 * Formula: Sodium (mg) = Salt (g) * 1000 / 2.5 = Salt (g) * 400
 *
 * @param saltG - Salt content in grams
 * @returns Sodium content in milligrams
 */
export function saltGToSodiumMg(saltG: number): number {
  return saltG * 400;
}

/**
 * Normalizes RawNutritionData to NormalizedNutritionData (values per 100g or 100ml).
 * If the input data is already per 100g, the values are returned as is.
 * Otherwise, values are scaled using the provided serving_size_g.
 *
 * @param data - RawNutritionData extracted from OCR or inputs.
 * @returns NormalizedNutritionData per 100g/ml.
 * @throws Error if serving_size_g is missing, zero, or negative when is_per_100g is false.
 */
export function normalizeTo100g(data: RawNutritionData): NormalizedNutritionData {
  let factor = 1;

  if (!data.is_per_100g) {
    if (!data.serving_size_g || data.serving_size_g <= 0) {
      throw new Error(
        'Invalid raw nutrition data: serving_size_g must be greater than 0 when is_per_100g is false.'
      );
    }
    factor = 100 / data.serving_size_g;
  }

  return {
    calories_per_100g: Number((data.calories * factor).toFixed(2)),
    total_fat_per_100g: Number((data.total_fat * factor).toFixed(2)),
    saturated_fat_per_100g: Number((data.saturated_fat * factor).toFixed(2)),
    trans_fat_per_100g: Number((data.trans_fat * factor).toFixed(2)),
    sugars_per_100g: Number((data.sugars * factor).toFixed(2)),
    added_sugars_per_100g: Number((data.added_sugars * factor).toFixed(2)),
    sodium_mg_per_100g: Number((data.sodium_mg * factor).toFixed(2)),
    fiber_per_100g: Number((data.fiber * factor).toFixed(2)),
    protein_per_100g: Number((data.protein * factor).toFixed(2)),
  };
}
