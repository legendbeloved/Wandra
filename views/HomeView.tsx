import React, { useState } from 'react';
import { MapPin, Plus, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Journey } from '../types';
import { format } from 'date-fns';

interface HomeViewProps {
  onStartJourney: (destination: string) => void;
  recentJourneys: Journey[];
  onViewLibrary: () => void;
}

export const HomeView = ({ onStartJourney, recentJourneys, onViewLibrary }: HomeViewProps) => {
  const [destination, setDestination] = useState('');

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-5xl font-serif font-medium tracking-tight text-teal-400">Wandra</h1>
        <p className="text-sand-400 font-medium tracking-widest uppercase text-[10px]">Your journey, written for you.</p>
      </header>

      <section className="space-y-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-sand-400 group-focus-within:text-teal-400 transition-colors">
            <MapPin size={22} />
          </div>
          <input
            type="text"
            placeholder="Where are you heading?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] py-6 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/40 transition-all text-xl font-medium placeholder:text-sand-400/40 shadow-xl shadow-black/10 text-sand-100"
          />
        </div>
        <Button 
          className="w-full py-6 text-xl gap-3 rounded-[2rem]" 
          disabled={!destination.trim()}
          onClick={() => onStartJourney(destination)}
          size="lg"
        >
          <Plus size={24} />
          Start a Journey
        </Button>
      </section>

      {recentJourneys.length > 0 && (
        <section className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-2xl font-serif font-medium text-sand-100">Recent Memories</h2>
            <button 
              onClick={onViewLibrary}
              className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors uppercase tracking-widest"
            >
              Library <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid gap-4">
            {recentJourneys.map((journey) => (
              <Card key={journey.id} variant="glass" className="p-5 flex gap-5 items-center">
                <div className="w-20 h-20 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-3xl shadow-inner border border-white/5">
                  {journey.mood_tag === 'Adventurous' ? '🏔️' : '✨'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-sand-100 truncate">{journey.destination_name}</h3>
                  <p className="text-sm text-sand-400 font-medium">
                    {format(new Date(journey.started_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="px-4 py-1.5 bg-teal-500/10 text-teal-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-teal-500/20">
                  {journey.mood_tag || 'Reflective'}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {recentJourneys.length === 0 && (
        <Card variant="glass" className="p-12 text-center space-y-6 border-dashed border-2 border-white/10">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto shadow-inner border border-white/5">
            <BookOpen className="text-sand-400" size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-serif font-medium text-sand-100">Your journal is empty</h3>
            <p className="text-sm text-sand-400 leading-relaxed">Every great story starts with a single step. Where will yours begin?</p>
          </div>
        </Card>
      )}
    </div>
  );
};
