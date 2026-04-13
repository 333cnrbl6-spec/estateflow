import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Repeat, Calendar, CreditCard, CheckCircle2, XCircle, PauseCircle, PlayCircle,
  Loader2, AlertTriangle, Trash2, Eye
} from 'lucide-react';

export default function RecurringPaymentsManager({ tenantId }) {
  const queryClient = useQueryClient();
  const [viewingDetails, setViewingDetails] = useState(null);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['recurring-payments', tenantId],
    queryFn: () => base44.entities.RecurringPayment.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  const togglePayment = useMutation({
    mutationFn: ({ id, status }) => 
      base44.entities.RecurringPayment.update(id, { status: status === 'active' ? 'paused' : 'active' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring-payments', tenantId] }),
  });

  const cancelPayment = useMutation({
    mutationFn: (id) => base44.entities.RecurringPayment.update(id, { status: 'cancelled' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring-payments', tenantId] }),
  });

  const getStatusBadge = (status) => {
    const config = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Active' },
      paused: { color: 'bg-amber-100 text-amber-800', icon: PauseCircle, label: 'Paused' },
      cancelled: { color: 'bg-slate-100 text-slate-600', icon: XCircle, label: 'Cancelled' },
      failed: { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Failed' },
    };
    const { color, icon: Icon, label } = config[status] || config.active;
    return (
      <Badge className={`gap-1 ${color}`}>
        <Icon className="w-3 h-3" /> {label}
      </Badge>
    );
  };

  const activePayments = payments.filter(p => p.status === 'active');
  const totalMonthly = activePayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      {activePayments.length > 0 && (
        <Card className="bg-gradient-to-r from-green-600 to-emerald-500 border-0">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-medium opacity-90">Active Auto-Payments</p>
                <p className="text-2xl font-bold">£{totalMonthly.toLocaleString()}/month</p>
              </div>
              <div className="text-right text-white">
                <p className="text-sm font-medium opacity-90">Next Payment</p>
                <p className="text-lg font-semibold">
                  {activePayments.length === 1 
                    ? new Date(activePayments[0].next_payment_date).toLocaleDateString('en-GB')
                    : 'Various dates'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments List */}
      {payments.length === 0 ? (
        <Card>
          <CardContent className="text-sm text-muted-foreground text-center py-10">
            <Repeat className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No recurring payments set up</p>
            <p className="text-xs mt-1">Set up automatic monthly payments to never miss rent</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map(payment => (
            <Card key={payment.id} className={payment.status === 'cancelled' ? 'opacity-60' : ''}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-primary" />
                      <p className="font-semibold text-sm">
                        Monthly Rent - £{payment.amount}
                      </p>
                      {getStatusBadge(payment.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>Payment day: {payment.day_of_month}{getDaySuffix(payment.day_of_month)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3 h-3" />
                        <span>Saved card</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Next: {new Date(payment.next_payment_date).toLocaleDateString('en-GB')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Repeat className="w-3 h-3" />
                        <span>Paid: {payment.total_payments || 0} times (£{(payment.total_amount_paid || 0).toLocaleString()})</span>
                      </div>
                    </div>

                    {payment.last_payment_date && (
                      <p className="text-xs text-muted-foreground">
                        Last payment: {new Date(payment.last_payment_date).toLocaleDateString('en-GB')}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {payment.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePayment.mutate({ id: payment.id, status: payment.status })}
                        className="gap-1 text-xs"
                      >
                        <PauseCircle className="w-3 h-3" /> Pause
                      </Button>
                    )}
                    {payment.status === 'paused' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePayment.mutate({ id: payment.id, status: payment.status })}
                        className="gap-1 text-xs"
                      >
                        <PlayCircle className="w-3 h-3" /> Resume
                      </Button>
                    )}
                    {payment.status !== 'cancelled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelPayment.mutate(payment.id)}
                        className="gap-1 text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" /> Cancel
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingDetails(payment)}
                      className="gap-1 text-xs"
                    >
                      <Eye className="w-3 h-3" /> View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail View */}
      {viewingDetails && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Repeat className="w-5 h-5" /> Recurring Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Amount" value={`£${viewingDetails.amount}/month`} />
              <DetailRow label="Payment Day" value={`${viewingDetails.day_of_month}${getDaySuffix(viewingDetails.day_of_month)} of each month`} />
              <DetailRow label="Status" value={getStatusBadge(viewingDetails.status)} />
              <DetailRow label="Started" value={new Date(viewingDetails.start_date).toLocaleDateString('en-GB')} />
              <DetailRow label="Next Payment" value={new Date(viewingDetails.next_payment_date).toLocaleDateString('en-GB')} />
              <DetailRow label="Last Payment" value={viewingDetails.last_payment_date ? new Date(viewingDetails.last_payment_date).toLocaleDateString('en-GB') : '—'} />
              <DetailRow label="Total Payments" value={`${viewingDetails.total_payments || 0}`} />
              <DetailRow label="Total Paid" value={`£${(viewingDetails.total_amount_paid || 0).toLocaleString()}`} />
            </div>
            {viewingDetails.notes && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                <p className="text-xs">{viewingDetails.notes}</p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setViewingDetails(null)}>Close</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="font-medium">{typeof value === 'string' ? value : value}</p>
    </div>
  );
}

function getDaySuffix(day) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}