import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';
import { format, isBefore, isToday } from 'date-fns';

export default function UpcomingPaymentsSchedule({ tenant }) {
  const { data: recurringPayments = [], isLoading } = useQuery({
    queryKey: ['recurring-payments', tenant.id],
    queryFn: async () => {
      return await base44.entities.RecurringPayment.filter(
        { tenant_id: tenant.id, status: 'active' },
        'next_payment_date',
        10
      );
    }
  });

  const { data: upcomingTransactions = [] } = useQuery({
    queryKey: ['upcoming-transactions', tenant.id],
    queryFn: async () => {
      return await base44.entities.FinancialTransaction.filter(
        { tenant_id: tenant.id, transaction_type: 'rent', status: 'pending' },
        'transaction_date',
        12
      );
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-muted-foreground">Loading schedule...</p>
      </div>
    );
  }

  if (recurringPayments.length === 0 && upcomingTransactions.length === 0) {
    return (
      <Card className="p-12 bg-white text-center">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No upcoming payments scheduled</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recurring Payment Info */}
      {recurringPayments.length > 0 && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-foreground mb-4">Recurring Payment Schedule</h3>
          <div className="space-y-3">
            {recurringPayments.map(payment => {
              const nextDate = new Date(payment.next_payment_date);
              const isUpcoming = !isBefore(nextDate, new Date());

              return (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                  <div>
                    <p className="font-semibold text-foreground">
                      £{payment.monthly_amount?.toLocaleString('en-GB', { minimumFractionDigits: 2 }) || '0.00'} Monthly Payment
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Starts {format(new Date(payment.start_date), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    ✓ Active
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Upcoming One-Off Payments */}
      {upcomingTransactions.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-4">Upcoming Payments</h3>
          <div className="space-y-3">
            {upcomingTransactions.map(transaction => {
              const txDate = new Date(transaction.transaction_date);
              const daysUntil = Math.ceil((txDate - new Date()) / (1000 * 60 * 60 * 24));
              const isOverdue = daysUntil < 0;
              const isDue = daysUntil <= 3;

              return (
                <Card key={transaction.id} className={`p-4 border-l-4 ${
                  isOverdue ? 'border-l-red-500 bg-red-50' :
                  isDue ? 'border-l-orange-500 bg-orange-50' :
                  'border-l-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <p className="font-semibold text-foreground">
                          {format(txDate, 'MMMM yyyy')} Rent
                        </p>
                        {isOverdue && (
                          <Badge className="bg-red-100 text-red-700">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                        {isDue && !isOverdue && (
                          <Badge className="bg-orange-100 text-orange-700">Due Soon</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-semibold text-foreground">
                            £{transaction.amount?.toLocaleString('en-GB', { minimumFractionDigits: 2 }) || '0.00'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Due Date</p>
                          <p className="font-semibold text-foreground">
                            {format(txDate, 'dd MMM yyyy')}
                            {daysUntil >= 0 && <span className="text-xs text-muted-foreground ml-1">({daysUntil} days)</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Box */}
      <Card className="p-4 bg-green-50 border-green-200">
        <p className="text-sm text-green-900">
          <strong>Tip:</strong> Set up a recurring payment reminder in your calendar to avoid missed payments.
        </p>
      </Card>
    </div>
  );
}