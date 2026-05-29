import React, { useState, useEffect } from 'react';

export default function TermsAcceptModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('premiso_terms_accepted');
    if (!accepted) setOpen(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('premiso_terms_accepted', 'true');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(10,30,63,0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
        <div className="p-6 border-b" style={{ background: '#0A1E3F', borderRadius: '1rem 1rem 0 0' }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#007BFF' }}>
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="text-white font-bold text-lg">Premiso BETA</span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Terms & Conditions — Please read before continuing</p>
        </div>

        <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-700 space-y-4 leading-relaxed">
          <p>This is a <strong>BETA environment</strong>. Availability and support are not guaranteed. <strong>SynergyFlow Group</strong> accepts no liability for data loss or service interruption.</p>
          <p>This platform does not provide legal or regulatory advice. Users are responsible for verifying all outputs and ensuring compliance with relevant laws, regulations, and professional standards.</p>
          <p>By continuing, you agree to use this platform responsibly and within the limits of your professional knowledge.</p>
          <p className="text-xs text-slate-400">Welcome to Premiso BETA. You now have full access to all professional features for 14 days. BETA testers may request an extension if additional time is required.</p>
        </div>

        <div className="p-6 border-t">
          <button
            onClick={handleAccept}
            className="w-full py-3 rounded-xl font-bold text-white transition hover:opacity-90"
            style={{ background: '#007BFF' }}
          >
            I Accept — Enter Premiso
          </button>
        </div>
      </div>
    </div>
  );
}