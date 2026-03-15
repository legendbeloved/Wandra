"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Settings, 
  BookOpen, 
  Navigation, 
  MapPin, 
  Clock, 
  Camera, 
  User, 
  ChevronRight,
  TrendingUp,
  Heart
} from "lucide-react";
import { supabase } from "@/services/supabaseService";
import { Profile, Journey, Moment } from "@/types/index";
import { format } from "date-fns";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [stats, setStats] = useState({
    totalJourneys: 0,
    totalDistance: 0,
    uniqueCities: 0,
    totalHours: 0
  });
  const [moodDistribution, setMoodDistribution] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        // Fetch Profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profileData);

        // Fetch Journeys for stats and history
        const { data: journeysData } = await supabase
          .from("journeys")
          .select("*, moments(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        const journeysList = (journeysData || []) as (Journey & { moments: Moment[] })[];
        setJourneys(journeysList);

        // Calculate Stats
        let totalKm = 0;
        const cities = new Set<string>();
        let totalDurationMs = 0;
        const moods: Record<string, number> = {};

        journeysList.forEach(j => {
          // Duration
          if (j.started_at && j.ended_at) {
            totalDurationMs += new Date(j.ended_at).getTime() - new Date(j.started_at).getTime();
          }
          
          // Moods
          if (j.mood_tag) {
            const m = j.mood_tag.toLowerCase();
            moods[m] = (moods[m] || 0) + 1;
          }

          // Cities & Distance from moments
          j.moments?.forEach(m => {
            if (m.place_name) {
              const city = m.place_name.split(',')[0].trim();
              cities.add(city);
            }
          });

          // Distance estimation (simplified for now: each moment ~1.2km avg)
          totalKm += (j.moments?.length || 0) * 1.2;
        });

        setStats({
          totalJourneys: journeysList.length,
          totalDistance: Math.round(totalKm),
          uniqueCities: cities.size,
          totalHours: Math.round(totalDurationMs / (1000 * 60 * 60))
        });

        setMoodDistribution(moods);

      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update Profile record
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F7F4] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#C4622D] border-t-transparent animate-spin" />
      </div>
    );
  }

  // RECENT JOURNEYS (Top 3)
  const recentJourneys = journeys.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F9F7F4] text-[#1E1C1A] font-body pb-24 relative overflow-x-hidden wandra-paper-texture">
      
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 left-0 w-full z-40 bg-[#F9F7F4]/80 backdrop-blur-xl px-4 py-4 pt-safe flex items-center justify-between border-b border-[#E8E2D9]">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#E8E2D9]">
            <ChevronLeft className="w-5 h-5 text-[#8C837A]" />
          </button>
          <h1 className="font-serif text-[20px] font-bold">My Profile</h1>
        </div>
        <Link href="/profile/settings" className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#E8E2D9]">
          <Settings className="w-5 h-5 text-[#8C837A]" />
        </Link>
      </header>

      <main className="max-w-[500px] mx-auto px-6 pt-8">
        
        {/* AVATAR SECTION */}
        <section className="flex flex-col items-center mb-10 text-center">
          <div className="relative group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAvatarClick}
              className="w-24 h-24 rounded-full border-[3px] border-[#C4622D] p-1 cursor-pointer overflow-hidden bg-white shadow-xl shadow-amber-900/10"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-[#F1EDE9] flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-[#C2BAB0]" />
                )}
                <AnimatePresence>
                  {isUploading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/30 flex items-center justify-center"
                    >
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#C4622D] text-white flex items-center justify-center border-2 border-white shadow-lg pointer-events-none">
              <Camera className="w-4 h-4" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          
          <h2 className="font-serif text-[26px] font-bold mt-4 mb-0.5">{profile?.display_name || "Traveler"}</h2>
          <p className="text-outfit text-[13px] text-[#8C837A]">
            Member since {profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : "January 2025"}
          </p>
        </section>

        {/* TRAVEL STATS GRID */}
        <section className="grid grid-cols-2 gap-3 mb-12">
          {[
            { label: "Journeys", value: stats.totalJourneys, icon: BookOpen, color: "bg-blue-50 text-blue-600" },
            { label: "Distance", value: `${stats.totalDistance} km`, icon: Navigation, color: "bg-amber-50 text-amber-600" },
            { label: "Cities", value: stats.uniqueCities, icon: MapPin, color: "bg-emerald-50 text-emerald-600" },
            { label: "Hours", value: `${stats.totalHours}h`, icon: Clock, color: "bg-purple-50 text-purple-600" },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/60 backdrop-blur-sm border border-[#E8E2D9] rounded-[24px] p-5 shadow-sm"
            >
              <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-[20px] font-bold font-serif leading-none mb-1">{stat.value}</p>
              <p className="text-[11px] uppercase tracking-wider text-[#8C837A] font-bold">{stat.label}</p>
            </motion.div>
          ))}
        </section>

        {/* JOURNEY HISTORY */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="font-serif text-[18px] font-bold">Recent History</h3>
            <Link href="/home" className="text-[13px] font-bold text-[#C4622D] flex items-center gap-1 group">
              View All <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentJourneys.length > 0 ? (
              recentJourneys.map((j) => (
                <Link key={j.id} href={`/journal/${j.id}`}>
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex items-center gap-4 p-4 bg-white border border-[#E8E2D9] rounded-2xl shadow-sm hover:border-[#C4622D]/30 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1A6B7C]/10 to-[#C4622D]/10 flex items-center justify-center text-[#1A6B7C]">
                      {j.cover_photo_url ? (
                        <img src={j.cover_photo_url} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <BookOpen className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-[15px] font-bold truncate">{j.destination_name}</h4>
                      <p className="text-outfit text-[12px] text-[#8C837A]">
                        {format(new Date(j.created_at), "MMM d, yyyy")} • {j.mood_tag || 'Reflective'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#C2BAB0]" />
                  </motion.div>
                </Link>
              ))
            ) : (
              <div className="py-8 text-center bg-white/40 border border-[#E8E2D9] rounded-2xl border-dashed">
                <p className="text-outfit text-sm text-[#8C837A]">Your story starts here.</p>
              </div>
            )}
          </div>
        </section>

        {/* MOOD MAP (Donut Chart) */}
        <section className="mb-12">
          <h3 className="font-serif text-[18px] font-bold mb-6 px-1">Mood Landscape</h3>
          <div className="bg-white/60 backdrop-blur-sm border border-[#E8E2D9] rounded-[32px] p-8 flex flex-col items-center">
            
            {/* SVG DONUT CHART */}
            <div className="relative w-40 h-40 mb-8">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Circular track */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1EDE9" strokeWidth="12" />
                
                {/* Mood Segments */}
                {Object.entries(moodDistribution).length > 0 ? (
                  (() => {
                    let total = Object.values(moodDistribution).reduce((a, b) => a + b, 0);
                    let cumPerc = 0;
                    const colors = ['#2E92A8', '#E47832', '#6E665E', '#6B9E72', '#C2BAB0'];
                    
                    return Object.entries(moodDistribution).map(([mood, count], i) => {
                      const perc = (count / total) * 100;
                      const dashArray = `${perc * 2.513} 251.3`;
                      const dashOffset = `-${cumPerc * 2.513}`;
                      cumPerc += perc;
                      
                      return (
                        <motion.circle 
                          key={mood}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                          cx="50" cy="50" r="40" 
                          fill="transparent" 
                          stroke={colors[i % colors.length]} 
                          strokeWidth="12" 
                          strokeDasharray={dashArray}
                          strokeDashoffset={dashOffset}
                          strokeLinecap="round"
                        />
                      );
                    });
                  })()
                ) : (
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EDE9E4" strokeWidth="12" strokeDasharray="5, 5" />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Heart className="w-6 h-6 text-[#C4622D] mb-1 fill-[#C4622D]/10" />
                <span className="text-[12px] font-bold tracking-widest text-[#8C837A] uppercase">Vibes</span>
              </div>
            </div>

            {/* LEGEND */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full max-w-[280px]">
              {Object.entries(moodDistribution).length > 0 ? (
                Object.entries(moodDistribution).map(([mood, count], i) => {
                  const colors = ['#2E92A8', '#E47832', '#6E665E', '#6B9E72', '#C2BAB0'];
                  return (
                    <div key={mood} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                      <span className="text-[13px] font-medium capitalize flex-1">{mood}</span>
                      <span className="text-[12px] font-mono text-[#8C837A]">{count}</span>
                    </div>
                  );
                })
              ) : (
                <p className="col-span-2 text-center text-xs text-[#8C837A] italic">Log more journeys to map your moods.</p>
              )}
            </div>
          </div>
        </section>

      </main>

    </div>
  );
}
