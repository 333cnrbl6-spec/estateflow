import React from 'react';

export default function FooterSection() {
  return (
    <footer style={{ background: '#0A1E3F' }} className="text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #007BFF, #0A1E3F)' }}>
                <span className="text-white font-bold text-sm">DW</span>
              </div>
              <div>
                <span className="text-xl font-bold" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>DataWinder</span>
                <span className="text-xs ml-2 text-white/50">BETA</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Accelerating Insights. Driving Innovation.
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Powered by SynergyFlow Group
            </p>
            <div className="mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <p>A closed BETA test platform hosted on BASE44</p>
              <p className="mt-1">For invited researchers &amp; collaborators</p>
            </div>
          </div>

          {/* Credits */}
          <div id="credits">
            <h4 className="font-semibold mb-4" style={{ color: '#007BFF' }}>Data Partners &amp; Credits</h4>
            <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
              DataWinder acknowledges the generous support and open-data access provided by:
            </p>
            <ul className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {['ESRI ArcGIS', 'MAXENT', 'R Project for Statistical Computing', 'IUCN Red List of Threatened Species', 'GBIF', 'iNaturalist', 'WorldClim', 'AquaMaps', 'eBird'].map(p => (
                <li key={p} className="flex items-center gap-1">
                  <span style={{ color: '#FF7A00' }}>•</span> {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: '#007BFF' }}>Platform</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <li>Primate Society of Great Britain</li>
              <li>Bangor University Collaboration</li>
              <li>SynergyFlow Group</li>
              <li>Research Portal</li>
              <li>Feedback Bot</li>
              <li>Helper Bot</li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
          <p>© 2026 SynergyFlow Group. DataWinder is a BETA platform. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
            <span>BETA Disclaimer</span>
          </div>
        </div>
      </div>
    </footer>
  );
}