import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all tenants and rent payments
    const [tenants, recurringPayments, rentLedgers] = await Promise.all([
      base44.asServiceRole.entities.Tenant.list(),
      base44.asServiceRole.entities.RecurringPayment.list(),
      base44.asServiceRole.entities.RentLedger.list()
    ]);

    const today = new Date();
    const feesApplied = [];

    // Check each recurring payment for overdue rent
    for (const payment of recurringPayments || []) {
      if (payment.type !== 'rent') continue;
      if (payment.status !== 'active') continue;

      const tenant = tenants?.find(t => t.id === payment.tenant_id);
      if (!tenant) continue;

      const nextDueDate = new Date(payment.next_due_date);
      const daysOverdue = Math.floor((today - nextDueDate) / (1000 * 60 * 60 * 24));

      // Only apply fee if overdue and not already applied today
      if (daysOverdue > 0) {
        // Check if fee was already applied today
        const tenantLedgers = rentLedgers?.filter(l => 
          l.tenant_id === payment.tenant_id && 
          l.type === 'late_fee'
        ) || [];
        
        const feeAppliedToday = tenantLedgers.some(l => {
          const ledgerDate = new Date(l.created_date);
          return ledgerDate.toDateString() === today.toDateString();
        });

        if (feeAppliedToday) continue;

        // Get late fee percentage (default 10% if not specified)
        const lateFeePercentage = payment.late_fee_percentage || 10;
        
        // Calculate late fee on outstanding rent
        const rentAmount = payment.amount || 0;
        const lateFeeAmount = Math.ceil((rentAmount * lateFeePercentage) / 100);

        // Create notification
        await base44.asServiceRole.entities.Notification.create({
          recipient_email: tenant.email,
          type: 'late_fee',
          title: 'Late Payment Fee Applied',
          message: `A late payment fee of £${(lateFeeAmount / 100).toFixed(2)} has been applied to your account as your rent payment was ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue. Please pay immediately to avoid further action.`,
          triggered_by: 'system',
          action_url: '/tenant-payments'
        });

        // Create ledger entry for late fee
        await base44.asServiceRole.entities.RentLedger.create({
          tenant_id: payment.tenant_id,
          property_id: payment.property_id,
          type: 'late_fee',
          description: `Late payment fee (${daysOverdue} days overdue)`,
          amount_due: lateFeeAmount,
          balance_due: lateFeeAmount,
          due_date: today.toISOString(),
          status: 'outstanding',
          percentage: lateFeePercentage,
          days_overdue: daysOverdue
        });

        feesApplied.push({
          tenant_id: payment.tenant_id,
          tenant_email: tenant.email,
          days_overdue: daysOverdue,
          fee_amount: lateFeeAmount,
          percentage: lateFeePercentage
        });
      }
    }

    return Response.json({
      success: true,
      feesApplied: feesApplied.length,
      details: feesApplied
    });

  } catch (error) {
    console.error('Late fee assessment error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});