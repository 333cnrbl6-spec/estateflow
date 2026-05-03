import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RentPaymentHistory({ tenantId, monthlyRent, transactions }) {
  const rentTransactions = transactions.filter(t => t.transaction_type === 'rent_payment');
  const sortedTransactions = [...rentTransactions].sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

  const paidCount = sortedTransactions.filter(t => t.status === 'completed').length;
  const pendingCount = sortedTransactions.filter(t => t.status === 'pending').length;
  const overdueCount = sortedTransactions.filter(t => {
    const dueDate = new Date(t.due_date);
    return dueDate < new Date() && t.status !== 'completed';
  }).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Payments Made</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{paidCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{pendingCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className={`w-6 h-6 mx-auto mb-2 ${overdueCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{overdueCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTransactions.length === 0 ? (
            <p className="text-muted-foreground">No payment records found.</p>
          ) : (
            <div className="space-y-3">
              {sortedTransactions.map(txn => {
                const dueDate = new Date(txn.due_date);
                const txnDate = new Date(txn.transaction_date);
                const isOverdue = dueDate < new Date() && txn.status !== 'completed';

                return (
                  <div key={txn.id} className={`p-4 rounded-lg border ${
                    isOverdue ? 'bg-red-50 border-red-200' :
                    txn.status === 'completed' ? 'bg-green-50 border-green-200' :
                    'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">
                          £{(txn.amount / 100).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Due: {dueDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {txn.status === 'completed' && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Paid: {txnDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          isOverdue ? 'bg-red-100 text-red-800' :
                          txn.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {isOverdue ? 'OVERDUE' : txn.status === 'completed' ? 'PAID' : 'PENDING'}
                        </Badge>
                        {txn.status === 'completed' && txn.receipt_url && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1"
                            title="Download receipt"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">How to Pay Rent</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <p>Bank Transfer:</p>
          <div className="bg-white rounded p-3 space-y-1 text-blue-800 ml-4">
            <p>Account Name: [Property Management Account]</p>
            <p>Sort Code: [SORT CODE]</p>
            <p>Account Number: [ACCOUNT NUMBER]</p>
            <p>Reference: Use your tenant ID or full name</p>
          </div>
          <p className="mt-3">✓ Payments are typically processed within 1-2 business days.</p>
        </CardContent>
      </Card>
    </div>
  );
}