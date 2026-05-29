import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '@/components/landing/LandingNav';
import FooterSection from '@/components/landing/FooterSection';
import TermsAcceptModal from '@/components/landing/TermsAcceptModal';
import { ChevronRight, Microscope, Map, BarChart3, Globe, Database, Cpu, FlaskConical, BookOpen } from 'lucide-react';

const BRAND = {
  navy: '#0A1E3F',
  blue: '#007BFF',
  orange: '#FF7A00',
  white: '#FFFFFF',
};

const modules = [
  {
    icon: <Microscope className="w-6 h-6" />,
    title: 'Species Distribution Modelling',
    desc: 'Run MAXENT and ensemble SDMs directly in the browser — no local setup required.',
    color: '#007BFF',
  },
  {
    icon: <Map className="w-6 h-6" />,
    title: 'Geospatial Analysis',
    desc: 'Powered by ESRI ArcGIS — map habitat ranges, protected areas, and biodiversity hotspots.',
    color: '#FF7A00',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'GBIF & iNaturalist Integration',
    desc: 'Pull occurrence records from global biodiversity databases in real time.',
    color: '#007BFF',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Statistical Reporting',
    desc: 'R-powered statistical pipelines with publication-ready charts and exports.',
    color: '#FF7A00',
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: 'IUCN Red List & WorldClim',
    desc: 'Integrate threat status data and climate variables into every analysis.',
    color: '#007BFF',
  },
  {
    icon: <Cpu className="w-6 h-6" />,
    title: 'AI Research Assistant',
    desc: 'DataWinder AI helps design studies, interpret outputs, and write methods sections.',
    color: '#FF7A00',
  },
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6" style={{ background: 'rgba(0,123,255,0.2)', color: '#60a5fa', border: '1px solid rgba(0,123,255,0.3)' }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            BETA — Closed Trial for Invited Researchers
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Accelerating Insights.<br />
            <span style={{ color: BRAND.orange }}>Driving Innovation.</span>
          </h1>
          <p className="text-xl mb-3 max-w-3xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
            DataWinder is a scientific research platform unifying species distribution modelling, geospatial analysis, and biodiversity data — all in one browser-based environment.
          </p>
          <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Powered by SynergyFlow Group · Built for the Primate Society of Great Britain &amp; Bangor University
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 rounded-xl font-bold text-lg text-white transition hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: BRAND.blue }}
            >
              Enter DataWinder <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 rounded-xl font-bold text-lg transition hover:opacity-90"
              style={{ border: `2px solid ${BRAND.orange}`, color: BRAND.orange, background: 'transparent' }}
            >
              Explore Features
            </button>
          </div>
        </div>
      </section>

      {/* Beta Info Banner */}
      <section className="py-10 px-6" style={{ background: '#fff', borderBottom: '1px solid #e8eef8' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-lg font-semibold mb-3" style={{ color: BRAND.navy }}>Welcome to DataWinder BETA</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#4a5568' }}>
            This release is part of a closed trial for invited researchers and collaborators, including members of the <strong>Primate Society of Great Britain</strong> and <strong>Bangor University</strong>. You now have full access to all professional features for <strong>14 days</strong>. After the trial, verified undergraduate and postgraduate researchers will retain full access for the duration of their research projects.
          </p>
          <p className="text-sm mt-3" style={{ color: '#4a5568' }}>
            A <strong>Feedback Bot</strong> and <strong>Helper Bot</strong> are available to assist with setup and troubleshooting. Please share your insights — your feedback shapes the next generation of SynergySoft tools.
          </p>
        </div>
      </section>

      {/* Modules */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4" style={{ color: BRAND.navy }}>Research Toolkit</h2>
          <p className="text-center mb-14 text-sm" style={{ color: '#6b7280' }}>Every tool a field or computational biologist needs — integrated and ready to use</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod, i) => (
              <div
                key={i}
                onClick={() => navigate('/dashboard')}
                className="p-6 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 text-left bg-white"
                style={{ border: `2px solid #e8eef8` }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-white" style={{ background: mod.color }}>
                  {mod.icon}
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: BRAND.navy }}>{mod.title}</h3>
                <p className="text-sm" style={{ color: '#6b7280' }}>{mod.desc}</p>
                <div className="flex items-center gap-1 mt-4 text-sm font-semibold" style={{ color: mod.color }}>
                  Explore <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: BRAND.navy }} className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: '9+ Partners', desc: 'Data providers' },
              { label: '14-Day Trial', desc: 'Full feature access' },
              { label: 'BETA', desc: 'Closed research trial' },
              { label: 'WCAG AA', desc: 'Accessibility compliant' },
            ].map((s, i) => (
              <div key={i} className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div className="text-2xl font-bold mb-1" style={{ color: BRAND.orange }}>{s.label}</div>
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <FlaskConical className="w-12 h-12 mx-auto mb-6" style={{ color: BRAND.blue }} />
          <h2 className="text-4xl font-bold mb-6" style={{ color: BRAND.navy }}>Built for Researchers, by Researchers</h2>
          <p className="text-base leading-relaxed mb-6" style={{ color: '#4a5568' }}>
            DataWinder was conceived within the SynergyFlow Group ecosystem to eliminate the fragmentation of scientific workflows. Instead of juggling R scripts, ArcGIS licenses, GBIF API keys, and iNaturalist exports separately — DataWinder brings them together into a single, collaborative, browser-native research environment.
          </p>
          <p className="text-sm" style={{ color: '#9ca3af' }}>
            Part of the SynergySoft research tools suite · Powered by SynergyFlow Group
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6" style={{ background: `linear-gradient(135deg, ${BRAND.navy}, #0d2952)` }}>
        <div className="max-w-4xl mx-auto text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-6" style={{ color: BRAND.orange }} />
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Begin Your Research?</h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Log in with your invited credentials to access the full DataWinder platform.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-10 py-4 rounded-xl font-bold text-lg text-white transition hover:opacity-90 inline-flex items-center gap-2"
            style={{ background: BRAND.orange }}
          >
            Enter DataWinder <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}