import { Song, User } from './types';

export const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: 'Midnight City',
    artist: 'M83 • Hurry Up, We\'re Dreaming',
    coverUrl: 'https://picsum.photos/200/200?random=1',
    source: 'Spotify',
    votes: 12,
    addedBy: 'Host',
    duration: '4:03'
  },
  {
    id: '2',
    title: 'Electric Feel',
    artist: 'MGMT',
    coverUrl: 'https://picsum.photos/200/200?random=2',
    source: 'YouTube',
    votes: 8,
    addedBy: 'Sarah',
    duration: '3:49'
  },
  {
    id: '3',
    title: 'Demo Track 2024',
    artist: 'Local Artist',
    coverUrl: 'https://picsum.photos/200/200?random=3',
    source: 'SoundCloud',
    votes: 5,
    addedBy: 'Mike',
    duration: '2:15'
  },
  {
    id: '4',
    title: 'Exclusive Mix',
    artist: 'DJ Unknown',
    coverUrl: 'https://picsum.photos/200/200?random=4',
    source: 'Local',
    votes: 15,
    addedBy: 'Alex',
    duration: '5:20'
  },
  {
    id: '5',
    title: 'Stronger',
    artist: 'Kanye West',
    coverUrl: 'https://picsum.photos/200/200?random=5',
    source: 'AppleMusic',
    votes: 28,
    addedBy: 'Sarah',
    duration: '5:11'
  }
];

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Doe',
  bio: 'Music addict & Vinyl collector 🎧',
  avatar: 'https://picsum.photos/200/200?random=50',
  isHost: false,
  friends: 142,
  pinnedSongs: [MOCK_SONGS[0], MOCK_SONGS[1], MOCK_SONGS[2]],
  playlists: [
    { id: 'p1', name: 'Summer Vibes 2024', source: 'Spotify', icon: 'green' },
    { id: 'p2', name: 'Techno Bunker', source: 'Deezer', icon: 'purple' }
  ]
};