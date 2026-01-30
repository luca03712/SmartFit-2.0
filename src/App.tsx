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
  MealCategory
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

  // UI State
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Check if we need to reset daily tracking (water resets daily)
  const today = new Date().toISOString().split('T')[0];
  if (lastResetDate !== today) {
    setWaterIntake(0);
    setLastResetDate(today);
    // Note: consumed meals persist for the week - user can manually reset
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

  // Calculate consumed nutrition for today
  const consumedNutrition = useMemo<MacroTargets>(() => {
    if (!weeklyPlan) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const todayMeals = weeklyPlan.days[todayDay] || [];
    const consumed = todayMeals
      .filter(meal => todayConsumed.includes(meal.category))
      .reduce((acc, meal) => ({
        calories: acc.calories + meal.totalNutrition.calories,
        protein: acc.protein + meal.totalNutrition.protein,
        carbs: acc.carbs + meal.totalNutrition.carbs,
        fat: acc.fat + meal.totalNutrition.fat
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return consumed;
  }, [weeklyPlan, todayDay, todayConsumed]);

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
    setConsumedMeals(prev => {
      const dayMeals = prev[day] || [];
      if (dayMeals.includes(category)) {
        return { ...prev, [day]: dayMeals.filter(c => c !== category) };
      }
      return { ...prev, [day]: [...dayMeals, category] };
    });
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
