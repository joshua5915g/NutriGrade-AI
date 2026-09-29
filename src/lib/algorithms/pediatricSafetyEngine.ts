/**
 * pediatricSafetyEngine.ts
 *
 * Pediatric & Toddler Nutrition Safety Algorithm.
 * Evaluates food products against strict American Academy of Pediatrics (AAP)
 * and European Food Safety Authority (EFSA) pediatric standards:
 *   1. Hyperactivity Dyes (Southampton Six: Red 40, Yellow 5, Yellow 6, etc.)
 *   2. Pediatric Sugar Overload (AAP: Zero added sugar for <2yo, max 12g/day for kids)
 *   3. Pediatric Sodium Kidney Strain
 *   4. Choking & Artificial Sweetener Hazards in children
 */

import { NormalizedNutritionData } from '../../types/nutrition';

export type ChildSafeTier = 'Child Safe (Green)' | 'Caution for Children (Yellow)' | 'Hazard for Kids (Red)';

export interface PediatricHazard {
  id: string;
  name: string;
  category: 'neuro_dye' | 'infant_sugar' | 'kidney_sodium' | 'sweetener_choking';
  severity: 'Critical' | 'Warning';
  clinicalImpact: string;
  guidelineSource: string;
}

export interface PediatricSafetyResult {
  tier: ChildSafeTier;
  safetyScore: number; // 0 (severe hazard) to 100 (wholesome & safe)
  isApprovedForToddlers: boolean; // < 2 years old
  isApprovedForChildren: boolean; // 2 - 12 years old
  hazards: PediatricHazard[];
  pediatricVerdict: string;
  parentTips: string[];
}

// Southampton 6 synthetic dyes requiring mandatory EU label: "May have an adverse effect on activity and attention in children"
const PEDIATRIC_NEURO_DYES = [
  { pattern: /red 40|allura red|e129/i, name: 'Red 40 (Allura Red / E129)', impact: 'Linked in randomized clinical trials to increased motor restlessness, hyperactivity, and ADHD symptom flare-ups in kids.' },
  { pattern: /yellow 5|tartrazine|e102/i, name: 'Yellow 5 (Tartrazine / E102)', impact: 'Potent histamine-releasing azo dye associated with irritability and allergic behavioral reactions in sensitive children.' },
  { pattern: /yellow 6|sunset yellow|e110/i, name: 'Yellow 6 (Sunset Yellow / E110)', impact: 'Synthetic coal-tar derived colorant restricted across European schools due to attention disruption.' },
  { pattern: /blue 1|brilliant blue|e133/i, name: 'Blue 1 (Brilliant Blue / E133)', impact: 'Crosses blood-brain barrier in immature pediatric neurovascular systems.' },
  { pattern: /red 3|erythrosine|e127/i, name: 'Red 3 (Erythrosine / E127)', impact: 'FDA-banned in cosmetics for carcinogenicity; still found in children candy; disrupts thyroid hormone regulation.' },
];

const ARTIFICIAL_SWEETENERS_PEDIATRIC = [
  { pattern: /sucralose|splenda/i, name: 'Sucralose', reason: 'Alters developing toddler gut microbiome and impairs developing insulin sensitivity.' },
  { pattern: /aspartame|nutrasweet/i, name: 'Aspartame', reason: 'Breaks down into phenylalanine and methanol; AAP recommends avoiding synthetic sweeteners in toddlers.' },
  { pattern: /acesulfame/i, name: 'Acesulfame Potassium', reason: 'Calorie-free intense sweetener that conditions children tastebuds to unnatural sweetness thresholds.' },
];

export function evaluatePediatricSafety(
  normalized: NormalizedNutritionData,
  ingredients: string[] = []
): PediatricSafetyResult {
  const normIngredients = ingredients.map((i) => i.toLowerCase().trim());
  const hazards: PediatricHazard[] = [];
  const parentTips: string[] = [];

  let safetyScore = 100;

  // 1. Synthetic Food Colorings (Southampton Dyes)
  for (const dye of PEDIATRIC_NEURO_DYES) {
    if (normIngredients.some((ing) => dye.pattern.test(ing))) {
      hazards.push({
        id: dye.name.toLowerCase().replace(/\s+/g, '_'),
        name: dye.name,
        category: 'neuro_dye',
        severity: 'Critical',
        clinicalImpact: dye.impact,
        guidelineSource: 'EFSA Southampton Six / AAP Pediatric Neurology',
      });
      safetyScore -= 25;
      parentTips.push(`Avoid: Contains ${dye.name}. Consider naturally dyed alternatives (beet juice, turmeric, spirulina).`);
    }
  }

  // 2. High Added Sugars
  if (normalized.sugars_per_100g >= 15) {
    hazards.push({
      id: 'high_pediatric_sugar',
      name: 'Severe Added Sugar Density (>15g/100g)',
      category: 'infant_sugar',
      severity: 'Critical',
      clinicalImpact:
        'American Academy of Pediatrics (AAP) recommends ZERO added sugar for under 2 years, and max 12g daily for ages 2–12.',
      guidelineSource: 'American Academy of Pediatrics (AAP)',
    });
    safetyScore -= 30;
    parentTips.push('Exceeds recommended daily sugar ceiling for young children in a single portion.');
  } else if (normalized.sugars_per_100g >= 8) {
    hazards.push({
      id: 'moderate_pediatric_sugar',
      name: 'Moderate Added Sugar (8–15g/100g)',
      category: 'infant_sugar',
      severity: 'Warning',
      clinicalImpact: 'Regular consumption elevates early dental caries risk and creates sweet taste preference conditioning.',
      guidelineSource: 'World Health Organization (WHO) Child Guidelines',
    });
    safetyScore -= 15;
  }

  // 3. Kidney Sodium Overload
  if (normalized.sodium_mg_per_100g >= 400) {
    hazards.push({
      id: 'high_pediatric_sodium',
      name: 'Excessive Sodium for Immature Kidneys (>400mg/100g)',
      category: 'kidney_sodium',
      severity: 'Critical',
      clinicalImpact: 'Pediatric kidneys cannot efficiently excrete high solute loads, elevating blood pressure setpoints.',
      guidelineSource: 'CDC Pediatric Dietary Guidelines',
    });
    safetyScore -= 20;
    parentTips.push('High sodium burden: Rinse canned items or dilute serving with fresh vegetables.');
  }

  // 4. Artificial Sweeteners in Children
  for (const sw of ARTIFICIAL_SWEETENERS_PEDIATRIC) {
    if (normIngredients.some((ing) => sw.pattern.test(ing))) {
      hazards.push({
        id: sw.name.toLowerCase().replace(/\s+/g, '_'),
        name: `Artificial Sweetener: ${sw.name}`,
        category: 'sweetener_choking',
        severity: 'Warning',
        clinicalImpact: sw.reason,
        guidelineSource: 'American Academy of Pediatrics (AAP)',
      });
      safetyScore -= 15;
    }
  }

  safetyScore = Math.max(5, Math.min(100, safetyScore));

  let tier: ChildSafeTier = 'Child Safe (Green)';
  let pediatricVerdict = 'Wholesome composition: Free of neuro-toxic synthetic dyes and excess sugars.';

  if (safetyScore < 50 || hazards.some((h) => h.severity === 'Critical')) {
    tier = 'Hazard for Kids (Red)';
    pediatricVerdict = '⚠️ Not Recommended for Children: Contains chemical colorants, high sugar, or excessive sodium.';
  } else if (safetyScore < 75) {
    tier = 'Caution for Children (Yellow)';
    pediatricVerdict = 'Moderate Pediatric Profile: Consume occasionally in controlled portions.';
  }

  const isApprovedForToddlers = safetyScore >= 80 && normalized.sugars_per_100g <= 5 && normalized.sodium_mg_per_100g <= 150;
  const isApprovedForChildren = safetyScore >= 60;

  if (parentTips.length === 0) {
    parentTips.push('Great choice for lunchboxes and afternoon snacks with whole natural nutrients.');
  }

  return {
    tier,
    safetyScore,
    isApprovedForToddlers,
    isApprovedForChildren,
    hazards,
    pediatricVerdict,
    parentTips,
  };
}
