export type Category = 
  | 'MEDICAL' 
  | 'SECURITY' 
  | 'FACILITY' 
  | 'CROWD' 
  | 'CONCESSION' 
  | 'RESTROOM' 
  | 'ACCESSIBILITY' 
  | 'TRANSIT' 
  | 'GATE';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export const CATEGORY_COLORS: Record<Category, string> = {
  MEDICAL: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  SECURITY: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  FACILITY: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  CROWD: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
  CONCESSION: 'text-amber-600 bg-amber-600/10 border-amber-600/20', // distinctly warmer than security
  RESTROOM: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
  ACCESSIBILITY: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  TRANSIT: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
  GATE: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

// Returns Tailwind classes for severity badges
export const getSeverityStyles = (severity: Severity) => {
  switch (severity) {
    case 'LOW':
      return 'border border-current bg-transparent opacity-80';
    case 'MEDIUM':
      return 'bg-current text-wc-navy border-transparent';
    case 'HIGH':
      return 'bg-current text-wc-navy border-transparent shadow-[0_0_12px_currentColor]';
    case 'CRITICAL':
      return 'bg-current text-wc-navy border-transparent shadow-[0_0_16px_currentColor] animate-pulse';
  }
};

// Returns Tailwind classes for fill colors used in SVGs/Heatmaps
export const getSeverityFill = (severity: Severity, category: Category = 'CROWD') => {
  // If we wanted category-specific heatmaps, we could use the category color. 
  // For standard heatmaps, we usually map severity to a specific scale.
  // The Prompt requires the category colors to be standard, but heatmaps usually use green->red.
  // We'll stick to a standard severity scale for heatmaps.
  switch (severity) {
    case 'LOW': return 'fill-emerald-500/20';
    case 'MEDIUM': return 'fill-yellow-500/40';
    case 'HIGH': return 'fill-orange-500/50';
    case 'CRITICAL': return 'fill-red-500/60';
  }
};

export const getStatusIcon = (status: Status) => {
  switch (status) {
    case 'OPEN': return 'AlertCircle'; // We'll map this in the UI
    case 'IN_PROGRESS': return 'Clock';
    case 'RESOLVED': return 'CheckCircle2';
  }
};
