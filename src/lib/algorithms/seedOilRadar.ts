/**
 * seedOilRadar.ts
 *
 * Seed Oil & Inflammatory Fat Radar Algorithm.
 * Scans product ingredients for industrial, high-heat refined seed oils
 * with elevated Omega-6 linoleic acid ratios and hexane solvent processing.
 * Recommends clean, unrefined fat alternatives.
 */

export interface DetectedSeedOil {
  name: string;
  category: string;
  riskLevel: 'High Heat Refined' | 'Hydrogenated Trans Fat' | 'Moderate Refined';
  reason: string;
}

export interface CleanOilSwap {
  name: string;
  benefits: string;
}

export interface SeedOilRadarResult {
  hasSeedOils: boolean;
  detectedOils: DetectedSeedOil[];
  cleanSwaps: CleanOilSwap[];
  overallRiskCategory: 'High Inflammatory Risk' | 'Moderate Inflammatory Risk' | 'Seed Oil Free';
}

const INDUSTRIAL_SEED_OILS: Array<{
  pattern: string;
  name: string;
  category: string;
  riskLevel: DetectedSeedOil['riskLevel'];
  reason: string;
}> = [
  {
    pattern: 'canola',
    name: 'Canola Oil / Rapeseed Oil',
    category: 'High-Heat Refined Seed Oil',
    riskLevel: 'High Heat Refined',
    reason: 'Extracted using petroleum hexanes and high heat, deodorized; prone to oxidation and contains elevated Omega-6.',
  },
  {
    pattern: 'rapeseed',
    name: 'Rapeseed Oil',
    category: 'High-Heat Refined Seed Oil',
    riskLevel: 'High Heat Refined',
    reason: 'High-heat industrial extraction produces oxidized lipid peroxides.',
  },
  {
    pattern: 'soybean',
    name: 'Soybean Oil',
    category: 'High Omega-6 Seed Oil',
    riskLevel: 'High Heat Refined',
    reason: 'Comprises >50% linoleic acid; highly susceptible to oxidation when heated and triggers systemic inflammation.',
  },
  {
    pattern: 'soy oil',
    name: 'Soybean Oil',
    category: 'High Omega-6 Seed Oil',
    riskLevel: 'High Heat Refined',
    reason: 'High Omega-6 to Omega-3 ratio promotes inflammatory cytokine cascades.',
  },
  {
    pattern: 'corn oil',
    name: 'Corn Oil',
    category: 'Refined Grain Oil',
    riskLevel: 'High Heat Refined',
    reason: 'Industrial grain solvent extraction with ~60% linoleic acid content.',
  },
  {
    pattern: 'cottonseed',
    name: 'Cottonseed Oil',
    category: 'Industrial Byproduct Oil',
    riskLevel: 'High Heat Refined',
    reason: 'Industrial crop oil requiring chemical bleaching and heavy deodorization.',
  },
  {
    pattern: 'sunflower',
    name: 'Sunflower Oil',
    category: 'High Linoleic Seed Oil',
    riskLevel: 'High Heat Refined',
    reason: 'High-linoleic variety degrades into toxic aldehydes (HNE) during frying.',
  },
  {
    pattern: 'safflower',
    name: 'Safflower Oil',
    category: 'High Linoleic Seed Oil',
    riskLevel: 'High Heat Refined',
    reason: 'Extremely elevated linoleic acid content (up to 75%) without protective antioxidants.',
  },
  {
    pattern: 'grapeseed',
    name: 'Grapeseed Oil',
    category: 'Refined Seed Oil',
    riskLevel: 'High Heat Refined',
    reason: 'Highest linoleic acid ratio (~70%); easily oxidizes at room temperature.',
  },
  {
    pattern: 'rice bran',
    name: 'Rice Bran Oil',
    category: 'Refined Cereal Oil',
    riskLevel: 'Moderate Refined',
    reason: 'High-temperature industrial processing diminishes native gamma-oryzanol.',
  },
  {
    pattern: 'palm oil',
    name: 'Palm Oil',
    category: 'Refined Tropical Fat',
    riskLevel: 'Moderate Refined',
    reason: 'Refined palm oil develops 3-MCPD esters during high-temperature deodorization.',
  },
  {
    pattern: 'palm kernel',
    name: 'Palm Kernel Oil',
    category: 'Refined Tropical Fat',
    riskLevel: 'Moderate Refined',
    reason: 'Highly processed saturated tropical fat fraction.',
  },
  {
    pattern: 'hydrogenated',
    name: 'Partially Hydrogenated Oil',
    category: 'Industrial Trans Fat',
    riskLevel: 'Hydrogenated Trans Fat',
    reason: 'Contains artificial trans fatty acids known to elevate LDL cholesterol and endothelial dysfunction.',
  },
  {
    pattern: 'vegetable oil',
    name: 'Generic Vegetable Oil',
    category: 'Blended Seed Oil',
    riskLevel: 'High Heat Refined',
    reason: 'Unspecified blend of cheap industrial seed oils (typically soy/canola).',
  },
];

const CLEAN_OIL_SWAPS: CleanOilSwap[] = [
  {
    name: 'Extra Virgin Olive Oil (EVOO)',
    benefits: 'Cold-pressed, high in anti-inflammatory oleic acid & polyphenol antioxidants.',
  },
  {
    name: 'Avocado Oil',
    benefits: 'Monounsaturated fat profile with high smoke point (520°F) safe for high-heat cooking.',
  },
  {
    name: 'Coconut Oil (Cold-Pressed)',
    benefits: 'Rich in medium-chain triglycerides (MCTs / Lauric acid) for rapid cellular energy.',
  },
  {
    name: 'Grass-Fed Butter / Ghee',
    benefits: 'Provides natural Vitamin K2, Conjugated Linoleic Acid (CLA), and Butyrate for gut health.',
  },
];

/**
 * Scans an ingredient list for industrial seed oils and inflammatory fats.
 *
 * @param ingredients Array of product ingredient strings
 * @returns SeedOilRadarResult with detected oils and clean swaps
 */
export function detectSeedOils(ingredients: string[]): SeedOilRadarResult {
  if (!ingredients || ingredients.length === 0) {
    return {
      hasSeedOils: false,
      detectedOils: [],
      cleanSwaps: [],
      overallRiskCategory: 'Seed Oil Free',
    };
  }

  const lowerIngredients = ingredients.map((i) => i.toLowerCase());
  const detectedOils: DetectedSeedOil[] = [];
  const seen = new Set<string>();

  for (const item of INDUSTRIAL_SEED_OILS) {
    if (seen.has(item.name)) continue;

    const isMatch = lowerIngredients.some((ing) => ing.includes(item.pattern));
    if (isMatch) {
      detectedOils.push({
        name: item.name,
        category: item.category,
        riskLevel: item.riskLevel,
        reason: item.reason,
      });
      seen.add(item.name);
    }
  }

  const hasSeedOils = detectedOils.length > 0;
  const hasHighRisk = detectedOils.some(
    (o) => o.riskLevel === 'High Heat Refined' || o.riskLevel === 'Hydrogenated Trans Fat'
  );

  const overallRiskCategory = !hasSeedOils
    ? 'Seed Oil Free'
    : hasHighRisk
    ? 'High Inflammatory Risk'
    : 'Moderate Inflammatory Risk';

  return {
    hasSeedOils,
    detectedOils,
    cleanSwaps: hasSeedOils ? CLEAN_OIL_SWAPS : [],
    overallRiskCategory,
  };
}
