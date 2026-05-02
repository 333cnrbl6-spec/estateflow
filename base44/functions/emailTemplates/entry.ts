import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Updated email templates for Phase 1-4 launch positioning
const templates = {
  WELCOME_EMAIL: {
    subject: 'Welcome to Premiso — AI-Powered Property Management Platform',
    body: `Hello {userName},

Welcome to Premiso — the market-leading platform for modern property management.

You now have access to:

✅ **Compliance Intelligence** — Predictive risk scoring & automatic certificate expiry alerts
✅ **Workflow Automation** — No-code builder to automate your entire operation
✅ **Integration Marketplace** — Connect Slack, Zapier, Stripe & 100+ third-party services
✅ **Real-Time Collaboration** — Live teamwork, activity streams & instant communication

**Getting Started:**
1. Complete your profile: https://premiso.io/onboarding
2. Watch the dashboard walkthrough (5 min)
3. Set up your first property (10 min)
4. Book a personalized onboarding call: https://premiso.io/book-demo

We've included a full knowledge base, video guides, and AI Copilot to answer questions 24/7.

Questions? Email support@premiso.io or call +44 1204 695919.

Welcome aboard!
The Premiso Team`
  },

  COMPLIANCE_ALERT: {
    subject: '⚠️ Compliance Alert: {property} — {certificate} expiring in {days} days',
    body: `Hi {userName},

Your Compliance Intelligence system has identified an upcoming deadline:

📍 Property: {property}
🔍 Certificate: {certificate}
📅 Expiry Date: {expiryDate}
⏰ Days Remaining: {days}

**Recommended Action:**
1. Contact your {certificateType} assessor today
2. Schedule the inspection
3. Upload the certificate once renewed

**Pro Tip:** Use Workflow Automation to auto-send renewal reminders 60 days before expiry. Set it up in Settings > Automation > Compliance.

View Property: https://premiso.io/properties/{propertyId}

The Premiso Compliance Team`
  },

  WORKFLOW_NOTIFICATION: {
    subject: '🚀 Workflow Triggered: {workflowName}',
    body: `Hi {userName},

Your automated workflow "{workflowName}" has been triggered:

📋 Trigger: {triggerEvent}
🔗 Linked To: {entityName} ({entityId})
⏱️ Triggered At: {timestamp}
✅ Status: {workflowStatus}

**Next Steps:**
{nextSteps}

View Workflow: https://premiso.io/workflows/{workflowId}

Powered by Premiso Workflow Automation`
  },

  INTEGRATION_ALERT: {
    subject: '🔗 Integration Synced: {integrationName}',
    body: `Hi {userName},

Your {integrationName} integration has successfully synced.

📊 Records Synced: {recordCount}
⏰ Last Sync: {lastSyncTime}
✅ Status: Healthy

Connected Integrations:
• Slack — Receive compliance alerts in your team channel
• Zapier — Automate 100+ tasks
• Stripe — Collect rent payments automatically
• Xero/QuickBooks — Auto-sync financials
• Google Sheets — Export reports in real-time

Manage Integrations: https://premiso.io/integrations-marketplace

The Premiso Team`
  },

  COLLABORATION_MENTION: {
    subject: '@{mentionedBy} mentioned you in {entityName}',
    body: `Hi {mentionedBy} mentioned you in a discussion about {entityName}.

📌 Location: https://premiso.io/{entityType}/{entityId}
💬 Message: "{mentionText}"
👤 Team Member: {mentionedBy}

**Real-Time Collaboration Features:**
✓ Activity streams with @ mentions
✓ Live document editing
✓ Instant team notifications
✓ Threaded conversations

Reply directly in the platform or via email.

View Conversation: https://premiso.io/{entityType}/{entityId}/activity

The Premiso Team`
  },

  LAUNCH_ANNOUNCEMENT: {
    subject: '🚀 Premiso Phase 1-4 Launch: What\'s New',
    body: `Hi {userName},

We're thrilled to announce the complete Phase 1-4 launch of Premiso — the market-leading property management platform.

**What's New:**

🧠 **Compliance Intelligence**
— Predictive risk scoring & automatic expiry alerts
— Building Safety Register & RTM management
— Audit-ready compliance dashboard

🤖 **Workflow Automation**
— No-code workflow builder (no coding required!)
— Auto-trigger actions on schedule or event
— 50+ pre-built workflow templates

🔗 **Integration Marketplace**
— Slack, Zapier, Stripe, Xero, QBO & 100+ apps
— Webhook support for custom integrations
— Real-time data sync across all systems

👥 **Real-Time Collaboration**
— Live document editing & activity streams
— @ mentions & instant notifications
— Team workspaces & role-based access

**Get Started Today:**
Book a personalized demo: https://premiso.io/book-demo
Watch Phase 1-4 overview video: https://premiso.io/video/phase-4-launch

We're here to support your launch. Questions? Email support@premiso.io

The Premiso Team`
  },

  SALES_DEMO_INVITE: {
    subject: 'Demo: See Premiso Handle Your Specific Portfolio',
    body: `Hi {prospectName},

Thank you for your interest in Premiso.

We'd love to show you a personalized demo tailored to your property type — whether you manage ASTs, HMOs, leasehold blocks, or a mixed portfolio.

**What You'll See:**
✅ Compliance Intelligence in action (your properties, your deadlines)
✅ Workflow Automation (time-saving automations you can build today)
✅ Integration Marketplace (Slack, Zapier, financial sync)
✅ Real-Time Collaboration (your team working together)
✅ ROI calculation (exactly how much you'll save)

**Book Your Demo:**
👉 https://premiso.io/book-demo

We'll use your live data (or sample data if you prefer) to show real results.

The Premiso Sales Team
01204 695919 | sales@rbm-nw.co.uk`
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { templateName, data } = await req.json();

    if (!templates[templateName]) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    const template = templates[templateName];
    let subject = template.subject;
    let body = template.body;

    // Replace placeholders
    Object.entries(data || {}).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{${key}\\}`, 'g');
      subject = subject.replace(placeholder, value);
      body = body.replace(placeholder, value);
    });

    return Response.json({ subject, body, templateName });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});