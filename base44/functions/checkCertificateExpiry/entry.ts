import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const COMPLIANCE_TYPES = [
  'gas_safety_cert', 'eicr', 'epc', 'fire_safety_cert', 'asbestos_report'
];

const CERT_LABELS = {
  gas_safety_cert: 'Gas Safety Certificate',
  eicr: 'Electrical Installation Condition Report (EICR)',
  epc: 'Energy Performance Certificate (EPC)',
  fire_safety_cert: 'Fire Safety Certificate',
  asbestos_report: 'Asbestos Report',
};

const THRESHOLDS = [30, 60, 90]; // days

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled (no user) or admin users
    let callerIsAdmin = false;
    try {
      const user = await base44.auth.me();
      callerIsAdmin = user?.role === 'admin';
    } catch {
      // scheduled call — proceed with service role
    }

    const today = new Date();

    // Fetch all compliance documents with expiry dates
    const allDocs = await base44.asServiceRole.entities.Document.list('-expiry_date', 500);
    const complianceDocs = allDocs.filter(d =>
      COMPLIANCE_TYPES.includes(d.document_type) && d.expiry_date
    );

    // Fetch existing recent notifications to avoid duplicates (last 2 days)
    const twoDaysAgo = new Date(today.getTime() - 2 * 86400000).toISOString();
    const recentNotifs = await base44.asServiceRole.entities.TenantNotification.list('-sent_date', 500);
    const recentKeys = new Set(
      recentNotifs
        .filter(n => n.sent_date >= twoDaysAgo)
        .map(n => n.notes) // we store a dedup key in notes
    );

    const created = [];
    const expired = [];
    const upcoming = [];

    for (const doc of complianceDocs) {
      const expiryDate = new Date(doc.expiry_date);
      const daysUntilExpiry = Math.ceil((expiryDate - today) / 86400000);
      const label = CERT_LABELS[doc.document_type] || doc.document_type.replace(/_/g, ' ');
      const propertyRef = doc.property_id ? `(Property ID: ${doc.property_id})` : '';

      if (daysUntilExpiry < 0) {
        // Already expired
        const dedupKey = `expired:${doc.id}:${doc.expiry_date}`;
        if (!recentKeys.has(dedupKey)) {
          const notif = await base44.asServiceRole.entities.TenantNotification.create({
            title: `⚠️ EXPIRED: ${label}`,
            message: `${doc.title || label} expired on ${doc.expiry_date}. Immediate renewal required to maintain legal compliance. ${propertyRef}`,
            notification_type: 'urgent',
            is_read: false,
            sent_date: new Date().toISOString(),
            notes: dedupKey,
          });
          created.push(notif);
          expired.push({ doc, daysUntilExpiry });
        }
      } else {
        // Check threshold alerts (90, 60, 30 days — only the most relevant)
        for (const threshold of THRESHOLDS) {
          if (daysUntilExpiry <= threshold) {
            const dedupKey = `expiring:${doc.id}:${threshold}d`;
            if (!recentKeys.has(dedupKey)) {
              const urgency = threshold <= 30 ? 'urgent' : 'reminder';
              const emoji = threshold <= 30 ? '🚨' : threshold <= 60 ? '⚠️' : '📅';
              const notif = await base44.asServiceRole.entities.TenantNotification.create({
                title: `${emoji} ${label} expiring in ${daysUntilExpiry} days`,
                message: `${doc.title || label} is due to expire on ${doc.expiry_date} (${daysUntilExpiry} days). Please arrange renewal to stay compliant. ${propertyRef}`,
                notification_type: urgency,
                is_read: false,
                sent_date: new Date().toISOString(),
                notes: dedupKey,
              });
              created.push(notif);
              upcoming.push({ doc, daysUntilExpiry, threshold });
            }
            break; // only fire for smallest matching threshold
          }
        }
      }
    }

    return Response.json({
      success: true,
      checked: complianceDocs.length,
      notifications_created: created.length,
      expired: expired.length,
      expiring_soon: upcoming.length,
      summary: upcoming.map(u => ({ title: u.doc.title, days: u.daysUntilExpiry, type: u.doc.document_type })),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});