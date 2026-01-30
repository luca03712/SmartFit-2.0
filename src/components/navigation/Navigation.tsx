import React from 'react';
import { Home, Package, Utensils, Settings } from 'lucide-react';

interface NavigationProps {
    currentTab: string;
    onTabChange: (tab: string) => void;
}

const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'pantry', label: 'Dispensa', icon: Package },
    { id: 'diet', label: 'Dieta', icon: Utensils },
    { id: 'settings', label: 'Profilo', icon: Settings }
];

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
    return (
        <nav className="
      shrink-0
      bg-slate-900/95 backdrop-blur-lg 
      border-t border-slate-700/50
    " style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <div className="flex items-center justify-around h-16">
                {tabs.map((tab) => {
                    const isActive = currentTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                flex flex-col items-center justify-center
                flex-1 h-full
                transition-colors duration-200
                ${isActive ? 'text-indigo-400' : 'text-slate-500'}
              `}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
