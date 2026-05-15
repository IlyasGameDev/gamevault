import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f1117] disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-[#6C5CFF] text-white hover:bg-[#5A49F5] focus:ring-[#6C5CFF]': variant === 'primary',
            'bg-[#1A1A1A] text-gray-300 hover:bg-[#242424] focus:ring-[#6C5CFF]': variant === 'secondary',
            'text-gray-400 hover:text-white hover:bg-white/10 focus:ring-[#6C5CFF]': variant === 'ghost',
            'bg-red-600/20 text-red-400 hover:bg-red-600/30 focus:ring-red-500': variant === 'danger',
            'border border-[#6C5CFF] text-[#9B8CFF] hover:bg-[#6C5CFF]/10 focus:ring-[#6C5CFF]': variant === 'outline',
            'px-2.5 py-1.5 text-xs': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
export default Button;
