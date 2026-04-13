import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronDown } from 'lucide-react';

export default function OverduePaymentsPanel({ data }) {
  const [expanded, setExpanded] = useState(true);

  if (!data || data.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Overdue Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No overdue payments</p>
        </CardContent>
      </Card>
    );
  }

  const totalOverdue = data.reduce((sum, item) => sum + item.amount, 0);
  const byTenant = data.reduce((acc, item) => {
    const existing = acc.find(t => t.tenant === item.tenant);
    if (existing) {
      existing.amount += item.amount;
      existing.count += 1;
    } else {
      acc.push({ tenant: item.tenant, property: item.property, amount: item.amount, count: 1, days: item.daysOverdue });
    }
    return acc;
  }, []).sort((a, b) => b.amount - a.amount);

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Overdue Payments: £{totalOverdue.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
          </CardTitle>
          <Badge variant="destructive">{data.length} payments</Badge>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3">
          {byTenant.map((item, idx) => (
            <div key={idx} className="p-3 bg-white rounded-lg border border-red-100">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm">{item.tenant}</p>
                  <p className="text-xs text-muted-foreground">{item.property}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">£{item.amount.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground">{item.days} days overdue</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">{item.count} payment{item.count > 1 ? 's' : ''}</Badge>
              </div>
            </div>
          ))}

          <div className="pt-3 border-t border-red-200">
            <p className="text-xs text-muted-foreground mb-2">
              Total at risk: <span className="font-semibold text-red-600">£{totalOverdue.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</span>
            </p>
            <Button size="sm" variant="outline" className="w-full">
              Send Payment Reminders
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}