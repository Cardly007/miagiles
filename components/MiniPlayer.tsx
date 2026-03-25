import React from 'react';
import { Song } from '../types';
import { Play, Pause, SkipForward } from 'lucide-react';

interface MiniPlayerProps {
    currentSong: Song;
    isPlaying: boolean;
    isHost: boolean;
    onPlayPause: (e: React.MouseEvent) => void;
    onNext: (e: React.MouseEvent) => void;
    onClick: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ currentSong, isPlaying, isHost, onPlayPause, onNext, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="fixed bottom-[72px] md:bottom-[60px] left-0 right-0 bg-zinc-900 border-t border-b border-white/10 p-2 z-20 flex items-center justify-between cursor-pointer hover:bg-zinc-800 transition-colors animate-fade-in"
        >
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                <img src={currentSong.coverUrl} className="w-10 h-10 rounded-md object-cover flex-shrink-0" alt="Cover" />
                <div className="flex flex-col overflow-hidden whitespace-nowrap">
                    <span className="text-sm font-bold text-white truncate">{currentSong.title}</span>
                    <span className="text-[10px] text-gray-400 truncate">{currentSong.artist}</span>
                </div>
            </div>

            <div className="flex items-center gap-4 pr-2 pl-4">
                <button
                    onClick={onPlayPause}
                    className={`text-white hover:text-brand-red ${!isHost ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>
                <button
                    onClick={onNext}
                    className={`text-gray-400 hover:text-white ${!isHost ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <SkipForward size={24} fill="currentColor" />
                </button>
            </div>
        </div>
    );
};