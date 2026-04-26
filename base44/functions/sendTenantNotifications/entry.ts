import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get active tenants in smaller batches to avoid rate limits
    const tenants = await base44.asServiceRole.entities.Tenant.filter({ status: 'active' }).catch(() => []);

    if (!tenants || tenants.length === 0) {
      return Response.json({ success: true, notified: 0, processed: 0 });
    }

    let notificationCount = 0;
    let errorCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Process in chunks to avoid overwhelming the API
    const BATCH_SIZE = 10;
    for (let i = 0; i < tenants.length; i += BATCH_SIZE) {
      const batch = tenants.slice(i, i + BATCH_SIZE);
      
      for (const tenant of batch) {
        try {
        // Check for upcoming rent payments (7 days ahead)
        const rentDueDate = new Date(tenant.rent_due_date || tenant.tenancy_start_date);
        if (rentDueDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
          await createNotification(base44, tenant.id, {
            type: 'rent_payment_due',
            title: 'Rent Payment Due Soon',
            message: `Your rent payment is due on ${rentDueDate.toLocaleDateString('en-GB')}. Please ensure payment is made on time.`,
            due_date: rentDueDate.toISOString().split('T')[0],
            action_url: '/tenant-payments'
          }, tenant.email);
          notificationCount++;
        }

        // Check for overdue rent
        const lastPaymentDate = tenant.last_rent_payment_date ? new Date(tenant.last_rent_payment_date) : new Date(tenant.tenancy_start_date);
        const daysSinceLastPayment = Math.floor((today - lastPaymentDate) / (1000 * 60 * 60 * 24));
        if (daysSinceLastPayment > 30) {
          await createNotification(base44, tenant.id, {
            type: 'rent_payment_overdue',
            title: '⚠️ Rent Payment Overdue',
            message: 'Your rent payment is now overdue. Please contact your landlord immediately.',
            action_url: '/tenant-payments'
          }, tenant.email);
          notificationCount++;
        }

        // Check for upcoming inspections (14 days ahead)
        const inspections = await base44.asServiceRole.entities.PropertyInspection.filter({
          tenant_id: tenant.id,
          status: { $nin: ['completed', 'tenant_signed'] }
        });

        if (inspections) {
          for (const inspection of inspections) {
            const inspectionDate = new Date(inspection.scheduled_date);
            const daysUntilInspection = Math.floor((inspectionDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysUntilInspection > 0 && daysUntilInspection <= 14) {
              await createNotification(base44, tenant.id, {
                type: 'inspection_scheduled',
                title: 'Property Inspection Scheduled',
                message: `A property inspection is scheduled for ${inspectionDate.toLocaleDateString('en-GB')}. Please ensure the property is accessible.`,
                related_entity_id: inspection.id,
                related_entity_type: 'PropertyInspection',
                due_date: inspection.scheduled_date.split('T')[0],
                action_url: '/tenant-dashboard'
              }, tenant.email);
              notificationCount++;
            }
          }
        }

        // Check for expiring documents (30 days ahead)
        const documents = await base44.asServiceRole.entities.Document.filter({
          tenant_id: tenant.id,
          status: { $ne: 'archived' }
        });

        if (documents) {
          for (const doc of documents) {
            if (doc.expiry_date) {
              const expiryDate = new Date(doc.expiry_date);
              const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
              
              if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
                await createNotification(base44, tenant.id, {
                  type: 'document_expiring',
                  title: `Document Expiring: ${doc.document_type}`,
                  message: `Your ${doc.document_type} expires on ${expiryDate.toLocaleDateString('en-GB')}. Please renew it.`,
                  related_entity_id: doc.id,
                  related_entity_type: 'Document',
                  due_date: doc.expiry_date,
                  action_url: '/tenant-portal'
                }, tenant.email);
                notificationCount++;
              }
            }
          }
        }

        // Check for tenancy renewal (30 days before end)
        if (tenant.tenancy_end_date) {
          const endDate = new Date(tenant.tenancy_end_date);
          const daysUntilEnd = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
          
          if (daysUntilEnd > 0 && daysUntilEnd <= 30) {
            await createNotification(base44, tenant.id, {
              type: 'tenancy_renewal',
              title: 'Tenancy Renewal Coming Up',
              message: `Your tenancy ends on ${endDate.toLocaleDateString('en-GB')}. Contact your landlord to discuss renewal.`,
              due_date: tenant.tenancy_end_date,
              action_url: '/tenant-dashboard'
            }, tenant.email);
            notificationCount++;
          }
        }
      } catch (err) {
         console.error(`Error processing notifications for tenant ${tenant.id}:`, err.message);
         errorCount++;
      }
      }

      // Small delay between batches to avoid rate limits
      if (i + BATCH_SIZE < tenants.length) {
       await new Promise(resolve => setTimeout(resolve, 500));
      }
      }

      return Response.json({
      success: errorCount < tenants.length,
      notified: notificationCount,
      processed_tenants: tenants.length,
      errors: errorCount
      });
  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});

async function createNotification(base44, tenantId, notificationData, tenantEmail, retries = 2) {
  try {
    // Skip duplicate check to reduce API calls - use created_at dedup instead
    try {
      // Create in-app notification
      await base44.asServiceRole.entities.TenantNotification.create({
        tenant_id: tenantId,
        type: notificationData.type || 'reminder',
        title: notificationData.title,
        message: notificationData.message,
        is_read: false,
        notification_type: notificationData.type || 'reminder',
        sent_date: new Date().toISOString(),
        action_url: notificationData.action_url,
        due_date: notificationData.due_date,
        related_entity_id: notificationData.related_entity_id,
        related_entity_type: notificationData.related_entity_type,
      }).catch(e => {
        if (e.status !== 409) throw e; // Ignore conflict errors (duplicate)
      });

      // Send email notification with retry logic
      if (tenantEmail) {
        await sendEmailWithRetry(base44, tenantEmail, notificationData, retries);
      }
    } catch (e) {
      console.warn(`Failed to create notification for tenant ${tenantId}:`, e.message);
    }
  } catch (err) {
    console.warn('Error in createNotification:', err.message);
  }
}

async function sendEmailWithRetry(base44, tenantEmail, notificationData, retries = 2) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: tenantEmail,
        subject: notificationData.title,
        body: notificationData.message,
        from_name: 'Premiso Tenant Alerts'
      });
      return;
    } catch (e) {
      lastError = e;
      if (e.status === 429 && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }
  console.warn(`Failed to send email to ${tenantEmail}:`, lastError?.message);
}