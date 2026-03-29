import React, { useState, useEffect } from 'react';
import { Send, Trash2, Smile } from 'lucide-react';

export interface ChatMessageData {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  isDeleted: boolean;
  author: {
    id: string;
    pseudo: string;
    photoUrl: string | null;
  };
}

interface ChatPanelProps {
  messages: ChatMessageData[];
  onSendMessage: (content: string) => void;
  onDeleteMessage: (messageId: string) => void;
  currentUserId: string;
  isHost: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, onDeleteMessage, currentUserId, isHost }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 w-full pt-16">
      <div className="p-4 border-b border-zinc-800 font-bold flex items-center gap-2 text-white">
        <span>Live Chat</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.authorId === currentUserId ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-2 mb-1">
              {msg.authorId !== currentUserId && (
                <img src={msg.author?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.author?.pseudo}`} alt="avatar" className="w-5 h-5 rounded-full" />
              )}
              <span className="text-xs text-gray-500">{msg.author?.pseudo}</span>
            </div>

            <div className={`px-3 py-2 rounded-xl text-sm relative group max-w-[90%] ${msg.isDeleted ? 'bg-zinc-800 text-gray-500 italic' : (msg.authorId === currentUserId ? 'bg-brand-red text-white' : 'bg-zinc-800 text-white')}`}>
              {msg.isDeleted ? 'Message deleted' : msg.content}

              {isHost && !msg.isDeleted && (
                <button
                  onClick={() => onDeleteMessage(msg.id)}
                  className="absolute -left-6 top-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete message"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-zinc-800">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-red"
            maxLength={500}
          />
          <button type="submit" disabled={!inputValue.trim()} className="bg-brand-red p-2 rounded-full text-white disabled:opacity-50">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
