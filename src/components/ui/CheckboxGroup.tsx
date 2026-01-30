import React from 'react';

interface CheckboxGroupProps {
    label?: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
    label,
    options,
    selected,
    onChange
}) => {
    const handleToggle = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(s => s !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    {label}
                </label>
            )}
            <div className="flex flex-wrap gap-2">
                {options.map(option => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => handleToggle(option)}
                        className={`
              px-3 py-1.5 rounded-lg text-sm font-medium
              transition-all duration-200
              ${selected.includes(option)
                                ? 'bg-indigo-600 text-white border-transparent'
                                : 'bg-slate-800/50 text-slate-300 border border-slate-600/50 hover:border-indigo-500'
                            }
            `}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
};
