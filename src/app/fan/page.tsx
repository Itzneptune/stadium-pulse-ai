'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Info } from 'lucide-react';
import { StadiumMap, Density } from '@/components/stadium/StadiumMap';
import { AskPulse } from '@/components/chat/AskPulse';

export default function FanApp() {
  const [densities, setDensities] = useState<Record<string, Density>>({});
  const [advisory, setAdvisory] = useState<string | null>(null);
  const [route, setRoute] = useState<string[]>([]);
  const [accessibility, setAccessibility] = useState(false);

  const handleRouteReceived = useCallback((newRoute: string[]) => {
    setRoute(newRoute);
  }, []);

  // SSE for Live State
  useEffect(() => {
    const eventSource = new EventSource('/api/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.state && data.state.zones) {
          const newDensities: Record<string, Density> = {};
          for (const key in data.state.zones) {
            newDensities[key] = data.state.zones[key].densityLevel;
          }
          setDensities(newDensities);
        }
      } catch (error) {
        console.error('SSE parse error:', error);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Poll for Advisories (every 30s — advisory content doesn't change rapidly)
  useEffect(() => {
    const fetchAdvisory = async () => {
      try {
        const res = await fetch('/api/ops/advisory');
        const data = await res.json();
        if (data && data.fanAdvisory) {
          setAdvisory(data.fanAdvisory);
        }
      } catch (error) {
        console.error('Failed to fetch advisory:', error);
        // silently fail — advisory is non-critical
      }
    };
    
    fetchAdvisory();
    const interval = setInterval(fetchAdvisory, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main id="main-content" className="min-h-screen flex flex-col bg-wc-navy text-wc-text">
      <header className="bg-wc-magenta text-white p-4 sticky top-0 z-50">
        <nav className="flex items-center gap-4" aria-label="Main Navigation">
          <Link href="/" aria-label="Go back to Home" className="p-2 rounded-full hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Fan Portal</h1>
        </nav>
      </header>

      <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
        
        {/* Advisory Banner */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Live Advisory Banner */}
          {advisory && (
            <div className="bg-wc-surface-hover border border-wc-cyan/30 rounded-xl p-4 flex items-start gap-3 shadow-lg shadow-wc-cyan/5" role="status" aria-live="polite">
              <Info className="text-wc-cyan shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-wc-text mb-1">Live Stadium Advisory</h3>
                <p className="text-sm text-wc-text-muted leading-relaxed">{advisory}</p>
              </div>
            </div>
          )}

          {/* Interactive Map */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Live Wayfinding</h2>
            <StadiumMap zoneDensities={densities} highlightRoute={route} />
          </div>

          {/* Sustainability Tip */}
          <div className="bg-wc-surface border border-wc-lime/20 rounded-xl p-4 mt-auto">
            <h3 className="text-wc-lime font-bold text-sm mb-2 uppercase tracking-wider">Green Tip</h3>
            <p className="text-sm text-wc-text-muted">Use the Metro Transit Hub to leave the stadium tonight—it cuts your trip&apos;s carbon footprint by 80% compared to rideshare.</p>
          </div>
        </div>

        {/* Right Col: Ask Pulse Chat */}
        <div className="lg:col-span-4 flex flex-col">
          <h2 className="text-2xl font-bold mb-4">Ask Pulse</h2>
          <div className="flex-1">
            <AskPulse 
              onRouteReceived={handleRouteReceived} 
              accessibilityMode={accessibility}
              setAccessibilityMode={setAccessibility}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
