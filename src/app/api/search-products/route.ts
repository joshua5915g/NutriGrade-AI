import { NextRequest, NextResponse } from 'next/server';
import { mapOffProductToSearchResult } from '../../../lib/services/openFoodFacts';
import { SearchProductResult } from '../../../types/nutrition';

export const dynamic = 'force-dynamic';

interface CacheEntry {
  timestamp: number;
  data: {
    success: boolean;
    query: string;
    page: number;
    total: number;
    products: SearchProductResult[];
  };
}

// 5-minute server-side in-memory cache for frequent queries
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 300;
const searchCache = new Map<string, CacheEntry>();

/**
 * Cleans expired cache entries when memory threshold is reached.
 */
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const pageParam = searchParams.get('page');
    const category = (searchParams.get('category') || '').trim();

    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);

    // Empty query returns empty results immediately
    if (!q) {
      return NextResponse.json({
        success: true,
        query: '',
        page,
        total: 0,
        products: [],
      });
    }

    const cacheKey = `q:${q.toLowerCase()}|p:${page}|c:${category.toLowerCase()}`;

    // 1. Server-side 5-minute cache check
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

    // 2. Build Open Food Facts Search API URL
    let offUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      q
    )}&search_simple=1&action=process&json=1&page_size=10&page=${page}`;

    if (category) {
      offUrl += `&tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(category)}`;
    }

    // 3. Query OFF API
    const res = await fetch(offUrl, {
      headers: {
        'User-Agent': 'NutriGradeAI - Nutritional Quality & Additive Analysis Engine - WebApp',
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`Open Food Facts API returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawProducts = data.products || [];

    // 4. Map returned products into our standard AnalysisResult shape
    const products: SearchProductResult[] = rawProducts
      .filter((p: any) => p && (p.product_name || p.product_name_en || p.brands))
      .map((p: any) => mapOffProductToSearchResult(p));

    const responsePayload = {
      success: true,
      query: q,
      page,
      total: typeof data.count === 'number' ? data.count : products.length,
      products,
    };

    // 5. Store in server-side cache
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
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to search products from Open Food Facts database.',
        products: [],
      },
      { status: 500 }
    );
  }
}
