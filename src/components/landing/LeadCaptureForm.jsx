import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function LeadCaptureForm({ demoType, onSubmitted }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [portfolioSize, setPortfolioSize] = useState('');
  const [currentSoftware, setCurrentSoftware] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await base44.functions.invoke('captureMarketingLead', {
        name, email, phone, company,
        portfolio_size: portfolioSize,
        current_software: currentSoftware,
        demo_type: demoType || 'none',
      });
      onSubmitted?.();
    } catch (err) {
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-center text-white mb-8">
        <h2 className="text-3xl font-bold mb-2">Get Early Access</h2>
        <p className="text-white/70">
          We'll set up your environment within 1 business day. 30-day free trial — no card needed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="James Harrison"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="james@yourcompany.co.uk"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="07700 900000"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
            <input
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="Harrison Property Management"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Portfolio Size</label>
            <select
              value={portfolioSize}
              onChange={e => setPortfolioSize(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="">Select...</option>
              <option>1–10 units</option>
              <option>11–50 units</option>
              <option>51–150 units</option>
              <option>151–500 units</option>
              <option>500+ units</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Software</label>
            <input
              value={currentSoftware}
              onChange={e => setCurrentSoftware(e.target.value)}
              placeholder="e.g. Reapit, Jupix, Spreadsheets"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full py-4 text-lg bg-primary"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
          ) : (
            'Request Early Access →'
          )}
        </Button>

        <p className="text-xs text-center text-slate-400">
          By submitting you agree to be contacted by the Premiso team. We respect your privacy.
        </p>
      </form>
    </div>
  );
}