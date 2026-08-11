import { RawNutritionData, AnalysisResult, Additive } from '../../types/nutrition';
import { normalizeTo100g } from '../utils/normalization';
import { calculateNutriScore } from '../algorithms/nutriScore';
import { detectNovaGroup } from '../algorithms/novaScale';
import { runBiologicalPipeline } from '../algorithms/biologicalEngine';

export interface OpenFoodFactsFetchResult {
  analysis: AnalysisResult;
  rawData: RawNutritionData;
  productName: string;
  ingredients: string[];
  barcode: string;
  source: 'open_food_facts';
}

/**
 * Queries Open Food Facts API v2 for a product by barcode (EAN-13 / UPC-A).
 * Returns mapped AnalysisResult or null if product is unlisted / invalid.
 */
export async function fetchByBarcode(
  barcode: string
): Promise<OpenFoodFactsFetchResult | null> {
  const cleanBarcode = barcode.trim().replace(/\D/g, '');
  if (!cleanBarcode || cleanBarcode.length < 8) {
    return null;
  }

  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'NutriGradeAI - Enterprise Food Analyzer - WebApp',
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.status !== 1 || !data.product) {
      return null;
    }

    const product = data.product;
    const nutriments = product.nutriments || {};

    // Extract calories
    const calories =
      nutriments['energy-kcal_100g'] ??
      nutriments['energy-kcal'] ??
      (nutriments['energy_100g'] ? Math.round(nutriments['energy_100g'] / 4.184) : 0);

    // Extract Sodium (mg). Note: Open Food Facts stores sodium in grams or salt in grams
    const sodiumG = nutriments['sodium_100g'] ?? (nutriments['salt_100g'] ? nutriments['salt_100g'] / 2.5 : 0);
    const sodiumMg = Math.round(sodiumG * 1000);

    // Construct RawNutritionData Baseline (Always per 100g)
    const rawData: RawNutritionData = {
      calories: Number(calories) || 0,
      total_fat: Number(nutriments['fat_100g'] ?? nutriments['fat'] ?? 0),
      saturated_fat: Number(nutriments['saturated-fat_100g'] ?? nutriments['saturated-fat'] ?? 0),
      trans_fat: Number(nutriments['trans-fat_100g'] ?? 0),
      sugars: Number(nutriments['sugars_100g'] ?? nutriments['sugars'] ?? 0),
      added_sugars: Number(nutriments['added-sugars_100g'] ?? 0),
      sodium_mg: sodiumMg,
      fiber: Number(nutriments['fiber_100g'] ?? nutriments['fiber'] ?? 0),
      protein: Number(nutriments['proteins_100g'] ?? nutriments['proteins'] ?? 0),
      serving_size_g: 100,
      is_per_100g: true,
    };

    // 1. Normalize
    const normalizedData = normalizeTo100g(rawData);

    // 2. Compute Nutri-Score
    const nutriScore = calculateNutriScore(normalizedData);

    // 3. Extract Ingredients Array
    const ingredientsRaw =
      product.ingredients_text_en ||
      product.ingredients_text ||
      '';

    const ingredients = ingredientsRaw
      .split(/[,;\n]+/)
      .map((ing: string) => ing.trim().toLowerCase())
      .filter((ing: string) => ing.length > 0);

    // 4. NOVA Group (Use official group if valid 1-4, else fall back to scanner)
    const officialNova = Number(product.nova_group);
    const novaGroup = officialNova >= 1 && officialNova <= 4 ? (officialNova as 1 | 2 | 3 | 4) : detectNovaGroup(ingredients);

    // 5. Extract Additives
    const additivesTags: string[] = product.additives_tags || [];
    const additives: Additive[] = additivesTags.map((tag) => {
      const eNum = tag.replace(/^en:/, '').toUpperCase();
      return {
        eNumber: eNum,
        commonName: `Additive ${eNum}`,
        riskLevel: eNum.includes('E150') || eNum.includes('E211') || eNum.includes('E250') ? 'high' : 'moderate',
        description: `Industrial additive registered under Open Food Facts tag ${tag}.`,
      };
    });

    const productName = product.product_name_en || product.product_name || `Barcode ${cleanBarcode}`;

    const additiveNames = additives.map((a) => a.commonName);
    const bioIntel = runBiologicalPipeline(
      ingredients,
      additiveNames,
      normalizedData.sugars_per_100g,
      normalizedData.fiber_per_100g
    );

    const analysisResult: AnalysisResult = {
      normalizedData,
      nutriScore,
      novaGroup,
      additives,
      healthWarnings: novaGroup === 4 ? ['Ultra-processed food item detected via Open Food Facts database'] : [],
      explanation: `Verified product data for "${productName}" (Barcode: ${cleanBarcode}) retrieved from Open Food Facts API. Nutri-Score Grade ${nutriScore.grade} (${nutriScore.score} points).`,
      ...bioIntel,
    };

    return {
      analysis: analysisResult,
      rawData,
      productName,
      ingredients,
      barcode: cleanBarcode,
      source: 'open_food_facts',
    };
  } catch (error) {
    console.error('Open Food Facts API fetch error:', error);
    return null;
  }
}
