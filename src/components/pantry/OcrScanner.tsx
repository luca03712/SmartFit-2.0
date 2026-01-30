import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { Camera, Upload, X, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import type { NutritionPer100g } from '../../types';

interface OcrScannerProps {
    onScan: (nutrition: Partial<NutritionPer100g>) => void;
    onClose: () => void;
}

// Regex patterns for Italian nutrition labels
const PATTERNS = {
    calories: /(?:energia|kcal|calorie)[:\s]*(\d+(?:[.,]\d+)?)/i,
    protein: /(?:proteine|protidi)[:\s]*(\d+(?:[.,]\d+)?)/i,
    carbs: /(?:carboidrati|glucidi|carb)[:\s]*(\d+(?:[.,]\d+)?)/i,
    fat: /(?:grassi|lipidi|fat)[:\s]*(\d+(?:[.,]\d+)?)/i,
    sugar: /(?:zuccheri|sugars)[:\s]*(\d+(?:[.,]\d+)?)/i,
    salt: /(?:sale|sodium|sodio)[:\s]*(\d+(?:[.,]\d+)?)/i
};

export const OcrScanner: React.FC<OcrScannerProps> = ({ onScan, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const parseNutrition = (text: string): Partial<NutritionPer100g> => {
        const result: Partial<NutritionPer100g> = {};

        // Normalize text
        const normalizedText = text
            .replace(/\n/g, ' ')
            .replace(/,/g, '.')
            .toLowerCase();

        for (const [key, pattern] of Object.entries(PATTERNS)) {
            const match = normalizedText.match(pattern);
            if (match && match[1]) {
                const value = parseFloat(match[1].replace(',', '.'));
                if (!isNaN(value)) {
                    result[key as keyof NutritionPer100g] = value;
                }
            }
        }

        return result;
    };

    const processImage = async (file: File) => {
        setLoading(true);
        setError(null);
        setProgress(0);

        // Create preview
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        try {
            const result = await Tesseract.recognize(file, 'ita+eng', {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100));
                    }
                }
            });

            const text = result.data.text;
            setExtractedText(text);

            const nutrition = parseNutrition(text);

            if (Object.keys(nutrition).length === 0) {
                setError('Non sono riuscito a trovare valori nutrizionali. Inseriscili manualmente.');
            } else {
                onScan(nutrition);
            }
        } catch (err) {
            console.error('OCR Error:', err);
            setError('Errore durante la scansione. Riprova con un\'immagine più chiara.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processImage(file);
        }
    };

    const handleCameraCapture = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <FileText className="text-indigo-400" size={24} />
                    <span className="text-white font-medium">Scansiona Etichetta</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-slate-800 transition-colors"
                >
                    <X className="text-slate-400" size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {loading ? (
                    <div className="text-center">
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    fill="none"
                                    stroke="rgba(99, 102, 241, 0.2)"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    fill="none"
                                    stroke="#6366f1"
                                    strokeWidth="8"
                                    strokeDasharray={`${progress * 3.52} 352`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">{progress}%</span>
                            </div>
                        </div>
                        <p className="text-slate-400">Analizzando l'immagine...</p>
                    </div>
                ) : previewUrl ? (
                    <div className="w-full max-w-md">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full rounded-xl mb-4 max-h-64 object-contain"
                        />
                        {extractedText && (
                            <div className="bg-slate-800/50 rounded-xl p-4 max-h-32 overflow-y-auto">
                                <p className="text-xs text-slate-400 font-mono whitespace-pre-wrap">
                                    {extractedText}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-slate-800/50 border-2 border-dashed border-slate-600 flex items-center justify-center">
                            <Camera className="w-12 h-12 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            Fotografa l'Etichetta
                        </h3>
                        <p className="text-slate-400 text-sm mb-8">
                            Inquadra la tabella nutrizionale per estrarre automaticamente i valori
                        </p>

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={handleCameraCapture}
                                icon={<Camera size={20} />}
                                className="w-full"
                            >
                                Scatta Foto
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/*';
                                    input.onchange = (e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0];
                                        if (file) processImage(file);
                                    };
                                    input.click();
                                }}
                                icon={<Upload size={20} />}
                                className="w-full"
                            >
                                Carica Immagine
                            </Button>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mt-6 p-4 bg-red-900/30 border border-red-800 rounded-xl w-full max-w-md">
                        <p className="text-red-300 text-center text-sm">{error}</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            {(previewUrl || error) && (
                <div className="p-4 border-t border-slate-700 flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setPreviewUrl(null);
                            setExtractedText(null);
                            setError(null);
                        }}
                        className="flex-1"
                    >
                        Riprova
                    </Button>
                    <Button
                        onClick={onClose}
                        className="flex-1"
                    >
                        Chiudi
                    </Button>
                </div>
            )}
        </div>
    );
};
