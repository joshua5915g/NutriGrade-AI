import { describe, it, expect } from 'vitest';
import { RawNutritionData } from '../../types/nutrition';
import { normalizeTo100g, sodiumMgToSaltG, saltGToSodiumMg } from './normalization';

describe('Normalization Utilities', () => {
  describe('sodiumMgToSaltG', () => {
    it('should correctly convert sodium (mg) to salt (g)', () => {
      expect(sodiumMgToSaltG(400)).toBe(1);
      expect(sodiumMgToSaltG(0)).toBe(0);
      expect(sodiumMgToSaltG(100)).toBe(0.25);
    });
  });

  describe('saltGToSodiumMg', () => {
    it('should correctly convert salt (g) to sodium (mg)', () => {
      expect(saltGToSodiumMg(1)).toBe(400);
      expect(saltGToSodiumMg(0)).toBe(0);
      expect(saltGToSodiumMg(0.25)).toBe(100);
    });
  });

  describe('normalizeTo100g', () => {
    it('should return nutrition data as is if is_per_100g is true', () => {
      const rawData: RawNutritionData = {
        calories: 100,
        total_fat: 10,
        saturated_fat: 2,
        trans_fat: 0.1,
        sugars: 5,
        added_sugars: 1,
        sodium_mg: 200,
        fiber: 3,
        protein: 4,
        serving_size_g: 50, // Ignored since is_per_100g is true
        is_per_100g: true,
      };

      const normalized = normalizeTo100g(rawData);

      expect(normalized.calories_per_100g).toBe(100);
      expect(normalized.total_fat_per_100g).toBe(10);
      expect(normalized.saturated_fat_per_100g).toBe(2);
      expect(normalized.sodium_mg_per_100g).toBe(200);
    });

    it('should scale nutrition data based on serving size if is_per_100g is false', () => {
      const rawData: RawNutritionData = {
        calories: 120, // 120 kcal per 50g -> 240 per 100g
        total_fat: 5,   // 5g per 50g -> 10g per 100g
        saturated_fat: 1.5, // 1.5g per 50g -> 3g per 100g
        trans_fat: 0,
        sugars: 8,      // 8g per 50g -> 16g per 100g
        added_sugars: 2,
        sodium_mg: 150, // 150mg per 50g -> 300mg per 100g
        fiber: 1,       // 1g per 50g -> 2g per 100g
        protein: 2,     // 2g per 50g -> 4g per 100g
        serving_size_g: 50,
        is_per_100g: false,
      };

      const normalized = normalizeTo100g(rawData);

      expect(normalized.calories_per_100g).toBe(240);
      expect(normalized.total_fat_per_100g).toBe(10);
      expect(normalized.saturated_fat_per_100g).toBe(3);
      expect(normalized.sugars_per_100g).toBe(16);
      expect(normalized.sodium_mg_per_100g).toBe(300);
      expect(normalized.fiber_per_100g).toBe(2);
      expect(normalized.protein_per_100g).toBe(4);
    });

    it('should throw an error if is_per_100g is false but serving_size_g is missing, zero, or negative', () => {
      const rawDataInvalid: RawNutritionData = {
        calories: 100,
        total_fat: 5,
        saturated_fat: 1,
        trans_fat: 0,
        sugars: 5,
        added_sugars: 0,
        sodium_mg: 100,
        fiber: 1,
        protein: 1,
        serving_size_g: 0, // Invalid!
        is_per_100g: false,
      };

      expect(() => normalizeTo100g(rawDataInvalid)).toThrow(
        'Invalid raw nutrition data: serving_size_g must be greater than 0 when is_per_100g is false.'
      );
    });
  });
});
