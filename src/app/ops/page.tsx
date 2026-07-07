'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, FileText, Loader2, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';
import type { Density } from '@/components/stadium/StadiumMap';
import { IncidentFeed } from '@/components/ops/IncidentFeed';

const StadiumMap = dynamic(() => import('@/components/stadium/StadiumMap').then(mod => mod.StadiumMap), {
  ssr: false,
  loading: () => <div className="w-full aspect-square md:aspect-video bg-wc-surface rounded-2xl flex items-center justify-center animate-pulse"><Loader2 className="animate-spin text-wc-cyan" /></div>
});

const WhatIfSimulator = dynamic(() => import('@/components/ops/WhatIfSimulator').then(mod => mod.WhatIfSimulator), {
  ssr: false,
});

export default function OpsCommandCenter() {
  const [densities, setDensities] = useState<Record<string, Density>>({});
  const [report, setReport] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

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
    return () => eventSource.close();
  }, []);

  const handleGenerateReport = useCallback(async () => {
    setReportLoading(true);
    try {
      const res = await fetch('/api/ops/shift-report');
      const data = await res.json();
      setReport(data.report);
    } catch (error) {
      console.error('Failed to generate report:', error);
      // Report generation failed silently
    } finally {
      setGeneratingReport(false);
    }
  }, []);

  return (
    <main id="main-content" className="min-h-screen flex flex-col bg-wc-navy text-wc-text">
      {/* Header */}
      <header className="bg-wc-cyan/10 border-b border-wc-cyan/20 p-4 sticky top-0 z-50">
        <nav className="flex items-center justify-between" aria-label="Main Navigation">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="Go back to Home" className="p-2 rounded-full hover:bg-wc-cyan/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wc-cyan text-wc-cyan">
              <ArrowLeft size={24} />
            </Link>
            <div className="flex items-center gap-2">
              <Activity className="text-wc-cyan" size={24} />
              <h1 className="text-xl font-bold tracking-tight text-white">Ops Control</h1>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <div className="px-3 py-1 rounded-full bg-wc-cyan/20 text-wc-cyan border border-wc-cyan/30">
              {matchPhase.replace('_', ' ')}
            </div>
            <button 
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="flex items-center gap-2 px-4 py-2 bg-wc-surface hover:bg-wc-surface-hover border border-wc-surface-hover rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wc-cyan"
            >
              <FileText size={16} />
              {generatingReport ? 'Generating...' : 'End Shift'}
            </button>
          </div>
        </nav>
      </header>

      <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Map & WhatIf */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Live Heatmap</h2>
            <StadiumMap zoneDensities={densities} />
          </div>
          
          <WhatIfSimulator />
        </div>

        {/* Right Col: Feed & Report Modal overlay */}
        <div className="lg:col-span-4 flex flex-col">
          <IncidentFeed />
        </div>
      </div>

      {/* Shift Report Dialog */}
      {report && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Shift Handover Report">
          <div className="bg-wc-surface border border-wc-surface-hover rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-wc-surface-hover flex justify-between items-center bg-wc-navy rounded-t-2xl">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <FileText className="text-wc-cyan" size={20} />
                Shift Handover Report
              </h2>
              <button onClick={() => setReport(null)} aria-label="Close report" className="text-wc-text-muted hover:text-white font-bold p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wc-cyan">✕</button>
            </div>
            <div className="p-6 overflow-y-auto prose prose-invert prose-cyan max-w-none">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
            <div className="p-4 border-t border-wc-surface-hover bg-wc-navy rounded-b-2xl flex justify-end">
              <button 
                onClick={() => {
                  const blob = new Blob([report], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `shift_report_${new Date().toISOString().slice(0,10)}.md`;
                  a.click();
                }}
                className="flex items-center gap-2 bg-wc-cyan text-wc-navy px-4 py-2 rounded-lg font-bold hover:bg-wc-cyan/80 transition-colors"
              >
                <Download size={18} /> Export MD
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
