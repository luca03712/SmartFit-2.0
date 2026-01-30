// Default weights for common food items when using 'pz' (pieces) unit
export const DEFAULT_PIECE_WEIGHTS: Record<string, number> = {
    // Uova e derivati
    'uovo': 55,
    'uova': 55,
    'albume': 33,
    'tuorlo': 17,

    // Frutta
    'mela': 150,
    'banana': 120,
    'arancia': 180,
    'pera': 160,
    'pesca': 150,
    'kiwi': 80,
    'mandarino': 70,
    'limone': 60,
    'fragola': 15,
    'ciliegia': 8,
    'albicocca': 40,
    'prugna': 50,
    'fico': 40,
    'melograno': 250,
    'avocado': 200,

    // Verdura
    'pomodoro': 120,
    'cetriolo': 200,
    'carota': 80,
    'zucchina': 200,
    'peperone': 150,
    'melanzana': 300,
    'patata': 150,
    'cipolla': 100,
    'aglio': 5,
    'fungo': 20,

    // Pane e prodotti da forno
    'fetta pane': 30,
    'fetta di pane': 30,
    'pane': 50,
    'panino': 80,
    'grissino': 10,
    'cracker': 8,
    'fetta biscottata': 10,
    'fetta wasa': 12,
    'wasa': 12,
    'galletta': 10,
    'galletta di riso': 10,

    // Proteine
    'fetta prosciutto': 20,
    'fetta di prosciutto': 20,
    'fetta bresaola': 15,
    'fetta di bresaola': 15,
    'fetta salame': 10,
    'würstel': 50,
    'hamburger': 100,
    'polpetta': 30,

    // Latticini
    'sottiletta': 20,
    'formaggino': 25,
    'mozzarella': 125,
    'yogurt': 125,

    // Snack e dolci
    'biscotto': 10,
    'barretta': 30,
    'barretta proteica': 60,
    'cioccolatino': 10,
    'quadretto cioccolato': 5,

    // Altri
    'cucchiaio olio': 10,
    'cucchiaio': 15,
    'cucchiaino': 5,
    'noce': 5,
    'mandorla': 1.2,
    'arachide': 1,
};

/**
 * Get the default weight for a piece of food
 * Returns undefined if not found
 */
export function getDefaultPieceWeight(name: string): number | undefined {
    const normalizedName = name.toLowerCase().trim();

    // Direct match
    if (DEFAULT_PIECE_WEIGHTS[normalizedName]) {
        return DEFAULT_PIECE_WEIGHTS[normalizedName];
    }

    // Partial match
    for (const [key, weight] of Object.entries(DEFAULT_PIECE_WEIGHTS)) {
        if (normalizedName.includes(key) || key.includes(normalizedName)) {
            return weight;
        }
    }

    return undefined;
}

/**
 * Get suggestions based on partial name
 */
export function getSuggestedWeights(name: string): Array<{ name: string; weight: number }> {
    const normalizedName = name.toLowerCase().trim();
    const suggestions: Array<{ name: string; weight: number }> = [];

    for (const [key, weight] of Object.entries(DEFAULT_PIECE_WEIGHTS)) {
        if (key.includes(normalizedName) || normalizedName.includes(key)) {
            suggestions.push({ name: key, weight });
        }
    }

    return suggestions.slice(0, 5);
}
