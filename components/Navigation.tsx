import React from 'react';
import { Home, Search, Radio, Disc, User } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onChangeView: (view: any) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { id: 'HOME', icon: Home, label: 'Home' },
    { id: 'SEARCH', icon: Search, label: 'Search' },
    { id: 'PLAYER', icon: Disc, label: 'Jam' }, // Central Highlight
    { id: 'PROFILE', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-brand-dark border-t border-white/10 px-6 py-3 pb-6 md:pb-3 z-30">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {navItems.map((item) => {
           const isActive = currentView.includes(item.id) || (item.id === 'HOME' && currentView === 'HOST_PANEL');
           const isMain = item.id === 'PLAYER';

           if (isMain) {
             return (
               <button 
                key={item.id}
                onClick={() => onChangeView('PLAYER')}
                className="relative -top-6 bg-brand-red text-white p-4 rounded-full shadow-lg shadow-brand-red/40 transform transition-transform active:scale-95"
               >
                 <item.icon size={24} fill="currentColor" />
               </button>
             )
           }

           return (
            <button
                key={item.id}
                onClick={() => onChangeView(item.id === 'SEARCH' ? 'GUEST_JOIN' : item.id === 'HOME' ? 'HOME' : 'PROFILE')}
                className={`flex flex-col items-center gap-1 ${isActive ? 'text-white' : 'text-gray-500'}`}
            >
                <item.icon size={22} />
                <span className="text-[10px] font-medium">{item.label}</span>
            </button>
           );
        })}
      </div>
    </div>
  );
};