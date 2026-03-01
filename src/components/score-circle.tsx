
'use client';

import { cn } from "@/lib/utils";

interface ScoreCircleProps {
  score: number; // 0 to 10
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function ScoreCircle({ score, size = 'md', showText = true, className }: ScoreCircleProps) {
  const percentage = Math.round(score * 10);
  
  // Dimensions based on size
  const sizes = {
    sm: { circle: 34, stroke: 3, font: 'text-[10px]' },
    md: { circle: 44, stroke: 4, font: 'text-[13px]' },
    lg: { circle: 60, stroke: 5, font: 'text-[18px]' },
  };

  const { circle, stroke, font } = sizes[size];
  const radius = (circle - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Colors based on score (TMDB Style)
  const getColors = () => {
    if (percentage >= 70) return { bar: '#21d07a', track: '#204529' };
    if (percentage >= 40) return { bar: '#d2d531', track: '#423d0f' };
    if (percentage > 0) return { bar: '#db2360', track: '#571435' };
    return { bar: '#666666', track: '#333333' };
  };

  const colors = getColors();

  return (
    <div className={cn("relative inline-flex items-center justify-center rounded-full bg-[#081c22] shadow-xl", className)} style={{ width: circle, height: circle }}>
      <svg width={circle} height={circle} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={circle / 2}
          cy={circle / 2}
          r={radius}
          stroke={colors.track}
          strokeWidth={stroke}
          fill="transparent"
        />
        {/* Progress Bar */}
        <circle
          cx={circle / 2}
          cy={circle / 2}
          r={radius}
          stroke={colors.bar}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {showText && (
        <div className={cn("absolute inset-0 flex items-center justify-center font-bold text-white", font)}>
          {percentage > 0 ? (
            <>
              {percentage}<span className="text-[0.6em] ml-0.5">%</span>
            </>
          ) : (
            "NR"
          )}
        </div>
      )}
    </div>
  );
}
