import { z } from 'zod';

/**
 * Zod validation schema representing RawNutritionData.
 * Validates that all nutritional properties are non-negative numbers and types match.
 */
export const rawNutritionSchema = z.object({
  calories: z
    .number({ required_error: 'Calories are required' })
    .nonnegative('Calories cannot be negative'),
  total_fat: z
    .number({ required_error: 'Total fat is required' })
    .nonnegative('Total fat cannot be negative'),
  saturated_fat: z
    .number({ required_error: 'Saturated fat is required' })
    .nonnegative('Saturated fat cannot be negative'),
  trans_fat: z
    .number({ required_error: 'Trans fat is required' })
    .nonnegative('Trans fat cannot be negative'),
  sugars: z
    .number({ required_error: 'Sugars are required' })
    .nonnegative('Sugars cannot be negative'),
  added_sugars: z
    .number({ required_error: 'Added sugars is required' })
    .nonnegative('Added sugars cannot be negative'),
  sodium_mg: z
    .number({ required_error: 'Sodium (mg) is required' })
    .nonnegative('Sodium cannot be negative'),
  fiber: z
    .number({ required_error: 'Fiber is required' })
    .nonnegative('Fiber cannot be negative'),
  protein: z
    .number({ required_error: 'Protein is required' })
    .nonnegative('Protein cannot be negative'),
  serving_size_g: z
    .number({ required_error: 'Serving size is required' })
    .positive('Serving size must be greater than 0'),
  is_per_100g: z.boolean({ required_error: 'is_per_100g is required' }),
});

/**
 * Zod validation schema for the entire labels parser AI output.
 * Ensures the response holds a valid nutrition object and an array of ingredients.
 */
export const labelAnalysisSchema = z.object({
  nutrition: rawNutritionSchema,
  ingredients: z
    .array(z.string().min(1, 'Ingredient name cannot be empty'), {
      required_error: 'Ingredients list is required',
    })
    .min(1, 'At least one ingredient is required'),
});

// Export TypeScript types inferred from schemas
export type RawNutritionSchemaInput = z.infer<typeof rawNutritionSchema>;
export type LabelAnalysisSchemaInput = z.infer<typeof labelAnalysisSchema>;
