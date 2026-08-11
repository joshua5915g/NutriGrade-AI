import { NovaGroup } from '../../types/nutrition';

// Industrial additives and processing markers indicative of Group 4 (Ultra-processed foods)
const ULTRA_PROCESSED_MARKERS = [
  'high fructose corn syrup',
  'hfcs',
  'glucose-fructose syrup',
  'corn syrup',
  'hydrogenated',
  'partially hydrogenated',
  'aspartame',
  'sucralose',
  'acesulfame',
  'saccharin',
  'neotame',
  'advantame',
  'maltodextrin',
  'dextrose',
  'polydextrose',
  'modified starch',
  'modified food starch',
  'soy protein isolate',
  'whey protein isolate',
  'pea protein isolate',
  'hydrolyzed protein',
  'yeast extract',
  'monosodium glutamate',
  'msg',
  'disodium inosinate',
  'disodium guanylate',
  'carrageenan',
  'xanthan gum',
  'guar gum',
  'carboxymethylcellulose',
  'polysorbate',
  'soy lecithin',
  'sunflower lecithin',
  'mono- and diglycerides',
  'sodium benzoate',
  'potassium sorbate',
  'sodium nitrite',
  'calcium propionate',
  'titanium dioxide',
  'tartrazine',
  'sunset yellow',
  'allura red',
  'artificial flavor',
  'artificial flavoring',
  'artificial flavour',
  'artificial flavouring',
  'flavoring',
  'flavouring',
  'emulsifier',
  'e621', // MSG
  'e322', // Lecithins
  'e471', // Mono- and diglycerides of fatty acids
  'e407', // Carrageenan
  'e415', // Xanthan gum
  'e412', // Guar gum
  'e150', // Caramel color
  'e171', // Titanium dioxide
  'e211', // Sodium benzoate
  'e202', // Potassium sorbate
  'e250', // Sodium nitrite
];

// Culinary ingredients indicative of Group 2 (culinary agents)
const CULINARY_INGREDIENTS = [
  'salt',
  'sodium chloride',
  'sugar',
  'sucrose',
  'oil',
  'butter',
  'vinegar',
  'honey',
  'maple syrup',
  'lard',
  'margarine',
  'olive oil',
  'sunflower oil',
  'coconut oil',
  'canola oil',
];

/**
 * Detects the NOVA food processing group based on ingredient strings.
 *
 * Classification rules:
 * - Group 4 (Ultra-Processed): Contains at least one industrial marker (additives, artificial flavors, emulsifiers).
 * - Group 2 (Culinary Ingredients): The ingredients list consists *entirely* of culinary items (e.g. just salt or olive oil).
 * - Group 3 (Processed): Contains culinary items added to basic foods (e.g. peanuts + salt, or peaches + water + sugar).
 * - Group 1 (Unprocessed/Minimally Processed): Contains basic ingredients without culinary additions or industrial processing (e.g. milk, wheat flour, oats).
 *
 * @param ingredients - List of ingredients extracted from packaging
 * @returns NovaGroup (1, 2, 3, or 4)
 */
export function detectNovaGroup(ingredients: string[]): NovaGroup {
  if (!ingredients || ingredients.length === 0) {
    return 1;
  }

  // Normalize ingredients for comparison (lowercase & trim whitespace)
  const normalizedIngredients = ingredients.map((ing) => ing.toLowerCase().trim());

  // Rule 1: Check for any industrial/ultra-processed markers (Group 4)
  const hasUltraProcessedMarker = normalizedIngredients.some((ing) => {
    return ULTRA_PROCESSED_MARKERS.some((marker) => ing.includes(marker));
  });

  if (hasUltraProcessedMarker) {
    return 4;
  }

  // Rule 2: Check for culinary ingredients
  const culinaryCount = normalizedIngredients.filter((ing) => {
    return CULINARY_INGREDIENTS.some((culinary) => ing.includes(culinary));
  }).length;

  const totalCount = normalizedIngredients.length;

  if (culinaryCount === totalCount && totalCount > 0) {
    // Ingredients list consists entirely of culinary agents
    return 2;
  }

  if (culinaryCount > 0 && culinaryCount < totalCount) {
    // Simple ingredients mixed with culinary agents (e.g., salted almonds)
    return 3;
  }

  // Rule 3: Otherwise, it's unprocessed/minimally processed
  return 1;
}
