import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onSave,
    title,
    children,
    footer
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
            {/* Sticky Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900 sticky top-0 z-10">
                <button
                    onClick={onClose}
                    className="text-indigo-400 font-medium py-2 px-1 min-w-[70px] text-left"
                >
                    Annulla
                </button>
                <h2 className="text-lg font-semibold text-white text-center flex-1">
                    {title}
                </h2>
                {onSave ? (
                    <button
                        onClick={onSave}
                        className="text-indigo-400 font-semibold py-2 px-1 min-w-[70px] text-right"
                    >
                        Salva
                    </button>
                ) : (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-800 transition-colors min-w-[70px] flex justify-end"
                    >
                        <X size={24} className="text-slate-400" />
                    </button>
                )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-32">
                {children}
            </div>

            {/* Sticky Footer (if provided and no onSave in header) */}
            {footer && !onSave && (
                <div className="sticky bottom-0 p-4 border-t border-slate-700 bg-slate-900 pb-safe">
                    {footer}
                </div>
            )}
        </div>
    );
};
