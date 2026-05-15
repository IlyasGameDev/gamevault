import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'blue';
}

export default function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-white/10 text-gray-300': variant === 'default',
          'bg-emerald-500/20 text-emerald-400': variant === 'success',
          'bg-yellow-500/20 text-yellow-400': variant === 'warning',
          'bg-red-500/20 text-red-400': variant === 'danger',
          'bg-[#2A2A2A] text-gray-300': variant === 'purple',
          'bg-[#6C5CFF]/15 text-[#9B8CFF]': variant === 'blue',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
