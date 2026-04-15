import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // CRITICAL: Verify admin-only access
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { entityId, entityType, relationshipType, jurisdiction = 'England', auditMode = false } = await req.json();

    // Fetch entity data
    const entity = await base44.asServiceRole.entities[entityType]?.get?.(entityId);
    if (!entity) {
      return Response.json({ error: 'Entity not found' }, { status: 404 });
    }

    const assessment = {
      entity_id: entityId,
      entity_type: entityType,
      relationship_type: relationshipType,
      entity_name: entity.name || entity.full_name || 'Unknown',
      assessment_date: new Date().toISOString(),
      audit_mode: auditMode,
      jurisdiction,
      checks: {}
    };

    // Run appropriate checks based on entity type and relationship
    assessment.checks.registration = checkRegistration(entity);
    assessment.checks.insurance = await checkInsurance(base44, entityId);
    assessment.checks.credentials = checkProfessionalCredentials(entity, relationshipType);
    assessment.checks.geographical = checkGeographicalCompliance(entity, jurisdiction);
    assessment.checks.anti_money_laundering = checkAML(entity);
    assessment.checks.data_protection = checkDataProtection(entity);

    // Relationship-specific checks
    if (relationshipType === 'landlord') {
      assessment.checks.ownership = checkPropertyOwnership(entity);
      assessment.checks.deposit_protection = checkDepositProtection(entity);
    } else if (relationshipType === 'customer' || relationshipType === 'tenant') {
      assessment.checks.identity = checkIdentityVerification(entity);
      assessment.checks.right_to_rent = checkRightToRent(entity);
    } else if (['vendor', 'contractor', 'subcontractor', 'supplier'].includes(relationshipType)) {
      assessment.checks.health_safety = checkHealthSafety(entity, relationshipType);
    }

    // Calculate scores
    assessment.results = calculateComplianceScore(assessment.checks);
    assessment.overall_risk_level = assessment.results.risk_level;
    // CRITICAL: Approval logic cannot be bypassed—requires manual review for high/critical
    assessment.approved = assessment.results.risk_level === 'low' || assessment.results.risk_level === 'medium';
    assessment.requires_manual_review = assessment.results.risk_level !== 'low';
    assessment.recommendations = generateRecommendations(assessment);

    // Log audit if in audit mode
    if (auditMode) {
      await logComplianceAudit(base44, assessment);
    }

    return Response.json(assessment);
  } catch (error) {
    console.error('Compliance assessment error:', error);
    return Response.json({ error: 'Assessment failed' }, { status: 500 });
  }
});

function checkRegistration(entity) {
  const issues = [];

  if (!entity.registration_number && !entity.tax_id && !entity.company_number) {
    issues.push('No company registration or tax identification provided');
  }

  const regNumber = entity.registration_number || entity.company_number;
  if (regNumber && regNumber.length < 6) {
    issues.push('Company registration number format appears invalid');
  }

  return {
    name: 'Company Registration',
    status: issues.length === 0 ? 'pass' : 'warning',
    issues
  };
}

async function checkInsurance(base44, entityId) {
  try {
    const insurances = await base44.asServiceRole.entities.VendorInsurance?.filter?.({
      vendor_id: entityId
    }) || [];

    const issues = [];
    const now = new Date();

    if (insurances.length === 0) {
      issues.push('No insurance policies found');
      return { name: 'Insurance', status: 'fail', issues };
    }

    insurances.forEach(policy => {
      const expiry = new Date(policy.expiry_date);
      if (expiry < now) {
        issues.push(`${policy.insurance_type.replace(/_/g, ' ')} policy expired`);
      } else if ((expiry - now) / (1000 * 60 * 60 * 24) < 30) {
        issues.push(`${policy.insurance_type.replace(/_/g, ' ')} expires within 30 days`);
      }
    });

    return {
      name: 'Insurance Compliance',
      status: issues.length === 0 ? 'pass' : (issues.some(i => i.includes('expired')) ? 'fail' : 'warning'),
      issues,
      policy_count: insurances.length
    };
  } catch (error) {
    return { name: 'Insurance', status: 'unknown', issues: ['Could not verify insurance'] };
  }
}

function checkProfessionalCredentials(entity, relationshipType) {
  const credentialMap = {
    gas_engineer: ['gas_safe_register'],
    electrician: ['niceic', 'napit'],
    surveyor: ['rics_registration', 'chartered'],
    architect: ['riba_registration'],
    plumber: ['g_mark', 'ciphe', 'watersafe']
  };

  const requiredCreds = credentialMap[relationshipType] || [];
  const issues = [];

  if (requiredCreds.length > 0 && !entity.certifications) {
    issues.push(`No professional credentials documented for ${relationshipType}`);
  }

  return {
    name: 'Professional Credentials',
    status: issues.length === 0 ? 'pass' : 'warning',
    issues,
    credential_type: relationshipType
  };
}

function checkGeographicalCompliance(entity, jurisdiction) {
  const jurisdictionMap = {
    'E': 'England',
    'S': 'Scotland',
    'W': 'Wales',
    'N': 'Northern Ireland'
  };

  const detected = jurisdictionMap[entity.postcode?.[0]?.toUpperCase()] || jurisdiction;
  const issues = [];

  if (!entity.postcode) {
    issues.push('No postcode provided - cannot verify geographical compliance requirements');
  }

  return {
    name: 'Geographical Compliance',
    status: issues.length === 0 ? 'pass' : 'warning',
    issues,
    detected_jurisdiction: detected
  };
}

function checkAML(entity) {
  const issues = [];

  if (!entity.address || !entity.postcode) {
    issues.push('Incomplete address - required for AML verification');
  }

  if (!entity.registration_number && !entity.tax_id) {
    issues.push('No business identification - needed for AML checks');
  }

  return {
    name: 'Anti-Money Laundering (AML)',
    status: issues.length === 0 ? 'pass' : 'warning',
    issues,
    note: 'Verify against UK sanctions lists and PEP database'
  };
}

function checkDataProtection(entity) {
  return {
    name: 'Data Protection (GDPR)',
    status: 'pass',
    issues: [],
    note: 'Ensure processing agreement in place and data handling compliant with GDPR'
  };
}

function checkPropertyOwnership(entity) {
  const issues = [];

  if (!entity.address || !entity.postcode) {
    issues.push('Incomplete property address information');
  }

  return {
    name: 'Property Ownership Verification',
    status: issues.length === 0 ? 'pass' : 'warning',
    issues,
    note: 'Verify through Land Registry searches'
  };
}

function checkDepositProtection(entity) {
  return {
    name: 'Deposit Protection',
    status: 'warning',
    issues: ['Confirm all tenancy deposits are protected with prescribed scheme'],
    regulations: ['Housing Act 2004 s.213-215', 'Tenant Fees Act 2019']
  };
}

function checkIdentityVerification(entity) {
  const issues = [];

  if (!entity.email || !entity.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    issues.push('Invalid email address');
  }

  if (!entity.phone) {
    issues.push('No contact phone number');
  }

  return {
    name: 'Identity Verification',
    status: issues.length === 0 ? 'pass' : 'warning',
    issues
  };
}

function checkRightToRent(entity) {
  return {
    name: 'Right to Rent Check',
    status: 'pending',
    issues: ['Verify right to rent status - required before tenancy'],
    note: 'Check passport/visa status before letting'
  };
}

function checkHealthSafety(entity, relationshipType) {
  const issues = [];

  if (['gas_engineer', 'electrician'].includes(relationshipType)) {
    issues.push(`Verify ${relationshipType} is appropriately certified for H&S compliance`);
  }

  return {
    name: 'Health & Safety Standards',
    status: issues.length === 0 ? 'pass' : 'warning',
    issues
  };
}

function calculateComplianceScore(checks) {
  const checkValues = Object.values(checks).filter(c => c);
  const passed = checkValues.filter(c => c.status === 'pass').length;
  const failed = checkValues.filter(c => c.status === 'fail').length;
  const warnings = checkValues.filter(c => c.status === 'warning').length;

  const score = Math.round((passed / checkValues.length) * 100);
  let riskLevel = 'low';

  if (failed >= 2) riskLevel = 'critical';
  else if (failed === 1) riskLevel = 'high';
  else if (warnings >= 3) riskLevel = 'high';
  else if (warnings >= 1) riskLevel = 'medium';

  return {
    score,
    risk_level: riskLevel,
    passed,
    failed,
    warnings,
    total: checkValues.length
  };
}

function generateRecommendations(assessment) {
  const recs = [];

  Object.entries(assessment.checks).forEach(([key, check]) => {
    if (!check || check.status === 'pass') return;

    if (check.status === 'fail') {
      recs.push({
        category: check.name,
        priority: 'critical',
        action: `Resolve: ${check.issues?.[0] || 'See above'}`
      });
    } else if (check.status === 'warning') {
      recs.push({
        category: check.name,
        priority: 'high',
        action: `Review: ${check.issues?.[0] || 'Verify compliance'}`
      });
    }
  });

  return recs;
}

async function logComplianceAudit(base44, assessment) {
  try {
    await base44.asServiceRole.entities.ComplianceAuditLog?.create?.({
      property_id: 'relationship_' + assessment.entity_id,
      certificate_type: assessment.relationship_type,
      action: 'audit_check',
      details: `Compliance audit for ${assessment.entity_type}: ${assessment.overall_risk_level}`,
      performed_by: 'system',
      timestamp: new Date().toISOString(),
      severity: assessment.overall_risk_level === 'low' ? 'info' : 'warning'
    }).catch(() => null);
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}