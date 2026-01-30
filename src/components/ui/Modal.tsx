import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer
}) => {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="
          relative w-full sm:max-w-lg 
          max-h-[95vh] sm:max-h-[85vh]
          bg-slate-900 
          rounded-t-3xl sm:rounded-2xl
          shadow-2xl shadow-black/50
          animate-slide-up sm:animate-fade-in
          flex flex-col
          border border-slate-700/50
        "
            >
                {/* Header */}
                <div className="
          flex items-center justify-between 
          px-6 py-4 
          border-b border-slate-700/50
          shrink-0
        ">
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="
              p-2 rounded-full 
              text-slate-400 hover:text-white 
              hover:bg-slate-700/50
              transition-colors
            "
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="
            px-6 py-4 
            border-t border-slate-700/50
            bg-slate-800/50
            shrink-0
          ">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
