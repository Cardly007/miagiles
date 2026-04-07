import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { ViewState, JamSession, User, Song } from './types';
import { MOCK_USER, MOCK_SONGS } from './constants';
import { createJam, searchSongs } from './services/jamService';
import { Button } from './components/Button';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { SongItem } from './components/SongItem';
import { CarView } from './components/CarView';
import { MiniPlayer } from './components/MiniPlayer';
import { HomeDashboard } from './components/HomeDashboard';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, 
  Share2, Search, Mic, ArrowRight,
  Radio, Users, Heart, Settings, Plus, Upload, Car,
  Music, UserPlus, CheckCircle, Smartphone, Wifi, X, Cloud, Disc,
  MessageCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { ChatPanel, ChatMessageData } from './components/ChatPanel';
import { LiveChatOverlay } from './components/LiveChatOverlay';
import { DiscoverView } from './components/DiscoverView';
import { SocialView } from './components/SocialView';
import { NotificationContainer } from './components/NotificationToast';
import { useNotifications } from './hooks/useNotifications';
import { CreateJamModal } from './components/CreateJamModal';
import { JoinJamModal } from './components/JoinJamModal';

// --- Onboarding Component ---
const Onboarding: React.FC<{ onComplete: (user: Partial<User>) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', bio: '' });

  return (
    <div className="min-h-screen bg-black flex flex-col p-6 animate-fade-in">
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <h2 className="text-3xl font-bold mb-2">Create Profile</h2>
            <p className="text-gray-400 mb-8">Join the OnlyJam community.</p>

            <div className="space-y-6">
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center border-2 border-dashed border-zinc-600 relative overflow-hidden">
                        <Upload size={24} className="text-zinc-500" />
                        <img src={`https://picsum.photos/200/200?random=${Math.random()}`} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="avatar preview" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Pseudo</label>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:border-brand-red outline-none"
                        placeholder="@username"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                    <textarea 
                        value={formData.bio}
                        onChange={e => setFormData({...formData, bio: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:border-brand-red outline-none h-24 resize-none"
                        placeholder="Tell us about your vibe..."
                    />
                </div>

                <div className="pt-4">
                    <Button 
                        fullWidth 
                        onClick={() => onComplete(formData)}
                        disabled={!formData.name}
                        className={!formData.name ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                        Continue
                    </Button>
                </div>
                
                <div className="flex items-center gap-4 justify-center mt-6">
                    <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold">G</button>
                    <button className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold">f</button>
                    <button className="w-10 h-10 rounded-full bg-zinc-800 text-white flex items-center justify-center font-bold"></button>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- Host Panel ---
const HostPanel: React.FC<{ 
    session: JamSession, 
    onClose: () => void,
    onUpdateSetting: (key: keyof JamSession['settings'], val: boolean) => void,
    onBanUser: (userId: string) => void
}> = ({ session, onClose, onUpdateSetting, onBanUser }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in overflow-y-auto">
            <div className="bg-zinc-900 w-full max-w-sm rounded-3xl p-6 border border-white/10 relative shadow-2xl my-auto">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-zinc-800 rounded-full text-gray-400 hover:text-white">
                    <X size={16} />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-1">Session Settings</h2>
                    <div className="text-xs text-brand-red font-mono">{session.id}</div>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center">
                        <QRCodeSVG value={`https://onlyjam.app/join/${session.code}`} size={140} className="mx-auto mb-4 bg-white p-2 rounded-lg" />
                        <div className="flex justify-center gap-2">
                             <Button variant="secondary" className="text-xs h-8 px-3">Copy Link</Button>
                             <Button variant="secondary" className="text-xs h-8 px-3">Share</Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Controls</h3>
                    
                    {[
                        { key: 'approvalRequired', label: 'Suggestion Mode', desc: 'Approve songs before they play', icon: CheckCircle },
                        { key: 'syncMode', label: 'Jam Sync', desc: 'Sync playback across devices (<10ms)', icon: Wifi },
                        { key: 'guestVolumeControl', label: 'Guest Volume', desc: 'Allow guests to change volume', icon: Music },
                    ].map((setting: any) => (
                        <div key={setting.key} className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${session.settings[setting.key as keyof typeof session.settings] ? 'bg-brand-red/20 text-brand-red' : 'bg-zinc-900 text-gray-400'}`}>
                                    <setting.icon size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{setting.label}</p>
                                    <p className="text-[10px] text-gray-500">{setting.desc}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => onUpdateSetting(setting.key, !session.settings[setting.key as keyof typeof session.settings])}
                                className={`w-10 h-6 rounded-full relative transition-colors ${session.settings[setting.key as keyof typeof session.settings] ? 'bg-brand-red' : 'bg-zinc-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${session.settings[setting.key as keyof typeof session.settings] ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-6">
                     <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Connected Users</h3>
                     <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2 no-scrollbar">
                        {session.connectedUsers.map(u => (
                             <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                                <div className="flex items-center gap-3">
                                     <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" />
                                     <div>
                                         <p className="text-xs font-bold text-white">{u.name}</p>
                                         <p className="text-[10px] text-gray-500">{u.isHost ? 'Host' : 'Guest'}</p>
                                     </div>
                                </div>
                                {!u.isHost && (
                                    <button
                                        onClick={() => onBanUser(u.id)}
                                        className="text-xs text-red-500 px-2 py-1 bg-red-500/10 rounded font-bold hover:bg-red-500/20"
                                    >
                                        Ban
                                    </button>
                                )}
                             </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
};

// --- Player View ---
const PlayerView: React.FC<{ 
    session: JamSession | null, 
    isHost: boolean,
    onOpenHostPanel: () => void,
    onApproveSong: (song: Song) => void,
    onRejectSong: (song: Song) => void,
    onPlayTrack: (songId: string) => void,
    onPauseTrack: () => void,
    onResumeTrack: () => void,
    onSeekTrack: (time: number) => void,
    onNextTrack: () => void,
    onPrevTrack: () => void,
    chatMessages: ChatMessageData[],
    onSendMessage: (content: string) => void,
    onDeleteMessage: (msgId: string) => void,
    currentUserId: string,
    globalAudioProps: {
        progress: number;
        currentTime: number;
        duration: number;
        isPlaying: boolean;
    },
    onRevealTrack: (trackId: string) => void
}> = ({ session, isHost, onOpenHostPanel, onApproveSong, onRejectSong, onPlayTrack, onPauseTrack, onResumeTrack, onSeekTrack, onNextTrack, onPrevTrack, chatMessages, onSendMessage, onDeleteMessage, currentUserId, globalAudioProps, onRevealTrack }) => {
    const currentSong = session?.nowPlaying;
    const [showChat, setShowChat] = useState(false);
    const { progress, currentTime, duration, isPlaying } = globalAudioProps;

    // Format time (e.g., 65 -> "1:05")
    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        if (!isHost) return; // Only host can play/pause for now

        if (isPlaying) {
            onPauseTrack();
        } else {
            if (session?.nowPlaying && session.isPaused) {
                onResumeTrack();
            } else if (session?.nowPlaying) {
                // Not playing and no source node, restart track
                onPlayTrack(session.nowPlaying.id);
            }
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isHost || !duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newTime = percentage * duration;

        onSeekTrack(newTime);
    };

    return (
        <div className="flex flex-col h-full bg-black pb-24 relative">
            <Header showSettings={isHost} onSettingsClick={onOpenHostPanel} sessionCode={session?.code || session?.id.split('-')[0]} />

            {showChat && (
                <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setShowChat(false)}></div>
            )}
            <div className={`fixed right-0 top-0 bottom-0 z-40 transform transition-transform duration-300 ${showChat ? 'translate-x-0' : 'translate-x-full'}`} style={{ width: '80%', maxWidth: '320px' }}>
                <ChatPanel
                    messages={chatMessages}
                    onSendMessage={onSendMessage}
                    onDeleteMessage={onDeleteMessage}
                    currentUserId={currentUserId}
                    isHost={isHost}
                />
            </div>

            <button
                onClick={() => setShowChat(!showChat)}
                className="fixed top-20 right-4 bg-black/60 backdrop-blur-md p-2.5 rounded-full text-white shadow-xl z-20 border border-white/10 hover:bg-black/80 transition-colors"
            >
                <MessageCircle size={20} />
            </button>

            <div className="flex-1 overflow-hidden relative flex flex-col">
                {currentSong ? (
                    <div className="flex-1 relative flex flex-col justify-start pt-6 px-6">
                        <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-brand-red/10 to-transparent pointer-events-none"></div>

                        {/* CD / Album Art */}
                        <div className="relative aspect-square w-full max-w-[280px] mx-auto mb-6 rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(220,38,38,0.3)] border border-white/10 group z-10 shrink-0">
                            <img src={currentSong.coverUrl} alt="Album Art" className="w-full h-full object-cover" />
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                                {session?.settings.syncMode ? (
                                    <>
                                        <Wifi size={12} className="text-brand-red animate-pulse" />
                                        <span className="text-[10px] font-bold tracking-wider">SYNC ACTIVE</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse"></span>
                                        <span className="text-[10px] font-bold tracking-wider">LIVE</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mb-6 px-2 text-center">
                            <h2 className="text-2xl font-bold text-white truncate mb-1">{currentSong.title}</h2>
                            <p className="text-gray-400 text-lg truncate">{currentSong.artist}</p>
                            <p className="text-xs text-brand-red mt-1 uppercase tracking-widest font-bold">{currentSong.source}</p>
                        </div>

                        <div className="mb-6 px-4">
                            <div className="w-full h-3 bg-zinc-800 rounded-full mb-2 cursor-pointer relative overflow-hidden group" onClick={handleSeek}>
                                <div className="absolute h-full bg-brand-red group-hover:bg-brand-red/80 rounded-full transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-6 mb-4 z-10 shrink-0">
                            <button className="text-gray-400 hover:text-white"><Shuffle size={20} /></button>
                            <button className={`text-white hover:text-brand-red ${!isHost ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => isHost && onPrevTrack()}><SkipBack size={28} fill="currentColor" /></button>
                            <button
                                className={`w-14 h-14 rounded-full bg-brand-red text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform ${!isHost ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handlePlayPause}
                            >
                                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                            </button>
                            <button className={`text-white hover:text-brand-red ${!isHost ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => isHost && onNextTrack()}><SkipForward size={28} fill="currentColor" /></button>
                            <button className="text-gray-400 hover:text-white"><Repeat size={20} /></button>
                        </div>

                        {/* Chat Mobile Style Live Overlay */}
                        <div className="flex-1 min-h-[150px] relative mt-2 w-full max-w-lg mx-auto overflow-hidden">
                            <LiveChatOverlay
                                messages={chatMessages}
                                onSendMessage={onSendMessage}
                                onDeleteMessage={onDeleteMessage}
                                currentUserId={currentUserId}
                                isHost={isHost}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500">
                        <Disc size={64} className="mx-auto mb-4 opacity-20" />
                        <h2 className="text-xl font-bold text-white mb-2">No track playing</h2>
                        <p className="text-sm">Search and add tracks to the queue to start jamming!</p>

                        <div className="flex-1 min-h-[150px] relative mt-10 w-full max-w-lg mx-auto overflow-hidden">
                            <LiveChatOverlay
                                messages={chatMessages}
                                onSendMessage={onSendMessage}
                                onDeleteMessage={onDeleteMessage}
                                currentUserId={currentUserId}
                                isHost={isHost}
                            />
                        </div>
                    </div>
                )}

                <div className="px-6 py-6 bg-zinc-950 mt-auto rounded-t-3xl border-t border-white/5 space-y-6">
                    {/* Approval Queue (Host Only) */}
                    {isHost && session?.settings.approvalRequired && session?.approvalQueue.length > 0 && (
                        <div className="animate-fade-in">
                             <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-brand-red uppercase tracking-wider">Needs Approval</h3>
                                <span className="bg-brand-red/20 text-brand-red text-xs px-2 py-0.5 rounded-full font-bold">{session.approvalQueue.length}</span>
                            </div>
                            <div className="space-y-1 mb-6 border-l-2 border-brand-red/30 pl-2">
                                {session.approvalQueue.map((song, idx) => (
                                    <SongItem 
                                        key={idx} 
                                        song={song} 
                                        isApproval 
                                        onApprove={() => onApproveSong(song)}
                                        onReject={() => onRejectSong(song)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Up Next</h3>
                            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
                                <Users size={12} className="text-gray-400" />
                                <span className="text-xs font-bold text-gray-300">124</span>
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            {session?.queue.map((song, idx) => (
                                <SongItem
                                    key={idx}
                                    song={song}
                                    isQueue
                                    onVote={() => {}}
                                    onPlay={isHost ? () => onPlayTrack(song.id) : undefined}
                                    isAnonymousSession={session?.isAnonymous}
                                    isHost={isHost}
                                    isPlaying={song.id === currentSong?.id}
                                    onReveal={() => onRevealTrack(song.id)}
                                />
                            ))}
                            {(!session?.queue || session.queue.length === 0) && (
                                <div className="text-center py-8 text-gray-500 text-sm bg-zinc-900/50 rounded-xl border border-dashed border-zinc-800">
                                    <p>Queue is empty.</p>
                                    <p className="text-xs mt-1">Add some tracks!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Search View ---
const SearchView: React.FC<{ 
    onAddSong: (song: Song) => void,
    isApprovalMode: boolean,
    session: JamSession | null
}> = ({ onAddSong, isApprovalMode, session }) => {
    const [query, setQuery] = useState('');
    const [searchPlatform, setSearchPlatform] = useState<'audius' | 'youtube'>('audius');
    const [activeTab, setActiveTab] = useState<'All' | 'Audius' | 'YouTube' | 'Local'>('All');
    const [apiResults, setApiResults] = useState<Song[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const { addNotification } = useNotifications();
    
    // Audio Preview State
    const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
    const [previewingSongId, setPreviewingSongId] = useState<string | null>(null);

    useEffect(() => {
        if (!query) {
            setApiResults([]);
            return;
        }

        const debounceDelay = searchPlatform === 'youtube' ? 1000 : 500;

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&platform=${searchPlatform}`);
                if (res.ok) {
                    const data = await res.json();
                    const mappedData: Song[] = data.map((d: any) => ({
                        id: d.id,
                        sourceId: d.sourceId,
                        title: d.title,
                        artist: d.artist,
                        coverUrl: d.coverUrl,
                        source: (d.platform && d.platform.toLowerCase() === 'youtube') ? 'YouTube' : 'Audius',
                        duration: d.duration > 0 ? `${Math.floor(d.duration / 60)}:${(d.duration % 60).toString().padStart(2, '0')}` : 'Live',
                        votes: 0,
                        addedBy: ''
                    }));
                    setApiResults(mappedData);
                }
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setIsSearching(false);
            }
        }, debounceDelay);

        return () => clearTimeout(delayDebounceFn);
    }, [query, searchPlatform]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (previewAudio) {
                previewAudio.pause();
                previewAudio.src = '';
            }
        };
    }, [previewAudio]);

    const handlePlayPreview = (song: Song) => {
        if (!song.sourceId) return;

        // Cannot preview if a jam is currently playing to avoid overlap
        if (session?.nowPlaying && !session.isPaused) {
            alert('Preview is disabled while a Jam track is playing. Pause the Jam to preview.');
            return;
        }

        // If clicking the same song that is currently playing, pause it
        if (previewingSongId === song.id && previewAudio) {
            previewAudio.pause();
            setPreviewingSongId(null);
            return;
        }

        // Stop any currently playing audio
        if (previewAudio) {
            previewAudio.pause();
        }

        const isYoutube = song.source && song.source.toLowerCase() === 'youtube';
        const streamUrl = isYoutube
            ? `/api/stream/youtube/${song.sourceId}`
            : `https://discoveryprovider.audius.co/v1/tracks/${song.sourceId}/stream`;

        // Create new audio element
        const audio = new Audio(streamUrl);
        audio.play().catch(e => console.error("Error playing preview:", e));

        // Listen for end to reset state
        audio.onended = () => {
            setPreviewingSongId(null);
        };

        setPreviewAudio(audio);
        setPreviewingSongId(song.id);
    };

    // Simulating aggregation
    const localResults = searchSongs(query);
    const results = [...localResults, ...apiResults].filter(s => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Local') return s.source === 'Local';
        // Case-insensitive check because search API can return mixed cases
        return s.source && s.source.toLowerCase() === activeTab.toLowerCase();
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Mock upload
            const newSong: Song = {
                id: Math.random().toString(),
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: 'Local Upload',
                coverUrl: 'https://picsum.photos/200/200?random=99',
                source: 'Local',
                votes: 1,
                addedBy: 'Me',
                duration: '3:00'
            };
            onAddSong(newSong);
        }
    };

    return (
        <div className="flex flex-col h-full bg-black pb-24">
             <div className="p-4 sticky top-0 bg-black/95 z-20 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-4">Find Music</h2>
                
                {/* Platform Toggle (Audius / YouTube) */}
                <div className="flex gap-2 mb-4 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl">
                    <button
                       onClick={() => setSearchPlatform('audius')}
                       className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${searchPlatform === 'audius' ? 'bg-zinc-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                       Audius
                    </button>
                    <button
                       onClick={() => setSearchPlatform('youtube')}
                       className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${searchPlatform === 'youtube' ? 'bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/30' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                       <Play size={14} fill={searchPlatform === 'youtube' ? 'currentColor' : 'none'} /> YouTube
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input 
                        type="text" 
                        placeholder={`Search on ${searchPlatform === 'audius' ? 'Audius' : 'YouTube'}...`}
                        className={`w-full bg-zinc-900 border text-white pl-12 pr-12 py-3.5 rounded-xl outline-none transition-all placeholder:text-zinc-600 ${searchPlatform === 'youtube' ? 'border-[#FF0000]/50 focus:border-[#FF0000]' : 'border-zinc-800 focus:border-brand-red'}`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
                {activeTab === 'Local' && (
                     <div className="mb-6 bg-zinc-900 border border-dashed border-zinc-700 rounded-xl p-6 text-center">
                        <Upload className="mx-auto text-gray-500 mb-2" size={32} />
                        <h3 className="text-white font-bold mb-1">Upload Local File</h3>
                        <p className="text-xs text-gray-500 mb-4">Support for MP3, WAV (Max 20MB)</p>
                        <input type="file" id="file-upload" className="hidden" accept="audio/*" onChange={handleFileUpload} />
                        <label htmlFor="file-upload" className="inline-block bg-white text-black px-6 py-2 rounded-full text-sm font-bold cursor-pointer hover:bg-gray-200">
                            Select File
                        </label>
                     </div>
                )}

                <div className="space-y-1">
                    {query ? (
                        <>
                            {isSearching && <div className="text-center text-gray-500 py-4">Searching...</div>}
                            {results.map(song => (
                                <SongItem
                                    key={song.id}
                                    song={song}
                                    onAdd={() => onAddSong(song)}
                                    isPlaying={previewingSongId === song.id}
                                    onPlay={() => handlePlayPreview(song)}
                                />
                            ))}
                            {results.length === 0 && !isSearching && (
                                <div className="text-center text-gray-500 py-4">No results found.</div>
                            )}
                        </>
                    ) : (
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">Live Queue</h3>
                            </div>
                            {session?.queue.map((song, idx) => (
                                <SongItem
                                    key={idx}
                                    song={song}
                                    isQueue
                                    onVote={() => {}}
                                    isPlaying={previewingSongId === song.id}
                                    onPlay={() => handlePlayPreview(song)}
                                />
                            ))}
                            {(!session?.queue || session.queue.length === 0) && (
                                <div className="text-center py-8 text-gray-500 text-sm bg-zinc-900/50 rounded-xl border border-dashed border-zinc-800">
                                    <p>Queue is empty.</p>
                                    <p className="text-xs mt-1">Search to add some tracks!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {isApprovalMode && query && results.length > 0 && (
                    <div className="mt-4 p-3 bg-brand-red/10 rounded-lg text-center text-xs text-brand-red border border-brand-red/20">
                        Suggestion Mode is ON: Songs will require host approval.
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Profile View ---
const ProfileView: React.FC<{ user: User, onLogout: () => void, onChangeView: (v: ViewState) => void }> = ({ user, onLogout, onChangeView }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [friendCount, setFriendCount] = useState(0);

    useEffect(() => {
        fetch(`/api/users/${user.id}/sessions`)
            .then(res => res.json())
            .then(data => setHistory(data))
            .catch(console.error);

        fetch(`/api/friends/${user.id}`)
            .then(res => res.json())
            .then(data => {
                setFriendCount(data.filter((f: any) => f.status === 'ACCEPTED').length);
            })
            .catch(console.error);
    }, [user.id]);

    return (
        <div className="h-full bg-black flex flex-col pt-8 pb-24 overflow-y-auto">
             <div className="px-6 flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-white overflow-hidden">
                        <img src={user.avatar} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white leading-none">{user.name}</h2>
                        <p className="text-gray-500 text-sm mt-1">{user.bio || 'No bio yet.'}</p>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="text-xs font-bold text-white cursor-pointer hover:text-brand-red" onClick={() => onChangeView(ViewState.SOCIAL)}>{friendCount} <span className="text-gray-500 font-normal">Friends</span></div>
                            <div className="text-xs font-bold text-white">{history.length} <span className="text-gray-500 font-normal">Jams</span></div>
                        </div>
                    </div>
                </div>
             </div>

             <div className="px-6 mb-8">
                <div className="flex gap-2 mb-4">
                    <Button variant="secondary" className="flex-1 text-xs h-9">Edit Profile</Button>
                    <Button variant="secondary" className="w-10 h-9 p-0 flex items-center justify-center"><Share2 size={16} /></Button>
                </div>
             </div>

             <div className="flex-1 bg-zinc-950 rounded-t-3xl border-t border-white/10 p-6 space-y-8">
                 {/* Pinned Songs */}
                 <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Smartphone size={14} /> Pinned Tracks
                    </h3>
                    <div className="space-y-2">
                        {user.pinnedSongs?.length ? user.pinnedSongs.map((song, i) => (
                             <div key={i} className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-lg">
                                <img src={song.coverUrl} className="w-10 h-10 rounded bg-zinc-800 object-cover" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold truncate">{song.title}</div>
                                    <div className="text-xs text-gray-500 truncate">{song.artist}</div>
                                </div>
                             </div>
                        )) : (
                            <div className="text-sm text-gray-500 italic">No pinned tracks yet.</div>
                        )}
                    </div>
                 </div>

                 {/* History */}
                 <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Radio size={14} /> Jam History
                    </h3>
                    <div className="space-y-3">
                        {history.length > 0 ? history.map((participation: any) => (
                            <div key={participation.id} className="bg-zinc-900 p-4 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${participation.role === 'HOST' ? 'bg-brand-red/20 text-brand-red' : 'bg-blue-500/20 text-blue-500'}`}>
                                        <Disc size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{participation.session.name || 'Untitled Jam'}</div>
                                        <div className="text-[10px] text-gray-500">
                                            {new Date(participation.joinedAt).toLocaleDateString()} • {participation.role}
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="text-gray-500" />
                            </div>
                        )) : (
                            <div className="text-sm text-gray-500 italic">No jam history yet. Join a room!</div>
                        )}
                    </div>
                 </div>

                 <div className="pt-4 border-t border-zinc-800">
                     <Button 
                        variant="secondary" 
                        fullWidth 
                        onClick={() => onChangeView(ViewState.CAR_MODE)}
                        className="flex items-center gap-2 bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 mb-4"
                     >
                        <Car size={18} /> Switch to Car Mode
                     </Button>

                     <Button
                        variant="ghost"
                        fullWidth
                        onClick={() => {
                            localStorage.removeItem('onlyjam_userId');
                            onLogout();
                        }}
                        className="text-red-500 hover:bg-red-950/30"
                     >
                        Log Out
                     </Button>
                 </div>
             </div>
        </div>
    );
};

// --- Main App ---
const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<JamSession | null>(null);
  const [showHostPanel, setShowHostPanel] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessageData[]>([]);
  const { notifications, addNotification, removeNotification } = useNotifications();

  // Global Audio State
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const hasTriggeredNextRef = React.useRef(false);

  // Global Audio Sync Logic (Moved from PlayerView)
  useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.crossOrigin = "anonymous";

            audioRef.current.addEventListener('timeupdate', () => {
                if (audioRef.current) {
                    setAudioCurrentTime(audioRef.current.currentTime);
                    if (audioRef.current.duration) {
                        setAudioDuration(audioRef.current.duration);
                        setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
                    }
                }
            });

            audioRef.current.addEventListener('ended', () => {
                if (user?.isHost && !hasTriggeredNextRef.current) {
                    hasTriggeredNextRef.current = true;
                    handleNextTrack();
                }
            });

            audioRef.current.addEventListener('loadedmetadata', () => {
                if (audioRef.current) {
                    setAudioDuration(audioRef.current.duration);
                }
            });
        }

        const audio = audioRef.current;
        const currentSong = session?.nowPlaying;

        if (!currentSong || !session.currentTrackStartTime) {
            audio.pause();
            audio.src = '';
            setIsAudioPlaying(false);
            setAudioProgress(0);
            setAudioCurrentTime(0);
            return;
        }

        const playTrack = async () => {
            if (!currentSong.sourceId) return;

            const isYoutube = currentSong.source && currentSong.source.toLowerCase() === 'youtube';
            const streamUrl = isYoutube
                ? `/api/stream/youtube/${currentSong.sourceId}`
                : `https://discoveryprovider.audius.co/v1/tracks/${currentSong.sourceId}/stream`;

            if (audio.src !== streamUrl && audio.src !== window.location.origin + streamUrl) {
                audio.src = streamUrl;
                hasTriggeredNextRef.current = false;
            }

            const serverStartTime = new Date(session.currentTrackStartTime!).getTime();
            const now = Date.now();
            let offset = (now - serverStartTime) / 1000;
            if (offset < 0) offset = 0;

            if (Math.abs(audio.currentTime - offset) > 2) {
                audio.currentTime = offset;
            }

            if (session.isPaused) {
                audio.pause();
                setIsAudioPlaying(false);
            } else {
                try {
                    await audio.play();
                    setIsAudioPlaying(true);
                } catch (error: any) {
                    console.error("Error playing audio for sync:", error);
                    setIsAudioPlaying(false);
                    // Instead of an alert which blocks the main thread,
                    // we log it and perhaps wait for a click elsewhere to resume.
                    // The user interaction error (NotAllowedError) just means they need to tap play or tap anywhere.
                }
            }
        };

        playTrack();
  }, [session?.nowPlaying?.id, session?.currentTrackStartTime, session?.isPaused]);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    // F6 - Load full session state
    newSocket.on('session-state', (data: any) => {
        if (data.session) {
            // Map DB session format to frontend format
            const activeQueue = data.session.queue.filter((t: any) => t.status === 'QUEUED' || t.status === 'PLAYING');
            const nowPlaying = activeQueue.find((t: any) => t.status === 'PLAYING') || null;
            const queue = activeQueue.filter((t: any) => t.status === 'QUEUED');

            setSession(prev => ({
                ...(prev || createJam(data.session.hostId)),
                id: data.session.id,
                name: data.session.name,
                isPaused: data.session.isPaused,
                currentTrackStartTime: data.session.currentTrackStartTime,
                listenerCount: data.session.listenerCount,
                nowPlaying: nowPlaying ? {
                    ...nowPlaying,
                    source: nowPlaying.platform,
                    coverUrl: nowPlaying.thumbnail
                } : undefined,
                queue: queue.map((t: any) => ({
                    ...t,
                    source: t.platform,
                    coverUrl: t.thumbnail
                })),
                settings: {
                    ...(prev?.settings || {
                        votingEnabled: true,
                        guestUploads: true,
                        explicitFilter: false,
                        approvalRequired: false,
                        guestVolumeControl: false,
                        syncMode: false
                    }),
                    approvalRequired: data.session.approvalRequired
                }
            }));

            // F6 Persistence logic
            localStorage.setItem('onlyjam_sessionId', data.session.id);

            // Re-sync isHost state based on session data
            const savedUserId = localStorage.getItem('onlyjam_userId');
            if (savedUserId) {
                const isHost = data.session.hostId === savedUserId;
                setUser(prev => prev ? { ...prev, isHost } : null);
            }
        }
        if (data.messages) {
            setChatMessages(data.messages);
        }
    });

    // F2 - Chat Events
    newSocket.on('new-message', (msg: ChatMessageData) => {
        setChatMessages(prev => [...prev, msg]);
    });

    newSocket.on('message-deleted', ({ messageId }) => {
        setChatMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true } : m));
    });

    // F3 - Listener Count update
    newSocket.on('listener-count', ({ count }) => {
        setSession(prev => prev ? { ...prev, listenerCount: count } : null);
    });

    // F5 - Notifications
    newSocket.on('notification', (data: any) => {
        // Only show if it's for everyone, or specifically targeted
        if (!data.targetId || data.targetId === user?.id) {
            addNotification({ type: data.type, message: data.message });
        }
    });

    newSocket.on('track-added', (track: any) => {
      setSession(prev => {
        if (!prev) return null;
        // Avoid duplicates if we added it locally, but update the temp ID to DB ID
        const updateQueue = (queue: Song[]) => {
           const existingIdx = queue.findIndex(t => t.id === track.tempId || t.id === track.id || t.sourceId === track.sourceId);
           if (existingIdx !== -1) {
               const newQueue = [...queue];
               newQueue[existingIdx] = { ...newQueue[existingIdx], id: track.id };
               return newQueue;
           }
           return null;
        };

        const existingInQueue = updateQueue(prev.queue);
        let updatedState = { ...prev };

        if (existingInQueue) {
            updatedState = { ...prev, queue: existingInQueue };
        } else {
            const existingInApproval = updateQueue(prev.approvalQueue);
            if (existingInApproval) {
                updatedState = { ...prev, approvalQueue: existingInApproval };
            } else if (track.status === 'PENDING') {
                updatedState = {
                    ...prev,
                    approvalQueue: [...prev.approvalQueue, track]
                };
            } else if (track.status === 'PLAYING') {
                updatedState = {
                    ...prev,
                    nowPlaying: track
                };
            } else {
                updatedState = {
                    ...prev,
                    queue: [...prev.queue, track]
                };
            }
        }
        
        return updatedState;
      });
    });

    newSocket.on('track-playing', ({ trackId, startTime }) => {
        setSession(prev => {
            if (!prev) return null;
            const track = prev.queue.find(t => t.id === trackId) || prev.nowPlaying;
            const queue = prev.queue.filter(t => t.id !== trackId);
            return {
                ...prev,
                nowPlaying: track,
                queue: queue,
                currentTrackStartTime: startTime,
                isPaused: false
            };
        });
    });

    newSocket.on('YOU_ARE_BANNED', ({ userId }) => {
        // Only ban the user that actually matches
        // using the global user state would be stale in this closure without dependency,
        // but we can check if it matches since we store it at the top level
        setUser(currentUser => {
            if (currentUser && currentUser.id === userId) {
                alert("You have been banned from this session.");
                setSession(null);
                setView(ViewState.HOME);
            }
            return currentUser;
        });

        // Always remove the banned user from the connected list if we are not the one banned
        setSession(prev => prev ? {
            ...prev,
            connectedUsers: prev.connectedUsers.filter(u => u.id !== userId)
        } : null);
    });

    newSocket.on('session-joined', ({ session }) => {
        // Sync session from DB including currentTrackStartTime
        setSession(prev => prev ? {
            ...prev,
            currentTrackStartTime: session.currentTrackStartTime,
            isPaused: session.isPaused
        } : null);
    });

    newSocket.on('track-paused', () => {
        setSession(prev => prev ? { ...prev, isPaused: true } : null);
    });

    newSocket.on('track-resumed', ({ startTime }) => {
        setSession(prev => prev ? {
            ...prev,
            isPaused: false,
            currentTrackStartTime: startTime
        } : null);
    });

    newSocket.on('track-seeked', ({ startTime }) => {
        setSession(prev => prev ? {
            ...prev,
            currentTrackStartTime: startTime
        } : null);
    });

    newSocket.on('track-approved', ({ trackId }) => {
        setSession(prev => {
            if (!prev) return null;
            const track = prev.approvalQueue.find(t => t.id === trackId);
            if (!track) return prev;
            return {
                ...prev,
                approvalQueue: prev.approvalQueue.filter(t => t.id !== trackId),
                queue: [...prev.queue, { ...track, status: 'QUEUED' }]
            }
        });
    });

    newSocket.on('track-rejected', ({ trackId }) => {
        setSession(prev => {
            if (!prev) return null;
            return {
                ...prev,
                approvalQueue: prev.approvalQueue.filter(t => t.id !== trackId)
            }
        });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Auto-login check
  useEffect(() => {
      const savedUserId = localStorage.getItem('onlyjam_userId');
      const savedSessionId = localStorage.getItem('onlyjam_sessionId');

      if (savedUserId) {
          // Verify user exists and load profile
          fetch(`/api/users/${savedUserId}`)
            .then(res => {
                if (res.ok) return res.json();
                throw new Error('User not found');
            })
            .then(dbUser => {
                const loadedUser = {
                    ...MOCK_USER,
                    ...dbUser,
                    name: dbUser.pseudo,
                    isHost: false
                };
                setUser(loadedUser as User);

                // If they have an active session, auto-join it
                if (savedSessionId && socket) {
                    socket.emit('join-session', { sessionId: savedSessionId, userId: loadedUser.id });
                    setView(ViewState.PLAYER);
                } else if (!savedSessionId) {
                    setView(ViewState.HOME);
                }
            })
            .catch(() => {
                localStorage.removeItem('onlyjam_userId');
                localStorage.removeItem('onlyjam_sessionId');
            });
      }
  }, [socket]); // Re-run if socket becomes available

  // Initialize simulated session for host flow
  const handleOnboardingComplete = async (data: Partial<User>) => {
      try {
          const res = await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          });
          const dbUser = await res.json();
          const newUser = {
              ...MOCK_USER,
              ...dbUser,
              name: dbUser.pseudo, // Map to frontend prop
              isHost: false
          };
          localStorage.setItem('onlyjam_userId', dbUser.id);
          setUser(newUser as User);
          setView(ViewState.HOME); // Move to selection screen / home
      } catch (error) {
          console.error("Failed to create user", error);
      }
  };

  const leaveSession = () => {
      if (socket) {
          socket.emit('leave-session', { sessionId: session?.id, userId: user?.id });
      }
      setSession(null);
      localStorage.removeItem('onlyjam_sessionId');
      setView(ViewState.HOME);
  };

  const checkAndPromptLeave = (callback: () => void) => {
      if (session) {
          if (window.confirm("You are currently in a Jam. Do you want to leave it to join a new one?")) {
              leaveSession();
              callback();
          }
      } else {
          callback();
      }
  };

  const startSession = async (name: string, genre: string, isPublic: boolean, isAnonymous: boolean) => {
    if (!user) return;
    const hostUser = { ...user, isHost: true };
    setUser(hostUser);
    
    setShowCreateModal(false);

    try {
        const res = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                genre,
                isPublic,
                isAnonymous,
                hostId: hostUser.id
            })
        });
        const dbSession = await res.json();

        // Create new session with updated types
        const newSession: JamSession = {
            ...createJam(hostUser.id),
            id: dbSession.id,
            code: dbSession.sessionId, // Keep the JAM-XXXX format for display
            isAnonymous: dbSession.isAnonymous,
            approvalQueue: [],
            history: [],
            connectedUsers: [hostUser],
            settings: {
                votingEnabled: true,
                guestUploads: true,
                explicitFilter: false,
                approvalRequired: false,
                guestVolumeControl: false,
                syncMode: false
            }
        };

        setSession(newSession);
        setView(ViewState.PLAYER);
        setShowHostPanel(true);
        if (socket) {
            socket.emit('join-session', { sessionId: newSession.id, userId: hostUser.id });
        }
    } catch (error) {
        console.error('Failed to create session in DB', error);
    }
  };

  const joinSession = async (code: string) => {
      if (!user || !socket) return;

      setShowJoinModal(false);

      try {
          socket.emit('join-session', { sessionId: code, userId: user.id });
          setView(ViewState.PLAYER);
      } catch (error) {
          console.error("Failed to join session", error);
      }
  };

  const handleAddSong = (song: Song) => {
      if (!session || !user) return;
      // Optimistically add with temporary ID, preserving the original sourceId
      const tempId = Math.random().toString();
      // Ensure we DO NOT overwrite sourceId with the backend id (which might be prefixed with yt- or ad-)
      // We keep song.sourceId intact as returned by the search API
      const newSong = { ...song, addedBy: user.id, votes: 1, id: tempId };
      
      const isAutoPlay = user.isHost && !session.nowPlaying && session.queue.length === 0 && !session.settings.approvalRequired;

      if (socket) {
        socket.emit('add-track', {
            sessionId: session.id,
            track: newSong,
            userId: user.id,
            isHost: user.isHost,
            autoPlay: isAutoPlay // tell server to autoplay this
        });
      }

      setSession(prev => {
          if (!prev) return null;
          // Logic: If host requires approval AND user is not host -> approval queue
          if (prev.settings.approvalRequired && !user.isHost) {
              return {
                  ...prev,
                  approvalQueue: [...prev.approvalQueue, { ...newSong, status: 'PENDING' }]
              };
          }

          return {
              ...prev,
              queue: [...prev.queue, { ...newSong, status: 'QUEUED' }]
          };
      });

      // Navigate back to player to see feedback (only for host)
      if (user.isHost && view !== ViewState.PLAYER) setView(ViewState.PLAYER);
  };

  const handleApproveSong = (song: Song) => {
      if (socket) {
          socket.emit('approve-track', { trackId: song.id, sessionId: session?.id });
      }
      // Optimistic update
      setSession(prev => {
          if (!prev) return null;
          return {
              ...prev,
              approvalQueue: prev.approvalQueue.filter(s => s.id !== song.id),
              queue: [...prev.queue, { ...song, status: 'QUEUED' }]
          }
      });
  };

  const handleRejectSong = (song: Song) => {
      if (socket) {
          socket.emit('reject-track', { trackId: song.id, sessionId: session?.id });
      }
      // Optimistic update
      setSession(prev => {
          if (!prev) return null;
          return {
              ...prev,
              approvalQueue: prev.approvalQueue.filter(s => s.id !== song.id)
          }
      });
  };

  const handleBanUser = (userId: string) => {
      if (socket && session) {
          socket.emit('ban-user', { userId, sessionId: session.id });
      }
      setSession(prev => prev ? {
          ...prev,
          connectedUsers: prev.connectedUsers.filter(u => u.id !== userId)
      } : null);
  };

  const handlePlayTrack = (trackId: string) => {
      if (socket && session) {
          socket.emit('play-track', { trackId, sessionId: session.id });
      }
  };

  const handlePauseTrack = () => {
      if (socket && session) {
          socket.emit('pause-track', { sessionId: session.id });
      }
  };

  const handleResumeTrack = () => {
      if (socket && session) {
          socket.emit('resume-track', { sessionId: session.id });
      }
  };

  const handleSeekTrack = (time: number) => {
      if (socket && session) {
          socket.emit('seek-track', { sessionId: session.id, time });
      }
  };

  const handleSendMessage = (content: string) => {
      if (socket && session && user) {
          socket.emit('send-message', {
              sessionId: session.id,
              content,
              authorId: user.id
          });
      }
  };

  const handleDeleteMessage = (messageId: string) => {
      if (socket && session && user?.isHost) {
          socket.emit('delete-message', {
              sessionId: session.id,
              messageId
          });
      }
  };

  const handleNextTrack = React.useCallback(() => {
      if (socket && session && session.queue.length > 0) {
          const nextTrack = session.queue[0];
          socket.emit('play-track', { trackId: nextTrack.id, sessionId: session.id });
      }
  }, [socket, session]);

  const handlePrevTrack = () => {
      // In a real app we'd pop from history, but here we can just restart current or go to first in queue
      if (socket && session && session.nowPlaying) {
          socket.emit('play-track', { trackId: session.nowPlaying.id, sessionId: session.id });
      }
  };

  const handleRevealTrack = (trackId: string) => {
      if (socket && session) {
          socket.emit('reveal-track', { trackId, sessionId: session.id });
      }
  };

  const handleUpdateSetting = (key: keyof JamSession['settings'], val: boolean) => {
      setSession(prev => prev ? {
          ...prev,
          settings: { ...prev.settings, [key]: val }
      } : null);
  };

  // Render Logic
  const renderView = () => {
    switch(view) {
      case ViewState.LANDING:
        // First step now: Onboarding
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case ViewState.AUTH:
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 animate-fade-in">
                 <div className="w-full max-w-sm mb-12">
                     <h2 className="text-3xl font-bold mb-2">Hello, {user?.name || user?.pseudo}</h2>
                     <p className="text-gray-400">Ready to Jam?</p>
                 </div>
                 <div className="w-full max-w-sm space-y-4">
                     <Button onClick={() => setShowCreateModal(true)} fullWidth className="h-16 text-lg bg-gradient-to-r from-brand-red to-orange-600 shadow-[0_0_20px_rgba(255,0,0,0.3)]">
                        <Radio className="mr-2" /> Start a Jam (Host)
                     </Button>
                     <div className="text-center text-gray-500 text-sm py-2">- OR -</div>
                     <Button onClick={() => setShowJoinModal(true)} variant="secondary" fullWidth className="h-14">
                        <Users className="mr-2" /> Join Existing Jam
                     </Button>
                 </div>
            </div>
        );
      case ViewState.HOME:
          return <HomeDashboard
              user={user}
              onStartSession={() => checkAndPromptLeave(() => setShowCreateModal(true))}
              onJoinSession={() => checkAndPromptLeave(() => setShowJoinModal(true))}
              onJoinSessionById={(id) => checkAndPromptLeave(() => joinSession(id))}
              onChangeView={setView}
          />;
      case ViewState.PLAYER:
      case ViewState.HOST_PANEL:
        return <PlayerView 
            session={session} 
            isHost={user?.isHost || false} 
            onOpenHostPanel={() => setShowHostPanel(true)} 
            onApproveSong={handleApproveSong}
            onRejectSong={handleRejectSong}
            onPlayTrack={handlePlayTrack}
            onPauseTrack={handlePauseTrack}
            onResumeTrack={handleResumeTrack}
            onSeekTrack={handleSeekTrack}
            onNextTrack={handleNextTrack}
            onPrevTrack={handlePrevTrack}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            currentUserId={user?.id || ''}
            globalAudioProps={{
                progress: audioProgress,
                currentTime: audioCurrentTime,
                duration: audioDuration,
                isPlaying: isAudioPlaying
            }}
            onLeaveSession={leaveSession}
            onRevealTrack={handleRevealTrack}
        />;
      case ViewState.GUEST_JOIN:
      case ViewState.SEARCH:
        return <SearchView 
            onAddSong={handleAddSong} 
            isApprovalMode={session?.settings.approvalRequired && !user?.isHost || false}
            session={session}
        />;
      case ViewState.DISCOVER:
        return <DiscoverView onJoinSession={(sessionId) => {
            checkAndPromptLeave(() => {
                if (socket && user) {
                    socket.emit('join-session', { sessionId, userId: user.id });
                    setView(ViewState.PLAYER);
                }
            });
        }} />;
      case ViewState.SOCIAL:
        return user ? <SocialView currentUser={user} /> : null;
      case ViewState.PROFILE:
        return user ? <ProfileView user={user} onLogout={() => setView(ViewState.LANDING)} onChangeView={setView} /> : null;
      case ViewState.CAR_MODE:
        return <CarView 
            session={session} 
            isPlaying={isAudioPlaying}
            onTogglePlay={() => {
                 if (!isHost) return;
                 if (isAudioPlaying) {
                     handlePauseTrack();
                 } else {
                     if (session?.nowPlaying && session.isPaused) {
                         handleResumeTrack();
                     } else if (session?.nowPlaying) {
                         handlePlayTrack(session.nowPlaying.id);
                     }
                 }
            }}
            onExit={() => setView(ViewState.PROFILE)} 
        />;
      default:
        return <div>View Not Found</div>;
    }
  };

  const isHost = user?.isHost || false;
  const showMiniPlayer = session?.nowPlaying && view !== ViewState.PLAYER && view !== ViewState.HOST_PANEL && view !== ViewState.CAR_MODE && view !== ViewState.LANDING && view !== ViewState.AUTH && view !== ViewState.GUEST_JOIN;

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-brand-red selection:text-white">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      {renderView()}

      {/* Overlays */}
      {showHostPanel && session && (
          <HostPanel 
            session={session} 
            onClose={() => setShowHostPanel(false)} 
            onUpdateSetting={handleUpdateSetting}
            onBanUser={handleBanUser}
          />
      )}

      {showMiniPlayer && session.nowPlaying && (
          <MiniPlayer
             currentSong={session.nowPlaying}
             isPlaying={isAudioPlaying}
             isHost={isHost}
             onPlayPause={(e) => {
                 e.stopPropagation();
                 if (!isHost) return;
                 if (isAudioPlaying) {
                     handlePauseTrack();
                 } else {
                     if (session.nowPlaying && session.isPaused) {
                         handleResumeTrack();
                     } else {
                         handlePlayTrack(session.nowPlaying.id);
                     }
                 }
             }}
             onNext={(e) => {
                 e.stopPropagation();
                 if (!isHost) return;
                 handleNextTrack();
             }}
             onClick={() => setView(ViewState.PLAYER)}
          />
      )}

      {/* Navigation (Only show if authenticated and not in Car Mode or Landing) */}
      {view !== ViewState.LANDING && view !== ViewState.AUTH && view !== ViewState.CAR_MODE && (
          <Navigation currentView={view} onChangeView={setView} />
      )}

      {showCreateModal && user && (
          <CreateJamModal
              onClose={() => setShowCreateModal(false)}
              onStart={startSession}
              defaultName={`${user.name || user.pseudo || 'My'}'s Jam`}
          />
      )}

      {showJoinModal && (
          <JoinJamModal
              onClose={() => setShowJoinModal(false)}
              onJoin={joinSession}
          />
      )}
    </div>
  );
};

export default App;