import React, { ButtonHTMLAttributes } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ButtonGlowProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  showArrow?: boolean;
}

export const ButtonGlow = React.forwardRef<HTMLButtonElement, ButtonGlowProps>(
  ({ children, className, disabled, showArrow = true, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-zinc-900 h-10",
          "text-sm font-medium text-zinc-100",
          "transition-all duration-300 ease-out",
          "hover:bg-zinc-800 hover:-translate-y-[1px]",
          "active:translate-y-[1px] active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-900 disabled:hover:-translate-y-0 disabled:active:translate-y-0 disabled:active:scale-100",
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">
          {children}
          {showArrow && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </span>

        {/* Glow Effects Container - Only shown on hover, disabled when button is disabled */}
        {!disabled && (
          <>
            {/* Layer 1: 1px sharp line */}
            <div 
              className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#ff6600] to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" 
            />
            
            {/* Layer 2: Blurred glow line */}
            <div 
              className="absolute -bottom-1 left-1/4 h-[4px] w-1/2 bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-[8px] opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" 
            />
          </>
        )}
      </button>
    );
  }
);

ButtonGlow.displayName = 'ButtonGlow';
