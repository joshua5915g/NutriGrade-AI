import { AnalysisResult } from './nutrition';

/**
 * UserGoals defines the customizable nutritional thresholds and objectives
 * set by the user (or recommended by default based on profile characteristics).
 */
export interface UserGoals {
  /** Target daily caloric intake */
  targetCaloriesPerDay?: number;
  
  /** Maximum daily allowance of sodium in milligrams */
  maxSodiumPerDayMg?: number;
  
  /** Maximum daily allowance of total sugar in grams */
  maxSugarPerDayG?: number;
  
  /** The user's target weight objective */
  weightGoal?: 'lose' | 'maintain' | 'gain' | 'none';
}

/**
 * UserProfile represents the core profile of the user, including
 * medical conditions and nutritional goals. This profile is referenced
 * during food analysis to generate personalized warnings and suitability scores.
 */
export interface UserProfile {
  /** Medical flags that dictate specific dietary restrictions and warnings */
  medicalFlags: {
    /** Whether the user has diabetes (flags high sugars and carbohydrate loads) */
    isDiabetic: boolean;
    
    /** Whether the user has hypertension (flags high sodium foods) */
    hasHypertension: boolean;
    
    /** Whether the user has celiac disease (flags gluten-containing ingredients) */
    isCeliac: boolean;
    
    /** Whether the user is actively on a low-sodium diet */
    lowSodiumDiet: boolean;
  };
  
  /** Personal target thresholds for dietary tracking */
  goals: UserGoals;
}

/**
 * PersonalizedAlert represents a medical or dietary warning specifically triggered
 * for the user based on their UserProfile medical flags or goals.
 */
export interface PersonalizedAlert {
  /** Severity level of the personalized warning */
  severity: 'low' | 'moderate' | 'high' | 'critical';
  
  /** Human-readable warning message detailing the concern */
  message: string;
  
  /** Category type of the alert */
  type: 'diabetes' | 'hypertension' | 'celiac' | 'general';
}

/**
 * PersonalizedAnalysis extends AnalysisResult to include personalized health warnings
 * and an overall suitability assessment for the user.
 */
export interface PersonalizedAnalysis extends AnalysisResult {
  /** Array of specific personalized warnings triggered for the user profile */
  personalizedAlerts: PersonalizedAlert[];
  
  /** Overall boolean suitability of the food item for the user */
  isSuitable: boolean;
}

