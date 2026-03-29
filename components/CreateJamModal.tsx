import React, { useState } from 'react';
import { Radio, Users, Lock, Unlock, Music, X } from 'lucide-react';

interface CreateJamModalProps {
  onClose: () => void;
  onStart: (name: string, genre: string, isPublic: boolean) => void;
  defaultName: string;
}

export const CreateJamModal: React.FC<CreateJamModalProps> = ({ onClose, onStart, defaultName }) => {
  const [name, setName] = useState(defaultName);
  const [genre, setGenre] = useState('Pop');
  const [isPublic, setIsPublic] = useState(true);

  const genres = ['Pop', 'Lofi', 'Techno', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'R&B'];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Radio className="text-brand-red" /> Start a Jam
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Jam Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-red"
              placeholder="My awesome jam"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Genre</label>
            <div className="relative">
              <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-red appearance-none"
              >
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsPublic(true)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${isPublic ? 'border-brand-red bg-brand-red/10' : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-800'}`}
              >
                <Unlock size={24} className={isPublic ? 'text-brand-red' : 'text-gray-500'} />
                <span className={`text-sm font-bold ${isPublic ? 'text-brand-red' : 'text-gray-500'}`}>Public</span>
              </button>
              <button
                onClick={() => setIsPublic(false)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${!isPublic ? 'border-brand-red bg-brand-red/10' : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-800'}`}
              >
                <Lock size={24} className={!isPublic ? 'text-brand-red' : 'text-gray-500'} />
                <span className={`text-sm font-bold ${!isPublic ? 'text-brand-red' : 'text-gray-500'}`}>Private Code</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => onStart(name, genre, isPublic)}
            className="w-full bg-brand-red hover:bg-red-600 text-white font-bold py-3 px-4 rounded-full transition-colors"
          >
            Launch Jam
          </button>
        </div>
      </div>
    </div>
  );
};
