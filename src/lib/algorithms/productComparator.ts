import { AnalysisResult, NutriScoreGrade, NovaGroup, RawNutritionData } from '../../types/nutrition';
import { detectSeedOils } from './seedOilRadar';

export interface CompareProductItem {
  id: string;
  name: string;
  brand?: string;
  imagePreview?: string;
  ingredients?: string[];
  rawData?: RawNutritionData;
  analysis: AnalysisResult;
}

export type MetricWinner = 'A' | 'B' | 'TIE';

export interface ComparisonMetric {
  id: string;
  label: string;
  category: 'nutritional' | 'processing' | 'gut_metabolic' | 'ingredients';
  valA: number | string;
  valB: number | string;
  unit?: string;
  displayA: string;
  displayB: string;
  winner: MetricWinner;
  differenceText: string;
  clinicalImpact: string;
  severity: 'positive' | 'warning' | 'neutral';
}

export interface ComparisonVerdict {
  winnerId: 'A' | 'B' | 'TIE';
  winnerItem: CompareProductItem | null;
  scoreA: number; // 0 - 100
  scoreB: number; // 0 - 100
  headline: string;
  clinicalSummary: string;
  keyAdvantagesA: string[];
  keyAdvantagesB: string[];
  swapImpactWeekly: string; // e.g., "Swapping saves ~48g of sugar and 320mg sodium per week"
  metrics: ComparisonMetric[];
}

const NUTRI_SCORE_POINTS: Record<NutriScoreGrade, number> = {
  A: 100,
  B: 80,
  C: 55,
  D: 30,
  E: 10,
};

const NOVA_POINTS: Record<NovaGroup, number> = {
  1: 100,
  2: 80,
  3: 50,
  4: 15,
};

/**
 * Computes a rigorous head-to-head clinical nutrition comparison between two products.
 */
export function compareProducts(
  itemA: CompareProductItem,
  itemB: CompareProductItem
): ComparisonVerdict {
  const normA = itemA.analysis.normalizedData;
  const normB = itemB.analysis.normalizedData;

  const seedA = detectSeedOils(
    itemA.ingredients || itemA.analysis.additives.map((a) => a.commonName)
  );
  const seedB = detectSeedOils(
    itemB.ingredients || itemB.analysis.additives.map((a) => a.commonName)
  );

  // 1. Nutri-Score & NOVA
  const gradeScoreA = NUTRI_SCORE_POINTS[itemA.analysis.nutriScore.grade] || 50;
  const gradeScoreB = NUTRI_SCORE_POINTS[itemB.analysis.nutriScore.grade] || 50;

  const novaScoreA = NOVA_POINTS[itemA.analysis.novaGroup] || 50;
  const novaScoreB = NOVA_POINTS[itemB.analysis.novaGroup] || 50;

  // 2. Gut Health
  const gutA = itemA.analysis.gut_health_score ?? 80;
  const gutB = itemB.analysis.gut_health_score ?? 80;

  // 3. Sugar & Glycemic Impact
  const sugarA = normA.sugars_per_100g;
  const sugarB = normB.sugars_per_100g;
  const glA = itemA.analysis.glycemic_load ?? 10;
  const glB = itemB.analysis.glycemic_load ?? 10;

  // 4. Additives & Seed Oils
  const additivesA = itemA.analysis.additives.length;
  const additivesB = itemB.analysis.additives.length;

  const seedOilPenaltyA = seedA.hasSeedOils ? 25 : 0;
  const seedOilPenaltyB = seedB.hasSeedOils ? 25 : 0;

  // Composite 0 - 100 Clinical Index
  // Formula: 30% Nutri-Score + 20% NOVA + 20% Gut Health + 15% Sugar/GL + 15% Additives & Oils
  const sugarPenaltyA = Math.min(30, (sugarA / 50) * 30);
  const sugarPenaltyB = Math.min(30, (sugarB / 50) * 30);

  const finalScoreA = Math.max(
    5,
    Math.round(
      gradeScoreA * 0.3 +
        novaScoreA * 0.2 +
        gutA * 0.2 +
        Math.max(0, 30 - sugarPenaltyA) * 0.5 +
        Math.max(0, 30 - additivesA * 5 - seedOilPenaltyA) * 0.5
    )
  );

  const finalScoreB = Math.max(
    5,
    Math.round(
      gradeScoreB * 0.3 +
        novaScoreB * 0.2 +
        gutB * 0.2 +
        Math.max(0, 30 - sugarPenaltyB) * 0.5 +
        Math.max(0, 30 - additivesB * 5 - seedOilPenaltyB) * 0.5
    )
  );

  let winnerId: 'A' | 'B' | 'TIE' = 'TIE';
  if (finalScoreA > finalScoreB + 3) {
    winnerId = 'A';
  } else if (finalScoreB > finalScoreA + 3) {
    winnerId = 'B';
  }

  const winnerItem = winnerId === 'A' ? itemA : winnerId === 'B' ? itemB : null;

  // Metrics Table Calculation
  const metrics: ComparisonMetric[] = [
    {
      id: 'nutriscore',
      label: 'Nutri-Score Grade',
      category: 'nutritional',
      valA: itemA.analysis.nutriScore.grade,
      valB: itemB.analysis.nutriScore.grade,
      displayA: `Grade ${itemA.analysis.nutriScore.grade}`,
      displayB: `Grade ${itemB.analysis.nutriScore.grade}`,
      winner:
        gradeScoreA > gradeScoreB ? 'A' : gradeScoreB > gradeScoreA ? 'B' : 'TIE',
      differenceText:
        itemA.analysis.nutriScore.grade === itemB.analysis.nutriScore.grade
          ? 'Equal grade rating'
          : gradeScoreA > gradeScoreB
          ? `${itemA.name} is higher graded`
          : `${itemB.name} is higher graded`,
      clinicalImpact: 'Standardized European overall nutritional density rating.',
      severity: 'positive',
    },
    {
      id: 'nova',
      label: 'NOVA Food Processing',
      category: 'processing',
      valA: itemA.analysis.novaGroup,
      valB: itemB.analysis.novaGroup,
      displayA: `NOVA ${itemA.analysis.novaGroup}`,
      displayB: `NOVA ${itemB.analysis.novaGroup}`,
      winner:
        itemA.analysis.novaGroup < itemB.analysis.novaGroup
          ? 'A'
          : itemB.analysis.novaGroup < itemA.analysis.novaGroup
          ? 'B'
          : 'TIE',
      differenceText:
        itemA.analysis.novaGroup === itemB.analysis.novaGroup
          ? 'Same processing tier'
          : itemA.analysis.novaGroup < itemB.analysis.novaGroup
          ? `${itemA.name} is less processed`
          : `${itemB.name} is less processed`,
      clinicalImpact:
        'Ultra-processed formulations (NOVA 4) alter satiety hormones and metabolic markers.',
      severity: 'warning',
    },
    {
      id: 'sugars',
      label: 'Sugars (per 100g)',
      category: 'nutritional',
      valA: sugarA,
      valB: sugarB,
      unit: 'g',
      displayA: `${sugarA.toFixed(1)}g (~${(sugarA / 4.2).toFixed(1)} tsp)`,
      displayB: `${sugarB.toFixed(1)}g (~${(sugarB / 4.2).toFixed(1)} tsp)`,
      winner: sugarA < sugarB ? 'A' : sugarB < sugarA ? 'B' : 'TIE',
      differenceText:
        Math.abs(sugarA - sugarB) < 0.2
          ? 'Virtually identical sugar'
          : sugarA < sugarB
          ? `${(sugarB - sugarA).toFixed(1)}g less sugar (${Math.round(
              ((sugarB - sugarA) / Math.max(0.1, sugarB)) * 100
            )}% lower)`
          : `${(sugarA - sugarB).toFixed(1)}g less sugar (${Math.round(
              ((sugarA - sugarB) / Math.max(0.1, sugarA)) * 100
            )}% lower)`,
      clinicalImpact: 'Higher free sugars cause rapid glycemic spikes and lipid synthesis.',
      severity: 'warning',
    },
    {
      id: 'gut_health',
      label: 'Gut Microbiome Health',
      category: 'gut_metabolic',
      valA: gutA,
      valB: gutB,
      unit: '/100',
      displayA: `${gutA}/100`,
      displayB: `${gutB}/100`,
      winner: gutA > gutB ? 'A' : gutB > gutA ? 'B' : 'TIE',
      differenceText:
        gutA === gutB
          ? 'Equal microbiome index'
          : gutA > gutB
          ? `+${gutA - gutB} pts higher gut safety`
          : `+${gutB - gutA} pts higher gut safety`,
      clinicalImpact:
        'Penalizes toxic emulsifiers (polysorbate 80, carrageenan) that thin mucosal barriers.',
      severity: 'positive',
    },
    {
      id: 'glycemic_load',
      label: 'Glycemic Load (Per Serving)',
      category: 'gut_metabolic',
      valA: glA,
      valB: glB,
      displayA: `${glA} (${itemA.analysis.glycemic_impact_level})`,
      displayB: `${glB} (${itemB.analysis.glycemic_impact_level})`,
      winner: glA < glB ? 'A' : glB < glA ? 'B' : 'TIE',
      differenceText:
        Math.abs(glA - glB) < 1
          ? 'Similar blood glucose response'
          : glA < glB
          ? `${(glB - glA).toFixed(0)} pts lower glycemic spike`
          : `${(glA - glB).toFixed(0)} pts lower glycemic spike`,
      clinicalImpact: 'Predicts acute post-prandial blood sugar and insulin demand.',
      severity: 'warning',
    },
    {
      id: 'seed_oils',
      label: 'Inflammatory Seed Oils',
      category: 'ingredients',
      valA: seedA.hasSeedOils ? 'Detected' : 'None',
      valB: seedB.hasSeedOils ? 'Detected' : 'None',
      displayA: seedA.hasSeedOils
        ? `⚠️ ${seedA.detectedOils.map((o) => o.name).join(', ')}`
        : '✅ Clean Oils',
      displayB: seedB.hasSeedOils
        ? `⚠️ ${seedB.detectedOils.map((o) => o.name).join(', ')}`
        : '✅ Clean Oils',
      winner:
        !seedA.hasSeedOils && seedB.hasSeedOils
          ? 'A'
          : seedA.hasSeedOils && !seedB.hasSeedOils
          ? 'B'
          : 'TIE',
      differenceText:
        seedA.hasSeedOils === seedB.hasSeedOils
          ? seedA.hasSeedOils
            ? 'Both contain industrial seed oils'
            : 'Neither uses seed oils'
          : !seedA.hasSeedOils
          ? `${itemA.name} avoids high-heat linoleic seed oils`
          : `${itemB.name} avoids high-heat linoleic seed oils`,
      clinicalImpact:
        'High-heat solvent-extracted seed oils disrupt the Omega-6 to Omega-3 inflammatory balance.',
      severity: 'warning',
    },
    {
      id: 'additives',
      label: 'Chemical Additives & E-Numbers',
      category: 'ingredients',
      valA: additivesA,
      valB: additivesB,
      displayA: `${additivesA} additive${additivesA === 1 ? '' : 's'}`,
      displayB: `${additivesB} additive${additivesB === 1 ? '' : 's'}`,
      winner: additivesA < additivesB ? 'A' : additivesB < additivesA ? 'B' : 'TIE',
      differenceText:
        additivesA === additivesB
          ? 'Equal chemical additive count'
          : additivesA < additivesB
          ? `${additivesB - additivesA} fewer additive${
              additivesB - additivesA === 1 ? '' : 's'
            }`
          : `${additivesA - additivesB} fewer additive${
              additivesA - additivesB === 1 ? '' : 's'
            }`,
      clinicalImpact:
        'Artificial preservatives, colors, and texture modifiers burden detoxification pathways.',
      severity: 'warning',
    },
    {
      id: 'fiber',
      label: 'Dietary Fiber (per 100g)',
      category: 'nutritional',
      valA: normA.fiber_per_100g,
      valB: normB.fiber_per_100g,
      unit: 'g',
      displayA: `${normA.fiber_per_100g.toFixed(1)}g`,
      displayB: `${normB.fiber_per_100g.toFixed(1)}g`,
      winner:
        normA.fiber_per_100g > normB.fiber_per_100g
          ? 'A'
          : normB.fiber_per_100g > normA.fiber_per_100g
          ? 'B'
          : 'TIE',
      differenceText:
        Math.abs(normA.fiber_per_100g - normB.fiber_per_100g) < 0.2
          ? 'Similar prebiotic fiber'
          : normA.fiber_per_100g > normB.fiber_per_100g
          ? `+${(normA.fiber_per_100g - normB.fiber_per_100g).toFixed(
              1
            )}g more prebiotic fiber`
          : `+${(normB.fiber_per_100g - normA.fiber_per_100g).toFixed(
              1
            )}g more prebiotic fiber`,
      clinicalImpact:
        'Soluble and insoluble fiber feeds beneficial microbiome short-chain fatty acid (SCFA) production.',
      severity: 'positive',
    },
    {
      id: 'sodium',
      label: 'Sodium (per 100g)',
      category: 'nutritional',
      valA: normA.sodium_mg_per_100g,
      valB: normB.sodium_mg_per_100g,
      unit: 'mg',
      displayA: `${normA.sodium_mg_per_100g.toFixed(0)}mg`,
      displayB: `${normB.sodium_mg_per_100g.toFixed(0)}mg`,
      winner:
        normA.sodium_mg_per_100g < normB.sodium_mg_per_100g
          ? 'A'
          : normB.sodium_mg_per_100g < normA.sodium_mg_per_100g
          ? 'B'
          : 'TIE',
      differenceText:
        Math.abs(normA.sodium_mg_per_100g - normB.sodium_mg_per_100g) < 10
          ? 'Equivalent sodium'
          : normA.sodium_mg_per_100g < normB.sodium_mg_per_100g
          ? `${(normB.sodium_mg_per_100g - normA.sodium_mg_per_100g).toFixed(
              0
            )}mg lower sodium`
          : `${(normA.sodium_mg_per_100g - normB.sodium_mg_per_100g).toFixed(
              0
            )}mg lower sodium`,
      clinicalImpact: 'Elevated sodium strains vascular tone and blood pressure balance.',
      severity: 'warning',
    },
  ];

  // Advantages calculation
  const keyAdvantagesA: string[] = [];
  const keyAdvantagesB: string[] = [];

  metrics.forEach((m) => {
    if (m.winner === 'A') keyAdvantagesA.push(m.differenceText);
    if (m.winner === 'B') keyAdvantagesB.push(m.differenceText);
  });

  // Summary generation
  let headline = 'Aisle Deadlock: Both Products Exhibit Equivalent Health Profiles';
  let clinicalSummary =
    'Both products share closely matched processing levels and nutritional values. Look at specific ingredient preferences or budget.';

  if (winnerId === 'A') {
    headline = `🏆 ${itemA.name} is Clinically Superior`;
    clinicalSummary = `${itemA.name} achieves a higher health score (${finalScoreA}/100 vs ${finalScoreB}/100) primarily through ${keyAdvantagesA
      .slice(0, 2)
      .join(', ')}.`;
  } else if (winnerId === 'B') {
    headline = `🏆 ${itemB.name} is Clinically Superior`;
    clinicalSummary = `${itemB.name} achieves a higher health score (${finalScoreB}/100 vs ${finalScoreA}/100) primarily through ${keyAdvantagesB
      .slice(0, 2)
      .join(', ')}.`;
  }

  // Weekly impact calculation if consumed 3x per week (typical serving: 100g)
  const sugarDiff = Math.abs(sugarA - sugarB) * 3;
  const sodiumDiff = Math.abs(normA.sodium_mg_per_100g - normB.sodium_mg_per_100g) * 3;

  const betterName = winnerId === 'A' ? itemA.name : itemB.name;
  const worseName = winnerId === 'A' ? itemB.name : itemA.name;

  const swapImpactWeekly =
    winnerId !== 'TIE'
      ? `Consuming ${betterName} instead of ${worseName} 3 times a week saves ~${Math.round(
          sugarDiff
        )}g of sugar (${(sugarDiff / 4.2).toFixed(1)} teaspoons) and ~${Math.round(
          sodiumDiff
        )}mg of sodium.`
      : 'Both products have minimal weekly nutritional divergence.';

  return {
    winnerId,
    winnerItem,
    scoreA: finalScoreA,
    scoreB: finalScoreB,
    headline,
    clinicalSummary,
    keyAdvantagesA,
    keyAdvantagesB,
    swapImpactWeekly,
    metrics,
  };
}
