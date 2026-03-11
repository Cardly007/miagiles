export interface User {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  isHost: boolean;
  friends?: number;
  pinnedSongs?: Song[];
  playlists?: { id: string; name: string; source: 'Spotify' | 'Deezer'; icon: string }[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  source: 'Spotify' | 'YouTube' | 'SoundCloud' | 'AppleMusic' | 'Local';
  votes: number;
  addedBy: string;
  duration: string;
}

export interface JamSession {
  id: string;
  hostId: string;
  isActive: boolean;
  code: string;
  nowPlaying?: Song;
  queue: Song[];
  approvalQueue: Song[]; // New for "Suggestion Mode"
  history: Song[];
  connectedUsers: User[];
  settings: {
    votingEnabled: boolean;
    guestUploads: boolean;
    explicitFilter: boolean;
    requireApproval: boolean; // "Mode Suggestion"
    guestVolumeControl: boolean;
    syncMode: boolean; // "Jam Sync"
  };
}

export enum ViewState {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  HOME = 'HOME',
  HOST_PANEL = 'HOST_PANEL',
  GUEST_JOIN = 'GUEST_JOIN',
  PLAYER = 'PLAYER',
  PROFILE = 'PROFILE',
  CAR_MODE = 'CAR_MODE'
}