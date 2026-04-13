import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BarChart3, RefreshCw } from 'lucide-react';
import TransactionImporter from '@/components/reconciliation/TransactionImporter';
import ReconciliationResults from '@/components/reconciliation/ReconciliationResults';

export default function FinancialReconciliation() {
  const [bankData, setBankData] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleReconcile = async () => {
    if (!bankData || !ledgerData) {
      setError('Please upload both bank and ledger files');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await base44.functions.invoke('reconcileTransactions', {
        bankTransactions: bankData,
        rentalLedger: ledgerData,
        matchThreshold: 0.85,
      });

      setResults(res.data);
    } catch (err) {
      setError(`Reconciliation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = (match, discrepancy) => {
    // This would integrate with backend to update ledger
    console.log('Apply suggestion:', { match, discrepancy });
    // In a full implementation, this would call an update function
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Reconciliation</h1>
        <p className="text-muted-foreground mt-2">
          Auto-match bank transactions against rental ledger and identify discrepancies
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Export your bank transactions from Xero/Sage and rental ledger as CSV files. Accepted formats include date, amount, description, and reference fields.
        </AlertDescription>
      </Alert>

      <TransactionImporter
        onBankDataReady={setBankData}
        onLedgerDataReady={setLedgerData}
      />

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleReconcile}
          disabled={!bankData || !ledgerData || loading}
          size="lg"
          className="gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Reconciling...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4" />
              Reconcile Transactions
            </>
          )}
        </Button>

        {results && (
          <Button
            onClick={() => {
              setResults(null);
              setBankData(null);
              setLedgerData(null);
            }}
            variant="outline"
            size="lg"
          >
            Clear & Start Over
          </Button>
        )}
      </div>

      {results && (
        <ReconciliationResults
          results={results}
          onApplySuggestion={handleApplySuggestion}
        />
      )}
    </div>
  );
}