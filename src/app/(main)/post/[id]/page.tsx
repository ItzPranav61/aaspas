'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User as UserIcon,
  Heart,
  MessageCircle,
  AlertTriangle,
  Calendar,
  MapPin,
  Tag,
  Send,
  Share2
} from 'lucide-react';

interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    avatarUrl: string | null;
  };
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
  comments: Comment[];
}

export default function PostDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchPostDetails() {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (res.ok) {
          const data: Post = await res.json();
          setPost(data);
          setLikesCount(data.likes?.length || 0);
          setLiked(data.likes?.some((like) => like.userId === user?.id) || false);
        } else {
          setError('Post not found.');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post.');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchPostDetails();
  }, [id, user]);

  const handleLikeToggle = async () => {
    if (!user || !post) return;

    const currentlyLiked = liked;
    const currentCount = likesCount;

    setLiked(!currentlyLiked);
    setLikesCount(currentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1);

    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, userId: user.id }),
      });

      if (!res.ok) {
        // Rollback
        setLiked(currentlyLiked);
        setLikesCount(currentCount);
      } else {
        const result = await res.json();
        setLiked(result.liked);
        setLikesCount(result.count);
      }
    } catch (err) {
      console.error(err);
      setLiked(currentlyLiked);
      setLikesCount(currentCount);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !post || !commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          userId: user.id,
          content: commentText.trim(),
        }),
      });

      if (res.ok) {
        const newComment: Comment = await res.json();
        setPost((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            comments: [...prev.comments, newComment],
          };
        });
        setCommentText('');
        // Scroll to bottom
        setTimeout(() => {
          commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmittingComment(false);
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
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8 bg-slate-50 min-h-screen">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-green rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 text-center bg-slate-50">
        <p className="text-red-500 font-bold mb-4">{error || 'Post not found.'}</p>
        <button
          onClick={() => router.push('/')}
          className="bg-brand-deep text-white py-2.5 px-5 rounded-xl font-bold text-sm shadow-md"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  // Clean group tags
  const isGroupPost = post.content.startsWith('[Group:');
  let displayContent = post.content;
  if (isGroupPost) {
    displayContent = post.content.replace(/^\[Group:[^\]]+\]/, '');
  }

  return (
    <div className="flex flex-col flex-1 bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-slate-100 flex items-center gap-3 z-30 shadow-xs">
        <button
          onClick={() => router.back()}
          className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-base font-extrabold text-slate-800">Discussion</h2>
      </header>

      {/* Main Container */}
      <div className="px-4 py-4 space-y-4 pb-28">
        {/* Post Detail Card */}
        <div className="card-premium p-4 border border-slate-100 flex flex-col space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100">
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
                <p className="text-[10px] text-slate-400 font-semibold">{formatTimestamp(post.createdAt)}</p>
              </div>
            </div>

            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${getCategoryBadgeStyle(post.category)}`}>
              {post.category.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Title & Body */}
          <div className="space-y-2">
            <h3 className="text-base font-black text-slate-800 leading-snug">
              {post.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {displayContent}
            </p>
          </div>

          {/* Category-Specific Visual Details */}
          {post.category === 'event' && post.eventDetail && (
            <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100/50 space-y-2 text-xs font-bold text-blue-700">
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>
                  {new Date(post.eventDetail.eventDate).toLocaleString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span>{post.eventDetail.location}</span>
              </div>
            </div>
          )}

          {post.category === 'alert' && post.alertDetail && (
            <div className={`p-3.5 rounded-2xl border flex items-center gap-2 text-xs font-bold ${
              post.alertDetail.severity === 'critical'
                ? 'bg-red-50 border-red-100 text-red-700'
                : post.alertDetail.severity === 'warning'
                ? 'bg-amber-50 border-amber-100 text-amber-700'
                : 'bg-blue-50 border-blue-100 text-blue-700'
            }`}>
              <AlertTriangle size={16} className="shrink-0 animate-bounce" />
              <div>
                <p className="uppercase">{post.alertDetail.severity} Severity Alert</p>
                {post.alertDetail.expiresAt && (
                  <p className="text-[10px] opacity-80 font-normal mt-0.5">
                    Active until {new Date(post.alertDetail.expiresAt).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>
            </div>
          )}

          {post.category === 'lost_found' && post.lostFoundDetail && (
            <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100/50 text-xs font-bold space-y-1">
              <p className="text-indigo-800 uppercase flex items-center gap-1">
                <span>⚠️ Type:</span>
                <span className="bg-indigo-100 px-2 py-0.5 rounded-full">{post.lostFoundDetail.type.toUpperCase()}</span>
              </p>
              <p className="text-indigo-700">Item: {post.lostFoundDetail.itemName}</p>
              {post.lostFoundDetail.reward && (
                <p className="text-indigo-600 italic">🎁 Reward: {post.lostFoundDetail.reward}</p>
              )}
            </div>
          )}

          {post.category === 'buy_sell' && (
            <div className="inline-flex self-start items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-100 text-xs font-bold">
              <Tag size={12} />
              <span>Buy & Sell Post</span>
            </div>
          )}

          {/* Post Image */}
          {post.imageUrl && (
            <div className="relative h-60 rounded-2xl overflow-hidden mt-2 bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Footer controls */}
          <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-1.5 text-slate-400">
            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-1.5 hover:text-red-500 transition-colors p-1.5 -m-1.5 rounded-md ${
                liked ? 'text-red-500 font-bold' : ''
              }`}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
              <span className="text-sm font-semibold">{likesCount} Likes</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied!');
              }}
              className="flex items-center gap-1 hover:text-slate-600 transition-colors text-xs font-semibold"
            >
              <Share2 size={16} />
              Share Link
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Comments ({post.comments?.length || 0})
          </h3>

          <div className="space-y-3">
            {post.comments?.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-slate-100 p-4">
                <MessageCircle size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-400">No comments yet</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Start the conversation below!</p>
              </div>
            ) : (
              post.comments?.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white rounded-2xl border border-slate-100 p-3.5 flex gap-3 shadow-xs"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 shrink-0">
                    {comment.user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={comment.user.avatarUrl} alt={comment.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-100">
                        <UserIcon size={14} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800">{comment.user.name}</h4>
                      <span className="text-[9px] text-slate-400">{formatTimestamp(comment.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>
        </div>
      </div>

      {/* Floating Comment Form at the bottom */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 py-3.5 px-4 z-40 shadow-2xl flex gap-2 items-center">
        <form onSubmit={handleCommentSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-850 font-medium"
            disabled={isSubmittingComment}
            required
          />
          <button
            type="submit"
            disabled={isSubmittingComment || !commentText.trim()}
            className="w-10 h-10 bg-brand-deep hover:bg-brand-accent text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 shrink-0 shadow-md shadow-emerald-950/10"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
