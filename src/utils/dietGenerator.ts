import type {
    PantryItem,
    MacroTargets,
    Meal,
    MealItem,
    MealCategory
} from '../types';
import { MEAL_CATEGORIES } from '../types';

/**
 * Maximum portion sizes per meal to ensure human-realistic portions
 * Values in grams (or pieces for pz items)
 */
const MAX_PORTION_SIZES: Record<string, number> = {
    // Dairy
    'yogurt': 200,
    'latte': 250,
    'formaggio': 50,
    'mozzarella': 125,
    'ricotta': 100,

    // Proteins
    'pollo': 200,
    'tacchino': 200,
    'manzo': 180,
    'maiale': 180,
    'vitello': 180,
    'pesce': 200,
    'salmone': 180,
    'tonno': 150,
    'uova': 3, // pieces
    'uovo': 2,

    // Carbs (dry weight)
    'pasta': 120,
    'riso': 100,
    'pane': 80,
    'farro': 100,
    'orzo': 100,
    'quinoa': 80,
    'avena': 60,
    'cereali': 50,

    // Vegetables/Starches
    'patate': 250,
    'patata': 250,
    'verdura': 300,
    'insalata': 150,
    'pomodori': 200,
    'zucchine': 250,
    'broccoli': 200,
    'spinaci': 150,

    // Fruits (per piece or grams)
    'frutta': 200,
    'mela': 1,
    'banana': 1,
    'arancia': 1,
    'pera': 1,
    'kiwi': 2,

    // Nuts & Seeds
    'noci': 30,
    'mandorle': 30,
    'nocciole': 30,
    'arachidi': 40,

    // Fats
    'olio': 15,
    'burro': 15,

    // Default for unspecified items
    'default_g': 300,
    'default_pz': 3
};

/**
 * Get max portion for an item based on its name
 */
function getMaxPortion(name: string, unit: string): number {
    const nameLower = name.toLowerCase();

    for (const [key, maxValue] of Object.entries(MAX_PORTION_SIZES)) {
        if (nameLower.includes(key)) {
            return maxValue;
        }
    }

    return unit === 'pz' ? MAX_PORTION_SIZES['default_pz'] : MAX_PORTION_SIZES['default_g'];
}

/**
 * Round quantity based on unit type
 */
export function roundQuantity(quantity: number, unit: string): number {
    if (unit === 'pz') {
        return Math.max(1, Math.round(quantity));
    }
    return Math.round(quantity / 5) * 5;
}

/**
 * Calculate actual nutrition from a pantry item given quantity
 */
export function calculateActualNutrition(
    item: PantryItem,
    quantity: number
): MacroTargets {
    let grams = quantity;

    if (item.unit === 'pz') {
        grams = quantity * (item.pieceWeight || 100);
    }

    const multiplier = grams / 100;

    return {
        calories: Math.round(item.nutritionPer100g.calories * multiplier),
        protein: Math.round(item.nutritionPer100g.protein * multiplier * 10) / 10,
        carbs: Math.round(item.nutritionPer100g.carbs * multiplier * 10) / 10,
        fat: Math.round(item.nutritionPer100g.fat * multiplier * 10) / 10
    };
}

/**
 * Filter pantry items by category
 */
export function filterItemsByCategory(
    items: PantryItem[],
    category: MealCategory
): PantryItem[] {
    return items.filter(item =>
        item.categories.includes(category) && item.quantity > 0
    );
}

/**
 * Generate a recipe method based on ingredients
 */
function generateMethod(items: MealItem[], category: MealCategory): string {
    if (items.length === 0) return '';

    const itemNames = items.map(i => i.name.toLowerCase());

    if (category === 'Colazione') {
        if (itemNames.some(n => n.includes('uovo') || n.includes('uova'))) {
            return `Prepara le uova a piacere. Accompagna con ${itemNames.filter(n => !n.includes('uovo')).join(', ')}.`;
        }
        if (itemNames.some(n => n.includes('yogurt'))) {
            return `Versa lo yogurt in una ciotola e aggiungi ${itemNames.filter(n => !n.includes('yogurt')).join(', ')}.`;
        }
        return `Prepara la colazione con: ${itemNames.join(', ')}.`;
    }

    if (category === 'Pranzo' || category === 'Cena') {
        if (itemNames.some(n => n.includes('pasta') || n.includes('riso'))) {
            const carb = itemNames.find(n => n.includes('pasta') || n.includes('riso'));
            const others = itemNames.filter(n => n !== carb);
            return `Cuoci ${carb} in acqua salata. Condisci con ${others.join(', ')}.`;
        }
        if (itemNames.some(n => n.includes('pollo') || n.includes('carne') || n.includes('pesce'))) {
            const protein = itemNames.find(n => n.includes('pollo') || n.includes('carne') || n.includes('pesce'));
            const others = itemNames.filter(n => n !== protein);
            return `Cucina ${protein} in padella. Servi con ${others.join(', ')}.`;
        }
        return `Prepara il pasto combinando: ${itemNames.join(', ')}.`;
    }

    if (category.includes('Spuntino') || category === 'Post-Workout') {
        return `Snack veloce: ${itemNames.join(' + ')}.`;
    }

    return `Combina: ${itemNames.join(', ')}.`;
}

/**
 * Days of the week in Italian
 */
export const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'] as const;
export type DayOfWeek = typeof DAYS_OF_WEEK[number];

/**
 * Weekly plan structure
 */
export interface WeeklyPlan {
    days: Record<DayOfWeek, Meal[]>;
    totalNutrition: Record<DayOfWeek, MacroTargets>;
    warnings: string[];
    calorieGaps: Record<DayOfWeek, number>;
}

/**
 * Generate a single day's meal plan with human-realistic portions
 */
function generateDayPlan(
    virtualPantry: PantryItem[],
    dailyTargets: MacroTargets,
    isWorkoutDay: boolean
): { meals: Meal[]; totalNutrition: MacroTargets; calorieGap: number; usedItems: Map<string, number> } {
    const meals: Meal[] = [];
    const usedItems = new Map<string, number>();

    const mealDistribution: Record<MealCategory, number> = {
        'Colazione': 0.22,
        'Spuntino Mattina': 0.08,
        'Pranzo': 0.30,
        'Spuntino Pomeriggio': 0.08,
        'Cena': 0.27,
        'Post-Workout': isWorkoutDay ? 0.05 : 0
    };

    let accumulatedNutrition: MacroTargets = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    };

    for (const category of MEAL_CATEGORIES) {
        const targetRatio = mealDistribution[category];
        if (targetRatio === 0) continue;

        const mealTargets: MacroTargets = {
            calories: Math.round(dailyTargets.calories * targetRatio),
            protein: Math.round(dailyTargets.protein * targetRatio),
            carbs: Math.round(dailyTargets.carbs * targetRatio),
            fat: Math.round(dailyTargets.fat * targetRatio)
        };

        const availableItems = filterItemsByCategory(virtualPantry, category);

        if (availableItems.length === 0) continue;

        const mealItems: MealItem[] = [];
        let mealNutrition: MacroTargets = { calories: 0, protein: 0, carbs: 0, fat: 0 };

        // Sort by protein density
        const sortedItems = [...availableItems].sort((a, b) => {
            const proteinDensityA = a.nutritionPer100g.protein / Math.max(1, a.nutritionPer100g.calories);
            const proteinDensityB = b.nutritionPer100g.protein / Math.max(1, b.nutritionPer100g.calories);
            return proteinDensityB - proteinDensityA;
        });

        for (const item of sortedItems) {
            if (mealNutrition.calories >= mealTargets.calories * 0.85) break;

            const pantryIndex = virtualPantry.findIndex(p => p.id === item.id);
            if (pantryIndex === -1 || virtualPantry[pantryIndex].quantity <= 0) continue;

            const maxPortion = getMaxPortion(item.name, item.unit);
            const availableQty = virtualPantry[pantryIndex].quantity;

            // Calculate how much we'd ideally use
            const caloriesNeeded = mealTargets.calories - mealNutrition.calories;
            const caloriesPer100g = item.nutritionPer100g.calories || 100;

            let quantityToUse: number;

            if (item.unit === 'pz') {
                const pieceWeight = item.pieceWeight || 100;
                const caloriesPerPiece = (caloriesPer100g * pieceWeight) / 100;
                let piecesNeeded = Math.ceil(caloriesNeeded / caloriesPerPiece);

                // Cap by max portion and availability
                piecesNeeded = Math.min(piecesNeeded, maxPortion, availableQty);
                quantityToUse = Math.max(1, piecesNeeded);
            } else {
                let gramsNeeded = (caloriesNeeded / caloriesPer100g) * 100;

                // Cap by max portion and availability
                gramsNeeded = Math.min(gramsNeeded, maxPortion, availableQty);
                gramsNeeded = roundQuantity(gramsNeeded, item.unit);
                quantityToUse = Math.max(5, gramsNeeded);
            }

            if (quantityToUse <= 0) continue;

            const actualNutrition = calculateActualNutrition(item, quantityToUse);

            mealItems.push({
                pantryItemId: item.id,
                name: item.name,
                quantity: roundQuantity(quantityToUse, item.unit),
                unit: item.unit,
                nutrition: item.nutritionPer100g,
                actualNutrition
            });

            mealNutrition.calories += actualNutrition.calories;
            mealNutrition.protein += actualNutrition.protein;
            mealNutrition.carbs += actualNutrition.carbs;
            mealNutrition.fat += actualNutrition.fat;

            // Track used items for inventory deduction
            const currentUsed = usedItems.get(item.id) || 0;
            usedItems.set(item.id, currentUsed + quantityToUse);

            // Deduct from virtual pantry
            virtualPantry[pantryIndex].quantity -= quantityToUse;
        }

        if (mealItems.length > 0) {
            meals.push({
                category,
                items: mealItems,
                method: generateMethod(mealItems, category),
                totalNutrition: {
                    calories: Math.round(mealNutrition.calories),
                    protein: Math.round(mealNutrition.protein * 10) / 10,
                    carbs: Math.round(mealNutrition.carbs * 10) / 10,
                    fat: Math.round(mealNutrition.fat * 10) / 10
                },
                consumed: false
            });

            accumulatedNutrition.calories += mealNutrition.calories;
            accumulatedNutrition.protein += mealNutrition.protein;
            accumulatedNutrition.carbs += mealNutrition.carbs;
            accumulatedNutrition.fat += mealNutrition.fat;
        }
    }

    const calorieGap = Math.max(0, dailyTargets.calories - accumulatedNutrition.calories);

    return {
        meals,
        totalNutrition: {
            calories: Math.round(accumulatedNutrition.calories),
            protein: Math.round(accumulatedNutrition.protein * 10) / 10,
            carbs: Math.round(accumulatedNutrition.carbs * 10) / 10,
            fat: Math.round(accumulatedNutrition.fat * 10) / 10
        },
        calorieGap,
        usedItems
    };
}

/**
 * Generate a 7-day weekly meal plan with inventory awareness
 */
export function generateWeeklyPlan(
    pantryItems: PantryItem[],
    dailyTargets: MacroTargets,
    workoutDays: number = 0
): WeeklyPlan {
    const days: Record<DayOfWeek, Meal[]> = {} as Record<DayOfWeek, Meal[]>;
    const totalNutrition: Record<DayOfWeek, MacroTargets> = {} as Record<DayOfWeek, MacroTargets>;
    const calorieGaps: Record<DayOfWeek, number> = {} as Record<DayOfWeek, number>;
    const warnings: string[] = [];

    // Create a deep copy of pantry for virtual inventory
    let virtualPantry = pantryItems.map(item => ({ ...item }));

    for (let i = 0; i < DAYS_OF_WEEK.length; i++) {
        const day = DAYS_OF_WEEK[i];
        const isWorkoutDay = workoutDays > 0 && i < workoutDays;

        const result = generateDayPlan(virtualPantry, dailyTargets, isWorkoutDay);

        days[day] = result.meals;
        totalNutrition[day] = result.totalNutrition;
        calorieGaps[day] = result.calorieGap;

        // virtualPantry is already mutated by generateDayPlan
    }

    // Calculate total gaps
    const totalGap = Object.values(calorieGaps).reduce((sum, gap) => sum + gap, 0);
    if (totalGap > 500) {
        warnings.push(`Scorte insufficienti per la settimana. Mancano circa ${Math.round(totalGap)} kcal totali.`);
    }

    // Check for specific days with big gaps
    for (const [day, gap] of Object.entries(calorieGaps)) {
        if (gap > 300) {
            warnings.push(`${day}: Mancano ${Math.round(gap)} kcal - Aggiungi altri cibi in dispensa`);
        }
    }

    return {
        days,
        totalNutrition,
        warnings,
        calorieGaps
    };
}

/**
 * Legacy function for backward compatibility - generates single day plan
 */
export function generateMealPlan(
    pantryItems: PantryItem[],
    dailyTargets: MacroTargets,
    isWorkoutDay: boolean = false
): { meals: Meal[]; totalNutrition: MacroTargets; warnings: string[] } {
    const virtualPantry = pantryItems.map(item => ({ ...item }));
    const result = generateDayPlan(virtualPantry, dailyTargets, isWorkoutDay);

    const warnings: string[] = [];
    if (result.calorieGap > 200) {
        warnings.push(`Mancano ${Math.round(result.calorieGap)} kcal - Aggiungi altri cibi in dispensa`);
    }

    return {
        meals: result.meals,
        totalNutrition: result.totalNutrition,
        warnings
    };
}
