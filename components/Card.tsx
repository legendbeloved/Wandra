import React from 'react';
import { cn } from '../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'glass-dark' | 'journal' | 'elevated';
  hoverable?: boolean;
}

export const Card = ({ className, variant = 'glass', hoverable = true, ...props }: CardProps) => {
  const variants = {
    glass: 'bg-white/10 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] text-sand-50',
    'glass-dark': 'bg-black/20 backdrop-blur-2xl border border-white/5 shadow-2xl text-sand-100',
    journal: 'bg-[#F9F6F2] text-teal-950 shadow-inner-paper border border-amber-900/5',
    elevated: 'bg-white shadow-xl shadow-black/5 border border-sand-100',
  };

  return (
    <div
      className={cn(
        'rounded-[2rem] overflow-hidden transition-all duration-500',
        variants[variant],
        hoverable && 'hover:shadow-2xl hover:-translate-y-1.5 active:scale-[0.99]',
        className
      )}
      {...props}
    />
  );
};
