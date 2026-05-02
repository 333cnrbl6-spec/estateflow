import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const checklist = {
      timestamp: new Date().toISOString(),
      date: 'May 8, 2026',
      status: 'PRE_LAUNCH',
      sections: {
        prelaunch_6am: {
          time: '06:00 UTC',
          tasks: [
            { id: 'db_backup', name: 'Final database backup', completed: false, critical: true },
            { id: 'health_check', name: 'Run health checks on all services', completed: false, critical: true },
            { id: 'monitor_verify', name: 'Verify Sentry & monitoring alerts', completed: false, critical: true }
          ]
        },
        launch_7am: {
          time: '07:00 UTC',
          tasks: [
            { id: 'stripe_live', name: 'Switch Stripe to live mode', completed: false, critical: true },
            { id: 'email_test', name: 'Send test welcome email', completed: false, critical: true },
            { id: 'dns_verify', name: 'Verify DNS for webhooks', completed: false, critical: false }
          ]
        },
        launch_8am: {
          time: '08:00 UTC',
          tasks: [
            { id: 'team_briefing', name: 'Team standup & incident contacts', completed: false, critical: true },
            { id: 'rollback_plan', name: 'Confirm rollback procedure', completed: false, critical: true },
            { id: 'comms_ready', name: 'Launch announcement ready', completed: false, critical: false }
          ]
        },
        go_live_9am: {
          time: '09:00 UTC',
          tasks: [
            { id: 'enable_users', name: '🚀 ENABLE BETA USER ACCESS', completed: false, critical: true },
            { id: 'smoke_test', name: 'Run smoke tests', completed: false, critical: true },
            { id: 'monitor_logins', name: 'Monitor first user logins', completed: false, critical: true }
          ]
        }
      },
      incident_contacts: {
        oncall_ops: '+44 [NUMBER]',
        cto_email: '[EMAIL]',
        support_slack: '#launch-support',
        stripe_support: 'dashboard.stripe.com'
      },
      success_criteria: {
        user_logins: '200 users can login without errors',
        api_latency: 'Response time < 500ms p95',
        error_rate: 'Error rate < 0.1%',
        payments: 'Stripe payments processing',
        emails: 'Emails delivering to users',
        database: 'No connection pool issues',
        monitoring: 'All alerts functioning'
      },
      rollback_triggers: [
        'Error rate > 1%',
        'API latency > 1 second',
        'Payment webhook failures > 5',
        'Database connection pool exhaustion',
        'Email delivery failures > 10%'
      ]
    };

    // Log launch day start
    await base44.functions.invoke('auditLog', {
      event_type: 'launch_day_initiated',
      details: {
        timestamp: new Date().toISOString(),
        checklist_status: checklist.status
      }
    });

    return Response.json(checklist);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});