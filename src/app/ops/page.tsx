'use client';

import React, { useEffect, useState } from 'react';
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
  const [reportLoading, setReportLoading] = useState(false);

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
      } catch (e) {}
    };
    return () => eventSource.close();
  }, []);

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      const res = await fetch('/api/ops/shift-report');
      const data = await res.json();
      setReport(data.report);
    } catch (e) {
      console.error(e);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-wc-navy text-wc-text">
      {/* Header */}
      <header className="bg-wc-surface border-b border-wc-surface-hover p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="Go back to Home" className="p-2 rounded-full hover:bg-wc-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wc-cyan">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center gap-2">
            <Activity className="text-wc-cyan" size={24} />
            <h1 className="text-xl font-bold tracking-tight">Ops Command <span className="text-wc-cyan">Center</span></h1>
          </div>
        </div>
        <button 
          onClick={handleGenerateReport}
          disabled={reportLoading}
          className="flex items-center gap-2 bg-wc-surface-hover hover:bg-wc-cyan/20 text-wc-cyan px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          {reportLoading ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
          Generate Shift Report
        </button>
      </header>

      {/* Main Grid */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
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
      </main>

      {/* Report Modal */}
      {report && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
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
    </div>
  );
}
