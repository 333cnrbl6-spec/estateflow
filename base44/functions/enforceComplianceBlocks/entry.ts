import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { entityType, entityId, action } = await req.json();

    // Check if tenant can be let
    if (entityType === 'Tenant' && action === 'let_property') {
      const tenant = await base44.asServiceRole.entities.Tenant?.get?.(entityId);
      if (!tenant) return Response.json({ compliant: false, reason: 'Tenant not found' }, { status: 404 });

      const checks = await runComplianceChecks(base44, tenant);
      
      if (!checks.all_passed) {
        return Response.json({
          compliant: false,
          reason: 'Compliance checks failed',
          blocks: checks.failed_checks,
          action_required: checks.action_required
        }, { status: 403 });
      }

      return Response.json({ compliant: true });
    }

    // Check if property can be let
    if (entityType === 'Property' && action === 'let_property') {
      const property = await base44.asServiceRole.entities.Property?.get?.(entityId);
      if (!property) return Response.json({ compliant: false, reason: 'Property not found' }, { status: 404 });

      const checks = await runPropertyComplianceChecks(base44, property);

      if (!checks.all_passed) {
        return Response.json({
          compliant: false,
          reason: 'Property compliance failed',
          blocks: checks.failed_checks,
          action_required: checks.action_required
        }, { status: 403 });
      }

      return Response.json({ compliant: true });
    }

    return Response.json({ compliant: true });
  } catch (error) {
    console.error('Compliance check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function runComplianceChecks(base44, tenant) {
  const failed_checks = [];
  const action_required = [];

  // Check 1: Right to Rent verification
  if (!tenant.screening?.right_to_rent?.status || tenant.screening.right_to_rent.status !== 'verified') {
    failed_checks.push({
      check: 'right_to_rent',
      legislation: 'Immigration Act 2014',
      description: 'Right to Rent verification required',
      severity: 'CRITICAL',
      penalty: '£15,000 per unlawful letting + prosecution'
    });
    action_required.push('Complete Right to Rent verification before proceeding');
  }

  // Check 2: Right to Rent expiry
  if (tenant.screening?.right_to_rent?.expiry_date) {
    const expiryDate = new Date(tenant.screening.right_to_rent.expiry_date);
    if (expiryDate <= new Date()) {
      failed_checks.push({
        check: 'right_to_rent_expired',
        legislation: 'Immigration Act 2014',
        description: 'Right to Rent verification has expired',
        severity: 'CRITICAL',
        penalty: '£15,000 per unlawful letting'
      });
      action_required.push('Renew Right to Rent verification');
    }
  }

  // Check 3: Identity verification
  if (!tenant.screening?.identity_verification?.status || tenant.screening.identity_verification.status !== 'verified') {
    failed_checks.push({
      check: 'identity_verification',
      legislation: 'Housing Act 2004',
      description: 'Identity verification required',
      severity: 'HIGH',
      penalty: 'Defense against claims eliminated'
    });
    action_required.push('Verify tenant identity');
  }

  // Check 4: Credit check completed
  if (!tenant.screening?.credit_check?.status || tenant.screening.credit_check.status !== 'completed') {
    failed_checks.push({
      check: 'credit_check',
      legislation: 'Best Practice',
      description: 'Credit check recommended before letting',
      severity: 'MEDIUM',
      penalty: 'Increased risk if rent arrears occur'
    });
    action_required.push('Complete credit check');
  }

  return {
    all_passed: failed_checks.length === 0,
    failed_checks,
    action_required
  };
}

async function runPropertyComplianceChecks(base44, property) {
  const failed_checks = [];
  const action_required = [];

  // Check 1: Gas Safety Certificate
  const gasCerts = await base44.asServiceRole.entities.GasSafetyCertificate?.filter?.({
    property_id: property.id
  }) || [];

  const validGasCert = gasCerts.find(c => new Date(c.expiry_date) > new Date());
  if (!validGasCert && property.has_gas) {
    failed_checks.push({
      check: 'gas_safety',
      legislation: 'Gas Safety (Installation and Use) Regulations 1998',
      description: 'Valid Gas Safety Certificate required for properties with gas',
      severity: 'CRITICAL',
      penalty: '£30,000 fine + £5,000 per day'
    });
    action_required.push('Obtain valid Gas Safety Certificate (12 months validity)');
  }

  // Check 2: Electrical Certificate
  const elecCerts = await base44.asServiceRole.entities.EICRCertificate?.filter?.({
    property_id: property.id
  }) || [];

  const validElecCert = elecCerts.find(c => new Date(c.expiry_date) > new Date());
  if (!validElecCert) {
    failed_checks.push({
      check: 'electrical_safety',
      legislation: 'Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020',
      description: 'Valid Electrical Certificate (EICR) required',
      severity: 'CRITICAL',
      penalty: '£30,000 fine per breach'
    });
    action_required.push('Obtain valid EICR (max 5 years validity)');
  }

  // Check 3: EPC
  const epcs = await base44.asServiceRole.entities.EnergyPerformanceCertificate?.filter?.({
    property_id: property.id
  }) || [];

  const validEpc = epcs.find(c => new Date(c.expiry_date) > new Date());
  if (!validEpc) {
    failed_checks.push({
      check: 'epc',
      legislation: 'Energy Performance of Buildings Regulations 2012',
      description: 'Valid Energy Performance Certificate (EPC) required',
      severity: 'CRITICAL',
      penalty: '£5,000-£5,500 fine'
    });
    action_required.push('Obtain valid EPC (10 years validity)');
  }

  // Check 4: EPC Band for new lettings
  if (validEpc && new Date() > new Date('2025-01-01')) {
    const epcBand = validEpc.current_rating;
    if (['F', 'G'].includes(epcBand)) {
      failed_checks.push({
        check: 'epc_band_minimum',
        legislation: 'Energy Performance of Buildings (Minimum Standards of Performance) Regulations 2015',
        description: `Property EPC Band ${epcBand} below minimum lettable standard (Band E from 1 Apr 2020, Band D from 1 Apr 2025)`,
        severity: 'CRITICAL',
        penalty: 'Property cannot be let'
      });
      action_required.push('Improve property to meet minimum EPC Band D standard');
    }
  }

  // Check 5: Fire Risk Assessment (HMO)
  if (property.property_type === 'hmo' || property.units?.length > 5) {
    const fra = await base44.asServiceRole.entities.FireRiskAssessment?.filter?.({
      property_id: property.id
    });
    
    const validFra = fra && fra.length > 0 && fra[0].status === 'valid';
    if (!validFra) {
      failed_checks.push({
        check: 'fire_risk_assessment',
        legislation: 'Regulatory Reform (Fire Safety) Order 2005',
        description: 'Valid Fire Risk Assessment required for HMOs',
        severity: 'CRITICAL',
        penalty: '£20,000 fine + up to 2 years imprisonment'
      });
      action_required.push('Conduct annual Fire Risk Assessment by qualified assessor');
    }
  }

  return {
    all_passed: failed_checks.length === 0,
    failed_checks,
    action_required
  };
}