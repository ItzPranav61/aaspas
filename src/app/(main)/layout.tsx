'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocality } from '@/context/LocalityContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Users,
  Plus,
  MessageSquare,
  MapPin,
  X,
  Calendar,
  DollarSign,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { currentLocality } = useLocality();
  const router = useRouter();
  const pathname = usePathname();

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Form States for Post Creation
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [imageUrl, setImageUrl] = useState('');
  
  // Category specific fields
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [alertExpires, setAlertExpires] = useState('');
  const [lostFoundType, setLostFoundType] = useState('lost');
  const [lostFoundItem, setLostFoundItem] = useState('');
  const [lostFoundReward, setLostFoundReward] = useState('');
  const [buySellPrice, setBuySellPrice] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Handle Authentication Redirect
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-slate-50 min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 border-4 border-slate-200 border-t-brand-green rounded-full animate-spin mb-4"></div>
          <p className="text-brand-deep font-semibold text-sm animate-pulse">Aaspas Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect shortly
  }

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !content.trim()) {
      setFormError('Title and content are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      // If Buy & Sell, append price info to content
      let finalContent = content;
      if (category === 'buy_sell' && buySellPrice) {
        finalContent = `[Asking Price: ₹${buySellPrice}] ${content}`;
      }

      interface PostData {
        userId: string;
        localityId: string;
        title: string;
        content: string;
        category: string;
        imageUrl: string;
        eventDate?: string;
        location?: string;
        severity?: string;
        expiresAt?: string;
        type?: string;
        itemName?: string;
        reward?: string;
      }

      const postData: PostData = {
        userId: user.id,
        localityId: currentLocality?.id || user.localityId || '',
        title,
        content: finalContent,
        category,
        imageUrl,
      };

      if (category === 'event') {
        postData.eventDate = eventDate;
        postData.location = eventLocation;
      } else if (category === 'alert') {
        postData.severity = alertSeverity;
        if (alertExpires) postData.expiresAt = alertExpires;
      } else if (category === 'lost_found') {
        postData.type = lostFoundType;
        postData.itemName = lostFoundItem;
        postData.reward = lostFoundReward;
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        // Reset form
        setTitle('');
        setContent('');
        setCategory('general');
        setImageUrl('');
        setEventDate('');
        setEventLocation('');
        setAlertSeverity('info');
        setAlertExpires('');
        setLostFoundType('lost');
        setLostFoundItem('');
        setLostFoundReward('');
        setBuySellPrice('');
        
        setIsPostModalOpen(false);
        
        // Dispatch event so active components can refresh
        window.dispatchEvent(new Event('new-post-created'));
        router.refresh();
      } else {
        const errData = await response.json();
        setFormError(errData.error || 'Failed to create post. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Something went wrong. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Groups', href: '/groups', icon: Users },
    { label: 'Create', href: '#', icon: Plus, isButton: true },
    { label: 'Chats', href: '/chats', icon: MessageSquare },
    { label: 'My Area', href: '/my-area', icon: MapPin },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-screen pb-20 relative bg-slate-50">
      {/* Content wrapper */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Fixed bottom navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md nav-blur border-t border-slate-100/80 rounded-t-2xl shadow-xl flex items-center justify-around py-3 px-2 z-40">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isButton) {
            return (
              <button
                key={index}
                onClick={() => setIsPostModalOpen(true)}
                className="w-12 h-12 bg-brand-deep hover:bg-brand-accent text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-950/20 -translate-y-3 active:scale-95 transition-all border-4 border-slate-50"
                aria-label="Create Post"
              >
                <Plus size={24} />
              </button>
            );
          }

          return (
            <Link
              key={index}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 py-1"
            >
              <div
                className={`relative p-1 rounded-full transition-colors ${
                  isActive ? 'text-brand-green' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon size={20} />
              </div>
              <span
                className={`text-[9px] font-medium mt-0.5 tracking-tight ${
                  isActive ? 'text-brand-deep font-semibold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-brand-green rounded-full mt-0.5 animate-bounce"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Post Creation Bottom Sheet Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsPostModalOpen(false)}
          ></div>

          {/* Form Sheet */}
          <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto flex flex-col z-50 animate-slide-up no-scrollbar">
            {/* Grabber line for sheet appearance */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-3 shrink-0"></div>

            <div className="px-6 pb-6 flex-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="text-brand-green" size={18} />
                  Create Local Post
                </h3>
                <button
                  onClick={() => setIsPostModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <div className="mb-4 bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-xl border border-red-100">
                  {formError}
                </div>
              )}

              <form onSubmit={handlePostSubmit} className="space-y-4">
                {/* Category Selection Dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-700 font-semibold"
                  >
                    <option value="general">💬 General Chit-chat</option>
                    <option value="alert">⚠️ Emergency Alert</option>
                    <option value="announcement">📢 Announcement</option>
                    <option value="event">📅 Community Event</option>
                    <option value="lost_found">🐶 Lost & Found</option>
                    <option value="buy_sell">🛍️ Buy & Sell</option>
                    <option value="question">❓ Question/Need Advice</option>
                    <option value="service">🛠️ Local Service Recommendation</option>
                  </select>
                </div>

                {/* Conditional Fields based on Category */}
                {category === 'event' && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-deep block flex items-center gap-1">
                        <Calendar size={10} /> Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="block w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-deep block">Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Clubhouse, Katrap"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        className="block w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                )}

                {category === 'alert' && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-red-50/50 rounded-2xl border border-red-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-red-800 block flex items-center gap-1">
                        <AlertTriangle size={10} /> Severity
                      </label>
                      <select
                        value={alertSeverity}
                        onChange={(e) => setAlertSeverity(e.target.value)}
                        className="block w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
                      >
                        <option value="info">Info (Blue)</option>
                        <option value="warning">Warning (Amber)</option>
                        <option value="critical">Critical (Red)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-red-800 block">Expires At (Optional)</label>
                      <input
                        type="datetime-local"
                        value={alertExpires}
                        onChange={(e) => setAlertExpires(e.target.value)}
                        className="block w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {category === 'lost_found' && (
                  <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-blue-800 block">Type</label>
                        <select
                          value={lostFoundType}
                          onChange={(e) => setLostFoundType(e.target.value)}
                          className="block w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
                        >
                          <option value="lost">Lost</option>
                          <option value="found">Found</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-blue-800 block">Item Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Keys, Puppy, Wallet"
                          value={lostFoundItem}
                          onChange={(e) => setLostFoundItem(e.target.value)}
                          className="block w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-800 block">Reward Details (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Reward ₹500 or box of sweets"
                        value={lostFoundReward}
                        onChange={(e) => setLostFoundReward(e.target.value)}
                        className="block w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {category === 'buy_sell' && (
                  <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-800 block flex items-center gap-1">
                        <DollarSign size={10} /> Asking Price (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 1500"
                        value={buySellPrice}
                        onChange={(e) => setBuySellPrice(e.target.value)}
                        className="block w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Short, descriptive heading"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-800 font-semibold"
                    required
                  />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Details</label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe what's happening or what you need..."
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-800"
                    required
                  ></textarea>
                </div>

                {/* Image URL (Optional Mock) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Image URL (Optional)</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-600"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-deep hover:bg-brand-accent text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-950/15 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Post...' : 'Publish Post'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
