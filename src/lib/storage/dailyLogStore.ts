import { NutriScoreGrade, NovaGroup, AnalysisResult } from '../../types/nutrition';

export interface DailyLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  productName: string;
  brand?: string;
  grade: NutriScoreGrade;
  novaGroup: NovaGroup;
  imagePreview?: string;
  portionGrams: number;
  calories: number;
  sugars: number;
  addedSugars: number;
  saturatedFat: number;
  sodiumMg: number;
  fiber: number;
  protein: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface DailyRDAThresholds {
  calories: number;
  addedSugarsMax: number;
  saturatedFatMax: number;
  sodiumMgMax: number;
  fiberMin: number;
  proteinTarget: number;
}

export const DEFAULT_DAILY_RDA: DailyRDAThresholds = {
  calories: 2000,
  addedSugarsMax: 25, // WHO recommended threshold (approx 6 tsp)
  saturatedFatMax: 20, // AHA cardiovascular threshold
  sodiumMgMax: 2300, // FDA daily upper limit
  fiberMin: 30, // Clinical target for healthy gut microbiome
  proteinTarget: 60,
};

export interface DailyTotals {
  date: string;
  totalCalories: number;
  totalSugars: number;
  totalAddedSugars: number;
  totalSaturatedFat: number;
  totalSodiumMg: number;
  totalFiber: number;
  totalProtein: number;
  itemCount: number;
  novaDistribution: Record<NovaGroup, number>;
  upfPercentage: number; // NOVA 4 % of logged items
  dailyHealthScore: number; // 0 - 100
  exceededLimits: {
    sugar: boolean;
    sodium: boolean;
    saturatedFat: boolean;
  };
}

const STORAGE_KEY_PREFIX = 'nutrigrade_daily_fuel_';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyLogEntries(dateStr?: string): DailyLogEntry[] {
  if (typeof window === 'undefined') return [];
  const targetDate = dateStr || getTodayDateString();
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${targetDate}`);
    if (!raw) return [];
    return JSON.parse(raw) as DailyLogEntry[];
  } catch (err) {
    console.error('Failed to read daily fuel log:', err);
    return [];
  }
}

export function addDailyLogEntry(
  analysis: AnalysisResult,
  productName: string = 'Scanned Food',
  brand: string = '',
  portionGrams: number = 100,
  mealType: DailyLogEntry['mealType'] = 'snack',
  dateStr?: string,
  imagePreview?: string
): DailyLogEntry {
  const targetDate = dateStr || getTodayDateString();
  const entries = getDailyLogEntries(targetDate);
  const multiplier = portionGrams / 100;
  const norm = analysis.normalizedData;

  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  const newEntry: DailyLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    date: targetDate,
    time,
    productName,
    brand,
    grade: analysis.nutriScore.grade,
    novaGroup: analysis.novaGroup,
    imagePreview,
    portionGrams,
    calories: Math.round(norm.calories_per_100g * multiplier),
    sugars: Number((norm.sugars_per_100g * multiplier).toFixed(1)),
    addedSugars: Number((norm.added_sugars_per_100g * multiplier).toFixed(1)),
    saturatedFat: Number((norm.saturated_fat_per_100g * multiplier).toFixed(1)),
    sodiumMg: Math.round(norm.sodium_mg_per_100g * multiplier),
    fiber: Number((norm.fiber_per_100g * multiplier).toFixed(1)),
    protein: Number((norm.protein_per_100g * multiplier).toFixed(1)),
    mealType,
  };

  entries.unshift(newEntry);
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${targetDate}`,
      JSON.stringify(entries)
    );
  }

  return newEntry;
}

export function removeDailyLogEntry(entryId: string, dateStr?: string): void {
  const targetDate = dateStr || getTodayDateString();
  const entries = getDailyLogEntries(targetDate).filter((e) => e.id !== entryId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${targetDate}`,
      JSON.stringify(entries)
    );
  }
}

export function calculateDailyTotals(
  entries: DailyLogEntry[],
  dateStr?: string,
  thresholds: DailyRDAThresholds = DEFAULT_DAILY_RDA
): DailyTotals {
  const targetDate = dateStr || getTodayDateString();

  let totalCalories = 0;
  let totalSugars = 0;
  let totalAddedSugars = 0;
  let totalSaturatedFat = 0;
  let totalSodiumMg = 0;
  let totalFiber = 0;
  let totalProtein = 0;

  const novaDistribution: Record<NovaGroup, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };

  let gradeSum = 0;
  const GRADE_SCORES: Record<NutriScoreGrade, number> = {
    A: 100,
    B: 80,
    C: 60,
    D: 40,
    E: 20,
  };

  for (const item of entries) {
    totalCalories += item.calories;
    totalSugars += item.sugars;
    totalAddedSugars += item.addedSugars;
    totalSaturatedFat += item.saturatedFat;
    totalSodiumMg += item.sodiumMg;
    totalFiber += item.fiber;
    totalProtein += item.protein;

    if (item.novaGroup) {
      novaDistribution[item.novaGroup] =
        (novaDistribution[item.novaGroup] || 0) + 1;
    }

    gradeSum += GRADE_SCORES[item.grade] || 50;
  }

  const itemCount = entries.length;
  const upfPercentage =
    itemCount > 0 ? Math.round((novaDistribution[4] / itemCount) * 100) : 0;

  // Composite day health score calculation (0 - 100)
  // Higher fiber + whole foods boost score; excessive added sugar/sodium/UPF drops score.
  let dailyHealthScore = itemCount > 0 ? Math.round(gradeSum / itemCount) : 100;
  if (totalAddedSugars > thresholds.addedSugarsMax) {
    dailyHealthScore = Math.max(10, dailyHealthScore - 15);
  }
  if (totalSodiumMg > thresholds.sodiumMgMax) {
    dailyHealthScore = Math.max(10, dailyHealthScore - 10);
  }
  if (upfPercentage > 50) {
    dailyHealthScore = Math.max(10, dailyHealthScore - 15);
  }
  if (totalFiber >= thresholds.fiberMin) {
    dailyHealthScore = Math.min(100, dailyHealthScore + 10);
  }

  return {
    date: targetDate,
    totalCalories,
    totalSugars: Number(totalSugars.toFixed(1)),
    totalAddedSugars: Number(totalAddedSugars.toFixed(1)),
    totalSaturatedFat: Number(totalSaturatedFat.toFixed(1)),
    totalSodiumMg: Math.round(totalSodiumMg),
    totalFiber: Number(totalFiber.toFixed(1)),
    totalProtein: Number(totalProtein.toFixed(1)),
    itemCount,
    novaDistribution,
    upfPercentage,
    dailyHealthScore,
    exceededLimits: {
      sugar: totalAddedSugars > thresholds.addedSugarsMax,
      sodium: totalSodiumMg > thresholds.sodiumMgMax,
      saturatedFat: totalSaturatedFat > thresholds.saturatedFatMax,
    },
  };
}
