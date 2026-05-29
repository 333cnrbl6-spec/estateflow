import React from 'react';

export default function FooterSection() {
  return (
    <footer style={{ background: '#0A1E3F' }} className="text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #007BFF, #0A1E3F)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>Premiso</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Modern property management for agents, landlords, and operational teams who need clarity, compliance, and efficiency.
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Powered by SynergyFlow Group</p>
            <div className="mt-5 space-y-1 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <p>📧 hello@premiso.co.uk</p>
              <p>🏢 London, United Kingdom</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: '#007BFF' }}>Who It's For</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {['Buy-to-Let Landlords', 'Letting Agents', 'Block Management Companies', 'Freeholders', 'Property Investors', 'Sales & Estate Agents', 'Contractors'].map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: '#007BFF' }}>Platform</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {['Features', 'Pricing', 'Help & Support', 'BETA Feedback', 'Privacy Policy', 'Terms & Conditions'].map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)' }}>
          <p>© 2026 SynergyFlow Group. Premiso is a registered trademark. All rights reserved.</p>
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