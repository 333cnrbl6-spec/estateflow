import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { differenceInDays, parseISO } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all properties
    const properties = await base44.entities.Property.list('-updated_date', 500);
    
    const riskScores = [];
    
    for (const property of properties) {
      const score = await calculatePropertyRiskScore(base44, property);
      riskScores.push(score);
    }

    // Sort by risk score (highest first)
    riskScores.sort((a, b) => b.overall_risk_score - a.overall_risk_score);

    return Response.json({ 
      calculated_at: new Date().toISOString(),
      scores: riskScores,
      total_properties: riskScores.length,
      high_risk_count: riskScores.filter(s => s.risk_level === 'critical' || s.risk_level === 'high').length
    });
  } catch (error) {
    console.error('Error calculating risk scores:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function calculatePropertyRiskScore(base44, property) {
  const today = new Date();
  const certificates_at_risk = [];
  const recent_incidents = [];
  const outstanding_actions = [];
  const licenses_expiring = [];

  let certificateRiskScore = 0;
  let incidentRiskScore = 0;
  let remedialRiskScore = 0;
  let licenseRiskScore = 0;

  // 1. CHECK CERTIFICATE EXPIRATIONS
  try {
    const gasCerts = await base44.entities.GasSafetyCertificate.filter(
      { property_id: property.id },
      '-expiry_date',
      5
    );
    
    for (const cert of gasCerts) {
      const daysUntilExpiry = differenceInDays(parseISO(cert.expiry_date), today);
      if (daysUntilExpiry <= 90) {
        certificates_at_risk.push({
          certificate_type: 'gas_safety',
          days_until_expiry: daysUntilExpiry,
          expiry_date: cert.expiry_date,
          entity_id: cert.id
        });
        certificateRiskScore = Math.min(100, certificateRiskScore + (daysUntilExpiry < 0 ? 50 : Math.max(0, 40 - daysUntilExpiry)));
      }
    }

    const epicCerts = await base44.entities.EICRCertificate.filter(
      { property_id: property.id },
      '-expiry_date',
      5
    );
    
    for (const cert of epicCerts) {
      const daysUntilExpiry = differenceInDays(parseISO(cert.expiry_date), today);
      if (daysUntilExpiry <= 90) {
        certificates_at_risk.push({
          certificate_type: 'electrical',
          days_until_expiry: daysUntilExpiry,
          expiry_date: cert.expiry_date,
          entity_id: cert.id
        });
        certificateRiskScore = Math.min(100, certificateRiskScore + (daysUntilExpiry < 0 ? 50 : Math.max(0, 40 - daysUntilExpiry)));
      }
    }

    const epcCerts = await base44.entities.EnergyPerformanceCertificate.filter(
      { property_id: property.id },
      '-expiry_date',
      5
    );
    
    for (const cert of epcCerts) {
      const daysUntilExpiry = differenceInDays(parseISO(cert.expiry_date), today);
      if (daysUntilExpiry <= 180) {
        certificates_at_risk.push({
          certificate_type: 'epc',
          days_until_expiry: daysUntilExpiry,
          expiry_date: cert.expiry_date,
          entity_id: cert.id
        });
        certificateRiskScore = Math.min(100, certificateRiskScore + (daysUntilExpiry < 0 ? 30 : Math.max(0, 20 - daysUntilExpiry)));
      }
    }
  } catch (err) {
    console.warn('Error checking certificates:', err.message);
  }

  // 2. CHECK INCIDENT HISTORY (last 12 months)
  try {
    const hmoLicense = await base44.entities.HMOLicense.filter(
      { property_id: property.id },
      '-created_date',
      1
    );

    if (hmoLicense.length > 0 && hmoLicense[0].breach_history) {
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      for (const breach of hmoLicense[0].breach_history) {
        const breachDate = parseISO(breach.breach_date);
        if (breachDate > oneYearAgo) {
          recent_incidents.push({
            incident_date: breach.breach_date,
            incident_type: breach.breach_type,
            severity: 'high',
            resolved: breach.resolved || false
          });
          incidentRiskScore += breach.resolved ? 10 : 20;
        }
      }
    }

    const fireRisk = await base44.entities.FireRiskAssessment.filter(
      { property_id: property.id },
      '-assessment_date',
      1
    );

    if (fireRisk.length > 0 && fireRisk[0].overall_risk_level === 'high') {
      incidentRiskScore += 15;
    }
  } catch (err) {
    console.warn('Error checking incidents:', err.message);
  }

  // 3. CHECK UNRESOLVED REMEDIAL ACTIONS
  try {
    const fireRisk = await base44.entities.FireRiskAssessment.filter(
      { property_id: property.id },
      '-assessment_date',
      1
    );

    if (fireRisk.length > 0 && fireRisk[0].remedial_actions) {
      for (const action of fireRisk[0].remedial_actions) {
        if (!action.completed_date) {
          const daysOverdue = action.deadline ? differenceInDays(today, parseISO(action.deadline)) : 0;
          outstanding_actions.push({
            action_description: action.action_description,
            priority: action.priority,
            deadline: action.deadline,
            days_overdue: Math.max(0, daysOverdue),
            source: 'FireRiskAssessment'
          });
          
          const priorityWeight = action.priority === 'immediate' ? 30 : action.priority === 'urgent' ? 20 : 10;
          remedialRiskScore += daysOverdue > 0 ? priorityWeight + daysOverdue : priorityWeight / 2;
        }
      }
    }

    const fireRegister = await base44.entities.FireSafetyRegister.filter(
      { property_id: property.id },
      '-created_date',
      1
    );

    if (fireRegister.length > 0 && fireRegister[0].remedial_actions) {
      for (const action of fireRegister[0].remedial_actions) {
        if (action.status !== 'completed') {
          const daysOverdue = action.deadline ? differenceInDays(today, parseISO(action.deadline)) : 0;
          outstanding_actions.push({
            action_description: action.description,
            priority: action.priority,
            deadline: action.deadline,
            days_overdue: Math.max(0, daysOverdue),
            source: 'FireSafetyRegister'
          });
          
          const priorityWeight = action.priority === 'immediate' ? 30 : action.priority === 'urgent' ? 20 : 10;
          remedialRiskScore += daysOverdue > 0 ? priorityWeight + daysOverdue : priorityWeight / 2;
        }
      }
    }
  } catch (err) {
    console.warn('Error checking remedial actions:', err.message);
  }

  // 4. CHECK HMO LICENSE RENEWAL
  try {
    const hmoLicense = await base44.entities.HMOLicense.filter(
      { property_id: property.id },
      '-created_date',
      1
    );

    if (hmoLicense.length > 0) {
      const daysUntilRenewal = differenceInDays(parseISO(hmoLicense[0].renewal_deadline), today);
      if (daysUntilRenewal <= 60) {
        licenses_expiring.push({
          license_type: 'HMO',
          days_until_expiry: daysUntilRenewal,
          expiry_date: hmoLicense[0].expiry_date
        });
        licenseRiskScore = Math.min(100, licenseRiskScore + (daysUntilRenewal < 0 ? 40 : Math.max(0, 30 - daysUntilRenewal)));
      }
    }
  } catch (err) {
    console.warn('Error checking licenses:', err.message);
  }

  // Calculate overall risk score (weighted average)
  const overallRiskScore = Math.round(
    (certificateRiskScore * 0.35 + incidentRiskScore * 0.25 + remedialRiskScore * 0.30 + licenseRiskScore * 0.10)
  );

  // Determine risk level
  let riskLevel = 'low';
  if (overallRiskScore >= 75) riskLevel = 'critical';
  else if (overallRiskScore >= 50) riskLevel = 'high';
  else if (overallRiskScore >= 25) riskLevel = 'medium';

  // Generate priority recommendations
  const recommendations = generateRecommendations(
    certificates_at_risk,
    outstanding_actions,
    licenses_expiring,
    incidentRiskScore
  );

  return {
    property_id: property.id,
    property_name: property.address_line_1,
    calculated_date: new Date().toISOString(),
    overall_risk_score: overallRiskScore,
    risk_level: riskLevel,
    certificate_risk_score: Math.round(certificateRiskScore),
    certificates_at_risk,
    incident_risk_score: Math.round(incidentRiskScore),
    recent_incidents,
    remedial_risk_score: Math.round(remedialRiskScore),
    outstanding_actions: outstanding_actions.slice(0, 5),
    license_risk_score: Math.round(licenseRiskScore),
    licenses_expiring,
    priority_recommendations: recommendations
  };
}

function generateRecommendations(certs, actions, licenses, incidentScore) {
  const recommendations = [];

  // Certificate recommendations
  certs.forEach(cert => {
    if (cert.days_until_expiry < 0) {
      recommendations.push({
        recommendation: `${cert.certificate_type.replace(/_/g, ' ')} certificate EXPIRED ${Math.abs(cert.days_until_expiry)} days ago`,
        urgency: 'immediate',
        category: 'certificate_renewal'
      });
    } else if (cert.days_until_expiry < 30) {
      recommendations.push({
        recommendation: `Renew ${cert.certificate_type.replace(/_/g, ' ')} certificate (${cert.days_until_expiry} days remaining)`,
        urgency: 'urgent',
        category: 'certificate_renewal'
      });
    }
  });

  // Remedial action recommendations
  actions
    .filter(a => a.days_overdue > 0)
    .slice(0, 2)
    .forEach(action => {
      recommendations.push({
        recommendation: `Complete overdue remedial action: ${action.action_description} (${action.days_overdue} days overdue)`,
        urgency: action.priority === 'immediate' ? 'immediate' : 'urgent',
        category: 'remedial_action'
      });
    });

  // License recommendations
  licenses.forEach(lic => {
    if (lic.days_until_expiry < 30) {
      recommendations.push({
        recommendation: `Renew ${lic.license_type} license (${lic.days_until_expiry} days remaining)`,
        urgency: 'urgent',
        category: 'license_renewal'
      });
    }
  });

  // Incident-based recommendations
  if (incidentScore > 30) {
    recommendations.push({
      recommendation: 'Recent incidents detected - schedule compliance review and remediation planning',
      urgency: 'important',
      category: 'compliance_check'
    });
  }

  return recommendations.slice(0, 5);
}