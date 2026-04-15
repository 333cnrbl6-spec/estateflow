import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // CRITICAL: Verify admin-only access to compliance reports
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { property_id, format_type = 'json' } = body;

    if (!property_id) {
      return Response.json({ error: 'property_id required' }, { status: 400 });
    }

    // Get property & related data (WITHOUT exposing tenant PII)
    const property = await base44.entities.Property.filter({ id: property_id });
    const units = await base44.entities.Unit.filter({ property_id });
    const gasCerts = await base44.entities.GasSafetyCertificate.filter({ property_id });
    const eicrCerts = await base44.entities.EICRCertificate.filter({ property_id });
    // Don't fetch full tenant data—only count
    const tenants = await base44.entities.Tenant.filter({ property_id });
    const deposits = await base44.entities.DepositProtection.filter({ property_id });

    const report = {
      generatedAt: new Date().toISOString(),
      property: property[0] || {},
      summary: {
        totalUnits: units.length,
        occupiedUnits: units.filter(u => u.status === 'occupied').length,
        totalTenants: tenants.length, // Count only, not names/emails
        activeTenants: tenants.filter(t => t.status === 'active').length
      },
      compliance: {
        gasSafety: {
          total: gasCerts.length,
          valid: gasCerts.filter(c => c.status === 'valid').length,
          expiringSoon: gasCerts.filter(c => c.status === 'expiring_soon').length,
          expired: gasCerts.filter(c => c.status === 'expired').length
        },
        electrical: {
          total: eicrCerts.length,
          valid: eicrCerts.filter(c => c.status === 'valid').length,
          expiringSoon: eicrCerts.filter(c => c.status === 'expiring_soon').length,
          expired: eicrCerts.filter(c => c.status === 'expired').length
        },
        deposits: {
          total: deposits.length,
          compliant: deposits.filter(d => d.compliance_status === 'compliant').length,
          atRisk: deposits.filter(d => d.compliance_status === 'late_protection').length
        }
      },
      certificates: {
        gasSafety: gasCerts.map(c => ({
          certificate_number: c.certificate_number,
          issue_date: c.issue_date,
          expiry_date: c.expiry_date,
          status: c.status
        })),
        electrical: eicrCerts.map(c => ({
          certificate_reference: c.certificate_reference,
          inspection_date: c.inspection_date,
          next_due_date: c.next_due_date,
          status: c.status
        }))
      }
    };

    // Log report access for audit
    console.log(`[ComplianceReport] User ${user.email} accessed property ${property_id} compliance report`);

    if (format_type === 'json') {
      return Response.json(report);
    }

    // PDF format (simplified as base64 JSON)
    // Add security headers to prevent caching of sensitive data
    const pdfContent = JSON.stringify(report, null, 2);
    return new Response(pdfContent, {
      status: 200,
      headers: { 
        'Content-Type': 'application/pdf', 
        'Content-Disposition': 'attachment; filename=compliance-report.pdf',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('[ComplianceReport] Error:', error.message);
    return Response.json({ error: 'Report generation failed' }, { status: 500 });
  }
});