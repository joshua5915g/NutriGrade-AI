import { NextRequest, NextResponse } from 'next/server';
import { mapOffProductToSearchResult } from '../../../lib/services/openFoodFacts';
import { SearchProductResult } from '../../../types/nutrition';
import { SAMPLE_COMPARE_PRODUCTS } from '../../../lib/data/sampleFoods';

export const dynamic = 'force-dynamic';

interface CacheEntry {
  timestamp: number;
  data: {
    success: boolean;
    query: string;
    page: number;
    total: number;
    source: 'open_food_facts' | 'fallback_database';
    products: SearchProductResult[];
  };
}

// 5-minute server-side in-memory cache for frequent queries
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 300;
const searchCache = new Map<string, CacheEntry>();

function pruneCache() {
  const now = Date.now();
  for (const [key, entry] of searchCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      searchCache.delete(key);
    }
  }
  if (searchCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey) {
      searchCache.delete(oldestKey);
    }
  }
}

/**
 * Searches local sample and staple products when Open Food Facts is throttled, down, or returning 503.
 */
function searchLocalDatabase(query: string): SearchProductResult[] {
  const cleanQ = query.toLowerCase().trim();
  const sampleList = Object.values(SAMPLE_COMPARE_PRODUCTS);

  return sampleList
    .filter((item) => {
      const matchName = (item.name || '').toLowerCase().includes(cleanQ);
      const matchBrand = (item.brand || '').toLowerCase().includes(cleanQ);
      const matchIngredient = (item.ingredients || []).some((ing) => ing.toLowerCase().includes(cleanQ));
      return matchName || matchBrand || matchIngredient;
    })
    .map((item) => ({
      id: item.id,
      barcode: `sample_${item.id}`,
      productName: item.name,
      brand: item.brand || 'NutriGrade Curated',
      imageThumbUrl: item.imagePreview || '',
      nutriScoreGrade: item.analysis.nutriScore.grade,
      novaGroup: item.analysis.novaGroup,
      ingredients: item.ingredients || [],
      rawData: item.rawData || {
        calories: item.analysis.normalizedData.calories_per_100g,
        total_fat: item.analysis.normalizedData.total_fat_per_100g,
        saturated_fat: item.analysis.normalizedData.saturated_fat_per_100g,
        trans_fat: item.analysis.normalizedData.trans_fat_per_100g,
        sugars: item.analysis.normalizedData.sugars_per_100g,
        added_sugars: item.analysis.normalizedData.added_sugars_per_100g,
        sodium_mg: item.analysis.normalizedData.sodium_mg_per_100g,
        fiber: item.analysis.normalizedData.fiber_per_100g,
        protein: item.analysis.normalizedData.protein_per_100g,
        serving_size_g: 100,
        is_per_100g: true,
      },
      analysis: item.analysis,
    }));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const pageParam = searchParams.get('page');
    const category = (searchParams.get('category') || '').trim();

    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);

    if (!q) {
      return NextResponse.json({
        success: true,
        query: '',
        page,
        total: 0,
        source: 'fallback_database',
        products: [],
      });
    }

    const cacheKey = `q:${q.toLowerCase()}|p:${page}|c:${category.toLowerCase()}`;

    // 1. Server-side cache check
    if (searchCache.has(cacheKey)) {
      const cached = searchCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return NextResponse.json(cached.data, {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
            'X-Cache': 'HIT',
          },
        });
      } else {
        searchCache.delete(cacheKey);
      }
    }

    // 2. Query Open Food Facts Search API (v2 endpoint with fields filter)
    let products: SearchProductResult[] = [];
    let dataSource: 'open_food_facts' | 'fallback_database' = 'open_food_facts';
    let totalCount = 0;

    try {
      const offUrl = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(
        q
      )}&page_size=10&page=${page}&fields=code,_id,product_name,product_name_en,brands,brands_tags,brand_owner,nutriments,ingredients_text,ingredients_text_en,image_url,image_small_url,image_thumb_url,image_front_small_url,image_front_thumb_url,nutriscore_grade,nova_group,additives_tags${
        category ? `&categories_tags_en=${encodeURIComponent(category)}` : ''
      }`;

      const res = await fetch(offUrl, {
        headers: {
          'User-Agent': 'NutriGradeAI/1.0 (Web Nutritional Analysis Engine; contact: support@nutrigrade.ai)',
        },
        signal: AbortSignal.timeout(4000), // 4-second timeout to prevent stalling
      });

      if (res.ok) {
        const data = await res.json();
        const rawProducts = data.products || [];

        products = rawProducts
          .filter((p: any) => p && (p.product_name || p.product_name_en || p.brands))
          .map((p: any) => mapOffProductToSearchResult(p));

        totalCount = typeof data.count === 'number' ? data.count : products.length;
      } else {
        console.warn(`Open Food Facts API returned HTTP ${res.status}. Falling back to curated catalogue.`);
        products = searchLocalDatabase(q);
        dataSource = 'fallback_database';
        totalCount = products.length;
      }
    } catch (fetchErr) {
      console.warn('Open Food Facts API unreachable or timed out. Falling back to curated catalogue:', fetchErr);
      products = searchLocalDatabase(q);
      dataSource = 'fallback_database';
      totalCount = products.length;
    }

    // If external search returned 0 items, check if local fallback has matches
    if (products.length === 0) {
      const fallbackMatches = searchLocalDatabase(q);
      if (fallbackMatches.length > 0) {
        products = fallbackMatches;
        dataSource = 'fallback_database';
        totalCount = fallbackMatches.length;
      }
    }

    const responsePayload = {
      success: true,
      query: q,
      page,
      total: totalCount,
      source: dataSource,
      products,
    };

    pruneCache();
    searchCache.set(cacheKey, {
      timestamp: Date.now(),
      data: responsePayload,
    });

    return NextResponse.json(responsePayload, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        'X-Cache': 'MISS',
      },
    });
  } catch (error: any) {
    console.error('Search products API error:', error);
    // Even in error, return local database fallback instead of a breaking 500 error
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const fallbackResults = searchLocalDatabase(q);

    return NextResponse.json(
      {
        success: true,
        query: q,
        page: 1,
        total: fallbackResults.length,
        source: 'fallback_database',
        products: fallbackResults,
      },
      { status: 200 }
    );
  }
}
