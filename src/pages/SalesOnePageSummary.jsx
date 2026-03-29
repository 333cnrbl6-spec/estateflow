import React from 'react';

// Single A4 page - designed to print in one page, fold as a leave-behind
export default function SalesOnePageSummary() {
  const handlePrint = () => {
    document.title = 'EstateFlow-One-Pager-2026';
    window.print();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');

        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .sheet { width: 794px; height: 1123px; overflow: hidden; }
        }

        .sheet {
          font-family: 'Inter', sans-serif;
          width: 794px;
          margin: 0 auto;
          background: white;
          display: flex;
          flex-direction: column;
        }

        .top-bar {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f4c81 100%);
          padding: 28px 40px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .top-logo { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; }
        .top-logo span { color: #38bdf8; }
        .top-tagline { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #94a3b8; margin-top: 3px; }
        .top-right { text-align: right; font-size: 12px; color: #94a3b8; line-height: 1.7; }

        .hero {
          background: #f8fafc;
          padding: 28px 40px 24px;
          border-bottom: 2px solid #0f4c81;
        }
        .hero-eyebrow { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #0ea5e9; font-weight: 600; margin-bottom: 8px; }
        .hero-h1 { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; color: #0f172a; line-height: 1.2; margin-bottom: 10px; }
        .hero-h1 span { color: #0f4c81; }
        .hero-desc { font-size: 12px; color: #475569; line-height: 1.7; max-width: 560px; }

        .stats-row {
          display: flex;
          background: #0f172a;
          color: white;
        }
        .stat-box { flex: 1; padding: 14px; text-align: center; border-right: 1px solid rgba(255,255,255,0.08); }
        .stat-box:last-child { border: none; }
        .stat-n { font-size: 22px; font-weight: 700; color: #38bdf8; }
        .stat-l { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }

        .main-content { flex: 1; padding: 20px 40px; display: flex; gap: 24px; }
        .col-left { flex: 1.2; }
        .col-right { flex: 0.8; }

        .content-section { margin-bottom: 18px; }
        .cs-title { font-size: 10px; font-weight: 700; color: #0f4c81; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
        
        .module-list { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
        .module-item { font-size: 11px; color: #475569; display: flex; align-items: center; gap: 6px; padding: 3px 0; }
        .module-item::before { content: ''; width: 6px; height: 6px; background: #0ea5e9; border-radius: 50%; flex-shrink: 0; }

        .compliance-list { }
        .compliance-item { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
        .compliance-name { color: #0f172a; font-weight: 500; }
        .compliance-tag { font-size: 9px; font-weight: 600; padding: 2px 7px; border-radius: 10px; }
        .tag-green { background: #dcfce7; color: #166534; }
        .tag-blue { background: #dbeafe; color: #1e40af; }

        .benefit-items { }
        .benefit-item { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 9px; }
        .benefit-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
        .benefit-text { font-size: 11px; color: #475569; line-height: 1.5; }
        .benefit-text strong { color: #0f172a; }

        .pricing-mini { margin-bottom: 18px; }
        .pricing-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 10px; border-radius: 7px; margin-bottom: 5px; font-size: 12px; }
        .pr-basic { background: #f8fafc; border: 1px solid #e2e8f0; }
        .pr-pro { background: #eff6ff; border: 1px solid #bfdbfe; }
        .pr-ent { background: #fafafa; border: 1px solid #e2e8f0; }
        .pr-name { font-weight: 600; color: #0f172a; }
        .pr-units { font-size: 10px; color: #64748b; }
        .pr-price { font-weight: 700; color: #0f4c81; }

        .ooh-box { background: #fef9c3; border: 1px solid #fde047; border-radius: 8px; padding: 12px; margin-bottom: 18px; }
        .ooh-title { font-size: 10px; font-weight: 700; color: '#92400e'; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; color: #92400e; }
        .ooh-tiers { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
        .ooh-tier { font-size: 11px; color: #78350f; display: flex; justify-content: space-between; }

        .partner-box { background: linear-gradient(135deg, #0f172a, #1e3a5f); color: white; border-radius: 8px; padding: 14px; margin-bottom: 18px; }
        .partner-title { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #38bdf8; margin-bottom: 6px; }
        .partner-desc { font-size: 11px; color: #cbd5e1; line-height: 1.6; }
        .partner-highlight { font-size: 16px; font-weight: 700; color: #38bdf8; margin: 6px 0; }

        .cta-bar {
          background: linear-gradient(135deg, #0f172a, #0f4c81);
          padding: 18px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }
        .cta-left { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 700; }
        .cta-left span { color: #38bdf8; }
        .cta-contacts { display: flex; gap: 28px; }
        .cta-contact { font-size: 11px; text-align: center; }
        .cta-contact-label { color: #64748b; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; }
        .cta-contact-value { color: white; font-weight: 500; margin-top: 2px; }

        /* PDF TOOLBAR */
        .pdf-toolbar {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          z-index: 999; background: #0f172a; color: white; border: none;
          border-radius: 50px; padding: 6px 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          display: flex; align-items: center; gap: 6px;
          font-family: 'Inter', sans-serif;
        }
        .pdf-toolbar-label { font-size: 12px; color: #94a3b8; padding: 0 10px 0 6px; font-weight: 500; white-space: nowrap; }
        .pdf-btn { border: none; border-radius: 40px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Inter', sans-serif; white-space: nowrap; }
        .pdf-btn-print { background: #1e40af; color: white; }
        .pdf-btn-print:hover { background: #1d4ed8; }
        .pdf-btn-pdf { background: #0ea5e9; color: white; }
        .pdf-btn-pdf:hover { background: #0284c7; }
      `}</style>

      {/* PDF Toolbar */}
      <div className="pdf-toolbar no-print">
        <span className="pdf-toolbar-label">One-Page Summary</span>
        <button className="pdf-btn pdf-btn-print" onClick={handlePrint}>🖨️ Print</button>
        <button className="pdf-btn pdf-btn-pdf" onClick={handlePrint}>⬇ Save as PDF</button>
      </div>

      <div className="sheet">
        {/* TOP BAR */}
        <div className="top-bar">
          <div>
            <div className="top-logo">Estate<span>Flow</span></div>
            <div className="top-tagline">Property Management Platform</div>
          </div>
          <div className="top-right">
            <div>RBM (North West) Limited</div>
            <div>01204 695919 · info@rbm-nw.co.uk</div>
            <div style={{ color: '#38bdf8', fontWeight: 600 }}>Authorised Sales Partner</div>
          </div>
        </div>

        {/* HERO */}
        <div className="hero">
          <div className="hero-eyebrow">For Letting Agents, Block Managers, HMO Landlords & Property Companies</div>
          <h1 className="hero-h1">The Complete UK Property<br /><span>Management Platform — Lettings to Blocks.</span></h1>
          <p className="hero-desc">EstateFlow covers the full spectrum of residential property management — ASTs, HMOs, leasehold blocks, RTM companies, and multi-company groups — with built-in compliance, financials, maintenance, CRM, and a 24/7 out-of-hours call service available as a standalone add-on for any portfolio.</p>
        </div>

        {/* STATS ROW */}
        <div className="stats-row">
          {[
            { n: '14', l: 'Integrated Modules' },
            { n: '100%', l: 'UK Law Compliant' },
            { n: '24/7', l: 'Emergency Callout' },
            { n: '<2wk', l: 'Go Live' },
            { n: '£0', l: 'Data Migration Cost' },
            { n: '20%', l: 'Partner Commission' },
          ].map((s, i) => (
            <div key={i} className="stat-box">
              <div className="stat-n">{s.n}</div>
              <div className="stat-l">{s.l}</div>
            </div>
          ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="main-content">
          <div className="col-left">
            {/* Modules */}
            <div className="content-section">
              <div className="cs-title">Full Platform — Lettings, Blocks & Operations</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 4 }}>
                {[
                  { label: 'LETTINGS', color: '#dbeafe', text: '#1e40af', items: ['Tenancy Pipeline', 'HMO Licensing', 'Right to Rent', 'Deposit Mgmt', 'S21/S8 Notices'] },
                  { label: 'BLOCK', color: '#dcfce7', text: '#166534', items: ['Service Charges', 'Ground Rent', 'RTM Management', 'Leaseholder Portal', 'Building Safety'] },
                  { label: 'OPERATIONS', color: '#fef3c7', text: '#92400e', items: ['Maintenance Orders', 'Out-of-Hours 24/7', 'Banking & Expenses', 'CRM & Workflows', 'Doc Automation'] },
                ].map((col, ci) => (
                  <div key={ci} style={{ border: `1px solid ${col.color}`, borderRadius: 7, overflow: 'hidden' }}>
                    <div style={{ background: col.color, color: col.text, fontSize: 8, fontWeight: 700, padding: '4px 9px', letterSpacing: 1.5, textTransform: 'uppercase' }}>{col.label}</div>
                    <div style={{ padding: '6px 9px' }}>
                      {col.items.map((item, ii) => (
                        <div key={ii} style={{ fontSize: 10, color: '#475569', padding: '2px 0', display: 'flex', gap: 5, alignItems: 'center', borderBottom: '1px solid #f8fafc' }}>
                          <span style={{ color: '#0ea5e9', fontWeight: 700, fontSize: 9 }}>✓</span>{item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>Also includes: Rent Ledger, Compliance Audit, Land Registry, API Integrations, Accounting Sync (QBO/Xero), Tenant Portal, Analytics & Reporting</div>
            </div>

            {/* Compliance */}
            <div className="content-section">
              <div className="cs-title">Regulatory Coverage — Auto-Tracked</div>
              <div className="compliance-list">
                {[
                  { name: 'Gas Safety Certificate (Annual CP12)', tag: 'England & Wales', cls: 'tag-green' },
                  { name: 'EICR Electrical Report (5-Year)', tag: 'England', cls: 'tag-blue' },
                  { name: 'Fire Risk Assessment (RRO 2005)', tag: 'Auto-Alert', cls: 'tag-green' },
                  { name: 'Section 20 Consultation (>£250/unit)', tag: 'Leasehold', cls: 'tag-green' },
                  { name: 'Deposit Registration (30-Day)', tag: 'Auto-Alert', cls: 'tag-green' },
                  { name: 'Right to Rent Check', tag: 'England', cls: 'tag-blue' },
                  { name: 'EPC Rating & MEES Compliance', tag: 'Min E', cls: 'tag-green' },
                  { name: 'Building Safety Act 2023 Register', tag: 'HRRB', cls: 'tag-green' },
                ].map((c, i) => (
                  <div key={i} className="compliance-item">
                    <span className="compliance-name">{c.name}</span>
                    <span className={`compliance-tag ${c.cls}`}>{c.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-right">
            {/* Key Benefits */}
            <div className="content-section">
              <div className="cs-title">Why Clients Switch to EstateFlow</div>
              <div className="benefit-items">
                {[
                  { icon: '🏠', text: '<strong>Lettings & blocks in one system</strong> — manage ASTs, HMOs, leasehold blocks and RTM companies from a single login.' },
                  { icon: '🚨', text: '<strong>Never miss a compliance deadline</strong> — gas certs, EICRs, fire risk assessments, deposit registration and more, all auto-tracked.' },
                  { icon: '💰', text: '<strong>Full financial control</strong> — rent ledger, arrears alerts, service charges, ground rent, banking and accounting sync.' },
                  { icon: '📞', text: '<strong>24/7 out-of-hours service</strong> available standalone — GDPR-logged calls, contractor dispatch, and auto maintenance orders.' },
                  { icon: '⏱️', text: '<strong>Save 8+ hours/week</strong> on admin through workflow automation, bulk document generation, and CRM tools.' },
                ].map((b, i) => (
                  <div key={i} className="benefit-item">
                    <span className="benefit-icon">{b.icon}</span>
                    <span className="benefit-text" dangerouslySetInnerHTML={{ __html: b.text }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="content-section pricing-mini">
              <div className="cs-title">Simple Monthly Pricing</div>
              {[
                { cls: 'pr-basic', name: 'Starter', units: 'Up to 50 units', price: '£149/mo' },
                { cls: 'pr-pro', name: 'Professional ★', units: 'Up to 200 units', price: '£349/mo' },
                { cls: 'pr-ent', name: 'Enterprise', units: 'Unlimited', price: '£749+/mo' },
              ].map((p, i) => (
                <div key={i} className={`pricing-row ${p.cls}`}>
                  <div><div className="pr-name">{p.name}</div><div className="pr-units">{p.units}</div></div>
                  <div className="pr-price">{p.price}</div>
                </div>
              ))}
            </div>

            {/* Out of Hours Add-On */}
            <div className="ooh-box">
              <div className="ooh-title">📞 Out-of-Hours Add-On</div>
              <div className="ooh-tiers">
                <div className="ooh-tier"><span>Basic (Log only)</span><strong>£95/mo</strong></div>
                <div className="ooh-tier"><span>Standard</span><strong>£195/mo</strong></div>
                <div className="ooh-tier"><span>Premium (Dispatch)</span><strong>£295/mo</strong></div>
                <div className="ooh-tier"><span>Enterprise</span><strong>POA</strong></div>
              </div>
            </div>

            {/* Partner Programme */}
            <div className="partner-box">
              <div className="partner-title">🤝 Partner Programme</div>
              <div className="partner-highlight">20% recurring commission</div>
              <div className="partner-desc">Earn on every subscription — for the lifetime of the client. 10 Professional clients = <strong style={{ color: '#38bdf8' }}>£698/month</strong> passive income. No cap.</div>
            </div>
          </div>
        </div>

        {/* CTA BAR */}
        <div className="cta-bar">
          <div className="cta-left">Book a Free Demo<br /><span>See EstateFlow with your own portfolio</span></div>
          <div className="cta-contacts">
            <div className="cta-contact">
              <div className="cta-contact-label">Call</div>
              <div className="cta-contact-value">01204 695919</div>
            </div>
            <div className="cta-contact">
              <div className="cta-contact-label">Email</div>
              <div className="cta-contact-value">info@rbm-nw.co.uk</div>
            </div>
            <div className="cta-contact">
              <div className="cta-contact-label">Company</div>
              <div className="cta-contact-value">No. 16608812</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}