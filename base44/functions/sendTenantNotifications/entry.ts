import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all active tenants
    const tenants = await base44.asServiceRole.entities.Tenant.filter({ status: 'active' });

    if (!tenants || tenants.length === 0) {
      return Response.json({ success: true, notified: 0 });
    }

    let notificationCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const tenant of tenants) {
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
        console.error(`Error processing notifications for tenant ${tenant.id}:`, err);
      }
    }

    return Response.json({
      success: true,
      notified: notificationCount,
      processed_tenants: tenants.length
    });
  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});

async function createNotification(base44, tenantId, notificationData, tenantEmail) {
  try {
    // Check if similar notification already exists (avoid duplicates)
    const existingNotifications = await base44.asServiceRole.entities.TenantNotification.filter({
      tenant_id: tenantId,
      type: notificationData.type,
      read: false
    });

    // Only create if no unread notification of this type exists
    if (!existingNotifications || existingNotifications.length === 0) {
      // Create in-app notification
      await base44.asServiceRole.entities.TenantNotification.create({
        tenant_id: tenantId,
        ...notificationData,
        created_at: new Date().toISOString()
      });

      // Send email notification
      if (tenantEmail) {
        await base44.integrations.Core.SendEmail({
          to: tenantEmail,
          subject: notificationData.title,
          body: `
            <html>
              <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 0 auto;">
                  <h2>${notificationData.title}</h2>
                  <p>${notificationData.message}</p>
                  ${notificationData.due_date ? `<p><strong>Due Date:</strong> ${new Date(notificationData.due_date).toLocaleDateString('en-GB')}</p>` : ''}
                  <p style="margin-top: 20px;">
                    <a href="${notificationData.action_url || 'https://app.premiso.app/tenant-dashboard'}" 
                       style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                      Take Action
                    </a>
                  </p>
                  <hr style="border: none; border-top: 1px solid #e0e0e0; margin-top: 30px;">
                  <p style="font-size: 12px; color: #999;">This is an automated notification. Please do not reply to this email.</p>
                </div>
              </body>
            </html>
          `
        });

        // Mark as sent
        const notifications = await base44.asServiceRole.entities.TenantNotification.filter({
          tenant_id: tenantId,
          type: notificationData.type,
          email_sent: false
        });

        if (notifications && notifications.length > 0) {
          await base44.asServiceRole.entities.TenantNotification.update(notifications[0].id, {
            email_sent: true,
            email_sent_at: new Date().toISOString()
          });
        }
      }
    }
  } catch (err) {
    console.error('Error creating notification:', err);
  }
}