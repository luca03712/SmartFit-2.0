import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import type { NutritionPer100g } from '../../types';

interface BarcodeScannerProps {
    onScan: (data: {
        name: string;
        nutrition: NutritionPer100g;
        nutriScore?: string;
    }) => void;
    onClose: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(true);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        const startScanner = async () => {
            try {
                const scanner = new Html5Qrcode('barcode-reader');
                scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 150 }
                    },
                    async (decodedText) => {
                        // Stop scanning once we get a result
                        setScanning(false);
                        await scanner.stop();
                        handleBarcode(decodedText);
                    },
                    () => {
                        // QR code scan error (ignore - this fires constantly)
                    }
                );
            } catch (err) {
                console.error('Scanner start error:', err);
                setError('Impossibile accedere alla fotocamera. Verifica i permessi.');
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, []);

    const handleBarcode = async (barcode: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
            );
            const data = await response.json();

            if (data.status === 1 && data.product) {
                const product = data.product;
                const nutriments = product.nutriments || {};

                const nutrition: NutritionPer100g = {
                    calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
                    protein: Math.round((nutriments.proteins_100g || 0) * 10) / 10,
                    carbs: Math.round((nutriments.carbohydrates_100g || 0) * 10) / 10,
                    fat: Math.round((nutriments.fat_100g || 0) * 10) / 10,
                    salt: Math.round((nutriments.salt_100g || 0) * 100) / 100,
                    sugar: Math.round((nutriments.sugars_100g || 0) * 10) / 10
                };

                onScan({
                    name: product.product_name_it || product.product_name || 'Prodotto Sconosciuto',
                    nutrition,
                    nutriScore: product.nutriscore_grade?.toUpperCase()
                });
            } else {
                setError('Prodotto non trovato nel database. Inserisci i dati manualmente.');
                setLoading(false);
                setScanning(true);
                // Restart scanner
                if (scannerRef.current) {
                    try {
                        await scannerRef.current.start(
                            { facingMode: 'environment' },
                            { fps: 10, qrbox: { width: 250, height: 150 } },
                            async (decodedText) => {
                                setScanning(false);
                                await scannerRef.current?.stop();
                                handleBarcode(decodedText);
                            },
                            () => { }
                        );
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        } catch (err) {
            console.error('API Error:', err);
            setError('Errore di connessione. Riprova.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-slate-900">
                <div className="flex items-center gap-2">
                    <Camera className="text-indigo-400" size={24} />
                    <span className="text-white font-medium">Scansiona Codice a Barre</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-slate-800 transition-colors"
                >
                    <X className="text-slate-400" size={24} />
                </button>
            </div>

            {/* Scanner */}
            <div className="flex-1 flex items-center justify-center relative">
                <div
                    id="barcode-reader"
                    className="w-full max-w-md"
                    style={{ minHeight: '300px' }}
                />

                {loading && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                            <p className="text-white">Cercando prodotto...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-900/50 border-t border-red-800">
                    <p className="text-red-300 text-center">{error}</p>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="w-full mt-3"
                    >
                        Chiudi e inserisci manualmente
                    </Button>
                </div>
            )}

            {/* Instructions */}
            {scanning && !error && (
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                    <p className="text-slate-400 text-center text-sm">
                        Punta la fotocamera sul codice a barre del prodotto
                    </p>
                </div>
            )}
        </div>
    );
};
