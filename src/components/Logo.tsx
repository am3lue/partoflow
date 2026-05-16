import React from 'react';
import { Activity } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'primary' | 'white';
}

export function Logo({ size = 'md', className = '', variant = 'primary' }: LogoProps) {
  const containerSizes = {
    sm: 'w-6 h-6 rounded-lg',
    md: 'w-8 h-8 rounded-xl animate-pulse-slow',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-[32px]'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colors = {
    primary: 'bg-white text-primary shadow-sm ring-1 ring-primary/10',
    white: 'bg-white text-primary shadow-sm ring-1 ring-primary/10'
  };

  return (
    <div className={`${containerSizes[size]} ${colors[variant]} flex items-center justify-center transition-all duration-500 overflow-hidden relative ${className}`}>
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Activity className={`${iconSizes[size]} relative z-10 drop-shadow-sm`} strokeWidth={2.5} />
      {(size === 'xl' || size === 'lg') && (
        <div className="absolute -inset-1 bg-white/10 blur-xl opacity-50 animate-pulse" />
      )}
    </div>
  );
}
