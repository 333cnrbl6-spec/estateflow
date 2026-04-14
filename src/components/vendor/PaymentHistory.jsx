import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function PaymentHistory({ payments = [], vendors = [] }) {
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = filterStatus === 'all' 
    ? payments 
    : payments.filter(p => p.status === filterStatus);

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidAmount = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0);
  const overdueAmount = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + (p.amount || 0), 0);

  const getStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-slate-100 text-slate-700'
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-xs text-blue-700 font-medium">Total Amount</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">£{(totalAmount / 100).toFixed(2)}</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-xs text-green-700 font-medium">Paid</p>
          <p className="text-2xl font-bold text-green-900 mt-1">£{(paidAmount / 100).toFixed(2)}</p>
        </Card>
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-xs text-yellow-700 font-medium">Pending</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">£{(pendingAmount / 100).toFixed(2)}</p>
        </Card>
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-xs text-red-700 font-medium">Overdue</p>
          <p className="text-2xl font-bold text-red-900 mt-1">£{(overdueAmount / 100).toFixed(2)}</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'pending', 'paid', 'overdue'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              filterStatus === status
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-muted-foreground hover:bg-slate-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Payment List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No payments found</p>
          </Card>
        ) : (
          filtered.map(payment => {
            const vendor = vendors.find(v => v.id === payment.vendor_id);
            const isOverdue = payment.status === 'pending' && new Date(payment.due_date) < new Date();

            return (
              <Card key={payment.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{vendor?.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {payment.invoice_number} · {payment.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge className={getStatusColor(isOverdue ? 'overdue' : payment.status)}>
                      {isOverdue ? 'Overdue' : payment.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200 text-sm">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium">£{(payment.amount / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Invoice Date</p>
                    <p className="font-medium">{new Date(payment.invoice_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                      {new Date(payment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  {payment.payment_date && (
                    <div>
                      <p className="text-muted-foreground">Paid Date</p>
                      <p className="font-medium">{new Date(payment.payment_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}