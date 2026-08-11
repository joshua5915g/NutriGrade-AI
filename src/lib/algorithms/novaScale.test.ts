import { describe, it, expect } from 'vitest';
import { detectNovaGroup } from './novaScale';

describe('NOVA Scale Algorithm', () => {
  it('should classify ingredients lists with no culinary or industrial additives as Group 1 (Unprocessed/Minimally processed)', () => {
    expect(detectNovaGroup([])).toBe(1);
    expect(detectNovaGroup(['milk'])).toBe(1);
    expect(detectNovaGroup(['rolled oats', 'wheat flour', 'water'])).toBe(1);
    expect(detectNovaGroup(['fresh apples', 'cinnamon'])).toBe(1);
  });

  it('should classify ingredients lists consisting purely of culinary ingredients as Group 2 (Culinary Ingredients)', () => {
    expect(detectNovaGroup(['salt'])).toBe(2);
    expect(detectNovaGroup(['olive oil'])).toBe(2);
    expect(detectNovaGroup(['butter', 'salt'])).toBe(2);
    expect(detectNovaGroup(['sugar'])).toBe(2);
  });

  it('should classify simple foods with added culinary ingredients as Group 3 (Processed)', () => {
    // Basic ingredient + culinary agent
    expect(detectNovaGroup(['peanuts', 'salt'])).toBe(3);
    expect(detectNovaGroup(['peaches', 'water', 'sugar'])).toBe(3);
    expect(detectNovaGroup(['sardines', 'olive oil', 'salt'])).toBe(3);
    expect(detectNovaGroup(['cabbage', 'vinegar', 'salt'])).toBe(3);
  });

  it('should classify lists containing industrial markers or additives as Group 4 (Ultra-processed)', () => {
    // Contains sweetener (sucralose)
    expect(detectNovaGroup(['water', 'lemon juice', 'sucralose'])).toBe(4);
    
    // Contains emulsifiers (E471 / soy lecithin)
    expect(detectNovaGroup(['milk', 'sugar', 'mono- and diglycerides of fatty acids'])).toBe(4);
    expect(detectNovaGroup(['chocolate liquor', 'cocoa butter', 'sugar', 'soy lecithin'])).toBe(4);
    expect(detectNovaGroup(['flour', 'water', 'E471'])).toBe(4);

    // Contains flavor enhancers (MSG / yeast extract)
    expect(detectNovaGroup(['potatoes', 'sunflower oil', 'salt', 'MSG'])).toBe(4);
    expect(detectNovaGroup(['dehydrated chicken', 'salt', 'yeast extract'])).toBe(4);

    // Contains industrial sugars (HFCS / maltodextrin)
    expect(detectNovaGroup(['carbonated water', 'high fructose corn syrup', 'caramel color'])).toBe(4);
    expect(detectNovaGroup(['whey protein', 'maltodextrin', 'cocoa powder'])).toBe(4);
    
    // Contains preservatives (sodium benzoate / potassium sorbate)
    expect(detectNovaGroup(['orange juice', 'potassium sorbate'])).toBe(4);

    // Case-insensitivity verification
    expect(detectNovaGroup(['Milk', 'HYDROGENATED VEGETABLE OIL'])).toBe(4);
  });
});
