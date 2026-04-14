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

export default function Landing() {
  const [demoMode, setDemoMode] = useState(null); // null | 'slideshow' | 'personalised'
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const handleDemoChoice = (choice) => {
    setDemoMode(choice);
    // Scroll to demo section
    setTimeout(() => {
      document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* TODO: Replace placeholder logo/branding with final Premiso assets before launch */}
      <LandingNav onLogin={() => base44.auth.redirectToLogin('/')} />

      <HeroSection
        onStartDemo={() => document.getElementById('demo-chooser')?.scrollIntoView({ behavior: 'smooth' })}
        onGetStarted={() => setShowLeadForm(true)}
      />

      <FeaturesSection />

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
      {demoMode && (
        <section id="demo-section" className="py-10 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            {demoMode === 'slideshow' ? (
              <SlideshowDemo onGetStarted={() => setShowLeadForm(true)} />
            ) : (
              <PersonalisedDemoWizard onComplete={() => setShowLeadForm(true)} />
            )}
          </div>
        </section>
      )}

      <PricingSection onChoosePlan={() => setShowLeadForm(true)} />

      {/* Lead Capture */}
      <section id="get-started" className="py-20 bg-primary">
        <div className="max-w-2xl mx-auto px-6">
          {leadSubmitted ? (
            <div className="text-center text-white">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-2xl font-bold mb-2">We'll be in touch!</h3>
              <p className="text-primary-foreground/80">
                Check your inbox — a confirmation is on its way.
              </p>
              <Link to="/" className="mt-6 inline-block bg-white text-primary px-6 py-3 rounded-lg font-semibold">
                Log in to Premiso →
              </Link>
            </div>
          ) : showLeadForm ? (
            <LeadCaptureForm
              demoType={demoMode}
              onSubmitted={() => setLeadSubmitted(true)}
            />
          ) : (
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to transform your property management?</h2>
              <p className="text-xl text-primary-foreground/80 mb-8">
                Join the letting agents and block managers already using Premiso
              </p>
              <button
                onClick={() => setShowLeadForm(true)}
                className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition"
              >
                Get Early Access
              </button>
            </div>
          )}
        </div>
      </section>

      <FooterSection />
    </div>
  );
}