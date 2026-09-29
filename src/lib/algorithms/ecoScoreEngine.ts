/**
 * ecoScoreEngine.ts
 *
 * Planetary Health & Environmental Impact Algorithm.
 * Estimates lifecycle environmental impact based on Agribalyse & Open Food Facts Eco-Score methodologies:
 *   1. Agricultural greenhouse gas emissions (CO₂ eq per kg)
 *   2. Deforestation & biodiversity threat (uncertified palm oil, beef, soy)
 *   3. Freshwater demand (water footprint)
 *   4. Packaging sustainability & recyclability
 */

export type EcoGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export interface EcoScoreResult {
  grade: EcoGrade;
  score: number; // 0 (worst) to 100 (best)
  co2PerKg: number; // kg CO₂ eq per kg product
  co2PerServing: number; // kg CO₂ eq per serving
  carbonRating: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Severe';
  waterFootprint: 'Minimal' | 'Moderate' | 'Intense';
  deforestationRisk: {
    detected: boolean;
    reason?: string;
    threatIngredient?: string;
  };
  packagingAssessment: {
    material: string;
    recyclable: boolean;
    ecoPenalty: number;
    tip: string;
  };
  ecoBonuses: string[];
  ecoPenalties: string[];
  summary: string;
}

// LCA Carbon Factors (approx kg CO₂ eq per kg of food ingredient)
const INGREDIENT_LCA_FACTORS: Array<{
  pattern: RegExp;
  category: string;
  co2Factor: number; // kg CO2 eq / kg
  waterLevel: 'Minimal' | 'Moderate' | 'Intense';
  deforestation?: boolean;
}> = [
  { pattern: /beef|veal|bovine/i, category: 'Beef / Bovine', co2Factor: 32.0, waterLevel: 'Intense', deforestation: true },
  { pattern: /lamb|mutton/i, category: 'Lamb', co2Factor: 24.0, waterLevel: 'Intense' },
  { pattern: /cheese|butter|dairy fat/i, category: 'Dairy Fat', co2Factor: 12.0, waterLevel: 'Intense' },
  { pattern: /pork|bacon|ham|swine/i, category: 'Pork', co2Factor: 7.2, waterLevel: 'Moderate' },
  { pattern: /chicken|poultry|turkey/i, category: 'Poultry', co2Factor: 5.5, waterLevel: 'Moderate' },
  { pattern: /fish|salmon|tuna|cod/i, category: 'Fish', co2Factor: 5.0, waterLevel: 'Minimal' },
  { pattern: /palm oil|palmate|palm fat/i, category: 'Palm Oil', co2Factor: 4.8, waterLevel: 'Moderate', deforestation: true },
  { pattern: /egg|albumen/i, category: 'Eggs', co2Factor: 4.2, waterLevel: 'Moderate' },
  { pattern: /milk|yogurt|whey|cream/i, category: 'Milk / Yogurt', co2Factor: 3.2, waterLevel: 'Moderate' },
  { pattern: /rice/i, category: 'Rice', co2Factor: 2.7, waterLevel: 'Intense' },
  { pattern: /soy|soybean/i, category: 'Soy', co2Factor: 2.0, waterLevel: 'Moderate', deforestation: true },
  { pattern: /wheat|flour|bread|pasta/i, category: 'Wheat & Grain', co2Factor: 1.4, waterLevel: 'Minimal' },
  { pattern: /almond|cashew|pistachio/i, category: 'Nuts', co2Factor: 1.8, waterLevel: 'Intense' },
  { pattern: /oat|oats|rolled oats/i, category: 'Oats', co2Factor: 0.8, waterLevel: 'Minimal' },
  { pattern: /lentil|chickpea|bean|pulse/i, category: 'Legumes & Pulses', co2Factor: 0.9, waterLevel: 'Minimal' },
  { pattern: /apple|strawberry|banana|fruit|berry/i, category: 'Fruit', co2Factor: 0.7, waterLevel: 'Minimal' },
  { pattern: /carrot|spinach|tomato|potato|vegetable/i, category: 'Vegetable', co2Factor: 0.5, waterLevel: 'Minimal' },
];

export function calculateEcoScore(
  ingredients: string[] = [],
  servingSizeG: number = 100,
  packagingHint: string = ''
): EcoScoreResult {
  const normIngredients = ingredients.map((i) => i.toLowerCase().trim());
  const combinedText = normIngredients.join(' ') + ' ' + packagingHint.toLowerCase();

  let maxCo2 = 1.0;
  let worstWater: 'Minimal' | 'Moderate' | 'Intense' = 'Minimal';
  let deforestationDetected = false;
  let deforestationReason = '';
  let deforestationIngredient = '';

  const ecoBonuses: string[] = [];
  const ecoPenalties: string[] = [];

  // 1. Carbon & Deforestation Matching
  for (const factor of INGREDIENT_LCA_FACTORS) {
    const matched = normIngredients.some((ing) => factor.pattern.test(ing));
    if (matched) {
      if (factor.co2Factor > maxCo2) {
        maxCo2 = factor.co2Factor;
      }
      if (factor.waterLevel === 'Intense') {
        worstWater = 'Intense';
      } else if (factor.waterLevel === 'Moderate' && worstWater === 'Minimal') {
        worstWater = 'Moderate';
      }
      if (factor.deforestation && !deforestationDetected) {
        deforestationDetected = true;
        deforestationIngredient = factor.category;
        deforestationReason = `Contains ${factor.category}, historically linked to monoculture deforestation and habitat loss.`;
      }
    }
  }

  // Calculate base score out of 100 (inverse of CO2 impact)
  // 0.5 kg CO2/kg -> ~95 pts
  // 3.0 kg CO2/kg -> ~70 pts
  // 15.0 kg CO2/kg -> ~35 pts
  // 30.0+ kg CO2/kg -> ~10 pts
  let baseScore = Math.max(10, Math.min(100, Math.round(100 - maxCo2 * 2.6)));

  // Deforestation Penalty
  if (deforestationDetected) {
    baseScore = Math.max(10, baseScore - 15);
    ecoPenalties.push(`Deforestation footprint: ${deforestationReason}`);
  }

  // Water Penalty
  if (worstWater === 'Intense') {
    baseScore = Math.max(10, baseScore - 8);
    ecoPenalties.push('Intensive freshwater irrigation required during crop lifecycle');
  }

  // Plant-based Bonus
  const isPlantBased = !normIngredients.some((i) =>
    /beef|veal|pork|bacon|ham|chicken|poultry|fish|milk|dairy|cheese|butter|egg|gelatin/i.test(i)
  );
  if (isPlantBased && ingredients.length > 0) {
    baseScore = Math.min(100, baseScore + 10);
    ecoBonuses.push('100% Plant-Based Formulation: Low agricultural trophic loss');
  }

  // Organic bonus
  const isOrganic = normIngredients.some((i) => /organic|bio|ecocert/i.test(i));
  if (isOrganic) {
    baseScore = Math.min(100, baseScore + 8);
    ecoBonuses.push('Certified Organic: Synthetic chemical pesticide & fertilizer free');
  }

  // Packaging Assessment
  let packagingMaterial = 'Standard Packaging';
  let recyclable = true;
  let packagingPenalty = 0;
  let packagingTip = 'Recycle in standard household blue bin if rinsed.';

  if (/pouch|foil|laminate|multi-layer/i.test(combinedText)) {
    packagingMaterial = 'Multi-layer Metallized Pouch';
    recyclable = false;
    packagingPenalty = 10;
    packagingTip = 'Non-recyclable composite film. Must be sent to specialized drop-off or general waste.';
    ecoPenalties.push('Difficult-to-recycle multi-material pouch');
  } else if (/glass/i.test(combinedText)) {
    packagingMaterial = 'Glass Bottle / Jar';
    recyclable = true;
    packagingPenalty = 2; // heavier transport weight
    packagingTip = '100% infinitely recyclable. Place in curbside glass recycling.';
    ecoBonuses.push('Infinitely recyclable glass packaging');
  } else if (/cardboard|paperboard|paper box/i.test(combinedText)) {
    packagingMaterial = 'FSC Recycled Cardboard';
    recyclable = true;
    packagingPenalty = 0;
    packagingTip = 'Biodegradable & easily recyclable paper stream.';
    ecoBonuses.push('Renewable pulp cardboard packaging');
  } else if (/plastic/i.test(combinedText)) {
    packagingMaterial = 'PET/HDPE Rigid Plastic';
    recyclable = true;
    packagingPenalty = 5;
    packagingTip = 'Widely recyclable curbside plastic. Rinse and re-cap.';
  }

  baseScore = Math.max(5, baseScore - packagingPenalty);

  // Grade mapping (A-E)
  let grade: EcoGrade = 'E';
  if (baseScore >= 80) grade = 'A';
  else if (baseScore >= 65) grade = 'B';
  else if (baseScore >= 50) grade = 'C';
  else if (baseScore >= 35) grade = 'D';

  let carbonRating: EcoScoreResult['carbonRating'] = 'Moderate';
  if (maxCo2 <= 1.2) carbonRating = 'Very Low';
  else if (maxCo2 <= 3.5) carbonRating = 'Low';
  else if (maxCo2 <= 8.0) carbonRating = 'Moderate';
  else if (maxCo2 <= 18.0) carbonRating = 'High';
  else carbonRating = 'Severe';

  const co2PerServing = Number(((maxCo2 * (servingSizeG || 100)) / 1000).toFixed(2));

  let summary = `Eco-Score Grade ${grade} (${baseScore}/100). Emits ~${maxCo2.toFixed(
    1
  )} kg CO₂ eq per kg.`;
  if (grade === 'A' || grade === 'B') {
    summary += ' Excellent planetary profile with low carbon and water footprints.';
  } else {
    summary += ' Elevated environmental impact. Consider lower-trophic or plant-swapped alternatives.';
  }

  return {
    grade,
    score: baseScore,
    co2PerKg: Number(maxCo2.toFixed(1)),
    co2PerServing,
    carbonRating,
    waterFootprint: worstWater,
    deforestationRisk: {
      detected: deforestationDetected,
      reason: deforestationReason,
      threatIngredient: deforestationIngredient,
    },
    packagingAssessment: {
      material: packagingMaterial,
      recyclable,
      ecoPenalty: packagingPenalty,
      tip: packagingTip,
    },
    ecoBonuses,
    ecoPenalties,
    summary,
  };
}
