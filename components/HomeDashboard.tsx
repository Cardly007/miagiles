import React from 'react';
import { ViewState, User } from '../types';
import { Button } from './Button';
import { Radio, Users, Plus, Play, Music } from 'lucide-react';

interface HomeDashboardProps {
    user: User | null;
    onStartSession: () => void;
    onJoinSession: () => void;
    onChangeView: (view: ViewState) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ user, onStartSession, onJoinSession, onChangeView }) => {
    // Mock data for dashboard
    const activeJams = [
        { id: '1', host: 'Sarah', listeners: 12, genre: 'Pop', cover: 'https://picsum.photos/200/200?random=10' },
        { id: '2', host: 'Mike', listeners: 5, genre: 'Lofi', cover: 'https://picsum.photos/200/200?random=11' }
    ];

    return (
        <div className="h-full bg-black flex flex-col pt-8 pb-32 overflow-y-auto px-6 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Hey, {user?.name}</h1>
                    <p className="text-gray-400 text-sm">What's the vibe today?</p>
                </div>
                {user?.avatar && (
                    <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-12 h-12 rounded-full border border-white/20 object-cover cursor-pointer"
                        onClick={() => onChangeView(ViewState.PROFILE)}
                    />
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
                <Button
                    onClick={onStartSession}
                    className="h-20 bg-brand-red flex flex-col items-center justify-center gap-1 shadow-lg shadow-brand-red/20"
                >
                    <Radio size={24} />
                    <span className="text-xs font-bold uppercase tracking-wider">Start Jam</span>
                </Button>
                <Button
                    onClick={onJoinSession}
                    variant="secondary"
                    className="h-20 flex flex-col items-center justify-center gap-1 bg-zinc-900 border-zinc-800"
                >
                    <Users size={24} className="text-gray-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Join Jam</span>
                </Button>
            </div>

            <div className="mb-10">
                <h2 className="text-lg font-bold text-white mb-4">Friends Live Now</h2>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {activeJams.map(jam => (
                        <div key={jam.id} className="min-w-[140px] bg-zinc-900 rounded-2xl p-3 border border-white/5 relative group cursor-pointer" onClick={onJoinSession}>
                            <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                                <img src={jam.cover} alt={jam.host} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play size={24} fill="currentColor" className="text-white" />
                                </div>
                                <div className="absolute top-2 left-2 bg-brand-red px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Live
                                </div>
                            </div>
                            <h3 className="font-bold text-sm text-white truncate">{jam.host}'s Jam</h3>
                            <p className="text-xs text-gray-400 flex justify-between mt-1">
                                <span>{jam.genre}</span>
                                <span className="flex items-center gap-1"><Users size={10}/> {jam.listeners}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Your Playlists</h2>
                    <button className="text-brand-red text-sm font-bold flex items-center gap-1">
                        <Plus size={16} /> Create
                    </button>
                </div>
                <div className="space-y-3">
                    {user?.playlists?.map(pl => (
                        <div key={pl.id} className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 flex items-center gap-4 cursor-pointer hover:bg-zinc-900 transition-colors" onClick={() => onChangeView(ViewState.PLAYER)}>
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${pl.icon === 'green' ? 'bg-green-900/30 text-green-500' : 'bg-purple-900/30 text-purple-500'}`}>
                                <Music size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold truncate text-white">{pl.name}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{pl.source}</div>
                            </div>
                            <Button variant="ghost" className="w-10 h-10 p-0 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-zinc-800">
                                <Play size={18} fill="currentColor" />
                            </Button>
                        </div>
                    ))}
                    {(!user?.playlists || user.playlists.length === 0) && (
                        <div className="text-center py-8 bg-zinc-900/50 rounded-xl border border-dashed border-zinc-800 text-gray-500 text-sm">
                            No playlists yet. Create one!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};