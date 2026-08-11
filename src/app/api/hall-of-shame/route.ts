import { NextRequest, NextResponse } from 'next/server';
import shameData from '../../../lib/data/shameFeed.json';

export interface ShameFeedItem {
  id: string;
  productName: string;
  frontClaim: string;
  actualGrade: 'A' | 'B' | 'C' | 'D' | 'E';
  actualDetails: string;
  discrepancyScore: number;
  upvotes: number;
  shares: number;
  submittedAt: string;
  backFacts?: string;
}

// In-memory feed state initialized with JSON seed
let memoryFeed: ShameFeedItem[] = [...(shameData as ShameFeedItem[])];

/**
 * GET /api/hall-of-shame
 * Returns all submitted greenwashing entries sorted by Discrepancy Score (descending)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get('sortBy') || 'discrepancy';

    const sorted = [...memoryFeed].sort((a, b) => {
      if (sortBy === 'upvotes') {
        return b.upvotes - a.upvotes;
      }
      return b.discrepancyScore - a.discrepancyScore;
    });

    return NextResponse.json({
      success: true,
      count: sorted.length,
      items: sorted,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Hall of Shame items.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hall-of-shame
 * Actions: 'upvote' | 'submit'
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, productName, frontClaim, actualGrade, actualDetails, discrepancyScore, backFacts } = body;

    if (action === 'upvote') {
      const item = memoryFeed.find((i) => i.id === id);
      if (item) {
        item.upvotes += 1;
        return NextResponse.json({ success: true, item });
      }
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (action === 'submit') {
      if (!productName || !frontClaim) {
        return NextResponse.json(
          { error: 'Product name and front claim required.' },
          { status: 400 }
        );
      }

      const newItem: ShameFeedItem = {
        id: `shame_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        productName,
        frontClaim,
        actualGrade: actualGrade || 'E',
        actualDetails: actualDetails || 'High Sugar & Processing',
        discrepancyScore: discrepancyScore || 90,
        upvotes: 1,
        shares: 0,
        submittedAt: new Date().toISOString(),
        backFacts: backFacts || 'Verified packaging cross-audit discrepancy.',
      };

      memoryFeed.unshift(newItem);
      return NextResponse.json({ success: true, item: newItem });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process request.' },
      { status: 500 }
    );
  }
}
