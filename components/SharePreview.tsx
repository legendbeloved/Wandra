import React from 'react';
import { format } from 'date-fns';
import { MapPin, Clock, Camera, Sparkles } from 'lucide-react';
import { Journey, Moment } from '../types';
import { formatJourneyDuration } from '../lib/dateUtils';

interface SharePreviewProps {
  journey: Journey;
  id?: string;
}

const PathSnippet = ({ moments }: { moments: Moment[] }) => {
  if (moments.length < 2) return null;
  
  const lats = moments.map(m => m.lat);
  const lngs = moments.map(m => m.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  const rangeLat = maxLat - minLat || 0.0001;
  const rangeLng = maxLng - minLng || 0.0001;
  
  const points = moments.map(m => ({
    x: ((m.lng - minLng) / rangeLng) * 80 + 10,
    y: 90 - (((m.lat - minLat) / rangeLat) * 80 + 10)
  }));
  
  const pathData = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        <path 
          d={pathData} 
          fill="none" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          strokeDasharray="1, 6"
          className="opacity-40"
        />
        {points.map((p, i) => (
          <circle 
            key={i} 
            cx={p.x} 
            cy={p.y} 
            r={i === 0 || i === points.length - 1 ? 4 : 2} 
            fill="white" 
            className={i === 0 || i === points.length - 1 ? "opacity-100" : "opacity-40"}
          />
        ))}
      </svg>
    </div>
  );
};

export const SharePreview = ({ journey, id = "share-preview" }: SharePreviewProps) => {
  return (
    <div 
      id={id}
      className="w-[600px] bg-sand-50 p-8 space-y-6 overflow-hidden"
      style={{ position: 'fixed', left: '-9999px', top: '0' }}
    >
      <div className="relative aspect-[16/9] rounded-[2rem] overflow-hidden shadow-2xl">
        <img 
          src={`https://picsum.photos/seed/${journey.id}/1200/675`} 
          alt="Cover" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-8 right-8 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80 mb-2">
            {format(new Date(journey.started_at), 'MMMM d, yyyy')}
          </p>
          <h1 className="text-4xl font-serif font-medium tracking-tight">
            {journey.destination_name}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-sand-200 space-y-4">
          <div className="flex items-center gap-2 text-primary-900">
            <Sparkles size={18} />
            <h3 className="font-serif font-medium text-xl">The Essence</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {journey.mood_tag || 'Reflective'}
            </span>
          </div>
          <p className="text-stone-600 italic font-serif text-sm line-clamp-3 leading-relaxed">
            "{journey.journal_text?.substring(0, 150)}..."
          </p>
        </div>

        <div className="bg-primary-900 p-6 rounded-[2rem] shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <PathSnippet moments={journey.moments || []} />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 opacity-80">
              <Clock size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Journey Stats</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-serif font-medium">
                {formatJourneyDuration(journey.started_at, journey.ended_at || undefined)}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total Duration</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-serif font-medium">{journey.moments?.length || 0}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Moments Captured</p>
            </div>
          </div>
          <div className="pt-4 border-t border-white/10 flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
              <MapPin size={12} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">Preserved with Wandra</span>
          </div>
        </div>
      </div>
      
      <div className="text-center pt-4">
        <p className="text-stone-300 font-serif italic text-xs">A memory from my personal vault.</p>
      </div>
    </div>
  );
};
