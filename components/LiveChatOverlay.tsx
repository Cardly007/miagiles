import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { ChatMessageData } from './ChatPanel';

interface LiveChatOverlayProps {
  messages: ChatMessageData[];
  onSendMessage: (content: string) => void;
  onDeleteMessage: (messageId: string) => void;
  currentUserId: string;
  isHost: boolean;
}

export const LiveChatOverlay: React.FC<LiveChatOverlayProps> = ({ messages, onSendMessage, onDeleteMessage, currentUserId, isHost }) => {
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className={`absolute left-0 right-0 bottom-0 pointer-events-none flex flex-col justify-end p-4 transition-all duration-300 z-30 ${isInputFocused ? 'h-[60%] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-auto' : 'h-[40%] pointer-events-auto'}`}>

      {/* Messages Area */}
      <div className={`flex flex-col gap-2 overflow-y-auto overflow-x-hidden no-scrollbar pb-4 mask-image-gradient`}>
        {messages.slice(-20).map((msg) => (
          <div key={msg.id} className="flex flex-col animate-slide-up origin-bottom group">
            <div className="flex items-center gap-2">
              <img
                src={msg.author?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.author?.pseudo}`}
                alt="avatar"
                className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
              />
              <span className="text-[11px] font-bold text-white/90 drop-shadow-md">
                {msg.author?.pseudo}
              </span>
              {isHost && !msg.isDeleted && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteMessage(msg.id); }}
                  className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                  title="Delete message"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
            <div className="ml-8 text-[13px] text-white drop-shadow-md font-medium max-w-[85%] break-words">
              {msg.isDeleted ? <span className="text-white/50 italic">Message deleted</span> : msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-2 pointer-events-auto shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Comment on the jam..."
            className="flex-1 bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-full px-4 py-2.5 text-sm focus:outline-none focus:bg-black/60 focus:border-white/40 shadow-lg placeholder:text-white/60 transition-all"
            maxLength={200}
          />
          {inputValue.trim() && (
            <button type="submit" className="bg-brand-red p-2.5 rounded-full text-white shadow-lg shrink-0 animate-fade-in">
              <Send size={16} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
