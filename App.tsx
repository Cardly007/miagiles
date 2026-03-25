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
  Music, UserPlus, CheckCircle, Smartphone, Wifi, X, Cloud, Disc
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
    onPrevTrack: () => void
}> = ({ session, isHost, onOpenHostPanel, onApproveSong, onRejectSong, onPlayTrack, onPauseTrack, onResumeTrack, onSeekTrack, onNextTrack, onPrevTrack }) => {
    const currentSong = session?.nowPlaying;
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [sourceNode, setSourceNode] = useState<AudioBufferSourceNode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Setup Audio Context & Sync
    useEffect(() => {
        if (!session?.nowPlaying || !session.currentTrackStartTime) {
            if (sourceNode) {
                sourceNode.stop();
                setSourceNode(null);
            }
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
            return;
        }

        let actx = audioContext;
        if (!actx) {
            actx = new (window.AudioContext || (window as any).webkitAudioContext)();
            setAudioContext(actx);
        }

        const playTrack = async () => {
             if (!currentSong?.sourceId) return;

             // 1. Fetch the stream from Audius
             let streamUrl = `https://discoveryprovider.audius.co/v1/tracks/${currentSong.sourceId}/stream`;

             try {
                // If it's already playing, stop the old one
                if (sourceNode) {
                    sourceNode.stop();
                    setSourceNode(null);
                }

                const response = await fetch(streamUrl);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await actx!.decodeAudioData(arrayBuffer);
                setDuration(audioBuffer.duration);

                const source = actx!.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(actx!.destination);

                // Calculate Sync
                const serverStartTime = new Date(session.currentTrackStartTime!).getTime();
                const now = Date.now();
                let offset = (now - serverStartTime) / 1000;

                if (offset < 0) offset = 0;

                source.start(0, offset);
                setSourceNode(source);
                setIsPlaying(session.isPaused !== true);

                if (session.isPaused) {
                    actx!.suspend();
                } else if (actx!.state === 'suspended') {
                    actx!.resume();
                }

             } catch (error) {
                 console.error("Error playing audio for sync:", error);
             }
        };

        playTrack();

        return () => {
            if (sourceNode) {
                sourceNode.stop();
            }
        };
    }, [session?.nowPlaying?.id, session?.currentTrackStartTime, session?.isPaused]);

    // Progress updating
    const hasTriggeredNextRef = React.useRef(false);

    useEffect(() => {
        // Reset ref when a new track starts
        hasTriggeredNextRef.current = false;
    }, [session?.nowPlaying?.id]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && session?.currentTrackStartTime && duration > 0) {
            interval = setInterval(() => {
                const serverStartTime = new Date(session.currentTrackStartTime!).getTime();
                let now = Date.now();

                let currentSec = (now - serverStartTime) / 1000;

                // Track ends
                if (currentSec > duration) {
                    currentSec = duration;
                    if (isHost && !hasTriggeredNextRef.current) {
                        hasTriggeredNextRef.current = true;
                        onNextTrack();
                    }
                }

                setCurrentTime(currentSec);
                setProgress((currentSec / duration) * 100);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying, session?.currentTrackStartTime, duration, isHost, session?.queue]);

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
            if (audioContext && audioContext.state === 'suspended' && sourceNode) {
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
        <div className="flex flex-col h-full bg-black pb-24">
            <Header showSettings={isHost} onSettingsClick={onOpenHostPanel} />
            
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {currentSong ? (
                    <div className="p-6 relative">
                        <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-brand-red/10 to-transparent pointer-events-none"></div>

                        {/* CD / Album Art */}
                        <div className="relative aspect-square w-full max-w-[280px] mx-auto mb-8 mt-2 rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(220,38,38,0.3)] border border-white/10 group">
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

                        <div className="flex items-center justify-center gap-6 mb-8">
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
                    </div>
                ) : (
                    <div className="p-6 relative text-center py-20 text-gray-500">
                        <Disc size={64} className="mx-auto mb-4 opacity-20" />
                        <h2 className="text-xl font-bold text-white mb-2">No track playing</h2>
                        <p className="text-sm">Search and add tracks to the queue to start jamming!</p>
                    </div>
                )}

                <div className="px-6 pb-6 space-y-6">
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
                                <SongItem key={idx} song={song} isQueue onVote={() => {}} />
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
    const [activeTab, setActiveTab] = useState<'All' | 'Spotify' | 'YouTube' | 'SoundCloud' | 'Local'>('All');
    const [apiResults, setApiResults] = useState<Song[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Audio Preview State
    const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
    const [previewingSongId, setPreviewingSongId] = useState<string | null>(null);

    useEffect(() => {
        if (!query) {
            setApiResults([]);
            return;
        }
        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    const mappedData: Song[] = data.map((d: any) => ({
                        id: d.id,
                        sourceId: d.sourceId,
                        title: d.title,
                        artist: d.artist,
                        coverUrl: d.coverUrl,
                        source: d.platform === 'YOUTUBE' ? 'YouTube' : d.platform,
                        duration: `${Math.floor(d.duration / 60)}:${(d.duration % 60).toString().padStart(2, '0')}`,
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
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

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

        // Create new audio element
        const audio = new Audio(`https://discoveryprovider.audius.co/v1/tracks/${song.sourceId}/stream`);
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
        return s.source === activeTab;
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
                
                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search across all platforms..." 
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-brand-red text-white pl-12 pr-12 py-3.5 rounded-xl outline-none transition-all placeholder:text-zinc-600"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                {/* Platform Tabs */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {[
                        { id: 'All', label: 'All', color: 'bg-zinc-800' },
                        { id: 'Spotify', label: 'Spotify', color: 'bg-[#1DB954]' },
                        { id: 'YouTube', label: 'YouTube', color: 'bg-[#FF0000]' },
                        { id: 'SoundCloud', label: 'SoundCloud', color: 'bg-[#FF5500]' },
                        { id: 'Local', label: 'Files', color: 'bg-blue-500' },
                    ].map(tab => (
                         <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${activeTab === tab.id ? `${tab.color} border-transparent text-white` : 'border-zinc-800 text-gray-400 bg-black hover:bg-zinc-900'}`}
                         >
                            {tab.label}
                         </button>
                    ))}
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
                            <div className="text-xs font-bold text-white">{user.friends} <span className="text-gray-500 font-normal">Friends</span></div>
                            <div className="text-xs font-bold text-white">12 <span className="text-gray-500 font-normal">Jams</span></div>
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
                        {user.pinnedSongs?.map((song, i) => (
                             <div key={i} className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-lg">
                                <img src={song.coverUrl} className="w-10 h-10 rounded bg-zinc-800 object-cover" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold truncate">{song.title}</div>
                                    <div className="text-xs text-gray-500 truncate">{song.artist}</div>
                                </div>
                             </div>
                        ))}
                    </div>
                 </div>

                 {/* Imported Playlists */}
                 <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Cloud size={14} /> Playlists
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {user.playlists?.map(pl => (
                            <div key={pl.id} className="bg-zinc-900 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${pl.icon === 'green' ? 'bg-green-900/30 text-green-500' : 'bg-purple-900/30 text-purple-500'}`}>
                                    <Music size={20} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-bold truncate text-white">{pl.name}</div>
                                    <div className="text-[10px] text-gray-500">{pl.source}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>

                 {/* History */}
                 <div className="bg-zinc-900 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-zinc-800 transition-colors">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-950 rounded-full text-brand-red">
                            <Radio size={18} />
                        </div>
                        <span className="font-bold text-sm">Jam History</span>
                     </div>
                     <ArrowRight size={16} className="text-gray-500" />
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

                     <Button variant="ghost" fullWidth onClick={onLogout} className="text-red-500 hover:bg-red-950/30">
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
  const [isMusicPlaying, setIsMusicPlaying] = useState(false); // Mock play state
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

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
          setUser(newUser as User);
          setView(ViewState.HOME); // Move to selection screen / home
      } catch (error) {
          console.error("Failed to create user", error);
      }
  };

  const startSession = () => {
    if (!user) return;
    const hostUser = { ...user, isHost: true };
    setUser(hostUser);
    
    // Create new session with updated types
    const newSession: JamSession = {
        ...createJam(hostUser.id),
        id: 'JAM-8821', // Use fixed ID for demo so guest can join
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
      socket.emit('join-session', { sessionId: newSession.id, userId: user.id });
    }
  };

  const joinSession = () => {
      if (!user) return;
      // Simulate joining (In a real app, this would be an input code)
      // Using the fixed JAM-8821 for the demo mock
      const demoSessionId = 'JAM-8821';

      // Optimistically set mock session to show UI
      const newSession: JamSession = {
        ...createJam('host_other'),
        id: demoSessionId,
        approvalQueue: [],
        history: [],
        connectedUsers: [user],
        settings: {
            votingEnabled: true,
            guestUploads: true,
            explicitFilter: false,
            approvalRequired: true, // Simulate joining a stricter session
            guestVolumeControl: false,
            syncMode: false
        }
      };
      setSession(newSession);
      setView(ViewState.GUEST_JOIN);
      if (socket) {
        socket.emit('join-session', { sessionId: demoSessionId, userId: user.id });
      }
  };

  const handleAddSong = (song: Song) => {
      if (!session || !user) return;
      // Optimistically add with temporary ID, sourceId remains Audius ID
      const tempId = Math.random().toString();
      const newSong = { ...song, addedBy: user.id, votes: 1, sourceId: song.id, id: tempId };
      
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

  const handleNextTrack = () => {
      if (socket && session && session.queue.length > 0) {
          const nextTrack = session.queue[0];
          socket.emit('play-track', { trackId: nextTrack.id, sessionId: session.id });
      }
  };

  const handlePrevTrack = () => {
      // In a real app we'd pop from history, but here we can just restart current or go to first in queue
      if (socket && session && session.nowPlaying) {
          socket.emit('play-track', { trackId: session.nowPlaying.id, sessionId: session.id });
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
                     <h2 className="text-3xl font-bold mb-2">Hello, {user?.name}</h2>
                     <p className="text-gray-400">Ready to Jam?</p>
                 </div>
                 <div className="w-full max-w-sm space-y-4">
                     <Button onClick={startSession} fullWidth className="h-16 text-lg bg-gradient-to-r from-brand-red to-orange-600 shadow-[0_0_20px_rgba(255,0,0,0.3)]">
                        <Radio className="mr-2" /> Start a Jam (Host)
                     </Button>
                     <div className="text-center text-gray-500 text-sm py-2">- OR -</div>
                     <Button onClick={joinSession} variant="secondary" fullWidth className="h-14">
                        <Users className="mr-2" /> Join Existing Jam
                     </Button>
                 </div>
            </div>
        );
      case ViewState.HOME:
          return <HomeDashboard
              user={user}
              onStartSession={startSession}
              onJoinSession={joinSession}
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
        />;
      case ViewState.GUEST_JOIN:
      case ViewState.SEARCH:
        return <SearchView 
            onAddSong={handleAddSong} 
            isApprovalMode={session?.settings.approvalRequired && !user?.isHost || false}
            session={session}
        />;
      case ViewState.PROFILE:
        return user ? <ProfileView user={user} onLogout={() => setView(ViewState.LANDING)} onChangeView={setView} /> : null;
      case ViewState.CAR_MODE:
        return <CarView 
            session={session} 
            isPlaying={isMusicPlaying} 
            onTogglePlay={() => setIsMusicPlaying(!isMusicPlaying)}
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
             isPlaying={session.isPaused !== true}
             isHost={isHost}
             onPlayPause={(e) => {
                 e.stopPropagation();
                 if (!isHost) return;
                 if (session.isPaused !== true) {
                     handlePauseTrack();
                 } else {
                     handleResumeTrack();
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
    </div>
  );
};

export default App;