'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User as UserIcon, Send, Smile, Paperclip, MoreVertical } from 'lucide-react';

interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
}

interface Chat {
  id: string;
  name: string;
  avatarUrl: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  status: string;
}

const SEED_MESSAGES: Record<string, Message[]> = {
  ananya: [
    { id: '1', sender: 'them', text: 'Hi! Let me know if you need any info about the locality.', timestamp: '10:30 AM' },
    { id: '2', sender: 'me', text: 'Thanks! Is the power outage going to affect Shirgaon too?', timestamp: '10:40 AM' },
    { id: '3', sender: 'them', text: 'As per the MSEDCL circular, it is only for Katrap feeders.', timestamp: '10:45 AM' },
  ],
  rajesh: [
    { id: '1', sender: 'them', text: 'Hello. Saw your interest in the second-hand study table.', timestamp: 'Yesterday' },
    { id: '2', sender: 'me', text: 'Yes, is it negotiable?', timestamp: 'Yesterday' },
    { id: '3', sender: 'them', text: 'Are you interested in the study table? Let me know.', timestamp: 'Yesterday' },
  ],
  aarav: [
    { id: '1', sender: 'them', text: 'Hey, did you see the Badlapur cricket tournament post?', timestamp: '2 days ago' },
    { id: '2', sender: 'me', text: 'Yes, sounds exciting!', timestamp: '2 days ago' },
    { id: '3', sender: 'them', text: 'Will you join the cricket tournament this Friday?', timestamp: '2 days ago' },
  ],
  priya: [
    { id: '1', sender: 'them', text: 'Hi there, I am the pharmacist at Priya Medical Store.', timestamp: '3 days ago' },
    { id: '2', sender: 'me', text: 'Do you deliver to Katrap bypass?', timestamp: '3 days ago' },
    { id: '3', sender: 'them', text: 'Yes, we have home delivery in Katrap. Send me the prescription.', timestamp: '3 days ago' },
  ],
};

const AUTO_REPLIES: Record<string, string[]> = {
  ananya: [
    'I will ask the society manager and let you know.',
    'Thanks! I will post any other updates on the home board.',
    'Got it. Let me check the ward coordinator details.',
  ],
  rajesh: [
    'Sure, I can lower it to ₹1300 if you pick it up today.',
    'Let me know when you want to drop by. I live in building B.',
    'Sounds good. I am home after 6 PM.',
  ],
  aarav: [
    'Awesome! I will add you to the players list.',
    'We are starting practice tomorrow morning at 7 AM. Come by!',
    'Great. Let me share the registration link shortly.',
  ],
  priya: [
    'Perfect. Send a photo of the receipt on WhatsApp.',
    'It should reach you in 30 minutes.',
    'Sure, let me check the stock and confirm.',
  ],
};

export default function ChatConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [recipient, setRecipient] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load recipient info
    const storedChats = localStorage.getItem('aaspas_chats');
    if (storedChats) {
      try {
        const parsed = JSON.parse(storedChats) as Chat[];
        const found = parsed.find((c) => c.id === id);
        if (found) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setRecipient(found);
          // Mark as read
          if (found.unread) {
            const updated = parsed.map((c) => (c.id === id ? { ...c, unread: false } : c));
            localStorage.setItem('aaspas_chats', JSON.stringify(updated));
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Load messages
    const storedMsg = localStorage.getItem(`aaspas_messages_${id}`);
    if (storedMsg) {
      try {
        setMessages(JSON.parse(storedMsg));
      } catch {
        setMessages(SEED_MESSAGES[id] || []);
      }
    } else {
      const seed = SEED_MESSAGES[id] || [];
      setMessages(seed);
      localStorage.setItem(`aaspas_messages_${id}`, JSON.stringify(seed));
    }
  }, [id]);

  useEffect(() => {
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const timeString = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text: inputText.trim(),
      timestamp: timeString,
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    localStorage.setItem(`aaspas_messages_${id}`, JSON.stringify(updatedMessages));
    setInputText('');

    // Update last message in chats listing
    const storedChats = localStorage.getItem('aaspas_chats');
    if (storedChats) {
      try {
        const parsed = JSON.parse(storedChats) as Chat[];
        const updated = parsed.map((c) =>
          c.id === id ? { ...c, lastMessage: newMsg.text, timestamp: 'Now', unread: false } : c
        );
        localStorage.setItem('aaspas_chats', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }

    // Trigger mock auto reply after 1.5 seconds
    setTimeout(() => {
      const replies = AUTO_REPLIES[id] || [
        'Okay, let me check and get back to you!',
        'Thanks for reaching out, neighbor!',
        'Got it. Speak to you soon.',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const replyTime = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const replyMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'them',
        text: randomReply,
        timestamp: replyTime,
      };

      setMessages((prev) => {
        const final = [...prev, replyMsg];
        localStorage.setItem(`aaspas_messages_${id}`, JSON.stringify(final));
        return final;
      });

      // Update chats list again with the reply
      if (storedChats) {
        try {
          const parsed = JSON.parse(storedChats) as Chat[];
          const updated = parsed.map((c) =>
            c.id === id ? { ...c, lastMessage: replyMsg.text, timestamp: 'Now', unread: true } : c
          );
          localStorage.setItem('aaspas_chats', JSON.stringify(updated));
        } catch (err) {
          console.error(err);
        }
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col flex-1 bg-slate-55 min-h-screen">
      {/* Recipient Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/chats')}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition-colors -ml-1"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-100 relative shrink-0">
            {recipient?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={recipient.avatarUrl} alt={recipient.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <UserIcon size={16} />
              </div>
            )}
          </div>

          <div className="text-left">
            <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{recipient?.name || 'Neighbor'}</h3>
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${recipient?.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-405'}`}></span>
              <span className="text-[10px] text-slate-450 font-semibold">{recipient?.status || 'Offline'}</span>
            </div>
          </div>
        </div>

        <button className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <MoreVertical size={16} />
        </button>
      </header>

      {/* Messages Log */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 pb-24 max-h-[calc(100vh-125px)] no-scrollbar bg-slate-50/50">
        {messages.map((msg) => {
          const isMe = msg.sender === 'me';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-xs relative ${
                  isMe
                    ? 'bg-brand-deep text-white rounded-tr-none'
                    : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <span
                  className={`text-[8px] block text-right mt-1 font-semibold ${
                    isMe ? 'text-brand-light/75' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 py-3 px-4 z-40 shadow-2xl flex gap-2 items-center">
        <form onSubmit={handleSendMessage} className="flex-1 flex gap-2 items-center">
          <button
            type="button"
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors shrink-0"
          >
            <Smile size={20} />
          </button>
          
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-800 font-medium"
          />
          
          <button
            type="button"
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors shrink-0"
          >
            <Paperclip size={18} />
          </button>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 bg-brand-deep hover:bg-brand-accent text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 shrink-0 shadow-md shadow-emerald-950/10"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
