import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
    Barcode,
    ScanLine,
    Save,
    Package,
    Scale
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { CheckboxGroup } from '../ui/CheckboxGroup';
import { BarcodeScanner } from './BarcodeScanner';
import { OcrScanner } from './OcrScanner';
import type {
    PantryItem,
    NutritionPer100g,
    NutriScore,
    Unit
} from '../../types';
import { MEAL_CATEGORIES } from '../../types';
import { getDefaultPieceWeight } from '../../utils/defaultWeights';
import { calculateNutriScore } from '../../utils/nutriScore';

interface PantryItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: PantryItem) => void;
    editItem?: PantryItem | null;
}

const initialNutrition: NutritionPer100g = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    salt: 0,
    sugar: 0
};

export const PantryItemModal: React.FC<PantryItemModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editItem
}) => {
    const [name, setName] = useState('');
    const [unit, setUnit] = useState<Unit>('g');
    const [quantity, setQuantity] = useState<number>(100);
    const [pieceWeight, setPieceWeight] = useState<number | undefined>(undefined);
    const [categories, setCategories] = useState<string[]>([]);
    const [nutrition, setNutrition] = useState<NutritionPer100g>(initialNutrition);
    const [nutriScore, setNutriScore] = useState<NutriScore>('C');

    const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
    const [showOcrScanner, setShowOcrScanner] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when modal opens/closes or edit item changes
    useEffect(() => {
        if (isOpen) {
            if (editItem) {
                setName(editItem.name);
                setUnit(editItem.unit);
                setQuantity(editItem.quantity);
                setPieceWeight(editItem.pieceWeight);
                setCategories(editItem.categories);
                setNutrition(editItem.nutritionPer100g);
                setNutriScore(editItem.nutriScore);
            } else {
                setName('');
                setUnit('g');
                setQuantity(100);
                setPieceWeight(undefined);
                setCategories([]);
                setNutrition(initialNutrition);
                setNutriScore('C');
            }
            setErrors({});
        }
    }, [isOpen, editItem]);

    // Auto-calculate Nutri-Score when nutrition changes
    useEffect(() => {
        if (nutrition.calories > 0) {
            const score = calculateNutriScore(nutrition);
            setNutriScore(score);
        }
    }, [nutrition]);

    // Auto-suggest piece weight based on name
    useEffect(() => {
        if (unit === 'pz' && name && !pieceWeight) {
            const defaultWeight = getDefaultPieceWeight(name);
            if (defaultWeight) {
                setPieceWeight(defaultWeight);
            }
        }
    }, [name, unit, pieceWeight]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = 'Il nome è obbligatorio';
        }
        if (quantity <= 0) {
            newErrors.quantity = 'La quantità deve essere maggiore di 0';
        }
        if (categories.length === 0) {
            newErrors.categories = 'Seleziona almeno una categoria';
        }
        if (nutrition.calories <= 0) {
            newErrors.calories = 'Inserisci le calorie';
        }
        if (unit === 'pz' && (!pieceWeight || pieceWeight <= 0)) {
            newErrors.pieceWeight = 'Inserisci il peso per pezzo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;

        const item: PantryItem = {
            id: editItem?.id || uuidv4(),
            name: name.trim(),
            unit,
            quantity,
            pieceWeight: unit === 'pz' ? pieceWeight : undefined,
            categories,
            nutritionPer100g: nutrition,
            nutriScore
        };

        onSave(item);
        onClose();
    };

    const handleBarcodeResult = (data: {
        name: string;
        nutrition: NutritionPer100g;
        nutriScore?: string;
    }) => {
        setName(data.name);
        setNutrition(data.nutrition);
        if (data.nutriScore && ['A', 'B', 'C', 'D', 'E'].includes(data.nutriScore)) {
            setNutriScore(data.nutriScore as NutriScore);
        }
        setShowBarcodeScanner(false);
    };

    const handleOcrResult = (parsedNutrition: Partial<NutritionPer100g>) => {
        setNutrition(prev => ({
            ...prev,
            ...parsedNutrition
        }));
        setShowOcrScanner(false);
    };

    const updateNutrition = (field: keyof NutritionPer100g, value: string) => {
        const numValue = parseFloat(value) || 0;
        setNutrition(prev => ({ ...prev, [field]: numValue }));
    };

    if (showBarcodeScanner) {
        return (
            <BarcodeScanner
                onScan={handleBarcodeResult}
                onClose={() => setShowBarcodeScanner(false)}
            />
        );
    }

    if (showOcrScanner) {
        return (
            <OcrScanner
                onScan={handleOcrResult}
                onClose={() => setShowOcrScanner(false)}
            />
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editItem ? 'Modifica Alimento' : 'Nuovo Alimento'}
            footer={
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onClose} className="flex-1">
                        Annulla
                    </Button>
                    <Button onClick={handleSave} icon={<Save size={18} />} className="flex-1">
                        Salva
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Scanner buttons */}
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => setShowBarcodeScanner(true)}
                        icon={<Barcode size={18} />}
                        className="flex-1"
                        size="sm"
                    >
                        Barcode
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setShowOcrScanner(true)}
                        icon={<ScanLine size={18} />}
                        className="flex-1"
                        size="sm"
                    >
                        Etichetta OCR
                    </Button>
                </div>

                {/* Name */}
                <Input
                    label="Nome Alimento *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="es. Petto di pollo"
                    icon={<Package size={18} />}
                    error={errors.name}
                />

                {/* Unit and Quantity */}
                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Unità"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value as Unit)}
                        options={[
                            { value: 'g', label: 'Grammi (g)' },
                            { value: 'ml', label: 'Millilitri (ml)' },
                            { value: 'pz', label: 'Pezzi (pz)' }
                        ]}
                    />
                    <Input
                        label="Quantità Disponibile *"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        min={0}
                        step={unit === 'pz' ? 1 : 5}
                        error={errors.quantity}
                    />
                </div>

                {/* Piece weight (only for pz) */}
                {unit === 'pz' && (
                    <Input
                        label="Peso per pezzo (g) *"
                        type="number"
                        value={pieceWeight || ''}
                        onChange={(e) => setPieceWeight(Number(e.target.value))}
                        placeholder="es. 55 per un uovo"
                        icon={<Scale size={18} />}
                        min={1}
                        step={1}
                        error={errors.pieceWeight}
                    />
                )}

                {/* Categories */}
                <div>
                    <CheckboxGroup
                        label="Categorie Pasto *"
                        options={[...MEAL_CATEGORIES]}
                        selected={categories}
                        onChange={setCategories}
                    />
                    {errors.categories && (
                        <p className="mt-1 text-sm text-red-400">{errors.categories}</p>
                    )}
                </div>

                {/* Nutrition */}
                <div className="space-y-4">
                    <h3 className="font-medium text-white flex items-center gap-2">
                        Valori Nutrizionali
                        <span className="text-sm text-slate-400">(per 100g)</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Calorie (kcal) *"
                            type="number"
                            value={nutrition.calories || ''}
                            onChange={(e) => updateNutrition('calories', e.target.value)}
                            step="1"
                            min={0}
                            error={errors.calories}
                        />
                        <Input
                            label="Proteine (g)"
                            type="number"
                            value={nutrition.protein || ''}
                            onChange={(e) => updateNutrition('protein', e.target.value)}
                            step="0.1"
                            min={0}
                        />
                        <Input
                            label="Carboidrati (g)"
                            type="number"
                            value={nutrition.carbs || ''}
                            onChange={(e) => updateNutrition('carbs', e.target.value)}
                            step="0.1"
                            min={0}
                        />
                        <Input
                            label="Grassi (g)"
                            type="number"
                            value={nutrition.fat || ''}
                            onChange={(e) => updateNutrition('fat', e.target.value)}
                            step="0.1"
                            min={0}
                        />
                        <Input
                            label="Zuccheri (g)"
                            type="number"
                            value={nutrition.sugar || ''}
                            onChange={(e) => updateNutrition('sugar', e.target.value)}
                            step="0.1"
                            min={0}
                        />
                        <Input
                            label="Sale (g)"
                            type="number"
                            value={nutrition.salt || ''}
                            onChange={(e) => updateNutrition('salt', e.target.value)}
                            step="0.01"
                            min={0}
                        />
                    </div>

                    {/* Nutri-Score preview */}
                    {nutrition.calories > 0 && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                            <span className="text-sm text-slate-400">Nutri-Score:</span>
                            <div
                                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  font-bold text-white
                  ${nutriScore === 'A' ? 'bg-green-600' : ''}
                  ${nutriScore === 'B' ? 'bg-lime-500' : ''}
                  ${nutriScore === 'C' ? 'bg-yellow-500' : ''}
                  ${nutriScore === 'D' ? 'bg-orange-500' : ''}
                  ${nutriScore === 'E' ? 'bg-red-500' : ''}
                `}
                            >
                                {nutriScore}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
