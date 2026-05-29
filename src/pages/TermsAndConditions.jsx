import React from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const BRAND = { navy: '#0A1E3F', blue: '#007BFF', orange: '#FF7A00' };

const sections = [
  {
    title: 'BETA Environment',
    icon: <AlertTriangle className="w-5 h-5" />,
    content: 'This is a BETA environment. Availability and support are not guaranteed. SynergyFlow Group accepts no liability for data loss or service interruption during the BETA period.',
  },
  {
    title: 'No Legal or Regulatory Advice',
    icon: <Shield className="w-5 h-5" />,
    content: 'This platform does not provide legal or regulatory advice. Users are responsible for verifying all outputs and ensuring compliance with relevant laws, regulations, and professional standards applicable to property management in their jurisdiction.',
  },
  {
    title: 'User Responsibilities',
    icon: <CheckCircle className="w-5 h-5" />,
    content: 'By using Premiso, you agree to use the platform responsibly and within the limits of your professional knowledge. You must not use the platform to store, transmit, or process data in violation of any applicable law.',
  },
  {
    title: 'Data & Privacy',
    icon: <Shield className="w-5 h-5" />,
    content: 'SynergyFlow Group processes data in accordance with applicable data protection legislation. During BETA, all data may be subject to review for quality assurance purposes. Do not store sensitive personal data beyond what is necessary for testing purposes.',
  },
  {
    title: 'Intellectual Property',
    icon: <CheckCircle className="w-5 h-5" />,
    content: 'All platform content, design, branding, and technology are the intellectual property of SynergyFlow Group. Premiso is a registered trademark. Unauthorised reproduction or distribution is prohibited.',
  },
  {
    title: 'Service Continuity',
    icon: <AlertTriangle className="w-5 h-5" />,
    content: 'During the BETA period, the platform may be subject to planned or unplanned maintenance. SynergyFlow Group will endeavour to provide reasonable notice of scheduled downtime but cannot guarantee uninterrupted service.',
  },
];

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen p-6" style={{ background: '#f8faff', fontFamily: 'Poppins, Inter, sans-serif' }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: BRAND.navy }}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: BRAND.navy }}>Terms & Conditions</h1>
              <p className="text-xs text-slate-500">Premiso BETA · SynergyFlow Group · Last updated May 2026</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">Please read these terms carefully before using the Premiso platform.</p>
        </div>

        <div className="space-y-4">
          {sections.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-6" style={{ border: '1px solid #e8eef8' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: i % 2 === 0 ? BRAND.blue : BRAND.orange }}>
                  {s.icon}
                </div>
                <h3 className="font-bold text-base" style={{ color: BRAND.navy }}>{s.title}</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#4a5568' }}>{s.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 rounded-xl text-center" style={{ background: BRAND.navy }}>
          <p className="text-sm text-white/80">By continuing to use Premiso, you confirm that you have read, understood, and agree to these Terms & Conditions.</p>
          <p className="text-xs mt-2 text-white/40">© 2026 SynergyFlow Group. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}