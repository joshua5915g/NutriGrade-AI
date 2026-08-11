/**
 * RawNutritionData represents the raw nutritional values extracted directly
 * from product packaging via OCR/parsing. These values are not normalized
 * and represent the package context (either per serving or per 100g/100ml).
 */
export interface RawNutritionData {
  /** Energy/Caloric value of the food item */
  calories: number;
  
  /** Total fat content in grams */
  total_fat: number;
  
  /** Saturated fat content in grams */
  saturated_fat: number;
  
  /** Trans fat content in grams */
  trans_fat: number;
  
  /** Total sugar content in grams */
  sugars: number;
  
  /** Added sugars content in grams (where declared) */
  added_sugars: number;
  
  /** Sodium content in milligrams */
  sodium_mg: number;
  
  /** Dietary fiber content in grams */
  fiber: number;
  
  /** Protein content in grams */
  protein: number;
  
  /** The reference serving size in grams (or ml) */
  serving_size_g: number;
  
  /** 
   * Indicates if the raw parsed values are already normalized per 100g/100ml.
   * If false, the values correspond to the serving size.
   */
  is_per_100g: boolean;
}

/**
 * NormalizedNutritionData represents the nutrition data strictly scaled
 * to a 100g or 100ml reference standard. This normalization allows for
 * consistent comparisons and algorithmic calculations (e.g. Nutri-Score).
 */
export interface NormalizedNutritionData {
  calories_per_100g: number;
  total_fat_per_100g: number;
  saturated_fat_per_100g: number;
  trans_fat_per_100g: number;
  sugars_per_100g: number;
  added_sugars_per_100g: number;
  sodium_mg_per_100g: number;
  fiber_per_100g: number;
  protein_per_100g: number;
}

/**
 * NutriScoreGrade represents the Nutri-Score letter grade
 * from A (healthiest choice) to E (least healthy choice).
 */
export type NutriScoreGrade = 'A' | 'B' | 'C' | 'D' | 'E';

/**
 * NutriScoreBreakdown details the exact point calculation
 * that determines the final Nutri-Score and NutriScoreGrade.
 */
export interface NutriScoreBreakdown {
  /** The final aggregated score (typically ranging from -15 to +40) */
  score: number;
  
  /** The corresponding grade letter */
  grade: NutriScoreGrade;
  
  /** Points awarded for "negative" nutrients (higher values increase score, which is worse) */
  negativePoints: {
    energy: number;       // Points for energy density
    sugars: number;       // Points for sugars
    saturated_fat: number;// Points for saturated fats
    sodium: number;       // Points for sodium content
  };
  
  /** Points awarded for "positive" nutrients (higher values decrease score, which is better) */
  positivePoints: {
    fiber: number;         // Points for dietary fiber
    protein: number;       // Points for protein
    fruit_veg_pct: number; // Points for percentage of fruits, vegetables, pulses, and nuts
  };
}

/**
 * NovaGroup represents the NOVA food classification system:
 * 1: Unprocessed or minimally processed foods
 * 2: Processed culinary ingredients
 * 3: Processed foods
 * 4: Ultra-processed food products
 */
export type NovaGroup = 1 | 2 | 3 | 4;

/**
 * Additive represents a food additive identified in the product ingredients.
 */
export interface Additive {
  /** The European union identification number (e.g., 'E330', 'E621') */
  eNumber: string;
  
  /** The common public/scientific name (e.g., 'Citric Acid', 'Monosodium Glutamate') */
  commonName: string;
  
  /** Evaluated risk level of the additive based on toxicological/clinical studies */
  riskLevel: 'low' | 'moderate' | 'high';
  
  /** Detailed description of the additive, its function, and reasons for its risk rating */
  description: string;
}

/**
 * GutDisruptor describes a single ingredient that has been identified as a
 * potential disruptor of the gut microbiome, including its risk level and
 * the physiological mechanism of harm.
 */
export interface GutDisruptor {
  /** The exact ingredient or additive name as identified in the product */
  name: string;

  /** Risk level of the disruptor (e.g., 'High', 'Moderate') */
  risk: string;

  /** Clinical or mechanistic description of its effect on gut microbiota */
  effect: string;
}

/**
 * HiddenSugar represents a detected sugar alias found in the ingredient list.
 * Many industrial sugar forms appear under scientific or marketing names
 * that consumers do not recognize as sugar.
 */
export interface HiddenSugar {
  /** The alias or scientific name as found in the ingredient list */
  alias: string;

  /** The recognizable consumer-facing name (e.g., 'Added Sugar') */
  common_name: string;
}

/**
 * RegulatoryAlert describes an ingredient or additive that is flagged under
 * food safety regulations by the EU, FDA, or both jurisdictions.
 */
export interface RegulatoryAlert {
  /** The ingredient or additive triggering the regulatory flag */
  ingredient: string;

  /** The regulatory jurisdiction(s) that flag this ingredient */
  region: 'EU' | 'FDA' | 'Both';

  /** The enforcement category: outright ban, conditional restriction, or advisory warning */
  status: 'Banned' | 'Restricted' | 'Warning';

  /** The health, safety, or policy reason for the regulatory action */
  reason: string;
}

/**
 * AllergenWarning represents an identified allergen risk with its severity
 * level, enabling product labeling compliance and consumer safety.
 */
export interface AllergenWarning {
  /** The allergen category type (e.g., 'Gluten', 'Tree Nuts', 'Soy') */
  type: string;

  /** The full human-readable warning message */
  text: string;

  /** Severity classification: High for anaphylaxis-risk allergens, Medium for intolerance-linked */
  severity: 'High' | 'Medium';
}

/**
 * GlycemicImpactLevel describes the qualitative impact of a food's glycemic
 * load on blood sugar response.
 */
export type GlycemicImpactLevel = 'Low' | 'Moderate' | 'High';

/**
 * AnalysisResult represents the final consolidated assessment output of a food product.
 */
export interface AnalysisResult {
  /** Normalized nutritional profile per 100g/100ml */
  normalizedData: NormalizedNutritionData;

  /** Complete Nutri-Score calculation breakdown */
  nutriScore: NutriScoreBreakdown;

  /** NOVA processing level classification */
  novaGroup: NovaGroup;

  /** Identified food additives list */
  additives: Additive[];

  /** Automatically triggered warnings based on ingredients or profile (e.g. allergens, high sodium) */
  healthWarnings: string[];

  /** A user-friendly, written architectural summary/explanation of the grade and ingredients */
  explanation: string;

  // ── Glycemic Intelligence ──────────────────────────────────────────────────

  /**
   * Estimated Glycemic Index (GI) of the product, derived from ingredient
   * composition heuristics (0–100 scale; 0 = minimal glucose impact).
   */
  glycemic_index_estimate: number;

  /**
   * Glycemic Load per serving, calculated as (Net Carbs × GI) / 100.
   * More clinically meaningful than GI alone as it accounts for portion size.
   */
  glycemic_load: number;

  /**
   * Qualitative classification of the product's glycemic load impact:
   * - 'Low'      : GL ≤ 10  (minimal blood sugar spike)
   * - 'Moderate' : GL 11–19 (moderate blood sugar response)
   * - 'High'     : GL ≥ 20  (significant blood sugar elevation)
   */
  glycemic_impact_level: GlycemicImpactLevel;

  // ── Gut Microbiome Intelligence ────────────────────────────────────────────

  /**
   * Composite gut health score on a 0–100 scale.
   * Starts at 100 and is decremented by penalties for gut-disrupting
   * emulsifiers, artificial sweeteners, and synthetic gums detected
   * in the ingredient or additive list.
   */
  gut_health_score: number;

  /**
   * Specific ingredients or additives identified as gut microbiome disruptors,
   * each accompanied by their risk level and physiological effect.
   */
  gut_disruptors_detected: GutDisruptor[];

  // ── Hidden Sugar Intelligence ──────────────────────────────────────────────

  /**
   * Sugar aliases detected in the ingredient list that consumers may not
   * recognise as sugar (e.g., Maltodextrin, Dextrose, Agave Nectar).
   * An empty array indicates no hidden sugars were found.
   */
  hidden_sugars_found: HiddenSugar[];

  // ── Regulatory Compliance Intelligence ────────────────────────────────────

  /**
   * Regulatory alerts raised for ingredients or additives flagged under
   * EU food law or US FDA regulations. Covers banned, restricted, and
   * advisory-warning-level substances.
   */
  regulatory_alerts: RegulatoryAlert[];

  // ── Allergen Intelligence ──────────────────────────────────────────────────

  /**
   * Detected allergen warnings based on ingredient analysis. Severity
   * 'High' covers the 14 major EU / Big-9 FDA allergens; 'Medium' covers
   * secondary intolerance-linked substances.
   */
  allergen_warnings: AllergenWarning[];
}
