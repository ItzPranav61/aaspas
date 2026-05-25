'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocality, Locality } from '@/context/LocalityContext';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Heart,
  MessageCircle,
  AlertTriangle,
  Calendar,
  Tag,
  Check,
  Megaphone,
  Share2,
  Search,
  X
} from 'lucide-react';

interface Post {
  id: string;
  userId: string;
  localityId: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  user: {
    name: string;
    avatarUrl: string | null;
  };
  eventDetail: {
    eventDate: string;
    location: string;
  } | null;
  alertDetail: {
    severity: string;
    expiresAt: string | null;
  } | null;
  lostFoundDetail: {
    type: string;
    itemName: string;
    reward: string | null;
  } | null;
  likes: { userId: string }[];
  comments: unknown[];
}

const categories = [
  { label: 'All', value: 'all' },
  { label: 'Alert', value: 'alert' },
  { label: 'Announcement', value: 'announcement' },
  { label: 'Event', value: 'event' },
  { label: 'Lost & Found', value: 'lost_found' },
  { label: 'Buy/Sell', value: 'buy_sell' },
  { label: 'Question', value: 'question' },
  { label: 'Service', value: 'service' },
];

export default function HomePage() {
  const { user, logout } = useAuth();
  const { currentLocality, localities, selectLocality } = useLocality();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [isLocalitySheetOpen, setIsLocalitySheetOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [localitySearch, setLocalitySearch] = useState('');

  const fetchPosts = useCallback(async () => {
    if (!currentLocality) return;
    setLoadingPosts(true);
    try {
      const res = await fetch(`/api/posts?localityId=${currentLocality.id}&category=all`);
      if (res.ok) {
        const data: Post[] = await res.json();
        setPosts(data);

        // Initialize likes state
        const initialLiked: Record<string, boolean> = {};
        const initialCounts: Record<string, number> = {};
        data.forEach((post) => {
          initialCounts[post.id] = post.likes?.length || 0;
          initialLiked[post.id] = post.likes?.some((like) => like.userId === user?.id) || false;
        });
        setLikeCounts(initialCounts);
        setLikedPosts(initialLiked);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  }, [currentLocality, user]);

  const alertsCount = posts.filter((p) => p.category === 'alert').length;
  const eventsCount = posts.filter((p) => p.category === 'event').length;
  const discussionsCount = posts.filter((p) => ['announcement', 'question', 'general'].includes(p.category)).length;
  const buysellCount = posts.filter((p) => p.category === 'buy_sell').length;

  const filteredPosts = posts.filter((post) => {
    if (activeTab === 'All') return true;
    const catObj = categories.find((c) => c.label === activeTab);
    const catParam = catObj ? catObj.value : 'all';
    return post.category === catParam;
  });

  const filteredLocalities = localities.filter((loc) => {
    const term = localitySearch.toLowerCase().trim();
    if (!term) return true;
    return (
      loc.name.toLowerCase().includes(term) ||
      (loc.subArea && loc.subArea.toLowerCase().includes(term)) ||
      loc.pincode.includes(term)
    );
  });

  const nearbyAreas = filteredLocalities.filter((loc) => loc.groupName === 'Nearby Areas');
  const badlapurLocalities = filteredLocalities.filter((loc) => loc.groupName === 'Badlapur Localities');
  const centralLineAreas = filteredLocalities.filter((loc) => loc.groupName === 'Central Line Areas');

  const renderLocalityItem = (loc: Locality) => {
    const isSelected = currentLocality?.id === loc.id;
    return (
      <button
        key={loc.id}
        onClick={() => {
          selectLocality(loc.id);
          setIsLocalitySheetOpen(false);
          setLocalitySearch('');
        }}
        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
          isSelected
            ? 'bg-emerald-50 border-brand-green text-brand-deep font-bold shadow-xs'
            : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-700 font-semibold'
        }`}
      >
        <div>
          <span className="text-xs font-bold block">
            {loc.subArea ? `${loc.subArea}, ` : ''} {loc.name}
          </span>
          <p className="text-[9px] text-slate-400 font-normal mt-0.5">
            Pincode: {loc.pincode} • {loc.city}, {loc.state}
          </p>
        </div>
        {isSelected && <Check size={14} className="text-brand-green" />}
      </button>
    );
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts();
  }, [fetchPosts]);

  // Listen to post creation event
  useEffect(() => {
    const handleNewPost = () => {
      fetchPosts();
    };
    window.addEventListener('new-post-created', handleNewPost);
    return () => {
      window.removeEventListener('new-post-created', handleNewPost);
    };
  }, [fetchPosts]);

  const handleLikeToggle = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!user) return;

    // Optimistic Update
    const currentlyLiked = likedPosts[postId];
    const currentCount = likeCounts[postId];

    setLikedPosts((prev) => ({ ...prev, [postId]: !currentlyLiked }));
    setLikeCounts((prev) => ({
      ...prev,
      [postId]: currentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
    }));

    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: user.id }),
      });

      if (!res.ok) {
        // Rollback
        setLikedPosts((prev) => ({ ...prev, [postId]: currentlyLiked }));
        setLikeCounts((prev) => ({ ...prev, [postId]: currentCount }));
      } else {
        const result = await res.json();
        setLikedPosts((prev) => ({ ...prev, [postId]: result.liked }));
        setLikeCounts((prev) => ({ ...prev, [postId]: result.count }));
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
      // Rollback
      setLikedPosts((prev) => ({ ...prev, [postId]: currentlyLiked }));
      setLikeCounts((prev) => ({ ...prev, [postId]: currentCount }));
    }
  };

  const getCategoryBadgeStyle = (category: string) => {
    switch (category.toLowerCase()) {
      case 'alert':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'event':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'question':
        return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'buy_sell':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'service':
        return 'bg-teal-50 text-teal-600 border-teal-100';
      case 'announcement':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 600);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Find critical alerts for the banner
  const criticalAlerts = posts.filter(
    (p) => p.category === 'alert' && p.alertDetail?.severity === 'critical'
  );

  return (
    <div className="flex flex-col flex-1 pb-6">
      {/* Top Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between z-30 shadow-xs">
        {/* Locality Selector Dropdown */}
        <button
          onClick={() => setIsLocalitySheetOpen(true)}
          className="flex items-center gap-1.5 hover:bg-slate-50 py-1.5 px-3 rounded-full transition-colors duration-200"
        >
          <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-deep">
            <MapPin size={16} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Locality</p>
            <div className="flex items-center gap-0.5">
              <span className="text-sm font-bold text-slate-800">
                {currentLocality?.subArea
                  ? `${currentLocality.subArea}, ${currentLocality.name}`
                  : currentLocality?.name || 'Loading...'}
              </span>
              <ChevronDown size={14} className="text-slate-500" />
            </div>
          </div>
        </button>

        {/* Profile Avatar & Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-brand-green/20 hover:border-brand-green transition-all"
          >
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500">
                <UserIcon size={18} />
              </div>
            )}
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.phone}</p>
                  <span className="inline-block bg-emerald-50 text-brand-deep text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 uppercase">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Critical Alert Banners (Carousel format) */}
      {criticalAlerts.length > 0 && (
        <div className="px-4 mt-3">
          {criticalAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => router.push(`/post/${alert.id}`)}
              className="bg-red-500 text-white p-3.5 rounded-2xl shadow-sm flex items-start gap-3 border border-red-600/20 mb-2 cursor-pointer active:scale-98 transition-all animate-pulse"
            >
              <div className="p-2 bg-white/20 rounded-xl shrink-0">
                <AlertTriangle size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/30 px-2 py-0.5 rounded-full">
                    CRITICAL ALERT
                  </span>
                  <span className="text-[10px] opacity-90">{formatTimestamp(alert.createdAt)}</span>
                </div>
                <h4 className="text-sm font-extrabold mt-1.5">{alert.title}</h4>
                <p className="text-xs opacity-90 mt-0.5 line-clamp-1">{alert.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dynamic Locality Hero Card */}
      <div className="px-4 mt-3 animate-fade-in">
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-3xl p-5 shadow-lg shadow-emerald-950/20 border border-emerald-700/35 flex flex-col space-y-4">
          <div className="flex flex-col space-y-0.5 text-left">
            <h2 className="text-lg font-black tracking-tight">
              Good Morning, {currentLocality?.subArea || currentLocality?.name || 'Neighbor'}
            </h2>
            <p className="text-xs text-emerald-250 font-medium">
              What's happening nearby
            </p>
          </div>

          <div className="border-t border-emerald-800/40 my-1"></div>

          <div className="space-y-2">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
              <span>📍 Around You Today</span>
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white/10 hover:bg-white/15 transition-all p-3 rounded-2xl flex items-center gap-2.5 border border-white/5">
                <span className="text-lg">⚠️</span>
                <div className="text-left leading-none">
                  <span className="text-[10px] text-emerald-200 font-bold block">Local Alerts</span>
                  <span className="text-sm font-black mt-1 block">{alertsCount}</span>
                </div>
              </div>

              <div className="bg-white/10 hover:bg-white/15 transition-all p-3 rounded-2xl flex items-center gap-2.5 border border-white/5">
                <span className="text-lg">🎉</span>
                <div className="text-left leading-none">
                  <span className="text-[10px] text-emerald-200 font-bold block">Events Nearby</span>
                  <span className="text-sm font-black mt-1 block">{eventsCount}</span>
                </div>
              </div>

              <div className="bg-white/10 hover:bg-white/15 transition-all p-3 rounded-2xl flex items-center gap-2.5 border border-white/5">
                <span className="text-lg">💬</span>
                <div className="text-left leading-none">
                  <span className="text-[10px] text-emerald-200 font-bold block">Discussions</span>
                  <span className="text-sm font-black mt-1 block">{discussionsCount}</span>
                </div>
              </div>

              <div className="bg-white/10 hover:bg-white/15 transition-all p-3 rounded-2xl flex items-center gap-2.5 border border-white/5">
                <span className="text-lg">🛒</span>
                <div className="text-left leading-none">
                  <span className="text-[10px] text-emerald-200 font-bold block">Buy/Sell Listings</span>
                  <span className="text-sm font-black mt-1 block">{buysellCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Local Summary Section */}
          <div className="bg-emerald-900/60 p-3 rounded-2xl border border-emerald-800/50 text-[11px] text-emerald-100/90 leading-relaxed text-left">
            💡 <span className="font-extrabold text-white">Local Summary:</span> {
              alertsCount > 0 
                ? `Attention required! There are ${alertsCount} active safety/utility alerts in your neighborhood today. Check updates below.`
                : `All quiet around ${currentLocality?.subArea || currentLocality?.name || 'here'} today. There are ${eventsCount} upcoming events and ${discussionsCount} active discussions nearby.`
            }
          </div>
        </div>
      </div>

      {/* Category Tabs Bar */}
      <div className="mt-3.5 px-4 overflow-x-auto no-scrollbar flex items-center gap-2 sticky top-[60px] bg-slate-50/90 backdrop-blur-xs py-1.5 z-20">
        {categories.map((tab) => {
          const isActive = activeTab === tab.label;
          return (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-brand-deep border-brand-deep text-white shadow-md shadow-emerald-950/15'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Posts Section */}
      <div className="px-4 mt-4 space-y-4">
        {loadingPosts ? (
          <div className="space-y-4 py-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card-premium p-5 animate-pulse space-y-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-2.5 bg-slate-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-20 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="card-premium p-8 text-center space-y-4 mt-4 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-1">
              <Megaphone size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No posts in this category</h3>
            <p className="text-xs text-slate-400 max-w-[240px] mx-auto">
              Be the first to share an update, alert, or question with your neighbors!
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const hasLiked = likedPosts[post.id];
            const likesCount = likeCounts[post.id] || 0;
            const commentsCount = post.comments?.length || 0;
            
            // Clean up group tag prefix for rendering if it is present
            const isGroupPost = post.content.startsWith('[Group:');
            let displayContent = post.content;
            if (isGroupPost) {
              displayContent = post.content.replace(/^\[Group:[^\]]+\]/, '');
            }

            return (
              <div
                key={post.id}
                onClick={() => router.push(`/post/${post.id}`)}
                className="card-premium p-4 border border-slate-100 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex flex-col space-y-3"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 shrink-0">
                      {post.user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.user.avatarUrl} alt={post.user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-100">
                          <UserIcon size={16} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{post.user.name}</h4>
                      <p className="text-[10px] text-slate-400">{formatTimestamp(post.createdAt)}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${getCategoryBadgeStyle(post.category)}`}>
                    {post.category.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Post Body */}
                <div className="space-y-1.5">
                  <h3 className="text-sm font-extrabold text-slate-800 leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 whitespace-pre-line">
                    {displayContent}
                  </p>
                </div>

                {/* Category-Specific Visual Details */}
                {post.category === 'event' && post.eventDetail && (
                  <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100/50 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-blue-700 font-bold">
                      <Calendar size={12} />
                      <span>
                        {new Date(post.eventDetail.eventDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-blue-700 font-bold">
                      <MapPin size={12} />
                      <span className="line-clamp-1">{post.eventDetail.location}</span>
                    </div>
                  </div>
                )}

                {post.category === 'alert' && post.alertDetail && (
                  <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                    post.alertDetail.severity === 'critical'
                      ? 'bg-red-50 border-red-100 text-red-700'
                      : post.alertDetail.severity === 'warning'
                      ? 'bg-amber-50 border-amber-100 text-amber-700'
                      : 'bg-blue-50 border-blue-100 text-blue-700'
                  }`}>
                    <AlertTriangle size={14} className="shrink-0 animate-bounce" />
                    <span className="text-[10px] font-bold">
                      {post.alertDetail.severity.toUpperCase()} ALERT: Take necessary precautions.
                    </span>
                  </div>
                )}

                {post.category === 'lost_found' && post.lostFoundDetail && (
                  <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100/50 space-y-1">
                    <p className="text-[10px] text-indigo-800 font-extrabold uppercase">
                      ⚠️ Item {post.lostFoundDetail.type}: {post.lostFoundDetail.itemName}
                    </p>
                    {post.lostFoundDetail.reward && (
                      <p className="text-[10px] text-indigo-600 font-bold">
                        🎁 Reward: {post.lostFoundDetail.reward}
                      </p>
                    )}
                  </div>
                )}

                {post.category === 'buy_sell' && (
                  <div className="inline-flex self-start items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-100 text-[10px] font-bold">
                    <Tag size={10} />
                    <span>Buy & Sell Post</span>
                  </div>
                )}

                {/* Post Image Cover */}
                {post.imageUrl && (
                  <div className="relative h-44 rounded-xl overflow-hidden mt-1 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-slate-50 pt-2.5 mt-1 shrink-0 text-slate-400">
                  <div className="flex gap-4">
                    <button
                      onClick={(e) => handleLikeToggle(e, post.id)}
                      className={`flex items-center gap-1 hover:text-red-500 transition-colors p-1 -m-1 rounded-md ${
                        hasLiked ? 'text-red-500 font-bold' : ''
                      }`}
                    >
                      <Heart size={16} fill={hasLiked ? 'currentColor' : 'none'} />
                      <span className="text-xs font-semibold">{likesCount}</span>
                    </button>
                    <div className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                      <MessageCircle size={16} />
                      <span className="text-xs font-semibold">{commentsCount}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                        alert('Link copied to clipboard!');
                      }}
                      className="hover:text-slate-600 p-1 rounded-md"
                      title="Share link"
                    >
                      <Share2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Locality Bottom Sheet Selector */}
      {isLocalitySheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => {
              setIsLocalitySheetOpen(false);
              setLocalitySearch('');
            }}
          ></div>

          {/* Sheet */}
          <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-6 z-50 animate-slide-up flex flex-col max-h-[85vh]">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 shrink-0"></div>
            <div className="text-left mb-4 shrink-0">
              <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-1.5">
                <MapPin size={18} className="text-brand-green" />
                Select Your Area
              </h3>
              <p className="text-slate-450 text-[11px] leading-normal">
                Choose your locality to see nearby posts, alerts, services, and groups.
              </p>
            </div>

            {/* Search Input Box */}
            <div className="relative mb-4 shrink-0">
              <input
                type="text"
                placeholder="Search area, station, society..."
                value={localitySearch}
                onChange={(e) => setLocalitySearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-800 font-semibold"
              />
              <Search className="absolute left-3 top-3.5 text-slate-400" size={13} />
              {localitySearch && (
                <button
                  onClick={() => setLocalitySearch('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 flex-1 no-scrollbar pb-6">
              {/* Badlapur Localities */}
              {badlapurLocalities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-brand-deep uppercase tracking-wider text-left pl-1 bg-emerald-50/50 py-1 px-2 rounded-md">
                    Badlapur Localities
                  </h4>
                  <div className="space-y-1.5">
                    {badlapurLocalities.map((loc) => renderLocalityItem(loc))}
                  </div>
                </div>
              )}

              {/* Nearby Areas */}
              {nearbyAreas.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-brand-deep uppercase tracking-wider text-left pl-1 bg-emerald-50/50 py-1 px-2 rounded-md">
                    Nearby Areas
                  </h4>
                  <div className="space-y-1.5">
                    {nearbyAreas.map((loc) => renderLocalityItem(loc))}
                  </div>
                </div>
              )}

              {/* Central Line Areas */}
              {centralLineAreas.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-brand-deep uppercase tracking-wider text-left pl-1 bg-emerald-50/50 py-1 px-2 rounded-md">
                    Central Line Areas
                  </h4>
                  <div className="space-y-1.5">
                    {centralLineAreas.map((loc) => renderLocalityItem(loc))}
                  </div>
                </div>
              )}

              {filteredLocalities.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                  🔍 No matching localities found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
