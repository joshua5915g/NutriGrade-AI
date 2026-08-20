import { UserProfile, DietaryPreferences } from '../../types/user';

export interface DietaryAlert {
  diet: string;
  matched_ingredient: string;
  severity: 'BLOCKED' | 'WARNING';
  reason: string;
}

interface PatternRule {
  key: keyof DietaryPreferences;
  dietName: string;
  keywords: string[];
  eNumbers: string[];
  severity: 'BLOCKED' | 'WARNING';
  reasonTemplate: (matched: string) => string;
}

const DIETARY_RULES: PatternRule[] = [
  // 1. PALM OIL FREE
  {
    key: 'palmOilFree',
    dietName: 'Palm Oil Free',
    keywords: [
      'palm oil',
      'palm kernel',
      'palmitate',
      'elaeis guineensis',
      'palm olein',
      'palm stearin',
      'sodium palmitate',
      'fractionated palm',
      'palm fruit oil',
    ],
    eNumbers: [],
    severity: 'BLOCKED',
    reasonTemplate: (matched) => `Contains "${matched}", which is a palm oil derivative linked to deforestation and high saturated fat levels.`,
  },

  // 2. VEGAN
  {
    key: 'isVegan',
    dietName: 'Vegan',
    keywords: [
      'milk',
      'whey',
      'casein',
      'caseinate',
      'lactose',
      'butter',
      'cream',
      'cheese',
      'egg',
      'albumen',
      'gelatin',
      'gelatine',
      'lard',
      'tallow',
      'honey',
      'carmine',
      'cochineal',
      'shellac',
      'collagen',
      'beef',
      'pork',
      'chicken',
      'poultry',
      'fish',
      'anchovy',
      'meat',
      'beeswax',
      'lanolin',
      'ghee',
    ],
    eNumbers: ['E120', 'E441', 'E901', 'E904', 'E542', 'E913'],
    severity: 'BLOCKED',
    reasonTemplate: (matched) => `Contains animal-derived ingredient/additive "${matched}", violating strict vegan preferences.`,
  },

  // 3. VEGETARIAN
  {
    key: 'isVegetarian',
    dietName: 'Vegetarian',
    keywords: [
      'gelatin',
      'gelatine',
      'lard',
      'tallow',
      'carmine',
      'cochineal',
      'beef',
      'pork',
      'chicken',
      'poultry',
      'fish',
      'anchovy',
      'meat',
      'collagen',
      'rennet',
    ],
    eNumbers: ['E120', 'E441', 'E542'],
    severity: 'BLOCKED',
    reasonTemplate: (matched) => `Contains non-vegetarian meat or slaughter byproduct "${matched}".`,
  },

  // 4. PORK FREE
  {
    key: 'isPorkFree',
    dietName: 'Pork Free',
    keywords: [
      'pork',
      'bacon',
      'ham',
      'lard',
      'porcine',
      'pork gelatin',
      'porcine enzymes',
      'pork fat',
    ],
    eNumbers: [],
    severity: 'BLOCKED',
    reasonTemplate: (matched) => `Contains porcine/pork derivative "${matched}".`,
  },

  // 5. LACTOSE FREE
  {
    key: 'isLactoseFree',
    dietName: 'Lactose Free',
    keywords: [
      'milk',
      'milk solids',
      'whey',
      'casein',
      'caseinate',
      'lactose',
      'butter',
      'cream',
      'cheese',
      'milk powder',
      'ghee',
      'condensed milk',
      'skimmed milk',
      'yogurt',
      'curd',
    ],
    eNumbers: [],
    severity: 'BLOCKED',
    reasonTemplate: (matched) => `Contains dairy component "${matched}" which triggers lactose intolerance.`,
  },

  // 6. SULFITE FREE
  {
    key: 'isSulfiteFree',
    dietName: 'Sulfite Free',
    keywords: [
      'sulfite',
      'sulphite',
      'sulfur dioxide',
      'sulphur dioxide',
      'sodium sulfite',
      'sodium bisulfite',
      'potassium metabisulfite',
      'metabisulfite',
    ],
    eNumbers: ['E220', 'E221', 'E222', 'E223', 'E224', 'E225', 'E226', 'E227', 'E228'],
    severity: 'BLOCKED',
    reasonTemplate: (matched) => `Contains sulfite preservative "${matched}" known to provoke respiratory or asthma triggers.`,
  },

  // 7. SOY FREE
  {
    key: 'isSoyFree',
    dietName: 'Soy Free',
    keywords: [
      'soy',
      'soya',
      'soybean',
      'soy protein',
      'soy lecithin',
      'edamame',
      'tofu',
      'tempeh',
    ],
    eNumbers: ['E322'], // Soy lecithin tag
    severity: 'BLOCKED',
    reasonTemplate: (matched) => `Contains soy ingredient "${matched}".`,
  },

  // 8. GLUTEN FREE
  {
    key: 'isGlutenFree',
    dietName: 'Gluten Free',
    keywords: [
      'wheat',
      'barley',
      'rye',
      'oats',
      'spelt',
      'kamut',
      'malt',
      'triticale',
      'gluten',
      'wheat flour',
      'semolina',
      'couscous',
      'seitan',
    ],
    eNumbers: [],
    severity: 'BLOCKED',
    reasonTemplate: (matched) => `Contains gluten-bearing grain "${matched}".`,
  },
];

/**
 * Audits ingredient and additive lists against the user's active dietary preferences.
 * Returns structured DietaryAlert items for any matching violations.
 */
export function auditDietaryPreferences(
  ingredients: string[] = [],
  additives: string[] = [],
  profile?: UserProfile
): DietaryAlert[] {
  if (!profile || !profile.dietaryPreferences) {
    return [];
  }

  const prefs = profile.dietaryPreferences;
  const alerts: DietaryAlert[] = [];

  const normalizedIngredients = ingredients.map((ing) => ing.toLowerCase().trim());
  const normalizedAdditives = additives.map((add) => add.toUpperCase().trim());

  for (const rule of DIETARY_RULES) {
    // Only check if user has explicitly enabled this preference
    if (!prefs[rule.key]) {
      continue;
    }

    let matched: string | null = null;

    // Check ingredients list for keywords
    for (const keyword of rule.keywords) {
      const found = normalizedIngredients.find((ing) => ing.includes(keyword));
      if (found) {
        matched = found;
        break;
      }
    }

    // Check additives list if no keyword match was found yet
    if (!matched && rule.eNumbers.length > 0) {
      for (const eNum of rule.eNumbers) {
        const found = normalizedAdditives.find(
          (add) => add.includes(eNum) || add.replace(/^EN:/, 'E') === eNum
        );
        if (found) {
          matched = found;
          break;
        }
      }
    }

    if (matched) {
      alerts.push({
        diet: rule.dietName,
        matched_ingredient: matched,
        severity: rule.severity,
        reason: rule.reasonTemplate(matched),
      });
    }
  }

  return alerts;
}
