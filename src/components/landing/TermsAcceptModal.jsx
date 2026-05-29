import React, { useState, useEffect } from 'react';

export default function TermsAcceptModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('datawinder_terms_accepted');
    if (!accepted) setOpen(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('datawinder_terms_accepted', 'true');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(10,30,63,0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
        {/* Header */}
        <div className="p-6 border-b" style={{ background: '#0A1E3F', borderRadius: '1rem 1rem 0 0' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#007BFF' }}>
              <span className="text-white font-bold text-xs">DW</span>
            </div>
            <span className="text-white font-bold text-lg">DataWinder BETA</span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Terms &amp; Conditions — Please read before continuing</p>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-700 space-y-4">
          <p>
            By using <strong>DataWinder</strong>, you acknowledge that this is a <strong>BETA test environment</strong> hosted on the BASE44 platform. Availability and support are not guaranteed, and <strong>SynergyFlow Group</strong> accepts no liability for data loss or service interruption.
          </p>
          <p>
            You also agree to the terms of use of the following integrated research platforms and data providers:
          </p>
          <ul className="space-y-1 pl-4">
            {['ESRI ArcGIS', 'MAXENT', 'R Project for Statistical Computing', 'IUCN Red List of Threatened Species', 'GBIF', 'iNaturalist', 'WorldClim', 'AquaMaps', 'eBird'].map(p => (
              <li key={p} className="flex items-center gap-2">
                <span style={{ color: '#FF7A00', fontWeight: 700 }}>•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p>
            These partners permit <strong>academic and non-commercial use</strong> of their software and datasets. By continuing, you accept their respective terms either jointly or individually.
          </p>
          <p className="text-xs text-slate-500">
            This platform is part of a closed trial for invited researchers and collaborators, including members of the <strong>Primate Society of Great Britain</strong> and <strong>Bangor University</strong>.
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAccept}
            className="flex-1 py-3 rounded-xl font-bold text-white transition hover:opacity-90"
            style={{ background: '#007BFF' }}
          >
            I Accept — Enter DataWinder
          </button>
        </div>
      </div>
    </div>
  );
}