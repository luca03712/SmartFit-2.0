// User Profile
export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';
export type SportType = 'gym' | 'crossfit' | 'martial_arts' | 'cardio' | 'none';
export type Goal = 'cut' | 'maintain' | 'bulk';
export type NutriScore = 'A' | 'B' | 'C' | 'D' | 'E';
export type Unit = 'g' | 'ml' | 'pz';

export interface Biometrics {
    age: number;
    weight: number;
    height: number;
    gender: Gender;
}

export interface Lifestyle {
    activityLevel: ActivityLevel;
    sportType: SportType;
    workoutFrequency: number;
    goal: Goal;
}

export interface MacroTargets {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface UserProfile {
    biometrics: Biometrics;
    lifestyle: Lifestyle;
    targets: MacroTargets;
    onboardingComplete: boolean;
}

// Pantry
export interface NutritionPer100g {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    salt: number;
    sugar: number;
}

export interface PantryItem {
    id: string;
    name: string;
    categories: string[];
    unit: Unit;
    quantity: number;
    nutritionPer100g: NutritionPer100g;
    nutriScore: NutriScore;
    pieceWeight?: number;
}

// Meal Categories
export const MEAL_CATEGORIES = [
    'Colazione',
    'Spuntino Mattina',
    'Pranzo',
    'Spuntino Pomeriggio',
    'Cena',
    'Post-Workout'
] as const;

export type MealCategory = typeof MEAL_CATEGORIES[number];

// Diet Plan
export interface MealItem {
    pantryItemId: string;
    name: string;
    quantity: number;
    unit: Unit;
    nutrition: NutritionPer100g;
    actualNutrition: MacroTargets;
}

export interface Meal {
    category: MealCategory;
    items: MealItem[];
    method: string;
    totalNutrition: MacroTargets;
    consumed: boolean;
}

export interface DailyPlan {
    date: string;
    meals: Meal[];
    totalNutrition: MacroTargets;
    waterIntake: number;
    isWorkoutDay: boolean;
}

// Tracking
export interface DailyTracking {
    date: string;
    consumedMeals: string[];
    waterIntake: number;
    notes: string;
}

// Daily consumed macros with automatic reset
export interface DailyConsumed {
    date: string;
    macros: MacroTargets;
}
