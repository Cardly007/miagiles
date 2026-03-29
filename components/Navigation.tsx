import React from 'react';
import { Home, Search, Play, User, Disc, Users } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onChangeView: (view: any) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { id: 'HOME', icon: Home, label: 'Home', view: 'HOME' },
    { id: 'DISCOVER', icon: Disc, label: 'Discover', view: 'DISCOVER' },
    { id: 'SOCIAL', icon: Users, label: 'Social', view: 'SOCIAL' },
    { id: 'PLAYER', icon: Play, label: 'Listen', view: 'PLAYER' },
    { id: 'PROFILE', icon: User, label: 'Profile', view: 'PROFILE' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 px-6 py-2 pb-[env(safe-area-inset-bottom,20px)] z-30 bg-black/90 backdrop-blur-md">
      <div className="flex items-center justify-between max-w-lg mx-auto w-full px-2 pt-2">
        {navItems.map((item) => {
           const isActive = currentView === item.view || (item.view === 'PLAYER' && currentView === 'HOST_PANEL');

           return (
            <button
                key={item.id}
                onClick={() => onChangeView(item.view)}
                className={`flex flex-col items-center gap-1.5 transition-colors ${isActive ? 'text-brand-red scale-105' : 'text-gray-500 hover:text-gray-300'}`}
            >
                <item.icon size={24} fill={isActive && item.id === 'PLAYER' ? "currentColor" : "none"} />
                <span className="text-[10px] font-bold tracking-wider uppercase">{item.label}</span>
            </button>
           );
        })}
      </div>
    </div>
  );
};