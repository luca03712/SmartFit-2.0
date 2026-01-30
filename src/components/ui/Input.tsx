import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = '', type, value, ...props }, ref) => {
        // Handle numeric input display: show empty string for 0 values
        const displayValue = type === 'number' && (value === 0 || value === '0') ? '' : value;

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={type}
                        value={displayValue}
                        className={`
              w-full px-4 py-3 rounded-xl
              bg-slate-800/50 border border-slate-600/50
              text-white placeholder-slate-500
              focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
              transition-colors duration-200
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1 text-sm text-red-400">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
