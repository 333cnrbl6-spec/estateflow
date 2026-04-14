import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function LandingNav({ onLogin }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className={`text-xl font-bold ${scrolled ? 'text-slate-900' : 'text-white'}`}>
            Premiso
          </span>
        </div>

        <div className={`hidden md:flex items-center gap-8 text-sm font-medium ${
          scrolled ? 'text-slate-700' : 'text-white/90'
        }`}>
          <button onClick={() => scrollTo('features')} className="hover:opacity-70 transition">Features</button>
          <button onClick={() => scrollTo('demo-chooser')} className="hover:opacity-70 transition">Demo</button>
          <button onClick={() => scrollTo('pricing')} className="hover:opacity-70 transition">Pricing</button>
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
            className={scrolled
              ? 'bg-primary text-white'
              : 'bg-white text-primary hover:bg-slate-100'
            }
            onClick={() => document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
}