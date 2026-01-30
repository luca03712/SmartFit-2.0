import React, { useState, useMemo } from 'react';
import {
    Sparkles,
    ChefHat,
    RefreshCw,
    AlertTriangle,
    Check,
    Clock,
    Utensils,
    AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import type {
    PantryItem,
    MacroTargets,
    MealCategory
} from '../../types';
import { generateWeeklyPlan, DAYS_OF_WEEK, type DayOfWeek } from '../../utils/dietGenerator';

interface DietPlanProps {
    pantryItems: PantryItem[];
    dailyTargets: MacroTargets;
    workoutFrequency: number;
    consumedMeals: Record<string, string[]>; // day -> consumed categories
    onToggleMealConsumed: (day: DayOfWeek, category: MealCategory) => void;
}

const MEAL_ICONS: Record<string, string> = {
    'Colazione': '🌅',
    'Spuntino Mattina': '🍎',
    'Pranzo': '🍝',
    'Spuntino Pomeriggio': '🥜',
    'Cena': '🌙',
    'Post-Workout': '💪'
};

export const DietPlan: React.FC<DietPlanProps> = ({
    pantryItems,
    dailyTargets,
    workoutFrequency,
    consumedMeals,
    onToggleMealConsumed
}) => {
    const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Lun');
    const [refreshKey, setRefreshKey] = useState(0);

    const weeklyPlan = useMemo(() => {
        return generateWeeklyPlan(pantryItems, dailyTargets, workoutFrequency);
    }, [pantryItems, dailyTargets, workoutFrequency, refreshKey]);

    const dayMeals = weeklyPlan.days[selectedDay] || [];
    const dayNutrition = weeklyPlan.totalNutrition[selectedDay] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const dayGap = weeklyPlan.calorieGaps[selectedDay] || 0;
    const dayConsumed = consumedMeals[selectedDay] || [];

    const handleRegenerate = () => {
        setRefreshKey(prev => prev + 1);
    };

    if (pantryItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <ChefHat className="w-20 h-20 text-slate-600 mb-6" />
                <h2 className="text-xl font-semibold text-white mb-2">
                    Dispensa Vuota
                </h2>
                <p className="text-slate-400 mb-6">
                    Aggiungi degli alimenti alla dispensa per generare il piano settimanale
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="text-indigo-400" />
                        Piano Settimanale
                    </h1>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRegenerate}
                        icon={<RefreshCw size={16} />}
                    >
                        Rigenera
                    </Button>
                </div>

                {/* Day Selector */}
                <div className="flex gap-1 overflow-x-auto pb-2">
                    {DAYS_OF_WEEK.map((day) => {
                        const isSelected = selectedDay === day;
                        const gap = weeklyPlan.calorieGaps[day] || 0;
                        const hasGap = gap > 200;

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`
                  flex-1 min-w-[48px] py-2 px-3 rounded-xl
                  font-medium text-sm transition-all duration-200
                  ${isSelected
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                                    }
                  ${hasGap && !isSelected ? 'border border-amber-600/50' : ''}
                `}
                            >
                                {day}
                                {hasGap && !isSelected && (
                                    <span className="block text-[10px] text-amber-400">!</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Global Warnings */}
                {weeklyPlan.warnings.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-900/30 border border-amber-700/50">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-200">
                                {weeklyPlan.warnings.slice(0, 2).map((w, i) => (
                                    <p key={i}>{w}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Day Totals Summary */}
                <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-slate-800/50 mt-3">
                    <div className="text-center">
                        <p className="text-lg font-bold text-indigo-400">{dayNutrition.calories}</p>
                        <p className="text-xs text-slate-500">/{dailyTargets.calories} kcal</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-emerald-400">{dayNutrition.protein}g</p>
                        <p className="text-xs text-slate-500">/{dailyTargets.protein}g pro</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-amber-400">{dayNutrition.carbs}g</p>
                        <p className="text-xs text-slate-500">/{dailyTargets.carbs}g carb</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-rose-400">{dayNutrition.fat}g</p>
                        <p className="text-xs text-slate-500">/{dailyTargets.fat}g fat</p>
                    </div>
                </div>

                {/* Calorie Gap Warning for Selected Day */}
                {dayGap > 100 && (
                    <div className="mt-3 p-3 rounded-xl bg-orange-900/30 border border-orange-700/50 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-400 shrink-0" />
                        <div className="text-sm">
                            <p className="text-orange-200 font-medium">
                                Mancano {Math.round(dayGap)} kcal
                            </p>
                            <p className="text-orange-300/70 text-xs">
                                Aggiungi altri cibi in dispensa per completare il piano
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Meals list */}
            <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
                {dayMeals.map(meal => {
                    const isConsumed = dayConsumed.includes(meal.category);

                    return (
                        <div
                            key={meal.category}
                            className={`
                glass rounded-xl overflow-hidden
                transition-all duration-300
                ${isConsumed ? 'opacity-60' : ''}
              `}
                        >
                            {/* Meal header */}
                            <button
                                onClick={() => onToggleMealConsumed(selectedDay, meal.category)}
                                className="w-full p-4 flex items-center gap-3 hover:bg-slate-700/30 transition-colors"
                            >
                                <div className="text-2xl">{MEAL_ICONS[meal.category] || '🍽️'}</div>
                                <div className="flex-1 text-left">
                                    <h3 className="font-semibold text-white">{meal.category}</h3>
                                    <p className="text-sm text-slate-400">
                                        {meal.totalNutrition.calories} kcal · {meal.totalNutrition.protein}g pro
                                    </p>
                                </div>
                                <div
                                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    transition-all duration-200
                    ${isConsumed
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-700 text-slate-400'
                                        }
                  `}
                                >
                                    {isConsumed ? <Check size={18} /> : <Clock size={18} />}
                                </div>
                            </button>

                            {/* Meal items */}
                            <div className="px-4 pb-4 space-y-2">
                                {meal.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50"
                                    >
                                        <Utensils size={16} className="text-slate-500 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{item.name}</p>
                                            <p className="text-sm text-slate-400">
                                                {item.quantity} {item.unit}
                                                {item.unit === 'pz' && item.quantity > 1 && ' pezzi'}
                                            </p>
                                        </div>
                                        <div className="text-right text-sm">
                                            <p className="text-slate-300">{item.actualNutrition.calories} kcal</p>
                                            <p className="text-slate-500">{item.actualNutrition.protein}g pro</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Method */}
                                {meal.method && (
                                    <div className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-700/30">
                                        <p className="text-sm text-indigo-200 flex items-start gap-2">
                                            <ChefHat size={16} className="shrink-0 mt-0.5" />
                                            {meal.method}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {dayMeals.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
                        <p className="text-slate-400">
                            Inventario insufficiente per {selectedDay}.
                            <br />
                            Aggiungi più varietà alla dispensa.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
