import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const results = {
      insurance_scanned: 0,
      insurance_expiring: 0,
      certificates_scanned: 0,
      certificates_expiring: 0,
      emails_sent: 0,
      errors: []
    };

    // Scan vendor insurance
    const insurances = await base44.asServiceRole.entities.VendorInsurance?.list?.('-updated_date', 500) || [];
    results.insurance_scanned = insurances.length;

    for (const insurance of insurances) {
      const shouldNotify = checkIfShouldNotify(insurance.expiry_date);
      if (shouldNotify) {
        results.insurance_expiring++;
        const vendor = await base44.asServiceRole.entities.Vendor?.get?.(insurance.vendor_id);
        if (vendor) {
          await sendInsuranceExpiryNotification(base44, vendor, insurance, results);
        }
      }
    }

    // Scan gas safety certificates
    const gasCerts = await base44.asServiceRole.entities.GasSafetyCertificate?.list?.('-updated_date', 500) || [];
    results.certificates_scanned += gasCerts.length;

    for (const cert of gasCerts) {
      const shouldNotify = checkIfShouldNotify(cert.expiry_date);
      if (shouldNotify) {
        results.certificates_expiring++;
        await sendCertificateExpiryNotification(base44, 'Gas Safety Certificate', cert, results);
      }
    }

    // Scan electrical certificates
    const elecCerts = await base44.asServiceRole.entities.EICRCertificate?.list?.('-updated_date', 500) || [];
    results.certificates_scanned += elecCerts.length;

    for (const cert of elecCerts) {
      const shouldNotify = checkIfShouldNotify(cert.expiry_date);
      if (shouldNotify) {
        results.certificates_expiring++;
        await sendCertificateExpiryNotification(base44, 'Electrical Certificate (EICR)', cert, results);
      }
    }

    // Scan EPC certificates
    const epcCerts = await base44.asServiceRole.entities.EnergyPerformanceCertificate?.list?.('-updated_date', 500) || [];
    results.certificates_scanned += epcCerts.length;

    for (const cert of epcCerts) {
      const shouldNotify = checkIfShouldNotify(cert.expiry_date);
      if (shouldNotify) {
        results.certificates_expiring++;
        await sendCertificateExpiryNotification(base44, 'Energy Performance Certificate', cert, results);
      }
    }

    // Scan pending compliance audits
    const pendingWorkflows = await base44.asServiceRole.entities.Workflow?.filter?.({
      status: 'in_progress'
    }) || [];

    for (const workflow of pendingWorkflows) {
      const daysUntilDue = Math.ceil((new Date(workflow.due_date) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue === 30 || daysUntilDue === 14 || daysUntilDue === 7) {
        await sendWorkflowReminderNotification(base44, workflow, daysUntilDue, results);
      }
    }

    // Log scan results
    console.log('Compliance scan completed:', results);

    return Response.json(results);
  } catch (error) {
    console.error('Scan error:', error);
    return Response.json({ error: error.message, timestamp: new Date().toISOString() }, { status: 500 });
  }
});

function checkIfShouldNotify(expiryDateString) {
  if (!expiryDateString) return false;

  const expiryDate = new Date(expiryDateString);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

  // Notify 30, 14, 7, and 1 days before expiry
  return [30, 14, 7, 1].includes(daysUntilExpiry);
}

async function sendInsuranceExpiryNotification(base44, vendor, insurance, results) {
  try {
    const daysUntilExpiry = Math.ceil((new Date(insurance.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    const insuranceType = insurance.insurance_type.replace(/_/g, ' ');

    // Notify vendor
    const vendorEmail = vendor.email || vendor.contact_email;
    if (vendorEmail) {
      const vendorSubject = `REMINDER: ${insuranceType} Insurance Expires in ${daysUntilExpiry} Days`;
      const vendorBody = `
Dear ${vendor.contact_name || vendor.name},

This is a reminder that your ${insuranceType} insurance policy (Policy #${insurance.policy_number}) will expire on ${new Date(insurance.expiry_date).toLocaleDateString()}.

Please ensure you renew your insurance promptly to maintain compliance.

Policy Details:
- Type: ${insuranceType}
- Provider: ${insurance.provider}
- Coverage: £${insurance.coverage_amount?.toLocaleString() || 'N/A'}
- Expiry: ${new Date(insurance.expiry_date).toLocaleDateString()}

If you have any questions, please contact our support team.

Best regards,
Compliance Team
      `;

      await base44.integrations.Core.SendEmail({
        to: vendorEmail,
        subject: vendorSubject,
        body: vendorBody
      }).catch(err => {
        console.error(`Failed to email vendor ${vendorEmail}:`, err);
      });

      results.emails_sent++;
    }

    // Notify admins
    const adminUsers = await base44.asServiceRole.entities.User?.filter?.({ role: 'admin' }) || [];
    const adminEmails = adminUsers.map(u => u.email).filter(e => e);

    for (const adminEmail of adminEmails) {
      const adminSubject = `ACTION REQUIRED: Vendor Insurance Expiring - ${vendor.name}`;
      const adminBody = `
A vendor's ${insuranceType} insurance is expiring soon.

Vendor: ${vendor.name}
Contact: ${vendor.contact_name}
Email: ${vendor.email}
Phone: ${vendor.phone}

Insurance Details:
- Type: ${insuranceType}
- Policy #: ${insurance.policy_number}
- Provider: ${insurance.provider}
- Coverage: £${insurance.coverage_amount?.toLocaleString() || 'N/A'}
- Expiry Date: ${new Date(insurance.expiry_date).toLocaleDateString()}
- Days Until Expiry: ${daysUntilExpiry}

Action Required:
1. Contact vendor to confirm renewal
2. Request updated insurance certificate
3. Update system once new certificate received

Vendor ID: ${vendor.id}
      `;

      await base44.integrations.Core.SendEmail({
        to: adminEmail,
        subject: adminSubject,
        body: adminBody
      }).catch(err => {
        console.error(`Failed to email admin ${adminEmail}:`, err);
      });

      results.emails_sent++;
    }
  } catch (error) {
    console.error('Insurance notification error:', error);
    results.errors.push(`Insurance ${insurance.id}: ${error.message}`);
  }
}

async function sendCertificateExpiryNotification(base44, certificateType, cert, results) {
  try {
    const daysUntilExpiry = Math.ceil((new Date(cert.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    const property = await base44.asServiceRole.entities.Property?.get?.(cert.property_id);

    if (!property) return;

    // Notify admins
    const adminUsers = await base44.asServiceRole.entities.User?.filter?.({ role: 'admin' }) || [];
    const adminEmails = adminUsers.map(u => u.email).filter(e => e);

    for (const adminEmail of adminEmails) {
      const subject = `ACTION REQUIRED: ${certificateType} Expiring - ${property.name || property.address}`;
      const body = `
A property's ${certificateType} is expiring soon.

Property: ${property.name || property.address}
Address: ${property.address}, ${property.postcode}

Certificate Details:
- Type: ${certificateType}
- Certificate #: ${cert.certificate_number}
- Issued: ${new Date(cert.assessment_date).toLocaleDateString()}
- Expiry Date: ${new Date(cert.expiry_date).toLocaleDateString()}
- Days Until Expiry: ${daysUntilExpiry}

Action Required:
1. Schedule renewal assessment
2. Contact certified assessor
3. Update system once new certificate received

Property ID: ${property.id}
      `;

      await base44.integrations.Core.SendEmail({
        to: adminEmail,
        subject,
        body
      }).catch(err => {
        console.error(`Failed to email admin ${adminEmail}:`, err);
      });

      results.emails_sent++;
    }
  } catch (error) {
    console.error('Certificate notification error:', error);
    results.errors.push(`Certificate ${cert.id}: ${error.message}`);
  }
}

async function sendWorkflowReminderNotification(base44, workflow, daysUntilDue, results) {
  try {
    // Notify admins
    const adminUsers = await base44.asServiceRole.entities.User?.filter?.({ role: 'admin' }) || [];
    const adminEmails = adminUsers.map(u => u.email).filter(e => e);

    for (const adminEmail of adminEmails) {
      const subject = `REMINDER: Onboarding Workflow Due in ${daysUntilDue} Days`;
      const body = `
A onboarding workflow is approaching its due date.

Workflow: ${workflow.name}
Type: ${workflow.relationship_type.replace(/_/g, ' ')}
Status: ${workflow.status}
Current Stage: ${workflow.current_stage + 1} of ${workflow.total_stages}
Due Date: ${new Date(workflow.due_date).toLocaleDateString()}
Days Remaining: ${daysUntilDue}

Action Required:
1. Review current stage progress
2. Chase any outstanding documents
3. Complete remaining steps by due date

Workflow ID: ${workflow.id}
      `;

      await base44.integrations.Core.SendEmail({
        to: adminEmail,
        subject,
        body
      }).catch(err => {
        console.error(`Failed to email admin ${adminEmail}:`, err);
      });

      results.emails_sent++;
    }
  } catch (error) {
    console.error('Workflow notification error:', error);
    results.errors.push(`Workflow ${workflow.id}: ${error.message}`);
  }
}