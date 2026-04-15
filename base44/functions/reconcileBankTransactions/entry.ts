import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { transactions: bankTxns } = await req.json();
    if (!Array.isArray(bankTxns) || bankTxns.length === 0) {
      return Response.json({ error: 'No transactions provided' }, { status: 400 });
    }

    // Fetch outstanding invoices & rent transactions
    const outstanding = await base44.asServiceRole.entities.FinancialTransaction.list('-due_date', 500);
    const pending = outstanding.filter(t =>
      ['pending', 'overdue', 'partial'].includes(t.status) && t.direction === 'income'
    );

    // Build a context for LLM matching
    const pendingContext = pending.map(p => ({
      id: p.id,
      description: p.description,
      amount: p.amount,
      due_date: p.due_date,
      reference: p.reference || '',
      tenant_id: p.tenant_id || '',
    }));

    // Ask LLM to match bank transactions against outstanding items
    const matchPrompt = `You are a UK property management reconciliation engine.

Match each bank transaction to an outstanding invoice/rent payment. Use amount, description, reference, and date proximity.

BANK TRANSACTIONS:
${JSON.stringify(bankTxns, null, 2)}

OUTSTANDING INVOICES:
${JSON.stringify(pendingContext, null, 2)}

For each bank transaction, return a match result. Rules:
- "matched": amount matches within £0.50 AND description/reference overlaps
- "partial": amount is less than invoice amount but description matches (e.g. tenant paid partial rent)
- "unmatched": no clear match found
- "overpayment": bank amount exceeds invoice amount

Return JSON array only, no extra text:
[
  {
    "bank_txn_index": 0,
    "match_status": "matched|partial|unmatched|overpayment",
    "matched_invoice_id": "id or null",
    "matched_invoice_description": "description or null",
    "matched_amount": number or null,
    "invoice_amount": number or null,
    "difference": number or null,
    "confidence": 0.0-1.0,
    "notes": "brief explanation"
  }
]`;

    const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: matchPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          matches: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                bank_txn_index: { type: 'number' },
                match_status: { type: 'string' },
                matched_invoice_id: { type: 'string' },
                matched_invoice_description: { type: 'string' },
                matched_amount: { type: 'number' },
                invoice_amount: { type: 'number' },
                difference: { type: 'number' },
                confidence: { type: 'number' },
                notes: { type: 'string' },
              }
            }
          }
        }
      }
    });

    const matches = llmResult?.matches || [];

    // Auto-apply high-confidence matches with failure tracking
    const applied = [];
    const alerts = [];
    const failures = [];

    for (const match of matches) {
      const bankTxn = bankTxns[match.bank_txn_index];
      if (!bankTxn) continue;

      if (match.match_status === 'matched' && match.matched_invoice_id && match.confidence >= 0.85) {
        try {
          // Mark invoice as paid
          await base44.asServiceRole.entities.FinancialTransaction.update(match.matched_invoice_id, {
            status: 'paid',
            paid_date: bankTxn.date || new Date().toISOString().split('T')[0],
            notes: `Auto-reconciled from bank feed. Bank ref: ${bankTxn.reference || bankTxn.description || '—'}`,
          });
          applied.push({ ...match, bankTxn, action: 'marked_paid' });

          // Create success notification with error handling
          try {
            await base44.asServiceRole.entities.TenantNotification.create({
              title: `✅ Payment matched: ${match.matched_invoice_description}`,
              message: `Bank transaction of £${bankTxn.amount} on ${bankTxn.date || 'unknown date'} has been automatically matched and marked as paid.`,
              notification_type: 'update',
              is_read: false,
              sent_date: new Date().toISOString(),
              notes: `reconcile:matched:${match.matched_invoice_id}`,
            });
          } catch (notifError) {
            console.error(`[reconcileBankTransactions] Notification creation failed for match ${match.matched_invoice_id}: ${notifError.message}`);
            failures.push({ match, reason: 'notification_failed', error: notifError.message });
          }
        } catch (updateError) {
          console.error(`[reconcileBankTransactions] Failed to update transaction ${match.matched_invoice_id}: ${updateError.message}`);
          failures.push({ match, bankTxn, reason: 'update_failed', error: updateError.message });
        }

      } else if (['partial', 'unmatched', 'overpayment'].includes(match.match_status)) {
        alerts.push({ ...match, bankTxn });

        // Create alert notification with error handling
        const emoji = { partial: '⚠️', unmatched: '❓', overpayment: '💰' }[match.match_status] || '⚠️';
        const titles = {
          partial: `Partial payment received: £${bankTxn.amount}`,
          unmatched: `Unmatched bank transaction: £${bankTxn.amount}`,
          overpayment: `Overpayment received: £${bankTxn.amount}`,
        };
        try {
          await base44.asServiceRole.entities.TenantNotification.create({
            title: `${emoji} ${titles[match.match_status]}`,
            message: `Bank transaction "${bankTxn.description || bankTxn.reference || '—'}" (£${bankTxn.amount}, ${bankTxn.date || '—'}) could not be automatically matched. ${match.notes || ''}`,
            notification_type: match.match_status === 'unmatched' ? 'urgent' : 'reminder',
            is_read: false,
            sent_date: new Date().toISOString(),
            notes: `reconcile:${match.match_status}:${match.matched_invoice_id || 'none'}`,
          });
        } catch (notifError) {
          console.error(`[reconcileBankTransactions] Alert notification failed: ${notifError.message}`);
          failures.push({ match, reason: 'alert_notification_failed', error: notifError.message });
        }

        // Mark partial payments as partial
        if (match.match_status === 'partial' && match.matched_invoice_id && match.confidence >= 0.7) {
          try {
            await base44.asServiceRole.entities.FinancialTransaction.update(match.matched_invoice_id, {
              status: 'partial',
              notes: `Partial payment received: £${bankTxn.amount} of £${match.invoice_amount}. Bank ref: ${bankTxn.reference || bankTxn.description || '—'}`,
            });
          } catch (partialError) {
            console.error(`[reconcileBankTransactions] Failed to mark partial payment ${match.matched_invoice_id}: ${partialError.message}`);
            failures.push({ match, reason: 'partial_update_failed', error: partialError.message });
          }
        }
      }
    }

    return Response.json({
      success: failures.length === 0,
      total_bank_transactions: bankTxns.length,
      auto_matched: applied.length,
      alerts: alerts.length,
      failures: failures.length,
      results: matches,
      applied,
      alert_items: alerts,
      ...(failures.length > 0 && { failures_detail: failures }),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});