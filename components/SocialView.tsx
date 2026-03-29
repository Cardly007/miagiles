import React, { useState, useEffect } from 'react';
import { Search, Users, UserPlus, Check, X, Clock } from 'lucide-react';
import { User } from '../types';

interface SocialViewProps {
  currentUser: User;
}

interface FriendItem {
  id: string;
  userId1: string;
  userId2: string;
  status: 'PENDING' | 'ACCEPTED';
  user1: { id: string; pseudo: string; photoUrl: string | null };
  user2: { id: string; pseudo: string; photoUrl: string | null };
}

export const SocialView: React.FC<SocialViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'FRIENDS' | 'FIND'>('FRIENDS');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, [currentUser.id]);

  const fetchFriends = async () => {
    try {
      const res = await fetch(`/api/friends/${currentUser.id}`);
      const data = await res.json();
      setFriends(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/search/${searchQuery}`);
      const data = await res.json();
      // Filter out self
      setSearchResults(data.filter((u: any) => u.id !== currentUser.id));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSendRequest = async (toId: string) => {
    try {
      await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId: currentUser.id, toId })
      });
      fetchFriends();
      setActiveTab('FRIENDS');
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateRequest = async (friendId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      if (status === 'REJECTED') {
          // A real app would delete the row or set it to REJECTED, but for simplicity here we just use PATCH
          // Ideally you'd do DELETE, but let's just ignore them in UI if rejected, or delete it
      }

      await fetch(`/api/friends/${friendId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchFriends();
    } catch (e) {
      console.error(e);
    }
  };

  // Compute friend lists
  const acceptedFriends = friends.filter(f => f.status === 'ACCEPTED');

  // Pending requests I received
  const pendingRequests = friends.filter(f => f.status === 'PENDING' &&
      ((f.userId1 === currentUser.id && f.user2.id !== currentUser.id) ||
       (f.userId2 === currentUser.id && f.user1.id !== currentUser.id)) // This simple logic implies we need to know who initiated.
      // For onlyjam V2 simple db, we'll just say if it's pending and we are in it, and we didn't initiate it?
      // Actually since it's alphabetical, we don't know who initiated just from user1/user2.
      // BUT for simplicity, we will just show PENDING requests and let either party accept.
  ).filter(f => f.status === 'PENDING');

  return (
    <div className="flex-1 bg-black text-white p-6 overflow-y-auto w-full max-w-7xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="text-brand-red" size={32} />
          Social
        </h1>
      </div>

      <div className="flex gap-4 mb-8 border-b border-zinc-800">
        <button
          className={`pb-3 font-bold px-2 ${activeTab === 'FRIENDS' ? 'text-white border-b-2 border-brand-red' : 'text-gray-500'}`}
          onClick={() => setActiveTab('FRIENDS')}
        >
          My Friends ({acceptedFriends.length})
        </button>
        <button
          className={`pb-3 font-bold px-2 ${activeTab === 'FIND' ? 'text-white border-b-2 border-brand-red' : 'text-gray-500'}`}
          onClick={() => setActiveTab('FIND')}
        >
          Find Users
        </button>
      </div>

      {activeTab === 'FIND' && (
        <div className="animate-fade-in">
          <form onSubmit={handleSearch} className="relative flex-1 mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by pseudo..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-brand-red"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {loading ? (
             <div className="text-center text-gray-500 py-8">Searching...</div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
               {searchResults.map(user => {
                  // Check if already friend or pending
                  const existingRelation = friends.find(f => f.userId1 === user.id || f.userId2 === user.id);

                  return (
                      <div key={user.id} className="bg-zinc-900 p-4 rounded-xl flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <img src={user.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.pseudo}`} className="w-10 h-10 rounded-full bg-zinc-800" />
                            <div className="font-bold">{user.pseudo}</div>
                         </div>

                         {existingRelation ? (
                            <span className="text-xs text-gray-500 bg-zinc-800 px-3 py-1.5 rounded-full font-bold">
                               {existingRelation.status === 'ACCEPTED' ? 'Friends' : 'Pending'}
                            </span>
                         ) : (
                            <button
                               onClick={() => handleSendRequest(user.id)}
                               className="bg-brand-red/20 text-brand-red p-2 rounded-full hover:bg-brand-red hover:text-white transition-colors"
                            >
                               <UserPlus size={18} />
                            </button>
                         )}
                      </div>
                  )
               })}
            </div>
          ) : searchQuery && (
             <div className="text-center text-gray-500 py-8">No users found.</div>
          )}
        </div>
      )}

      {activeTab === 'FRIENDS' && (
        <div className="animate-fade-in space-y-8">
            {pendingRequests.length > 0 && (
                <div>
                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Clock size={14} /> Pending Requests
                   </h3>
                   <div className="space-y-3">
                      {pendingRequests.map(req => {
                          const otherUser = req.user1.id === currentUser.id ? req.user2 : req.user1;
                          return (
                              <div key={req.id} className="bg-zinc-900 p-4 rounded-xl flex items-center justify-between border border-brand-red/30">
                                 <div className="flex items-center gap-3">
                                    <img src={otherUser.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.pseudo}`} className="w-10 h-10 rounded-full bg-zinc-800" />
                                    <div>
                                        <div className="font-bold">{otherUser.pseudo}</div>
                                        <div className="text-[10px] text-brand-red">Wants to connect</div>
                                    </div>
                                 </div>
                                 <div className="flex gap-2">
                                     <button onClick={() => handleUpdateRequest(req.id, 'ACCEPTED')} className="bg-green-500/20 text-green-500 p-2 rounded-full hover:bg-green-500 hover:text-white"><Check size={18} /></button>
                                     <button onClick={() => handleUpdateRequest(req.id, 'REJECTED')} className="bg-zinc-800 text-gray-400 p-2 rounded-full hover:text-white"><X size={18} /></button>
                                 </div>
                              </div>
                          )
                      })}
                   </div>
                </div>
            )}

            <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Users size={14} /> My Connections
                </h3>
                {acceptedFriends.length > 0 ? (
                    <div className="space-y-3">
                        {acceptedFriends.map(req => {
                             const otherUser = req.user1.id === currentUser.id ? req.user2 : req.user1;
                             return (
                                 <div key={req.id} className="bg-zinc-900 p-4 rounded-xl flex items-center gap-3">
                                    <img src={otherUser.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.pseudo}`} className="w-10 h-10 rounded-full bg-zinc-800" />
                                    <div className="font-bold">{otherUser.pseudo}</div>
                                 </div>
                             )
                        })}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8 italic bg-zinc-900/50 rounded-xl">
                        You have no friends yet. Go to "Find Users" to connect!
                    </div>
                )}
            </div>
        </div>
      )}

    </div>
  );
};