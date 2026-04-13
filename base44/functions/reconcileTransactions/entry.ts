import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { bankTransactions, rentalLedger, matchThreshold = 0.95 } = await req.json();

    if (!bankTransactions?.length || !rentalLedger?.length) {
      return Response.json({ error: 'Missing transactions or ledger data' }, { status: 400 });
    }

    const matches = [];
    const unmatchedBank = [];
    const unmatchedLedger = [];
    const usedLedgerIds = new Set();

    // Try to match each bank transaction
    for (const bankTx of bankTransactions) {
      let bestMatch = null;
      let bestScore = 0;

      for (const ledgerTx of rentalLedger) {
        if (usedLedgerIds.has(ledgerTx.id)) continue;

        // Calculate match score based on amount, date, and description
        const amountMatch = Math.abs(bankTx.amount - ledgerTx.amount) < 0.01 ? 1 : 0;
        const dateDiff = Math.abs(
          new Date(bankTx.date) - new Date(ledgerTx.transaction_date)
        ) / (1000 * 60 * 60 * 24); // days difference
        const dateMatch = dateDiff <= 3 ? 1 - dateDiff / 10 : 0;
        const descMatch = bankTx.description?.toLowerCase().includes(ledgerTx.tenant_name?.toLowerCase())
          || ledgerTx.description?.toLowerCase().includes(bankTx.description?.toLowerCase())
          ? 0.5 : 0;

        const score = (amountMatch * 0.6 + dateMatch * 0.3 + descMatch * 0.1);

        if (score > bestScore && score >= matchThreshold) {
          bestScore = score;
          bestMatch = ledgerTx;
        }
      }

      if (bestMatch) {
        matches.push({
          bankTx,
          ledgerTx: bestMatch,
          matchScore: bestScore,
          status: 'matched',
          discrepancies: [],
        });
        usedLedgerIds.add(bestMatch.id);
      } else {
        unmatchedBank.push(bankTx);
      }
    }

    // Find unmatched ledger entries
    for (const ledgerTx of rentalLedger) {
      if (!usedLedgerIds.has(ledgerTx.id)) {
        unmatchedLedger.push(ledgerTx);
      }
    }

    // Check for discrepancies in matched pairs
    const processedMatches = matches.map(match => {
      const discrepancies = [];

      if (Math.abs(match.bankTx.amount - match.ledgerTx.amount) > 0.01) {
        discrepancies.push({
          type: 'amount_mismatch',
          bankAmount: match.bankTx.amount,
          ledgerAmount: match.ledgerTx.amount,
          difference: match.bankTx.amount - match.ledgerTx.amount,
          suggestion: `Update ledger to £${match.bankTx.amount.toFixed(2)}`,
        });
      }

      const bankDate = new Date(match.bankTx.date);
      const ledgerDate = new Date(match.ledgerTx.transaction_date);
      const daysDiff = Math.floor((bankDate - ledgerDate) / (1000 * 60 * 60 * 24));

      if (Math.abs(daysDiff) > 3) {
        discrepancies.push({
          type: 'date_mismatch',
          bankDate: match.bankTx.date,
          ledgerDate: match.ledgerTx.transaction_date,
          daysDifference: daysDiff,
          suggestion: `Update ledger date to ${bankDate.toISOString().split('T')[0]}`,
        });
      }

      return {
        ...match,
        discrepancies,
        status: discrepancies.length > 0 ? 'matched_with_discrepancies' : 'fully_matched',
      };
    });

    return Response.json({
      summary: {
        totalBankTransactions: bankTransactions.length,
        totalLedgerEntries: rentalLedger.length,
        fullyMatched: processedMatches.filter(m => m.status === 'fully_matched').length,
        matchedWithDiscrepancies: processedMatches.filter(m => m.status === 'matched_with_discrepancies').length,
        unmatchedBank: unmatchedBank.length,
        unmatchedLedger: unmatchedLedger.length,
        matchRate: (processedMatches.length / bankTransactions.length * 100).toFixed(1),
      },
      matches: processedMatches,
      unmatchedBank,
      unmatchedLedger,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});