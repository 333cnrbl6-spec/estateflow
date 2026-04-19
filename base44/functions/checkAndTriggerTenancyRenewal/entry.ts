import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all active tenants
    const tenants = await base44.asServiceRole.entities.Tenant.filter({ 
      status: 'active' 
    });

    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    
    const renewalOffersTriggered = [];
    const managerNotifications = {};

    for (const tenant of tenants || []) {
      if (!tenant.tenancy_end_date) continue;

      const endDate = new Date(tenant.tenancy_end_date);
      
      // Check if lease ends in the next 3 months
      if (endDate > today && endDate <= threeMonthsLater) {
        // Check if renewal offer already sent this month
        const existingOffer = await base44.asServiceRole.entities.Document.filter({
          tenant_id: tenant.id,
          document_type: 'Tenancy Renewal Offer'
        });

        const offerSentThisMonth = existingOffer?.some(doc => {
          const docDate = new Date(doc.created_date);
          return docDate.getMonth() === today.getMonth() && 
                 docDate.getFullYear() === today.getFullYear();
        });

        if (offerSentThisMonth) continue;

        // Get property and unit details
        const [property, unit, recurringPayment] = await Promise.all([
          base44.asServiceRole.entities.Property.get(tenant.property_id),
          tenant.unit_id ? base44.asServiceRole.entities.Unit.get(tenant.unit_id) : null,
          base44.asServiceRole.entities.RecurringPayment.filter({ 
            tenant_id: tenant.id,
            type: 'rent'
          }).then(payments => payments?.[0])
        ]);

        if (!property) continue;

        const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        const rentAmount = recurringPayment?.amount || 0;

        // Create renewal offer document
        const renewalContent = generateRenewalOfferHTML(
          tenant,
          property,
          unit,
          endDate,
          rentAmount
        );

        await base44.asServiceRole.entities.Document.create({
          tenant_id: tenant.id,
          property_id: tenant.property_id,
          unit_id: tenant.unit_id,
          document_type: 'Tenancy Renewal Offer',
          file_name: `Renewal_Offer_${property.name}_${tenant.full_name}.html`,
          file_url: `data:text/html;base64,${Buffer.from(renewalContent).toString('base64')}`,
          status: 'pending_review',
          uploaded_by: 'system'
        });

        // Send renewal offer to tenant
        await base44.integrations.Core.SendEmail({
          to: tenant.email,
          subject: `Your Tenancy Renewal Offer - ${property.name}`,
          body: generateRenewalEmailHTML(tenant, property, endDate, daysUntilExpiry)
        });

        // Track for manager notification
        const propertyKey = tenant.property_id;
        if (!managerNotifications[propertyKey]) {
          managerNotifications[propertyKey] = {
            property,
            tenants: []
          };
        }
        managerNotifications[propertyKey].tenants.push({
          name: tenant.full_name,
          email: tenant.email,
          currentRent: rentAmount / 100,
          expiryDate: endDate.toLocaleDateString('en-GB'),
          daysUntilExpiry
        });

        renewalOffersTriggered.push({
          tenant_id: tenant.id,
          tenant_email: tenant.email,
          property_id: tenant.property_id,
          renewal_date: endDate.toISOString(),
          days_until_expiry: daysUntilExpiry
        });
      }
    }

    // Send notifications to property managers
    for (const [propertyId, notification] of Object.entries(managerNotifications)) {
      const { property, tenants: tenantsList } = notification;
      
      const managerEmail = process.env.SALES_LEAD_EMAIL || 'manager@premiso.app';

      await base44.integrations.Core.SendEmail({
        to: managerEmail,
        subject: `Tenancy Renewals Required - ${property.name}`,
        body: generateManagerNotificationHTML(property, tenantsList)
      });

      // Create manager notification
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: managerEmail,
        type: 'renewal_review',
        title: `${tenantsList.length} Tenancy Renewal(s) Due - ${property.name}`,
        message: `${tenantsList.length} tenant(s) at ${property.name} have tenancy renewals expiring within 3 months. Review and approve new terms to send renewal offers.`,
        triggered_by: 'system',
        action_url: '/properties'
      });
    }

    return Response.json({
      success: true,
      offersTriggered: renewalOffersTriggered.length,
      details: renewalOffersTriggered,
      managersNotified: Object.keys(managerNotifications).length
    });

  } catch (error) {
    console.error('Tenancy renewal check error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});

function generateRenewalOfferHTML(tenant, property, unit, endDate, rentAmount) {
  const newStartDate = new Date(endDate);
  newStartDate.setDate(newStartDate.getDate() + 1);
  const newEndDate = new Date(newStartDate);
  newEndDate.setFullYear(newEndDate.getFullYear() + 1);

  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
          .header { background-color: #2c3e50; color: white; padding: 20px; }
          .section { margin: 20px 0; padding: 15px; border-left: 4px solid #3498db; }
          .terms { background-color: #ecf0f1; padding: 15px; border-radius: 5px; }
          .action { text-align: center; margin: 30px 0; }
          .button { background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Tenancy Renewal Offer</h1>
          <p>${property.name}</p>
        </div>

        <div class="section">
          <h2>Renewal Offer for ${tenant.full_name}</h2>
          <p>Dear ${tenant.full_name},</p>
          <p>Your current tenancy at <strong>${property.name}</strong> is expiring on <strong>${endDate.toLocaleDateString('en-GB')}</strong>.</p>
          <p>We are pleased to offer you the opportunity to renew your tenancy for a further 12 months on the following terms:</p>
        </div>

        <div class="section terms">
          <h3>Proposed Renewal Terms</h3>
          <p><strong>Property:</strong> ${property.name}${unit ? ' - ' + unit.name : ''}</p>
          <p><strong>Current Tenancy End Date:</strong> ${endDate.toLocaleDateString('en-GB')}</p>
          <p><strong>New Tenancy Start Date:</strong> ${newStartDate.toLocaleDateString('en-GB')}</p>
          <p><strong>New Tenancy End Date:</strong> ${newEndDate.toLocaleDateString('en-GB')}</p>
          <p><strong>Monthly Rent:</strong> £${(rentAmount / 100).toFixed(2)}</p>
          <p><strong>Rent Payment Method:</strong> Direct Debit</p>
          <p><strong>Rent Payment Date:</strong> 1st of each month</p>
        </div>

        <div class="section">
          <h3>Next Steps</h3>
          <ol>
            <li>Review the terms outlined above</li>
            <li>Log in to your tenant portal to view the full renewal agreement</li>
            <li>Digitally sign the renewal agreement by ${new Date(new Date(endDate).getTime() - 30*24*60*60*1000).toLocaleDateString('en-GB')}</li>
            <li>Your renewal will be confirmed upon our receipt of your signed agreement</li>
          </ol>
        </div>

        <div class="action">
          <p>If you accept these terms and wish to renew your tenancy, please log in to your tenant portal to sign the renewal agreement.</p>
        </div>

        <div class="section">
          <h3>Need Changes?</h3>
          <p>If you would like to discuss any aspect of this renewal offer, please contact your property manager immediately. Any changes must be agreed in writing.</p>
          <p><strong>Property Manager Email:</strong> support@premiso.app</p>
          <p><strong>Emergency Contact:</strong> 0800 999 8888</p>
        </div>

        <p style="margin-top: 30px; color: #7f8c8d; font-size: 12px;">This is an automated renewal offer. Please do not reply to this email. Contact your property manager for inquiries.</p>
      </body>
    </html>
  `;
}

function generateRenewalEmailHTML(tenant, property, endDate, daysUntilExpiry) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Your Tenancy Renewal Offer</h2>
        <p>Dear ${tenant.full_name},</p>
        <p>Your tenancy at <strong>${property.name}</strong> is expiring in <strong>${daysUntilExpiry} days</strong> (${endDate.toLocaleDateString('en-GB')}).</p>
        
        <p>We would like to offer you the opportunity to renew your tenancy for a further 12 months. Your renewal offer has been uploaded to your tenant portal and includes the proposed terms.</p>

        <p><strong>What you need to do:</strong></p>
        <ol>
          <li>Log in to your tenant portal</li>
          <li>Review the renewal offer document</li>
          <li>Digitally sign the agreement if you wish to proceed</li>
          <li>Return it within 10 days to confirm your renewal</li>
        </ol>

        <p>If you have any questions about your renewal offer or would like to discuss different terms, please contact your property manager.</p>

        <p>Best regards,<br>The Property Management Team</p>
      </body>
    </html>
  `;
}

function generateManagerNotificationHTML(property, tenants) {
  const tenantList = tenants.map(t => 
    `<li>${t.name} (${t.email}) - Expires ${t.expiryDate} (${t.daysUntilExpiry} days) - Current Rent: £${t.currentRent.toFixed(2)}</li>`
  ).join('');

  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Tenancy Renewal Reminder - ${property.name}</h2>
        <p>The following ${tenants.length} tenant(s) have active tenancies expiring within 3 months at <strong>${property.name}</strong>:</p>
        
        <ul>
          ${tenantList}
        </ul>

        <p><strong>Action Required:</strong></p>
        <ol>
          <li>Review rent amounts and any required adjustments</li>
          <li>Confirm the renewal terms are correct</li>
          <li>Renewal offers have been automatically sent to tenants</li>
          <li>Monitor tenant responses in your portal</li>
          <li>Follow up with non-responders at least 10 days before expiry</li>
        </ol>

        <p>Log in to your dashboard to view and manage all renewal agreements.</p>
      </body>
    </html>
  `;
}