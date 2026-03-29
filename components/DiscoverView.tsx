import React, { useEffect, useState } from 'react';
import { Search, Users, Disc, Play } from 'lucide-react';
import { JamCard } from './JamCard';

export interface PublicSession {
  id: string;
  sessionId: string;
  name: string;
  genre: string;
  listenerCount: number;
  host: { pseudo: string; photoUrl: string | null };
  queue: { title: string; artist: string; thumbnail: string | null }[];
}

export const DiscoverView: React.FC<{ onJoinSession: (sessionId: string) => void }> = ({ onJoinSession }) => {
  const [sessions, setSessions] = useState<PublicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [genreFilter, setGenreFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const genres = ['Pop', 'Lofi', 'Techno', 'Rock', 'Hip-Hop'];

  useEffect(() => {
    fetchSessions();

    // Poll every 10 seconds for real-time updates as requested in F3
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, [genreFilter, searchQuery]);

  const fetchSessions = async () => {
    try {
      let url = '/api/sessions?';
      if (genreFilter) url += `genre=${genreFilter}&`;
      if (searchQuery) url += `q=${searchQuery}`;

      const res = await fetch(url);
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-black text-white p-6 overflow-y-auto w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Disc className="text-brand-red" size={32} />
          Discover Jams
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or host..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-brand-red"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <button
            className={`px-6 py-2 rounded-full whitespace-nowrap ${genreFilter === '' ? 'bg-brand-red text-white' : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'}`}
            onClick={() => setGenreFilter('')}
          >
            All
          </button>
          {genres.map(genre => (
            <button
              key={genre}
              className={`px-6 py-2 rounded-full whitespace-nowrap ${genreFilter === genre ? 'bg-brand-red text-white' : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'}`}
              onClick={() => setGenreFilter(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div></div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No public jams found. Be the first to start one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sessions.map(session => (
            <JamCard key={session.id} session={session} onClick={() => onJoinSession(session.id)} />
          ))}
        </div>
      )}
    </div>
  );
};
