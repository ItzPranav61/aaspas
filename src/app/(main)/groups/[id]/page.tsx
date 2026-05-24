'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocality } from '@/context/LocalityContext';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Plus,
  Send,
  MessageCircle,
  Heart,
  Share2,
  Lock,
  User as UserIcon,
  Sparkles,
  Megaphone
} from 'lucide-react';

interface Member {
  userId: string;
  role: string;
  user: {
    name: string;
    avatarUrl: string | null;
  };
}

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  localityId: string;
  createdBy: string;
  createdAt: string;
  members: Member[];
}

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
  likes: { userId: string }[];
  comments: unknown[];
}

export default function GroupDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { currentLocality } = useLocality();
  const router = useRouter();

  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(0);

  // Quick Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // Likes tracker
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const fetchGroupDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/${id}`);
      if (res.ok) {
        const data: Group = await res.json();
        setGroup(data);
        setMemberCount(data.members?.length || 0);
        setIsJoined(data.members?.some((m) => m.userId === user?.id) || false);
      }
    } catch (err) {
      console.error('Failed to fetch group info:', err);
    } finally {
      setLoadingGroup(false);
    }
  }, [id, user]);

  const fetchGroupPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch(`/api/posts?groupId=${id}`);
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
      console.error('Failed to fetch group posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchGroupDetails();
      fetchGroupPosts();
    }
  }, [id, fetchGroupDetails, fetchGroupPosts]);

  const handleJoinToggle = async () => {
    if (!user || !group) return;

    const currentlyJoined = isJoined;
    const currentCount = memberCount;

    // Optimistic Update
    setIsJoined(!currentlyJoined);
    setMemberCount(currentlyJoined ? Math.max(1, currentCount - 1) : currentCount + 1);

    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: group.id, userId: user.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to toggle membership');
        // Rollback
        setIsJoined(currentlyJoined);
        setMemberCount(currentCount);
      } else {
        const result = await res.json();
        setIsJoined(result.joined);
        setMemberCount(result.count);
        fetchGroupDetails(); // Refresh members list
      }
    } catch (err) {
      console.error(err);
      // Rollback
      setIsJoined(currentlyJoined);
      setMemberCount(currentCount);
    }
  };

  const handleLikeToggle = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!user) return;

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
      }
    } catch (err) {
      console.error(err);
      // Rollback
      setLikedPosts((prev) => ({ ...prev, [postId]: currentlyLiked }));
      setLikeCounts((prev) => ({ ...prev, [postId]: currentCount }));
    }
  };

  const handleQuickPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError(null);

    if (!postTitle.trim() || !postContent.trim()) {
      setPostError('Post title and details are required.');
      return;
    }

    setIsPosting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          localityId: group?.localityId || currentLocality?.id || '',
          title: postTitle.trim(),
          content: postContent.trim(),
          category: 'general',
          imageUrl: postImage || null,
          groupId: group?.id, // Tags this post as a group post
        }),
      });

      if (res.ok) {
        setPostTitle('');
        setPostContent('');
        setPostImage('');
        fetchGroupPosts(); // Refresh group feed
      } else {
        const err = await res.json();
        setPostError(err.error || 'Failed to publish post.');
      }
    } catch (err) {
      console.error('Failed to create quick post:', err);
      setPostError('Connection error. Please try again.');
    } finally {
      setIsPosting(false);
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

  if (loadingGroup) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8 bg-slate-50 min-h-screen">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-green rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 text-center bg-slate-50">
        <p className="text-red-500 font-bold mb-4">Group not found.</p>
        <button
          onClick={() => router.push('/groups')}
          className="bg-brand-deep text-white py-2.5 px-5 rounded-xl font-bold text-sm shadow-md"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-slate-100 flex items-center gap-3 z-30 shadow-xs">
        <button
          onClick={() => router.back()}
          className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-base font-extrabold text-slate-800 line-clamp-1">{group.name}</h2>
      </header>

      {/* Group Banner Header */}
      <div className="bg-gradient-to-br from-emerald-950 via-brand-deep to-emerald-900 text-white px-5 py-6 shadow-md shadow-emerald-950/10">
        <div className="space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-brand-light px-2.5 py-0.5 rounded-md border border-brand-green/20">
              {group.category}
            </span>
            <span className="text-[11px] opacity-90 font-medium">{memberCount} Members</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-black leading-tight tracking-tight">{group.name}</h1>
            <p className="text-xs opacity-85 leading-relaxed">{group.description}</p>
          </div>

          <div className="pt-1.5 flex gap-2">
            <button
              onClick={handleJoinToggle}
              className={`flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isJoined
                  ? 'bg-white/10 hover:bg-red-500/20 border border-white/20 text-white'
                  : 'bg-brand-green hover:bg-brand-accent text-white shadow-md shadow-brand-deep/30'
              }`}
            >
              {isJoined ? (
                <>
                  <Check size={14} />
                  Member
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Join Group
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 py-4 space-y-4">
        {/* Quick Post Box */}
        <div className="card-premium p-4 border border-slate-100 bg-white">
          {!isJoined ? (
            <div className="text-center py-4 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <Lock size={20} className="text-slate-350" />
              <p className="text-xs font-bold">Joined Members Only</p>
              <p className="text-[10px] text-slate-405 max-w-[210px]">
                Join this group to post updates, share recommendations, and chat with neighbors.
              </p>
            </div>
          ) : (
            <form onSubmit={handleQuickPostSubmit} className="space-y-3">
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1">
                <Sparkles className="text-brand-green" size={14} />
                Quick Post to Group
              </h3>

              {postError && (
                <div className="text-[11px] text-red-650 bg-red-50 p-2 rounded-lg font-medium">
                  {postError}
                </div>
              )}

              <input
                type="text"
                placeholder="Post title..."
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green text-slate-800 font-bold"
                required
              />

              <textarea
                placeholder="Share something with the group members..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green text-slate-800"
                required
              />

              <div className="flex gap-2 items-center">
                <input
                  type="url"
                  placeholder="Optional image url..."
                  value={postImage}
                  onChange={(e) => setPostImage(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:outline-none text-slate-500"
                />
                <button
                  type="submit"
                  disabled={isPosting}
                  className="bg-brand-deep hover:bg-brand-accent text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-md shadow-emerald-950/10 shrink-0"
                >
                  <Send size={12} />
                  Post
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Group Feed Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Group Feed</h3>

          {loadingPosts ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="card-premium p-4 animate-pulse h-32 bg-slate-100"></div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="card-premium p-8 text-center bg-white border border-slate-100">
              <Megaphone className="mx-auto text-slate-300 mb-2" size={24} />
              <p className="text-xs font-bold text-slate-500">No posts in this group yet</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Be the first one to share an update here!</p>
            </div>
          ) : (
            posts.map((post) => {
              const hasLiked = likedPosts[post.id];
              const likesCount = likeCounts[post.id] || 0;
              const commentsCount = post.comments?.length || 0;

              // Clean group tag prefix for rendering
              const displayContent = post.content.replace(/^\[Group:[^\]]+\]/, '');

              return (
                <div
                  key={post.id}
                  onClick={() => router.push(`/post/${post.id}`)}
                  className="card-premium p-4 border border-slate-100 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex flex-col space-y-3"
                >
                  {/* Author Header */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 shrink-0">
                      {post.user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.user.avatarUrl} alt={post.user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-100">
                          <UserIcon size={14} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{post.user.name}</h4>
                      <p className="text-[9px] text-slate-400">{formatTimestamp(post.createdAt)}</p>
                    </div>
                  </div>

                  {/* Title and Body */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-extrabold text-slate-800 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-650 leading-relaxed line-clamp-3 whitespace-pre-line">
                      {displayContent}
                    </p>
                  </div>

                  {/* Optional Image */}
                  {post.imageUrl && (
                    <div className="relative h-40 rounded-xl overflow-hidden mt-1 bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Footer Toggles */}
                  <div className="flex items-center justify-between border-t border-slate-50 pt-2 text-slate-400">
                    <div className="flex gap-4">
                      <button
                        onClick={(e) => handleLikeToggle(e, post.id)}
                        className={`flex items-center gap-1 hover:text-red-500 transition-colors p-1 -m-1 rounded-md ${
                          hasLiked ? 'text-red-500 font-bold' : ''
                        }`}
                      >
                        <Heart size={15} fill={hasLiked ? 'currentColor' : 'none'} />
                        <span className="text-xs font-semibold">{likesCount}</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <MessageCircle size={15} />
                        <span className="text-xs font-semibold">{commentsCount}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                        alert('Link copied!');
                      }}
                      className="hover:text-slate-500 p-1 rounded-md"
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
