import React from 'react';
import {
    Home,
    Package,
    UtensilsCrossed,
    Settings
} from 'lucide-react';

interface NavigationProps {
    currentTab: string;
    onTabChange: (tab: string) => void;
}

const TABS = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'pantry', label: 'Dispensa', icon: Package },
    { id: 'diet', label: 'Piano', icon: UtensilsCrossed },
    { id: 'settings', label: 'Profilo', icon: Settings }
];

export const Navigation: React.FC<NavigationProps> = ({
    currentTab,
    onTabChange
}) => {
    return (
        <nav className="
      fixed bottom-0 left-0 right-0
      glass border-t border-slate-700/50
      px-4 py-2 pb-safe
      z-50
    ">
            <div className="flex items-center justify-around max-w-lg mx-auto">
                {TABS.map(tab => {
                    const isActive = currentTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                flex flex-col items-center gap-1 py-2 px-4 rounded-xl
                transition-all duration-200
                ${isActive
                                    ? 'text-indigo-400'
                                    : 'text-slate-500 hover:text-slate-300'
                                }
              `}
                        >
                            <div className={`
                p-2 rounded-xl transition-all duration-200
                ${isActive ? 'bg-indigo-600/20' : ''}
              `}>
                                <Icon size={22} />
                            </div>
                            <span className="text-xs font-medium">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
