/**
 * upfAddictionRadar.ts
 *
 * Ultra-Processed Food (UPF) Addiction & Craving Trigger Index.
 * Based on the Yale Food Addiction Scale (YFAS 2.0) and peer-reviewed
 * nutritional neuroscience heuristics regarding hyper-palatable food matrices (HPF).
 */

import { NormalizedNutritionData } from '../../types/nutrition';

export type AddictionRiskLevel =
  | 'Low / Natural Satiety'
  | 'Moderate Reward Potential'
  | 'High Craving Risk'
  | 'Severe Hyper-Palatable Formulation';

export interface CravingTrigger {
  id: string;
  name: string;
  category: 'fat_carb_matrix' | 'dopaminergic_sodium' | 'flavor_amplifier' | 'texture_bypass';
  severity: 'high' | 'moderate';
  mechanism: string;
}

export interface UpfAddictionResult {
  riskLevel: AddictionRiskLevel;
  cravingScore: number; // 0 - 100
  triggersDetected: CravingTrigger[];
  satietyForecast: string; // e.g. "Rapid hunger rebound within 45–60 mins"
  neuroClinicalNote: string;
  isHyperPalatable: boolean;
}

const FLAVOR_AMPLIFIERS = [
  { pattern: /monosodium glutamate|msg/i, name: 'Monosodium Glutamate (MSG)', mechanism: 'Stimulates umami oral-brain glutamate pathways, dramatically boosting hedonic consumption volume.' },
  { pattern: /yeast extract|autolyzed yeast/i, name: 'Autolyzed Yeast Extract', mechanism: 'Concentrated free glutamic acid that triggers salivary hyper-secretion and dopamine release.' },
  { pattern: /disodium inosinate|disodium guanylate/i, name: 'Ribonucleotide Nucleotide Synergist', mechanism: 'Synergistically multiplies umami receptor sensitivity up to 8-fold.' },
  { pattern: /high fructose corn syrup|hfcs/i, name: 'High-Fructose Corn Syrup', mechanism: 'Bypasses hepatic fructokinase feedback inhibition, failing to stimulate leptin (satiety hormone).' },
  { pattern: /maltodextrin/i, name: 'High-GI Maltodextrin', mechanism: 'Extremely high glycemic index (GI ~110) causes rapid dopamine spikes followed by steep reactive hypoglycemia.' },
  { pattern: /sucralose|aspartame|acesulfame|saccharin/i, name: 'Synthetic High-Intensity Sweetener', mechanism: 'Dissociates sweet taste sensation from caloric density, disrupting homeostatic satiety regulation.' },
];

export function calculateUpfAddictionRisk(
  normalized: NormalizedNutritionData,
  ingredients: string[] = []
): UpfAddictionResult {
  const normIngredients = ingredients.map((i) => i.toLowerCase().trim());
  const triggersDetected: CravingTrigger[] = [];

  let score = 15; // baseline natural food score

  // 1. Fat + Simple Carbohydrate Hyper-Palatable Matrix (The Golden Ratio of Compulsive Eating)
  // HPF Definition: >25% kcal from fat AND >8% kcal from sugar/carbs
  const fatCalories = normalized.total_fat_per_100g * 9;
  const sugarCalories = normalized.sugars_per_100g * 4;
  const totalCalories = Math.max(1, normalized.calories_per_100g);

  const fatPctKcal = (fatCalories / totalCalories) * 100;
  const sugarPctKcal = (sugarCalories / totalCalories) * 100;

  if (fatPctKcal >= 25 && sugarPctKcal >= 20) {
    triggersDetected.push({
      id: 'fat_sugar_matrix',
      name: 'Engineered Fat + Sugar Synergy Matrix',
      category: 'fat_carb_matrix',
      severity: 'high',
      mechanism:
        'Co-occurring high concentrations of refined sugar and dietary fats rarely exist in nature. Triggers supra-normal striatal dopamine surges similar to addictive substances.',
    });
    score += 35;
  } else if (fatPctKcal >= 25 && normalized.sodium_mg_per_100g >= 400) {
    triggersDetected.push({
      id: 'fat_sodium_matrix',
      name: 'High Fat + Sodium Sensory Accelerator',
      category: 'dopaminergic_sodium',
      severity: 'high',
      mechanism:
        'Combines dense lipid mouthfeel with high sodium, suppressing oral sensory satiety and encouraging continuous grazing.',
    });
    score += 25;
  }

  // 2. High Glycemic Free Sugar Density
  if (normalized.sugars_per_100g >= 22) {
    score += 20;
  } else if (normalized.sugars_per_100g >= 12) {
    score += 10;
  }

  // 3. Low Fiber / Vanishing Caloric Density
  if (normalized.fiber_per_100g <= 1.0 && normalized.calories_per_100g >= 250) {
    triggersDetected.push({
      id: 'low_fiber_density',
      name: 'Minimal Fiber Barrier (Vanishing Satiety)',
      category: 'texture_bypass',
      severity: 'moderate',
      mechanism:
        'Absence of intact dietary fiber allows rapid gastric emptying and instantaneous nutrient absorption into the portal vein.',
    });
    score += 15;
  }

  // 4. Flavor Enhancers & Dopamine Accelerators
  for (const amp of FLAVOR_AMPLIFIERS) {
    if (normIngredients.some((ing) => amp.pattern.test(ing))) {
      triggersDetected.push({
        id: amp.name.toLowerCase().replace(/\s+/g, '_'),
        name: amp.name,
        category: 'flavor_amplifier',
        severity: 'high',
        mechanism: amp.mechanism,
      });
      score += 15;
    }
  }

  // Cap score 0 - 100
  const cravingScore = Math.min(100, Math.max(5, score));

  let riskLevel: AddictionRiskLevel = 'Low / Natural Satiety';
  let satietyForecast = 'Sustained Satiety: Slow gastric breakdown with balanced ~3–4 hr fullness.';
  let neuroClinicalNote =
    'Natural food composition promotes normal leptin and cholecystokinin (CCK) gut peptide signaling.';

  if (cravingScore >= 75) {
    riskLevel = 'Severe Hyper-Palatable Formulation';
    satietyForecast = 'Rapid Hunger Rebound: Post-prandial craving surge within ~35–50 minutes.';
    neuroClinicalNote =
      'Engineered industrial matrix intentionally activates reward neurocircuitry over metabolic satiety. High likelihood of exceeding intended portion sizes.';
  } else if (cravingScore >= 55) {
    riskLevel = 'High Craving Risk';
    satietyForecast = 'Quick Gastric Clearance: Mild glucose rebound dip within ~60–80 minutes.';
    neuroClinicalNote =
      'Contains sensory enhancers and refined macronutrients that weaken intuitive appetite cessation cues.';
  } else if (cravingScore >= 35) {
    riskLevel = 'Moderate Reward Potential';
    satietyForecast = 'Moderate Satiety: Anticipate steady appetite regulation for ~2 hours.';
    neuroClinicalNote =
      'Contains moderate refined carbohydrates or fats; pair with whole dietary fiber or protein for optimal satiety.';
  }

  const isHyperPalatable = cravingScore >= 55;

  return {
    riskLevel,
    cravingScore,
    triggersDetected,
    satietyForecast,
    neuroClinicalNote,
    isHyperPalatable,
  };
}
