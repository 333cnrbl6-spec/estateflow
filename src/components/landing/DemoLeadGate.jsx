/**
 * DemoLeadGate
 * Shown BEFORE the demo environment is revealed.
 * Captures name, email, phone, consent — stores enriched lead with all
 * Companies House intelligence gathered so far. Returns a short-lived
 * demo session token on success.
 */
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, ShieldCheck, Eye } from 'lucide-react';

export default function DemoLeadGate({ chData, portfolioData, onGranted }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError('Name and email are required.'); return; }
    if (!consent) { setError('Please accept the terms to continue.'); return; }

    setSubmitting(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('captureMarketingLead', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: chData?.company?.company_name || '',
        company_number: chData?.company?.company_number || '',
        portfolio_size: portfolioData?.portfolioSize || '',
        property_types: (portfolioData?.propertyTypes || []).join(', '),
        pain_points: (portfolioData?.painPoints || []).join(', '),
        current_software: portfolioData?.currentSoftware || '',
        demo_type: 'personalised',
        consent_given: true,
        marketing_consent: marketing,
        consent_timestamp: new Date().toISOString(),
        demo_intelligence: {
          primary_company: chData?.company || null,
          all_companies: chData?.allCompanies || [],
          officers: chData?.officers || [],
          associated_companies: chData?.selectedAssociated || [],
          portfolio_size: portfolioData?.portfolioSize || '',
          property_types: portfolioData?.propertyTypes || [],
          pain_points: portfolioData?.painPoints || [],
          files_uploaded: portfolioData?.filesUploaded || [],
          captured_at: new Date().toISOString(),
        },
      });

      if (res.data?.leadId) {
        // Issue a 48h demo token stored in localStorage
        const token = {
          leadId: res.data.leadId,
          email: email.trim(),
          company: chData?.company?.company_name || '',
          expiresAt: Date.now() + 48 * 60 * 60 * 1000,
        };
        localStorage.setItem('premiso_demo_token', JSON.stringify(token));
        onGranted?.({ ...token, name: name.trim() });
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white border-2 rounded-2xl p-8 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Access Your Personalised Demo</h3>
            <p className="text-sm text-slate-500">Just your details — we'll unlock it instantly.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="James Harrison"
                className="w-full px-3 py-2.5 border-2 rounded-xl text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Work Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="james@company.co.uk"
                className="w-full px-3 py-2.5 border-2 rounded-xl text-sm focus:border-primary focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Phone (optional)</label>
            <input value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="07700 900000"
              className="w-full px-3 py-2.5 border-2 rounded-xl text-sm focus:border-primary focus:outline-none" />
          </div>

          {/* Consent */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3 border">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-primary shrink-0" />
              <span className="text-xs text-slate-600">
                <strong className="text-slate-800">I agree to the Terms of Use and Privacy Policy.</strong>{' '}
                I understand this demo is for evaluation purposes only. Premiso retains full ownership of the platform, all data generated, and all intellectual property. Unauthorised reproduction or commercial use is strictly prohibited. *
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-primary shrink-0" />
              <span className="text-xs text-slate-600">
                I'm happy for Premiso to contact me with relevant product updates, offers and property industry insights. (Optional)
              </span>
            </label>
          </div>

          <Button type="submit" disabled={submitting || !consent}
            className="w-full py-3 bg-primary text-white font-bold text-base">
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Unlocking...</>
            ) : (
              <><Lock className="w-4 h-4 mr-2" /> Unlock My Demo</>
            )}
          </Button>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> GDPR compliant</span>
            <span>·</span>
            <span>48-hour demo access</span>
            <span>·</span>
            <span>No card required</span>
          </div>
        </form>
      </div>
    </div>
  );
}