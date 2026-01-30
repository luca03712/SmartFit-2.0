import React, { useState } from 'react';
import {
    User,
    Scale,
    Target,
    Dumbbell,
    Trash2,
    Edit2,
    Save
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import type { UserProfile, Goal, ActivityLevel, SportType } from '../../types';
import {
    calculateMacroTargets,
    getActivityLevelLabel,
    getSportTypeLabel,
    getGoalLabel
} from '../../utils/tdeeCalculator';

interface SettingsProps {
    profile: UserProfile;
    onUpdateProfile: (profile: UserProfile) => void;
    onResetApp: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
    profile,
    onUpdateProfile,
    onResetApp
}) => {
    const [isEditingBiometrics, setIsEditingBiometrics] = useState(false);
    const [isEditingLifestyle, setIsEditingLifestyle] = useState(false);
    const [editedProfile, setEditedProfile] = useState(profile);

    const handleSaveBiometrics = () => {
        const newTargets = calculateMacroTargets(
            editedProfile.biometrics,
            editedProfile.lifestyle
        );
        onUpdateProfile({
            ...editedProfile,
            targets: newTargets
        });
        setIsEditingBiometrics(false);
    };

    const handleSaveLifestyle = () => {
        const newTargets = calculateMacroTargets(
            editedProfile.biometrics,
            editedProfile.lifestyle
        );
        onUpdateProfile({
            ...editedProfile,
            targets: newTargets
        });
        setIsEditingLifestyle(false);
    };

    const handleReset = () => {
        if (window.confirm('Sei sicuro di voler resettare tutti i dati? Questa azione non può essere annullata.')) {
            onResetApp();
        }
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto pb-24">
            {/* Header */}
            <div className="p-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <User className="text-indigo-400" />
                    Il Mio Profilo
                </h1>
            </div>

            {/* Biometrics card */}
            <div className="px-6 mb-4">
                <div className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-white flex items-center gap-2">
                            <Scale size={18} className="text-indigo-400" />
                            Dati Fisici
                        </h2>
                        <button
                            onClick={() => {
                                setEditedProfile(profile);
                                setIsEditingBiometrics(true);
                            }}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                        >
                            <Edit2 size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-500">Età</p>
                            <p className="text-white font-medium">{profile.biometrics.age} anni</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Sesso</p>
                            <p className="text-white font-medium">
                                {profile.biometrics.gender === 'male' ? 'Uomo' : 'Donna'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Peso</p>
                            <p className="text-white font-medium">{profile.biometrics.weight} kg</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Altezza</p>
                            <p className="text-white font-medium">{profile.biometrics.height} cm</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lifestyle card */}
            <div className="px-6 mb-4">
                <div className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-white flex items-center gap-2">
                            <Dumbbell size={18} className="text-emerald-400" />
                            Stile di Vita
                        </h2>
                        <button
                            onClick={() => {
                                setEditedProfile(profile);
                                setIsEditingLifestyle(true);
                            }}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                        >
                            <Edit2 size={18} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Attività</span>
                            <span className="text-white">{getActivityLevelLabel(profile.lifestyle.activityLevel)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Sport</span>
                            <span className="text-white">{getSportTypeLabel(profile.lifestyle.sportType)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Allenamenti/settimana</span>
                            <span className="text-white">{profile.lifestyle.workoutFrequency}x</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Obiettivo</span>
                            <span className="text-white">{getGoalLabel(profile.lifestyle.goal)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Targets card */}
            <div className="px-6 mb-4">
                <div className="glass rounded-2xl p-4">
                    <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
                        <Target size={18} className="text-amber-400" />
                        Obiettivi Giornalieri
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-xl bg-slate-800/50">
                            <p className="text-2xl font-bold text-indigo-400">{profile.targets.calories}</p>
                            <p className="text-xs text-slate-500">kcal</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-slate-800/50">
                            <p className="text-2xl font-bold text-emerald-400">{profile.targets.protein}g</p>
                            <p className="text-xs text-slate-500">Proteine</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-slate-800/50">
                            <p className="text-2xl font-bold text-amber-400">{profile.targets.carbs}g</p>
                            <p className="text-xs text-slate-500">Carboidrati</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-slate-800/50">
                            <p className="text-2xl font-bold text-rose-400">{profile.targets.fat}g</p>
                            <p className="text-xs text-slate-500">Grassi</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reset button */}
            <div className="px-6 mt-8">
                <Button
                    variant="danger"
                    onClick={handleReset}
                    icon={<Trash2 size={18} />}
                    className="w-full"
                >
                    Reset Completo App
                </Button>
                <p className="text-center text-xs text-slate-500 mt-2">
                    Elimina tutti i dati e ricomincia da capo
                </p>
            </div>

            {/* Edit Biometrics Modal */}
            <Modal
                isOpen={isEditingBiometrics}
                onClose={() => setIsEditingBiometrics(false)}
                title="Modifica Dati Fisici"
                footer={
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setIsEditingBiometrics(false)} className="flex-1">
                            Annulla
                        </Button>
                        <Button onClick={handleSaveBiometrics} icon={<Save size={18} />} className="flex-1">
                            Salva
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Età"
                        type="number"
                        value={editedProfile.biometrics.age}
                        onChange={(e) => setEditedProfile({
                            ...editedProfile,
                            biometrics: { ...editedProfile.biometrics, age: Number(e.target.value) }
                        })}
                        min={16}
                        max={100}
                    />
                    <Select
                        label="Sesso"
                        value={editedProfile.biometrics.gender}
                        onChange={(e) => setEditedProfile({
                            ...editedProfile,
                            biometrics: { ...editedProfile.biometrics, gender: e.target.value as 'male' | 'female' }
                        })}
                        options={[
                            { value: 'male', label: 'Uomo' },
                            { value: 'female', label: 'Donna' }
                        ]}
                    />
                    <Input
                        label="Peso (kg)"
                        type="number"
                        value={editedProfile.biometrics.weight}
                        onChange={(e) => setEditedProfile({
                            ...editedProfile,
                            biometrics: { ...editedProfile.biometrics, weight: Number(e.target.value) }
                        })}
                        step="0.1"
                        min={30}
                        max={300}
                    />
                    <Input
                        label="Altezza (cm)"
                        type="number"
                        value={editedProfile.biometrics.height}
                        onChange={(e) => setEditedProfile({
                            ...editedProfile,
                            biometrics: { ...editedProfile.biometrics, height: Number(e.target.value) }
                        })}
                        min={100}
                        max={250}
                    />
                </div>
            </Modal>

            {/* Edit Lifestyle Modal */}
            <Modal
                isOpen={isEditingLifestyle}
                onClose={() => setIsEditingLifestyle(false)}
                title="Modifica Stile di Vita"
                footer={
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setIsEditingLifestyle(false)} className="flex-1">
                            Annulla
                        </Button>
                        <Button onClick={handleSaveLifestyle} icon={<Save size={18} />} className="flex-1">
                            Salva
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <Select
                        label="Livello di Attività"
                        value={editedProfile.lifestyle.activityLevel}
                        onChange={(e) => setEditedProfile({
                            ...editedProfile,
                            lifestyle: { ...editedProfile.lifestyle, activityLevel: e.target.value as ActivityLevel }
                        })}
                        options={[
                            { value: 'sedentary', label: 'Sedentario (ufficio)' },
                            { value: 'light', label: 'Leggero (1-2 volte/sett)' },
                            { value: 'moderate', label: 'Moderato (3-4 volte/sett)' },
                            { value: 'active', label: 'Attivo (5+ volte/sett)' }
                        ]}
                    />
                    <Select
                        label="Tipo di Sport"
                        value={editedProfile.lifestyle.sportType}
                        onChange={(e) => setEditedProfile({
                            ...editedProfile,
                            lifestyle: { ...editedProfile.lifestyle, sportType: e.target.value as SportType }
                        })}
                        options={[
                            { value: 'gym', label: 'Palestra / Bodybuilding' },
                            { value: 'crossfit', label: 'CrossFit / Funzionale' },
                            { value: 'martial_arts', label: 'Arti Marziali' },
                            { value: 'cardio', label: 'Cardio / Running' },
                            { value: 'none', label: 'Nessuno sport specifico' }
                        ]}
                    />
                    <Input
                        label="Allenamenti a Settimana"
                        type="number"
                        value={editedProfile.lifestyle.workoutFrequency}
                        onChange={(e) => setEditedProfile({
                            ...editedProfile,
                            lifestyle: { ...editedProfile.lifestyle, workoutFrequency: Number(e.target.value) }
                        })}
                        min={0}
                        max={14}
                    />
                    <Select
                        label="Obiettivo"
                        value={editedProfile.lifestyle.goal}
                        onChange={(e) => setEditedProfile({
                            ...editedProfile,
                            lifestyle: { ...editedProfile.lifestyle, goal: e.target.value as Goal }
                        })}
                        options={[
                            { value: 'cut', label: 'Definizione (-500 kcal)' },
                            { value: 'maintain', label: 'Mantenimento' },
                            { value: 'bulk', label: 'Massa (+300 kcal)' }
                        ]}
                    />
                </div>
            </Modal>
        </div>
    );
};
