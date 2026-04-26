import React from 'react';
import { Button } from '@/components/ui/button';

const STATS = [
  { value: '£2.4M+', label: 'Rent Managed' },
  { value: '1,200+', label: 'Units Tracked' },
  { value: '99.2%', label: 'Compliance Rate' },
  { value: '4.8★', label: 'Client Rating' },
];

export default function HeroSection({ onStartDemo, onGetStarted }) {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-primary via-blue-900 to-slate-900 flex items-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              ✓ Never miss a compliance deadline — automatic alerts, guaranteed
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              One dashboard.
              <span className="block text-amber-400">All your properties.</span>
            </h1>

            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Compliance alerts, tenant management, maintenance scheduling, and financial reporting—all automatic, all in one place. Stop juggling 5 systems. Start controlling your portfolio.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-lg px-8 py-4"
                onClick={onGetStarted}
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 text-lg px-8 py-4"
                onClick={onStartDemo}
              >
                See a Demo →
              </Button>
            </div>

            <p className="text-white/50 text-sm mt-4">No credit card required · Setup in under 10 minutes</p>
          </div>

          {/* Hero mockup */}
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 shadow-2xl">
              <div className="bg-white rounded-xl overflow-hidden">
                {/* Fake dashboard screenshot */}
                <div className="bg-primary h-10 flex items-center px-4 gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <div className="w-2 h-2 bg-amber-400 rounded-full" />
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-white/70 text-xs ml-2">premiso.co.uk</span>
                </div>
                <div className="p-4 bg-slate-50">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Properties', value: '47', color: 'bg-blue-100 text-blue-700' },
                      { label: 'Rent Due', value: '£18,240', color: 'bg-amber-100 text-amber-700' },
                      { label: 'Compliance', value: '96%', color: 'bg-green-100 text-green-700' },
                    ].map(stat => (
                      <div key={stat.label} className={`${stat.color} rounded-lg p-3`}>
                        <p className="text-xs font-medium opacity-70">{stat.label}</p>
                        <p className="text-lg font-bold">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {['Flat 12 - Boiler repair overdue', 'Gas cert expires in 14 days - 4 Oak Lane', '3 invoices awaiting approval'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white rounded p-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-red-400' : i === 1 ? 'bg-amber-400' : 'bg-blue-400'}`} />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-white/20">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-amber-400">{stat.value}</p>
              <p className="text-white/60 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}