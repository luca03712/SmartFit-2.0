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
import { generateMealPlan } from './utils/dietGenerator';

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
  const [consumedMeals, setConsumedMeals] = useLocalStorage<string[]>('smartfit_consumed', []);
  const [waterIntake, setWaterIntake] = useLocalStorage<number>('smartfit_water', 0);
  const [lastResetDate, setLastResetDate] = useLocalStorage<string>('smartfit_last_reset', '');

  // UI State
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Check if we need to reset daily tracking
  const today = new Date().toISOString().split('T')[0];
  if (lastResetDate !== today) {
    setConsumedMeals([]);
    setWaterIntake(0);
    setLastResetDate(today);
  }

  // Determine workout day
  const dayOfWeek = new Date().getDay();
  const workoutDays = profile.lifestyle.workoutFrequency;
  const isWorkoutDay = workoutDays > 0 && dayOfWeek > 0 && dayOfWeek <= workoutDays;

  // Generate meal plan
  const { meals } = useMemo(() => {
    if (pantryItems.length === 0 || !profile.onboardingComplete) {
      return { meals: [], totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }, warnings: [] };
    }
    return generateMealPlan(pantryItems, profile.targets, isWorkoutDay);
  }, [pantryItems, profile.targets, isWorkoutDay, profile.onboardingComplete]);

  // Calculate consumed nutrition from completed meals
  const consumedNutrition = useMemo<MacroTargets>(() => {
    const consumed = meals
      .filter(meal => consumedMeals.includes(meal.category))
      .reduce((acc, meal) => ({
        calories: acc.calories + meal.totalNutrition.calories,
        protein: acc.protein + meal.totalNutrition.protein,
        carbs: acc.carbs + meal.totalNutrition.carbs,
        fat: acc.fat + meal.totalNutrition.fat
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return consumed;
  }, [meals, consumedMeals]);

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

  const handleToggleMealConsumed = (category: MealCategory) => {
    setConsumedMeals(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
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
    setConsumedMeals([]);
    setWaterIntake(0);
    setLastResetDate('');
  };

  // Show onboarding if not complete
  if (!profile.onboardingComplete) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  // Render main app
  return (
    <div className="min-h-screen pb-20">
      {/* Current Tab Content */}
      {currentTab === 'dashboard' && (
        <Dashboard
          profile={profile}
          consumedNutrition={consumedNutrition}
          waterIntake={waterIntake}
          onAddWater={handleAddWater}
          meals={meals}
          consumedMeals={consumedMeals}
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
          isWorkoutDay={isWorkoutDay}
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

      {/* Bottom Navigation */}
      <Navigation
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />
    </div>
  );
}

export default App;
