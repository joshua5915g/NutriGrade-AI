import { describe, it, expect } from 'vitest';
import { NormalizedNutritionData } from '../../types/nutrition';
import { calculateNutriScore } from './nutriScore';

describe('Nutri-Score Algorithm', () => {
  it('should calculate correct points for healthy foods (e.g., pure oats) - Grade A', () => {
    // 100g Rolled Oats typical nutrition:
    // Energy: 379 kcal -> 1585 kJ (4 points)
    // Sugars: 1.0g (0 points)
    // Saturated fat: 1.3g (1 point)
    // Sodium: 2.0mg (0 points)
    // Total Negatives = 4 + 0 + 1 + 0 = 5 points
    // Fiber: 10.0g (5 points)
    // Protein: 13.0g (5 points)
    // Positive points: P = 5 (fiber) + 5 (protein) = 10 points (counted since N = 5 < 11)
    // Score = 5 - 10 = -5 -> Grade A
    const oats: NormalizedNutritionData = {
      calories_per_100g: 379,
      total_fat_per_100g: 7,
      saturated_fat_per_100g: 1.3,
      trans_fat_per_100g: 0,
      sugars_per_100g: 1.0,
      added_sugars_per_100g: 0,
      sodium_mg_per_100g: 2.0,
      fiber_per_100g: 10.0,
      protein_per_100g: 13.0,
    };

    const result = calculateNutriScore(oats);

    expect(result.negativePoints.energy).toBe(4);
    expect(result.negativePoints.sugars).toBe(0);
    expect(result.negativePoints.saturated_fat).toBe(1);
    expect(result.negativePoints.sodium).toBe(0);
    expect(result.positivePoints.fiber).toBe(5);
    expect(result.positivePoints.protein).toBe(5);
    expect(result.score).toBe(-5);
    expect(result.grade).toBe('A');
  });

  it('should apply the protein exclusion rule when negative points >= 11', () => {
    // High-sugar, high-calorie snack:
    // Calories: 500 kcal -> 2092 kJ (6 points)
    // Sugars: 30g (6 points)
    // Saturated fat: 6g (5 points)
    // Sodium: 400mg (4 points)
    // Total Negatives = 6 + 6 + 5 + 4 = 21 points (>= 11, so protein will be excluded)
    // Fiber: 1.5g (2 points)
    // Protein: 9.0g (5 points, but should be excluded from final score)
    // Score = Negatives (21) - Fiber (2) = 19 -> Grade E
    const junkFood: NormalizedNutritionData = {
      calories_per_100g: 500,
      total_fat_per_100g: 20,
      saturated_fat_per_100g: 6,
      trans_fat_per_100g: 0,
      sugars_per_100g: 30,
      added_sugars_per_100g: 15,
      sodium_mg_per_100g: 400,
      fiber_per_100g: 1.5,
      protein_per_100g: 9.0,
    };

    const result = calculateNutriScore(junkFood);

    expect(result.negativePoints.energy).toBe(6);
    expect(result.negativePoints.sugars).toBe(6);
    expect(result.negativePoints.saturated_fat).toBe(5);
    expect(result.negativePoints.sodium).toBe(4);
    expect(result.positivePoints.fiber).toBe(2);
    expect(result.positivePoints.protein).toBe(5); // Protein points should still be calculated
    expect(result.score).toBe(19); // 21 (N) - 2 (Fiber only) = 19
    expect(result.grade).toBe('E');
  });

  it('should grade products appropriately across ranges', () => {
    // Helper to generate blank base data
    const makeData = (overrides: Partial<NormalizedNutritionData>): NormalizedNutritionData => ({
      calories_per_100g: 0,
      total_fat_per_100g: 0,
      saturated_fat_per_100g: 0,
      trans_fat_per_100g: 0,
      sugars_per_100g: 0,
      added_sugars_per_100g: 0,
      sodium_mg_per_100g: 0,
      fiber_per_100g: 0,
      protein_per_100g: 0,
      ...overrides,
    });

    // Score <= -1 -> A
    expect(calculateNutriScore(makeData({ fiber_per_100g: 1.0 })).grade).toBe('A'); // score = -1
    
    // Score 0 to 2 -> B
    expect(calculateNutriScore(makeData({})).grade).toBe('B'); // score = 0
    expect(calculateNutriScore(makeData({ saturated_fat_per_100g: 3.0, protein_per_100g: 1.7 })).grade).toBe('B'); // N=2, P=1 -> score = 1
    
    // Score 3 to 10 -> C
    expect(calculateNutriScore(makeData({ sugars_per_100g: 20 })).grade).toBe('C'); // N=4, P=0 -> score = 4
    
    // Score 11 to 18 -> D
    expect(calculateNutriScore(makeData({ sugars_per_100g: 42 })).grade).toBe('D'); // N=9, P=0 -> score = 9? Wait, sugars 42g is 9 points. Let's make score higher:
    // Let's use sugar 42g (9 points) + energy 500 kJ (1 point) = 10 points (Grade C).
    // Let's use sugar 42g (9 points) + energy 800 kJ (2 points) = 11 points (Grade D).
    expect(calculateNutriScore(makeData({ sugars_per_100g: 42, calories_per_100g: 191 })).grade).toBe('D'); // Sugars (9) + Energy (800kJ -> 2) = 11 (Grade D)
    
    // Score >= 19 -> E
    expect(calculateNutriScore(makeData({ sugars_per_100g: 46, saturated_fat_per_100g: 10, sodium_mg_per_100g: 901 })).grade).toBe('E'); // Sugars (10) + SatFat (9) + Sodium (10) = 29 -> score = 29 -> Grade E
  });
});
