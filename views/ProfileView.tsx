'use client';

import React, { useState } from 'react';
import { Map, Compass, Heart, Settings, LogOut, Edit3, Check, X, Loader2, Sparkles } from 'lucide-react';
import { Card } from '../components/Card';
import { Journey, Profile } from '../types';
import { SupabaseService } from '../services/supabaseService';
import { useAuthStore } from '../store/authStore';

interface ProfileViewProps {
  journeys: Journey[];
}

export const ProfileView = ({ journeys }: ProfileViewProps) => {
  const { profile, setProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Editable fields
  const [editValues, setEditValues] = useState({
    display_name: profile?.display_name || '',
    travel_preferences: profile?.travel_preferences || '',
    favorite_season: profile?.favorite_season || '',
    home_base: profile?.home_base || '',
    ai_style: profile?.ai_style || 'poetic',
  });

  const stats = {
    totalJourneys: journeys.length,
    totalDistance: journeys.reduce((acc, j) => acc + (j.distance_km || 0), 0),
    cities: Array.from(new Set(journeys.map(j => j.destination_name))).length,
  };

  const handleSignOut = async () => {
    await SupabaseService.signOut();
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    setIsSaving(true);
    try {
      const updatedProfile = await SupabaseService.updateProfile(profile.id, editValues);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditValues({
      display_name: profile?.display_name || '',
      travel_preferences: profile?.travel_preferences || '',
      favorite_season: profile?.favorite_season || '',
      home_base: profile?.home_base || '',
      ai_style: profile?.ai_style || 'poetic',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col items-center text-center space-y-5">
        <div className="w-32 h-32 rounded-[3.5rem] bg-teal-950 border-2 border-teal-500/20 shadow-2xl shadow-teal-900/30 flex items-center justify-center text-4xl overflow-hidden relative group">
          <img 
            src={profile?.avatar_url || `https://picsum.photos/seed/${profile?.id}/400/400`} 
            alt="Profile" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-teal-900/30 group-hover:bg-transparent transition-colors" />
        </div>
        <div className="space-y-2 w-full max-w-xs">
          {isEditing ? (
            <input 
              value={editValues.display_name}
              onChange={(e) => setEditValues({...editValues, display_name: e.target.value})}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center text-2xl font-serif text-sand-100 w-full focus:outline-none focus:border-teal-500"
              placeholder="Display Name"
            />
          ) : (
            <h2 className="text-3xl font-serif font-medium text-sand-100">{profile?.display_name || "The Wanderer"}</h2>
          )}
          <p className="text-sand-400 text-[10px] font-black uppercase tracking-[0.3em]">
            Exploring since {new Date(profile?.created_at || Date.now()).getFullYear()}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Journeys', value: stats.totalJourneys },
          { label: 'Places', value: stats.cities },
          { label: 'KM', value: Math.round(stats.totalDistance) }
        ].map((stat, i) => (
          <Card key={i} variant="glass" className="p-5 text-center space-y-1 rounded-[2rem]" hoverable={false}>
            <p className="text-2xl font-serif font-bold text-teal-400">{stat.value}</p>
            <p className="text-[8px] font-black uppercase tracking-widest text-sand-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      <section className="space-y-5">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-serif font-medium text-2xl text-sand-100">Identity</h3>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 bg-teal-500/10 text-teal-400 rounded-full hover:bg-teal-500/20 transition-colors"
            >
              <Edit3 size={18} />
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              </button>
              <button 
                onClick={cancelEdit}
                className="p-2 bg-white/10 text-sand-400 rounded-full hover:bg-white/20 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>
        
        <div className="grid gap-3">
          {[
            { icon: Compass, label: 'Preferences', value: editValues.travel_preferences, key: 'travel_preferences' },
            { icon: Heart, label: 'Season', value: editValues.favorite_season, key: 'favorite_season' },
            { icon: Map, label: 'Home Base', value: editValues.home_base, key: 'home_base' },
            { icon: Sparkles, label: 'AI Style', value: editValues.ai_style, key: 'ai_style', isSelect: true },
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-2 p-5 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/8 shadow-xl shadow-black/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/20">
                    <item.icon size={18} />
                  </div>
                  <span className="text-xs font-bold text-sand-400 uppercase tracking-wider">{item.label}</span>
                </div>
              </div>
              
              {isEditing ? (
                item.isSelect ? (
                  <select
                    value={editValues.ai_style}
                    onChange={(e) => setEditValues({...editValues, ai_style: e.target.value as any})}
                    className="mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sand-100 focus:outline-none focus:border-teal-500 text-sm appearance-none"
                  >
                    <option value="poetic" className="text-black">Poetic</option>
                    <option value="descriptive" className="text-black">Descriptive</option>
                    <option value="brief" className="text-black">Brief</option>
                  </select>
                ) : (
                  <input 
                    value={item.value || ''}
                    onChange={(e) => setEditValues({...editValues, [item.key]: e.target.value})}
                    className="mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sand-100 focus:outline-none focus:border-teal-500 text-sm"
                    placeholder={`Enter ${item.label.toLowerCase()}...`}
                  />
                )
              ) : (
                <span className="text-base font-medium text-sand-100 ml-12">
                  {item.value || "Not set"}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 pt-5">
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-3 p-5 text-red-400/80 hover:text-red-300 transition-colors font-bold text-xs uppercase tracking-widest rounded-3xl border border-red-500/10 hover:bg-red-500/5 shadow-lg shadow-black/10"
        >
          <LogOut size={16} />
          Sign Out of Journey
        </button>
      </section>
    </div>
  );
};
