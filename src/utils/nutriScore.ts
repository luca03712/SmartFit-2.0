import type { NutritionPer100g, NutriScore } from '../types';

/**
 * Calculate Nutri-Score based on nutrition values per 100g
 * Simplified algorithm based on the official Nutri-Score methodology
 */
export function calculateNutriScore(nutrition: NutritionPer100g): NutriScore {
    // Negative points (bad nutrients)
    let negativePoints = 0;

    // Energy (kcal)
    if (nutrition.calories > 800) negativePoints += 10;
    else if (nutrition.calories > 720) negativePoints += 9;
    else if (nutrition.calories > 640) negativePoints += 8;
    else if (nutrition.calories > 560) negativePoints += 7;
    else if (nutrition.calories > 480) negativePoints += 6;
    else if (nutrition.calories > 400) negativePoints += 5;
    else if (nutrition.calories > 320) negativePoints += 4;
    else if (nutrition.calories > 240) negativePoints += 3;
    else if (nutrition.calories > 160) negativePoints += 2;
    else if (nutrition.calories > 80) negativePoints += 1;

    // Sugars (g)
    if (nutrition.sugar > 45) negativePoints += 10;
    else if (nutrition.sugar > 40) negativePoints += 9;
    else if (nutrition.sugar > 36) negativePoints += 8;
    else if (nutrition.sugar > 31) negativePoints += 7;
    else if (nutrition.sugar > 27) negativePoints += 6;
    else if (nutrition.sugar > 22.5) negativePoints += 5;
    else if (nutrition.sugar > 18) negativePoints += 4;
    else if (nutrition.sugar > 13.5) negativePoints += 3;
    else if (nutrition.sugar > 9) negativePoints += 2;
    else if (nutrition.sugar > 4.5) negativePoints += 1;

    // Saturated fat (estimated as 40% of total fat)
    const saturatedFat = nutrition.fat * 0.4;
    if (saturatedFat > 10) negativePoints += 10;
    else if (saturatedFat > 9) negativePoints += 9;
    else if (saturatedFat > 8) negativePoints += 8;
    else if (saturatedFat > 7) negativePoints += 7;
    else if (saturatedFat > 6) negativePoints += 6;
    else if (saturatedFat > 5) negativePoints += 5;
    else if (saturatedFat > 4) negativePoints += 4;
    else if (saturatedFat > 3) negativePoints += 3;
    else if (saturatedFat > 2) negativePoints += 2;
    else if (saturatedFat > 1) negativePoints += 1;

    // Salt (g)
    if (nutrition.salt > 2.4) negativePoints += 10;
    else if (nutrition.salt > 2.16) negativePoints += 9;
    else if (nutrition.salt > 1.92) negativePoints += 8;
    else if (nutrition.salt > 1.68) negativePoints += 7;
    else if (nutrition.salt > 1.44) negativePoints += 6;
    else if (nutrition.salt > 1.2) negativePoints += 5;
    else if (nutrition.salt > 0.96) negativePoints += 4;
    else if (nutrition.salt > 0.72) negativePoints += 3;
    else if (nutrition.salt > 0.48) negativePoints += 2;
    else if (nutrition.salt > 0.24) negativePoints += 1;

    // Positive points (good nutrients) - estimated based on protein content
    let positivePoints = 0;

    // Protein (g)
    if (nutrition.protein > 8) positivePoints += 5;
    else if (nutrition.protein > 6.4) positivePoints += 4;
    else if (nutrition.protein > 4.8) positivePoints += 3;
    else if (nutrition.protein > 3.2) positivePoints += 2;
    else if (nutrition.protein > 1.6) positivePoints += 1;

    // Final score
    const finalScore = negativePoints - positivePoints;

    // Convert to letter grade
    if (finalScore <= -1) return 'A';
    if (finalScore <= 2) return 'B';
    if (finalScore <= 10) return 'C';
    if (finalScore <= 18) return 'D';
    return 'E';
}

/**
 * Get color for Nutri-Score
 */
export function getNutriScoreColor(score: NutriScore): string {
    const colors: Record<NutriScore, string> = {
        'A': '#038141',
        'B': '#85bb2f',
        'C': '#fecb02',
        'D': '#ee8100',
        'E': '#e63e11'
    };
    return colors[score];
}

/**
 * Get background color for Nutri-Score
 */
export function getNutriScoreBgColor(score: NutriScore): string {
    const colors: Record<NutriScore, string> = {
        'A': 'rgba(3, 129, 65, 0.2)',
        'B': 'rgba(133, 187, 47, 0.2)',
        'C': 'rgba(254, 203, 2, 0.2)',
        'D': 'rgba(238, 129, 0, 0.2)',
        'E': 'rgba(230, 62, 17, 0.2)'
    };
    return colors[score];
}
