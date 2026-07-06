'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mic, Send, ShieldCheck, CheckCircle } from 'lucide-react';

export default function VolunteerApp() {
  const [observation, setObservation] = useState('');
  const [zone, setZone] = useState('gate-a');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observation) return;
    setLoading(true);

    try {
      await fetch('/api/ops/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: observation, zoneId: zone, reportedByRole: 'VOLUNTEER' })
      });
      setSuccess(true);
      setObservation('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-wc-navy text-wc-text">
      <header className="bg-wc-lime p-4 flex items-center gap-4 sticky top-0 z-50 text-wc-navy">
        <Link href="/" aria-label="Go back to Home" className="p-2 rounded-full hover:bg-black/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wc-lime">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex items-center gap-2">
          <ShieldCheck size={24} />
          <h1 className="text-xl font-bold tracking-tight">Volunteer Assist</h1>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-md mx-auto w-full flex flex-col gap-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">Report an Observation</h2>
          <p className="text-wc-text-muted mt-2 text-sm">
            See something? Just describe it naturally. StadiumPulse AI will categorize, prioritize, and alert the right team automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-wc-surface p-6 rounded-2xl border border-wc-surface-hover shadow-xl">
          <div>
            <label className="block text-sm font-semibold mb-2">Location (Zone)</label>
            <select 
              value={zone} 
              onChange={e => setZone(e.target.value)}
              className="w-full bg-wc-navy border border-wc-surface-hover rounded-lg p-3 text-wc-text focus:outline-none focus:border-wc-lime"
            >
              <option value="gate-a">Gate A</option>
              <option value="gate-b">Gate B</option>
              <option value="concourse-1">Concourse 1</option>
              <option value="concession-east">East Food Court</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">What&apos;s happening?</label>
            <div className="relative">
              <textarea
                value={observation}
                onChange={e => setObservation(e.target.value)}
                placeholder="E.g., Spill near the east restrooms causing a slip hazard..."
                className="w-full bg-wc-navy border border-wc-surface-hover rounded-lg p-3 min-h-[120px] text-wc-text focus:outline-none focus:border-wc-lime resize-none"
              />
              <button type="button" aria-label="Use voice input" className="absolute bottom-3 right-3 p-2 rounded-full bg-wc-surface hover:text-wc-lime transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wc-lime">
                <Mic size={18} />
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!observation || loading}
            className="mt-2 w-full bg-wc-lime text-wc-navy font-bold rounded-lg py-4 flex items-center justify-center gap-2 hover:bg-wc-lime/90 disabled:opacity-50 transition-colors"
          >
            {loading ? <span className="animate-pulse">Processing via AI...</span> : (
              <>
                Submit Report <Send size={18} />
              </>
            )}
          </button>
        </form>

        {success && (
          <div className="bg-wc-surface border border-wc-lime/50 text-wc-lime p-4 rounded-xl flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle size={24} />
            <span className="font-semibold">Observation logged & triaged!</span>
          </div>
        )}
      </main>
    </div>
  );
}
