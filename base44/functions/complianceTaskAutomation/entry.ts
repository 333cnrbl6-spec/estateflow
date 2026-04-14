import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const today = new Date();
    const results = {
      tasksCreated: 0,
      notificationsSent: 0,
      errors: []
    };

    // Fetch all properties
    const properties = await base44.asServiceRole.entities.Property.list('-updated_date', 500);

    for (const property of properties) {
      try {
        // Fetch compliance risk score
        const riskScores = await base44.asServiceRole.entities.ComplianceRiskScore.filter(
          { property_id: property.id },
          '-calculated_date',
          1
        );
        const riskScore = riskScores[0];

        // Check gas safety certificates
        const gasCerts = await base44.asServiceRole.entities.GasSafetyCertificate.filter(
          { property_id: property.id },
          '-expiry_date',
          10
        );

        for (const cert of gasCerts) {
          await processExpiryCertificate(
            base44,
            property,
            'gas_safety',
            cert,
            riskScore,
            results
          );
        }

        // Check electrical certificates
        const epicCerts = await base44.asServiceRole.entities.EICRCertificate.filter(
          { property_id: property.id },
          '-expiry_date',
          10
        );

        for (const cert of epicCerts) {
          await processExpiryCertificate(
            base44,
            property,
            'electrical',
            cert,
            riskScore,
            results
          );
        }

        // Check EPC certificates
        const epcCerts = await base44.asServiceRole.entities.EnergyPerformanceCertificate.filter(
          { property_id: property.id },
          '-expiry_date',
          10
        );

        for (const cert of epcCerts) {
          await processExpiryCertificate(
            base44,
            property,
            'epc',
            cert,
            riskScore,
            results
          );
        }

        // Check HMO licenses
        const hmoLicenses = await base44.asServiceRole.entities.HMOLicense.filter(
          { property_id: property.id },
          '-expiry_date',
          5
        );

        for (const license of hmoLicenses) {
          await processExpiryLicense(
            base44,
            property,
            'hmo_license',
            license,
            riskScore,
            results
          );
        }

      } catch (err) {
        results.errors.push({
          property_id: property.id,
          property_name: property.name || property.address_line_1,
          error: err.message
        });
      }
    }

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: results
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function processExpiryCertificate(base44, property, certType, certificate, riskScore, results) {
  const today = new Date();
  const expiryDate = new Date(certificate.expiry_date);
  const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

  const thresholdDays = [90, 60, 30];
  const taskThreshold = 60; // Create task if expiring within 60 days AND risk is high

  for (const threshold of thresholdDays) {
    if (daysUntilExpiry <= threshold && daysUntilExpiry > (threshold - 1)) {
      // Check if notification already sent
      const existingTasks = await base44.asServiceRole.entities.ComplianceTask.filter(
        {
          property_id: property.id,
          task_type: `${certType}_expiry_alert_${threshold}`,
          certificate_id: certificate.id
        },
        '-created_date',
        1
      );

      if (existingTasks.length === 0) {
        // Create notification task
        await base44.asServiceRole.entities.ComplianceTask.create({
          property_id: property.id,
          task_type: `${certType}_expiry_alert_${threshold}`,
          certificate_id: certificate.id,
          title: `${getCertTypeName(certType)} Certificate Expiring in ${threshold} Days`,
          description: `${getCertTypeName(certType)} certificate expires on ${certificate.expiry_date}. Please review and renew if needed.`,
          status: 'pending',
          priority: threshold === 30 ? 'urgent' : threshold === 60 ? 'high' : 'medium',
          due_date: new Date(expiryDate.getTime() - (14 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          assigned_to: null, // Will be auto-assigned based on settings
          alert_threshold: threshold,
          created_at: new Date().toISOString()
        });

        results.tasksCreated++;
      }
    }
  }

  // Create task if high risk and expiring within 60 days
  if (riskScore && riskScore.overall_risk_score >= 70 && daysUntilExpiry <= taskThreshold && daysUntilExpiry > 0) {
    const existingRiskTasks = await base44.asServiceRole.entities.ComplianceTask.filter(
      {
        property_id: property.id,
        task_type: `${certType}_risk_renewal`,
        certificate_id: certificate.id
      },
      '-created_date',
      1
    );

    if (existingRiskTasks.length === 0) {
      await base44.asServiceRole.entities.ComplianceTask.create({
        property_id: property.id,
        task_type: `${certType}_risk_renewal`,
        certificate_id: certificate.id,
        title: `URGENT: Renew ${getCertTypeName(certType)} Certificate (High Risk)`,
        description: `High compliance risk detected (Score: ${Math.round(riskScore.overall_risk_score)}/100). ${getCertTypeName(certType)} certificate expires in ${daysUntilExpiry} days.`,
        status: 'pending',
        priority: 'urgent',
        due_date: new Date(expiryDate.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        assigned_to: null,
        risk_score_triggered: riskScore.overall_risk_score,
        created_at: new Date().toISOString()
      });

      results.tasksCreated++;
    }
  }
}

async function processExpiryLicense(base44, property, licenseType, license, riskScore, results) {
  const today = new Date();
  const expiryDate = new Date(license.expiry_date);
  const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

  const thresholdDays = [90, 60, 30];
  const taskThreshold = 60;

  for (const threshold of thresholdDays) {
    if (daysUntilExpiry <= threshold && daysUntilExpiry > (threshold - 1)) {
      const existingTasks = await base44.asServiceRole.entities.ComplianceTask.filter(
        {
          property_id: property.id,
          task_type: `${licenseType}_expiry_alert_${threshold}`,
          license_id: license.id
        },
        '-created_date',
        1
      );

      if (existingTasks.length === 0) {
        await base44.asServiceRole.entities.ComplianceTask.create({
          property_id: property.id,
          task_type: `${licenseType}_expiry_alert_${threshold}`,
          license_id: license.id,
          title: `${getLicenseTypeName(licenseType)} Expiring in ${threshold} Days`,
          description: `${getLicenseTypeName(licenseType)} expires on ${license.expiry_date}. Renewal deadline: ${license.renewal_deadline || 'Contact local authority'}`,
          status: 'pending',
          priority: threshold === 30 ? 'urgent' : threshold === 60 ? 'high' : 'medium',
          due_date: new Date(expiryDate.getTime() - (14 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          assigned_to: null,
          alert_threshold: threshold,
          created_at: new Date().toISOString()
        });

        results.tasksCreated++;
      }
    }
  }

  // High-risk license renewal
  if (riskScore && riskScore.overall_risk_score >= 70 && daysUntilExpiry <= taskThreshold && daysUntilExpiry > 0) {
    const existingRiskTasks = await base44.asServiceRole.entities.ComplianceTask.filter(
      {
        property_id: property.id,
        task_type: `${licenseType}_risk_renewal`,
        license_id: license.id
      },
      '-created_date',
      1
    );

    if (existingRiskTasks.length === 0) {
      await base44.asServiceRole.entities.ComplianceTask.create({
        property_id: property.id,
        task_type: `${licenseType}_risk_renewal`,
        license_id: license.id,
        title: `URGENT: Renew ${getLicenseTypeName(licenseType)} (High Risk)`,
        description: `High compliance risk (Score: ${Math.round(riskScore.overall_risk_score)}/100). ${getLicenseTypeName(licenseType)} expires in ${daysUntilExpiry} days.`,
        status: 'pending',
        priority: 'urgent',
        due_date: new Date(expiryDate.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        assigned_to: null,
        risk_score_triggered: riskScore.overall_risk_score,
        created_at: new Date().toISOString()
      });

      results.tasksCreated++;
    }
  }
}

function getCertTypeName(type) {
  const names = {
    gas_safety: 'Gas Safety',
    electrical: 'Electrical Installation Condition',
    epc: 'Energy Performance'
  };
  return names[type] || type;
}

function getLicenseTypeName(type) {
  const names = {
    hmo_license: 'HMO License'
  };
  return names[type] || type;
}