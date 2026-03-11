import React from 'react';
import { Song, JamSession } from '../types';
import { SkipBack, Pause, Play, SkipForward, X, Radio } from 'lucide-react';

interface CarViewProps {
  session: JamSession | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onExit: () => void;
}

export const CarView: React.FC<CarViewProps> = ({ session, isPlaying, onTogglePlay, onExit }) => {
  const currentSong = session?.nowPlaying;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col p-6 pb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Radio className="text-brand-red animate-pulse" size={32} />
          <span className="text-2xl font-bold text-gray-300">CarPlay Mode</span>
        </div>
        <button 
          onClick={onExit}
          className="px-6 py-3 bg-zinc-800 rounded-full text-xl font-bold text-white hover:bg-zinc-700"
        >
          Exit
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center gap-8">
        <div className="flex gap-6 items-center">
            {currentSong?.coverUrl && (
                <img 
                    src={currentSong.coverUrl} 
                    alt="Cover" 
                    className="w-32 h-32 rounded-xl object-cover border-2 border-zinc-700"
                />
            )}
            <div className="flex-1 min-w-0">
                <h1 className="text-4xl font-bold text-white truncate leading-tight mb-2">
                    {currentSong?.title || "No Song Playing"}
                </h1>
                <p className="text-2xl text-brand-red truncate font-medium">
                    {currentSong?.artist || "Waiting for host..."}
                </p>
                <div className="mt-2 flex items-center gap-2">
                    <span className="px-3 py-1 bg-zinc-800 rounded text-lg text-gray-400">
                        {currentSong?.source || 'Source'}
                    </span>
                    <span className="px-3 py-1 bg-zinc-800 rounded text-lg text-gray-400">
                        4:02 remaining
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* Controls - Extra Large for Safety */}
      <div className="grid grid-cols-3 gap-6 h-32">
        <button className="bg-zinc-900 rounded-2xl flex items-center justify-center hover:bg-zinc-800 active:scale-95 transition-transform">
          <SkipBack size={48} fill="currentColor" />
        </button>
        
        <button 
            onClick={onTogglePlay}
            className="bg-brand-red rounded-2xl flex items-center justify-center hover:bg-red-600 active:scale-95 transition-transform shadow-[0_0_30px_rgba(255,0,0,0.3)]"
        >
          {isPlaying ? (
             <Pause size={64} fill="currentColor" />
          ) : (
             <Play size={64} fill="currentColor" className="ml-2" />
          )}
        </button>
        
        <button className="bg-zinc-900 rounded-2xl flex items-center justify-center hover:bg-zinc-800 active:scale-95 transition-transform">
          <SkipForward size={48} fill="currentColor" />
        </button>
      </div>

      <div className="mt-8 text-center text-gray-500 font-medium text-lg">
         Next: {session?.queue[0]?.title || "End of Queue"}
      </div>
    </div>
  );
};