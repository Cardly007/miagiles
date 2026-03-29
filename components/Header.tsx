import React from 'react';
import { Settings, User, Menu } from 'lucide-react';
import { Button } from './Button';

interface HeaderProps {
    title?: string;
    showSettings?: boolean;
    onSettingsClick?: () => void;
}

interface HeaderProps {
    title?: string;
    showSettings?: boolean;
    onSettingsClick?: () => void;
    sessionCode?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, showSettings, onSettingsClick, sessionCode }) => {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-4 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-2">
        {!title && (
            <h1 className="text-xl font-bold tracking-tight">
            Only<span className="text-brand-red">Jam</span>
            </h1>
        )}
        {title && <h1 className="text-xl font-bold text-white">{title}</h1>}
      </div>
      
      {sessionCode && (
         <div className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Code</span>
            <span className="text-sm font-mono font-bold text-brand-red tracking-wider">{sessionCode}</span>
         </div>
      )}

      <div className="flex items-center gap-2">
        {showSettings && (
            <Button variant="icon" onClick={onSettingsClick}>
                <Settings size={20} className="text-gray-300" />
            </Button>
        )}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-red to-orange-500 flex items-center justify-center border border-white/10">
            <User size={16} className="text-white" />
        </div>
      </div>
    </header>
  );
};