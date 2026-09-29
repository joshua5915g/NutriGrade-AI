/**
 * Allergen & Cross-Contamination Warning Matrix (FDA Big-9 & EU-14 Scanner)
 * 
 * Inspects ingredient lists and advisory text for:
 * 1. Direct allergen presence (Big-9 + EU allergens)
 * 2. Cross-contamination / facility warnings ("may contain", "processed in a facility that also handles")
 * 3. Clinical risk level & user profile conflict alerts
 */

import { UserProfile } from '../../types/user';

export type AllergenSeverity = 'high_anaphylaxis' | 'autoimmune' | 'intolerance' | 'moderate';
export type AllergenPresence = 'DIRECT' | 'CROSS_CONTAMINATION' | 'NONE';

export interface AllergenDef {
  id: string;
  name: string;
  category: 'big9' | 'eu14';
  icon: string;
  severity: AllergenSeverity;
  clinicalDescription: string;
  directKeywords: string[];
  crossContamKeywords: string[];
}

export interface DetectedAllergen {
  allergen: AllergenDef;
  presence: AllergenPresence;
  matchedTerms: string[];
  warningNote: string;
  isPersonalConflict: boolean;
}

export interface AllergenScanResult {
  hasAllergens: boolean;
  hasDirectAllergens: boolean;
  hasCrossContamination: boolean;
  totalDirectCount: number;
  totalCrossCount: number;
  personalConflictCount: number;
  detectedAllergens: DetectedAllergen[];
  safeAllergens: AllergenDef[];
  advisoryTextFound: string[];
  summaryNote: string;
}

export const ALLERGEN_REGISTRY: AllergenDef[] = [
  {
    id: 'peanut',
    name: 'Peanuts',
    category: 'big9',
    icon: '🥜',
    severity: 'high_anaphylaxis',
    clinicalDescription: 'Major cause of severe and potentially fatal food-induced anaphylaxis.',
    directKeywords: ['peanut', 'peanuts', 'arachis oil', 'groundnut', 'peanut butter', 'peanut flour', 'monkey nuts'],
    crossContamKeywords: ['peanut', 'peanuts', 'groundnut'],
  },
  {
    id: 'tree_nut',
    name: 'Tree Nuts',
    category: 'big9',
    icon: '🌰',
    severity: 'high_anaphylaxis',
    clinicalDescription: 'High risk of acute systemic reactions; includes almonds, walnuts, cashews, hazelnuts, pistachios.',
    directKeywords: [
      'almond', 'almonds', 'walnut', 'walnuts', 'cashew', 'cashews', 'hazelnut', 'hazelnuts',
      'pistachio', 'pistachios', 'pecan', 'pecans', 'macadamia', 'brazil nut', 'praline', 'marzipan',
      'nut butter', 'chestnut', 'pine nut'
    ],
    crossContamKeywords: ['tree nut', 'tree nuts', 'nuts', 'almond', 'cashew', 'walnut', 'hazelnut'],
  },
  {
    id: 'milk',
    name: 'Milk & Dairy',
    category: 'big9',
    icon: '🥛',
    severity: 'intolerance',
    clinicalDescription: 'Causes IgE-mediated milk allergy in children and severe lactose intolerance or digestive distress.',
    directKeywords: [
      'milk', 'dairy', 'whey', 'casein', 'caseinate', 'lactose', 'butter', 'cream', 'cheese',
      'curd', 'ghee', 'milk powder', 'milkfat', 'buttermilk', 'lactoglobulin', 'yogurt'
    ],
    crossContamKeywords: ['milk', 'dairy', 'lactose', 'whey'],
  },
  {
    id: 'egg',
    name: 'Eggs',
    category: 'big9',
    icon: '🥚',
    severity: 'high_anaphylaxis',
    clinicalDescription: 'Egg white proteins (ovalbumin, ovomucoid) frequently trigger pediatric allergies.',
    directKeywords: [
      'egg', 'eggs', 'egg white', 'egg yolk', 'albumin', 'ovalbumin', 'ovomucoid',
      'lysozyme', 'globulin', 'meringue', 'mayonnaise', 'egg powder'
    ],
    crossContamKeywords: ['egg', 'eggs', 'egg white'],
  },
  {
    id: 'fish',
    name: 'Fish',
    category: 'big9',
    icon: '🐟',
    severity: 'high_anaphylaxis',
    clinicalDescription: 'Parvalbumin protein in finfish is heat-stable and resistant to cooking enzymes.',
    directKeywords: [
      'fish', 'salmon', 'tuna', 'cod', 'halibut', 'anchovy', 'anchovies', 'tilapia',
      'bass', 'trout', 'fish sauce', 'fish gelatin', 'surimi', 'isinglass'
    ],
    crossContamKeywords: ['fish', 'salmon', 'anchovy'],
  },
  {
    id: 'crustacean',
    name: 'Crustacean Shellfish',
    category: 'big9',
    icon: '🦐',
    severity: 'high_anaphylaxis',
    clinicalDescription: 'Tropomyosin allergen poses high lifelong risk of acute respiratory and circulatory distress.',
    directKeywords: [
      'shellfish', 'crustacean', 'crustaceans', 'shrimp', 'prawn', 'prawns', 'crab',
      'lobster', 'krill', 'crayfish', 'langoustine'
    ],
    crossContamKeywords: ['shellfish', 'crustacean', 'shrimp', 'crab', 'lobster'],
  },
  {
    id: 'wheat_gluten',
    name: 'Wheat & Gluten',
    category: 'big9',
    icon: '🌾',
    severity: 'autoimmune',
    clinicalDescription: 'Triggers Celiac autoimmune villous atrophy, non-celiac gluten sensitivity, and wheat anaphylaxis.',
    directKeywords: [
      'wheat', 'gluten', 'spelt', 'semolina', 'durum', 'farina', 'graham', 'kamut',
      'barley', 'rye', 'malt', 'malt extract', 'wheat flour', 'wheat starch', 'triticale', 'bulgur', 'couscous'
    ],
    crossContamKeywords: ['wheat', 'gluten', 'barley', 'rye'],
  },
  {
    id: 'soy',
    name: 'Soybeans',
    category: 'big9',
    icon: '🫘',
    severity: 'moderate',
    clinicalDescription: 'Prevalent in processed foods via soy lecithin, isolate protein, and vegetable broths.',
    directKeywords: [
      'soy', 'soya', 'soybean', 'soybeans', 'soy lecithin', 'soy protein', 'tofu',
      'edamame', 'tamari', 'miso', 'tempeh', 'textured vegetable protein', 'tvp'
    ],
    crossContamKeywords: ['soy', 'soya', 'soybean'],
  },
  {
    id: 'sesame',
    name: 'Sesame',
    category: 'big9',
    icon: '🌱',
    severity: 'high_anaphylaxis',
    clinicalDescription: 'Official 9th major US allergen (FASTER Act 2023). Found in tahini, hummuses, and oils.',
    directKeywords: [
      'sesame', 'sesame seed', 'sesame seeds', 'sesame oil', 'tahini', 'tahina', 'gomasio', 'til'
    ],
    crossContamKeywords: ['sesame', 'sesame seeds'],
  },
  {
    id: 'celery',
    name: 'Celery',
    category: 'eu14',
    icon: '🥬',
    severity: 'moderate',
    clinicalDescription: 'Common allergen in central Europe; celery tuber and seed extracts can trigger oral allergy syndrome.',
    directKeywords: ['celery', 'celeriac', 'celery seed', 'celery salt', 'celery extract'],
    crossContamKeywords: ['celery'],
  },
  {
    id: 'mustard',
    name: 'Mustard',
    category: 'eu14',
    icon: '🟡',
    severity: 'high_anaphylaxis',
    clinicalDescription: 'EU priority allergen; heat-stable proteins can trigger severe immediate hypersensitivity.',
    directKeywords: ['mustard', 'mustard seed', 'mustard flour', 'mustard powder', 'mustard oil'],
    crossContamKeywords: ['mustard'],
  },
  {
    id: 'sulfites',
    name: 'Sulphites (>10 mg/kg)',
    category: 'eu14',
    icon: '⚠️',
    severity: 'intolerance',
    clinicalDescription: 'Preservative (E220-E228) causing bronchospasm and asthmatic attacks in sensitive individuals.',
    directKeywords: [
      'sulfite', 'sulfites', 'sulphite', 'sulphites', 'sulfur dioxide', 'sodium metabisulfite',
      'potassium metabisulfite', 'sodium bisulfite', 'e220', 'e221', 'e222', 'e223', 'e224', 'e228'
    ],
    crossContamKeywords: ['sulfite', 'sulfites', 'sulphite'],
  },
  {
    id: 'lupin',
    name: 'Lupin',
    category: 'eu14',
    icon: '🌸',
    severity: 'high_anaphylaxis',
    clinicalDescription: 'Legume flower seed closely cross-reactive with peanut allergens in baked confectionery.',
    directKeywords: ['lupin', 'lupine', 'lupin flour', 'lupin seeds', 'lupin protein'],
    crossContamKeywords: ['lupin', 'lupine'],
  },
  {
    id: 'molluscs',
    name: 'Molluscs',
    category: 'eu14',
    icon: '🦪',
    severity: 'high_anaphylaxis',
    clinicalDescription: 'Includes oysters, mussels, clams, squid, octopus, and snails.',
    directKeywords: [
      'mollusc', 'molluscs', 'mollusk', 'oyster', 'mussel', 'mussels', 'clam', 'clams',
      'squid', 'calamari', 'octopus', 'snail', 'escargot', 'scallop', 'scallops'
    ],
    crossContamKeywords: ['mollusc', 'molluscs', 'squid', 'oyster'],
  },
];

// Patterns indicating cross-contamination or advisory warnings
const ADVISORY_PATTERNS = [
  /may contain (traces of)?\s*([a-zA-Z0-9,\s]+)/i,
  /processed in a facility that (also )?(processes|handles)\s*([a-zA-Z0-9,\s]+)/i,
  /manufactured (on|in) (shared|the same) equipment (as|with)\s*([a-zA-Z0-9,\s]+)/i,
  /packaged in a facility (that|which) handles\s*([a-zA-Z0-9,\s]+)/i,
  /traces of\s*([a-zA-Z0-9,\s]+)/i,
];

/**
 * Scans an ingredient array and optional raw advisory statement for allergens and facility cross-contamination.
 */
export function scanAllergenMatrix(
  ingredients: string[] = [],
  profile?: UserProfile | null,
  rawLabelText?: string
): AllergenScanResult {
  const normalizedIngredients = ingredients.map((i) => i.toLowerCase().trim());
  const combinedText = [
    ...normalizedIngredients,
    (rawLabelText || '').toLowerCase(),
  ].join(' | ');

  // Extract facility advisory sentences
  const advisoryStatements: string[] = [];
  const lines = (rawLabelText || '').split(/[.\n;]/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (ADVISORY_PATTERNS.some((pat) => pat.test(trimmed))) {
      advisoryStatements.push(trimmed);
    }
  }

  const detectedMap = new Map<string, DetectedAllergen>();

  for (const def of ALLERGEN_REGISTRY) {
    let presence: AllergenPresence = 'NONE';
    const matchedTerms: string[] = [];

    // Check direct ingredient presence first
    for (const kw of def.directKeywords) {
      // Check in ingredient list
      for (const ing of normalizedIngredients) {
        if (
          ing === kw ||
          ing.includes(` ${kw}`) ||
          ing.startsWith(`${kw} `) ||
          ing.includes(`(${kw})`) ||
          ing.includes(` ${kw} `) ||
          ing.includes(kw)
        ) {
          presence = 'DIRECT';
          if (!matchedTerms.includes(kw)) {
            matchedTerms.push(kw);
          }
        }
      }
    }

    // If not directly present, check cross-contamination keywords in advisory lines or text
    if (presence === 'NONE') {
      for (const kw of def.crossContamKeywords) {
        const kwRegex = new RegExp(`\\b${kw}\\b`, 'i');
        for (const adv of advisoryStatements) {
          if (kwRegex.test(adv)) {
            presence = 'CROSS_CONTAMINATION';
            if (!matchedTerms.includes(kw)) {
              matchedTerms.push(kw);
            }
          }
        }

        // Also check if raw text has "may contain <kw>"
        const mayContainRegex = new RegExp(`(?:may contain|facility that handles|shared equipment)[^.;]*?\\b${kw}\\b`, 'i');
        if (mayContainRegex.test(combinedText)) {
          presence = 'CROSS_CONTAMINATION';
          if (!matchedTerms.includes(kw)) {
            matchedTerms.push(kw);
          }
        }
      }
    }

    if (presence !== 'NONE') {
      // Determine if this allergen conflicts with user's personal profile
      let isPersonalConflict = false;
      if (profile) {
        if (def.id === 'wheat_gluten' && (profile.medicalFlags?.isCeliac || profile.dietaryPreferences?.isGlutenFree)) {
          isPersonalConflict = true;
        }
        if (def.id === 'milk' && profile.dietaryPreferences?.isLactoseFree) {
          isPersonalConflict = true;
        }
        if (def.id === 'soy' && profile.dietaryPreferences?.isSoyFree) {
          isPersonalConflict = true;
        }
        if (def.id === 'sulfites' && profile.dietaryPreferences?.isSulfiteFree) {
          isPersonalConflict = true;
        }
      }

      let warningNote = '';
      if (presence === 'DIRECT') {
        warningNote = `Contains ${def.name} directly in recipe ingredients.`;
      } else {
        warningNote = `Advisory warning: Manufactured in a facility or on shared lines with ${def.name}.`;
      }

      detectedMap.set(def.id, {
        allergen: def,
        presence,
        matchedTerms,
        warningNote,
        isPersonalConflict,
      });
    }
  }

  const detectedAllergens = Array.from(detectedMap.values());
  const safeAllergens = ALLERGEN_REGISTRY.filter((d) => !detectedMap.has(d.id));

  const totalDirectCount = detectedAllergens.filter((d) => d.presence === 'DIRECT').length;
  const totalCrossCount = detectedAllergens.filter((d) => d.presence === 'CROSS_CONTAMINATION').length;
  const personalConflictCount = detectedAllergens.filter((d) => d.isPersonalConflict).length;

  let summaryNote = '';
  if (personalConflictCount > 0) {
    summaryNote = `CRITICAL WARNING: Contains ${personalConflictCount} allergen(s) conflicting directly with your saved medical/dietary profile!`;
  } else if (totalDirectCount > 0) {
    summaryNote = `Contains ${totalDirectCount} confirmed direct allergen(s). Please review ingredient labels before consuming.`;
  } else if (totalCrossCount > 0) {
    summaryNote = `Free from direct recipe allergens, but carries ${totalCrossCount} facility cross-contamination advisory warning(s).`;
  } else {
    summaryNote = `No major FDA Big-9 or EU-14 allergens detected in the declared ingredients list.`;
  }

  return {
    hasAllergens: detectedAllergens.length > 0,
    hasDirectAllergens: totalDirectCount > 0,
    hasCrossContamination: totalCrossCount > 0,
    totalDirectCount,
    totalCrossCount,
    personalConflictCount,
    detectedAllergens,
    safeAllergens,
    advisoryTextFound: advisoryStatements,
    summaryNote,
  };
}
