import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { AnalysisResult, SearchProductResult, RawNutritionData } from '../../types/nutrition';
import { normalizeTo100g } from '../utils/normalization';
import { calculateNutriScore } from '../algorithms/nutriScore';
import { detectNovaGroup } from '../algorithms/novaScale';
import { runBiologicalPipeline } from '../algorithms/biologicalEngine';

export interface CachedProductRecord {
  id: string; // barcode or unique ID
  barcode: string;
  productName: string;
  brand: string;
  imageThumbUrl?: string;
  keywords: string[];
  ingredients: string[];
  rawData: RawNutritionData;
  analysis: AnalysisResult;
  timestamp: number;
  isPreloaded?: boolean;
}

export interface OfflineQueueEntry {
  id: string;
  barcode?: string;
  query?: string;
  timestamp: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

interface NutriGradeDB extends DBSchema {
  productsCache: {
    key: string;
    value: CachedProductRecord;
    indexes: {
      barcode: string;
      productName: string;
      brand: string;
    };
  };
  offlineQueue: {
    key: string;
    value: OfflineQueueEntry;
    indexes: {
      timestamp: number;
      status: string;
    };
  };
}

const DB_NAME = 'nutrigrade-offline-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<NutriGradeDB>> | null = null;

/**
 * Initializes and returns the IndexedDB database instance.
 */
export function getDb(): Promise<IDBPDatabase<NutriGradeDB>> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is unavailable in SSR context.'));
  }

  if (!dbPromise) {
    dbPromise = openDB<NutriGradeDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 1. Create productsCache store
        if (!db.objectStoreNames.contains('productsCache')) {
          const productStore = db.createObjectStore('productsCache', { keyPath: 'id' });
          productStore.createIndex('barcode', 'barcode', { unique: false });
          productStore.createIndex('productName', 'productName', { unique: false });
          productStore.createIndex('brand', 'brand', { unique: false });
        }

        // 2. Create offlineQueue store
        if (!db.objectStoreNames.contains('offlineQueue')) {
          const queueStore = db.createObjectStore('offlineQueue', { keyPath: 'id' });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
          queueStore.createIndex('status', 'status', { unique: false });
        }
      },
    });
  }

  return dbPromise;
}

/**
 * Saves a food product analysis record into the IndexedDB local cache.
 */
export async function cacheProduct(product: {
  id?: string;
  barcode?: string;
  productName: string;
  brand: string;
  imageThumbUrl?: string;
  ingredients?: string[];
  rawData: RawNutritionData;
  analysis: AnalysisResult;
  keywords?: string[];
  timestamp?: number;
}): Promise<void> {
  try {
    const db = await getDb();
    const barcode = product.barcode || product.id || '';
    const nameLower = product.productName.toLowerCase();
    const brandLower = (product.brand || '').toLowerCase();

    const keywords = product.keywords || Array.from(
      new Set([
        ...nameLower.split(/\s+/),
        ...brandLower.split(/\s+/),
        barcode,
        ...(product.ingredients || []).map((i) => i.toLowerCase()),
      ])
    ).filter((k) => k.length > 1);

    const record: CachedProductRecord = {
      id: product.id || barcode || `prod_${Date.now()}`,
      barcode,
      productName: product.productName,
      brand: product.brand || 'Unknown Brand',
      imageThumbUrl: product.imageThumbUrl || '',
      keywords,
      ingredients: product.ingredients || [],
      rawData: product.rawData,
      analysis: product.analysis,
      timestamp: product.timestamp || Date.now(),
    };

    await db.put('productsCache', record);
  } catch (err) {
    console.warn('Failed to cache product in IndexedDB:', err);
  }
}

/**
 * Queries IndexedDB for a food product by exact barcode, ID, or keyword match.
 * Resolves product data instantly without network connection.
 */
export async function getCachedProduct(barcodeOrQuery: string): Promise<CachedProductRecord | null> {
  try {
    const db = await getDb();
    const clean = barcodeOrQuery.trim().toLowerCase();
    if (!clean) return null;

    // 1. Try direct ID get
    const directHit = await db.get('productsCache', clean);
    if (directHit) return directHit;

    // 2. Try exact barcode index search
    const barcodeHits = await db.getAllFromIndex('productsCache', 'barcode', clean);
    if (barcodeHits && barcodeHits.length > 0) {
      return barcodeHits[0];
    }

    // 3. Fallback: Search all cached products for matching keywords or title
    const allCached = await db.getAll('productsCache');
    const matched = allCached.find((item) => {
      if (item.barcode === clean || item.id === clean) return true;
      if (item.productName.toLowerCase().includes(clean)) return true;
      if (item.brand.toLowerCase().includes(clean)) return true;
      return item.keywords.some((kw) => kw.includes(clean) || clean.includes(kw));
    });

    return matched || null;
  } catch (err) {
    console.warn('Error querying IndexedDB offline product cache:', err);
    return null;
  }
}

/**
 * Pre-caches top common staple food items into IndexedDB on initial application load.
 */
export async function preloadTopProducts(): Promise<number> {
  try {
    const db = await getDb();
    const existingCount = await db.count('productsCache');

    // Only preload if cache is currently empty
    if (existingCount > 0) {
      return existingCount;
    }

    const STAPLE_PRODUCTS = [
      {
        barcode: '3017620422003',
        productName: 'Nutella Hazelnut Cocoa Spread',
        brand: 'Ferrero',
        ingredients: ['sugar', 'palm oil', 'hazelnuts', 'skimmed milk powder', 'fat-reduced cocoa', 'soy lecithin', 'vanillin'],
        raw: { calories: 539, total_fat: 30.9, saturated_fat: 10.6, trans_fat: 0, sugars: 56.3, added_sugars: 50.0, sodium_mg: 42, fiber: 0, protein: 6.3, serving_size_g: 100, is_per_100g: true },
      },
      {
        barcode: '5449000000996',
        productName: 'Coca-Cola Original Taste Soda',
        brand: 'Coca-Cola',
        ingredients: ['carbonated water', 'high fructose corn syrup', 'caramel color e150d', 'phosphoric acid', 'natural flavors', 'caffeine'],
        raw: { calories: 140, total_fat: 0, saturated_fat: 0, trans_fat: 0, sugars: 39.0, added_sugars: 39.0, sodium_mg: 45, fiber: 0, protein: 0, serving_size_g: 100, is_per_100g: true },
      },
      {
        barcode: '3075020040500',
        productName: 'Evian Natural Mineral Water',
        brand: 'Evian',
        ingredients: ['natural mineral water'],
        raw: { calories: 0, total_fat: 0, saturated_fat: 0, trans_fat: 0, sugars: 0, added_sugars: 0, sodium_mg: 7, fiber: 0, protein: 0, serving_size_g: 100, is_per_100g: true },
      },
      {
        barcode: '0070501020018',
        productName: 'Organic Rolled Oats',
        brand: 'Quaker',
        ingredients: ['whole grain rolled oats'],
        raw: { calories: 379, total_fat: 6.9, saturated_fat: 1.2, trans_fat: 0, sugars: 1.0, added_sugars: 0, sodium_mg: 2, fiber: 10.6, protein: 13.2, serving_size_g: 100, is_per_100g: true },
      },
      {
        barcode: '0011110001002',
        productName: 'Plain Greek Yogurt 0% Fat',
        brand: 'Chobani',
        ingredients: ['cultured nonfat milk', 'live active cultures'],
        raw: { calories: 59, total_fat: 0, saturated_fat: 0, trans_fat: 0, sugars: 3.6, added_sugars: 0, sodium_mg: 36, fiber: 0, protein: 10.0, serving_size_g: 100, is_per_100g: true },
      },
      {
        barcode: '0021130005009',
        productName: '100% Whole Wheat Bread',
        brand: 'Nature Own',
        ingredients: ['whole wheat flour', 'water', 'yeast', 'wheat gluten', 'cane sugar', 'soybean oil', 'sea salt'],
        raw: { calories: 247, total_fat: 3.4, saturated_fat: 0.6, trans_fat: 0, sugars: 4.2, added_sugars: 3.0, sodium_mg: 410, fiber: 6.8, protein: 11.5, serving_size_g: 100, is_per_100g: true },
      },
    ];

    for (const item of STAPLE_PRODUCTS) {
      const normalizedData = normalizeTo100g(item.raw);
      const nutriScore = calculateNutriScore(normalizedData);
      const novaGroup = detectNovaGroup(item.ingredients);
      const bioIntel = runBiologicalPipeline(item.ingredients, [], normalizedData.sugars_per_100g, normalizedData.fiber_per_100g);

      const analysis: AnalysisResult = {
        normalizedData,
        nutriScore,
        novaGroup,
        additives: [],
        healthWarnings: novaGroup === 4 ? ['Ultra-processed staple item'] : [],
        explanation: `Pre-loaded offline product record for "${item.productName}" (${item.brand}).`,
        ...bioIntel,
      };

      await cacheProduct({
        id: item.barcode,
        barcode: item.barcode,
        productName: item.productName,
        brand: item.brand,
        imageThumbUrl: '',
        ingredients: item.ingredients,
        rawData: item.raw,
        analysis,
      });
    }

    const finalCount = await db.count('productsCache');
    return finalCount;
  } catch (err) {
    console.warn('Failed to pre-load staple products into IndexedDB:', err);
    return 0;
  }
}

/**
 * Adds an un-resolved barcode or search query to the offline sync queue.
 */
export async function addToOfflineQueue(barcodeOrQuery: string): Promise<OfflineQueueEntry> {
  const db = await getDb();
  const entry: OfflineQueueEntry = {
    id: `queue_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    barcode: barcodeOrQuery.trim(),
    query: barcodeOrQuery.trim(),
    timestamp: Date.now(),
    status: 'pending',
  };

  await db.put('offlineQueue', entry);
  return entry;
}

/**
 * Retrieves all pending offline queue entries.
 */
export async function getOfflineQueue(): Promise<OfflineQueueEntry[]> {
  try {
    const db = await getDb();
    const all = await db.getAll('offlineQueue');
    return all.filter((item) => item.status === 'pending');
  } catch {
    return [];
  }
}

/**
 * Removes an entry from the offline sync queue.
 */
export async function removeFromOfflineQueue(id: string): Promise<void> {
  try {
    const db = await getDb();
    await db.delete('offlineQueue', id);
  } catch (err) {
    console.warn('Failed to remove item from offlineQueue:', err);
  }
}

/**
 * Syncs pending offline queue items with live Open Food Facts endpoints when online connection restores.
 */
export async function syncOfflineQueue(
  onSynced?: (count: number) => void
): Promise<number> {
  if (typeof window === 'undefined' || !navigator.onLine) return 0;

  try {
    const queue = await getOfflineQueue();
    if (queue.length === 0) return 0;

    let syncedCount = 0;

    for (const item of queue) {
      const term = item.barcode || item.query;
      if (!term) continue;

      try {
        const res = await fetch(`/api/search-products?q=${encodeURIComponent(term)}&page=1`);
        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) {
            await cacheProduct(data.products[0]);
          }
        }
        await removeFromOfflineQueue(item.id);
        syncedCount++;
      } catch (e) {
        console.warn(`Offline sync failed for queued item ${term}:`, e);
      }
    }

    if (syncedCount > 0 && onSynced) {
      onSynced(syncedCount);
    }

    return syncedCount;
  } catch (err) {
    console.warn('Error during offline queue sync:', err);
    return 0;
  }
}
