/**
 * CircleLoader — indicateur de chargement circulaire réutilisable.
 * Utilise les couleurs du thème courant (--color-primary / --color-borderColor).
 *
 * Usage inline dans une page :
 *   {isLoading && <CircleLoader fullscreen label="Chargement..." />}
 *
 * Usage compact (bouton, ligne de tableau, etc.) :
 *   <CircleLoader size={18} strokeWidth={3} />
 */
import React from 'react';

interface CircleLoaderProps {
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
  /** Centre le loader sur toute la largeur disponible, avec un espacement vertical. */
  fullscreen?: boolean;
}

export const CircleLoader: React.FC<CircleLoaderProps> = ({
  size = 40,
  strokeWidth = 4,
  label,
  className = '',
  fullscreen = false,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const spinner = (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <svg className="animate-spin" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-borderColor)"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.75}
          strokeLinecap="round"
        />
      </svg>
      {label && <span className="text-xs text-[var(--color-textSecondary)]">{label}</span>}
    </div>
  );

  if (!fullscreen) return spinner;

  return <div className="flex items-center justify-center w-full py-12">{spinner}</div>;
};

export default CircleLoader;
