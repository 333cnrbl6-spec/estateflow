import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function ReconciliationResults({ results, onApplySuggestion }) {
  const [expandedMatches, setExpandedMatches] = useState(new Set());

  const toggleExpand = (id) => {
    const newSet = new Set(expandedMatches);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedMatches(newSet);
  };

  if (!results) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Upload files and click "Reconcile" to see results
        </CardContent>
      </Card>
    );
  }

  const { summary, matches, unmatchedBank, unmatchedLedger } = results;

  return (
    <Tabs defaultValue="summary" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="matches" className="flex items-center gap-2">
          Matches
          <Badge variant="outline">{summary.fullyMatched + summary.matchedWithDiscrepancies}</Badge>
        </TabsTrigger>
        <TabsTrigger value="unmatched-bank" className="flex items-center gap-2">
          Unmatched Bank
          <Badge variant="outline" className="bg-red-100 text-red-700">{summary.unmatchedBank}</Badge>
        </TabsTrigger>
        <TabsTrigger value="unmatched-ledger" className="flex items-center gap-2">
          Unmatched Ledger
          <Badge variant="outline" className="bg-amber-100 text-amber-700">{summary.unmatchedLedger}</Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="summary">
        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{summary.totalBankTransactions}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Fully Matched</p>
                <p className="text-2xl font-bold text-green-600">{summary.fullyMatched}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Discrepancies</p>
                <p className="text-2xl font-bold text-amber-600">{summary.matchedWithDiscrepancies}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Unmatched Bank</p>
                <p className="text-2xl font-bold text-red-600">{summary.unmatchedBank}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Unmatched Ledger</p>
                <p className="text-2xl font-bold text-orange-600">{summary.unmatchedLedger}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Match Rate</p>
                <p className="text-2xl font-bold text-purple-600">{summary.matchRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="matches">
        <div className="space-y-3">
          {matches.map((match, idx) => (
            <Card key={idx}>
              <div
                className="p-4 cursor-pointer hover:bg-muted/50 transition flex items-center justify-between"
                onClick={() => toggleExpand(idx)}
              >
                <div className="flex items-center gap-3 flex-1">
                  {match.status === 'fully_matched' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">
                      £{match.bankTx.amount.toFixed(2)} • {match.bankTx.date}
                    </p>
                    <p className="text-sm text-muted-foreground">{match.bankTx.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={match.status === 'fully_matched' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                    {match.matchScore > 0.99 ? 'Perfect' : 'Good'} match
                  </Badge>
                  {expandedMatches.has(idx) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>

              {expandedMatches.has(idx) && (
                <CardContent className="border-t pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Bank Transaction</p>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Date:</span> {match.bankTx.date}</p>
                        <p><span className="font-medium">Amount:</span> £{match.bankTx.amount.toFixed(2)}</p>
                        <p><span className="font-medium">Ref:</span> {match.bankTx.reference || '—'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Ledger Entry</p>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Date:</span> {match.ledgerTx.transaction_date}</p>
                        <p><span className="font-medium">Amount:</span> £{match.ledgerTx.amount.toFixed(2)}</p>
                        <p><span className="font-medium">Tenant:</span> {match.ledgerTx.tenant_name}</p>
                      </div>
                    </div>
                  </div>

                  {match.discrepancies.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-semibold text-amber-900">Discrepancies Found</p>
                      {match.discrepancies.map((disc, dIdx) => (
                        <div key={dIdx} className="text-xs space-y-1 pb-2 border-b last:border-0 last:pb-0">
                          <p className="font-medium text-amber-700">{disc.type.replace(/_/g, ' ')}</p>
                          <p className="text-amber-600">{disc.suggestion}</p>
                          {onApplySuggestion && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onApplySuggestion(match, disc)}
                              className="mt-1 h-7 text-xs"
                            >
                              Apply Fix
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="unmatched-bank">
        <Card>
          <CardContent className="pt-6 space-y-3">
            {unmatchedBank.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">All bank transactions matched ✓</p>
            ) : (
              unmatchedBank.map((tx, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 border rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium text-sm">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                  <Badge className="bg-red-100 text-red-700">£{tx.amount.toFixed(2)}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="unmatched-ledger">
        <Card>
          <CardContent className="pt-6 space-y-3">
            {unmatchedLedger.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">All ledger entries matched ✓</p>
            ) : (
              unmatchedLedger.map((tx, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 border rounded-lg bg-orange-50">
                  <div>
                    <p className="font-medium text-sm">{tx.tenant_name}</p>
                    <p className="text-xs text-muted-foreground">{tx.transaction_date}</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700">£{tx.amount.toFixed(2)}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}