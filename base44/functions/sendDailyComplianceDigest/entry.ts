import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('[sendDailyComplianceDigest] Starting daily digest batch...');

    // Get all active CompaniesHouseProfiles with alerts
    const profiles = await base44.asServiceRole.entities.CompaniesHouseProfile.list('-updated_date', 1000);
    
    // Group alerts by user email
    const alertsByUser = {};
    
    profiles.forEach(profile => {
      if (profile.critical_alerts && profile.critical_alerts.length > 0) {
        // Get user preferences for this profile
        // For now, we'll send to all configured alert recipients
        // In a real system, you'd link profiles to companies and companies to users
        
        profile.critical_alerts.forEach(alert => {
          // Add deadline info if available
          const alertWithDeadline = {
            ...alert,
            company_name: profile.company_name,
            company_number: profile.company_number,
            due_date: 
              alert.type === 'accounts_overdue' ? profile.accounts_filing_due :
              alert.type === 'confirmation_statement_due' ? profile.confirmation_statement_due :
              null
          };
          
          // Map to all users who should receive this
          // This would be enhanced with proper user-company mapping
          // For now, collect for digest
          if (!alertsByUser['batch']) {
            alertsByUser['batch'] = [];
          }
          alertsByUser['batch'].push(alertWithDeadline);
        });
      }
    });

    let sent = 0;
    let failed = 0;

    // Get all users with daily_digest preference enabled
    const preferences = await base44.asServiceRole.entities.ComplianceAlertPreference.filter({
      email_frequency: 'daily_digest',
      enabled: true,
      notify_via_email: true
    });

    console.log(`[sendDailyComplianceDigest] Found ${preferences.length} users with daily digest preference`);

    for (const pref of preferences) {
      try {
        // Get alerts for this user's alert types
        const userAlerts = alertsByUser['batch']?.filter(a => 
          a.type === pref.alert_type || pref.alert_type === 'all'
        ) || [];

        if (userAlerts.length > 0) {
          console.log(`[sendDailyComplianceDigest] Sending digest to ${pref.user_email} (${userAlerts.length} alerts)`);

          await base44.asServiceRole.functions.invoke('sendComplianceAlertEmail', {
            alerts: userAlerts,
            recipient_email: pref.user_email
          });

          // Update last_alert_sent
          await base44.asServiceRole.entities.ComplianceAlertPreference.update(pref.id, {
            last_alert_sent: new Date().toISOString()
          });

          sent++;
        }
      } catch (err) {
        console.error(`[sendDailyComplianceDigest] Failed to send to ${pref.user_email}:`, err.message);
        failed++;
      }
    }

    console.log(`[sendDailyComplianceDigest] Completed: ${sent} sent, ${failed} failed`);

    return Response.json({
      sent,
      failed,
      total_users: preferences.length,
      status: 'completed'
    });
  } catch (error) {
    console.error('[sendDailyComplianceDigest] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});