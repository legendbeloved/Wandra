import React from 'react';
import { Map, Compass, Heart, Settings, LogOut } from 'lucide-react';
import { Card } from '../components/Card';
import { Journey } from '../types';
import { supabase } from '../services/supabaseService';

interface ProfileViewProps {
  journeys: Journey[];
}

export const ProfileView = ({ journeys }: ProfileViewProps) => {
  const stats = {
    totalJourneys: journeys.length,
    totalDistance: journeys.reduce((acc, j) => acc + (j.distance_km || 0), 0),
    cities: Array.from(new Set(journeys.map(j => j.destination_name))).length,
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col items-center text-center space-y-5">
        <div className="w-32 h-32 rounded-[3rem] bg-teal-950 border-2 border-teal-500/20 shadow-2xl shadow-teal-900/30 flex items-center justify-center text-4xl overflow-hidden relative group">
          <img 
            src="https://picsum.photos/seed/traveler/400/400" 
            alt="Profile" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-teal-900/30 group-hover:bg-transparent transition-colors" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-medium text-sand-100">The Wanderer</h2>
          <p className="text-sand-400 text-xs font-black uppercase tracking-[0.2em]">Exploring since 2024</p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <Card variant="glass" className="p-5 text-center space-y-1 rounded-3xl" hoverable={false}>
          <p className="text-3xl font-serif font-bold text-teal-400">{stats.totalJourneys}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-sand-400">Journeys</p>
        </Card>
        <Card variant="glass" className="p-5 text-center space-y-1 rounded-3xl" hoverable={false}>
          <p className="text-3xl font-serif font-bold text-teal-400">{stats.cities}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-sand-400">Places</p>
        </Card>
        <Card variant="glass" className="p-5 text-center space-y-1 rounded-3xl" hoverable={false}>
          <p className="text-3xl font-serif font-bold text-teal-400">{Math.round(stats.totalDistance)}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-sand-400">KM</p>
        </Card>
      </div>

      <section className="space-y-5">
        <h3 className="font-serif font-medium text-2xl text-sand-100">Identity</h3>
        <div className="grid gap-3">
          {[
            { icon: Compass, label: 'Travel Preferences', value: 'Adventurous' },
            { icon: Heart, label: 'Favorite Season', value: 'Autumn' },
            { icon: Map, label: 'Home Base', value: 'London, UK' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-5 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/8 shadow-xl shadow-black/10">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/20">
                  <item.icon size={20} />
                </div>
                <span className="text-sm font-bold text-sand-300">{item.label}</span>
              </div>
              <span className="text-sm font-black text-sand-100 uppercase tracking-widest">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <button className="w-full flex items-center gap-3 p-4 text-sand-400 hover:text-sand-200 transition-colors font-medium text-sm rounded-2xl hover:bg-white/5">
          <Settings size={18} />
          Settings
        </button>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 p-4 text-red-400 hover:text-red-300 transition-colors font-medium text-sm rounded-2xl hover:bg-red-500/5"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </section>
    </div>
  );
};
