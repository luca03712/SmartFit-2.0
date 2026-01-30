import type {
    PantryItem,
    MacroTargets,
    Meal,
    MealItem,
    MealCategory
} from '../types';
import { MEAL_CATEGORIES } from '../types';

/**
 * Round quantity based on unit type
 * - g/ml: round to nearest 5
 * - pz: round to integer
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
    // For pieces, use pieceWeight or default to 100g
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

    // Category-specific templates
    if (category === 'Colazione') {
        if (itemNames.some(n => n.includes('uovo') || n.includes('uova'))) {
            return `Prepara le uova a piacere (strapazzate, alla coque o in padella). Accompagna con ${itemNames.filter(n => !n.includes('uovo')).join(', ')}.`;
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
            return `Cuoci ${carb} in acqua salata. Nel frattempo prepara il condimento con ${others.join(', ')}. Scola e condisci.`;
        }
        if (itemNames.some(n => n.includes('pollo') || n.includes('carne') || n.includes('pesce'))) {
            const protein = itemNames.find(n => n.includes('pollo') || n.includes('carne') || n.includes('pesce'));
            const others = itemNames.filter(n => n !== protein);
            return `Cucina ${protein} in padella con un filo d'olio. Servi con ${others.join(', ')}.`;
        }
        return `Prepara il pasto combinando: ${itemNames.join(', ')}.`;
    }

    if (category.includes('Spuntino') || category === 'Post-Workout') {
        return `Snack veloce: ${itemNames.join(' + ')}.`;
    }

    return `Combina: ${itemNames.join(', ')}.`;
}

/**
 * Simple greedy algorithm to generate a meal plan
 * Tries to hit macro targets using available pantry items
 */
export function generateMealPlan(
    pantryItems: PantryItem[],
    dailyTargets: MacroTargets,
    isWorkoutDay: boolean = false
): { meals: Meal[]; totalNutrition: MacroTargets; warnings: string[] } {
    const meals: Meal[] = [];
    const warnings: string[] = [];

    // Clone pantry for tracking remaining quantities
    const remainingPantry = pantryItems.map(item => ({ ...item }));

    // Meal distribution (percentage of daily calories)
    const mealDistribution: Record<MealCategory, number> = {
        'Colazione': 0.20,
        'Spuntino Mattina': 0.10,
        'Pranzo': 0.30,
        'Spuntino Pomeriggio': 0.10,
        'Cena': 0.25,
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

        const availableItems = filterItemsByCategory(remainingPantry, category);

        if (availableItems.length === 0) {
            warnings.push(`Nessun alimento disponibile per ${category}`);
            continue;
        }

        const mealItems: MealItem[] = [];
        let mealNutrition: MacroTargets = { calories: 0, protein: 0, carbs: 0, fat: 0 };

        // Greedy selection: prioritize by protein density
        const sortedItems = [...availableItems].sort((a, b) => {
            const proteinDensityA = a.nutritionPer100g.protein / a.nutritionPer100g.calories;
            const proteinDensityB = b.nutritionPer100g.protein / b.nutritionPer100g.calories;
            return proteinDensityB - proteinDensityA;
        });

        for (const item of sortedItems) {
            if (mealNutrition.calories >= mealTargets.calories * 0.9) break;

            const pantryIndex = remainingPantry.findIndex(p => p.id === item.id);
            if (pantryIndex === -1 || remainingPantry[pantryIndex].quantity <= 0) continue;

            // Calculate how much we need to reach targets
            const caloriesNeeded = mealTargets.calories - mealNutrition.calories;
            const caloriesPer100g = item.nutritionPer100g.calories || 100;

            let gramsNeeded: number;
            if (item.unit === 'pz') {
                const pieceWeight = item.pieceWeight || 100;
                const caloriesPerPiece = (caloriesPer100g * pieceWeight) / 100;
                const piecesNeeded = Math.ceil(caloriesNeeded / caloriesPerPiece);
                const piecesAvailable = remainingPantry[pantryIndex].quantity;
                const piecesToUse = Math.min(piecesNeeded, piecesAvailable, 3); // Max 3 pieces per meal
                gramsNeeded = piecesToUse * pieceWeight;
            } else {
                gramsNeeded = (caloriesNeeded / caloriesPer100g) * 100;
                const gramsAvailable = remainingPantry[pantryIndex].quantity;
                gramsNeeded = Math.min(gramsNeeded, gramsAvailable);
                gramsNeeded = roundQuantity(gramsNeeded, item.unit);
            }

            if (gramsNeeded <= 0) continue;

            const quantityToUse = item.unit === 'pz'
                ? Math.round(gramsNeeded / (item.pieceWeight || 100))
                : gramsNeeded;

            const actualNutrition = calculateActualNutrition(item, quantityToUse);

            mealItems.push({
                pantryItemId: item.id,
                name: item.name,
                quantity: roundQuantity(quantityToUse, item.unit),
                unit: item.unit,
                nutrition: item.nutritionPer100g,
                actualNutrition
            });

            // Update meal nutrition
            mealNutrition.calories += actualNutrition.calories;
            mealNutrition.protein += actualNutrition.protein;
            mealNutrition.carbs += actualNutrition.carbs;
            mealNutrition.fat += actualNutrition.fat;

            // Update remaining pantry
            remainingPantry[pantryIndex].quantity -= quantityToUse;
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

            // Accumulate nutrition
            accumulatedNutrition.calories += mealNutrition.calories;
            accumulatedNutrition.protein += mealNutrition.protein;
            accumulatedNutrition.carbs += mealNutrition.carbs;
            accumulatedNutrition.fat += mealNutrition.fat;
        }
    }

    // Check if we hit targets
    const calorieDeficit = dailyTargets.calories - accumulatedNutrition.calories;
    if (calorieDeficit > 200) {
        warnings.push(`Scorte insufficienti: mancano circa ${Math.round(calorieDeficit)} kcal per raggiungere il target.`);
    }

    return {
        meals,
        totalNutrition: {
            calories: Math.round(accumulatedNutrition.calories),
            protein: Math.round(accumulatedNutrition.protein * 10) / 10,
            carbs: Math.round(accumulatedNutrition.carbs * 10) / 10,
            fat: Math.round(accumulatedNutrition.fat * 10) / 10
        },
        warnings
    };
}
