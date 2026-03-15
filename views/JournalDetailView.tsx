import React from 'react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { ArrowLeft, Share2, Edit3, MapPin, Clock, Trash2, Map as MapIcon, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Journey } from '../types';
import { MapView } from '../components/MapView';
import { SharePreview } from '../components/SharePreview';
import { toBlob } from 'html-to-image';

interface JournalDetailViewProps {
  journey: Journey;
  onBack: () => void;
  onDelete: () => void;
}

export const JournalDetailView = ({ journey, onBack, onDelete }: JournalDetailViewProps) => {
  const [isSharing, setIsSharing] = React.useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const node = document.getElementById('share-preview');
      if (!node) return;

      const blob = await toBlob(node, {
        cacheBust: true,
        backgroundColor: '#FDFAF5',
      });

      if (!blob) throw new Error('Failed to generate image');

      const file = new File([blob], `journey-${journey.id}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `My Journey to ${journey.destination_name}`,
          text: `Preserved with Wandra: My journey to ${journey.destination_name}`,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `wandra-journey-${journey.destination_name.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      
      const summary = `✨ Journey to ${journey.destination_name} ✨\nMood: ${journey.mood_tag || 'Reflective'}\n\n${journey.journal_text}\n\nPreserved with Wandra.`.trim();
      if (navigator.share) {
        await navigator.share({
          title: `My Journey to ${journey.destination_name}`,
          text: summary,
        });
      } else {
        await navigator.clipboard.writeText(summary);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      onDelete();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            <Trash2 size={18} className="text-red-400" />
          </Button>
          <Button variant="ghost" size="icon">
            <Edit3 size={18} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare} disabled={isSharing}>
            {isSharing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
          </Button>
        </div>
      </header>

      <SharePreview journey={journey} />


      <div className="space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sand-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <Calendar size={12} />
            {format(new Date(journey.started_at), 'MMMM d, yyyy')}
          </div>
          <h1 className="text-5xl font-serif font-medium leading-[1.1] text-sand-100 tracking-tight">
            {journey.destination_name}
          </h1>
          <div className="flex gap-3">
            <span className="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {journey.mood_tag || 'Reflective'}
            </span>
          </div>
        </div>

        <div className="aspect-[3/4] rounded-[3rem] bg-teal-950 overflow-hidden relative shadow-2xl shadow-teal-950/20">
          <img 
            src={`https://picsum.photos/seed/${journey.id}/800/1200`} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-transparent" />
        </div>

        <article className="prose prose-stone max-w-none">
          <div className="font-serif text-2xl leading-relaxed text-sand-300 first-letter:text-7xl first-letter:font-bold first-letter:mr-4 first-letter:float-left first-letter:mt-2 first-letter:text-primary-500">
            <ReactMarkdown>{journey.journal_text || ""}</ReactMarkdown>
          </div>
        </article>

        <section className="space-y-4 pt-8 border-t border-white/5">
          <div className="flex items-center gap-2 text-sand-100">
            <MapIcon size={20} />
            <h3 className="font-serif font-medium text-2xl">The Path Taken</h3>
          </div>
          <div className="aspect-video rounded-[2rem] overflow-hidden shadow-inner bg-sand-100 border border-white/5">
            <MapView moments={journey.moments || []} />
          </div>
        </section>

        <section className="space-y-8 pt-12 border-t border-white/5">
          <h3 className="font-serif font-medium text-2xl text-sand-100">The Timeline</h3>
          <div className="space-y-10 relative before:absolute before:inset-y-0 before:left-[19px] before:w-px before:bg-primary-100">
            {(journey.moments || []).map((moment, i) => (
              <div key={moment.id} className="flex gap-8 relative">
                <div className="w-10 h-10 rounded-2xl bg-white border border-white/5 flex items-center justify-center text-xl z-10 shadow-lg shadow-black/10">
                  {moment.weather_icon}
                </div>
                <div className="flex-1 space-y-2 pb-10">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-lg text-sand-300 tracking-tight">{moment.place_name}</p>
                    <p className="text-[10px] font-black text-sand-400 uppercase tracking-widest">
                      {format(new Date(moment.timestamp || moment.captured_at || ''), 'h:mm a')}
                    </p>
                  </div>
                  <p className="text-sm text-sand-400 font-medium">{moment.weather_condition}</p>
                  {moment.is_key_moment && (
                    <div className="mt-4 aspect-video rounded-[2rem] bg-white/5 border border-white/5 overflow-hidden border border-white shadow-xl shadow-black/10">
                       <img 
                        src={`https://picsum.photos/seed/${moment.id}/600/400`} 
                        alt="Moment" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="py-12 text-center">
        <p className="text-sand-500 font-serif italic">End of the journey.</p>
      </footer>
    </div>
  );
};

const Calendar = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
