import React from 'react';
import {
    Droplets,
    Plus,
    Dumbbell,
    Moon,
    Flame,
    Droplet
} from 'lucide-react';
import { CircularProgress } from '../ui/CircularProgress';
import { Button } from '../ui/Button';
import type { MacroTargets, UserProfile, Meal } from '../../types';

interface DashboardProps {
    profile: UserProfile;
    consumedNutrition: MacroTargets;
    waterIntake: number;
    onAddWater: () => void;
    meals: Meal[];
    consumedMeals: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({
    profile,
    consumedNutrition,
    waterIntake,
    onAddWater,
    meals,
    consumedMeals
}) => {
    const { targets } = profile;

    // Determine if it's a workout day based on frequency
    const dayOfWeek = new Date().getDay();
    const workoutDays = profile.lifestyle.workoutFrequency;
    const isWorkoutDay = workoutDays > 0 && dayOfWeek > 0 && dayOfWeek <= workoutDays;

    const waterTarget = 2500; // 2.5L target
    const waterPercentage = Math.min(100, (waterIntake / waterTarget) * 100);

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            {/* Header with greeting */}
            <div className="p-6 pb-4">
                <p className="text-slate-400 text-sm mb-1">
                    {new Date().toLocaleDateString('it-IT', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                    })}
                </p>
                <h1 className="text-2xl font-bold text-white">
                    Ciao! 👋
                </h1>

                {/* Workout status */}
                <div className={`
          inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full
          ${isWorkoutDay
                        ? 'bg-emerald-900/30 border border-emerald-700/50'
                        : 'bg-slate-800/50 border border-slate-700/50'
                    }
        `}>
                    {isWorkoutDay ? (
                        <>
                            <Dumbbell className="text-emerald-400" size={18} />
                            <span className="text-emerald-300 font-medium">Giorno di Allenamento</span>
                        </>
                    ) : (
                        <>
                            <Moon className="text-slate-400" size={18} />
                            <span className="text-slate-300 font-medium">Giorno di Riposo</span>
                        </>
                    )}
                </div>
            </div>

            {/* Main progress circles */}
            <div className="px-6 py-4">
                <div className="glass rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Flame className="text-indigo-400" size={20} />
                        Progressi di Oggi
                    </h2>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Calories */}
                        <div className="flex flex-col items-center">
                            <CircularProgress
                                value={consumedNutrition.calories}
                                max={targets.calories}
                                size={100}
                                strokeWidth={8}
                                color="#6366f1"
                                bgColor="rgba(99, 102, 241, 0.2)"
                                label="kcal"
                            />
                            <p className="mt-2 text-sm text-slate-400">
                                {targets.calories - consumedNutrition.calories} rimanenti
                            </p>
                        </div>

                        {/* Protein */}
                        <div className="flex flex-col items-center">
                            <CircularProgress
                                value={consumedNutrition.protein}
                                max={targets.protein}
                                size={100}
                                strokeWidth={8}
                                color="#10b981"
                                bgColor="rgba(16, 185, 129, 0.2)"
                                label="g pro"
                            />
                            <p className="mt-2 text-sm text-slate-400">
                                {Math.max(0, targets.protein - consumedNutrition.protein)}g rimanenti
                            </p>
                        </div>

                        {/* Carbs */}
                        <div className="flex flex-col items-center">
                            <CircularProgress
                                value={consumedNutrition.carbs}
                                max={targets.carbs}
                                size={100}
                                strokeWidth={8}
                                color="#f59e0b"
                                bgColor="rgba(245, 158, 11, 0.2)"
                                label="g carb"
                            />
                            <p className="mt-2 text-sm text-slate-400">
                                {Math.max(0, targets.carbs - consumedNutrition.carbs)}g rimanenti
                            </p>
                        </div>

                        {/* Fat */}
                        <div className="flex flex-col items-center">
                            <CircularProgress
                                value={consumedNutrition.fat}
                                max={targets.fat}
                                size={100}
                                strokeWidth={8}
                                color="#ef4444"
                                bgColor="rgba(239, 68, 68, 0.2)"
                                label="g fat"
                            />
                            <p className="mt-2 text-sm text-slate-400">
                                {Math.max(0, targets.fat - consumedNutrition.fat)}g rimanenti
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Water tracker */}
            <div className="px-6 py-4">
                <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Droplets className="text-cyan-400" size={20} />
                            Idratazione
                        </h2>
                        <span className="text-slate-400 text-sm">
                            {waterIntake}ml / {waterTarget}ml
                        </span>
                    </div>

                    {/* Water progress bar */}
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden mb-4">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${waterPercentage}%` }}
                        />
                    </div>

                    {/* Water buttons */}
                    <div className="flex gap-3">
                        <Button
                            onClick={onAddWater}
                            variant="secondary"
                            icon={<Plus size={18} />}
                            className="flex-1"
                        >
                            +250ml
                        </Button>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50">
                            <Droplet className="text-cyan-400" size={18} />
                            <span className="text-white font-medium">
                                {Math.floor(waterIntake / 250)} bicchieri
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Meals summary */}
            <div className="px-6 py-4 pb-24">
                <div className="glass rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Pasti Completati
                    </h2>

                    <div className="flex items-center gap-3">
                        <div className="text-4xl font-bold text-indigo-400">
                            {consumedMeals.length}
                        </div>
                        <div className="text-slate-400">
                            / {meals.length} pasti
                        </div>
                    </div>

                    {/* Mini progress */}
                    <div className="flex gap-2 mt-4">
                        {meals.map((meal) => (
                            <div
                                key={meal.category}
                                className={`
                  flex-1 h-2 rounded-full transition-all duration-300
                  ${consumedMeals.includes(meal.category)
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-700'
                                    }
                `}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
