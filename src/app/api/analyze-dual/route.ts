import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Zod schema for dual-image cross-verification output
const marketingClaimSchema = z.object({
  claim: z.string(),
  status: z.enum(['VERIFIED', 'MISLEADING', 'FALSE']),
  explanation: z.string(),
});

const dualAnalysisSchema = z.object({
  productName: z.string().optional().default('Unknown Product'),
  marketing_claims: z.array(marketingClaimSchema),
  nutrition: z.object({
    calories: z.number(),
    total_fat: z.number(),
    saturated_fat: z.number(),
    trans_fat: z.number(),
    sugars: z.number(),
    added_sugars: z.number(),
    sodium_mg: z.number(),
    fiber: z.number(),
    protein: z.number(),
    serving_size_g: z.number().default(100),
    is_per_100g: z.boolean().default(true),
  }),
  ingredients: z.array(z.string()).optional().default([]),
});

export type DualAnalysisResult = z.infer<typeof dualAnalysisSchema>;

const DUAL_VISION_SYSTEM_PROMPT = `
You are an expert food safety auditor and regulatory compliance analyst.
You are being provided TWO images of the SAME food product:

**IMAGE 1 (Front of Package):**
- Extract ALL visible marketing claims, health badges, and promotional text.
- Examples: "100% Natural", "Low Fat", "High Protein", "No Added Sugar", "Heart Healthy", "Whole Grain", "Sugar Free", "Zero Trans Fat", "Rich in Fiber", "Organic", "Non-GMO", "Gluten Free", "Light", "Diet".

**IMAGE 2 (Back of Package):**
- Extract the complete Nutrition Facts table with exact numeric values.
- Extract the full Ingredients list.
- Auto-detect whether the panel is per-serving or per-100g.

**CROSS-VERIFICATION AUDIT:**
For EVERY marketing claim found on the Front image, perform a regulatory cross-check against the actual Back nutrition data using these EU/FDA legal thresholds:
- "Low Sugar": Must be ≤ 5g/100g
- "Sugar Free": Must be ≤ 0.5g/100g
- "No Added Sugar": Added sugars must be 0g
- "Low Fat": Must be ≤ 3g/100g total fat
- "Fat Free": Must be ≤ 0.5g/100g total fat
- "Low Sodium" / "Low Salt": Must be ≤ 120mg/100g sodium
- "High Protein" / "Source of Protein": Protein must provide ≥ 12% of total energy
- "High Fiber" / "Source of Fiber": Must be ≥ 3g/100g
- "Natural" / "All Natural": Must not contain NOVA Group 4 ultra-processed markers (artificial colors, flavors, emulsifiers, sweeteners)
- "Organic": Check for presence of synthetic pesticide-related ingredients
- "Whole Grain": Check if refined flour appears before whole grain in ingredients

Assign each claim one of:
- **VERIFIED**: Claim is truthful and within legal thresholds.
- **MISLEADING**: Claim is technically deceptive or exaggerated based on actual data.
- **FALSE**: Claim is factually incorrect and contradicted by nutrition panel data.

Return ONLY valid JSON with this exact structure:
{
  "productName": string,
  "marketing_claims": [
    { "claim": string, "status": "VERIFIED" | "MISLEADING" | "FALSE", "explanation": string }
  ],
  "nutrition": {
    "calories": number,
    "total_fat": number,
    "saturated_fat": number,
    "trans_fat": number,
    "sugars": number,
    "added_sugars": number,
    "sodium_mg": number,
    "fiber": number,
    "protein": number,
    "serving_size_g": number,
    "is_per_100g": boolean
  },
  "ingredients": string[]
}
`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const frontFile = formData.get('frontImage') as File | null;
    const backFile = formData.get('backImage') as File | null;

    if (!frontFile || !backFile) {
      return NextResponse.json(
        { error: 'Both front and back images are required for dual-scan analysis.' },
        { status: 400 }
      );
    }

    // Validate sizes
    if (frontFile.size > 10 * 1024 * 1024 || backFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Each file must be under 10MB.' },
        { status: 400 }
      );
    }

    // Validate MIME types
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(frontFile.type) || !allowedTypes.includes(backFile.type)) {
      return NextResponse.json(
        { error: 'Unsupported file format. Upload JPEG, PNG, or PDF.' },
        { status: 400 }
      );
    }

    // If API key is missing, return a realistic mock for local testing
    if (!apiKey) {
      console.warn('GEMINI_API_KEY missing. Returning mock dual-analysis payload.');
      return NextResponse.json({
        success: true,
        source: 'mock_dual_fallback',
        data: {
          productName: 'Demo Chocolate Protein Bar',
          marketing_claims: [
            {
              claim: 'High Protein',
              status: 'VERIFIED',
              explanation: 'Protein provides 22% of total energy (above the 12% threshold).',
            },
            {
              claim: 'Low Sugar',
              status: 'MISLEADING',
              explanation: 'Product contains 8.5g sugar per 100g, exceeding the 5g/100g regulatory limit for "Low Sugar" claims.',
            },
            {
              claim: 'All Natural',
              status: 'FALSE',
              explanation: 'Ingredient list contains soy lecithin (E322) and artificial vanillin, classifying this as NOVA Group 3-4.',
            },
          ],
          nutrition: {
            calories: 380,
            total_fat: 14,
            saturated_fat: 6.5,
            trans_fat: 0,
            sugars: 8.5,
            added_sugars: 6.0,
            sodium_mg: 200,
            fiber: 4.5,
            protein: 21,
            serving_size_g: 100,
            is_per_100g: true,
          },
          ingredients: [
            'whey protein concentrate',
            'milk chocolate coating (sugar, cocoa butter, milk powder)',
            'chicory root fiber',
            'soy lecithin (E322)',
            'artificial vanillin',
            'palm oil',
          ],
        },
      });
    }

    // Convert both files to base64
    const frontBytes = await frontFile.arrayBuffer();
    const backBytes = await backFile.arrayBuffer();
    const frontBase64 = Buffer.from(frontBytes).toString('base64');
    const backBase64 = Buffer.from(backBytes).toString('base64');

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent([
      DUAL_VISION_SYSTEM_PROMPT,
      {
        inlineData: {
          data: frontBase64,
          mimeType: frontFile.type,
        },
      },
      {
        inlineData: {
          data: backBase64,
          mimeType: backFile.type,
        },
      },
    ]);

    const responseText = result.response.text();
    const parsedJson = JSON.parse(responseText);

    // Validate with Zod
    const validated = dualAnalysisSchema.parse(parsedJson);

    return NextResponse.json({
      success: true,
      source: 'vision_ai_dual',
      data: validated,
    });
  } catch (error: any) {
    console.error('Dual-scan API error:', error);
    return NextResponse.json(
      { error: error.message || 'Dual-scan analysis failed.' },
      { status: 500 }
    );
  }
}
