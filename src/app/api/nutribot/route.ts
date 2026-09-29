import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface NutriBotRequest {
  message: string;
  productContext?: {
    productName: string;
    brand?: string;
    grade: string;
    novaGroup: number;
    calories: number;
    sugars: number;
    sodiumMg: number;
    ingredients: string[];
    additives: string[];
    gutScore?: number;
    glycemicLoad?: number;
  };
  userProfile?: {
    isDiabetic?: boolean;
    hasHypertension?: boolean;
    isCeliac?: boolean;
    lowSodiumDiet?: boolean;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: NutriBotRequest = await req.json();
    const { message, productContext, userProfile } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = `You are "NutriBot", a friendly, clinical registered dietitian and food scientist AI assistant for NutriGrade AI.
You help consumers understand food packaging, additives, metabolic impact, and medical compatibility.
Keep your answers concise, practical, engaging, and evidence-based (2-4 short paragraphs maximum).
Always ground your answers in the active product context and user's health profile if provided.

Active Scanned Product:
${
  productContext
    ? `- Name: ${productContext.productName} (${productContext.brand || 'Unspecified brand'})
- Nutri-Score: Grade ${productContext.grade}
- NOVA Processing: NOVA Group ${productContext.novaGroup}
- Sugars: ${productContext.sugars}g / 100g
- Sodium: ${productContext.sodiumMg}mg / 100g
- Gut Microbiome Score: ${productContext.gutScore ?? 'N/A'}/100
- Ingredients: ${productContext.ingredients.join(', ')}
- Additives: ${productContext.additives.join(', ') || 'None identified'}`
    : 'No specific product currently selected.'
}

User Health Profile:
${
  userProfile
    ? `- Diabetic: ${userProfile.isDiabetic ? 'YES' : 'No'}
- Hypertension: ${userProfile.hasHypertension ? 'YES' : 'No'}
- Celiac / Gluten-Sensitive: ${userProfile.isCeliac ? 'YES' : 'No'}
- Low Sodium Target: ${userProfile.lowSodiumDiet ? 'YES' : 'No'}`
    : 'Standard healthy adult profile.'
}

Important Medical Rule: Provide evidence-based nutritional science and education. Mention that this is educational advice and not formal medical diagnosis.`;

      const response = await model.generateContent([
        { text: systemPrompt },
        { text: `User Question: "${message}"` },
      ]);

      const replyText = response.response.text();
      return NextResponse.json({ reply: replyText });
    }

    // Graceful Clinical Fallback if no API key is set
    const fallbackResponse = generateClinicalFallback(message, productContext, userProfile);
    return NextResponse.json({ reply: fallbackResponse });
  } catch (error: any) {
    console.error('NutriBot API Error:', error);
    return NextResponse.json(
      {
        reply:
          'I encountered a temporary connection issue. From a clinical perspective: check the ingredients for whole unprocessed foods (NOVA 1/2) and aim for less than 5g added sugars per serving!',
      },
      { status: 200 }
    );
  }
}

function generateClinicalFallback(
  q: string,
  prod?: NutriBotRequest['productContext'],
  user?: NutriBotRequest['userProfile']
): string {
  const query = q.toLowerCase();

  if (query.includes('diabet') || query.includes('sugar') || query.includes('glucose')) {
    if (prod && prod.sugars > 10) {
      return `For blood sugar control, **${prod.productName}** poses an elevated glycemic demand with **${prod.sugars}g of sugar per 100g**. With a Glycemic Load of ${prod.glycemicLoad || 15}, it will cause a faster spike in post-prandial glucose. Pairing it with prebiotic soluble fiber (like chia seeds or raw nuts) can blunt the glucose surge by ~30–40%.`;
    }
    return `For diabetes and insulin sensitivity, prioritize foods with low glycemic load (GL < 10) and intact dietary fiber (>3g/100g). Intact fiber slows carbohydrate enzymatic breakdown in the small intestine.`;
  }

  if (query.includes('gut') || query.includes('microbiome') || query.includes('ibs')) {
    if (prod && prod.additives.length > 0) {
      return `Regarding gut health: **${prod.productName}** has a Gut Microbiome Score of **${prod.gutScore || 65}/100**. It contains additives (${prod.additives.slice(0, 3).join(', ')}). Emulsifiers like polysorbate-80, carboxymethylcellulose, or carrageenan can thin the protective intestinal mucus layer and trigger mild gut dysbiosis in sensitive individuals.`;
    }
    return `For optimal gut microbiota, look for foods rich in fermentable polyphenols and dietary fiber (oats, legumes, berries) while avoiding synthetic thickeners, polysorbates, and artificial intense sweeteners.`;
  }

  if (query.includes('kid') || query.includes('child') || query.includes('toddler')) {
    return `According to the American Academy of Pediatrics (AAP), children under 2 should avoid all added sugars. For children ages 2–12, keep daily added sugar under 12g (approx 3 teaspoons) and completely avoid artificial azo dyes (Red 40, Yellow 5/6) which have been linked to attention hyperactivity.`;
  }

  if (query.includes('swap') || query.includes('substitute') || query.includes('better')) {
    return `To upgrade this item, look for a certified Grade A Nutri-Score alternative with NOVA 1 processing. For example, replacing sweetened commercial snacks with unflavored Greek yogurt, raw seeds, or whole rolled oats provides identical satiety with zero inflammatory solvent-extracted seed oils.`;
  }

  return `Based on nutritional science for **${prod?.productName || 'this food'}**: This product currently rates at **Nutri-Score ${prod?.grade || 'C'}** with **NOVA ${prod?.novaGroup || 3}**. Focus on balanced portion sizes, staying hydrated, and keeping cumulative daily added sugars below 25 grams. What specific ingredient or dietary goal would you like to explore further?`;
}
