import { AnalysisResult } from '../../types/nutrition';
import { UserProfile, PersonalizedAlert, PersonalizedAnalysis } from '../../types/user';
import { auditDietaryPreferences } from './dietaryAudit';

// List of gluten-containing ingredients and keywords
const GLUTEN_KEYWORDS = [
  'wheat',
  'barley',
  'rye',
  'gluten',
  'spelt',
  'kamut',
  'malt',
  'semolina',
  'farina',
  'triticale',
];

/**
 * Applies a personalized medical and nutritional overlay on top of standard AnalysisResult.
 * Evaluates diabetic sugar limits, hypertension sodium limits, celiac gluten, and Yuka-style dietary preferences.
 *
 * @param analysis - Consolidated food analysis output (Normalized nutrition, Nutri-Score, NOVA)
 * @param profile - User profile containing medical flags, dietary preferences, and daily goals
 * @param ingredients - Optional list of ingredients for allergen & preference detection
 * @returns PersonalizedAnalysis with user-specific health alerts and a boolean suitability flag
 */
export function applyPersonalOverlay(
  analysis: AnalysisResult,
  profile: UserProfile,
  ingredients: string[] = []
): PersonalizedAnalysis {
  const alerts: PersonalizedAlert[] = [];
  const { normalizedData, healthWarnings } = analysis;
  const { medicalFlags } = profile;

  // 1. Check Diabetes Alert: Sugar > 10g per 100g
  if (medicalFlags.isDiabetic && normalizedData.sugars_per_100g > 10) {
    alerts.push({
      severity: 'high',
      type: 'diabetes',
      message: `High Severity Diabetes Alert: Product contains ${normalizedData.sugars_per_100g}g of sugar per 100g, exceeding the 10g/100g diabetic safety threshold.`,
    });
  }

  // 2. Check Hypertension / Low Sodium Alert: Sodium > 400mg per 100g
  if (
    (medicalFlags.hasHypertension || medicalFlags.lowSodiumDiet) &&
    normalizedData.sodium_mg_per_100g > 400
  ) {
    alerts.push({
      severity: 'high',
      type: 'hypertension',
      message: `High Sodium Alert: Product contains ${normalizedData.sodium_mg_per_100g}mg of sodium per 100g, exceeding the 400mg/100g safety threshold for hypertension/low-sodium diets.`,
    });
  }

  // 3. Check Celiac Gluten Alert: Search ingredient list and health warnings
  if (medicalFlags.isCeliac) {
    const glutenMatches: string[] = [];

    // Search provided ingredients array
    ingredients.forEach((ing) => {
      const lowerIng = ing.toLowerCase();
      GLUTEN_KEYWORDS.forEach((keyword) => {
        if (lowerIng.includes(keyword) && !glutenMatches.includes(keyword)) {
          glutenMatches.push(keyword);
        }
      });
    });

    // Search health warnings array if ingredients array did not catch it
    if (glutenMatches.length === 0) {
      healthWarnings.forEach((warning) => {
        const lowerWarning = warning.toLowerCase();
        GLUTEN_KEYWORDS.forEach((keyword) => {
          if (lowerWarning.includes(keyword) && !glutenMatches.includes(keyword)) {
            glutenMatches.push(keyword);
          }
        });
      });
    }

    if (glutenMatches.length > 0) {
      alerts.push({
        severity: 'critical',
        type: 'celiac',
        message: `Critical Gluten Alert: Contains gluten-related markers (${glutenMatches.join(
          ', '
        )}), which poses severe health risks for Celiac disease.`,
      });
    }
  }

  // 4. Check Yuka-Style Dietary Preferences Audit
  const additiveIdentifiers = (analysis.additives || []).flatMap((a) => [
    a.eNumber,
    a.commonName,
  ]);
  const dietaryAuditAlerts = auditDietaryPreferences(ingredients, additiveIdentifiers, profile);

  dietaryAuditAlerts.forEach((dAlert) => {
    alerts.push({
      severity: dAlert.severity === 'BLOCKED' ? 'critical' : 'high',
      type: 'dietary',
      message: `${dAlert.diet} Preference Violation: ${dAlert.reason}`,
    });
  });

  // Determine overall suitability (unsuitable if any high or critical alerts exist)
  const isSuitable = !alerts.some(
    (alert) => alert.severity === 'high' || alert.severity === 'critical'
  );

  return {
    ...analysis,
    personalizedAlerts: alerts,
    isSuitable,
  };
}

