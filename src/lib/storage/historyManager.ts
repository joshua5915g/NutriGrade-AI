import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { AnalysisResult, NutriScoreGrade, NovaGroup } from '../../types/nutrition';

export interface ScanHistoryRecord {
  id: string;
  productName: string;
  brand?: string;
  barcode?: string;
  grade: NutriScoreGrade;
  score: number;
  novaGroup: NovaGroup;
  imagePreview?: string;
  caloriesPer100g: number;
  sugarsPer100g: number;
  fatPer100g: number;
  sodiumMgPer100g: number;
  proteinPer100g: number;
  fiberPer100g: number;
  analysis?: AnalysisResult;
  source: string;
  timestamp: string; // ISO string
}

interface HistoryDB extends DBSchema {
  scanHistory: {
    key: string;
    value: ScanHistoryRecord;
    indexes: {
      timestamp: string;
      grade: string;
      productName: string;
    };
  };
}

const DB_NAME = 'nutrigrade-history-db';
const DB_VERSION = 1;
const LOCALSTORAGE_KEY = 'nutrigrade_unlimited_history_fallback';

let dbPromise: Promise<IDBPDatabase<HistoryDB>> | null = null;

function getHistoryDb(): Promise<IDBPDatabase<HistoryDB>> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB unavailable in SSR context'));
  }

  if (!dbPromise) {
    dbPromise = openDB<HistoryDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('scanHistory')) {
          const store = db.createObjectStore('scanHistory', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('grade', 'grade', { unique: false });
          store.createIndex('productName', 'productName', { unique: false });
        }
      },
    });
  }

  return dbPromise;
}

/**
 * Saves a scan record into unlimited IndexedDB scan history storage.
 */
export async function saveHistoryRecord(
  productName: string,
  analysis: AnalysisResult,
  imagePreview: string = '',
  source: string = 'upload',
  brand: string = '',
  barcode: string = ''
): Promise<ScanHistoryRecord> {
  const record: ScanHistoryRecord = {
    id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    productName,
    brand,
    barcode,
    grade: analysis.nutriScore.grade,
    score: analysis.nutriScore.score,
    novaGroup: analysis.novaGroup,
    imagePreview,
    caloriesPer100g: analysis.normalizedData.calories_per_100g,
    sugarsPer100g: analysis.normalizedData.sugars_per_100g,
    fatPer100g: analysis.normalizedData.total_fat_per_100g,
    sodiumMgPer100g: analysis.normalizedData.sodium_mg_per_100g,
    proteinPer100g: analysis.normalizedData.protein_per_100g,
    fiberPer100g: analysis.normalizedData.fiber_per_100g,
    analysis,
    source,
    timestamp: new Date().toISOString(),
  };

  try {
    const db = await getHistoryDb();
    await db.put('scanHistory', record);
  } catch (err) {
    console.warn('IndexedDB write error. Falling back to localStorage:', err);
    try {
      const existingRaw = localStorage.getItem(LOCALSTORAGE_KEY);
      const items: ScanHistoryRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
      items.unshift(record);
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(items));
    } catch {}
  }

  return record;
}

/**
 * Retrieves all scan history records with optional search query and grade filtering.
 */
export async function getHistoryRecords(filter?: {
  query?: string;
  grade?: NutriScoreGrade | 'ALL';
}): Promise<ScanHistoryRecord[]> {
  let records: ScanHistoryRecord[] = [];

  try {
    const db = await getHistoryDb();
    records = await db.getAllFromIndex('scanHistory', 'timestamp');
    records.reverse(); // newest first
  } catch (err) {
    console.warn('IndexedDB read error. Reading from localStorage fallback:', err);
    try {
      const existingRaw = localStorage.getItem(LOCALSTORAGE_KEY);
      if (existingRaw) {
        records = JSON.parse(existingRaw);
      }
    } catch {}
  }

  if (!filter) return records;

  const queryClean = (filter.query || '').trim().toLowerCase();
  const targetGrade = filter.grade || 'ALL';

  return records.filter((item) => {
    // 1. Grade filter
    if (targetGrade !== 'ALL' && item.grade !== targetGrade) {
      return false;
    }

    // 2. Query filter
    if (queryClean) {
      const nameMatch = item.productName.toLowerCase().includes(queryClean);
      const brandMatch = (item.brand || '').toLowerCase().includes(queryClean);
      const barcodeMatch = (item.barcode || '').toLowerCase().includes(queryClean);
      return nameMatch || brandMatch || barcodeMatch;
    }

    return true;
  });
}

/**
 * Deletes a single history record by ID.
 */
export async function deleteHistoryRecord(id: string): Promise<void> {
  try {
    const db = await getHistoryDb();
    await db.delete('scanHistory', id);
  } catch (err) {
    console.warn('IndexedDB delete error:', err);
    try {
      const existingRaw = localStorage.getItem(LOCALSTORAGE_KEY);
      if (existingRaw) {
        const items: ScanHistoryRecord[] = JSON.parse(existingRaw);
        const filtered = items.filter((item) => item.id !== id);
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(filtered));
      }
    } catch {}
  }
}

/**
 * Clears all scan history records.
 */
export async function clearAllHistoryRecords(): Promise<void> {
  try {
    const db = await getHistoryDb();
    await db.clear('scanHistory');
  } catch (err) {
    console.warn('IndexedDB clear error:', err);
  }
  try {
    localStorage.removeItem(LOCALSTORAGE_KEY);
  } catch {}
}
