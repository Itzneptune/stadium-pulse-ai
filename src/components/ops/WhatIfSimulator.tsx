'use client';

import React, { useState } from 'react';
import { Play, Loader2, Sparkles } from 'lucide-react';

export function WhatIfSimulator() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ narrative: string, impactedZones: string[] } | null>(null);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);

    try {
      const res = await fetch('/api/ops/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Pre-canned demo triggers
  const triggerSurge = async (phase: string) => {
    await fetch('/api/admin/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SURGE', payload: { phase } })
    });
  };

  return (
    <div className="bg-wc-surface border border-wc-surface-hover rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-wc-cyan" />
        <h2 className="text-xl font-bold">AI "What-If" Simulator</h2>
      </div>
      
      <p className="text-sm text-wc-text-muted mb-4">
        Ask Gemini to predict crowd flow impacts based on the live stadium state.
      </p>

      <form onSubmit={handleSimulate} className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="What happens if we close Gate B for 15 mins?"
          className="flex-1 bg-wc-navy border border-wc-surface-hover rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-wc-cyan"
        />
        <button 
          type="submit" 
          disabled={!query || loading}
          className="px-4 py-2 bg-wc-cyan text-wc-navy rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 hover:bg-wc-cyan/80 transition-colors"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
          Simulate
        </button>
      </form>

      {result && (
        <div className="bg-wc-navy border border-wc-surface-hover rounded-lg p-4 animate-in fade-in slide-in-from-top-4">
          <h4 className="font-bold text-wc-cyan text-sm mb-2 uppercase tracking-wider">AI Projection</h4>
          <p className="text-sm text-wc-text leading-relaxed mb-3">
            {result.narrative}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-wc-text-muted">Impacted Zones:</span>
            {result.impactedZones.map(z => (
              <span key={z} className="text-xs bg-wc-surface-hover px-2 py-1 rounded-md">{z}</span>
            ))}
          </div>
        </div>
      )}

      {/* Demo Controls hidden in a small section */}
      <div className="mt-8 pt-4 border-t border-wc-surface-hover">
        <h4 className="text-xs text-wc-text-muted uppercase mb-3">Live Demo Controls</h4>
        <div className="flex gap-2">
          <button onClick={() => triggerSurge('HALFTIME')} className="text-xs px-3 py-1.5 bg-wc-surface-hover hover:bg-wc-magenta/20 hover:text-wc-magenta rounded transition-colors">
            Trigger Halftime Rush
          </button>
          <button onClick={() => triggerSurge('POST_MATCH')} className="text-xs px-3 py-1.5 bg-wc-surface-hover hover:bg-wc-cyan/20 hover:text-wc-cyan rounded transition-colors">
            Trigger Post-Match Exit
          </button>
        </div>
      </div>
    </div>
  );
}
