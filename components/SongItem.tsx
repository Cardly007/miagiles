import React from 'react';
import { Song } from '../types';
import { Plus, ArrowUp, Check, X, Smartphone, Cloud, Music } from 'lucide-react';

interface SongItemProps {
  song: Song;
  isQueue?: boolean;
  isApproval?: boolean; // New prop for Approval Queue
  onAdd?: () => void;
  onVote?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

const SourceIcon = ({ source }: { source: Song['source'] }) => {
  switch (source) {
    case 'Spotify': return <div className="w-3 h-3 bg-[#1DB954] rounded-full" title="Spotify" />;
    case 'YouTube': return <div className="w-3 h-3 bg-[#FF0000] rounded-full" title="YouTube" />;
    case 'SoundCloud': return <div className="w-3 h-3 bg-[#FF5500] rounded-full" title="SoundCloud" />;
    case 'AppleMusic': return <div className="w-3 h-3 bg-[#FA243C] rounded-full" title="Apple Music" />;
    case 'Local': return <span title="Local File"><Smartphone size={12} className="text-blue-400" /></span>;
    default: return <div className="w-3 h-3 bg-gray-500 rounded-full" />;
  }
};

export const SongItem: React.FC<SongItemProps> = ({ 
  song, 
  isQueue = false, 
  isApproval = false,
  onAdd, 
  onVote,
  onApprove,
  onReject
}) => {
  return (
    <div className="flex items-center justify-between p-3 mb-2 bg-brand-card rounded-xl hover:bg-zinc-900 transition-colors group border border-white/5">
      <div className="flex items-center gap-3 flex-1 overflow-hidden">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
          <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/80 flex items-center justify-center border border-white/10">
             <SourceIcon source={song.source} />
          </div>
        </div>
        <div className="flex flex-col min-w-0 text-left">
          <h4 className="text-white font-medium truncate text-sm">{song.title}</h4>
          <div className="flex items-center gap-2">
            <p className="text-gray-400 text-xs truncate">{song.artist}</p>
            {isQueue && <span className="text-[10px] text-zinc-600">• {song.addedBy}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pl-3">
        {isApproval ? (
          <div className="flex items-center gap-2">
             <button onClick={onReject} className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                <X size={16} />
             </button>
             <button onClick={onApprove} className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">
                <Check size={16} />
             </button>
          </div>
        ) : isQueue ? (
          <>
            <div className="flex flex-col items-center min-w-[30px]">
                <button onClick={onVote} className="text-gray-500 hover:text-brand-red transition-colors active:scale-90 transform">
                   <ArrowUp size={20} />
                </button>
                <span className="text-xs text-gray-500 font-mono font-bold">{song.votes}</span>
            </div>
          </>
        ) : (
          <button 
            onClick={onAdd}
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-brand-red hover:bg-brand-red hover:text-white transition-colors"
          >
            <Plus size={18} />
          </button>
        )}
      </div>
    </div>
  );
};