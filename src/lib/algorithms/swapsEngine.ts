import { NutriScoreGrade } from '../../types/nutrition';
import { UserProfile } from '../../types/user';
import { auditDietaryPreferences } from './dietaryAudit';

export interface SwapProduct {
  name: string;
  category: string;
  nutriScoreGrade: 'A' | 'B';
  nutriScoreScore: number;
  novaGroup: 1 | 2;
  caloriesPer100g: number;
  sugarsPer100g: number;
  fiberPer100g: number;
  proteinPer100g: number;
  ingredients: string[];
  additives?: string[];
  comparisonTags: string[];
  reasoning: string;
}

const SWAP_DATABASE: Record<string, SwapProduct[]> = {
  cereal_oats_spreads: [
    {
      name: 'Organic Rolled Oats & Seed Mix',
      category: 'Breakfast Cereal',
      nutriScoreGrade: 'A',
      nutriScoreScore: -6,
      novaGroup: 1,
      caloriesPer100g: 375,
      sugarsPer100g: 1.0,
      fiberPer100g: 11.0,
      proteinPer100g: 14.0,
      ingredients: ['organic rolled oats', 'pumpkin seeds', 'sunflower seeds', 'chia seeds'],
      comparisonTags: ['90% Less Sugar', 'NOVA 1 Wholefood', 'High Fiber (11g)'],
      reasoning: 'Replaces refined sugar with slow-release complex oats and gut-supporting seeds.',
    },
    {
      name: 'Spelt & Ancient Grain Muesli',
      category: 'Breakfast Cereal',
      nutriScoreGrade: 'A',
      nutriScoreScore: -4,
      novaGroup: 1,
      caloriesPer100g: 360,
      sugarsPer100g: 3.2,
      fiberPer100g: 8.5,
      proteinPer100g: 11.5,
      ingredients: ['whole grain spelt flakes', 'ancient grain muesli', 'sunflower seeds'],
      comparisonTags: ['No Added Sugars', 'Organic Grains', 'Grade A Rated'],
      reasoning: 'Zero processed sugars or artificial flavorings with rich mineral content.',
    },
    {
      name: '100% Pure Almond & Seed Spread',
      category: 'Spreads',
      nutriScoreGrade: 'B',
      nutriScoreScore: 1,
      novaGroup: 2,
      caloriesPer100g: 580,
      sugarsPer100g: 2.1,
      fiberPer100g: 7.0,
      proteinPer100g: 18.0,
      ingredients: ['roasted almonds', 'flaxseed'],
      comparisonTags: ['Zero Palm Oil', '100% Whole Nuts', 'High Protein'],
      reasoning: 'Free of palm oil, hydrogenated fats, and added sucrose found in commercial nut spreads.',
    },
  ],

  drinks_soda: [
    {
      name: 'Sparkling Mineral Water with Fresh Lemon',
      category: 'Beverages',
      nutriScoreGrade: 'A',
      nutriScoreScore: -8,
      novaGroup: 1,
      caloriesPer100g: 2,
      sugarsPer100g: 0.0,
      fiberPer100g: 0.0,
      proteinPer100g: 0.0,
      ingredients: ['carbonated mineral water', 'natural lemon juice'],
      comparisonTags: ['100% Zero Sugar', 'Zero Additives', 'Hydration Safe'],
      reasoning: 'Refreshes naturally without fructose corn syrup, artificial dyes, or preservatives.',
    },
    {
      name: 'Unsweetened Whole Almond & Oat Milk',
      category: 'Plant Milks',
      nutriScoreGrade: 'A',
      nutriScoreScore: -5,
      novaGroup: 1,
      caloriesPer100g: 38,
      sugarsPer100g: 0.4,
      fiberPer100g: 1.8,
      proteinPer100g: 2.8,
      ingredients: ['water', 'whole oats', 'almonds', 'sea salt'],
      comparisonTags: ['No Added Sugar', 'Calcium Enriched', 'NOVA 1 Natural'],
      reasoning: 'Light plant milk containing zero added cane sugar or carrageenan thickeners.',
    },
    {
      name: 'Cold-Pressed Cucumber, Lime & Mint Juice',
      category: 'Juices',
      nutriScoreGrade: 'B',
      nutriScoreScore: 1,
      novaGroup: 1,
      caloriesPer100g: 24,
      sugarsPer100g: 3.5,
      fiberPer100g: 1.5,
      proteinPer100g: 1.0,
      ingredients: ['cold pressed cucumber', 'lime juice', 'mint leaves'],
      comparisonTags: ['Raw Cold-Pressed', 'Low Glycemic Index', 'Vitamin C Boost'],
      reasoning: 'Retains natural fiber enzymes with significantly lower glycemic impact than soda.',
    },
  ],

  dairy_yogurt_desserts: [
    {
      name: 'Plain Organic Icelandic Skyr / Greek Yogurt',
      category: 'Dairy',
      nutriScoreGrade: 'A',
      nutriScoreScore: -5,
      novaGroup: 1,
      caloriesPer100g: 65,
      sugarsPer100g: 3.2,
      fiberPer100g: 0.0,
      proteinPer100g: 11.0,
      ingredients: ['pasteurized organic skim milk', 'live active yogurt cultures'],
      comparisonTags: ['High Protein (11g)', 'Zero Added Sugar', 'Live Probiotics'],
      reasoning: 'Packed with 11g of satiating protein per 100g with natural milk sugars only.',
    },
    {
      name: 'Whole Milk Grass-Fed Kefir',
      category: 'Dairy',
      nutriScoreGrade: 'A',
      nutriScoreScore: -3,
      novaGroup: 1,
      caloriesPer100g: 58,
      sugarsPer100g: 3.5,
      fiberPer100g: 0.0,
      proteinPer100g: 9.0,
      ingredients: ['pasteurized grass-fed whole milk', 'live active kefir cultures'],
      comparisonTags: ['Gut Microbiome Boost', '12 Live Strains', 'Grade A Rated'],
      reasoning: 'Fermented live culture drink supporting digestive gut health and immune function.',
    },
    {
      name: 'Unsweetened Berry & Chia Seed Bowl',
      category: 'Snacks',
      nutriScoreGrade: 'B',
      nutriScoreScore: 0,
      novaGroup: 1,
      caloriesPer100g: 85,
      sugarsPer100g: 4.2,
      fiberPer100g: 6.0,
      proteinPer100g: 3.5,
      ingredients: ['blueberries', 'raspberries', 'chia seeds', 'coconut milk'],
      comparisonTags: ['Omega-3 Rich', 'High Fiber (6g)', 'Natural Fruit'],
      reasoning: 'Combines antioxidant-rich berries with chia seeds for natural sweetness and satiety.',
    },
    {
      name: 'Organic Coconut Culture Probiotic Bowl',
      category: 'Plant Dairy',
      nutriScoreGrade: 'A',
      nutriScoreScore: -4,
      novaGroup: 1,
      caloriesPer100g: 72,
      sugarsPer100g: 1.8,
      fiberPer100g: 3.0,
      proteinPer100g: 4.5,
      ingredients: ['organic coconut milk', 'tapioca starch', 'live vegan probiotic cultures'],
      comparisonTags: ['100% Plant-Based', 'Dairy-Free', 'Live Probiotics'],
      reasoning: 'Silky probiotic coconut yogurt alternative rich in medium-chain triglycerides.',
    },
  ],
};

/**
 * Returns Grade A or B healthy swap recommendations matching product category
 * and strictly complying with active user dietary preferences.
 */
export function getHealthySwaps(
  productName: string = '',
  currentGrade: NutriScoreGrade,
  profile?: UserProfile
): SwapProduct[] {
  // Only suggest swaps for Grade C, D, or E items
  if (currentGrade === 'A' || currentGrade === 'B') {
    return [];
  }

  const nameLower = productName.toLowerCase();
  let primaryPool: SwapProduct[] = [];

  if (
    nameLower.includes('soda') ||
    nameLower.includes('drink') ||
    nameLower.includes('milk') ||
    nameLower.includes('juice') ||
    nameLower.includes('coke') ||
    nameLower.includes('beverage')
  ) {
    primaryPool = [...SWAP_DATABASE.drinks_soda];
  } else if (
    nameLower.includes('yogurt') ||
    nameLower.includes('dairy') ||
    nameLower.includes('cheese') ||
    nameLower.includes('cream') ||
    nameLower.includes('curd')
  ) {
    primaryPool = [...SWAP_DATABASE.dairy_yogurt_desserts];
  } else {
    primaryPool = [...SWAP_DATABASE.cereal_oats_spreads];
  }

  // Fallback pool from all categories
  const fullPool = [
    ...primaryPool,
    ...SWAP_DATABASE.dairy_yogurt_desserts,
    ...SWAP_DATABASE.cereal_oats_spreads,
    ...SWAP_DATABASE.drinks_soda,
  ];

  const validSwaps: SwapProduct[] = [];
  const seenNames = new Set<string>();

  for (const item of fullPool) {
    if (seenNames.has(item.name)) continue;

    // Perform strict dietary preference audit
    if (profile && profile.dietaryPreferences) {
      const alerts = auditDietaryPreferences(item.ingredients || [], item.additives || [], profile);
      const isBlocked = alerts.some((a) => a.severity === 'BLOCKED');
      if (isBlocked) {
        continue;
      }
    }

    seenNames.add(item.name);
    validSwaps.push(item);

    if (validSwaps.length >= 3) break;
  }

  return validSwaps;
}
