import React from 'react';
import { format } from 'date-fns';
import { Calendar, Trash2, Clock } from 'lucide-react';
import { Card } from '../components/Card';
import { Journey } from '../types';
import { formatJourneyDuration } from '../lib/dateUtils';

interface LibraryViewProps {
  journeys: Journey[];
  onSelectJourney: (journey: Journey) => void;
  onDeleteJourney: (id: string) => void;
}

export const LibraryView = ({ journeys, onSelectJourney, onDeleteJourney }: LibraryViewProps) => {
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this memory?')) {
      onDeleteJourney(id);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-4xl font-serif font-medium tracking-tight text-sand-100">Memory Vault</h1>
        <p className="text-sand-400 font-medium tracking-widest uppercase text-[10px]">Your past journeys, preserved.</p>
      </header>

      {journeys.length === 0 ? (
        <div className="py-20 text-center space-y-6">
          <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-white/5">
            <Calendar className="text-sand-400" size={48} />
          </div>
          <p className="text-sand-400 font-medium italic font-serif">No memories found yet.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {journeys.map((journey) => (
            <Card key={journey.id} variant="glass-dark" className="group cursor-pointer relative" onClick={() => onSelectJourney(journey)}>
              <button
                onClick={(e) => handleDelete(e, journey.id)}
                className="absolute top-6 right-6 z-30 p-2.5 bg-black/30 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:scale-110"
              >
                <Trash2 size={18} />
              </button>
              <div className="aspect-[16/10] bg-teal-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-hero opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-700 ease-out">
                  {journey.mood_tag === 'Adventurous' ? '🏔️' : 
                   journey.mood_tag === 'Calm' ? '🌊' : 
                   journey.mood_tag === 'Vibrant' ? '🌆' : '✨'}
                </div>
                <div className="absolute bottom-6 left-6 right-6 z-20 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70 mb-1">
                    {format(new Date(journey.started_at), 'MMMM d, yyyy')}
                  </p>
                  <h3 className="text-3xl font-serif font-medium tracking-tight">{journey.destination_name}</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-3 flex-wrap">
                  <span className="px-3 py-1 bg-teal-500/10 text-teal-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-teal-500/20">
                    {journey.mood_tag || 'Reflective'}
                  </span>
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-500/20">
                    {journey.moments?.length || 0} Moments
                  </span>
                  <span className="px-3 py-1 bg-white/5 text-sand-400 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 border border-white/10">
                    <Clock size={10} /> {formatJourneyDuration(journey.started_at, journey.ended_at || undefined)}
                  </span>
                </div>
                <p className="text-sand-400 line-clamp-2 italic font-serif leading-relaxed text-lg">
                  "{journey.journal_text?.substring(0, 120)}..."
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
