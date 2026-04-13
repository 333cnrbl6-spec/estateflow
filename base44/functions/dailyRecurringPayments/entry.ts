import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This is a scheduled task - verify admin access
    const user = await base44.auth.me();
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Get all active recurring payments due today
    const recurringPayments = await base44.entities.RecurringPayment.filter({
      status: 'active',
      next_payment_date: today,
    });

    const results = {
      total: recurringPayments.length,
      successful: 0,
      failed: 0,
      requires_action: 0,
      details: [],
    };

    // Process each payment
    for (const payment of recurringPayments) {
      try {
        const res = await base44.functions.invoke('processRecurringPayment', {
          recurring_payment_id: payment.id,
        });

        if (res.data.success) {
          results.successful++;
        } else if (res.data.requires_action) {
          results.requires_action++;
        } else {
          results.failed++;
        }

        results.details.push({
          payment_id: payment.id,
          tenant_id: payment.tenant_id,
          amount: payment.amount,
          status: res.data.success ? 'success' : res.data.requires_action ? 'action_required' : 'failed',
          message: res.data.message || res.data.error,
        });

      } catch (error) {
        results.failed++;
        results.details.push({
          payment_id: payment.id,
          tenant_id: payment.tenant_id,
          amount: payment.amount,
          status: 'error',
          message: error.message,
        });

        // Update payment status on error
        await base44.entities.RecurringPayment.update(payment.id, {
          status: 'failed',
          notes: `Failed on ${today}: ${error.message}`,
        });
      }
    }

    return Response.json({
      success: true,
      execution_date: today,
      summary: results,
      message: `Processed ${results.total} recurring payments: ${results.successful} successful, ${results.failed} failed, ${results.requires_action} require action`,
    });

  } catch (error) {
    console.error('Daily recurring payments error:', error);
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
});