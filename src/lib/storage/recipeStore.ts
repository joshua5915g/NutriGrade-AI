import { MealIngredientItem, CompositeMealAnalysis } from '../algorithms/mealBuilderEngine';

export interface SavedRecipe {
  id: string;
  name: string;
  description?: string;
  servings: number;
  ingredients: MealIngredientItem[];
  createdAt: string;
}

const RECIPES_STORAGE_KEY = 'nutrigrade_saved_recipes';

export const STARTER_RECIPES: SavedRecipe[] = [
  {
    id: 'starter_power_bowl',
    name: 'Clinical High-Fiber Power Bowl',
    description: 'Gut-protective blend of organic oats, unsweetened almond milk, chia seeds, and fresh berries.',
    servings: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    ingredients: [
      {
        id: 'ing_oats',
        name: 'Organic Rolled Oats',
        brand: 'Nature Farm',
        grade: 'A',
        novaGroup: 1,
        portionGrams: 50,
        nutritionPer100g: {
          calories: 375,
          total_fat: 6.5,
          saturated_fat: 1.2,
          sugars: 1.0,
          sodium_mg: 5,
          fiber: 10.0,
          protein: 13.5,
        },
        glycemicIndex: 50,
      },
      {
        id: 'ing_almond_milk',
        name: 'Unsweetened Almond Milk',
        brand: 'PureNut',
        grade: 'B',
        novaGroup: 1,
        portionGrams: 200,
        nutritionPer100g: {
          calories: 15,
          total_fat: 1.2,
          saturated_fat: 0.1,
          sugars: 0.1,
          sodium_mg: 60,
          fiber: 0.5,
          protein: 0.6,
        },
        glycemicIndex: 25,
      },
      {
        id: 'ing_berries',
        name: 'Fresh Blueberries & Strawberries',
        brand: 'Fresh Orchard',
        grade: 'A',
        novaGroup: 1,
        portionGrams: 80,
        nutritionPer100g: {
          calories: 45,
          total_fat: 0.3,
          saturated_fat: 0.05,
          sugars: 7.5,
          sodium_mg: 1,
          fiber: 2.8,
          protein: 0.8,
        },
        glycemicIndex: 40,
      },
    ],
  },
  {
    id: 'starter_mediterranean_lunch',
    name: 'Mediterranean Protein Plate',
    description: 'Clean Greek yogurt, extra virgin olive oil, cucumber, and chickpeas.',
    servings: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    ingredients: [
      {
        id: 'ing_greek_yogurt',
        name: 'Authentic Plain Greek Yogurt',
        brand: 'Olympus Pure',
        grade: 'A',
        novaGroup: 1,
        portionGrams: 150,
        nutritionPer100g: {
          calories: 90,
          total_fat: 4.0,
          saturated_fat: 2.5,
          sugars: 3.5,
          sodium_mg: 45,
          fiber: 0,
          protein: 10.0,
        },
        glycemicIndex: 30,
      },
      {
        id: 'ing_chickpeas',
        name: 'Steamed Chickpeas',
        brand: 'Organic Legumes',
        grade: 'A',
        novaGroup: 1,
        portionGrams: 100,
        nutritionPer100g: {
          calories: 160,
          total_fat: 2.5,
          saturated_fat: 0.3,
          sugars: 2.0,
          sodium_mg: 30,
          fiber: 8.0,
          protein: 9.0,
        },
        glycemicIndex: 28,
      },
    ],
  },
];

export function getSavedRecipes(): SavedRecipe[] {
  if (typeof window === 'undefined') return STARTER_RECIPES;
  try {
    const raw = localStorage.getItem(RECIPES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(STARTER_RECIPES));
      return STARTER_RECIPES;
    }
    const parsed = JSON.parse(raw) as SavedRecipe[];
    return parsed.length > 0 ? parsed : STARTER_RECIPES;
  } catch (err) {
    console.error('Failed to read saved recipes:', err);
    return STARTER_RECIPES;
  }
}

export function saveRecipe(
  name: string,
  ingredients: MealIngredientItem[],
  servings: number = 1,
  description?: string
): SavedRecipe {
  const recipes = getSavedRecipes();
  const newRecipe: SavedRecipe = {
    id: `recipe_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || 'Custom Recipe',
    description,
    servings,
    ingredients,
    createdAt: new Date().toISOString(),
  };

  recipes.unshift(newRecipe);
  if (typeof window !== 'undefined') {
    localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
  }
  return newRecipe;
}

export function deleteRecipe(id: string): void {
  const recipes = getSavedRecipes().filter((r) => r.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
  }
}
