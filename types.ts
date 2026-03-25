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
  sourceId?: string; // Original ID from source (e.g. Audius track ID)
  title: string;
  artist: string;
  coverUrl: string;
  source: 'Spotify' | 'YouTube' | 'SoundCloud' | 'AppleMusic' | 'Local' | 'Audius';
  votes: number;
  addedBy: string;
  duration: string | number;
  status?: 'QUEUED' | 'PENDING' | 'PLAYING' | 'PLAYED';
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
    approvalRequired: boolean; // "Mode Suggestion"
    guestVolumeControl: boolean;
    syncMode: boolean; // "Jam Sync"
  };
  currentTrackStartTime?: string; // Added for Sync
  isPaused?: boolean;
}

export enum ViewState {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  HOME = 'HOME',
  HOST_PANEL = 'HOST_PANEL',
  GUEST_JOIN = 'GUEST_JOIN',
  PLAYER = 'PLAYER',
  PROFILE = 'PROFILE',
  CAR_MODE = 'CAR_MODE',
  SEARCH = 'SEARCH'
}