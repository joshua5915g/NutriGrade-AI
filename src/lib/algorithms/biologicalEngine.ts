/**
 * biologicalEngine.ts
 *
 * Deterministic intelligence algorithms for advanced food-health analysis:
 *   1. Glycemic Load Estimation (blood sugar impact)
 *   2. Gut Microbiome Health Scoring (microbiota disruption)
 *   3. Hidden Sugar Unmasking (60+ alias detection)
 *   4. EU / FDA Regulatory Restriction Checking
 *
 * All functions are pure, side-effect-free, and fully typed.
 */

import type {
  GlycemicImpactLevel,
  GutDisruptor,
  HiddenSugar,
  RegulatoryAlert,
  AllergenWarning,
} from '../../types/nutrition';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. GLYCEMIC LOAD ESTIMATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Estimates the Glycemic Index (GI) of a product based on ingredient
 * composition heuristics. This is a deterministic approximation — true GI
 * requires in-vivo clinical testing.
 *
 * @param ingredients - The ingredient list as extracted from the back label
 * @param fiberPer100g - Dietary fiber content per 100g (reduces GI)
 * @param sugarsPer100g - Total sugars per 100g (increases GI)
 * @returns Estimated GI on a 0–100 scale
 */
export function estimateGlycemicIndex(
  ingredients: string[],
  fiberPer100g: number,
  sugarsPer100g: number
): number {
  const lower = ingredients.map((i) => i.toLowerCase());

  // Base GI estimate from dominant carbohydrate sources
  let gi = 55; // Start at medium GI baseline

  // High-GI ingredient markers (refined starches, simple sugars)
  const highGiMarkers = [
    'white rice', 'rice flour', 'corn starch', 'cornstarch', 'modified starch',
    'potato starch', 'maltodextrin', 'dextrose', 'glucose', 'glucose syrup',
    'white bread', 'white flour', 'enriched flour', 'refined flour',
    'high fructose corn syrup', 'corn syrup', 'rice syrup',
    'instant oats', 'puffed rice', 'rice cakes',
  ];

  // Low-GI ingredient markers (whole grains, legumes, nuts)
  const lowGiMarkers = [
    'whole grain', 'whole wheat', 'rolled oats', 'steel cut oats',
    'quinoa', 'barley', 'buckwheat', 'lentils', 'chickpeas', 'beans',
    'almonds', 'walnuts', 'chia seeds', 'flax seeds', 'psyllium',
    'sweet potato', 'oat bran', 'rye flour', 'spelt',
  ];

  const highHits = lower.filter((ing) =>
    highGiMarkers.some((m) => ing.includes(m))
  ).length;

  const lowHits = lower.filter((ing) =>
    lowGiMarkers.some((m) => ing.includes(m))
  ).length;

  // Adjust GI based on detected markers
  gi += highHits * 8;  // Each high-GI ingredient raises estimate
  gi -= lowHits * 10;  // Each low-GI ingredient lowers estimate

  // Fiber attenuates glycemic response (-2 points per g/100g)
  gi -= fiberPer100g * 2;

  // High sugar content raises GI
  if (sugarsPer100g > 20) gi += 10;
  else if (sugarsPer100g > 10) gi += 5;

  // Clamp to 0–100
  return Math.round(Math.max(0, Math.min(100, gi)));
}

/**
 * Calculates the Glycemic Load (GL) of a product per 100g serving.
 *
 * Formula: GL = (Net Carbs × GI) / 100
 *
 * Net Carbs = Total Sugars + Added Sugars (simplified; a true net carb
 * calculation would need total carbohydrates minus fiber).
 *
 * @param netCarbs - Net digestible carbohydrates in grams per 100g
 * @param giEstimate - Estimated Glycemic Index (0–100)
 * @returns Glycemic Load value (typically 0–50+)
 */
export function calculateGlycemicLoad(
  netCarbs: number,
  giEstimate: number
): number {
  if (netCarbs <= 0 || giEstimate <= 0) return 0;
  return Math.round(((netCarbs * giEstimate) / 100) * 10) / 10;
}

/**
 * Classifies a Glycemic Load value into a qualitative impact level.
 *
 * Clinical thresholds (Harvard Medical School):
 *   - Low:      GL ≤ 10
 *   - Moderate: GL 11–19
 *   - High:     GL ≥ 20
 *
 * @param glycemicLoad - The calculated GL value
 * @returns 'Low' | 'Moderate' | 'High'
 */
export function classifyGlycemicImpact(
  glycemicLoad: number
): GlycemicImpactLevel {
  if (glycemicLoad <= 10) return 'Low';
  if (glycemicLoad <= 19) return 'Moderate';
  return 'High';
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. GUT MICROBIOME HEALTH SCORING
// ═══════════════════════════════════════════════════════════════════════════════

/** Emulsifiers known to disrupt intestinal mucosal barrier integrity */
const GUT_DISRUPTOR_EMULSIFIERS: Array<{ pattern: string; name: string; effect: string }> = [
  { pattern: 'e466', name: 'Carboxymethyl Cellulose (E466)', effect: 'Erodes protective intestinal mucus layer, promotes bacterial translocation and low-grade inflammation' },
  { pattern: 'e433', name: 'Polysorbate 80 (E433)', effect: 'Alters gut microbiota composition, increases intestinal permeability (leaky gut)' },
  { pattern: 'polysorbate 80', name: 'Polysorbate 80', effect: 'Promotes metabolic syndrome markers and colonic inflammation in clinical studies' },
  { pattern: 'e435', name: 'Polysorbate 60 (E435)', effect: 'Disrupts mucosal barrier function similar to Polysorbate 80' },
  { pattern: 'e471', name: 'Mono- and Diglycerides (E471)', effect: 'May alter lipid metabolism in the intestinal lumen' },
  { pattern: 'e407', name: 'Carrageenan (E407)', effect: 'Triggers intestinal inflammation and has been linked to ulcerative colitis in animal models' },
  { pattern: 'carrageenan', name: 'Carrageenan', effect: 'Degrades to poligeenan in acidic gut conditions, promoting inflammation' },
  { pattern: 'e472e', name: 'DATEM (E472e)', effect: 'Synthetic emulsifier linked to intestinal tight-junction disruption' },
  { pattern: 'e476', name: 'Polyglycerol Polyricinoleate (E476)', effect: 'May compromise gut epithelial barrier at chronic intake levels' },
  { pattern: 'soy lecithin', name: 'Soy Lecithin (E322)', effect: 'Generally low risk but may modulate gut microbiota in sensitive individuals' },
];

/** Artificial sweeteners with documented gut microbiome disruption */
const GUT_DISRUPTOR_SWEETENERS: Array<{ pattern: string; name: string; effect: string }> = [
  { pattern: 'sucralose', name: 'Sucralose (E955)', effect: 'Reduces beneficial Bifidobacteria and Lactobacillus by up to 50% (Duke University, 2008)' },
  { pattern: 'aspartame', name: 'Aspartame (E951)', effect: 'Alters cecal microbiota and increases Clostridium/Enterobacteriaceae ratio (Nature, 2014)' },
  { pattern: 'saccharin', name: 'Saccharin (E954)', effect: 'Induces glucose intolerance via gut microbiota alteration (Weizmann Institute, 2014)' },
  { pattern: 'acesulfame', name: 'Acesulfame K (E950)', effect: 'Shifts gut bacterial community composition and upregulates inflammation markers' },
  { pattern: 'neotame', name: 'Neotame (E961)', effect: 'Reduces Firmicutes diversity and promotes dysbiosis at habitual intake levels' },
  { pattern: 'advantame', name: 'Advantame (E969)', effect: 'Limited data; structurally related to aspartame with similar microbiome concerns' },
];

/** Synthetic gums that may affect gut motility and microbiota */
const GUT_DISRUPTOR_GUMS: Array<{ pattern: string; name: string; effect: string }> = [
  { pattern: 'xanthan gum', name: 'Xanthan Gum (E415)', effect: 'May cause bloating and gas; alters stool consistency and colonic transit time' },
  { pattern: 'guar gum', name: 'Guar Gum (E412)', effect: 'High doses reduce nutrient absorption and promote GI distress' },
  { pattern: 'cellulose gum', name: 'Cellulose Gum (E466)', effect: 'Synthetic thickener linked to intestinal inflammation in sensitive individuals' },
  { pattern: 'gellan gum', name: 'Gellan Gum (E418)', effect: 'May alter colonic bacterial fermentation patterns' },
  { pattern: 'locust bean gum', name: 'Locust Bean Gum (E410)', effect: 'Generally well tolerated; mild motility effects at high intake' },
];

/**
 * Calculates a Gut Microbiome Health Score based on detected disruptors.
 *
 * Scoring methodology:
 *   - Base score: 100 (pristine gut-safe profile)
 *   - Deduct 15 points per emulsifier detected
 *   - Deduct 10 points per artificial sweetener detected
 *   - Deduct 10 points per synthetic gum detected
 *   - Floor: 0 (worst possible score)
 *
 * @param ingredients - The ingredient list from the product
 * @param additives - E-number or additive name list
 * @returns Object containing the gut health score and array of detected disruptors
 */
export function calculateGutHealth(
  ingredients: string[],
  additives: string[]
): { score: number; disruptors: GutDisruptor[] } {
  const allInputs = [...ingredients, ...additives].map((s) => s.toLowerCase());
  const disruptors: GutDisruptor[] = [];
  let score = 100;

  // Scan for emulsifiers (-15 pts each)
  for (const item of GUT_DISRUPTOR_EMULSIFIERS) {
    if (allInputs.some((inp) => inp.includes(item.pattern))) {
      disruptors.push({ name: item.name, risk: 'High', effect: item.effect });
      score -= 15;
    }
  }

  // Scan for artificial sweeteners (-10 pts each)
  for (const item of GUT_DISRUPTOR_SWEETENERS) {
    if (allInputs.some((inp) => inp.includes(item.pattern))) {
      disruptors.push({ name: item.name, risk: 'Moderate', effect: item.effect });
      score -= 10;
    }
  }

  // Scan for synthetic gums (-10 pts each)
  for (const item of GUT_DISRUPTOR_GUMS) {
    if (allInputs.some((inp) => inp.includes(item.pattern))) {
      disruptors.push({ name: item.name, risk: 'Low', effect: item.effect });
      score -= 10;
    }
  }

  return {
    score: Math.max(0, score),
    disruptors,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. HIDDEN SUGAR UNMASKING (60+ ALIASES)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Master database of 65+ sugar aliases used by food manufacturers.
 * Each entry maps a technical/marketing alias to a recognizable common name.
 */
const SUGAR_ALIASES: Array<{ alias: string; commonName: string }> = [
  // Syrups
  { alias: 'high fructose corn syrup', commonName: 'Corn Sugar (HFCS)' },
  { alias: 'corn syrup', commonName: 'Corn Sugar' },
  { alias: 'corn syrup solids', commonName: 'Corn Sugar Solids' },
  { alias: 'rice syrup', commonName: 'Rice Sugar Syrup' },
  { alias: 'brown rice syrup', commonName: 'Rice Sugar Syrup' },
  { alias: 'malt syrup', commonName: 'Barley Malt Sugar' },
  { alias: 'maple syrup', commonName: 'Maple Sugar' },
  { alias: 'golden syrup', commonName: 'Inverted Sugar Syrup' },
  { alias: 'agave syrup', commonName: 'Agave Sugar' },
  { alias: 'agave nectar', commonName: 'Agave Sugar' },
  { alias: 'date syrup', commonName: 'Date Sugar' },
  { alias: 'tapioca syrup', commonName: 'Tapioca Sugar' },
  { alias: 'sorghum syrup', commonName: 'Sorghum Sugar' },
  { alias: 'carob syrup', commonName: 'Carob Sugar' },
  { alias: 'glucose syrup', commonName: 'Glucose Sugar' },
  { alias: 'glucose-fructose syrup', commonName: 'Mixed Sugar Syrup' },
  { alias: 'refiner syrup', commonName: 'Refined Sugar Syrup' },
  { alias: 'buttered syrup', commonName: 'Butter Sugar Syrup' },

  // -ose compounds (monosaccharides & disaccharides)
  { alias: 'dextrose', commonName: 'Glucose (Dextrose)' },
  { alias: 'fructose', commonName: 'Fruit Sugar' },
  { alias: 'glucose', commonName: 'Glucose' },
  { alias: 'sucrose', commonName: 'Table Sugar' },
  { alias: 'maltose', commonName: 'Malt Sugar' },
  { alias: 'lactose', commonName: 'Milk Sugar' },
  { alias: 'galactose', commonName: 'Galactose Sugar' },
  { alias: 'trehalose', commonName: 'Trehalose Sugar' },
  { alias: 'xylose', commonName: 'Wood Sugar' },

  // Processed cane sugars
  { alias: 'evaporated cane juice', commonName: 'Cane Sugar' },
  { alias: 'cane juice crystals', commonName: 'Cane Sugar Crystals' },
  { alias: 'cane sugar', commonName: 'Cane Sugar' },
  { alias: 'demerara sugar', commonName: 'Raw Cane Sugar' },
  { alias: 'turbinado sugar', commonName: 'Raw Cane Sugar' },
  { alias: 'muscovado sugar', commonName: 'Unrefined Cane Sugar' },
  { alias: 'panela', commonName: 'Unrefined Cane Sugar' },
  { alias: 'jaggery', commonName: 'Unrefined Cane Sugar' },
  { alias: 'rapadura', commonName: 'Unrefined Cane Sugar' },
  { alias: 'raw sugar', commonName: 'Raw Sugar' },
  { alias: 'brown sugar', commonName: 'Brown Cane Sugar' },
  { alias: 'powdered sugar', commonName: 'Powdered Sugar' },
  { alias: 'confectioners sugar', commonName: 'Powdered Sugar' },
  { alias: 'icing sugar', commonName: 'Powdered Sugar' },
  { alias: 'invert sugar', commonName: 'Inverted Sugar' },
  { alias: 'coconut sugar', commonName: 'Coconut Palm Sugar' },
  { alias: 'palm sugar', commonName: 'Palm Sugar' },
  { alias: 'date sugar', commonName: 'Date Sugar' },
  { alias: 'beet sugar', commonName: 'Beet Sugar' },

  // Maltodextrin & dextrins
  { alias: 'maltodextrin', commonName: 'Maltodextrin (Rapid Glucose)' },
  { alias: 'dextrin', commonName: 'Starch Sugar' },
  { alias: 'cyclodextrin', commonName: 'Cyclic Starch Sugar' },

  // Honey & molasses
  { alias: 'honey', commonName: 'Honey Sugar' },
  { alias: 'molasses', commonName: 'Molasses Sugar' },
  { alias: 'blackstrap molasses', commonName: 'Blackstrap Molasses' },
  { alias: 'treacle', commonName: 'Treacle Sugar' },

  // Fruit-derived sugars
  { alias: 'fruit juice concentrate', commonName: 'Concentrated Fruit Sugar' },
  { alias: 'fruit juice', commonName: 'Fruit Sugar' },
  { alias: 'grape juice concentrate', commonName: 'Grape Sugar Concentrate' },
  { alias: 'apple juice concentrate', commonName: 'Apple Sugar Concentrate' },
  { alias: 'pear juice concentrate', commonName: 'Pear Sugar Concentrate' },

  // Other
  { alias: 'barley malt', commonName: 'Barley Malt Sugar' },
  { alias: 'barley malt extract', commonName: 'Barley Malt Sugar' },
  { alias: 'ethyl maltol', commonName: 'Synthetic Malt Sugar' },
  { alias: 'caramel', commonName: 'Caramelized Sugar' },
  { alias: 'carob powder', commonName: 'Carob Sugar' },
  { alias: 'diastatic malt', commonName: 'Malt Sugar (Enzyme-Active)' },
  { alias: 'florida crystals', commonName: 'Cane Sugar Crystals' },
  { alias: 'crystalline fructose', commonName: 'Crystalline Fruit Sugar' },
  { alias: 'sucanat', commonName: 'Whole Cane Sugar (SUgar CAne NATural)' },
];

/**
 * Scans an ingredient list for hidden sugar aliases that consumers may not
 * recognise as sugar. Matches against a master database of 65+ aliases.
 *
 * @param ingredients - The ingredient list from the product
 * @returns Array of detected hidden sugars with their common names
 */
export function unmaskHiddenSugars(
  ingredients: string[]
): HiddenSugar[] {
  const lowerIngredients = ingredients.map((i) => i.toLowerCase());
  const found: HiddenSugar[] = [];
  const seen = new Set<string>();

  for (const entry of SUGAR_ALIASES) {
    if (seen.has(entry.alias)) continue;

    if (lowerIngredients.some((ing) => ing.includes(entry.alias))) {
      found.push({
        alias: entry.alias,
        common_name: entry.commonName,
      });
      seen.add(entry.alias);
    }
  }

  return found;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. EU / FDA REGULATORY RESTRICTION CHECKER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Database of ingredients and additives with regulatory restrictions.
 * Sources: EFSA Journal, FDA CFR Title 21, EU Regulation 1333/2008.
 */
const REGULATORY_DATABASE: Array<{
  patterns: string[];
  ingredient: string;
  region: 'EU' | 'FDA' | 'Both';
  status: 'Banned' | 'Restricted' | 'Warning';
  reason: string;
}> = [
  // ── BANNED in EU ────────────────────────────────────────────────────────
  {
    patterns: ['titanium dioxide', 'e171'],
    ingredient: 'Titanium Dioxide (E171)',
    region: 'EU',
    status: 'Banned',
    reason: 'Banned in EU since August 2022 due to genotoxicity concerns. EFSA concluded it can no longer be considered safe as a food additive.',
  },
  {
    patterns: ['potassium bromate'],
    ingredient: 'Potassium Bromate',
    region: 'EU',
    status: 'Banned',
    reason: 'Classified as IARC Group 2B carcinogen (possibly carcinogenic to humans). Banned in EU, UK, Canada, Brazil, and China. Still legal in the US.',
  },
  {
    patterns: ['azodicarbonamide', 'e927a'],
    ingredient: 'Azodicarbonamide (E927a)',
    region: 'EU',
    status: 'Banned',
    reason: 'Banned in EU and Australia as a flour treatment agent. Linked to respiratory sensitization. Decomposes to semicarbazide, a suspected carcinogen.',
  },
  {
    patterns: ['brominated vegetable oil', 'bvo'],
    ingredient: 'Brominated Vegetable Oil (BVO)',
    region: 'Both',
    status: 'Banned',
    reason: 'FDA revoked authorization in July 2024. Previously banned in EU, Japan, and India. Accumulates bromine in body tissue with neurological and thyroid toxicity.',
  },
  {
    patterns: ['olestra', 'olean'],
    ingredient: 'Olestra (Olean)',
    region: 'EU',
    status: 'Banned',
    reason: 'Banned in EU and Canada. Fat substitute that inhibits absorption of fat-soluble vitamins (A, D, E, K) and causes gastrointestinal distress.',
  },

  // ── RESTRICTED / WARNING in Both ────────────────────────────────────────
  {
    patterns: ['bha', 'butylated hydroxyanisole', 'e320'],
    ingredient: 'BHA / Butylated Hydroxyanisole (E320)',
    region: 'Both',
    status: 'Restricted',
    reason: 'IARC Group 2B carcinogen. California Prop 65 listed. EU limits use to specific food categories with maximum dose. Linked to endocrine disruption.',
  },
  {
    patterns: ['bht', 'butylated hydroxytoluene', 'e321'],
    ingredient: 'BHT / Butylated Hydroxytoluene (E321)',
    region: 'Both',
    status: 'Warning',
    reason: 'Permitted in both regions with limits. Animal studies show liver, kidney, and thyroid effects at high doses. Some EU member states have restricted use.',
  },
  {
    patterns: ['sodium nitrite', 'e250'],
    ingredient: 'Sodium Nitrite (E250)',
    region: 'Both',
    status: 'Restricted',
    reason: 'Forms nitrosamines (IARC Group 1 carcinogens) during high-heat cooking or in stomach acid. EU considering further restrictions. Mandatory dose limits apply.',
  },
  {
    patterns: ['sodium nitrate', 'e251'],
    ingredient: 'Sodium Nitrate (E251)',
    region: 'Both',
    status: 'Restricted',
    reason: 'Converts to sodium nitrite in the body. Same carcinogenic nitrosamine formation risk. Restricted to cured meat products only.',
  },

  // ── SYNTHETIC COLORANTS (Restricted/Warning) ───────────────────────────
  {
    patterns: ['red 40', 'allura red', 'e129'],
    ingredient: 'Red 40 / Allura Red (E129)',
    region: 'EU',
    status: 'Warning',
    reason: 'EU requires mandatory warning label: "May have an adverse effect on activity and attention in children." Subject to Southampton Six ADHD studies.',
  },
  {
    patterns: ['red 3', 'erythrosine', 'e127'],
    ingredient: 'Red 3 / Erythrosine (E127)',
    region: 'FDA',
    status: 'Banned',
    reason: 'FDA banned Red 3 in January 2025 after finding it causes cancer in laboratory animals. Delaney Clause invoked.',
  },
  {
    patterns: ['yellow 5', 'tartrazine', 'e102'],
    ingredient: 'Yellow 5 / Tartrazine (E102)',
    region: 'EU',
    status: 'Warning',
    reason: 'EU mandatory ADHD warning label required. May trigger allergic reactions in aspirin-sensitive individuals and asthmatics.',
  },
  {
    patterns: ['yellow 6', 'sunset yellow', 'e110'],
    ingredient: 'Yellow 6 / Sunset Yellow (E110)',
    region: 'EU',
    status: 'Warning',
    reason: 'EU mandatory ADHD warning label. Linked to urticaria, angioedema, and hyperactivity in children.',
  },
  {
    patterns: ['blue 1', 'brilliant blue', 'e133'],
    ingredient: 'Blue 1 / Brilliant Blue (E133)',
    region: 'EU',
    status: 'Warning',
    reason: 'Restricted in EU to specific food categories. Some evidence of chromosomal aberrations in vitro studies.',
  },
  {
    patterns: ['blue 2', 'indigo carmine', 'e132'],
    ingredient: 'Blue 2 / Indigo Carmine (E132)',
    region: 'EU',
    status: 'Warning',
    reason: 'EU restricts use. May cause nausea and high blood pressure in sensitive individuals. Cross-reactivity with aspirin intolerance.',
  },
  {
    patterns: ['green 3', 'fast green'],
    ingredient: 'Green 3 / Fast Green FCF',
    region: 'EU',
    status: 'Banned',
    reason: 'Banned in EU. Some studies suggest it may be tumorigenic. Only approved in US with limited categories.',
  },

  // ── OTHER RESTRICTED SUBSTANCES ────────────────────────────────────────
  {
    patterns: ['propylparaben', 'e217'],
    ingredient: 'Propylparaben (E217)',
    region: 'EU',
    status: 'Banned',
    reason: 'Banned as food additive in EU since 2006 due to endocrine-disrupting properties (anti-androgenic activity).',
  },
  {
    patterns: ['tbhq', 'tertiary butylhydroquinone', 'e319'],
    ingredient: 'TBHQ (E319)',
    region: 'Both',
    status: 'Restricted',
    reason: 'Permitted at low levels (max 200 ppm). High doses cause nausea, tinnitus, and delirium. EFSA has lowered the ADI. Possible immunotoxicity.',
  },
  {
    patterns: ['partially hydrogenated', 'trans fat'],
    ingredient: 'Partially Hydrogenated Oils (Trans Fats)',
    region: 'Both',
    status: 'Banned',
    reason: 'FDA removed GRAS status in 2018. WHO called for global elimination by 2023. EU regulation 2019/649 caps industrial trans fats at 2g/100g fat.',
  },
];

/**
 * Checks an ingredient and additive list against a database of substances
 * that are banned, restricted, or carry regulatory warnings in the EU and/or
 * US FDA jurisdictions.
 *
 * @param ingredients - The ingredient list from the product
 * @param additives - E-number or additive name list
 * @returns Array of regulatory alerts with jurisdiction, status, and reasoning
 */
export function checkRegulatoryRestrictions(
  ingredients: string[],
  additives: string[]
): RegulatoryAlert[] {
  const allInputs = [...ingredients, ...additives].map((s) => s.toLowerCase());
  const alerts: RegulatoryAlert[] = [];
  const seen = new Set<string>();

  for (const entry of REGULATORY_DATABASE) {
    if (seen.has(entry.ingredient)) continue;

    const matched = entry.patterns.some((pattern) =>
      allInputs.some((input) => input.includes(pattern))
    );

    if (matched) {
      alerts.push({
        ingredient: entry.ingredient,
        region: entry.region,
        status: entry.status,
        reason: entry.reason,
      });
      seen.add(entry.ingredient);
    }
  }

  return alerts;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. ALLERGEN DETECTION (BONUS)
// ═══════════════════════════════════════════════════════════════════════════════

/** The 14 major EU allergens + Big-9 FDA allergens */
const ALLERGEN_DATABASE: Array<{
  patterns: string[];
  type: string;
  severity: 'High' | 'Medium';
  text: string;
}> = [
  { patterns: ['peanut', 'arachis'], type: 'Peanuts', severity: 'High', text: 'Contains peanuts — risk of severe anaphylaxis.' },
  { patterns: ['tree nut', 'almond', 'walnut', 'cashew', 'pistachio', 'hazelnut', 'macadamia', 'pecan', 'brazil nut'], type: 'Tree Nuts', severity: 'High', text: 'Contains tree nuts — risk of allergic reaction.' },
  { patterns: ['milk', 'dairy', 'casein', 'whey', 'lactose', 'cream', 'butter', 'cheese'], type: 'Milk / Dairy', severity: 'High', text: 'Contains milk derivatives — not suitable for dairy allergy or severe lactose intolerance.' },
  { patterns: ['egg', 'albumin', 'lysozyme', 'ovomucin'], type: 'Eggs', severity: 'High', text: 'Contains egg proteins — allergenic risk.' },
  { patterns: ['wheat', 'gluten', 'spelt', 'kamut', 'semolina', 'durum'], type: 'Wheat / Gluten', severity: 'High', text: 'Contains wheat/gluten — not safe for celiac disease or gluten sensitivity.' },
  { patterns: ['soy', 'soya', 'soybean', 'edamame'], type: 'Soy', severity: 'High', text: 'Contains soy — one of the major FDA allergens.' },
  { patterns: ['fish', 'cod', 'salmon', 'tuna', 'anchovy', 'sardine', 'mackerel'], type: 'Fish', severity: 'High', text: 'Contains fish — allergenic risk.' },
  { patterns: ['shellfish', 'shrimp', 'crab', 'lobster', 'prawn', 'crawfish', 'crayfish'], type: 'Shellfish', severity: 'High', text: 'Contains shellfish/crustaceans — high anaphylaxis risk.' },
  { patterns: ['sesame', 'tahini'], type: 'Sesame', severity: 'High', text: 'Contains sesame — FDA major allergen since 2023 (FASTER Act).' },
  { patterns: ['celery', 'celeriac'], type: 'Celery', severity: 'Medium', text: 'Contains celery — EU mandatory allergen (not FDA Big-9).' },
  { patterns: ['mustard'], type: 'Mustard', severity: 'Medium', text: 'Contains mustard — EU mandatory allergen.' },
  { patterns: ['lupin', 'lupine'], type: 'Lupin', severity: 'Medium', text: 'Contains lupin — EU mandatory allergen. Cross-reactivity with peanut allergy.' },
  { patterns: ['mollusc', 'mollusk', 'squid', 'octopus', 'oyster', 'mussel', 'clam', 'snail'], type: 'Molluscs', severity: 'Medium', text: 'Contains molluscs — EU mandatory allergen.' },
  { patterns: ['sulphite', 'sulfite', 'sulphur dioxide', 'e220', 'e221', 'e222', 'e223', 'e224', 'e226', 'e227', 'e228'], type: 'Sulphites', severity: 'Medium', text: 'Contains sulphites (>10mg/kg) — triggers asthma and urticaria in sensitive individuals.' },
];

/**
 * Scans an ingredient list for the 14 major EU allergens and Big-9 FDA
 * allergens, returning typed warnings with severity.
 *
 * @param ingredients - The ingredient list from the product
 * @returns Array of allergen warnings with type, text, and severity
 */
export function detectAllergens(
  ingredients: string[]
): AllergenWarning[] {
  const lowerIngredients = ingredients.map((i) => i.toLowerCase());
  const warnings: AllergenWarning[] = [];
  const seen = new Set<string>();

  for (const entry of ALLERGEN_DATABASE) {
    if (seen.has(entry.type)) continue;

    if (entry.patterns.some((p) => lowerIngredients.some((ing) => ing.includes(p)))) {
      warnings.push({
        type: entry.type,
        text: entry.text,
        severity: entry.severity,
      });
      seen.add(entry.type);
    }
  }

  return warnings;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. UNIFIED PIPELINE RUNNER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Runs the full biological intelligence pipeline on a product's ingredients
 * and nutritional data, returning all computed intelligence fields.
 *
 * @param ingredients - The ingredient list
 * @param additives - E-number or additive name list
 * @param sugarsPer100g - Total sugars per 100g
 * @param fiberPer100g - Dietary fiber per 100g
 * @returns All biological intelligence fields for AnalysisResult
 */
export function runBiologicalPipeline(
  ingredients: string[],
  additives: string[],
  sugarsPer100g: number,
  fiberPer100g: number
): {
  glycemic_index_estimate: number;
  glycemic_load: number;
  glycemic_impact_level: GlycemicImpactLevel;
  gut_health_score: number;
  gut_disruptors_detected: GutDisruptor[];
  hidden_sugars_found: HiddenSugar[];
  regulatory_alerts: RegulatoryAlert[];
  allergen_warnings: AllergenWarning[];
} {
  // Net carbs approximation (sugars as primary digestible carbs)
  const netCarbs = sugarsPer100g;

  // 1. Glycemic Intelligence
  const giEstimate = estimateGlycemicIndex(ingredients, fiberPer100g, sugarsPer100g);
  const glycemicLoad = calculateGlycemicLoad(netCarbs, giEstimate);
  const glycemicImpact = classifyGlycemicImpact(glycemicLoad);

  // 2. Gut Health
  const gutResult = calculateGutHealth(ingredients, additives);

  // 3. Hidden Sugars
  const hiddenSugars = unmaskHiddenSugars(ingredients);

  // 4. Regulatory Alerts
  const regulatoryAlerts = checkRegulatoryRestrictions(ingredients, additives);

  // 5. Allergens
  const allergenWarnings = detectAllergens(ingredients);

  return {
    glycemic_index_estimate: giEstimate,
    glycemic_load: glycemicLoad,
    glycemic_impact_level: glycemicImpact,
    gut_health_score: gutResult.score,
    gut_disruptors_detected: gutResult.disruptors,
    hidden_sugars_found: hiddenSugars,
    regulatory_alerts: regulatoryAlerts,
    allergen_warnings: allergenWarnings,
  };
}
