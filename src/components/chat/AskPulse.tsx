'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Accessibility } from 'lucide-react';
import { cn } from '../stadium/StadiumMap';

interface Message {
  id: string;
  sender: 'USER' | 'MODEL';
  content: string;
}

export function AskPulse({ 
  onRouteReceived,
  accessibilityMode,
  setAccessibilityMode 
}: { 
  onRouteReceived: (route: string[]) => void,
  accessibilityMode: boolean,
  setAccessibilityMode: (val: boolean) => void
}) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'MODEL', content: 'Hi! I am StadiumPulse. Need help finding your seat, food, or the fastest exit?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'USER', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: userMsg, 
          language: 'en', // In a full app, detect from browser
          accessibilityMode 
        })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        id: Date.now().toString() + 'm', 
        sender: 'MODEL', 
        content: data.message 
      }]);

      if (data.route && Array.isArray(data.route)) {
        onRouteReceived(data.route);
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString() + 'e', sender: 'MODEL', content: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md bg-wc-surface border border-wc-surface-hover rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-wc-surface-hover border-b border-wc-navy">
        <div className="flex items-center gap-2">
          <Bot className="text-wc-magenta" />
          <h3 className="font-bold text-lg tracking-tight">Ask Pulse</h3>
        </div>
        <button 
          onClick={() => setAccessibilityMode(!accessibilityMode)}
          className={cn("p-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wc-cyan", accessibilityMode ? "bg-wc-cyan/20 text-wc-cyan" : "text-wc-text-muted hover:bg-wc-navy")}
          title="Toggle Accessibility Routing"
          aria-label={accessibilityMode ? "Disable Accessibility Routing" : "Enable Accessibility Routing"}
          aria-pressed={accessibilityMode}
        >
          <Accessibility size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" aria-live="polite">
        {messages.map(msg => (
          <div key={msg.id} className={cn("flex", msg.sender === 'USER' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
              msg.sender === 'USER' 
                ? "bg-wc-magenta text-white rounded-tr-sm" 
                : "bg-wc-navy text-wc-text border border-wc-surface-hover rounded-tl-sm"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-wc-navy p-3 rounded-2xl rounded-tl-sm border border-wc-surface-hover flex gap-1">
              <span className="w-2 h-2 rounded-full bg-wc-cyan animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-wc-cyan animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-wc-cyan animate-bounce [animation-delay:-0.3s]" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-wc-surface-hover flex items-center gap-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="E.g., Find food near Gate A..."
          aria-label="Ask Pulse a question"
          className="flex-1 bg-wc-navy border border-wc-surface rounded-full px-4 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-wc-cyan transition-colors"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || loading}
          aria-label="Send message"
          className="p-2 rounded-full bg-wc-cyan text-wc-navy disabled:opacity-50 disabled:cursor-not-allowed hover:bg-wc-cyan/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wc-cyan transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
