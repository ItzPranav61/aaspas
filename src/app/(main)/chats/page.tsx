'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Search, User as UserIcon, ChevronRight } from 'lucide-react';

interface Chat {
  id: string;
  name: string;
  avatarUrl: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  status: string;
}

const DEFAULT_CHATS: Chat[] = [
  {
    id: 'ananya',
    name: 'Ananya (Moderator)',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
    lastMessage: 'As per the MSEDCL circular, it is only for Katrap feeders.',
    timestamp: '10:45 AM',
    unread: true,
    status: 'Online',
  },
  {
    id: 'rajesh',
    name: 'Rajesh (Neighbor)',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
    lastMessage: 'Are you interested in the study table? Let me know.',
    timestamp: 'Yesterday',
    unread: false,
    status: 'Away',
  },
  {
    id: 'aarav',
    name: 'Aarav (BPL Organizer)',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav',
    lastMessage: 'Will you join the cricket tournament this Friday?',
    timestamp: '2 days ago',
    unread: false,
    status: 'Offline',
  },
  {
    id: 'priya',
    name: 'Priya (Pharmacist)',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    lastMessage: 'Yes, we have home delivery in Katrap. Send me the prescription.',
    timestamp: '3 days ago',
    unread: false,
    status: 'Online',
  },
];

export default function ChatsPage() {
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check if we have chats initialized in localStorage, else set default
    const storedChats = localStorage.getItem('aaspas_chats');
    if (storedChats) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setChats(JSON.parse(storedChats));
      } catch {
        setChats(DEFAULT_CHATS);
      }
    } else {
      setChats(DEFAULT_CHATS);
      localStorage.setItem('aaspas_chats', JSON.stringify(DEFAULT_CHATS));
    }
  }, []);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 pb-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex flex-col gap-2.5 z-30 shadow-xs">
        <h1 className="text-xl font-black text-slate-800 flex items-center gap-1.5">
          <MessageSquare className="text-brand-green" size={22} />
          Neighbor Chats
        </h1>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-800 font-medium"
          />
        </div>
      </header>

      {/* Chat List */}
      <div className="px-4 mt-4 space-y-2.5">
        {filteredChats.length === 0 ? (
          <div className="card-premium p-8 text-center bg-white border border-slate-100 mt-4 flex flex-col items-center">
            <MessageSquare size={28} className="text-slate-355 mb-2" />
            <h3 className="text-xs font-bold text-slate-700">No chats found</h3>
            <p className="text-[10px] text-slate-400 max-w-[200px] mt-0.5">
              Try searching for someone else or check back later!
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => router.push(`/chats/${chat.id}`)}
              className="card-premium p-3.5 border border-slate-100 bg-white hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-between gap-3"
            >
              {/* Profile Avatar */}
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-100 bg-slate-50">
                  {chat.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={chat.avatarUrl} alt={chat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <UserIcon size={18} />
                    </div>
                  )}
                </div>
                {/* Online indicator */}
                {chat.status === 'Online' && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                )}
                {chat.status === 'Away' && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-amber-505 border-2 border-white rounded-full"></span>
                )}
              </div>

              {/* Chat Text */}
              <div className="flex-1 min-w-0 space-y-0.5 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{chat.name}</h4>
                  <span className={`text-[9px] font-semibold ${chat.unread ? 'text-brand-green' : 'text-slate-400'}`}>
                    {chat.timestamp}
                  </span>
                </div>
                <p className={`text-[11px] truncate leading-normal ${chat.unread ? 'text-slate-800 font-bold' : 'text-slate-405'}`}>
                  {chat.lastMessage}
                </p>
              </div>

              {/* Chevron right and unread badge */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                {chat.unread ? (
                  <span className="w-2.5 h-2.5 bg-brand-green rounded-full"></span>
                ) : (
                  <ChevronRight size={14} className="text-slate-350" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
