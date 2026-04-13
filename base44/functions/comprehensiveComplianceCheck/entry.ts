import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { differenceInDays, parseISO } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Use service role for scheduled compliance checks
    console.log('Running comprehensive compliance check');

    const today = new Date();
    const complianceIssues = [];
    let alertsSent = 0;

    // 1. Gas Safety Checks
    const gasCerts = await base44.asServiceRole.entities.GasSafetyCertificate.list();
    for (const cert of gasCerts) {
      if (!cert.expiry_date) continue;
      
      const daysUntilExpiry = differenceInDays(parseISO(cert.expiry_date), today);
      
      if (daysUntilExpiry < 0) {
        complianceIssues.push({
          type: 'gas_safety_expired',
          severity: 'critical',
          property_id: cert.property_id,
          details: `Gas certificate expired ${Math.abs(daysUntilExpiry)} days ago`,
          penalty: '£7,000 per breach',
        });
      } else if (daysUntilExpiry <= 30) {
        complianceIssues.push({
          type: 'gas_safety_expiring',
          severity: 'critical',
          property_id: cert.property_id,
          days_left: daysUntilExpiry,
          details: `Gas certificate expires in ${daysUntilExpiry} days`,
        });
      }
      
      // Check tenant copy served
      if (cert.issue_date && !cert.tenant_copy_served_date) {
        const daysSinceIssue = differenceInDays(today, parseISO(cert.issue_date));
        if (daysSinceIssue > 28) {
          complianceIssues.push({
            type: 'gas_safety_tenant_copy_not_served',
            severity: 'high',
            property_id: cert.property_id,
            details: `Tenant copy not served within 28 days (${daysSinceIssue} days overdue)`,
            penalty: '£7,000',
          });
        }
      }
    }

    // 2. EICR Checks
    const eicrCerts = await base44.asServiceRole.entities.EICRCertificate.list();
    for (const cert of eicrCerts) {
      if (!cert.next_due_date) continue;
      
      const daysUntilDue = differenceInDays(parseISO(cert.next_due_date), today);
      
      if (daysUntilDue < 0) {
        complianceIssues.push({
          type: 'eicr_expired',
          severity: 'critical',
          property_id: cert.property_id,
          details: `EICR expired ${Math.abs(daysUntilDue)} days ago`,
          penalty: 'Up to £30,000',
        });
      } else if (daysUntilDue <= 90) {
        complianceIssues.push({
          type: 'eicr_expiring',
          severity: 'high',
          property_id: cert.property_id,
          days_left: daysUntilDue,
          details: `EICR due in ${daysUntilDue} days`,
        });
      }
      
      // Check remedial work deadline
      if (cert.remedial_work_required && cert.remedial_work_deadline) {
        const daysUntilDeadline = differenceInDays(parseISO(cert.remedial_work_deadline), today);
        if (daysUntilDeadline < 0 && !cert.remedial_completion_date) {
          complianceIssues.push({
            type: 'eicr_remedial_overdue',
            severity: 'critical',
            property_id: cert.property_id,
            details: `C1/C2 remedial work overdue by ${Math.abs(daysUntilDeadline)} days`,
            penalty: 'Up to £30,000',
          });
        } else if (daysUntilDeadline <= 7 && !cert.remedial_completion_date) {
          complianceIssues.push({
            type: 'eicr_remedial_urgent',
            severity: 'critical',
            property_id: cert.property_id,
            days_left: daysUntilDeadline,
            details: `C1/C2 remedial work due in ${daysUntilDeadline} days`,
          });
        }
      }
    }

    // 3. Deposit Protection Checks
    const deposits = await base44.asServiceRole.entities.DepositProtection.list();
    for (const deposit of deposits) {
      if (!deposit.deposit_received_date) continue;
      
      const daysSinceReceived = differenceInDays(today, parseISO(deposit.deposit_received_date));
      
      // Check if protected within 30 days
      if (daysSinceReceived > 30 && !deposit.protected_date) {
        complianceIssues.push({
          type: 'deposit_not_protected',
          severity: 'critical',
          tenancy_id: deposit.tenancy_id,
          details: `Deposit not protected within 30 days (${daysSinceReceived} days elapsed)`,
          penalty: `1-3x deposit amount (£${deposit.penalty_exposure || 'unknown'})`,
        });
      }
      
      // Check prescribed information served
      if (deposit.protected_date && !deposit.prescribed_info_served_date) {
        const daysSinceProtected = differenceInDays(today, parseISO(deposit.protected_date));
        if (daysSinceProtected > 30) {
          complianceIssues.push({
            type: 'prescribed_info_not_served',
            severity: 'high',
            tenancy_id: deposit.tenancy_id,
            details: `Prescribed information not served within 30 days of protection`,
            penalty: 'Up to 3x deposit',
          });
        }
      }
    }

    // 4. Right to Rent Checks
    const rtrChecks = await base44.asServiceRole.entities.RightToRentCheck.list();
    for (const check of rtrChecks) {
      // Check follow-up required
      if (check.follow_up_check_required && check.follow_up_check_date) {
        const daysUntilFollowUp = differenceInDays(parseISO(check.follow_up_check_date), today);
        if (daysUntilFollowUp < 0 && !check.follow_up_check_completed) {
          complianceIssues.push({
            type: 'right_to_rent_followup_overdue',
            severity: 'critical',
            tenant_id: check.tenant_id,
            details: `Right to Rent follow-up check overdue by ${Math.abs(daysUntilFollowUp)} days`,
            penalty: 'Up to £10,000 (first), £20,000 (repeat)',
          });
        } else if (daysUntilFollowUp <= 14 && !check.follow_up_check_completed) {
          complianceIssues.push({
            type: 'right_to_rent_followup_due',
            severity: 'high',
            tenant_id: check.tenant_id,
            days_left: daysUntilFollowUp,
            details: `Right to Rent follow-up due in ${daysUntilFollowUp} days`,
          });
        }
      }
      
      // Check visa expiry
      if (check.document_expiry_date) {
        const daysUntilExpiry = differenceInDays(parseISO(check.document_expiry_date), today);
        if (daysUntilExpiry < 0) {
          complianceIssues.push({
            type: 'right_to_rent_visa_expired',
            severity: 'critical',
            tenant_id: check.tenant_id,
            details: `Tenant's visa/permission expired ${Math.abs(daysUntilExpiry)} days ago`,
            penalty: 'Civil penalty + potential criminal offence',
          });
        } else if (daysUntilExpiry <= 60) {
          complianceIssues.push({
            type: 'right_to_rent_visa_expiring',
            severity: 'high',
            tenant_id: check.tenant_id,
            days_left: daysUntilExpiry,
            details: `Tenant's visa expires in ${daysUntilExpiry} days`,
          });
        }
      }
    }

    // 5. Fire Safety Assessments (from BuildingSafety)
    const buildingSafety = await base44.asServiceRole.entities.BuildingSafety.list();
    for (const bs of buildingSafety) {
      if (bs.fire_safety?.fire_risk_assessment?.next_assessment_due) {
        const daysUntilDue = differenceInDays(parseISO(bs.fire_safety.fire_risk_assessment.next_assessment_due), today);
        if (daysUntilDue < 0) {
          complianceIssues.push({
            type: 'fire_assessment_overdue',
            severity: 'critical',
            property_id: bs.property_id,
            details: `Fire Risk Assessment overdue by ${Math.abs(daysUntilDue)} days`,
            penalty: 'Unlimited fine + imprisonment',
          });
        } else if (daysUntilDue <= 30) {
          complianceIssues.push({
            type: 'fire_assessment_due',
            severity: 'high',
            property_id: bs.property_id,
            days_left: daysUntilDue,
            details: `Fire Risk Assessment due in ${daysUntilDue} days`,
          });
        }
      }
    }

    // Send email alerts for critical issues
    const criticalIssues = complianceIssues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      const users = await base44.asServiceRole.entities.User.list();
      const admins = users.filter(u => u.role === 'admin');
      
      for (const admin of admins) {
        try {
          await base44.integrations.Core.SendEmail({
            to: admin.email,
            subject: `URGENT: ${criticalIssues.length} Critical Compliance Issues Detected`,
            body: generateCriticalAlertEmail(criticalIssues),
          });
          alertsSent++;
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
        }
      }
    }

    return Response.json({ 
      success: true,
      message: `Compliance check completed: ${complianceIssues.length} issues found (${criticalIssues.length} critical)`,
      totalIssues: complianceIssues.length,
      criticalIssues: criticalIssues.length,
      issues: complianceIssues,
      alertsSent,
    });

  } catch (error) {
    console.error('Error in compliance check:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});

function generateCriticalAlertEmail(issues) {
  return `
CRITICAL COMPLIANCE ISSUES DETECTED

Dear Property Manager,

Our automated compliance monitoring system has identified ${issues.length} critical issues requiring immediate attention:

${issues.map((issue, idx) => `
${idx + 1}. ${issue.type.toUpperCase().replace(/_/g, ' ')}
   Property/Tenant: ${issue.property_id || issue.tenancy_id || issue.tenant_id || 'N/A'}
   Details: ${issue.details}
   Potential Penalty: ${issue.penalty || 'N/A'}
`).join('\n')}

IMMEDIATE ACTION REQUIRED

These compliance breaches expose the company to significant financial penalties and potential criminal liability. Please address each issue immediately.

This is an automated alert from Premiso Compliance System.
  `.trim();
}