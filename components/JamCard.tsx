import React from 'react';
import { Users, Music, PlayCircle } from 'lucide-react';
import { PublicSession } from './DiscoverView';

interface JamCardProps {
  session: PublicSession;
  onClick: () => void;
}

export const JamCard: React.FC<JamCardProps> = ({ session, onClick }) => {
  const currentTrack = session.queue?.[0];

  return (
    <div
      onClick={onClick}
      className="bg-zinc-900 rounded-2xl p-5 hover:bg-zinc-800 transition-colors cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-4 right-4 text-brand-red bg-black/50 p-2 rounded-full">
          <PlayCircle size={32} />
        </div>
      </div>

      <div className="flex justify-between items-start mb-4 relative z-20">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{session.name}</h3>
          <p className="text-sm text-gray-400">{session.genre}</p>
        </div>
        <div className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-1">
          <Users size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-white">{session.listenerCount}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 relative z-20">
        <img
          src={session.host.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.host.pseudo}`}
          alt={session.host.pseudo}
          className="w-10 h-10 rounded-full border border-zinc-700"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-0.5">Hosted by</p>
          <p className="text-sm font-medium text-white truncate">{session.host.pseudo}</p>
        </div>
      </div>

      {currentTrack ? (
        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-3 relative z-20">
          <img src={currentTrack.thumbnail || ''} alt="cover" className="w-12 h-12 rounded bg-zinc-800" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-brand-red font-medium mb-0.5 flex items-center gap-1">
              <Music size={10} /> NOW PLAYING
            </p>
            <p className="text-sm text-white font-medium truncate">{currentTrack.title}</p>
            <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
          </div>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-center h-[4.5rem] relative z-20">
          <p className="text-sm text-gray-500 italic">Waiting for music...</p>
        </div>
      )}
    </div>
  );
};
