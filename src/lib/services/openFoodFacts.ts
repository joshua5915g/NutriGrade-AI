import { RawNutritionData, AnalysisResult, Additive, SearchProductResult, NutriScoreGrade } from '../../types/nutrition';
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
 * Maps a raw Open Food Facts product JSON object to a standardized SearchProductResult.
 */
export function mapOffProductToSearchResult(product: any): SearchProductResult {
  const nutriments = product.nutriments || {};

  const calories =
    nutriments['energy-kcal_100g'] ??
    nutriments['energy-kcal'] ??
    (nutriments['energy_100g'] ? Math.round(nutriments['energy_100g'] / 4.184) : 0);

  const sodiumG = nutriments['sodium_100g'] ?? (nutriments['salt_100g'] ? nutriments['salt_100g'] / 2.5 : 0);
  const sodiumMg = Math.round(Number(sodiumG) * 1000);

  const rawData: RawNutritionData = {
    calories: Math.max(0, Math.round(Number(calories) || 0)),
    total_fat: Math.max(0, Number(nutriments['fat_100g'] ?? nutriments['fat'] ?? 0)),
    saturated_fat: Math.max(0, Number(nutriments['saturated-fat_100g'] ?? nutriments['saturated-fat'] ?? 0)),
    trans_fat: Math.max(0, Number(nutriments['trans-fat_100g'] ?? 0)),
    sugars: Math.max(0, Number(nutriments['sugars_100g'] ?? nutriments['sugars'] ?? 0)),
    added_sugars: Math.max(0, Number(nutriments['added-sugars_100g'] ?? 0)),
    sodium_mg: Math.max(0, sodiumMg),
    fiber: Math.max(0, Number(nutriments['fiber_100g'] ?? nutriments['fiber'] ?? 0)),
    protein: Math.max(0, Number(nutriments['proteins_100g'] ?? nutriments['proteins'] ?? 0)),
    serving_size_g: 100,
    is_per_100g: true,
  };

  const normalizedData = normalizeTo100g(rawData);
  const nutriScore = calculateNutriScore(normalizedData);

  // Override NutriScore grade if valid official letter exists
  const officialGrade = product.nutriscore_grade?.toUpperCase();
  if (['A', 'B', 'C', 'D', 'E'].includes(officialGrade)) {
    nutriScore.grade = officialGrade as NutriScoreGrade;
  }

  const ingredientsRaw =
    product.ingredients_text_en ||
    product.ingredients_text ||
    '';

  const ingredients = ingredientsRaw
    .split(/[,;\n]+/)
    .map((ing: string) => ing.trim().toLowerCase())
    .filter((ing: string) => ing.length > 0);

  const officialNova = Number(product.nova_group);
  const novaGroup = (officialNova >= 1 && officialNova <= 4 ? officialNova : detectNovaGroup(ingredients)) as 1 | 2 | 3 | 4;

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

  const productName = product.product_name_en || product.product_name || 'Unnamed Food Product';
  const brand = product.brands || product.brand_owner || product.brands_tags?.[0] || 'Unknown Brand';
  const imageThumbUrl =
    product.image_front_small_url ||
    product.image_front_thumb_url ||
    product.image_thumb_url ||
    product.image_small_url ||
    product.image_url ||
    '';

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
    explanation: `Verified product data for "${productName}" (${brand}) retrieved from Open Food Facts. Nutri-Score Grade ${nutriScore.grade} (${nutriScore.score} points).`,
    ...bioIntel,
  };

  const barcode = product.code || product._id || '';
  const id = barcode || `product_${Math.random().toString(36).slice(2, 9)}`;

  return {
    id,
    barcode,
    productName,
    brand,
    imageThumbUrl,
    nutriScoreGrade: nutriScore.grade,
    novaGroup,
    ingredients,
    rawData,
    analysis: analysisResult,
  };
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

    const searchResult = mapOffProductToSearchResult(data.product);

    return {
      analysis: searchResult.analysis,
      rawData: searchResult.rawData,
      productName: searchResult.productName,
      ingredients: searchResult.ingredients,
      barcode: cleanBarcode,
      source: 'open_food_facts',
    };
  } catch (error) {
    console.error('Open Food Facts API fetch error:', error);
    return null;
  }
}

