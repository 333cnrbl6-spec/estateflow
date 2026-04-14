import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PricingSection from '@/components/landing/PricingSection';
import LeadCaptureForm from '@/components/landing/LeadCaptureForm';
import DemoChooser from '@/components/landing/DemoChooser';
import SlideshowDemo from '@/components/landing/SlideshowDemo';
import PersonalisedDemoWizard from '@/components/landing/PersonalisedDemoWizard';
import LandingNav from '@/components/landing/LandingNav';
import FooterSection from '@/components/landing/FooterSection';
import DemoSessionBanner from '@/components/landing/DemoSessionBanner';
import WhoIsItFor from '@/components/landing/WhoIsItFor';

// Core value proposition: Compliance protection scaled for everyone
const CORE_MESSAGE = "Enterprise-grade compliance protection built-in for every portfolio size. From solo landlords to property groups—everyone gets the same legal safeguards.";

export default function Landing() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [demoMode, setDemoMode] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [demoSession, setDemoSession] = useState(null);

  const existingToken = (() => {
    try {
      const t = JSON.parse(localStorage.getItem('premiso_demo_token') || 'null');
      return t && t.expiresAt > Date.now() ? t : null;
    } catch { return null; }
  })();

  // Slide definitions with dwell time (ms)
  const SLIDES = React.useMemo(() => [
    { id: 'hero', duration: 8000, component: <HeroSection onStartDemo={() => setSlideIndex(1)} onGetStarted={() => { setSlideIndex(3); setIsAutoPlaying(false); }} /> },
    { id: 'features', duration: 10000, component: <FeaturesSection /> },
    { id: 'who-is-it-for', duration: 8000, component: <WhoIsItFor onGetStarted={() => { setSlideIndex(4); setIsAutoPlaying(false); }} /> },
    { id: 'demo', duration: 6000, component: <DemoChooser onChoose={(choice) => { setDemoMode(choice); if (choice !== 'scenario') setIsAutoPlaying(false); }} chosen={demoMode} /> },
    { id: 'pricing', duration: 10000, component: <PricingSection onChoosePlan={() => { setShowLeadForm(true); setIsAutoPlaying(false); }} /> },
    { id: 'cta', duration: 8000, component: (
      demoSession ? (
        <div className="min-h-screen bg-primary flex items-center justify-center px-6">
          <div className="text-center text-white max-w-2xl">
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="text-3xl font-bold mb-3">Your demo is live, {demoSession.name?.split(' ')[0]}!</h3>
            <p className="text-primary-foreground/80 mb-3">We've built a personalised Premiso environment for <strong>{demoSession.company}</strong>.</p>
            <p className="text-sm text-primary-foreground/60 mb-8">A confirmation has been sent to <strong>{demoSession.email}</strong>. Our team will be in touch within 1 working day.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dashboard" className="bg-white text-primary px-8 py-3 rounded-xl font-bold text-lg hover:bg-slate-100 transition">Explore the Platform →</Link>
              <button onClick={() => { setShowLeadForm(true); setIsAutoPlaying(false); }} className="border-2 border-white/40 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition text-lg">Start Free Trial</button>
            </div>
          </div>
        </div>
      ) : leadSubmitted ? (
        <div className="min-h-screen bg-primary flex items-center justify-center px-6">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">✓</div>
            <h3 className="text-2xl font-bold mb-2">We'll be in touch!</h3>
            <p className="text-primary-foreground/80 mb-8">Check your inbox — a confirmation is on its way.</p>
            <Link to="/dashboard" className="inline-block bg-white text-primary px-6 py-3 rounded-lg font-semibold">Log in to Premiso →</Link>
          </div>
        </div>
      ) : showLeadForm ? (
        <div className="min-h-screen bg-primary flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-2xl">
            <LeadCaptureForm demoType={demoMode} onSubmitted={() => { setLeadSubmitted(true); setSlideIndex(SLIDES.length - 1); }} />
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-primary flex items-center justify-center px-6">
          <div className="text-center text-white max-w-2xl">
            <h2 className="text-4xl font-bold mb-4">Ready to transform your property management?</h2>
            <p className="text-xl text-primary-foreground/80 mb-8">Join landlords, letting agents, freeholders and block managers already using Premiso</p>
            <button onClick={() => { setShowLeadForm(true); setIsAutoPlaying(false); }} className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition">Get Early Access</button>
          </div>
        </div>
      )
    ) },
  ], [demoSession, leadSubmitted, showLeadForm, demoMode]);

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
    <div className="min-h-screen bg-white font-sans overflow-hidden">
      <LandingNav onLogin={() => window.location.href = '/dashboard'} />

      {/* Carousel container */}
      <div className="relative w-full min-h-[calc(100vh-64px)] bg-white overflow-hidden">
        {/* Slide fade transition */}
        <div className={`transition-opacity duration-1000 w-full ${slideIndex === SLIDES.findIndex(s => s.id === currentSlide.id) ? 'opacity-100' : 'opacity-0'}`}>
          {currentSlide.component}
        </div>

        {/* Navigation controls (kiosk-friendly) */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-6 flex justify-between items-center">
          <button onClick={prevSlide} className="bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition backdrop-blur-sm">
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Indicator dots */}
          <div className="flex gap-2">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => { setSlideIndex(i); setIsAutoPlaying(false); }} 
                className={`h-2.5 rounded-full transition ${i === slideIndex ? 'bg-white w-8' : 'bg-white/40 w-2.5'}`} />
            ))}
          </div>

          {/* Play/Pause */}
          <button onClick={() => setIsAutoPlaying(!isAutoPlaying)} className="bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition backdrop-blur-sm">
            {isAutoPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>

          <button onClick={nextSlide} className="bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition backdrop-blur-sm">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Slide counter */}
        <div className="fixed top-20 right-6 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
          {slideIndex + 1} / {SLIDES.length}
        </div>
      </div>

      <FooterSection />

      <DemoSessionBanner session={existingToken} onExpired={() => localStorage.removeItem('premiso_demo_token')} />
    </div>
  );
}