import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function LandingNav({ onLogin }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #007BFF, #0A1E3F)' }}>
            <span className="text-white font-bold text-sm">DW</span>
          </div>
          <div>
            <span className={`text-xl font-bold ${scrolled ? 'text-slate-900' : 'text-white'}`} style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
              DataWinder
            </span>
            <span className={`text-xs ml-2 ${scrolled ? 'text-slate-500' : 'text-white/60'}`}>BETA</span>
          </div>
        </div>

        <div className={`hidden md:flex items-center gap-8 text-sm font-medium ${
          scrolled ? 'text-slate-700' : 'text-white/90'
        }`}>
          <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:opacity-70 transition">Features</button>
          <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="hover:opacity-70 transition">About</button>
          <button onClick={() => document.getElementById('credits')?.scrollIntoView({ behavior: 'smooth' })} className="hover:opacity-70 transition">Partners</button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className={scrolled ? 'text-slate-700' : 'text-white hover:bg-white/10'}
            onClick={() => window.location.href = '/dashboard'}
          >
            Log in
          </Button>
          <Button
            style={{ background: '#FF7A00', color: '#fff' }}
            className="hover:opacity-90"
            onClick={() => window.location.href = '/dashboard'}
          >
            Access Platform
          </Button>
        </div>
      </div>
    </nav>
  );
}