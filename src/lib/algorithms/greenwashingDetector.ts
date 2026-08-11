import { RawNutritionData } from '../../types/nutrition';
import { normalizeTo100g } from '../utils/normalization';
import { detectNovaGroup } from './novaScale';

export interface GreenwashingClaim {
  /** The front-of-package claim detected */
  claim: string;
  
  /** Indicates whether the front claim is misleading when compared against back facts */
  isMisleading: boolean;
  
  /** Detailed regulatory explanation of why the claim is valid or misleading */
  explanation: string;
  
  /** Severity rating of the deceptive claim */
  severity: 'info' | 'warning' | 'high';
}

export interface GreenwashingResult {
  /** True if at least one misleading claim was detected */
  hasMisleadingClaims: boolean;
  
  /** Complete list of analyzed marketing claims */
  claims: GreenwashingClaim[];
}

/**
 * Detects misleading front-of-package marketing claims by cross-referencing
 * front packaging text with extracted back-of-package nutrition facts and ingredients.
 *
 * @param frontText - Text extracted from the front of the packaging
 * @param backNutrition - RawNutritionData extracted from the back nutrition panel
 * @param ingredients - List of ingredients extracted from the back panel
 * @returns GreenwashingResult containing detected claims and misleading flags
 */
export function detectGreenwashing(
  frontText: string,
  backNutrition: RawNutritionData,
  ingredients: string[] = []
): GreenwashingResult {
  const claims: GreenwashingClaim[] = [];
  const lowerFrontText = frontText.toLowerCase();

  // Normalize nutrition data to 100g standard for regulatory comparison
  const normalized = normalizeTo100g(backNutrition);
  const novaGroup = detectNovaGroup(ingredients);

  // 1. Check Sugar Claims
  if (lowerFrontText.includes('low sugar') || lowerFrontText.includes('reduced sugar')) {
    const isMisleading = normalized.sugars_per_100g > 5.0;
    claims.push({
      claim: 'Low / Reduced Sugar',
      isMisleading,
      severity: isMisleading ? 'high' : 'info',
      explanation: isMisleading
        ? `Front claim "Low Sugar" is misleading. The product contains ${normalized.sugars_per_100g}g of sugar per 100g, exceeding the legal regulatory limit of 5g/100g for low-sugar claims.`
        : `Front claim "Low Sugar" is valid. Sugar content is ${normalized.sugars_per_100g}g per 100g (<= 5g/100g).`,
    });
  }

  if (lowerFrontText.includes('no added sugar') || lowerFrontText.includes('no added sugars')) {
    const isMisleading = normalized.added_sugars_per_100g > 0;
    claims.push({
      claim: 'No Added Sugar',
      isMisleading,
      severity: isMisleading ? 'high' : 'info',
      explanation: isMisleading
        ? `Front claim "No Added Sugar" is misleading. The nutrition panel declares ${normalized.added_sugars_per_100g}g of added sugars per 100g.`
        : `Front claim "No Added Sugar" is valid. No added sugars were declared.`,
    });
  }

  if (lowerFrontText.includes('sugar free') || lowerFrontText.includes('zero sugar')) {
    const isMisleading = normalized.sugars_per_100g > 0.5;
    claims.push({
      claim: 'Sugar Free / Zero Sugar',
      isMisleading,
      severity: isMisleading ? 'high' : 'info',
      explanation: isMisleading
        ? `Front claim "Sugar Free" is misleading. Product contains ${normalized.sugars_per_100g}g of sugar per 100g (legal threshold is <= 0.5g/100g).`
        : `Front claim "Sugar Free" is valid.`,
    });
  }

  // 2. Check Protein Claims
  if (
    lowerFrontText.includes('high protein') ||
    lowerFrontText.includes('protein rich') ||
    lowerFrontText.includes('source of protein') ||
    lowerFrontText.includes('packed with protein')
  ) {
    const proteinKcal = normalized.protein_per_100g * 4;
    const totalKcal = normalized.calories_per_100g;
    const proteinEnergyPct = totalKcal > 0 ? (proteinKcal / totalKcal) * 100 : 0;

    // Minimum 12% of total energy required for "source of protein" claim
    const isMisleading = proteinEnergyPct < 12;

    claims.push({
      claim: 'High Protein / Source of Protein',
      isMisleading,
      severity: isMisleading ? 'warning' : 'info',
      explanation: isMisleading
        ? `Front claim regarding protein is misleading. Protein provides only ${proteinEnergyPct.toFixed(
            1
          )}% of total caloric energy, which falls below the 12% legal minimum threshold for protein claims.`
        : `Front protein claim is valid. Protein provides ${proteinEnergyPct.toFixed(1)}% of total caloric energy.`,
    });
  }

  // 3. Check Fat Claims
  if (lowerFrontText.includes('low fat') || lowerFrontText.includes('light fat')) {
    const isMisleading = normalized.total_fat_per_100g > 3.0;
    claims.push({
      claim: 'Low Fat',
      isMisleading,
      severity: isMisleading ? 'high' : 'info',
      explanation: isMisleading
        ? `Front claim "Low Fat" is misleading. Product contains ${normalized.total_fat_per_100g}g of total fat per 100g, exceeding the legal limit of 3g/100g.`
        : `Front claim "Low Fat" is valid. Total fat is ${normalized.total_fat_per_100g}g per 100g (<= 3g/100g).`,
    });
  }

  if (lowerFrontText.includes('fat free') || lowerFrontText.includes('zero fat')) {
    const isMisleading = normalized.total_fat_per_100g > 0.5;
    claims.push({
      claim: 'Fat Free / Zero Fat',
      isMisleading,
      severity: isMisleading ? 'high' : 'info',
      explanation: isMisleading
        ? `Front claim "Fat Free" is misleading. Product contains ${normalized.total_fat_per_100g}g of total fat per 100g.`
        : `Front claim "Fat Free" is valid.`,
    });
  }

  // 4. Check "Natural" Claims
  if (
    lowerFrontText.includes('all natural') ||
    lowerFrontText.includes('100% natural') ||
    lowerFrontText.includes('natural ingredients') ||
    lowerFrontText.includes('natural')
  ) {
    const isMisleading = novaGroup === 4;
    claims.push({
      claim: 'All Natural / Natural Ingredients',
      isMisleading,
      severity: isMisleading ? 'high' : 'info',
      explanation: isMisleading
        ? `Front claim "Natural" is misleading. The product is categorized as Ultra-Processed (NOVA Group 4) and contains industrial additives/markers.`
        : `Front claim "Natural" is consistent with ingredients profile.`,
    });
  }

  // 5. Check Low Sodium / Low Salt Claims
  if (lowerFrontText.includes('low sodium') || lowerFrontText.includes('low salt')) {
    const isMisleading = normalized.sodium_mg_per_100g > 120;
    claims.push({
      claim: 'Low Sodium / Low Salt',
      isMisleading,
      severity: isMisleading ? 'high' : 'info',
      explanation: isMisleading
        ? `Front claim "Low Sodium" is misleading. Product contains ${normalized.sodium_mg_per_100g}mg of sodium per 100g, exceeding the regulatory limit of 120mg/100g.`
        : `Front claim "Low Sodium" is valid.`,
    });
  }

  const hasMisleadingClaims = claims.some((c) => c.isMisleading);

  return {
    hasMisleadingClaims,
    claims,
  };
}
