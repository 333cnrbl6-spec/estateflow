import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function Landing() {
  const [demoMode, setDemoMode] = useState(null); // null | 'slideshow' | 'personalised'
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [demoSession, setDemoSession] = useState(null); // set when personalised demo completes

  // Check if there's a still-valid demo session token from a prior visit
  const existingToken = (() => {
    try {
      const t = JSON.parse(localStorage.getItem('premiso_demo_token') || 'null');
      return t && t.expiresAt > Date.now() ? t : null;
    } catch { return null; }
  })();

  const handleDemoChoice = (choice) => {
    setDemoMode(choice);
    if (choice !== 'scenario') {
      setTimeout(() => {
        document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleDemoComplete = (session) => {
    if (session?.email) {
      // Personalised demo — lead already captured, just show CTA
      setDemoSession(session);
    } else {
      // Slideshow — still show lead form
      setShowLeadForm(true);
    }
    setTimeout(() => {
      document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <LandingNav onLogin={() => window.location.href = '/dashboard'} />

      <HeroSection
        onStartDemo={() => document.getElementById('demo-chooser')?.scrollIntoView({ behavior: 'smooth' })}
        onGetStarted={() => setShowLeadForm(true)}
      />

      <FeaturesSection />

      <WhoIsItFor onGetStarted={() => setShowLeadForm(true)} />

      {/* Demo Chooser */}
      <section id="demo-chooser" className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">See Premiso in Action</h2>
          <p className="text-lg text-slate-600 mb-10">
            Choose how you'd like to explore the platform
          </p>
          <DemoChooser onChoose={handleDemoChoice} chosen={demoMode} />
        </div>
      </section>

      {/* Demo Area */}
      {demoMode && demoMode !== 'scenario' && (
        <section id="demo-section" className="py-10 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            {demoMode === 'slideshow' ? (
              <SlideshowDemo onGetStarted={handleDemoComplete} />
            ) : (
              <PersonalisedDemoWizard onComplete={handleDemoComplete} />
            )}
          </div>
        </section>
      )}

      <PricingSection onChoosePlan={() => setShowLeadForm(true)} />

      {/* Lead Capture / Post-demo CTA */}
      <section id="get-started" className="py-20 bg-primary">
        <div className="max-w-2xl mx-auto px-6">
          {demoSession ? (
            /* Personalised demo already captured their details — no re-entry */
            <div className="text-center text-white">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-3xl font-bold mb-2">Your demo is live, {demoSession.name?.split(' ')[0]}!</h3>
              <p className="text-primary-foreground/80 mb-2">
                We've built a personalised Premiso environment for <strong>{demoSession.company}</strong>.
              </p>
              <p className="text-sm text-primary-foreground/60 mb-8">
                A confirmation has been sent to <strong>{demoSession.email}</strong>. Our team will be in touch within 1 working day.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/dashboard"
                  className="bg-white text-primary px-8 py-3 rounded-xl font-bold text-lg hover:bg-slate-100 transition">
                  Explore the Platform →
                </Link>
                <button onClick={() => setShowLeadForm(true)}
                  className="border-2 border-white/40 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition text-lg">
                  Start Free Trial
                </button>
              </div>
            </div>
          ) : leadSubmitted ? (
            <div className="text-center text-white">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-2xl font-bold mb-2">We'll be in touch!</h3>
              <p className="text-primary-foreground/80">Check your inbox — a confirmation is on its way.</p>
              <Link to="/dashboard" className="mt-6 inline-block bg-white text-primary px-6 py-3 rounded-lg font-semibold">
                Log in to Premiso →
              </Link>
            </div>
          ) : showLeadForm ? (
            <LeadCaptureForm demoType={demoMode} onSubmitted={() => setLeadSubmitted(true)} />
          ) : (
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to transform your property management?</h2>
              <p className="text-xl text-primary-foreground/80 mb-8">
                Join landlords, letting agents, freeholders and block managers already using Premiso
              </p>
              <button onClick={() => setShowLeadForm(true)}
                className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition">
                Get Early Access
              </button>
            </div>
          )}
        </div>
      </section>

      <FooterSection />

      {/* Persistent demo watermark banner if an active session exists */}
      <DemoSessionBanner
        session={existingToken}
        onExpired={() => localStorage.removeItem('premiso_demo_token')}
      />
    </div>
  );
}