import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const checks = {
      gasSafety: 0,
      eicr: 0,
      depositProtection: 0
    };

    // Check Gas Safety Certificates
    const gasCerts = await base44.asServiceRole.entities.GasSafetyCertificate.list('', 100);
    for (const cert of gasCerts) {
      if (cert.expiry_date) {
        const expiry = new Date(cert.expiry_date);
        if (expiry <= thirtyDaysFromNow && expiry > today) {
          // Create or update alert
          const alerts = await base44.asServiceRole.entities.CertificateExpiryAlert.filter({
            certificate_type: 'gas_safety',
            certificate_id: cert.id
          });
          
          if (!alerts.length) {
            await base44.asServiceRole.entities.CertificateExpiryAlert.create({
              certificate_type: 'gas_safety',
              certificate_id: cert.id,
              property_id: cert.property_id,
              expiry_date: cert.expiry_date,
              days_until_expiry: Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)),
              alert_status: 'pending'
            });
            checks.gasSafety++;
          }
        }
      }
    }

    // Check EICR Certificates
    const eicrCerts = await base44.asServiceRole.entities.EICRCertificate.list('', 100);
    for (const cert of eicrCerts) {
      if (cert.next_due_date) {
        const due = new Date(cert.next_due_date);
        if (due <= thirtyDaysFromNow && due > today) {
          const alerts = await base44.asServiceRole.entities.CertificateExpiryAlert.filter({
            certificate_type: 'eicr',
            certificate_id: cert.id
          });
          
          if (!alerts.length) {
            await base44.asServiceRole.entities.CertificateExpiryAlert.create({
              certificate_type: 'eicr',
              certificate_id: cert.id,
              property_id: cert.property_id,
              expiry_date: cert.next_due_date,
              days_until_expiry: Math.ceil((due - today) / (1000 * 60 * 60 * 24)),
              alert_status: 'pending'
            });
            checks.eicr++;
          }
        }
      }
    }

    // Check Deposit Protection
    const deposits = await base44.asServiceRole.entities.DepositProtection.list('', 100);
    for (const dep of deposits) {
      if (dep.tenancy_end_date) {
        const endDate = new Date(dep.tenancy_end_date);
        if (endDate <= thirtyDaysFromNow && endDate > today && !dep.deposit_returned_date) {
          const alerts = await base44.asServiceRole.entities.CertificateExpiryAlert.filter({
            certificate_type: 'deposit_protection',
            certificate_id: dep.id
          });
          
          if (!alerts.length) {
            await base44.asServiceRole.entities.CertificateExpiryAlert.create({
              certificate_type: 'deposit_protection',
              certificate_id: dep.id,
              property_id: dep.property_id,
              expiry_date: dep.tenancy_end_date,
              days_until_expiry: Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)),
              alert_status: 'pending'
            });
            checks.depositProtection++;
          }
        }
      }
    }

    return Response.json({ 
      checked: checks,
      total: gasCerts.length + eicrCerts.length + deposits.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});