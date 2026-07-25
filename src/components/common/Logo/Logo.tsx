import React from 'react';
import { cn } from '@/lib/utils/cn';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  iconOnly?: boolean;
  animated?: boolean;
  size?: number | string;
}

export function Logo({
  className,
  iconOnly = false,
  animated = true,
  size,
  ...props
}: LogoProps) {
  const svgId = React.useId().replace(/:/g, '');

  if (iconOnly) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 220 220"
        width={size || '100%'}
        height={size || '100%'}
        className={cn('w-full h-full text-[#ff6600]', className)}
        {...props}
      >
        <defs>
          <radialGradient id={`glow-icon-${svgId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff6600" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#ff6600" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ff6600" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="110" cy="110" r="100" fill={`url(#glow-icon-${svgId})`} />

        {/* 3 Bold Dynamic Concentric Orbit Rings */}
        <g stroke="currentColor" strokeWidth="5.5" fill="none" opacity="0.95">
          <circle cx="110" cy="110" r="35">
            {animated && (
              <animate
                attributeName="r"
                values="35;45;35"
                dur="8s"
                repeatCount="indefinite"
              />
            )}
          </circle>

          <circle cx="110" cy="110" r="62">
            {animated && (
              <animate
                attributeName="r"
                values="62;72;62"
                dur="8s"
                begin="-1.6s"
                repeatCount="indefinite"
              />
            )}
          </circle>

          <circle cx="110" cy="110" r="88">
            {animated && (
              <animate
                attributeName="r"
                values="88;98;88"
                dur="8s"
                begin="-3.2s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        </g>

        {/* Center Core Node */}
        <circle cx="110" cy="110" r="15" fill="currentColor" />
        <circle cx="110" cy="110" r="6" fill="#ffffff" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 840 220"
      width={size || '100%'}
      height={size || '100%'}
      className={cn('w-auto h-14 text-[#ff6600]', className)}
      {...props}
    >
      <defs>
        <radialGradient id={`glow-full-${svgId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff6600" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#ff6600" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ff6600" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`text-grad-${svgId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff8533" />
          <stop offset="50%" stopColor="#ff6600" />
          <stop offset="100%" stopColor="#d95700" />
        </linearGradient>
      </defs>

      {/* Orbit Icon Mark */}
      <g>
        {/* Glow */}
        <circle cx="110" cy="110" r="100" fill={`url(#glow-full-${svgId})`} />

        {/* 3 Bold Dynamic Concentric Orbit Rings */}
        <g stroke="currentColor" strokeWidth="5.5" fill="none" opacity="0.95">
          <circle cx="110" cy="110" r="35">
            {animated && (
              <animate
                attributeName="r"
                values="35;45;35"
                dur="8s"
                repeatCount="indefinite"
              />
            )}
          </circle>

          <circle cx="110" cy="110" r="62">
            {animated && (
              <animate
                attributeName="r"
                values="62;72;62"
                dur="8s"
                begin="-1.6s"
                repeatCount="indefinite"
              />
            )}
          </circle>

          <circle cx="110" cy="110" r="88">
            {animated && (
              <animate
                attributeName="r"
                values="88;98;88"
                dur="8s"
                begin="-3.2s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        </g>

        {/* Center Core Node */}
        <circle cx="110" cy="110" r="15" fill="currentColor" />
        <circle cx="110" cy="110" r="6" fill="#ffffff" />
      </g>

      {/* KantaSwara Brand Typography */}
      <text
        x="225"
        y="142"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontWeight="600"
        fontSize="90"
        letterSpacing="-0.02em"
        fill={`url(#text-grad-${svgId})`}
      >
        KantaSwara
      </text>
    </svg>
  );
}
