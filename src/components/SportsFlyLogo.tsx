import React, { useId } from 'react';

interface SportsFlyLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

/**
 * Pure inline SVG vector version of the SportsFly Wing Emblem with unique gradient IDs per instance.
 * Guarantees instant, crisp vector rendering across all 7 A4 pages during html-to-image PDF export and print.
 */
export const SportsFlyVectorMark: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => {
  const rawId = useId().replace(/:/g, '');
  const cyanId = `sf-cyan-${rawId}`;
  const azureId = `sf-azure-${rawId}`;
  const deepBlueId = `sf-deep-${rawId}`;
  const shineId = `sf-shine-${rawId}`;
  const pinkId = `sf-pink-${rawId}`;
  const orangeId = `sf-orange-${rawId}`;
  const goldId = `sf-gold-${rawId}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="140 120 220 260"
      className={`shrink-0 ${className}`}
      fill="none"
      aria-label="SportsFly Logo"
    >
      <defs>
        <linearGradient id={cyanId} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="60%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id={azureId} x1="0%" y1="20%" x2="100%" y2="80%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id={deepBlueId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>
        <linearGradient id={shineId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={pinkId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="60%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#be123c" />
        </linearGradient>
        <linearGradient id={orangeId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Upper Blue Wing */}
      <g>
        <path
          d="M 262 135 C 235 142 195 170 178 206 L 222 232 C 236 195 248 160 262 135 Z"
          fill={`url(#${cyanId})`}
        />
        <path
          d="M 178 206 C 160 236 156 268 165 292 L 216 262 L 222 232 Z"
          fill={`url(#${azureId})`}
        />
        <path
          d="M 165 292 C 174 314 195 325 212 320 C 228 315 242 300 246 288 C 248 280 248 268 238 250 L 216 262 Z"
          fill={`url(#${deepBlueId})`}
        />
        <path
          d="M 222 232 L 216 262 L 238 250 C 244 238 248 220 252 200 Z"
          fill="#1e40af"
          opacity="0.9"
        />
        <path
          d="M 262 135 C 242 142 208 165 190 196 C 196 182 225 152 262 135 Z"
          fill={`url(#${shineId})`}
        />
        <line
          x1="178"
          y1="206"
          x2="246"
          y2="288"
          stroke="#ffffff"
          strokeWidth="2"
          strokeOpacity="0.3"
          strokeLinecap="round"
        />
        <line
          x1="222"
          y1="232"
          x2="165"
          y2="292"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeOpacity="0.25"
          strokeLinecap="round"
        />
      </g>

      {/* Lower Warm Wing */}
      <g>
        <path
          d="M 238 365 C 265 358 305 330 322 294 L 278 268 C 264 305 252 340 238 365 Z"
          fill={`url(#${goldId})`}
        />
        <path
          d="M 322 294 C 340 264 344 232 335 208 L 284 238 L 278 268 Z"
          fill={`url(#${orangeId})`}
        />
        <path
          d="M 335 208 C 326 186 305 175 288 180 C 272 185 258 200 254 212 C 252 220 252 232 262 250 L 284 238 Z"
          fill={`url(#${pinkId})`}
        />
        <path
          d="M 278 268 L 284 238 L 262 250 C 256 262 252 280 248 300 Z"
          fill="#be123c"
          opacity="0.9"
        />
        <path
          d="M 238 365 C 258 358 292 335 310 304 C 304 318 275 348 238 365 Z"
          fill="#fde047"
          opacity="0.5"
        />
        <line
          x1="322"
          y1="294"
          x2="254"
          y2="212"
          stroke="#ffffff"
          strokeWidth="2"
          strokeOpacity="0.3"
          strokeLinecap="round"
        />
        <line
          x1="278"
          y1="268"
          x2="335"
          y2="208"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeOpacity="0.25"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export const SportsFlyLogo: React.FC<SportsFlyLogoProps> = ({
  className = 'w-9 h-9',
  size,
  showText = false,
}) => {
  const dimensionStyle = size
    ? { width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size }
    : undefined;

  return (
    <div className={`inline-flex items-center gap-2.5 ${showText ? '' : 'shrink-0'}`}>
      <div
        className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
        style={dimensionStyle}
      >
        <SportsFlyVectorMark className="w-full h-full" />
      </div>
      {showText && (
        <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-sans">
          SportsFly
        </span>
      )}
    </div>
  );
};

export const SportsFlyIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
    <SportsFlyVectorMark className="w-full h-full" />
  </span>
);


