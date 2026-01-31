import { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { Navigation } from './components/navigation/Navigation';
import { Dashboard } from './components/dashboard/Dashboard';
import { Pantry } from './components/pantry/Pantry';
import { DietPlan } from './components/diet/DietPlan';
import { Settings } from './components/settings/Settings';
import type {
  UserProfile,
  PantryItem,
  MacroTargets,
  MealCategory,
  DailyConsumed
} from './types';
import { generateWeeklyPlan, DAYS_OF_WEEK, type DayOfWeek } from './utils/dietGenerator';

const DEFAULT_PROFILE: UserProfile = {
  biometrics: { age: 0, weight: 0, height: 0, gender: 'male' },
  lifestyle: { activityLevel: 'moderate', sportType: 'gym', workoutFrequency: 0, goal: 'maintain' },
  targets: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  onboardingComplete: false
};

function App() {
  // Persisted state
  const [profile, setProfile] = useLocalStorage<UserProfile>('smartfit_profile', DEFAULT_PROFILE);
  const [pantryItems, setPantryItems] = useLocalStorage<PantryItem[]>('smartfit_pantry', []);
  const [consumedMeals, setConsumedMeals] = useLocalStorage<Record<string, string[]>>('smartfit_consumed_weekly', {});
  const [waterIntake, setWaterIntake] = useLocalStorage<number>('smartfit_water', 0);
  const [lastResetDate, setLastResetDate] = useLocalStorage<string>('smartfit_last_reset', '');
  const [dailyConsumed, setDailyConsumed] = useLocalStorage<DailyConsumed>('smartfit_daily_consumed', {
    date: '',
    macros: { calories: 0, protein: 0, carbs: 0, fat: 0 }
  });

  // UI State
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Check if we need to reset daily tracking (water and consumed macros reset daily)
  const today = new Date().toISOString().split('T')[0];
  if (lastResetDate !== today) {
    setWaterIntake(0);
    setLastResetDate(today);
  }

  // Auto-reset consumed macros if date changes
  if (dailyConsumed.date !== today) {
    setDailyConsumed({
      date: today,
      macros: { calories: 0, protein: 0, carbs: 0, fat: 0 }
    });
  }

  // Get current day of week in Italian
  const dayIndex = new Date().getDay();
  const todayDay = DAYS_OF_WEEK[dayIndex === 0 ? 6 : dayIndex - 1]; // Adjust Sunday
  const todayConsumed = consumedMeals[todayDay] || [];

  // Generate weekly meal plan
  const weeklyPlan = useMemo(() => {
    if (pantryItems.length === 0 || !profile.onboardingComplete) {
      return null;
    }
    return generateWeeklyPlan(pantryItems, profile.targets, profile.lifestyle.workoutFrequency);
  }, [pantryItems, profile.targets, profile.lifestyle.workoutFrequency, profile.onboardingComplete]);

  // Use persisted consumed nutrition (no longer recalculating from meals)
  const consumedNutrition = dailyConsumed.macros;

  // Handlers
  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  const handleAddPantryItem = (item: PantryItem) => {
    setPantryItems(prev => [...prev, item]);
  };

  const handleUpdatePantryItem = (item: PantryItem) => {
    setPantryItems(prev => prev.map(p => p.id === item.id ? item : p));
  };

  const handleDeletePantryItem = (id: string) => {
    setPantryItems(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleMealConsumed = (day: DayOfWeek, category: MealCategory) => {
    if (!weeklyPlan) return;

    const dayMeals = weeklyPlan.days[day] || [];
    const meal = dayMeals.find(m => m.category === category);
    if (!meal) return;

    const isCurrentlyConsumed = (consumedMeals[day] || []).includes(category);

    // Update consumed meals list
    setConsumedMeals(prev => {
      const dayMealsList = prev[day] || [];
      if (isCurrentlyConsumed) {
        return { ...prev, [day]: dayMealsList.filter(c => c !== category) };
      }
      return { ...prev, [day]: [...dayMealsList, category] };
    });

    // Only update dailyConsumed if toggling today's meal
    if (day === todayDay) {
      setDailyConsumed(prev => {
        const newMacros = { ...prev.macros };

        if (isCurrentlyConsumed) {
          // Subtract meal macros
          newMacros.calories = Math.max(0, newMacros.calories - meal.totalNutrition.calories);
          newMacros.protein = Math.max(0, newMacros.protein - meal.totalNutrition.protein);
          newMacros.carbs = Math.max(0, newMacros.carbs - meal.totalNutrition.carbs);
          newMacros.fat = Math.max(0, newMacros.fat - meal.totalNutrition.fat);
        } else {
          // Add meal macros
          newMacros.calories += meal.totalNutrition.calories;
          newMacros.protein += meal.totalNutrition.protein;
          newMacros.carbs += meal.totalNutrition.carbs;
          newMacros.fat += meal.totalNutrition.fat;
        }

        return {
          date: today,
          macros: newMacros
        };
      });
    }
  };

  const handleAddWater = () => {
    setWaterIntake(prev => prev + 250);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  const handleResetApp = () => {
    setProfile(DEFAULT_PROFILE);
    setPantryItems([]);
    setConsumedMeals({});
    setWaterIntake(0);
    setLastResetDate('');
  };

  // Show onboarding if not complete
  if (!profile.onboardingComplete) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  const todayMeals = weeklyPlan?.days[todayDay] || [];

  // Render main app
  return (
    <div className="h-[100dvh] flex flex-col bg-slate-900 overflow-hidden">
      {/* Current Tab Content */}
      <main className="flex-1 overflow-y-auto overscroll-none">
        {currentTab === 'dashboard' && (
          <Dashboard
            profile={profile}
            consumedNutrition={consumedNutrition}
            waterIntake={waterIntake}
            onAddWater={handleAddWater}
            meals={todayMeals}
            consumedMeals={todayConsumed}
          />
        )}

        {currentTab === 'pantry' && (
          <Pantry
            items={pantryItems}
            onAddItem={handleAddPantryItem}
            onUpdateItem={handleUpdatePantryItem}
            onDeleteItem={handleDeletePantryItem}
          />
        )}

        {currentTab === 'diet' && (
          <DietPlan
            pantryItems={pantryItems}
            dailyTargets={profile.targets}
            workoutFrequency={profile.lifestyle.workoutFrequency}
            consumedMeals={consumedMeals}
            onToggleMealConsumed={handleToggleMealConsumed}
          />
        )}

        {currentTab === 'settings' && (
          <Settings
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onResetApp={handleResetApp}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <Navigation
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />
    </div>
  );
}

export default App;
