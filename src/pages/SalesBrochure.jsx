import React from 'react';

// Print-optimised full product brochure for RBM partner sales
export default function SalesBrochure() {
  const handlePrint = () => {
    document.title = 'EstateFlow-Sales-Brochure-2026';
    window.print();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');

        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }

        .brochure-body {
          font-family: 'Inter', sans-serif;
          color: #1a1a2e;
          max-width: 794px;
          margin: 0 auto;
          background: white;
        }

        /* COVER PAGE */
        .cover {
          height: 100vh;
          min-height: 1123px;
          background: linear-gradient(145deg, #0f172a 0%, #1e3a5f 40%, #0f4c81 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 64px 56px;
          color: white;
          position: relative;
          overflow: hidden;
        }
        .cover::before {
          content: '';
          position: absolute;
          top: -200px; right: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
          border-radius: 50%;
        }
        .cover::after {
          content: '';
          position: absolute;
          bottom: -100px; left: -100px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%);
          border-radius: 50%;
        }
        .cover-logo { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
        .cover-logo span { color: #38bdf8; }
        .cover-tagline { font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: #94a3b8; margin-top: 6px; }
        .cover-main { flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .cover-eyebrow { font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #38bdf8; margin-bottom: 20px; }
        .cover-h1 { font-family: 'Playfair Display', serif; font-size: 56px; font-weight: 700; line-height: 1.1; margin-bottom: 28px; }
        .cover-h1 span { color: #38bdf8; }
        .cover-desc { font-size: 18px; line-height: 1.7; color: #cbd5e1; max-width: 520px; margin-bottom: 48px; }
        .cover-stats { display: flex; gap: 40px; }
        .cover-stat-num { font-size: 36px; font-weight: 700; color: #38bdf8; }
        .cover-stat-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
        .cover-footer { display: flex; justify-content: space-between; align-items: flex-end; }
        .cover-footer-left { font-size: 12px; color: #64748b; }
        .cover-date { font-size: 11px; color: #64748b; }

        /* SECTION PAGES */
        .page {
          min-height: 1123px;
          padding: 56px;
          background: white;
          display: flex;
          flex-direction: column;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #0f4c81;
          margin-bottom: 40px;
        }
        .page-logo { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #0f4c81; }
        .page-logo span { color: #38bdf8; }
        .page-num { font-size: 11px; color: #94a3b8; letter-spacing: 2px; }
        .section-eyebrow { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #0ea5e9; font-weight: 600; margin-bottom: 12px; }
        .section-h2 { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: #0f172a; line-height: 1.2; margin-bottom: 20px; }
        .section-desc { font-size: 15px; line-height: 1.8; color: #475569; margin-bottom: 36px; }

        /* FEATURE GRID */
        .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }
        .feature-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          background: #f8fafc;
        }
        .feature-icon-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .feature-icon { width: 40px; height: 40px; border-radius: 10px; background: #0f4c81; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; flex-shrink: 0; }
        .feature-title { font-size: 15px; font-weight: 600; color: #0f172a; }
        .feature-desc { font-size: 12px; color: #64748b; line-height: 1.6; margin-bottom: 14px; }
        .feature-bullets { list-style: none; padding: 0; margin: 0; }
        .feature-bullets li { font-size: 12px; color: #475569; padding: 3px 0; display: flex; align-items: flex-start; gap: 8px; }
        .feature-bullets li::before { content: '✓'; color: #0ea5e9; font-weight: 700; flex-shrink: 0; margin-top: 1px; }

        /* STATS STRIP */
        .stats-strip {
          background: linear-gradient(135deg, #0f172a, #1e3a5f);
          border-radius: 12px;
          padding: 32px;
          display: flex;
          justify-content: space-around;
          color: white;
          margin-bottom: 32px;
        }
        .stat-item { text-align: center; }
        .stat-num { font-size: 32px; font-weight: 700; color: #38bdf8; }
        .stat-unit { font-size: 14px; font-weight: 600; color: #38bdf8; }
        .stat-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }

        /* COMPLIANCE TABLE */
        .compliance-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px; }
        .compliance-table th { background: #0f172a; color: white; padding: 12px 16px; text-align: left; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
        .compliance-table td { padding: 10px 16px; border-bottom: 1px solid #e2e8f0; color: #475569; }
        .compliance-table tr:nth-child(even) td { background: #f8fafc; }
        .badge-green { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }
        .badge-amber { background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }
        .badge-blue { background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }

        /* PRICING */
        .pricing-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 32px; }
        .pricing-card { border: 2px solid #e2e8f0; border-radius: 14px; padding: 28px 24px; position: relative; }
        .pricing-card.featured { border-color: #0f4c81; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); }
        .pricing-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #0f4c81; color: white; font-size: 10px; font-weight: 700; padding: 4px 14px; border-radius: 20px; letter-spacing: 1px; text-transform: uppercase; white-space: nowrap; }
        .pricing-tier { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
        .pricing-price { font-size: 34px; font-weight: 700; color: #0f172a; }
        .pricing-price span { font-size: 14px; color: #64748b; font-weight: 400; }
        .pricing-desc { font-size: 12px; color: #64748b; margin: 10px 0 16px; line-height: 1.5; }
        .pricing-features { list-style: none; padding: 0; margin: 0; }
        .pricing-features li { font-size: 12px; color: #475569; padding: 5px 0; display: flex; align-items: flex-start; gap: 8px; border-bottom: 1px solid #e2e8f0; }
        .pricing-features li:last-child { border: none; }
        .pricing-features li::before { content: '✓'; color: #0ea5e9; font-weight: 700; flex-shrink: 0; }

        /* CTA PAGE */
        .cta-page {
          min-height: 1123px;
          background: linear-gradient(145deg, #0f172a 0%, #1e3a5f 50%, #0f4c81 100%);
          padding: 56px;
          display: flex;
          flex-direction: column;
          color: white;
        }
        .cta-main { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
        .cta-h2 { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 700; line-height: 1.2; margin-bottom: 24px; }
        .cta-h2 span { color: #38bdf8; }
        .cta-desc { font-size: 16px; line-height: 1.8; color: #cbd5e1; max-width: 520px; margin-bottom: 48px; }
        .cta-contact-box { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 40px; width: 100%; max-width: 480px; }
        .cta-contact-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
        .cta-contact-icon { width: 40px; height: 40px; background: rgba(56, 189, 248, 0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .cta-contact-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
        .cta-contact-value { font-size: 15px; font-weight: 500; color: white; }
        .cta-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: #64748b; }

        /* PDF TOOLBAR */
        .pdf-toolbar {
          position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
          z-index: 999; background: #0f172a; color: white; border: none;
          border-radius: 50px; padding: 6px 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          display: flex; align-items: center; gap: 6px;
          font-family: 'Inter', sans-serif;
        }
        .pdf-toolbar-label {
          font-size: 12px; color: #94a3b8; padding: 0 10px 0 6px;
          font-weight: 500; white-space: nowrap;
        }
        .pdf-btn {
          border: none; border-radius: 40px; padding: 10px 22px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 7px;
          font-family: 'Inter', sans-serif; white-space: nowrap;
        }
        .pdf-btn-print { background: #1e40af; color: white; }
        .pdf-btn-print:hover { background: #1d4ed8; }
        .pdf-btn-pdf { background: #0ea5e9; color: white; }
        .pdf-btn-pdf:hover { background: #0284c7; }

        /* QUOTE BLOCK */
        .quote-block { background: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 24px 0; }
        .quote-text { font-size: 15px; font-style: italic; color: #1e40af; line-height: 1.7; margin-bottom: 8px; }
        .quote-attr { font-size: 12px; color: #64748b; font-weight: 500; }

        /* TIMELINE */
        .timeline { position: relative; padding-left: 24px; }
        .timeline::before { content: ''; position: absolute; left: 8px; top: 0; bottom: 0; width: 2px; background: #e2e8f0; }
        .timeline-item { position: relative; padding-bottom: 24px; }
        .timeline-dot { position: absolute; left: -20px; top: 4px; width: 12px; height: 12px; background: #0f4c81; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px #0f4c81; }
        .timeline-label { font-size: 11px; color: #0ea5e9; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .timeline-title { font-size: 14px; font-weight: 600; color: #0f172a; margin: 4px 0; }
        .timeline-desc { font-size: 12px; color: #64748b; line-height: 1.5; }

        /* HORIZONTAL RULE */
        hr { border: none; border-top: 1px solid #e2e8f0; margin: 32px 0; }

        /* PROCESS STEPS */
        .process-steps { display: flex; gap: 0; margin: 32px 0; }
        .process-step { flex: 1; text-align: center; position: relative; }
        .process-step:not(:last-child)::after { content: '→'; position: absolute; right: -8px; top: 20px; color: #0ea5e9; font-size: 18px; font-weight: 700; }
        .process-num { width: 44px; height: 44px; background: #0f4c81; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 16px; margin: 0 auto 10px; }
        .process-label { font-size: 12px; font-weight: 600; color: #0f172a; }
        .process-sub { font-size: 11px; color: #64748b; margin-top: 4px; line-height: 1.4; }
      `}</style>

      {/* PDF Toolbar */}
      <div className="pdf-toolbar no-print">
        <span className="pdf-toolbar-label">EstateFlow Brochure</span>
        <button className="pdf-btn pdf-btn-print" onClick={handlePrint}>
          🖨️ Print
        </button>
        <button className="pdf-btn pdf-btn-pdf" onClick={handlePrint}>
          ⬇ Save as PDF
        </button>
      </div>

      <div className="brochure-body">

        {/* ===== COVER PAGE ===== */}
        <div className="cover page-break">
          <div>
            <div className="cover-logo">Estate<span>Flow</span></div>
            <div className="cover-tagline">Property Management Platform</div>
          </div>

          <div className="cover-main">
            <div className="cover-eyebrow">Partner Sales Brochure · 2026</div>
            <h1 className="cover-h1">
              The Complete Platform for<br />
              <span>Modern Property</span><br />
              Management
            </h1>
            <p className="cover-desc">
              Powerful, compliant, and beautifully designed — EstateFlow unifies the complete spectrum of residential property management: lettings, block management, HMOs, compliance, finance, and a standalone 24/7 out-of-hours call service. One platform. Every workflow.
            </p>
            <div className="cover-stats">
              <div>
                <div className="cover-stat-num">100+</div>
                <div className="cover-stat-label">Units Managed</div>
              </div>
              <div>
                <div className="cover-stat-num">14</div>
                <div className="cover-stat-label">Modules</div>
              </div>
              <div>
                <div className="cover-stat-num">24/7</div>
                <div className="cover-stat-label">Out-of-Hours</div>
              </div>
              <div>
                <div className="cover-stat-num">100%</div>
                <div className="cover-stat-label">UK Compliant</div>
              </div>
            </div>
          </div>

          <div className="cover-footer">
            <div className="cover-footer-left">
              <div style={{ fontWeight: 600, fontSize: 14 }}>RBM (North West) Limited</div>
              <div>29 Lee Lane, Horwich, Bolton, BL6 7AY</div>
              <div>01204 695919 · info@rbm-nw.co.uk</div>
            </div>
            <div className="cover-date">© 2026 EstateFlow · Confidential</div>
          </div>
        </div>

        {/* ===== PAGE 2: THE PROBLEM & OUR SOLUTION ===== */}
        <div className="page page-break">
          <div className="page-header">
            <div className="page-logo">Estate<span>Flow</span></div>
            <div className="page-num">THE OPPORTUNITY · 02</div>
          </div>

          <div className="section-eyebrow">The Market Problem</div>
          <h2 className="section-h2">Property Management Has Never<br />Been More Complex</h2>
          <p className="section-desc">
            Whether you manage ASTs, HMOs, leasehold blocks, or a mixed residential portfolio, 2026 brings unprecedented regulatory pressure. The Renters' Rights Bill, Building Safety Act 2023, Leasehold & Freehold Reform Act 2024, and 24/7 tenant expectations mean the manual, spreadsheet-based approach is no longer an option — for lettings agents or block managers alike.
          </p>

          <div className="feature-grid avoid-break">
            <div className="feature-card">
              <div className="feature-icon-row">
                <div className="feature-icon">⚠️</div>
                <div className="feature-title">Compliance Risk</div>
              </div>
              <p className="feature-desc">45% of residential blocks miss at least one certificate deadline per year, exposing managing agents to fines and liability.</p>
              <ul className="feature-bullets">
                <li>Gas safety certificates expire unnoticed</li>
                <li>EICR 5-year cycles not tracked centrally</li>
                <li>Fire risk assessment overdue alerts missed</li>
                <li>Section 20 consultation deadlines breached</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon-row">
                <div className="feature-icon">💸</div>
                <div className="feature-title">Financial Leakage</div>
              </div>
              <p className="feature-desc">Manual processes cost property managers an estimated £4,000–£12,000 per year in administrative overhead per 50-unit block.</p>
              <ul className="feature-bullets">
                <li>Service charges not billed accurately</li>
                <li>Arrears spotted weeks late</li>
                <li>Contractor invoices not matched to orders</li>
                <li>No clear reserve fund visibility</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon-row">
                <div className="feature-icon">📞</div>
                <div className="feature-title">Out-of-Hours Chaos</div>
              </div>
              <p className="feature-desc">Emergency callouts handled informally via personal mobile phones — no audit trail, no GDPR compliance, no structured escalation.</p>
              <ul className="feature-bullets">
                <li>No log of who called and when</li>
                <li>No record of contractor dispatched</li>
                <li>No evidence of response times</li>
                <li>No automated maintenance order creation</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon-row">
                <div className="feature-icon">📂</div>
                <div className="feature-title">Document Chaos</div>
              </div>
              <p className="feature-desc">Documents stored across email inboxes, shared drives, and filing cabinets — often inaccessible when needed most.</p>
              <ul className="feature-bullets">
                <li>Lease documents not centrally accessible</li>
                <li>No version control on templates</li>
                <li>Leaseholders cannot self-serve documents</li>
                <li>Bulk generation takes days not minutes</li>
              </ul>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #f0f9ff, #dbeafe)', borderRadius: 12, padding: '28px 32px', marginTop: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e40af', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 2 }}>The EstateFlow Solution</div>
            <p style={{ fontSize: 15, color: '#1e3a5f', lineHeight: 1.8, margin: 0 }}>
              EstateFlow replaces the chaos with a single, unified platform covering the full spectrum of residential property management — lettings, HMOs, leasehold blocks, and RTM companies. From automatic certificate expiry alerts and tenancy lifecycle management, to a structured 24/7 out-of-hours call service that can be used standalone or fully integrated with your portfolio.
            </p>
          </div>
        </div>

        {/* ===== PAGE 3: CORE MODULES ===== */}
        <div className="page page-break">
          <div className="page-header">
            <div className="page-logo">Estate<span>Flow</span></div>
            <div className="page-num">PLATFORM MODULES · 03</div>
          </div>

          <div className="section-eyebrow">What's Included</div>
          <h2 className="section-h2">Everything You Need.<br />One Unified Platform.</h2>
          <p className="section-desc">
            EstateFlow serves the full range of residential property professionals — from single letting agents managing ASTs to large multi-company groups running leasehold blocks, HMOs, and RTM companies. Every module is legislatively current for England and Wales, and connected to one shared data layer.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'LETTINGS', color: '#dbeafe', text: '#1e40af', modules: ['Tenancy Pipeline (AST/Assured)', 'Right to Rent Checks', 'Deposit Registration & Schemes', 'How to Rent Guide (England)', 'Rent Smart Wales', 'HMO Licence Tracking', 'Section 21 / Section 8 Notices', 'Periodic Inspections'] },
              { label: 'BLOCK & LEASEHOLD', color: '#dcfce7', text: '#166534', modules: ['Service Charge Accounts', 'Ground Rent Ledger', 'RTM Claim Management', 'Leaseholder Rights Portal', 'Building Safety Register', 'Section 20 Consultation', 'Client Money Protection', 'Companies House Tracking'] },
              { label: 'OPERATIONS & FINANCE', color: '#fef3c7', text: '#92400e', modules: ['Maintenance Work Orders', 'Emergency Callout Manager', '24/7 Out-of-Hours Service', 'Rent Ledger & Arrears', 'Banking & Expenses', 'Accounting Sync (QBO/Xero)', 'Document Automation & Bulk Gen', 'CRM & Workflow Automation'] },
            ].map((col, ci) => (
              <div key={ci} style={{ border: `1px solid ${col.color}`, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ background: col.color, color: col.text, fontSize: 10, fontWeight: 700, padding: '8px 14px', letterSpacing: 2, textTransform: 'uppercase' }}>{col.label}</div>
                <div style={{ padding: '10px 14px' }}>
                  {col.modules.map((m, mi) => (
                    <div key={mi} style={{ fontSize: 11, color: '#475569', padding: '4px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 7, alignItems: 'center' }}>
                      <span style={{ color: '#0ea5e9', fontWeight: 700, flexShrink: 0 }}>✓</span>{m}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', borderRadius: 12, padding: '20px 28px', color: 'white', display: 'flex', gap: 32, justifyContent: 'space-around' }}>
            {[
              { n: 'ASTs', l: 'Assured Shorthold Tenancies' },
              { n: 'HMOs', l: 'Houses in Multiple Occupation' },
              { n: 'Blocks', l: 'Leasehold & Freehold' },
              { n: 'RTM', l: 'Right to Manage Companies' },
              { n: 'Groups', l: 'Multi-Company Portfolios' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#38bdf8' }}>{s.n}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'none' }}>
          {/* legacy placeholder removed */}
          {false && [].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fafafa' }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{m.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 3 }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== PAGE 4: COMPLIANCE & BLOCK MANAGEMENT ===== */}
        <div className="page page-break">
          <div className="page-header">
            <div className="page-logo">Estate<span>Flow</span></div>
            <div className="page-num">COMPLIANCE DETAIL · 04</div>
          </div>

          <div className="section-eyebrow">Regulatory Intelligence</div>
          <h2 className="section-h2">Built for UK Law.<br />Automatic & Audit-Ready.</h2>
          <p className="section-desc">
            EstateFlow tracks every statutory obligation across your portfolio in real time — automatically alerting you before deadlines are missed, not after.
          </p>

          <table className="compliance-table avoid-break">
            <thead>
              <tr>
                <th>Compliance Area</th>
                <th>Legislation</th>
                <th>Frequency</th>
                <th>EstateFlow Feature</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Gas Safety Certificate (CP12)</td><td>Gas Safety Regs 1998</td><td>Annual</td><td>Auto-expiry alerts, cert upload, tenant delivery tracking</td><td><span className="badge-green">✓ Full</span></td></tr>
              <tr><td>EICR Electrical Report</td><td>SI 2020/312 (England)</td><td>5 Years</td><td>Cycle tracking, outcome recording, remedial works log</td><td><span className="badge-green">✓ Full</span></td></tr>
              <tr><td>Fire Risk Assessment</td><td>RRO 2005</td><td>Annual</td><td>Assessor records, recommendations tracker, distribution log</td><td><span className="badge-green">✓ Full</span></td></tr>
              <tr><td>Asbestos Survey</td><td>CAW Regs 2012</td><td>As required</td><td>Register, material conditions, contractor access log</td><td><span className="badge-green">✓ Full</span></td></tr>
              <tr><td>Legionella Risk Assessment</td><td>L8 ACOP</td><td>As required</td><td>Risk level, control measures, temperature monitoring</td><td><span className="badge-green">✓ Full</span></td></tr>
              <tr><td>Section 20 Consultation</td><td>LTA 1985 s.20</td><td>Per major works</td><td>Threshold alerts (£250/unit), notice tracking, leaseholder responses</td><td><span className="badge-green">✓ Full</span></td></tr>
              <tr><td>Deposit Registration</td><td>Housing Act 2004</td><td>30 days</td><td>Deadline countdown, scheme tracking, prescribed info delivery</td><td><span className="badge-green">✓ Full</span></td></tr>
              <tr><td>Right to Rent Checks</td><td>Immigration Act 2014</td><td>Per tenancy</td><td>Check log, document types, repeat check scheduling</td><td><span className="badge-green">✓ Full</span></td></tr>
              <tr><td>EPC Rating</td><td>MEES 2018</td><td>10 Years</td><td>Rating tracking, MEES threshold alerts (min E), renewal planning</td><td><span className="badge-green">✓ Full</span></td></tr>
              <tr><td>Building Safety Register</td><td>Building Safety Act 2023</td><td>Ongoing</td><td>HRRB classification, accountable person records, defect register</td><td><span className="badge-green">✓ Full</span></td></tr>
              <tr><td>RTM Claim Management</td><td>CLRA 2002</td><td>Claim-based</td><td>Eligibility calc, notice tracking, acquisition timeline, handover checklist</td><td><span className="badge-green">✓ Full</span></td></tr>
              <tr><td>Client Money Protection</td><td>Housing Act 2004</td><td>Annual</td><td>CMP scheme records, account reconciliation, dispute log</td><td><span className="badge-green">✓ Full</span></td></tr>
              <tr><td>Rent Smart Wales</td><td>RHAOA 2016</td><td>Annual</td><td>Registration tracking, licence numbers, contract compliance</td><td><span className="badge-amber">Wales</span></td></tr>
              <tr><td>How to Rent Guide</td><td>SI 2020/1436</td><td>Per tenancy</td><td>Provision tracking per tenant, version history</td><td><span className="badge-blue">England</span></td></tr>
            </tbody>
          </table>

          <div className="quote-block avoid-break">
            <p className="quote-text">"For the first time, I know every certificate status across every property in one screen. Before EstateFlow, I was managing 8 different spreadsheets and still missing things."</p>
            <div className="quote-attr">— Residential Block Manager, North West England</div>
          </div>
        </div>

        {/* ===== PAGE 5: OUT-OF-HOURS & EMERGENCY ===== */}
        <div className="page page-break">
          <div className="page-header">
            <div className="page-logo">Estate<span>Flow</span></div>
            <div className="page-num">OUT-OF-HOURS SERVICE · 05</div>
          </div>

          <div className="section-eyebrow">24/7 Emergency Management — Standalone or Integrated</div>
          <h2 className="section-h2">A Professional Out-of-Hours<br />Service Your Clients Can Trust.</h2>
          <p className="section-desc">
            The EstateFlow Out-of-Hours service is available as a fully standalone product — you do not need to use any other module to offer it. Any letting agent, block manager, or landlord can subscribe to have their calls handled by a structured, GDPR-compliant system with automatic maintenance order creation, contractor dispatch, and full audit trail. For EstateFlow platform subscribers, every call is automatically linked to the matching property and tenant record.
          </p>

          <div className="stats-strip avoid-break">
            <div className="stat-item">
              <div className="stat-num">£185</div>
              <div className="stat-label">Avg Emergency Callout</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">51%</div>
              <div className="stat-label">More than Daytime*</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">70min</div>
              <div className="stat-label">Avg Response Time</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">100%</div>
              <div className="stat-label">Calls Logged & Audited</div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 24 }}>* Source: Adiuvo / News on the Block 2025 — out-of-hours maintenance costs 51% more than daytime equivalent</div>

          <div className="feature-grid avoid-break">
            <div className="feature-card">
              <div className="feature-icon-row">
                <div className="feature-icon">📋</div>
                <div className="feature-title">Structured Call Logging</div>
              </div>
              <ul className="feature-bullets">
                <li>GDPR consent recorded on every call</li>
                <li>Caller identity & property matched in real time</li>
                <li>Call type, severity & action documented</li>
                <li>Handler name & duration recorded</li>
                <li>Full call notes with timestamps</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon-row">
                <div className="feature-icon">🚀</div>
                <div className="feature-title">Automatic Actions</div>
              </div>
              <ul className="feature-bullets">
                <li>Auto-creates maintenance order on call close</li>
                <li>Contractor dispatched from pre-approved list</li>
                <li>Confirmation email auto-sent to tenant</li>
                <li>Escalation to property manager if critical</li>
                <li>Callback scheduling for non-urgent calls</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon-row">
                <div className="feature-icon">📊</div>
                <div className="feature-title">Analytics & Reporting</div>
              </div>
              <ul className="feature-bullets">
                <li>Call volume trends by property & date</li>
                <li>Issue category breakdown (heating, leaks etc.)</li>
                <li>Response time benchmarking</li>
                <li>Contractor performance metrics</li>
                <li>Monthly summary for landlord clients</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon-row">
                <div className="feature-icon">💼</div>
                <div className="feature-title">Service Tiers</div>
              </div>
              <ul className="feature-bullets">
                <li><strong>Basic:</strong> Log & email only</li>
                <li><strong>Standard:</strong> + Maintenance order creation</li>
                <li><strong>Premium:</strong> + Contractor dispatch</li>
                <li><strong>Enterprise:</strong> Full managed response</li>
                <li>Monthly billing with transparent invoicing</li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>How a Call is Handled</div>
            <div className="process-steps avoid-break">
              {[
                { num: '1', label: 'Call Received', sub: 'Agent answers, logs details' },
                { num: '2', label: 'GDPR Consent', sub: 'Identity & consent recorded' },
                { num: '3', label: 'Property Matched', sub: 'Postcode matched to portfolio' },
                { num: '4', label: 'Action Taken', sub: 'Log, dispatch, or escalate' },
                { num: '5', label: 'Auto Notification', sub: 'Tenant & manager alerted' },
              ].map((s, i) => (
                <div key={i} className="process-step">
                  <div className="process-num">{s.num}</div>
                  <div className="process-label">{s.label}</div>
                  <div className="process-sub">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== PAGE 6: FINANCIAL MODULE ===== */}
        <div className="page page-break">
          <div className="page-header">
            <div className="page-logo">Estate<span>Flow</span></div>
            <div className="page-num">FINANCIAL MANAGEMENT · 06</div>
          </div>

          <div className="section-eyebrow">Financial Intelligence</div>
          <h2 className="section-h2">Complete Financial Visibility<br />Across Your Portfolio.</h2>
          <p className="section-desc">
            From rent collection to service charge reconciliation — EstateFlow provides real-time financial data, automatic arrears alerting, and accounting integration with QuickBooks and Xero.
          </p>

          <div className="stats-strip avoid-break">
            <div className="stat-item"><div className="stat-num">£250</div><div className="stat-label">Ground Rent Cap*</div></div>
            <div className="stat-item"><div className="stat-num">£1,400</div><div className="stat-label">Avg Service Charge/Unit</div></div>
            <div className="stat-item"><div className="stat-num">92%</div><div className="stat-label">Collection Rate</div></div>
            <div className="stat-item"><div className="stat-num">30day</div><div className="stat-label">Arrears Alert Window</div></div>
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 24 }}>* Government confirmed £250 ground rent cap for existing leases, January 2026 (360 Law Services)</div>

          <div className="feature-grid avoid-break">
            <div className="feature-card">
              <div className="feature-icon-row">
                <div className="feature-icon">🏦</div>
                <div className="feature-title">Rent Ledger</div>
              </div>
              <ul className="feature-bullets">
                <li>12-month payment history per tenant</li>
                <li>Real-time arrears calculation</li>
                <li>Automated overdue notifications</li>
                <li>Payment method & reference tracking</li>
                <li>Partial payment recording</li>
              </ul>
            </div>
            <div className="feature-card">
              <div className="feature-icon-row">
                <div className="feature-icon">🏗️</div>
                <div className="feature-title">Service Charges</div>
              </div>
              <ul className="feature-bullets">
                <li>Itemised cost breakdown per category</li>
                <li>Estimated vs actual variance tracking</li>
                <li>Per-unit charge calculation</li>
                <li>Section 20 consultation threshold alerts</li>
                <li>Leaseholder statement distribution</li>
              </ul>
            </div>
            <div className="feature-card">
              <div className="feature-icon-row">
                <div className="feature-icon">🔄</div>
                <div className="feature-title">Accounting Sync</div>
              </div>
              <ul className="feature-bullets">
                <li>QuickBooks & Xero integration</li>
                <li>Automatic transaction mapping</li>
                <li>Scheduled overnight sync</li>
                <li>GL account category mapping</li>
                <li>Sync error alerts & retry logic</li>
              </ul>
            </div>
            <div className="feature-card">
              <div className="feature-icon-row">
                <div className="feature-icon">📈</div>
                <div className="feature-title">Financial Reporting</div>
              </div>
              <ul className="feature-bullets">
                <li>Monthly income & expenditure reports</li>
                <li>Reserve fund balance tracking</li>
                <li>12-month income trend charts</li>
                <li>Property-by-property profitability</li>
                <li>Export to PDF for clients</li>
              </ul>
            </div>
          </div>

          <div className="quote-block avoid-break">
            <p className="quote-text">"Service charge management used to take two days every quarter. With EstateFlow, the breakdowns are automatic — I just approve and send. It's saved us at least £3,000 a year in admin."</p>
            <div className="quote-attr">— Leasehold Portfolio Manager, Greater Manchester</div>
          </div>
        </div>

        {/* ===== PAGE 7: PRICING & TIERS ===== */}
        <div className="page page-break">
          <div className="page-header">
            <div className="page-logo">Estate<span>Flow</span></div>
            <div className="page-num">PRICING & PACKAGES · 07</div>
          </div>

          <div className="section-eyebrow">Simple, Transparent Pricing</div>
          <h2 className="section-h2">The Right Plan<br />For Every Portfolio.</h2>
          <p className="section-desc">
            All plans include the full platform. Pricing scales with portfolio size — no hidden fees, no per-module charges. Out-of-hours service is available as an add-on at any tier.
          </p>

          <div className="pricing-grid avoid-break">
            <div className="pricing-card">
              <div className="pricing-tier">Starter</div>
              <div className="pricing-price">£149<span>/month</span></div>
              <p className="pricing-desc">For independent managers with up to 50 units.</p>
              <ul className="pricing-features">
                <li>Up to 50 units</li>
                <li>2 properties</li>
                <li>Full compliance module</li>
                <li>Maintenance & documents</li>
                <li>Financial reporting</li>
                <li>Email support</li>
              </ul>
            </div>

            <div className="pricing-card featured">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-tier">Professional</div>
              <div className="pricing-price">£349<span>/month</span></div>
              <p className="pricing-desc">For growing block management companies with up to 200 units.</p>
              <ul className="pricing-features">
                <li>Up to 200 units</li>
                <li>Unlimited properties</li>
                <li>All 14 modules</li>
                <li>Accounting sync (QBO/Xero)</li>
                <li>Tenant portal</li>
                <li>Workflow automation</li>
                <li>Phone + email support</li>
              </ul>
            </div>

            <div className="pricing-card">
              <div className="pricing-tier">Enterprise</div>
              <div className="pricing-price">£749<span>+/month</span></div>
              <p className="pricing-desc">For large portfolios and multi-company property groups.</p>
              <ul className="pricing-features">
                <li>Unlimited units</li>
                <li>Unlimited companies</li>
                <li>White-label tenant portal</li>
                <li>Custom API integrations</li>
                <li>SLA-backed support</li>
                <li>Dedicated account manager</li>
                <li>Custom reporting</li>
              </ul>
            </div>
          </div>

          <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 12, padding: '20px 24px', marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#713f12', marginBottom: 8 }}>🎯 Out-of-Hours Add-On</div>
            <div style={{ display: 'flex', gap: 40 }}>
              {[
                { tier: 'Basic', price: '£95/mo', desc: 'Log & email confirmation' },
                { tier: 'Standard', price: '£195/mo', desc: '+ Maintenance order creation' },
                { tier: 'Premium', price: '£295/mo', desc: '+ Contractor dispatch' },
                { tier: 'Enterprise', price: 'POA', desc: 'Full managed 24/7 response' },
              ].map((t, i) => (
                <div key={i} style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{t.tier}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#713f12' }}>{t.price}</div>
                  <div style={{ fontSize: 11, color: '#78350f' }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#14532d', marginBottom: 8 }}>Partner Referral Programme</div>
            <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.7, margin: 0 }}>
              As an EstateFlow sales partner, you earn a <strong>20% recurring commission</strong> on every subscription for the lifetime of the client. There is no cap. A single Professional client = £69.80/month recurring. Ten clients = £698/month passive income.
            </p>
          </div>
        </div>

        {/* ===== PAGE 8: ONBOARDING & SUPPORT ===== */}
        <div className="page page-break">
          <div className="page-header">
            <div className="page-logo">Estate<span>Flow</span></div>
            <div className="page-num">ONBOARDING & SUPPORT · 08</div>
          </div>

          <div className="section-eyebrow">Getting Started</div>
          <h2 className="section-h2">Up and Running<br />in Under 2 Weeks.</h2>
          <p className="section-desc">
            EstateFlow is designed for rapid deployment. Most clients are fully operational within 10 business days. We handle data migration, training, and setup so your team can focus on what matters.
          </p>

          <div style={{ marginBottom: 36 }}>
            <div className="timeline avoid-break">
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-label">Day 1–2</div>
                <div className="timeline-title">Account Setup & Configuration</div>
                <div className="timeline-desc">Company structure, user roles, and portfolio framework configured by the EstateFlow onboarding team.</div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-label">Day 3–5</div>
                <div className="timeline-title">Data Migration</div>
                <div className="timeline-desc">Property, tenant, and financial data imported from spreadsheets, legacy systems, or manual entry. Our team supports the entire process.</div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-label">Day 6–8</div>
                <div className="timeline-title">Team Training</div>
                <div className="timeline-desc">Live virtual training sessions covering each module relevant to your team's roles. Recorded sessions available on-demand.</div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-label">Day 9–10</div>
                <div className="timeline-title">Go Live & Handover</div>
                <div className="timeline-desc">Platform launched with your live data. Dedicated support for first 30 days. Optional out-of-hours service activation.</div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-label">Ongoing</div>
                <div className="timeline-title">Account Management & Updates</div>
                <div className="timeline-desc">Regular platform updates, legislative compliance checks, and quarterly review calls with your account manager.</div>
              </div>
            </div>
          </div>

          <div className="feature-grid avoid-break">
            <div className="feature-card">
              <div className="feature-icon-row">
                <div className="feature-icon">🎓</div>
                <div className="feature-title">Training Included</div>
              </div>
              <ul className="feature-bullets">
                <li>Live virtual onboarding sessions</li>
                <li>Role-based training modules</li>
                <li>On-demand video library</li>
                <li>Written knowledge base</li>
              </ul>
            </div>
            <div className="feature-card">
              <div className="feature-icon-row">
                <div className="feature-icon">🛟</div>
                <div className="feature-title">Ongoing Support</div>
              </div>
              <ul className="feature-bullets">
                <li>Email support (all plans)</li>
                <li>Phone support (Professional+)</li>
                <li>SLA-backed response (Enterprise)</li>
                <li>UK-based support team</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ===== CTA PAGE ===== */}
        <div className="cta-page page-break">
          <div className="page-header" style={{ borderBottomColor: 'rgba(255,255,255,0.2)' }}>
            <div className="page-logo" style={{ color: 'white' }}>Estate<span style={{ color: '#38bdf8' }}>Flow</span></div>
            <div className="page-num" style={{ color: '#64748b' }}>GET IN TOUCH · 09</div>
          </div>

          <div className="cta-main">
            <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#38bdf8', marginBottom: 20 }}>Start Your Journey</div>
            <h2 className="cta-h2">
              Ready to Transform<br />
              <span>Your Property Business?</span>
            </h2>
            <p className="cta-desc">
              Book a personalised demo and see EstateFlow handling your specific portfolio. We'll show you exactly how much time and money you'll save — with your own data.
            </p>

            <div className="cta-contact-box">
              <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24 }}>Contact RBM (North West) Limited</div>
              
              {[
                { icon: '📞', label: 'Call Us', value: '01204 695919' },
                { icon: '📧', label: 'Email Us', value: 'info@rbm-nw.co.uk' },
                { icon: '📍', label: 'Our Office', value: '29 Lee Lane, Horwich, Bolton, BL6 7AY' },
                { icon: '🌐', label: 'Website', value: 'www.rbm-nw.co.uk' },
              ].map((c, i) => (
                <div key={i} className="cta-contact-row">
                  <div className="cta-contact-icon">{c.icon}</div>
                  <div>
                    <div className="cta-contact-label">{c.label}</div>
                    <div className="cta-contact-value">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cta-footer">
            <div>EstateFlow is a trading product of RBM (North West) Limited · Company No. 16608812</div>
            <div>© 2026 All Rights Reserved</div>
          </div>
        </div>
      </div>
    </>
  );
}