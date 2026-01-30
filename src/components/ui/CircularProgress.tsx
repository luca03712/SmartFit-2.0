import React from 'react';

interface CircularProgressProps {
    value: number;
    max: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    bgColor?: string;
    label?: string;
    sublabel?: string;
    showPercentage?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
    value,
    max,
    size = 120,
    strokeWidth = 10,
    color = '#6366f1',
    bgColor = 'rgba(99, 102, 241, 0.2)',
    label,
    sublabel,
    showPercentage = false
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percentage = Math.min(100, (value / max) * 100);
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={bgColor}
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="progress-ring-circle"
                />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {showPercentage ? (
                    <span className="text-2xl font-bold text-white">
                        {Math.round(percentage)}%
                    </span>
                ) : (
                    <>
                        <span className="text-lg font-bold text-white">
                            {Math.round(value)}
                        </span>
                        {label && (
                            <span className="text-xs text-slate-400">{label}</span>
                        )}
                    </>
                )}
                {sublabel && (
                    <span className="text-[10px] text-slate-500">{sublabel}</span>
                )}
            </div>
        </div>
    );
};
