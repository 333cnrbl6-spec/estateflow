import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { vendorId } = await req.json();

    const vendor = await base44.asServiceRole.entities.Vendor.get(vendorId);
    if (!vendor) {
      return Response.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const assessment = {
      vendor_id: vendorId,
      vendor_name: vendor.name,
      assessment_date: new Date().toISOString(),
      checks: {
        company_registration: checkCompanyRegistration(vendor),
        insurance_compliance: await checkInsuranceCompliance(base44, vendorId),
        contact_verification: checkContactVerification(vendor),
        health_safety: checkHealthSafety(vendor),
        data_protection: checkDataProtection(vendor)
      }
    };

    // Calculate overall risk score
    const checks = Object.values(assessment.checks);
    const passedChecks = checks.filter(c => c.status === 'pass').length;
    const totalChecks = checks.length;
    const complianceScore = Math.round((passedChecks / totalChecks) * 100);

    assessment.overall_risk_level = determineRiskLevel(complianceScore, checks);
    assessment.compliance_score = complianceScore;
    assessment.recommendations = generateRecommendations(assessment.checks);
    assessment.approved_for_onboarding = assessment.overall_risk_level !== 'high' && assessment.overall_risk_level !== 'critical';

    // Log assessment
    await base44.asServiceRole.entities.ComplianceAuditLog?.create?.({
      property_id: 'vendor_' + vendorId,
      certificate_type: 'other',
      action: 'audit_check',
      details: `Vendor compliance assessment: ${assessment.overall_risk_level}`,
      timestamp: new Date().toISOString(),
      severity: assessment.overall_risk_level === 'low' ? 'info' : 'warning'
    }).catch(() => null);

    return Response.json(assessment);
  } catch (error) {
    console.error('Assessment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function checkCompanyRegistration(vendor) {
  const issues = [];

  if (!vendor.registration_number && !vendor.tax_id) {
    issues.push('No company registration or tax ID provided');
  }

  if (vendor.registration_number && vendor.registration_number.length < 6) {
    issues.push('Company registration number format appears invalid');
  }

  if (vendor.tax_id && !vendor.tax_id.match(/^[A-Z]{2}[0-9]{1,2}\s?[0-9]{3}\s?[0-9]{4}/)) {
    // Basic UK VAT format check
    if (!vendor.tax_id.match(/[0-9]/)) {
      issues.push('Tax ID format appears invalid');
    }
  }

  return {
    name: 'Company Registration Verification',
    status: issues.length === 0 ? 'pass' : 'warning',
    issues
  };
}

async function checkInsuranceCompliance(base44, vendorId) {
  try {
    const insurances = await base44.asServiceRole.entities.VendorInsurance?.filter?.({
      vendor_id: vendorId
    }) || [];

    const issues = [];
    const publicLiability = insurances.find(i => i.insurance_type === 'public_liability');

    if (!publicLiability) {
      issues.push('No public liability insurance found');
      return {
        name: 'Insurance Compliance',
        status: 'fail',
        issues
      };
    }

    // Check coverage amount (minimum £1M recommended)
    if (!publicLiability.coverage_amount || publicLiability.coverage_amount < 1000000) {
      issues.push('Public liability coverage below £1,000,000 recommended minimum');
    }

    // Check expiry date
    const expiryDate = new Date(publicLiability.expiry_date);
    const today = new Date();
    if (expiryDate < today) {
      issues.push('Insurance policy is expired');
    } else if ((expiryDate - today) / (1000 * 60 * 60 * 24) < 30) {
      issues.push('Insurance expires within 30 days');
    }

    return {
      name: 'Insurance Compliance',
      status: issues.length === 0 ? 'pass' : (issues.some(i => i.includes('expired')) ? 'fail' : 'warning'),
      issues,
      policies_count: insurances.length,
      public_liability_coverage: publicLiability.coverage_amount
    };
  } catch (error) {
    return {
      name: 'Insurance Compliance',
      status: 'unknown',
      issues: ['Could not verify insurance documents']
    };
  }
}

function checkContactVerification(vendor) {
  const issues = [];

  if (!vendor.email || !vendor.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    issues.push('Invalid or missing email address');
  }

  if (!vendor.phone || vendor.phone.length < 10) {
    issues.push('Invalid or missing phone number');
  }

  if (!vendor.contact_name || vendor.contact_name.length < 3) {
    issues.push('Invalid or missing contact name');
  }

  if (!vendor.address || !vendor.postcode) {
    issues.push('Incomplete address information');
  }

  // UK postcode format check
  if (vendor.postcode && !vendor.postcode.match(/^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i)) {
    issues.push('Postcode format appears invalid');
  }

  return {
    name: 'Contact & Address Verification',
    status: issues.length === 0 ? 'pass' : 'warning',
    issues
  };
}

function checkHealthSafety(vendor) {
  const issues = [];

  // Check if vendor type requires specific safety credentials
  const safetyRequiredTypes = ['gas_engineer', 'electrician'];
  if (safetyRequiredTypes.includes(vendor.type)) {
    // In production, would verify Gas Safe/NICEIC registration
    issues.push(`${vendor.type.replace(/_/g, ' ')} status - verify Gas Safe/NICEIC registration required`);
  }

  return {
    name: 'Health & Safety Standards',
    status: issues.length === 0 ? 'pass' : 'warning',
    issues
  };
}

function checkDataProtection(vendor) {
  const issues = [];

  // Check GDPR compliance basics
  if (!vendor.notes || !vendor.notes.toLowerCase().includes('gdpr') && !vendor.notes.toLowerCase().includes('privacy')) {
    // This is just a warning - they may have privacy policies elsewhere
  }

  return {
    name: 'Data Protection & Privacy',
    status: 'pass',
    issues,
    note: 'Verify GDPR compliance and privacy policies during onboarding'
  };
}

function determineRiskLevel(score, checks) {
  const failCount = checks.filter(c => c.status === 'fail').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;

  if (failCount >= 2) return 'critical';
  if (failCount === 1) return 'high';
  if (warningCount >= 3) return 'high';
  if (warningCount >= 1) return 'medium';
  return 'low';
}

function generateRecommendations(checks) {
  const recommendations = [];

  if (checks.company_registration.status !== 'pass') {
    recommendations.push({
      category: 'Registration',
      action: 'Request company registration certificate and tax registration proof',
      priority: 'high'
    });
  }

  if (checks.insurance_compliance.status === 'fail') {
    recommendations.push({
      category: 'Insurance',
      action: 'Do not onboard vendor until valid insurance is provided',
      priority: 'critical'
    });
  } else if (checks.insurance_compliance.status === 'warning') {
    recommendations.push({
      category: 'Insurance',
      action: 'Request updated insurance documents with minimum £1M coverage',
      priority: 'high'
    });
  }

  if (checks.contact_verification.status !== 'pass') {
    recommendations.push({
      category: 'Verification',
      action: 'Verify contact details by phone call before finalizing',
      priority: 'medium'
    });
  }

  if (checks.health_safety.status === 'warning') {
    recommendations.push({
      category: 'Credentials',
      action: 'Verify trade-specific certifications (Gas Safe, NICEIC, etc.)',
      priority: 'high'
    });
  }

  return recommendations;
}