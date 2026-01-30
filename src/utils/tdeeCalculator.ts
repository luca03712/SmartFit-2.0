import type { Biometrics, Lifestyle, MacroTargets } from '../types';

// Activity level multipliers
const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725
};

// Goal calorie adjustments
const GOAL_ADJUSTMENTS = {
    cut: -500,
    maintain: 0,
    bulk: 300
};

/**
 * Calculate BMR using Mifflin-St Jeor Formula
 * Men: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
 * Women: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
 */
export function calculateBMR(biometrics: Biometrics): number {
    const { weight, height, age, gender } = biometrics;
    const baseBMR = 10 * weight + 6.25 * height - 5 * age;
    return gender === 'male' ? baseBMR + 5 : baseBMR - 161;
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export function calculateTDEE(biometrics: Biometrics, lifestyle: Lifestyle): number {
    const bmr = calculateBMR(biometrics);
    const activityMultiplier = ACTIVITY_MULTIPLIERS[lifestyle.activityLevel];
    const baseTDEE = bmr * activityMultiplier;

    // Add extra calories for workout days (rough average per week)
    const workoutCaloriesPerWeek = lifestyle.workoutFrequency * 300;
    const dailyWorkoutBonus = workoutCaloriesPerWeek / 7;

    return baseTDEE + dailyWorkoutBonus;
}

/**
 * Calculate daily calorie target based on goal
 */
export function calculateCalorieTarget(biometrics: Biometrics, lifestyle: Lifestyle): number {
    const tdee = calculateTDEE(biometrics, lifestyle);
    const goalAdjustment = GOAL_ADJUSTMENTS[lifestyle.goal];
    return Math.round(tdee + goalAdjustment);
}

/**
 * Calculate macro targets based on calories and sport type
 */
export function calculateMacroTargets(
    biometrics: Biometrics,
    lifestyle: Lifestyle
): MacroTargets {
    const calories = calculateCalorieTarget(biometrics, lifestyle);
    const { weight } = biometrics;
    const { sportType, goal } = lifestyle;

    // Protein calculation (g per kg of body weight)
    let proteinPerKg = 1.6; // Base for active individuals

    // Sport-based protein adjustment
    if (sportType === 'gym' || sportType === 'crossfit') {
        proteinPerKg = goal === 'bulk' ? 2.2 : goal === 'cut' ? 2.4 : 2.0;
    } else if (sportType === 'martial_arts') {
        proteinPerKg = 2.0;
    } else if (sportType === 'cardio') {
        proteinPerKg = 1.4;
    } else if (sportType === 'none') {
        proteinPerKg = 1.2;
    }

    const protein = Math.round(weight * proteinPerKg);
    const proteinCalories = protein * 4;

    // Fat: 25-30% of calories
    const fatPercentage = goal === 'cut' ? 0.25 : 0.28;
    const fatCalories = calories * fatPercentage;
    const fat = Math.round(fatCalories / 9);

    // Carbs: remaining calories
    const carbCalories = calories - proteinCalories - fatCalories;
    const carbs = Math.round(carbCalories / 4);

    return {
        calories,
        protein,
        carbs,
        fat
    };
}

/**
 * Format activity level to Italian label
 */
export function getActivityLevelLabel(level: string): string {
    const labels: Record<string, string> = {
        sedentary: 'Sedentario (ufficio)',
        light: 'Leggero (1-2 volte/sett)',
        moderate: 'Moderato (3-4 volte/sett)',
        active: 'Attivo (5+ volte/sett)'
    };
    return labels[level] || level;
}

/**
 * Format sport type to Italian label
 */
export function getSportTypeLabel(sport: string): string {
    const labels: Record<string, string> = {
        gym: 'Palestra / Bodybuilding',
        crossfit: 'CrossFit / Funzionale',
        martial_arts: 'Arti Marziali',
        cardio: 'Cardio / Running',
        none: 'Nessuno sport specifico'
    };
    return labels[sport] || sport;
}

/**
 * Format goal to Italian label
 */
export function getGoalLabel(goal: string): string {
    const labels: Record<string, string> = {
        cut: 'Definizione (-500 kcal)',
        maintain: 'Mantenimento',
        bulk: 'Massa (+300 kcal)'
    };
    return labels[goal] || goal;
}
