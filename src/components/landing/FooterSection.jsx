import React from 'react';

export default function FooterSection() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            {/* TODO: Replace with final Premiso branding before launch */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold">Premiso</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The all-in-one property management platform built for modern letting agents
              and block managers in the UK.
            </p>
            <div className="mt-6 space-y-1 text-sm text-slate-500">
              {/* TODO: Replace all contact details before launch */}
              <p>📧 hello@premiso.co.uk <span className="text-xs">(placeholder)</span></p>
              <p>📞 0800 000 0000 <span className="text-xs">(placeholder)</span></p>
              <p>🏢 London, United Kingdom <span className="text-xs">(placeholder)</span></p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-slate-200">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Portfolio Management</li>
              <li>Compliance Hub</li>
              <li>Financial Management</li>
              <li>Maintenance Workflow</li>
              <li>Document Automation</li>
              <li>Sales CRM</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-slate-200">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>About Us <span className="text-xs text-slate-600">(coming soon)</span></li>
              <li>Pricing</li>
              <li>Case Studies <span className="text-xs text-slate-600">(coming soon)</span></li>
              <li>Blog <span className="text-xs text-slate-600">(coming soon)</span></li>
              <li>Contact</li>
              <li>Privacy Policy <span className="text-xs text-slate-600">(add before launch)</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© 2025 Premiso Ltd. All rights reserved. <span className="text-xs">(TODO: Confirm legal entity name)</span></p>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}