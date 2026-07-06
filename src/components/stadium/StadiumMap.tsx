'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export type Density = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface ZoneOverlayProps {
  id: string;
  density?: Density;
  isRoute?: boolean;
}

const getFillByDensity = (density?: Density) => {
  switch (density) {
    case 'CRITICAL': return 'fill-red-500/60';
    case 'HIGH': return 'fill-orange-500/50';
    case 'MEDIUM': return 'fill-yellow-500/40';
    case 'LOW':
    default: return 'fill-green-500/20';
  }
};

export function StadiumMap({ 
  zoneDensities = {}, 
  highlightRoute = [] 
}: { 
  zoneDensities?: Record<string, Density>,
  highlightRoute?: string[]
}) {
  
  // A helper to render a polygon/rect for a zone
  const renderZone = (id: string, d: string, label: string, cx: number, cy: number) => {
    const density = zoneDensities[id] || 'LOW';
    const isRoute = highlightRoute.includes(id);

    return (
      <g key={id} className="transition-all duration-500 group">
        <path 
          d={d} 
          className={cn(
            "stroke-wc-surface-hover stroke-2 transition-colors duration-500",
            getFillByDensity(density),
            isRoute && "stroke-wc-cyan stroke-[4px] filter drop-shadow-[0_0_8px_rgba(0,211,176,0.8)]"
          )}
        />
        {/* Label Background */}
        <rect x={cx - 30} y={cy - 12} width={60} height={24} rx={4} className="fill-wc-navy/80" />
        <text x={cx} y={cy + 4} textAnchor="middle" className="fill-wc-text text-[10px] font-bold pointer-events-none">
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full aspect-square md:aspect-video bg-wc-surface rounded-2xl overflow-hidden relative border border-wc-surface-hover shadow-2xl flex items-center justify-center p-4">
      <svg viewBox="0 0 800 600" className="w-full h-full max-h-[70vh]">
        {/* Field (Center) */}
        <rect x="250" y="150" width="300" height="300" rx="20" className="fill-green-900/30 stroke-green-500/30 stroke-2" />
        <line x1="400" y1="150" x2="400" y2="450" className="stroke-green-500/30 stroke-2" />
        <circle cx="400" cy="300" r="40" className="stroke-green-500/30 stroke-2 fill-none" />

        {/* Zones */}
        {/* Gates */}
        {renderZone('gate-a', 'M 350,50 L 450,50 L 450,100 L 350,100 Z', 'Gate A', 400, 75)}
        {renderZone('gate-c', 'M 350,500 L 450,500 L 450,550 L 350,550 Z', 'Gate C', 400, 525)}
        {renderZone('gate-b', 'M 700,250 L 750,250 L 750,350 L 700,350 Z', 'Gate B', 725, 300)}
        {renderZone('gate-d', 'M 50,250 L 100,250 L 100,350 L 50,350 Z', 'Gate D', 75, 300)}

        {/* Concourses */}
        {renderZone('concourse-1', 'M 200,100 L 600,100 L 600,150 L 200,150 Z', 'Conc 1 N', 400, 125)}
        {renderZone('concourse-2', 'M 200,450 L 600,450 L 600,500 L 200,500 Z', 'Conc 2 S', 400, 475)}

        {/* Concessions */}
        {renderZone('concession-east', 'M 600,150 L 700,150 L 700,450 L 600,450 Z', 'Food E', 650, 300)}
        {renderZone('concession-west', 'M 100,150 L 200,150 L 200,450 L 100,450 Z', 'Food W', 150, 300)}

        {/* Transit */}
        {renderZone('transit-hub', 'M 650,500 L 780,500 L 780,580 L 650,580 Z', 'Transit', 715, 540)}

        {/* Highlight Route connecting lines (simple mock routing lines) */}
        {highlightRoute.length > 1 && (
          <path
            d="M 400,75 L 400,125 L 650,300" // Hardcoded example line just for visual flair
            className="stroke-wc-cyan stroke-[4px] fill-none stroke-dashed animate-pulse opacity-50"
            style={{ strokeDasharray: '8 8' }}
          />
        )}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-3 text-xs bg-wc-navy/80 p-2 rounded-lg backdrop-blur-sm border border-wc-surface-hover">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500/50"></div> Low</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500/50"></div> Med</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-500/50"></div> High</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500/60"></div> Crit</div>
      </div>
    </div>
  );
}
