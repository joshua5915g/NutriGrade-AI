import { CompareProductItem } from '../algorithms/productComparator';
import { calculateNutriScore } from '../algorithms/nutriScore';
import { detectNovaGroup } from '../algorithms/novaScale';
import { runBiologicalPipeline } from '../algorithms/biologicalEngine';
import { RawNutritionData } from '../../types/nutrition';

function createSampleProduct(
  id: string,
  name: string,
  brand: string,
  ingredients: string[],
  raw: RawNutritionData,
  imagePreview?: string
): CompareProductItem {
  const norm = {
    calories_per_100g: raw.calories,
    total_fat_per_100g: raw.total_fat,
    saturated_fat_per_100g: raw.saturated_fat,
    trans_fat_per_100g: raw.trans_fat,
    sugars_per_100g: raw.sugars,
    added_sugars_per_100g: raw.added_sugars,
    sodium_mg_per_100g: raw.sodium_mg,
    fiber_per_100g: raw.fiber,
    protein_per_100g: raw.protein,
  };

  const nutriScore = calculateNutriScore(norm);
  const novaGroup = detectNovaGroup(ingredients);

  const additivesList = ingredients
    .filter((ing) => /e\d+|syrup|flavor|benzoate|sorbate|sucralose|carrageenan|bht|polysorbate/i.test(ing))
    .map((ing) => ({
      eNumber: ing.match(/e\d+/i)?.[0]?.toUpperCase() || 'Additive',
      commonName: ing,
      riskLevel: (ing.includes('carrageenan') || ing.includes('syrup') || ing.includes('polysorbate') ? 'high' : 'moderate') as 'low' | 'moderate' | 'high',
      description: `Identified additive: ${ing}`,
    }));

  const bioMetrics = runBiologicalPipeline(
    ingredients,
    additivesList.map((a) => a.commonName),
    raw.sugars,
    raw.fiber
  );

  return {
    id,
    name,
    brand,
    imagePreview,
    ingredients,
    rawData: raw,
    analysis: {
      normalizedData: norm,
      nutriScore,
      novaGroup,
      additives: additivesList,
      healthWarnings: [],
      explanation: `Analyzed ${name} (${brand}). Contains ${ingredients.length} primary ingredients.`,
      glycemic_index_estimate: bioMetrics.glycemic_index_estimate,
      glycemic_load: bioMetrics.glycemic_load,
      glycemic_impact_level: bioMetrics.glycemic_impact_level,
      gut_health_score: bioMetrics.gut_health_score,
      gut_disruptors_detected: bioMetrics.gut_disruptors_detected,
      hidden_sugars_found: bioMetrics.hidden_sugars_found,
      regulatory_alerts: bioMetrics.regulatory_alerts,
      allergen_warnings: bioMetrics.allergen_warnings,
    },
  };
}

export const SAMPLE_COMPARE_PRODUCTS: Record<string, CompareProductItem> = {
  organic_oats: createSampleProduct(
    'organic_oats',
    'Organic 100% Rolled Oats',
    'Nature Farm',
    ['100% organic whole grain rolled oats'],
    {
      calories: 375,
      total_fat: 6.5,
      saturated_fat: 1.2,
      trans_fat: 0,
      sugars: 1.0,
      added_sugars: 0,
      sodium_mg: 5,
      fiber: 10.0,
      protein: 13.5,
      serving_size_g: 40,
      is_per_100g: true,
    }
  ),

  frosted_cereal: createSampleProduct(
    'frosted_cereal',
    'Frosted Sugar Corn Flakes',
    'Morning Sugar Co',
    [
      'milled corn',
      'sugar',
      'malt flavor',
      'high fructose corn syrup',
      'salt',
      'BHT for freshness',
      'artificial flavor',
    ],
    {
      calories: 390,
      total_fat: 0.5,
      saturated_fat: 0.1,
      trans_fat: 0,
      sugars: 37.0,
      added_sugars: 36.0,
      sodium_mg: 620,
      fiber: 1.5,
      protein: 4.5,
      serving_size_g: 35,
      is_per_100g: true,
    }
  ),

  plain_greek_yogurt: createSampleProduct(
    'plain_greek_yogurt',
    'Authentic Plain Greek Yogurt',
    'Olympus Pure',
    ['grade A pasteurized milk', 'live active yogurt cultures'],
    {
      calories: 90,
      total_fat: 4.0,
      saturated_fat: 2.5,
      trans_fat: 0,
      sugars: 3.5,
      added_sugars: 0,
      sodium_mg: 45,
      fiber: 0,
      protein: 10.0,
      serving_size_g: 150,
      is_per_100g: true,
    }
  ),

  fruit_yogurt: createSampleProduct(
    'fruit_yogurt',
    'Strawberry Fruit Blend Yogurt',
    'SweetDairy Brands',
    [
      'skim milk',
      'strawberry fruit syrup (sugar, modified corn starch)',
      'sucralose',
      'carrageenan (E407)',
      'carmine (E120)',
      'potassium sorbate (E202)',
    ],
    {
      calories: 110,
      total_fat: 1.5,
      saturated_fat: 0.9,
      trans_fat: 0,
      sugars: 15.0,
      added_sugars: 10.0,
      sodium_mg: 80,
      fiber: 0.4,
      protein: 3.8,
      serving_size_g: 125,
      is_per_100g: true,
    }
  ),

  almond_milk_unsweetened: createSampleProduct(
    'almond_milk_unsweetened',
    'Unsweetened Almond Milk',
    'PureNut Botanicals',
    ['filtered water', 'almonds', 'sea salt'],
    {
      calories: 30,
      total_fat: 2.5,
      saturated_fat: 0.2,
      trans_fat: 0,
      sugars: 0.2,
      added_sugars: 0,
      sodium_mg: 120,
      fiber: 1.0,
      protein: 1.2,
      serving_size_g: 240,
      is_per_100g: true,
    }
  ),

  chocolate_drink_ultra: createSampleProduct(
    'chocolate_drink_ultra',
    'Sugary Chocolate Flavored Drink',
    'MegaChoc Global',
    [
      'water',
      'high fructose corn syrup',
      'hydrogenated soybean oil',
      'carrageenan (E407)',
      'artificial vanilla flavor',
      'polysorbate 80 (E433)',
      'sodium hexametaphosphate (E452i)',
    ],
    {
      calories: 420,
      total_fat: 3.5,
      saturated_fat: 2.2,
      trans_fat: 0,
      sugars: 34.0,
      added_sugars: 30.0,
      sodium_mg: 480,
      fiber: 0,
      protein: 3.0,
      serving_size_g: 250,
      is_per_100g: true,
    }
  ),
};

export const CURATED_CLASH_MATCHUPS = [
  {
    title: '🥣 Breakfast Cereal Showdown',
    subtitle: 'Whole Grain Rolled Oats vs Frosted Sugar Flakes',
    itemAId: 'organic_oats',
    itemBId: 'frosted_cereal',
    tag: 'Sugar & Fiber Shock',
  },
  {
    title: '🥛 Yogurt Aisle Dilemma',
    subtitle: 'Pure Greek Yogurt vs Commercial Strawberry Fruit Yogurt',
    itemAId: 'plain_greek_yogurt',
    itemBId: 'fruit_yogurt',
    tag: 'Gut & Additive Audit',
  },
  {
    title: '🍫 Plant Beverage vs Sugary Chocolate Milk',
    subtitle: 'Clean Unsweetened Almond Milk vs Ultra-Processed Chocolate Drink',
    itemAId: 'almond_milk_unsweetened',
    itemBId: 'chocolate_drink_ultra',
    tag: 'Seed Oils & Sugar Alert',
  },
];
