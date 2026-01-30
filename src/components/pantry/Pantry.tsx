import React, { useState } from 'react';
import {
    Plus,
    Package,
    Trash2,
    Edit2,
    Search
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { PantryItemModal } from './PantryItemModal';
import type { PantryItem } from '../../types';
import { getNutriScoreColor, getNutriScoreBgColor } from '../../utils/nutriScore';

interface PantryProps {
    items: PantryItem[];
    onAddItem: (item: PantryItem) => void;
    onUpdateItem: (item: PantryItem) => void;
    onDeleteItem: (id: string) => void;
}

export const Pantry: React.FC<PantryProps> = ({
    items,
    onAddItem,
    onUpdateItem,
    onDeleteItem
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Get unique categories from items
    const allCategories = [...new Set(items.flatMap(item => item.categories))];

    // Filter items
    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || item.categories.includes(selectedCategory);
        return matchesSearch && matchesCategory;
    });

    const handleSave = (item: PantryItem) => {
        if (editingItem) {
            onUpdateItem(item);
        } else {
            onAddItem(item);
        }
        setEditingItem(null);
    };

    const handleEdit = (item: PantryItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Sei sicuro di voler eliminare questo alimento?')) {
            onDeleteItem(id);
        }
    };

    const formatQuantity = (item: PantryItem): string => {
        if (item.unit === 'pz') {
            return `${item.quantity} pz`;
        }
        return `${item.quantity}${item.unit}`;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50">
                <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Package className="text-indigo-400" />
                    La Mia Dispensa
                </h1>

                {/* Search */}
                <Input
                    placeholder="Cerca alimento..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search size={18} />}
                />

                {/* Category filter */}
                {allCategories.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`
                px-3 py-1.5 rounded-lg text-sm whitespace-nowrap
                transition-all duration-200
                ${!selectedCategory
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                                }
              `}
                        >
                            Tutti
                        </button>
                        {allCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`
                  px-3 py-1.5 rounded-lg text-sm whitespace-nowrap
                  transition-all duration-200
                  ${selectedCategory === cat
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                                    }
                `}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-4">
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <Package className="w-16 h-16 text-slate-600 mb-4" />
                        <h3 className="text-lg font-medium text-slate-400 mb-2">
                            {items.length === 0 ? 'Dispensa vuota' : 'Nessun risultato'}
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">
                            {items.length === 0
                                ? 'Aggiungi il tuo primo alimento per iniziare'
                                : 'Prova con una ricerca diversa'
                            }
                        </p>
                        {items.length === 0 && (
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                icon={<Plus size={18} />}
                            >
                                Aggiungi Alimento
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredItems.map(item => (
                            <div
                                key={item.id}
                                className="
                  glass rounded-xl p-4
                  transition-all duration-200
                  hover:border-indigo-500/30
                "
                            >
                                <div className="flex items-start gap-3">
                                    {/* Nutri-Score badge */}
                                    <div
                                        className="
                      w-10 h-10 rounded-lg flex items-center justify-center
                      font-bold text-lg shrink-0
                    "
                                        style={{
                                            backgroundColor: getNutriScoreBgColor(item.nutriScore),
                                            color: getNutriScoreColor(item.nutriScore)
                                        }}
                                    >
                                        {item.nutriScore}
                                    </div>

                                    {/* Item info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-white truncate">{item.name}</h3>
                                        <p className="text-sm text-slate-400">
                                            {formatQuantity(item)}
                                            {item.unit === 'pz' && item.pieceWeight && (
                                                <span className="text-slate-500"> ({item.pieceWeight}g/pz)</span>
                                            )}
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {item.categories.slice(0, 2).map(cat => (
                                                <span
                                                    key={cat}
                                                    className="px-2 py-0.5 rounded text-xs bg-slate-700/50 text-slate-400"
                                                >
                                                    {cat}
                                                </span>
                                            ))}
                                            {item.categories.length > 2 && (
                                                <span className="px-2 py-0.5 rounded text-xs bg-slate-700/50 text-slate-400">
                                                    +{item.categories.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Nutrition summary */}
                                <div className="flex gap-4 mt-3 pt-3 border-t border-slate-700/50 text-sm">
                                    <div>
                                        <span className="text-slate-500">Kcal: </span>
                                        <span className="text-slate-300">{item.nutritionPer100g.calories}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Pro: </span>
                                        <span className="text-emerald-400">{item.nutritionPer100g.protein}g</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Carb: </span>
                                        <span className="text-amber-400">{item.nutritionPer100g.carbs}g</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Fat: </span>
                                        <span className="text-rose-400">{item.nutritionPer100g.fat}g</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FAB */}
            <button
                onClick={() => {
                    setEditingItem(null);
                    setIsModalOpen(true);
                }}
                className="
          fixed bottom-24 right-6
          w-14 h-14 rounded-full
          bg-gradient-to-r from-indigo-600 to-indigo-500
          text-white shadow-lg shadow-indigo-500/30
          flex items-center justify-center
          animate-pulse-glow
          hover:from-indigo-500 hover:to-indigo-400
          transition-all duration-200
          z-40
        "
            >
                <Plus size={28} />
            </button>

            {/* Modal */}
            <PantryItemModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                }}
                onSave={handleSave}
                editItem={editingItem}
            />
        </div>
    );
};
