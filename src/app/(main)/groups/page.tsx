'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocality } from '@/context/LocalityContext';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Plus,
  X,
  Check
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  localityId: string;
  createdBy: string;
  createdAt: string;
  members: { userId: string; role: string }[];
}

const categories = [
  { label: 'All', value: 'all' },
  { label: 'Locality', value: 'locality' },
  { label: 'Society', value: 'society' },
  { label: 'Interest', value: 'interest' },
  { label: 'Support', value: 'support' },
  { label: 'Events', value: 'events' },
];

export default function GroupsPage() {
  const { user } = useAuth();
  const { currentLocality } = useLocality();
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Create Group Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCat, setNewGroupCat] = useState('locality');
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Live join status states
  const [joinedStatus, setJoinedStatus] = useState<Record<string, boolean>>({});
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});



  const fetchGroups = useCallback(async () => {
    if (!currentLocality) return;
    setLoading(true);
    try {
      const catObj = categories.find((c) => c.label === activeCategory);
      const catParam = catObj ? catObj.value : 'all';
      
      const res = await fetch(
        `/api/groups?localityId=${currentLocality.id}&category=${catParam}&search=${searchTerm}`
      );
      if (res.ok) {
        const data: Group[] = await res.json();
        setGroups(data);

        // Map initial membership counts & join status
        const initialStatus: Record<string, boolean> = {};
        const initialCounts: Record<string, number> = {};
        data.forEach((group) => {
          initialCounts[group.id] = group.members?.length || 0;
          initialStatus[group.id] = group.members?.some((m) => m.userId === user?.id) || false;
        });
        setJoinedStatus(initialStatus);
        setMemberCounts(initialCounts);
      }
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      setLoading(false);
    }
  }, [currentLocality, activeCategory, searchTerm, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGroups();
  }, [fetchGroups]);

  const handleJoinToggle = async (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation(); // Prevent clicking card redirection
    if (!user) return;

    const currentlyJoined = joinedStatus[groupId];
    const currentCount = memberCounts[groupId];

    // Optimistic Update
    setJoinedStatus((prev) => ({ ...prev, [groupId]: !currentlyJoined }));
    setMemberCounts((prev) => ({
      ...prev,
      [groupId]: currentlyJoined ? Math.max(1, currentCount - 1) : currentCount + 1,
    }));

    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, userId: user.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to toggle group join.');
        // Rollback
        setJoinedStatus((prev) => ({ ...prev, [groupId]: currentlyJoined }));
        setMemberCounts((prev) => ({ ...prev, [groupId]: currentCount }));
      } else {
        const result = await res.json();
        setJoinedStatus((prev) => ({ ...prev, [groupId]: result.joined }));
        setMemberCounts((prev) => ({ ...prev, [groupId]: result.count }));
      }
    } catch (err) {
      console.error('Join/Leave request failed:', err);
      // Rollback
      setJoinedStatus((prev) => ({ ...prev, [groupId]: currentlyJoined }));
      setMemberCounts((prev) => ({ ...prev, [groupId]: currentCount }));
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!newGroupName.trim() || !newGroupDesc.trim()) {
      setModalError('Please fill out all required fields.');
      return;
    }

    setIsSubmittingGroup(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDesc.trim(),
          category: newGroupCat,
          localityId: currentLocality?.id || user?.localityId || '',
          createdBy: user?.id || '',
        }),
      });

      if (res.ok) {
        // Success
        setNewGroupName('');
        setNewGroupDesc('');
        setNewGroupCat('locality');
        setIsCreateModalOpen(false);
        fetchGroups();
      } else {
        const errData = await res.json();
        setModalError(errData.error || 'Failed to create group.');
      }
    } catch (err) {
      console.error('Create group failed:', err);
      setModalError('Connection error. Please try again.');
    } finally {
      setIsSubmittingGroup(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-6">
      {/* Top sticky search bar */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex flex-col gap-2.5 z-30 shadow-xs">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-1.5">
            <Users className="text-brand-green" size={22} />
            Local Groups
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1 bg-brand-light text-brand-deep border border-brand-green/20 py-1.5 px-3 rounded-full text-xs font-bold transition-all active:scale-95 hover:bg-brand-green hover:text-white"
          >
            <Plus size={14} />
            Create Group
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search local groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-800 font-medium"
          />
        </div>
      </header>

      {/* Category Tabs */}
      <div className="mt-3.5 px-4 overflow-x-auto no-scrollbar flex items-center gap-2">
        {categories.map((tab) => {
          const isActive = activeCategory === tab.label;
          return (
            <button
              key={tab.label}
              onClick={() => setActiveCategory(tab.label)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-brand-deep border-brand-deep text-white shadow-md shadow-emerald-950/15'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Groups Directory List */}
      <div className="px-4 mt-4 space-y-3.5">
        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card-premium p-4 animate-pulse flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-2.5 bg-slate-200 rounded w-2/3"></div>
                </div>
                <div className="w-20 h-8 bg-slate-200 rounded-full"></div>
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="card-premium p-8 text-center space-y-4 mt-4 flex flex-col items-center justify-center bg-white border border-slate-100">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-1">
              <Users size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No groups found</h3>
            <p className="text-xs text-slate-400 max-w-[240px] mx-auto">
              We couldn&apos;t find any groups matching your query in this area. Create a new one to get started!
            </p>
          </div>
        ) : (
          groups.map((group) => {
            const isJoined = joinedStatus[group.id];
            const membersCount = memberCounts[group.id] || 0;

            return (
              <div
                key={group.id}
                onClick={() => router.push(`/groups/${group.id}`)}
                className="card-premium p-4 border border-slate-100 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-brand-accent tracking-wider bg-brand-light px-2 py-0.5 rounded-md border border-brand-green/10">
                      {group.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{membersCount} Members</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 leading-tight">
                    {group.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-normal line-clamp-2">
                    {group.description}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <button
                    onClick={(e) => handleJoinToggle(e, group.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1 ${
                      isJoined
                        ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                        : 'bg-brand-deep border-brand-deep text-white shadow-xs hover:bg-brand-accent'
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <Check size={12} />
                        Joined
                      </>
                    ) : (
                      'Join'
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Group Bottom Sheet Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCreateModalOpen(false)}
          ></div>

          {/* Sheet */}
          <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-6 z-50 animate-slide-up">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-1.5">
                <Users className="text-brand-green" size={18} />
                Create New Group
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-xl border border-red-100">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Group Name</label>
                <input
                  type="text"
                  placeholder={`e.g. ${currentLocality?.name || 'Local'} Hiking Society`}
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-800 font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Category</label>
                <select
                  value={newGroupCat}
                  onChange={(e) => setNewGroupCat(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-700 font-semibold"
                >
                  <option value="locality">Locality Association</option>
                  <option value="society">Society Group</option>
                  <option value="interest">Interest/Hobby Club</option>
                  <option value="support">Neighborhood Support</option>
                  <option value="events">Events & Festival</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Description</label>
                <textarea
                  rows={3}
                  placeholder="What is the group about? Who should join?"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-800"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmittingGroup}
                className="w-full bg-brand-deep hover:bg-brand-accent text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-950/15 disabled:opacity-50"
              >
                {isSubmittingGroup ? 'Creating...' : 'Create & Join'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
