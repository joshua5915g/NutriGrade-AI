import { AnalysisResult, NutriScoreGrade } from '../../types/nutrition';

export interface PantryItem {
  id: string;
  productName: string;
  analysis: AnalysisResult;
  addedAt: string;
}

export interface PantryGradeDistribution {
  count: number;
  percentage: number;
}

export interface PantryStats {
  totalItems: number;
  healthScore: number; // 0 to 100 scale
  letterGrade: NutriScoreGrade;
  nova4Percentage: number;
  gradeDistribution: Record<NutriScoreGrade, PantryGradeDistribution>;
  worstItems: PantryItem[];
  cleanestItems: PantryItem[];
}

const STORAGE_KEY = 'nutrigrade_pantry_items';

/**
 * Retrieves all items in the user's local pantry storage.
 */
export function getPantryItems(): PantryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PantryItem[];
  } catch (err) {
    console.error('Error reading pantry storage:', err);
    return [];
  }
}

/**
 * Adds an analysis result item to the user's pantry.
 */
export function addToPantry(
  analysis: AnalysisResult,
  productName: string = 'Pantry Item'
): PantryItem {
  const items = getPantryItems();
  
  // Check if duplicate by name
  const existing = items.find(
    (i) => i.productName.toLowerCase() === productName.toLowerCase()
  );
  if (existing) {
    return existing;
  }

  const newItem: PantryItem = {
    id: `pantry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    productName,
    analysis,
    addedAt: new Date().toISOString(),
  };

  items.unshift(newItem);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return newItem;
}

/**
 * Removes an item from the pantry by its ID.
 */
export function removeFromPantry(id: string): void {
  const items = getPantryItems().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * Clears all items from the pantry.
 */
export function clearPantry(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Checks whether an item is already saved in the pantry.
 */
export function isItemInPantry(productName: string): boolean {
  if (!productName) return false;
  const items = getPantryItems();
  return items.some(
    (i) => i.productName.toLowerCase() === productName.toLowerCase()
  );
}

/**
 * Converts a Nutri-Score raw numeric score (ranging from -15 to +40)
 * into a standardized 0-100 health score (100 = best, 0 = worst).
 */
function scoreToHealthIndex(score: number): number {
  // -15 maps to 100, +40 maps to 0
  const normalized = Math.max(-15, Math.min(40, score));
  const healthIndex = Math.round(((40 - normalized) / 55) * 100);
  return Math.max(0, Math.min(100, healthIndex));
}

/**
 * Maps a 0-100 average health score to a overall NutriScore letter grade.
 */
function healthIndexToGrade(healthScore: number): NutriScoreGrade {
  if (healthScore >= 80) return 'A';
  if (healthScore >= 65) return 'B';
  if (healthScore >= 45) return 'C';
  if (healthScore >= 25) return 'D';
  return 'E';
}

/**
 * Calculates comprehensive audit statistics for the user's household pantry.
 */
export function getPantryStats(): PantryStats {
  const items = getPantryItems();

  const emptyStats: PantryStats = {
    totalItems: 0,
    healthScore: 100,
    letterGrade: 'A',
    nova4Percentage: 0,
    gradeDistribution: {
      A: { count: 0, percentage: 0 },
      B: { count: 0, percentage: 0 },
      C: { count: 0, percentage: 0 },
      D: { count: 0, percentage: 0 },
      E: { count: 0, percentage: 0 },
    },
    worstItems: [],
    cleanestItems: [],
  };

  if (items.length === 0) {
    return emptyStats;
  }

  // 1. Grade distribution & NOVA 4 count
  let nova4Count = 0;
  let totalScoreSum = 0;

  const counts: Record<NutriScoreGrade, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
  };

  items.forEach((item) => {
    const grade = item.analysis.nutriScore.grade || 'C';
    counts[grade] = (counts[grade] || 0) + 1;

    totalScoreSum += item.analysis.nutriScore.score;

    if (item.analysis.novaGroup === 4) {
      nova4Count++;
    }
  });

  // Average score calculation
  const avgNutriScore = totalScoreSum / items.length;
  const overallHealthScore = scoreToHealthIndex(avgNutriScore);
  const overallGrade = healthIndexToGrade(overallHealthScore);

  const nova4Percentage = Math.round((nova4Count / items.length) * 100);

  const gradeDistribution: Record<NutriScoreGrade, PantryGradeDistribution> = {
    A: { count: counts.A, percentage: Math.round((counts.A / items.length) * 100) },
    B: { count: counts.B, percentage: Math.round((counts.B / items.length) * 100) },
    C: { count: counts.C, percentage: Math.round((counts.C / items.length) * 100) },
    D: { count: counts.D, percentage: Math.round((counts.D / items.length) * 100) },
    E: { count: counts.E, percentage: Math.round((counts.E / items.length) * 100) },
  };

  // Sort items for worst and cleanest
  // Highest score (or worst grade D/E / NOVA 4) = worst items
  const sortedWorst = [...items].sort((a, b) => {
    return b.analysis.nutriScore.score - a.analysis.nutriScore.score;
  });

  const sortedCleanest = [...items].sort((a, b) => {
    return a.analysis.nutriScore.score - b.analysis.nutriScore.score;
  });

  const worstItems = sortedWorst.slice(0, 3);
  const cleanestItems = sortedCleanest.slice(0, 3);

  return {
    totalItems: items.length,
    healthScore: overallHealthScore,
    letterGrade: overallGrade,
    nova4Percentage,
    gradeDistribution,
    worstItems,
    cleanestItems,
  };
}
