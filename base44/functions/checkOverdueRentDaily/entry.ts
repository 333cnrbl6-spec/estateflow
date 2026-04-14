import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    console.log('[Daily Rent Check] Starting overdue rent check...');

    // Get all active tenants
    const activeTenants = await base44.asServiceRole.entities.Tenant.filter(
      { status: 'active' },
      'full_name',
      500
    );

    console.log(`[Daily Rent Check] Checking ${activeTenants.length} active tenants`);

    const remindersSent = [];
    const recurringArrearsToReport = [];

    // Process each tenant
    for (const tenant of activeTenants) {
      try {
        // Get all overdue rent transactions for this tenant
        const overdueTransactions = await base44.asServiceRole.entities.FinancialTransaction.filter(
          { 
            tenant_id: tenant.id, 
            transaction_type: 'rent',
            status: 'overdue'
          },
          'transaction_date',
          12
        );

        if (overdueTransactions.length === 0) {
          continue;
        }

        // Calculate overdue amount and details
        const totalOverdue = overdueTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const oldestOverdue = overdueTransactions[overdueTransactions.length - 1];
        const daysOverdue = Math.floor((new Date() - new Date(oldestOverdue.transaction_date)) / (1000 * 60 * 60 * 24));

        // Check if this is recurring arrears (3+ months)
        const isRecurringArrears = overdueTransactions.length >= 3;

        console.log(`[Daily Rent Check] Tenant ${tenant.full_name}: ${overdueTransactions.length} overdue months, £${totalOverdue}, ${daysOverdue} days overdue`);

        // Send friendly reminder email to tenant
        await sendTenantReminder(base44, tenant, overdueTransactions, totalOverdue, daysOverdue);

        remindersSent.push({
          tenant_id: tenant.id,
          tenant_name: tenant.full_name,
          tenant_email: tenant.email,
          overdue_amount: totalOverdue,
          overdue_months: overdueTransactions.length,
          days_overdue: daysOverdue
        });

        // Track recurring arrears for property manager notification
        if (isRecurringArrears) {
          recurringArrearsToReport.push({
            tenant_id: tenant.id,
            tenant_name: tenant.full_name,
            tenant_email: tenant.email,
            property_id: tenant.property_id,
            overdue_amount: totalOverdue,
            overdue_months: overdueTransactions.length,
            oldest_overdue_date: oldestOverdue.transaction_date,
            days_overdue: daysOverdue,
            months: overdueTransactions.map(t => ({
              date: t.transaction_date,
              amount: t.amount
            }))
          });
        }
      } catch (tenantError) {
        console.error(`[Daily Rent Check] Error processing tenant ${tenant.id}:`, tenantError);
        continue;
      }
    }

    // If there are recurring arrears, notify property managers
    if (recurringArrearsToReport.length > 0) {
      await notifyPropertyManagers(base44, recurringArrearsToReport);
    }

    console.log(`[Daily Rent Check] Completed. Sent ${remindersSent.length} reminders, ${recurringArrearsToReport.length} recurring arrears to escalate`);

    return Response.json({
      success: true,
      reminders_sent: remindersSent.length,
      recurring_arrears_identified: recurringArrearsToReport.length,
      details: {
        reminders_sent,
        recurring_arrears: recurringArrearsToReport
      }
    });
  } catch (error) {
    console.error('[Daily Rent Check] Error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});

async function sendTenantReminder(base44, tenant, overdueTransactions, totalOverdue, daysOverdue) {
  try {
    const months = overdueTransactions.map(t => {
      const date = new Date(t.transaction_date);
      return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    }).join(', ');

    const isSevere = daysOverdue > 60 || overdueTransactions.length >= 3;

    const emailBody = `
      <h2 style="color: ${isSevere ? '#dc2626' : '#f59e0b'};">Payment Reminder: Outstanding Rent</h2>
      
      <p>Dear ${tenant.full_name},</p>
      
      <p>We're writing to let you know that we have outstanding rent payments on your account.</p>
      
      <h3>Your Outstanding Balance</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr style="background: #f3f4f6;">
          <th style="text-align: left; padding: 10px; border: 1px solid #e5e7eb;">Month(s)</th>
          <th style="text-align: right; padding: 10px; border: 1px solid #e5e7eb;">Amount</th>
        </tr>
        ${overdueTransactions.map(t => `
          <tr>
            <td style="padding: 10px; border: 1px solid #e5e7eb;">${new Date(t.transaction_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">£${(t.amount || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
          </tr>
        `).join('')}
        <tr style="background: #f0f9ff; font-weight: bold;">
          <td style="padding: 10px; border: 1px solid #e5e7eb;">Total Outstanding</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">£${totalOverdue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
        </tr>
      </table>

      <h3>Next Steps</h3>
      <p>Please arrange payment of the outstanding balance as soon as possible. Payment can be made:</p>
      <ul>
        <li>Via your tenant payment portal</li>
        <li>Bank transfer to the property manager's account</li>
        <li>Direct debit (contact us to set up)</li>
      </ul>

      ${isSevere ? `
        <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b; font-weight: bold;">⚠️ Important Notice</p>
          <p style="margin: 5px 0 0 0; color: #7f1d1d;">Your rent is significantly overdue. Please contact us immediately to discuss payment arrangements. Failure to resolve this matter may result in further action.</p>
        </div>
      ` : `
        <p style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 3px;">
          We'd appreciate if you could settle this outstanding balance within the next 7 days. Thank you!
        </p>
      `}

      <p>If you've already made this payment, please disregard this reminder. If you're experiencing difficulties, please reach out to us to discuss payment options.</p>
      
      <p>Best regards,<br/>
      <strong>Property Management Team</strong></p>
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: tenant.email,
      subject: isSevere ? 
        '⚠️ Urgent: Outstanding Rent Payment Required' : 
        '📧 Friendly Reminder: Rent Payment Due',
      body: emailBody
    });

    console.log(`[Daily Rent Check] Sent reminder to ${tenant.email}`);
  } catch (error) {
    console.error(`[Daily Rent Check] Error sending email to ${tenant.email}:`, error);
    throw error;
  }
}

async function notifyPropertyManagers(base44, recurringArrearsToReport) {
  try {
    // Get property managers (admin users)
    const managers = await base44.asServiceRole.entities.User.filter(
      { role: 'admin' },
      'full_name',
      100
    );

    if (managers.length === 0) {
      console.log('[Daily Rent Check] No property managers found for escalation');
      return;
    }

    // Group by property
    const byProperty = {};
    recurringArrearsToReport.forEach(arrear => {
      if (!byProperty[arrear.property_id]) {
        byProperty[arrear.property_id] = [];
      }
      byProperty[arrear.property_id].push(arrear);
    });

    const emailBody = `
      <h2 style="color: #dc2626;">⚠️ Recurring Rent Arrears Report</h2>
      
      <p>Good morning,</p>
      
      <p>The daily rent check has identified <strong>${recurringArrearsToReport.length}</strong> tenant(s) with recurring arrears (3+ months overdue) requiring immediate follow-up.</p>

      <h3>Summary</h3>
      <p>
        <strong>Total Amount at Risk:</strong> £${recurringArrearsToReport.reduce((sum, a) => sum + a.overdue_amount, 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}<br/>
        <strong>Tenants Affected:</strong> ${recurringArrearsToReport.length}
      </p>

      <h3>Cases Requiring Action</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px;">
        <tr style="background: #fee2e2;">
          <th style="text-align: left; padding: 10px; border: 1px solid #fecaca;">Tenant</th>
          <th style="text-align: right; padding: 10px; border: 1px solid #fecaca;">Amount</th>
          <th style="text-align: center; padding: 10px; border: 1px solid #fecaca;">Months</th>
          <th style="text-align: right; padding: 10px; border: 1px solid #fecaca;">Days</th>
        </tr>
        ${recurringArrearsToReport.map(arrear => `
          <tr>
            <td style="padding: 10px; border: 1px solid #fecaca;">
              <strong>${arrear.tenant_name}</strong><br/>
              <span style="color: #666; font-size: 12px;">${arrear.tenant_email}</span>
            </td>
            <td style="padding: 10px; border: 1px solid #fecaca; text-align: right; font-weight: bold;">£${arrear.overdue_amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
            <td style="padding: 10px; border: 1px solid #fecaca; text-align: center;">${arrear.overdue_months}</td>
            <td style="padding: 10px; border: 1px solid #fecaca; text-align: right;">${arrear.days_overdue}</td>
          </tr>
        `).join('')}
      </table>

      <h3>Recommended Actions</h3>
      <ol>
        <li><strong>Contact Tenant:</strong> Call or email to understand barriers to payment</li>
        <li><strong>Arrange Payment Plan:</strong> If appropriate, negotiate installment schedule</li>
        <li><strong>Send Formal Notice:</strong> If non-responsive, escalate to formal arrears procedure</li>
        <li><strong>Document Everything:</strong> Keep records for potential legal proceedings</li>
      </ol>

      <p style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 3px;">
        <strong>Note:</strong> Friendly payment reminders have been sent to all tenants. This report covers only those with recurring arrears requiring property manager intervention.
      </p>

      <p>Best regards,<br/>
      <strong>Automated Rent Management System</strong></p>
    `;

    // Send to all property managers
    for (const manager of managers) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: manager.email,
        subject: `Recurring Rent Arrears Alert - ${recurringArrearsToReport.length} Case(s)`,
        body: emailBody
      });

      console.log(`[Daily Rent Check] Sent escalation alert to ${manager.email}`);
    }
  } catch (error) {
    console.error('[Daily Rent Check] Error notifying property managers:', error);
    throw error;
  }
}