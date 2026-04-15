import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { z } from 'npm:zod@3.24.2';

const AccountingSyncSchema = z.object({
  integration_id: z.string().min(1, 'Integration ID required'),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = AccountingSyncSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return Response.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { integration_id } = validation.data;

    // Get the integration
    const integration = await base44.entities.AccountingIntegration.get(integration_id);
    if (!integration) {
      return Response.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Create sync record
    const syncRecord = await base44.entities.AccountingSync.create({
      integration_id,
      sync_type: 'manual',
      status: 'in_progress',
      started_at: new Date().toISOString(),
    });

    // Fetch transactions to sync
    const transactions = integration.sync_transactions
      ? await base44.entities.RentLedger.filter({ status: 'paid' })
      : [];

    const expenses = integration.sync_expenses
      ? await base44.entities.BusinessExpense.filter({ status: 'approved' })
      : [];

    // TODO: Integrate with actual QuickBooks/Xero API calls
    // For now, mock the sync
    const allRecords = [...transactions, ...expenses];

    // Update sync record
    await base44.entities.AccountingSync.update(syncRecord.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      transactions_synced: transactions.length,
      expenses_synced: expenses.length,
    });

    return Response.json({
      syncId: syncRecord.id,
      recordsSynced: allRecords.length,
      transactionsSynced: transactions.length,
      expensesSynced: expenses.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});