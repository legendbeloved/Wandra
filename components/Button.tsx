import React from 'react';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'destructive' | 'outline' | 'text';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-900/20 active:scale-95 border border-teal-500/50',
      secondary: 'bg-sage-600 text-white hover:bg-sage-700 shadow-lg shadow-sage-900/20 active:scale-95 border border-sage-500/50',
      accent: 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-900/30 active:scale-95 border border-amber-500/50',
      ghost: 'bg-white/5 backdrop-blur-xl text-sand-50 border border-white/10 hover:bg-white/10 active:scale-95',
      destructive: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
      outline: 'bg-transparent border-2 border-teal-500/50 text-teal-400 hover:bg-teal-500/10 active:scale-95',
      text: 'bg-transparent text-sand-400 hover:text-sand-200 p-0 h-auto',
    };

    const sizes = {
      xs: 'px-2 py-1 text-xs rounded-md',
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-5 py-2.5 rounded-xl font-medium',
      lg: 'px-8 py-4 text-lg rounded-2xl font-semibold tracking-tight',
      icon: 'p-2.5 rounded-full',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none gap-2 font-display',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="animate-spin" size={18} />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
