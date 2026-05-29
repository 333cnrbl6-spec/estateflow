import React, { useState } from 'react';
import { Search, BookOpen, MessageSquare, Video, ChevronDown, ChevronUp, ExternalLink, LifeBuoy } from 'lucide-react';

const BRAND = { navy: '#0A1E3F', blue: '#007BFF', orange: '#FF7A00' };

const faqs = [
  { q: 'How do I add a new property?', a: 'Navigate to Properties → Add Property. Use the guided wizard to enter address, units, and compliance details. You can also import via CSV from Settings → Bulk Import.' },
  { q: 'How do I track certificate expiry?', a: 'Go to Compliance Hub → Certificates. All expiry dates are tracked automatically with colour-coded alerts. Set reminder preferences under Settings → Notifications.' },
  { q: 'Can tenants access a portal?', a: 'Yes. Navigate to Tenants, select a tenant, and generate a portal access link. Tenants can view their documents, submit maintenance requests, and make payments.' },
  { q: 'How do I run a financial report?', a: 'Go to Financials → Financial Reports. Select date range, properties, and report type. Export to PDF or Excel.' },
  { q: 'How do I assign a contractor to a job?', a: 'Open the maintenance request, click "Assign Contractor", select from your vendor list, and set a scheduled date. The contractor receives an automatic notification.' },
  { q: 'What is the BETA trial period?', a: 'BETA users have full access to all professional features for 14 days. Extensions are available on request. Contact support via the Feedback Bot.' },
];

const guides = [
  { title: 'Getting Started with Premiso', category: 'Onboarding', time: '5 min' },
  { title: 'Setting Up Your Property Portfolio', category: 'Properties', time: '8 min' },
  { title: 'Compliance Certificate Tracking', category: 'Compliance', time: '6 min' },
  { title: 'Tenant Portal Setup Guide', category: 'Tenants', time: '7 min' },
  { title: 'Financial Reporting Walkthrough', category: 'Financials', time: '10 min' },
  { title: 'Maintenance Workflow Management', category: 'Maintenance', time: '8 min' },
];

export default function HelpAndSupport() {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const filteredFaqs = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen p-6" style={{ background: '#f8faff', fontFamily: 'Poppins, Inter, sans-serif' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white" style={{ background: BRAND.blue }}>
            <LifeBuoy className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: BRAND.navy }}>Help & Support</h1>
          <p className="text-sm text-slate-600">Find guides, answers, and contact support for Premiso</p>
        </div>

        {/* Search */}
        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search help articles and FAQs..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: '#e8eef8', fontFamily: 'inherit' }}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: <BookOpen className="w-5 h-5" />, label: 'Documentation', desc: 'Step-by-step guides', color: BRAND.blue },
            { icon: <MessageSquare className="w-5 h-5" />, label: 'Helper Bot', desc: 'AI-powered assistant', color: BRAND.orange },
            { icon: <Video className="w-5 h-5" />, label: 'Video Tutorials', desc: 'Watch and learn', color: BRAND.navy },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-5 cursor-pointer hover:shadow-md transition-all text-center" style={{ border: '1px solid #e8eef8' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mx-auto mb-3" style={{ background: item.color }}>
                {item.icon}
              </div>
              <h3 className="font-bold text-sm mb-1" style={{ color: BRAND.navy }}>{item.label}</h3>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Guides */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: BRAND.navy }}>Popular Guides</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {guides.map((g, i) => (
              <div key={i} className="bg-white rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-all cursor-pointer" style={{ border: '1px solid #e8eef8' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: BRAND.navy }}>{g.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{g.category} · {g.time} read</p>
                </div>
                <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: BRAND.blue }} />
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: BRAND.navy }}>Frequently Asked Questions</h2>
          <div className="space-y-2">
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e8eef8' }}>
                <button
                  className="w-full text-left p-4 flex items-center justify-between font-semibold text-sm hover:bg-slate-50 transition-colors"
                  style={{ color: BRAND.navy }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  {openFaq === i ? <ChevronUp className="w-4 h-4 flex-shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t" style={{ borderColor: '#f1f5f9' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}