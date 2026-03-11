import React from 'react';
import { Settings, User, Menu } from 'lucide-react';
import { Button } from './Button';

interface HeaderProps {
    title?: string;
    showSettings?: boolean;
    onSettingsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, showSettings, onSettingsClick }) => {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-4 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-2">
        {!title && (
            <h1 className="text-2xl font-bold tracking-tight">
            Only<span className="text-brand-red">Jam</span>
            </h1>
        )}
        {title && <h1 className="text-xl font-bold text-white">{title}</h1>}
      </div>
      
      <div className="flex items-center gap-2">
        {showSettings && (
            <Button variant="icon" onClick={onSettingsClick}>
                <Settings size={22} className="text-gray-300" />
            </Button>
        )}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-red to-orange-500 flex items-center justify-center border border-white/10">
            <User size={16} className="text-white" />
        </div>
      </div>
    </header>
  );
};