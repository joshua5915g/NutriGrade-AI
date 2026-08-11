import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { rawNutritionSchema } from '../../../lib/validation/nutrition';
import { fetchByBarcode } from '../../../lib/services/openFoodFacts';

// Initialize Google Generative AI SDK
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const barcode = formData.get('barcode') as string | null;
    const file = formData.get('file') as File | null;

    // LAYER 1: Open Food Facts Barcode Lookup (<100ms response)
    if (barcode && barcode.trim().length >= 8) {
      const cleanBarcode = barcode.trim();
      const offResult = await fetchByBarcode(cleanBarcode);

      if (offResult) {
        return NextResponse.json({
          success: true,
          source: 'open_food_facts',
          productName: offResult.productName,
          barcode: offResult.barcode,
          nutrition: offResult.rawData,
          ingredients: offResult.ingredients,
        });
      }
    }

    // Ensure file is present for Vision AI Fallback
    if (!file) {
      return NextResponse.json(
        { error: 'No barcode query provided and no image file uploaded.' },
        { status: 400 }
      );
    }

    // Validate file size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit.' },
        { status: 400 }
      );
    }

    // Validate MIME type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload JPEG, PNG, or PDF.' },
        { status: 400 }
      );
    }

    // If Gemini API key is missing, return friendly mock response for local testing
    if (!apiKey) {
      console.warn('GEMINI_API_KEY missing. Returning pre-analyzed fallback payload.');
      return NextResponse.json({
        success: true,
        source: 'mock_fallback',
        productName: 'Organic Rolled Oats (Demo)',
        ingredients: ['whole grain rolled oats'],
        nutrition: {
          calories: 379,
          total_fat: 7,
          saturated_fat: 1.3,
          trans_fat: 0,
          sugars: 1.0,
          added_sugars: 0,
          sodium_mg: 2.0,
          fiber: 10.0,
          protein: 13.0,
          serving_size_g: 100,
          is_per_100g: true,
        },
      });
    }

    // Convert file to Base64 buffer for Multimodal Vision model
    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString('base64');

    // LAYER 2: Multimodal Gemini 1.5 Flash Vision AI OCR Pipeline
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const systemPrompt = `
You are an expert OCR & Nutritional Data Extraction AI. 
Analyze the provided food packaging label image and extract all facts.

Return ONLY a JSON object with this exact structure:
{
  "productName": string or "Unknown Product",
  "ingredients": string[] (translate foreign ingredient names into standard English names and E-numbers),
  "nutrition": {
    "calories": number (in kcal per serving or 100g),
    "total_fat": number (in grams),
    "saturated_fat": number (in grams),
    "trans_fat": number (in grams),
    "sugars": number (in grams),
    "added_sugars": number (in grams),
    "sodium_mg": number (in milligrams),
    "fiber": number (in grams),
    "protein": number (in grams),
    "serving_size_g": number (default to 100 if unspecified),
    "is_per_100g": boolean (true if label metrics are listed per 100g/100ml, false if per serving)
  }
}
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

    // Validate Vision AI JSON Output with Zod
    const validatedNutrition = rawNutritionSchema.parse(parsedJson.nutrition);

    return NextResponse.json({
      success: true,
      source: 'vision_ai',
      productName: parsedJson.productName || 'Parsed Packaging Label',
      ingredients: parsedJson.ingredients || [],
      nutrition: validatedNutrition,
    });
  } catch (error: any) {
    console.error('Label Analysis API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while parsing the label.' },
      { status: 500 }
    );
  }
}
