import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Which certificates are required per property type
const REQUIRED_CERTS = {
  freehold_block:     ['gas_safety_cert', 'eicr', 'fire_safety_cert', 'asbestos_report'],
  leasehold_block:    ['gas_safety_cert', 'eicr', 'fire_safety_cert', 'asbestos_report'],
  rtm_block:          ['gas_safety_cert', 'eicr', 'fire_safety_cert', 'asbestos_report'],
  house:              ['gas_safety_cert', 'eicr', 'epc'],
  converted_building: ['gas_safety_cert', 'eicr', 'epc', 'fire_safety_cert'],
  mixed_use:          ['gas_safety_cert', 'eicr', 'epc', 'fire_safety_cert'],
  commercial:         ['eicr', 'fire_safety_cert', 'asbestos_report'],
  land:               [],
};

const CERT_LABELS = {
  gas_safety_cert:  'Gas Safety Certificate',
  eicr:             'Electrical Installation Condition Report (EICR)',
  epc:              'Energy Performance Certificate (EPC)',
  fire_safety_cert: 'Fire Safety Certificate',
  asbestos_report:  'Asbestos Report',
};

const CERT_RENEWAL_YEARS = {
  gas_safety_cert:  1,
  eicr:             5,
  epc:              10,
  fire_safety_cert: 1,
  asbestos_report:  5,
};

const CERT_PRIORITY = {
  gas_safety_cert:  'urgent',
  eicr:             'standard',
  epc:              'standard',
  fire_safety_cert: 'urgent',
  asbestos_report:  'standard',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date();
    const in90Days = new Date(today.getTime() + 90 * 86400000);

    // Fetch all data
    const [properties, documents, existingOrders] = await Promise.all([
      base44.asServiceRole.entities.Property.list('name', 500),
      base44.asServiceRole.entities.Document.list('-generated_date', 1000),
      base44.asServiceRole.entities.MaintenanceOrder.list('-created_date', 500),
    ]);

    // Build a map: property_id -> document_type -> best doc
    const docMap = {};
    for (const doc of documents) {
      if (!doc.property_id) continue;
      const requiredTypes = ['gas_safety_cert', 'eicr', 'epc', 'fire_safety_cert', 'asbestos_report'];
      if (!requiredTypes.includes(doc.document_type)) continue;
      if (!docMap[doc.property_id]) docMap[doc.property_id] = {};
      const existing = docMap[doc.property_id][doc.document_type];
      // Keep most recent non-archived doc
      if (!existing || (doc.expiry_date && (!existing.expiry_date || doc.expiry_date > existing.expiry_date))) {
        docMap[doc.property_id][doc.document_type] = doc;
      }
    }

    // Build set of existing maintenance order dedup keys
    const existingTaskKeys = new Set(
      existingOrders
        .filter(o => o.status !== 'cancelled' && o.status !== 'completed')
        .map(o => o.notes?.split('|')[0])
        .filter(Boolean)
    );

    const gaps = [];
    const tasksCreated = [];
    const notificationsCreated = [];

    for (const property of properties) {
      const required = REQUIRED_CERTS[property.property_type] || [];
      const propertyDocs = docMap[property.property_id || property.id] || docMap[property.id] || {};

      for (const certType of required) {
        const doc = propertyDocs[certType];
        const label = CERT_LABELS[certType];
        let gapType = null;
        let detail = '';

        if (!doc) {
          gapType = 'missing';
          detail = `No ${label} found for ${property.name}.`;
        } else if (doc.expiry_date) {
          const expiry = new Date(doc.expiry_date);
          if (expiry < today) {
            gapType = 'expired';
            detail = `${label} expired on ${doc.expiry_date} for ${property.name}.`;
          } else if (expiry <= in90Days) {
            gapType = 'expiring';
            detail = `${label} expires on ${doc.expiry_date} for ${property.name} (within 90 days).`;
          }
        }

        if (!gapType) continue;

        const dedupKey = `compliance:${certType}:${property.id}:${gapType}`;
        gaps.push({ property, certType, gapType, label, detail, dedupKey });

        // Create maintenance order task if not already exists
        if (!existingTaskKeys.has(dedupKey)) {
          try {
            const renewalYears = CERT_RENEWAL_YEARS[certType];
            const order = await base44.asServiceRole.entities.MaintenanceOrder.create({
              title: `${gapType === 'missing' ? 'Obtain' : gapType === 'expired' ? 'Renew (EXPIRED)' : 'Renew'}: ${label}`,
              description: `${detail}\n\nAction required: ${gapType === 'missing' ? `Arrange inspection and obtain a ${label}.` : `Arrange renewal. Certificate is valid for ${renewalYears} year(s).`}`,
              property_id: property.id,
              category: certType === 'gas_safety_cert' ? 'general' : certType === 'eicr' ? 'electrical' : certType === 'fire_safety_cert' ? 'fire_safety' : 'general',
              priority: gapType === 'expired' ? 'urgent' : CERT_PRIORITY[certType],
              status: 'reported',
              notes: `${dedupKey}|auto-generated`,
            });
            tasksCreated.push(order);
          } catch (taskErr) {
            console.error(`Failed to create maintenance order for ${property.id}/${certType}:`, taskErr.message);
          }
        }
      }
    }

    return Response.json({
      success: true,
      properties_audited: properties.length,
      gaps_found: gaps.length,
      tasks_created: tasksCreated.length,
      notifications_sent: notificationsCreated.length,
      gaps: gaps.map(g => ({
        property: g.property.name,
        property_id: g.property.id,
        cert_type: g.certType,
        label: g.label,
        gap_type: g.gapType,
        detail: g.detail,
        task_created: tasksCreated.some(t => t.property_id === g.property.id && t.title.includes(g.label)),
      })),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});