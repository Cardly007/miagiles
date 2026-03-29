import React, { useState } from 'react';
import { Users, X } from 'lucide-react';

interface JoinJamModalProps {
  onClose: () => void;
  onJoin: (code: string) => void;
}

export const JoinJamModal: React.FC<JoinJamModalProps> = ({ onClose, onJoin }) => {
  const [code, setCode] = useState('');

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="text-brand-red" /> Join a Jam
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6 text-center">
          <p className="text-gray-400 text-sm">Enter the 6-character code or the full JAM-ID to join a private room.</p>

          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] text-white focus:outline-none focus:border-brand-red font-mono"
            placeholder="XXXXXX"
            maxLength={8}
          />

          <button
            disabled={code.length < 5}
            onClick={() => onJoin(code.startsWith('JAM-') ? code : `JAM-${code}`)}
            className="w-full bg-brand-red hover:bg-red-600 text-white font-bold py-3 px-4 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};
