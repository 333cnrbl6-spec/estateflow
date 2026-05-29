import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '@/components/landing/LandingNav';
import FooterSection from '@/components/landing/FooterSection';
import TermsAcceptModal from '@/components/landing/TermsAcceptModal';
import {
  ChevronRight, Building2, FileCheck, Users, Zap, BarChart3,
  Lock, Clock, TrendingUp, MessageSquare, Shield, CheckCircle
} from 'lucide-react';

const BRAND = { navy: '#0A1E3F', blue: '#007BFF', orange: '#FF7A00' };

const modules = [
  { icon: <Building2 className="w-6 h-6" />, title: 'Tenancy Management', desc: 'Full tenancy lifecycle from pipeline to renewal — lettings, HMOs, blocks & sales.', path: '/pipeline' },
  { icon: <FileCheck className="w-6 h-6" />, title: 'Compliance & Certificates', desc: 'Auto-tracked gas safety, EICRs, fire assessments, and legal safeguards.', path: '/compliance-hub' },
  { icon: <BarChart3 className="w-6 h-6" />, title: 'Financial Control', desc: 'Rent ledger, accounting sync, bank reconciliation, and reporting.', path: '/financials' },
  { icon: <Users className="w-6 h-6" />, title: 'Tenant Portals', desc: 'Self-service maintenance, payments, documents, and communication.', path: '/tenant-portal' },
  { icon: <Zap className="w-6 h-6" />, title: 'Maintenance Tracking', desc: 'Contractor dispatch, job scheduling, and mobile field access.', path: '/maintenance-board' },
  { icon: <MessageSquare className="w-6 h-6" />, title: 'Communications Log', desc: 'Centralised messaging, audit trails, and tenant correspondence.', path: '/messages' },
];

const benefits = [
  { icon: <TrendingUp className="w-7 h-7" />, title: 'Reduce Admin Overhead', desc: 'Self-service portals cut inbound queries by up to 70% — freeing your team for higher-value work.' },
  { icon: <Shield className="w-7 h-7" />, title: 'Stay Legally Protected', desc: 'Built-in safeguards for S21/S8 notices, deposit protection, right-to-rent, and compliance gaps.' },
  { icon: <CheckCircle className="w-7 h-7" />, title: 'Never Miss a Certificate', desc: 'Live expiry alerts and auto-tracked renewals across your entire portfolio.' },
  { icon: <Clock className="w-7 h-7" />, title: 'Go Live in Under 2 Weeks', desc: 'Quick onboarding with data import wizards, Companies House integration, and guided setup.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Poppins, Inter, Segoe UI, sans-serif', background: '#f8faff' }}>
      <TermsAcceptModal />
      <LandingNav />

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${BRAND.navy} 0%, #0d2952 60%, #0a3060 100%)` }} className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6" style={{ background: 'rgba(0,123,255,0.18)', color: '#60a5fa', border: '1px solid rgba(0,123,255,0.3)' }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            BETA — Now open for property professionals
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Property Management<br />
            <span style={{ color: BRAND.orange }}>Built for Clarity.</span>
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Premiso is a modern property‑management platform designed for agents, landlords, and operational teams who need clarity, compliance, and efficiency. It brings together tenancy workflows, maintenance tracking, communication logs, and portfolio oversight into a single, easy‑to‑use system. Premiso is built to support real‑world operations with a clean interface, reliable performance, and a professional, trustworthy design.
          </p>
          <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.4)' }}>Powered by SynergyFlow Group</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 rounded-xl font-bold text-lg text-white transition hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: BRAND.blue }}
            >
              Explore Platform <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 rounded-xl font-bold text-lg transition hover:opacity-90"
              style={{ border: `2px solid ${BRAND.orange}`, color: BRAND.orange, background: 'transparent' }}
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* BETA Banner */}
      <section className="py-10 px-6" style={{ background: '#fff', borderBottom: '1px solid #e8eef8' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-lg font-semibold mb-3" style={{ color: BRAND.navy }}>Welcome to Premiso BETA</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#4a5568' }}>
            You now have full access to all professional features for <strong>14 days</strong>. This BETA release is intended for property professionals who wish to explore the platform, test workflows, and provide feedback on usability and performance. A <strong>Feedback Bot</strong> and <strong>Helper Bot</strong> are available to assist with setup and troubleshooting. BETA testers may request an extension if additional time is required. Your feedback helps improve the next generation of SynergyFlow Group tools.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: BRAND.navy }} className="py-14 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: '18+ Modules', desc: 'Full platform coverage' },
            { label: '100% UK Law', desc: 'Compliance ready' },
            { label: '24/7 Add-On', desc: 'Out-of-hours service' },
            { label: '<2 Weeks', desc: 'Go-live time' },
          ].map((s, i) => (
            <div key={i} className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div className="text-2xl font-bold mb-1" style={{ color: BRAND.orange }}>{s.label}</div>
              <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section id="features" className="py-20 px-6" style={{ background: '#f8faff' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4" style={{ color: BRAND.navy }}>Everything You Need</h2>
          <p className="text-center text-sm mb-14" style={{ color: '#6b7280' }}>Click any module to explore the live platform</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod, i) => (
              <div
                key={i}
                onClick={() => navigate(mod.path)}
                className="p-6 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 bg-white text-left"
                style={{ border: '2px solid #e8eef8' }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-white" style={{ background: i % 2 === 0 ? BRAND.blue : BRAND.orange }}>
                  {mod.icon}
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: BRAND.navy }}>{mod.title}</h3>
                <p className="text-sm" style={{ color: '#6b7280' }}>{mod.desc}</p>
                <div className="flex items-center gap-1 mt-4 text-sm font-semibold" style={{ color: BRAND.blue }}>
                  Explore <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-14" style={{ color: BRAND.navy }}>Why Choose Premiso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {benefits.map((b, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ background: i % 2 === 0 ? BRAND.blue : BRAND.orange }}>
                  {b.icon}
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1" style={{ color: BRAND.navy }}>{b.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#4a5568' }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6" style={{ background: '#f0f4ff' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-14" style={{ color: BRAND.navy }}>Simple Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Starter', price: '£149', units: 'Up to 50 units', highlight: false },
              { name: 'Professional', price: '£349', units: 'Up to 200 units', highlight: true },
              { name: 'Enterprise', price: 'Custom', units: 'Unlimited', highlight: false },
            ].map((tier, i) => (
              <div key={i} className={`p-8 rounded-xl bg-white transition-all ${tier.highlight ? 'shadow-xl scale-105' : 'shadow-sm hover:shadow-md'}`}
                style={{ border: tier.highlight ? `2px solid ${BRAND.blue}` : '2px solid #e8eef8' }}>
                {tier.highlight && (
                  <div className="text-xs font-bold text-white px-3 py-1 rounded-full w-fit mb-4" style={{ background: BRAND.blue }}>Most Popular</div>
                )}
                <h3 className="text-2xl font-bold mb-2" style={{ color: BRAND.navy }}>{tier.name}</h3>
                <div className="text-4xl font-bold mb-1" style={{ color: tier.highlight ? BRAND.blue : BRAND.navy }}>
                  {tier.price}<span className="text-base font-normal text-slate-500">/mo</span>
                </div>
                <p className="text-sm mb-6" style={{ color: '#6b7280' }}>{tier.units}</p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-3 rounded-lg font-bold text-sm transition hover:opacity-90"
                  style={tier.highlight
                    ? { background: BRAND.blue, color: '#fff' }
                    : { border: `2px solid ${BRAND.navy}`, color: BRAND.navy, background: 'transparent' }}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
          <p className="text-center text-xs mt-8" style={{ color: '#9ca3af' }}>Optional: Out-of-Hours Service (£95–£295/mo) · Custom Integrations · White Label</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6" style={{ background: `linear-gradient(135deg, ${BRAND.navy}, #0d2952)` }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Operations?</h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Join agents, landlords, freeholders, and block managers already using Premiso.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-10 py-4 rounded-xl font-bold text-lg text-white inline-flex items-center gap-2 transition hover:opacity-90"
            style={{ background: BRAND.orange }}
          >
            Start Your Free Trial <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}