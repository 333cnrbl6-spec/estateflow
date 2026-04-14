import React from 'react';

export default function FooterSection() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold">Premiso</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The all-in-one property management platform built for the whole UK property
              industry — landlords, letting agents, freeholders, block managers, sales agents and more.
            </p>
            <div className="mt-6 space-y-1 text-sm text-slate-500">
              <p>📧 hello@premiso.co.uk</p>
              <p>🏢 London, United Kingdom</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-slate-200">Who it's for</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Buy-to-Let Landlords</li>
              <li>Letting Agents</li>
              <li>Block Management Companies</li>
              <li>Freeholders</li>
              <li>Property Investors</li>
              <li>Sales & Estate Agents</li>
              <li>Contractors</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-slate-200">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>About Us</li>
              <li>Pricing</li>
              <li>Case Studies</li>
              <li>Blog</li>
              <li>Contact</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© 2025 Premiso. All rights reserved.</p>
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