import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI SDK
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * POST /api/analyze-batch
 *
 * Accepts an image containing 1–4 packaged food items.
 * Vision AI detects each item, draws bounding boxes, and returns
 * per-item nutrition analysis structured JSON.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file uploaded.' },
        { status: 400 }
      );
    }

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit.' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported format. Multi-item scan requires JPEG or PNG.' },
        { status: 400 }
      );
    }

    // If no API key, return demo mock response
    if (!apiKey) {
      console.warn('GEMINI_API_KEY missing. Returning multi-item mock payload.');
      return NextResponse.json({
        success: true,
        source: 'mock_fallback',
        items: [
          {
            item_id: 'item_1',
            product_name: 'Organic Rolled Oats',
            bounding_box: [0.05, 0.02, 0.48, 0.48],
            nutrition: {
              calories: 379, total_fat: 7, saturated_fat: 1.3, trans_fat: 0,
              sugars: 1.0, added_sugars: 0, sodium_mg: 2.0,
              fiber: 10.0, protein: 13.0,
              serving_size_g: 100, is_per_100g: true,
            },
            ingredients: ['whole grain rolled oats'],
          },
          {
            item_id: 'item_2',
            product_name: 'Chocolate Milk Drink',
            bounding_box: [0.05, 0.52, 0.48, 0.98],
            nutrition: {
              calories: 420, total_fat: 3.5, saturated_fat: 2.2, trans_fat: 0,
              sugars: 34.0, added_sugars: 30.0, sodium_mg: 480.0,
              fiber: 0, protein: 3.0,
              serving_size_g: 100, is_per_100g: true,
            },
            ingredients: ['water', 'sugar', 'cocoa powder', 'corn syrup', 'carrageenan', 'soy lecithin', 'artificial flavor'],
          },
          {
            item_id: 'item_3',
            product_name: 'Greek Yogurt',
            bounding_box: [0.52, 0.02, 0.95, 0.48],
            nutrition: {
              calories: 97, total_fat: 5, saturated_fat: 3, trans_fat: 0,
              sugars: 4.0, added_sugars: 0, sodium_mg: 40.0,
              fiber: 0, protein: 9.0,
              serving_size_g: 100, is_per_100g: true,
            },
            ingredients: ['pasteurised milk', 'live yogurt cultures'],
          },
          {
            item_id: 'item_4',
            product_name: 'Instant Ramen Noodles',
            bounding_box: [0.52, 0.52, 0.95, 0.98],
            nutrition: {
              calories: 450, total_fat: 20, saturated_fat: 9, trans_fat: 0.5,
              sugars: 3.0, added_sugars: 1, sodium_mg: 1800.0,
              fiber: 1.5, protein: 9.0,
              serving_size_g: 100, is_per_100g: true,
            },
            ingredients: ['enriched wheat flour', 'palm oil', 'sodium chloride', 'monosodium glutamate', 'e621', 'sugar', 'soy sauce', 'e150d', 'tbhq'],
          },
        ],
      });
    }

    // Convert file to Base64
    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString('base64');

    // Multi-item Vision AI prompt
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const systemPrompt = `
You are an expert food packaging detection and nutrition analysis AI.

Analyze the provided image which contains 1 to 4 distinct packaged food products visible on a surface (e.g., table, shelf, countertop).

For EACH distinct food product visible in the image:
1. Identify the product name from its packaging.
2. Detect the bounding box of the product in the image using normalized coordinates [ymin, xmin, ymax, xmax] where 0.0 = top-left and 1.0 = bottom-right.
3. Read or estimate the nutrition facts if visible, otherwise estimate from the product type.
4. Extract ingredient list if visible.

Return ONLY a JSON object with this exact structure:
{
  "items": [
    {
      "item_id": "item_1",
      "product_name": string,
      "bounding_box": [ymin: number, xmin: number, ymax: number, xmax: number],
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
  ]
}

Rules:
- Detect between 1 and 4 items maximum.
- Bounding boxes must NOT overlap significantly.
- If nutrition facts are not visible on a product, estimate reasonable values based on the product type.
- Return an empty ingredients array [] if ingredients are not readable.
`;

    const result = await model.generateContent([
      systemPrompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      },
    ]);

    const responseText = result.response.text();
    const parsedJson = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      source: 'vision_ai',
      items: parsedJson.items || [],
    });
  } catch (error: any) {
    console.error('Batch Analysis API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during multi-item analysis.' },
      { status: 500 }
    );
  }
}
