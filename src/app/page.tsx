import Link from 'next/link';
import { ArrowRight, Activity, ShieldCheck, Map } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-wc-navy text-wc-text overflow-hidden relative">
      {/* Decorative BG */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-wc-magenta/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-wc-cyan/20 blur-[120px] pointer-events-none" />

      <div className="z-10 text-center mb-12 max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter">
          Stadium<span className="text-wc-cyan">Pulse</span> <span className="text-wc-magenta">AI</span>
        </h1>
        <p className="text-xl text-wc-text-muted">
          One AI brain for every gate, every fan, every decision. <br/>
          Select your portal to experience the future of stadium operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl z-10">
        
        {/* Fan Portal */}
        <Link href="/fan" className="group flex flex-col p-6 rounded-2xl bg-wc-surface border border-wc-surface-hover hover:border-wc-magenta/50 transition-all hover:-translate-y-1">
          <div className="h-12 w-12 rounded-full bg-wc-magenta/10 flex items-center justify-center mb-6 group-hover:bg-wc-magenta/20 transition-colors">
            <Map className="text-wc-magenta" size={24} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Fan Experience</h2>
          <p className="text-wc-text-muted flex-grow mb-6">
            Smart wayfinding, live crowd advisories, and the Ask Pulse multilingual assistant.
          </p>
          <div className="flex items-center text-wc-magenta font-semibold mt-auto">
            Enter Portal <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Ops Command Center */}
        <Link href="/ops" className="group flex flex-col p-6 rounded-2xl bg-wc-surface border border-wc-surface-hover hover:border-wc-cyan/50 transition-all hover:-translate-y-1">
          <div className="h-12 w-12 rounded-full bg-wc-cyan/10 flex items-center justify-center mb-6 group-hover:bg-wc-cyan/20 transition-colors">
            <Activity className="text-wc-cyan" size={24} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Ops Command</h2>
          <p className="text-wc-text-muted flex-grow mb-6">
            Live telemetry, AI incident triage, &quot;what-if&quot; simulations, and shift reports.
          </p>
          <div className="flex items-center text-wc-cyan font-semibold mt-auto">
            Enter Portal <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Volunteer Portal */}
        <Link href="/volunteer" className="group flex flex-col p-6 rounded-2xl bg-wc-surface border border-wc-surface-hover hover:border-wc-lime/50 transition-all hover:-translate-y-1">
          <div className="h-12 w-12 rounded-full bg-wc-lime/10 flex items-center justify-center mb-6 group-hover:bg-wc-lime/20 transition-colors">
            <ShieldCheck className="text-wc-lime" size={24} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Volunteer Assist</h2>
          <p className="text-wc-text-muted flex-grow mb-6">
            AI-powered predictive modeling for crowd control and emergency routing. Test &quot;What-If&quot; scenarios live.
          </p>
          <div className="flex items-center text-wc-lime font-semibold mt-auto">
            Enter Portal <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </main>
  );
}
