import React, { useState } from 'react';
import {
    User,
    Scale,
    Ruler,
    Calendar,
    Activity,
    Dumbbell,
    Target,
    ChevronRight,
    ChevronLeft,
    Sparkles
} from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type {
    UserProfile,
    Biometrics,
    Lifestyle,
    Gender,
    ActivityLevel,
    SportType,
    Goal
} from '../../types';
import { calculateMacroTargets, getActivityLevelLabel, getSportTypeLabel, getGoalLabel } from '../../utils/tdeeCalculator';

interface OnboardingWizardProps {
    onComplete: (profile: UserProfile) => void;
}

const STEPS = [
    { id: 1, title: 'Dati Personali', icon: User },
    { id: 2, title: 'Stile di Vita', icon: Activity },
    { id: 3, title: 'Attività Sportiva', icon: Dumbbell },
    { id: 4, title: 'Obiettivi', icon: Target }
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [biometrics, setBiometrics] = useState<Biometrics>({
        age: 30,
        weight: 70,
        height: 175,
        gender: 'male'
    });
    const [lifestyle, setLifestyle] = useState<Lifestyle>({
        activityLevel: 'moderate',
        sportType: 'gym',
        workoutFrequency: 4,
        goal: 'maintain'
    });

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        } else {
            // Calculate targets and complete
            const targets = calculateMacroTargets(biometrics, lifestyle);
            onComplete({
                biometrics,
                lifestyle,
                targets,
                onboardingComplete: true
            });
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return biometrics.age > 0 && biometrics.weight > 0 && biometrics.height > 0;
            case 2:
                return true;
            case 3:
                return lifestyle.workoutFrequency >= 0;
            case 4:
                return true;
            default:
                return false;
        }
    };

    const renderProgressBar = () => (
        <div className="flex items-center gap-2 mb-8">
            {STEPS.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div
                        className={`
              flex items-center justify-center 
              w-10 h-10 rounded-full 
              transition-all duration-300
              ${currentStep >= step.id
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-700 text-slate-400'
                            }
            `}
                    >
                        <step.icon size={18} />
                    </div>
                    {index < STEPS.length - 1 && (
                        <div
                            className={`
                flex-1 h-1 rounded-full transition-all duration-300
                ${currentStep > step.id ? 'bg-indigo-600' : 'bg-slate-700'}
              `}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    const renderStep1 = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-2">Dati Personali</h2>
            <p className="text-slate-400 mb-6">Inserisci i tuoi dati per calcolare il fabbisogno calorico.</p>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Età"
                    type="number"
                    value={biometrics.age}
                    onChange={(e) => setBiometrics({ ...biometrics, age: Number(e.target.value) })}
                    icon={<Calendar size={18} />}
                    min={16}
                    max={100}
                />
                <Select
                    label="Sesso"
                    value={biometrics.gender}
                    onChange={(e) => setBiometrics({ ...biometrics, gender: e.target.value as Gender })}
                    options={[
                        { value: 'male', label: 'Uomo' },
                        { value: 'female', label: 'Donna' }
                    ]}
                />
            </div>

            <Input
                label="Peso (kg)"
                type="number"
                value={biometrics.weight}
                onChange={(e) => setBiometrics({ ...biometrics, weight: Number(e.target.value) })}
                icon={<Scale size={18} />}
                step="0.1"
                min={30}
                max={300}
            />

            <Input
                label="Altezza (cm)"
                type="number"
                value={biometrics.height}
                onChange={(e) => setBiometrics({ ...biometrics, height: Number(e.target.value) })}
                icon={<Ruler size={18} />}
                min={100}
                max={250}
            />
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-2">Stile di Vita</h2>
            <p className="text-slate-400 mb-6">Quanto sei attivo durante la giornata?</p>

            <div className="space-y-3">
                {(['sedentary', 'light', 'moderate', 'active'] as ActivityLevel[]).map(level => (
                    <button
                        key={level}
                        type="button"
                        onClick={() => setLifestyle({ ...lifestyle, activityLevel: level })}
                        className={`
              w-full p-4 rounded-xl text-left transition-all duration-200
              ${lifestyle.activityLevel === level
                                ? 'bg-indigo-600 border-transparent'
                                : 'bg-slate-800/50 border border-slate-600/50 hover:border-indigo-500'
                            }
            `}
                    >
                        <span className="font-medium text-white">{getActivityLevelLabel(level)}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-2">Attività Sportiva</h2>
            <p className="text-slate-400 mb-6">Che tipo di sport pratichi?</p>

            <div className="space-y-3">
                {(['gym', 'crossfit', 'martial_arts', 'cardio', 'none'] as SportType[]).map(sport => (
                    <button
                        key={sport}
                        type="button"
                        onClick={() => setLifestyle({ ...lifestyle, sportType: sport })}
                        className={`
              w-full p-4 rounded-xl text-left transition-all duration-200
              ${lifestyle.sportType === sport
                                ? 'bg-indigo-600 border-transparent'
                                : 'bg-slate-800/50 border border-slate-600/50 hover:border-indigo-500'
                            }
            `}
                    >
                        <span className="font-medium text-white">{getSportTypeLabel(sport)}</span>
                    </button>
                ))}
            </div>

            <Input
                label="Allenamenti a settimana"
                type="number"
                value={lifestyle.workoutFrequency}
                onChange={(e) => setLifestyle({ ...lifestyle, workoutFrequency: Number(e.target.value) })}
                icon={<Dumbbell size={18} />}
                min={0}
                max={14}
            />
        </div>
    );

    const renderStep4 = () => {
        const previewTargets = calculateMacroTargets(biometrics, lifestyle);

        return (
            <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-2">Il Tuo Obiettivo</h2>
                <p className="text-slate-400 mb-6">Cosa vuoi raggiungere?</p>

                <div className="space-y-3">
                    {(['cut', 'maintain', 'bulk'] as Goal[]).map(goal => (
                        <button
                            key={goal}
                            type="button"
                            onClick={() => setLifestyle({ ...lifestyle, goal })}
                            className={`
                w-full p-4 rounded-xl text-left transition-all duration-200
                ${lifestyle.goal === goal
                                    ? 'bg-indigo-600 border-transparent'
                                    : 'bg-slate-800/50 border border-slate-600/50 hover:border-indigo-500'
                                }
              `}
                        >
                            <span className="font-medium text-white">{getGoalLabel(goal)}</span>
                        </button>
                    ))}
                </div>

                {/* Preview */}
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="text-indigo-400" size={20} />
                        <h3 className="font-semibold text-white">I Tuoi Obiettivi Giornalieri</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-xl bg-slate-800/50">
                            <p className="text-2xl font-bold text-indigo-400">{previewTargets.calories}</p>
                            <p className="text-sm text-slate-400">kcal</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-slate-800/50">
                            <p className="text-2xl font-bold text-emerald-400">{previewTargets.protein}g</p>
                            <p className="text-sm text-slate-400">Proteine</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-slate-800/50">
                            <p className="text-2xl font-bold text-amber-400">{previewTargets.carbs}g</p>
                            <p className="text-sm text-slate-400">Carboidrati</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-slate-800/50">
                            <p className="text-2xl font-bold text-rose-400">{previewTargets.fat}g</p>
                            <p className="text-sm text-slate-400">Grassi</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col p-6">
            {/* Logo */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    SmartFit 2.0
                </h1>
                <p className="text-slate-500 text-sm mt-1">Il tuo coach nutrizionale</p>
            </div>

            {/* Progress */}
            {renderProgressBar()}

            {/* Step Content */}
            <div className="flex-1">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
            </div>

            {/* Navigation */}
            <div className="flex gap-4 mt-8">
                {currentStep > 1 && (
                    <Button
                        variant="secondary"
                        onClick={handleBack}
                        icon={<ChevronLeft size={18} />}
                        className="flex-1"
                    >
                        Indietro
                    </Button>
                )}
                <Button
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className="flex-1"
                    icon={currentStep === 4 ? <Sparkles size={18} /> : undefined}
                >
                    {currentStep === 4 ? 'Inizia!' : 'Avanti'}
                    {currentStep < 4 && <ChevronRight size={18} />}
                </Button>
            </div>
        </div>
    );
};
