import { AnalysisResult, NutriScoreGrade } from '../../types/nutrition';

export interface ScanHistoryEntry {
  id: string;
  productName: string;
  grade: NutriScoreGrade;
  score: number;
  novaGroup: 1 | 2 | 3 | 4;
  caloriesPer100g: number;
  sugarsPer100g: number;
  fatPer100g: number;
  sodiumMgPer100g: number;
  proteinPer100g: number;
  fiberPer100g: number;
  source: string;
  timestamp: string;
}

const STORAGE_KEY = 'nutrigrade_scan_history';

/**
 * Reads all scan history entries from localStorage.
 */
export function getScanHistory(): ScanHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScanHistoryEntry[];
  } catch {
    return [];
  }
}

/**
 * Saves a new scan entry to localStorage history.
 */
export function saveScanToHistory(
  productName: string,
  analysis: AnalysisResult,
  source: string = 'upload'
): ScanHistoryEntry {
  const entry: ScanHistoryEntry = {
    id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    productName,
    grade: analysis.nutriScore.grade,
    score: analysis.nutriScore.score,
    novaGroup: analysis.novaGroup,
    caloriesPer100g: analysis.normalizedData.calories_per_100g,
    sugarsPer100g: analysis.normalizedData.sugars_per_100g,
    fatPer100g: analysis.normalizedData.total_fat_per_100g,
    sodiumMgPer100g: analysis.normalizedData.sodium_mg_per_100g,
    proteinPer100g: analysis.normalizedData.protein_per_100g,
    fiberPer100g: analysis.normalizedData.fiber_per_100g,
    source,
    timestamp: new Date().toISOString(),
  };

  const history = getScanHistory();
  history.unshift(entry); // newest first

  // Cap at 100 entries
  if (history.length > 100) {
    history.length = 100;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return entry;
}

/**
 * Deletes a scan entry by ID.
 */
export function deleteScanEntry(id: string): void {
  const history = getScanHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/**
 * Clears all scan history.
 */
export function clearScanHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Returns the average Nutri-Score grade for scans made today.
 */
export function getDailyHealthIndex(): {
  averageScore: number;
  averageGrade: string;
  scansToday: number;
} {
  const history = getScanHistory();
  const today = new Date().toISOString().slice(0, 10);
  const todayScans = history.filter((e) => e.timestamp.slice(0, 10) === today);

  if (todayScans.length === 0) {
    return { averageScore: 0, averageGrade: '—', scansToday: 0 };
  }

  const total = todayScans.reduce((sum, e) => sum + e.score, 0);
  const avg = total / todayScans.length;

  // Map average numeric score to a letter grade with +/- modifiers
  let grade: string;
  if (avg <= -1) grade = 'A+';
  else if (avg <= 1) grade = 'A';
  else if (avg <= 2) grade = 'B+';
  else if (avg <= 5) grade = 'B';
  else if (avg <= 10) grade = 'C';
  else if (avg <= 14) grade = 'C-';
  else if (avg <= 18) grade = 'D';
  else if (avg <= 22) grade = 'D-';
  else grade = 'E';

  return {
    averageScore: Math.round(avg * 10) / 10,
    averageGrade: grade,
    scansToday: todayScans.length,
  };
}

/**
 * Filters history by Nutri-Score grade.
 */
export function filterByGrade(grade: NutriScoreGrade): ScanHistoryEntry[] {
  return getScanHistory().filter((e) => e.grade === grade);
}

/**
 * Searches history by product name (case-insensitive).
 */
export function searchHistory(query: string): ScanHistoryEntry[] {
  const lower = query.toLowerCase();
  return getScanHistory().filter((e) =>
    e.productName.toLowerCase().includes(lower)
  );
}
