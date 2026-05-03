import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import LandingNav from '@/components/landing/LandingNav';
import FooterSection from '@/components/landing/FooterSection';
import { ChevronRight, Building2, FileCheck, Users, Zap, BarChart3, Lock, Clock, TrendingUp } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const navigateToDemo = (path) => {
    navigate(path);
  };

  // Platform modules with demo paths
  const modules = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: 'Property Management',
      desc: 'Lettings, HMOs, blocks & sales—unified dashboard',
      demoPath: '/properties',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: 'Compliance',
      desc: 'Auto-tracked certificates, legal safeguards, audits',
      demoPath: '/compliance-hub',
      color: 'bg-green-50 border-green-200'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Financial Control',
      desc: 'Rent ledger, accounting sync, reporting',
      demoPath: '/financials',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Tenant Portals',
      desc: 'Self-service, maintenance tracking, payments',
      demoPath: '/tenant-portal',
      color: 'bg-amber-50 border-amber-200'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Maintenance',
      desc: 'Contractor dispatch, scheduling, mobile access',
      demoPath: '/maintenance-board',
      color: 'bg-red-50 border-red-200'
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Out-of-Hours',
      desc: '24/7 emergency call service add-on',
      demoPath: '/out-of-hours-pipeline',
      color: 'bg-slate-50 border-slate-200'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-sans">
      <LandingNav onLogin={() => window.location.href = '/dashboard'} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            The Complete UK Property <span className="text-primary">Management Platform</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade compliance built-in for every portfolio size. From solo landlords to property groups—manage lettings, blocks, sales, and operations in one unified system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigateToDemo('/dashboard')}
              className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              Explore Demo <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateToDemo('/properties')}
              className="border-2 border-primary text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/5 transition"
            >
              Quick Tour
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { label: '18+ Modules', value: 'Full Platform' },
            { label: '100% Compliant', value: 'UK Law Ready' },
            { label: '24/7 Support', value: 'Optional Add-On' },
            { label: '<2 Weeks', value: 'Go-Live Time' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-slate-200 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{stat.label}</div>
              <div className="text-sm text-slate-600">{stat.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Modules */}
      <section className="py-20 px-6 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-slate-900">Everything You Need</h2>
          <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto">Click any module to explore the live demo</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod, i) => (
              <button
                key={i}
                onClick={() => navigateToDemo(mod.demoPath)}
                className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg hover:scale-105 text-left ${mod.color}`}
              >
                <div className="text-primary mb-4">{mod.icon}</div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{mod.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{mod.desc}</p>
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  Try Demo <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">Why Choose Premiso</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {[
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Reduce Inbound Queries',
                desc: 'Self-service tenant & landlord portals cut support burden by up to 70%'
              },
              {
                icon: <FileCheck className="w-8 h-8" />,
                title: 'Never Miss Compliance',
                desc: 'Auto-tracked certificates, gas safety, EICRs, fire assessments with live alerts'
              },
              {
                icon: <Lock className="w-8 h-8" />,
                title: 'Legal Protection',
                desc: 'Built-in safeguards for S21/S8 notices, deposit protection, right to rent'
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: 'Get Live in <2 Weeks',
                desc: 'Quick onboarding with data import, Companies House integration, automated setup'
              },
            ].map((benefit, i) => (
              <div key={i} className="flex gap-6">
                <div className="text-primary flex-shrink-0">{benefit.icon}</div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/5 to-primary/10 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">Simple Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Starter', price: '£149', units: 'Up to 50 units', cta: 'Get Started' },
              { name: 'Professional', price: '£349', units: 'Up to 200 units', cta: 'Most Popular', highlight: true },
              { name: 'Enterprise', price: 'Custom', units: 'Unlimited', cta: 'Contact Sales' },
            ].map((tier, i) => (
              <div key={i} className={`p-8 rounded-xl border-2 transition-all ${tier.highlight ? 'bg-white border-primary shadow-lg scale-105' : 'bg-white border-slate-200 hover:border-primary/30'}`}>
                {tier.highlight && <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold w-fit mb-4">Most Popular</div>}
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                <div className="text-4xl font-bold text-primary mb-1">{tier.price}<span className="text-lg text-slate-600">/month</span></div>
                <p className="text-slate-600 mb-6">{tier.units}</p>
                <button onClick={() => navigateToDemo('/dashboard')} className={`w-full py-3 rounded-lg font-bold transition ${tier.highlight ? 'bg-primary text-white hover:bg-primary/90' : 'border-2 border-primary text-primary hover:bg-primary/5'}`}>
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
          
          <p className="text-center text-slate-600 mt-8 text-sm">Optional add-ons: Out-of-Hours Service (£95–£295/mo), Custom Integrations, White Label</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-slate-900">Ready to Transform Property Management?</h2>
          <p className="text-xl text-slate-600 mb-8">Join landlords, letting agents, freeholders, and block managers already using Premiso</p>
          <button
            onClick={() => navigateToDemo('/dashboard')}
            className="bg-primary text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition inline-flex items-center gap-2"
          >
            Start Your Free Demo <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}