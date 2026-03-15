import { intervalToDuration, formatDuration } from 'date-fns';

export const formatJourneyDuration = (start: string | number | Date, end: string | number | Date = new Date()) => {
  const duration = intervalToDuration({
    start: new Date(start),
    end: new Date(end),
  });

  const parts = [];
  if (duration.days) parts.push(`${duration.days} day${duration.days > 1 ? 's' : ''}`);
  if (duration.hours) parts.push(`${duration.hours} hour${duration.hours > 1 ? 's' : ''}`);
  if (duration.minutes && !duration.days) parts.push(`${duration.minutes} min${duration.minutes > 1 ? 's' : ''}`);
  
  if (parts.length === 0) return 'Just started';
  
  return parts.join(', ');
};
