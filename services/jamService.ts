import { JamSession, Song } from '../types';
import { MOCK_SONGS } from '../constants';

// Simulating a backend service
export const createJam = (hostId: string): JamSession => {
  return {
    id: `JAM-${Math.floor(1000 + Math.random() * 9000)}`,
    hostId,
    isActive: true,
    code: '8821',
    nowPlaying: MOCK_SONGS[0],
    queue: MOCK_SONGS.slice(1),
    approvalQueue: [],
    history: [],
    connectedUsers: [],
    settings: {
      votingEnabled: true,
      guestUploads: false,
      explicitFilter: false,
      requireApproval: false,
      guestVolumeControl: false,
      syncMode: false
    }
  };
};

export const searchSongs = (query: string): Song[] => {
  if (!query) return MOCK_SONGS;
  const lowerQuery = query.toLowerCase();
  return MOCK_SONGS.filter(s => 
    s.title.toLowerCase().includes(lowerQuery) || 
    s.artist.toLowerCase().includes(lowerQuery)
  );
};