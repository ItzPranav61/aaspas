'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLocality } from '@/context/LocalityContext';
import {
  MapPin,
  Compass,
  Store,
  Wrench,
  Zap,
  PhoneCall,
  Star,
  Map,
  X,
  BookOpen,
  Camera,
  Briefcase,
  Dumbbell,
  Hammer
} from 'lucide-react';

interface Business {
  id: string;
  name: string;
  category: string;
  description: string | null;
  phone: string;
  address: string;
  localityId: string;
  rating: number;
  isPromoted: boolean;
  isFeatured: boolean;
  leadsCount: number;
}

interface Stats {
  postsCount: number;
  eventsCount: number;
  alertsCount: number;
  groupsCount: number;
}

export default function MyAreaPage() {
  const { currentLocality } = useLocality();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const [stats, setStats] = useState<Stats>({ postsCount: 0, eventsCount: 0, alertsCount: 0, groupsCount: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Calling modal state
  const [callingBusiness, setCallingBusiness] = useState<Business | null>(null);

  const directoryCategories = [
    { label: 'Electrician', value: 'electrician', icon: Zap, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { label: 'Tutor', value: 'tutor', icon: BookOpen, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Photographer', value: 'photographer', icon: Camera, color: 'bg-pink-50 text-pink-600 border-pink-100' },
    { label: 'CA', value: 'ca', icon: Briefcase, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: 'Gym', value: 'gym', icon: Dumbbell, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { label: 'Plumber', value: 'plumber', icon: Wrench, color: 'bg-sky-50 text-sky-600 border-sky-100' },
    { label: 'Mechanic', value: 'mechanic', icon: Hammer, color: 'bg-orange-50 text-orange-600 border-orange-100' },
  ];

  // Fetch local area statistics
  const fetchAreaStats = useCallback(async () => {
    if (!currentLocality) return;
    setLoadingStats(true);
    try {
      // Fetch posts for count
      const postsRes = await fetch(`/api/posts?localityId=${currentLocality.id}`);
      let postsCount = 0;
      let eventsCount = 0;
      let alertsCount = 0;
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        postsCount = postsData.length;
        eventsCount = postsData.filter((p: { category: string }) => p.category === 'event').length;
        alertsCount = postsData.filter((p: { category: string }) => p.category === 'alert').length;
      }

      // Fetch groups count
      const groupsRes = await fetch(`/api/groups?localityId=${currentLocality.id}`);
      let groupsCount = 0;
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        groupsCount = groupsData.length;
      }

      setStats({ postsCount, eventsCount, alertsCount, groupsCount });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [currentLocality]);

  // Fetch businesses based on selected category
  const fetchBusinesses = useCallback(async (cat: string) => {
    if (!currentLocality) return;
    setLoadingDirectory(true);
    try {
      const res = await fetch(`/api/businesses?localityId=${currentLocality.id}&category=${cat}`);
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data);
      }
    } catch (err) {
      console.error('Failed to load directory:', err);
    } finally {
      setLoadingDirectory(false);
    }
  }, [currentLocality]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAreaStats();
    if (activeCategory) {
      fetchBusinesses(activeCategory);
    }
  }, [currentLocality, activeCategory, fetchAreaStats, fetchBusinesses]);

  const handleCallClick = async (biz: Business) => {
    setCallingBusiness(biz);
    try {
      await fetch(`/api/businesses/${biz.id}/lead`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Failed to log lead call:', err);
    }
  };

  const handleCategoryClick = (catVal: string) => {
    if (activeCategory === catVal) {
      setActiveCategory(null);
      setBusinesses([]);
    } else {
      setActiveCategory(catVal);
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md px-4 py-4 border-b border-slate-100 flex items-center gap-1.5 z-30 shadow-xs">
        <MapPin className="text-brand-green" size={20} />
        <h1 className="text-lg font-black text-slate-800">My Area Board</h1>
      </header>

      {/* Locality Profile Details */}
      <div className="px-4 mt-4">
        <div className="card-premium p-5 bg-gradient-to-br from-white to-slate-50 border border-slate-100 flex flex-col space-y-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-1 text-left">
              <h2 className="text-base font-black text-slate-800">
                {currentLocality?.subArea
                  ? `${currentLocality.subArea}, ${currentLocality.name}`
                  : currentLocality?.name || 'Local Neighborhood'}
              </h2>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                <Compass size={12} className="text-slate-400" />
                PINCODE: {currentLocality?.pincode || '421503'} • {currentLocality?.city || 'Thane'}
              </p>
            </div>
            <div className="bg-emerald-50 text-brand-deep p-2 rounded-xl border border-brand-green/10">
              <Map size={18} />
            </div>
          </div>

          {currentLocality?.lat && currentLocality?.lng && (
            <div className="bg-slate-100/50 px-3 py-2 rounded-xl flex items-center justify-between text-[10px] text-slate-500 font-bold border border-slate-200/50">
              <span>COORDINATES</span>
              <span>Latitude: {currentLocality.lat.toFixed(4)}° N • Longitude: {currentLocality.lng.toFixed(4)}° E</span>
            </div>
          )}

          {/* Area Statistics Grid */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="bg-slate-50 border border-slate-100/80 rounded-xl p-2 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Posts</span>
              <span className="text-sm font-black text-slate-800">{loadingStats ? '...' : stats.postsCount}</span>
            </div>
            <div className="bg-red-50 border border-red-100/80 rounded-xl p-2 text-center text-red-700">
              <span className="text-[10px] font-bold text-red-400 block uppercase">Alerts</span>
              <span className="text-sm font-black">{loadingStats ? '...' : stats.alertsCount}</span>
            </div>
            <div className="bg-blue-50 border border-blue-100/80 rounded-xl p-2 text-center text-blue-700">
              <span className="text-[10px] font-bold text-blue-400 block uppercase">Events</span>
              <span className="text-sm font-black">{loadingStats ? '...' : stats.eventsCount}</span>
            </div>
            <div className="bg-purple-50 border border-purple-100/80 rounded-xl p-2 text-center text-purple-700">
              <span className="text-[10px] font-bold text-purple-400 block uppercase">Groups</span>
              <span className="text-sm font-black">{loadingStats ? '...' : stats.groupsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Essentials Directory Category Buttons */}
      <div className="px-4 mt-6">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
          Neighborhood Directory
        </h3>

        <div className="grid grid-cols-4 gap-2">
          {directoryCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.value;

            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryClick(cat.value)}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'bg-brand-deep border-brand-deep text-white scale-[1.03] shadow-md shadow-emerald-950/15'
                    : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-xl mb-1.5 shrink-0 ${isSelected ? 'bg-white/20 text-white' : cat.color}`}>
                  <Icon size={16} />
                </div>
                <span className={`text-[9px] font-bold tracking-tight line-clamp-1`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Category List Items */}
      {activeCategory && (
        <div className="px-4 mt-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
              <span>Listing local {activeCategory}s</span>
              <span className="w-1.5 h-1.5 bg-brand-green rounded-full"></span>
            </h4>
            <button
              onClick={() => {
                setActiveCategory(null);
                setBusinesses([]);
              }}
              className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
            >
              Clear filter
            </button>
          </div>

          {loadingDirectory ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="card-premium p-4 animate-pulse h-28"></div>
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <div className="card-premium p-6 text-center bg-white border border-slate-100 text-slate-400">
              <Store size={22} className="mx-auto text-slate-300 mb-1.5" />
              <p className="text-xs font-bold">No registered businesses found</p>
              <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto mt-0.5">
                We couldn&apos;t find registered {activeCategory} business listing in this sub-area.
              </p>
            </div>
          ) : (
            businesses.map((biz) => {
              const borderStyle = biz.isPromoted 
                ? 'border-emerald-300 bg-emerald-50/5 shadow-xs' 
                : biz.isFeatured 
                ? 'border-amber-200 shadow-xs' 
                : 'border-slate-100 bg-white shadow-2xs';

              return (
                <div
                  key={biz.id}
                  className={`card-premium p-4 border flex flex-col gap-2.5 transition-all ${borderStyle}`}
                >
                  {/* Biz Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="text-left space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-extrabold text-slate-800">{biz.name}</h4>
                        {biz.isPromoted && (
                          <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded-md uppercase">
                            Promoted
                          </span>
                        )}
                        {biz.isFeatured && (
                          <span className="bg-amber-100 text-amber-800 text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded-md uppercase flex items-center gap-0.5">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{biz.category}</p>
                    </div>
                    {/* Rating */}
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg px-2 py-0.5 text-[10px] font-bold">
                      <Star size={10} fill="currentColor" />
                      <span>{biz.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Biz Details */}
                  <div className="text-left space-y-1">
                    {biz.description && (
                      <p className="text-xs text-slate-500 leading-normal">{biz.description}</p>
                    )}
                    <p className="text-[11px] text-slate-650 font-medium leading-normal flex items-start gap-1">
                      <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
                      <span>{biz.address}</span>
                    </p>
                  </div>

                  {/* Dialer trigger button */}
                  <div className="border-t border-slate-50 pt-2.5 mt-0.5 flex justify-end">
                    <button
                      onClick={() => handleCallClick(biz)}
                      className="flex items-center gap-1 bg-brand-green hover:bg-brand-accent text-white py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-green/20"
                    >
                      <PhoneCall size={12} />
                      Call
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Mock Dialer Modal Popup */}
      {callingBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setCallingBusiness(null)}></div>
          <div className="bg-white rounded-3xl p-6 shadow-2xl z-50 max-w-xs w-full text-center relative space-y-4 animate-scale-up border border-slate-100">
            <button
              onClick={() => setCallingBusiness(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:bg-slate-100 rounded-full"
            >
              <X size={16} />
            </button>

            <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center text-brand-deep mx-auto animate-pulse">
              <PhoneCall size={28} className="animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-black tracking-wider uppercase text-brand-green bg-brand-light px-2 py-0.5 rounded-md">
                DIALING NEIGHBORHOOD SERVICE
              </span>
              <h3 className="text-sm font-black text-slate-800 pt-1.5">{callingBusiness.name}</h3>
              <p className="text-xs text-slate-650 font-bold">{callingBusiness.phone}</p>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-400">
              📞 Connecting a secure mock call to this verified neighborhood listing...
            </div>

            <button
              onClick={() => setCallingBusiness(null)}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            >
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
