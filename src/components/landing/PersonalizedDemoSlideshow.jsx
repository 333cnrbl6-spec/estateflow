import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';
import SubscriptionRecommendation from './SubscriptionRecommendation';

/**
 * Personalized bespoke slideshow for demo completers
 * Plays automatically post-demo-build as a gateway into their demo environment
 * Shows: congratulations → their data summary → recommended subscription → pricing comparison → invite to explore
 */
export default function PersonalizedDemoSlideshow({ demoData, onDismiss, onStartDemo }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const SLIDES = [
    // Slide 1: Congratulations
    {
      id: 'congrats',
      duration: 5000,
      component: (
        <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center px-6 text-white">
          <div className="text-center max-w-2xl">
            <div className="text-8xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-5xl font-bold mb-4">Your Personalised Demo is Ready!</h2>
            <p className="text-2xl text-green-100 mb-6">
              We've created a bespoke Premiso environment specifically for <strong>{demoData?.company}</strong>
            </p>
            <p className="text-lg text-green-100 opacity-80">
              Built with your company structure, data from Companies House, and configured for your portfolio
            </p>
          </div>
        </div>
      ),
    },
    // Slide 2: Your data summary
    {
      id: 'summary',
      duration: 6000,
      component: (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center px-6 py-20">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-2">Your Portfolio Profile</h2>
              <p className="text-lg text-slate-600">Here's how we've configured your demo</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Company</p>
                <p className="text-2xl font-bold text-slate-900 mt-2 line-clamp-2">{demoData?.company || 'Your Company'}</p>
              </div>
              <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Portfolio Size</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{demoData?.portfolioSize || 'TBC'}</p>
              </div>
              <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Property Types</p>
                <p className="text-sm font-bold text-slate-900 mt-2 line-clamp-2">
                  {demoData?.propertyTypes?.slice(0, 2).join(', ') || 'Mixed'}
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Pain Points</p>
                <p className="text-sm font-bold text-slate-900 mt-2 line-clamp-2">
                  {demoData?.painPoints?.slice(0, 2).join(', ') || 'TBC'}
                </p>
              </div>
            </div>

            {demoData?.directors && demoData.directors.length > 0 && (
              <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Directors Imported from Companies House</p>
                <div className="flex flex-wrap gap-2">
                  {demoData.directors.slice(0, 5).map((dir, i) => (
                    <span key={i} className="text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                      {dir.name} · {dir.role}
                    </span>
                  ))}
                  {demoData.directors.length > 5 && (
                    <span className="text-sm bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium">
                      +{demoData.directors.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
    // Slide 3: Subscription recommendation (embedded component)
    {
      id: 'subscription',
      duration: 12000,
      component: (
        <div className="min-h-screen bg-white px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-2">Your Recommended Subscription</h2>
              <p className="text-lg text-slate-600">Based on your portfolio and feature needs</p>
            </div>
            <SubscriptionRecommendation
              demoData={demoData}
              onChooseTier={(tierId) => console.log('Chose tier:', tierId)}
            />
          </div>
        </div>
      ),
    },
    // Slide 4: Feature highlights for their tier
    {
      id: 'features',
      duration: 8000,
      component: (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-6 py-20">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-2">What You Can Do Right Now</h2>
              <p className="text-lg text-slate-600">In your personalised demo environment</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { emoji: '📊', title: 'View Your Dashboard', desc: 'Live KPIs, compliance alerts, rent tracking' },
                { emoji: '🛡️', title: 'Check Compliance', desc: 'Certificate expiry calendar, audit trails' },
                { emoji: '🏢', title: 'Block Management', desc: 'Service charge accounts, leaseholder portal' },
                { emoji: '🔧', title: 'Maintenance Board', desc: 'Live Kanban with photo uploads & contractors' },
                { emoji: '💰', title: 'Financial Hub', desc: 'Rent collection, arrears, landlord statements' },
                { emoji: '📞', title: 'Out-of-Hours', desc: 'Emergency call centre with auto dispatch' },
                { emoji: '👥', title: 'Tenant Portal', desc: 'Your tenants can pay rent & report issues' },
                { emoji: '📈', title: 'Sales CRM', desc: 'Valuations, viewings, offers & pipeline' },
              ].map((feature, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-sm hover:shadow-md transition">
                  <p className="text-4xl mb-3">{feature.emoji}</p>
                  <p className="font-bold text-slate-900 mb-1">{feature.title}</p>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // Slide 5: Call to action
    {
      id: 'cta',
      duration: 6000,
      component: (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center px-6 text-white">
          <div className="text-center max-w-2xl">
            <div className="text-7xl mb-6">🚀</div>
            <h2 className="text-4xl font-bold mb-4">Ready to Explore?</h2>
            <p className="text-xl text-indigo-100 mb-2">
              Your demo is live and waiting for you.
            </p>
            <p className="text-lg text-indigo-200 mb-8">
              Click below to dive into your personalised Premiso environment. Our team will be in touch within 24 hours to answer any questions.
            </p>
            <button
              onClick={onStartDemo}
              className="bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold text-xl hover:bg-indigo-50 transition shadow-lg mb-4">
              Start Exploring Your Demo →
            </button>
            <p className="text-sm text-indigo-200">
              Demo access expires in 48 hours. Can't wait? <a href="mailto:info@rbm-nw.co.uk" className="underline font-semibold">Contact us</a> to extend.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const currentSlide = SLIDES[slideIndex];

  // Autoplay effect
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setTimeout(() => {
      setSlideIndex((i) => (i + 1) % SLIDES.length);
    }, currentSlide.duration);
    return () => clearTimeout(timer);
  }, [slideIndex, isAutoPlaying, currentSlide.duration]);

  const nextSlide = () => {
    setSlideIndex((i) => (i + 1) % SLIDES.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setSlideIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
    setIsAutoPlaying(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
      <div className="relative w-full h-full overflow-hidden">
        {/* Slide fade transition */}
        <div className={`transition-opacity duration-1000 absolute inset-0 w-full h-full ${
          slideIndex === SLIDES.findIndex(s => s.id === currentSlide.id) ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {currentSlide.component}
        </div>

        {/* Close button */}
        <button
          onClick={onDismiss}
          className="fixed top-6 right-6 z-50 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition backdrop-blur-sm"
          title="Close slideshow"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Navigation controls */}
        <div className="fixed bottom-6 left-6 right-6 z-40 flex justify-between items-center">
          <button onClick={prevSlide} className="bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition backdrop-blur-sm">
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Indicator dots */}
          <div className="flex gap-2 mx-4">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => { setSlideIndex(i); setIsAutoPlaying(false); }}
                className={`h-2.5 rounded-full transition ${i === slideIndex ? 'bg-white w-8' : 'bg-white/40 w-2.5'}`}
              />
            ))}
          </div>

          {/* Play/Pause */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition backdrop-blur-sm"
          >
            {isAutoPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>

          <button onClick={nextSlide} className="bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition backdrop-blur-sm">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Slide counter */}
        <div className="fixed top-6 left-6 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
          {slideIndex + 1} / {SLIDES.length}
        </div>
      </div>
    </div>
  );
}