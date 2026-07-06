'use client';

import React, { useEffect, useState, memo } from 'react';
import { AlertCircle, CheckCircle2, Clock, ShieldAlert, Zap } from 'lucide-react';
import { cn } from '../stadium/StadiumMap';
import type { Incident } from '@/types';

export const IncidentFeed = memo(function IncidentFeed() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const fetchIncidents = async () => {
    // We can fetch from a generic API or just rely on SSE if we passed incidents through SSE.
    // Let's assume we have an endpoint, or we can just mock some for demo if none exist.
    // For simplicity, we will just use a generic list or create an endpoint /api/ops/incidents
    try {
      const res = await fetch('/api/ops/incidents');
      const data = await res.json();
      if (Array.isArray(data)) {
        setIncidents(data);
      } else {
        console.error('Failed to fetch incidents:', data);
      }
    } catch (e) {
      console.error('Error fetching incidents:', e);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000); // Polling for incidents
    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-green-500 bg-green-500/10 border-green-500/20';
    }
  };

  return (
    <div className="bg-wc-surface border border-wc-surface-hover rounded-2xl flex flex-col h-[600px] shadow-xl" aria-live="polite">
      <div className="p-4 border-b border-wc-surface-hover flex justify-between items-center bg-wc-navy rounded-t-2xl">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <AlertCircle className="text-wc-magenta" size={20} />
          Live Incident Feed
        </h2>
        <div className="flex items-center gap-2 text-xs text-wc-text-muted">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wc-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-wc-cyan"></span>
          </span>
          Live Sync
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {incidents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-wc-text-muted opacity-50">
            <CheckCircle2 size={48} className="mb-2" />
            <p>No active incidents.</p>
          </div>
        ) : (
          incidents.map(inc => (
            <div key={inc.id} className={cn("p-4 rounded-xl border flex flex-col gap-2", getPriorityColor(inc.priority))}>
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm truncate">{inc.title}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-black/20">
                  {inc.priority}
                </span>
              </div>
              <p className="text-xs opacity-90">{inc.aiSummary}</p>
              
              {inc.aiActionPlan && (
                <div className="mt-2 pt-2 border-t border-black/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">AI Action Plan:</span>
                  <p className="text-xs opacity-90 leading-relaxed">{inc.aiActionPlan}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
});
