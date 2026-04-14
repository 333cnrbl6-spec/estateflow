import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { AlertCircle, DollarSign, Calendar, FileText, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PaymentHistoryViewer from '@/components/tenant/PaymentHistoryViewer';
import UpcomingPaymentsSchedule from '@/components/tenant/UpcomingPaymentsSchedule';
import RentReceiptDownloader from '@/components/tenant/RentReceiptDownloader';
import TenantRentPayment from '@/components/tenant/TenantRentPayment';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || '');

export default function TenantPaymentPortal() {
  const [tenant, setTenant] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initPortal = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (!token) {
          setError('No access token provided');
          setLoading(false);
          return;
        }

        const tenantData = localStorage.getItem(`tenant_${token}`);
        if (!tenantData) {
          setError('Invalid or expired access token');
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(tenantData);
        setTenant(parsed);

        if (parsed.property_id) {
          const propData = await base44.entities.Property.get(parsed.property_id);
          setProperty(propData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initPortal();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-green-700 font-medium">Loading payment portal...</p>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h1 className="text-lg font-bold text-foreground">Access Error</h1>
          </div>
          <p className="text-muted-foreground mb-6">{error || 'Unable to load tenant data'}</p>
          <Button onClick={handleLogout} variant="outline" className="w-full">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Rent Payment Center</h1>
              <p className="text-muted-foreground mt-1">
                {tenant.full_name}
                {property && ` • ${property.address}`}
              </p>
            </div>
            <Button onClick={handleLogout} variant="ghost" size="icon" className="text-muted-foreground">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <PaymentSummaryCard tenant={tenant} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pay" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="pay" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Pay Now</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="receipts" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Receipts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pay" className="space-y-6">
            <Elements stripe={stripePromise}>
              <TenantRentPayment tenant={tenant} />
            </Elements>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <PaymentHistoryViewer tenant={tenant} />
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <UpcomingPaymentsSchedule tenant={tenant} />
          </TabsContent>

          <TabsContent value="receipts" className="space-y-6">
            <RentReceiptDownloader tenant={tenant} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PaymentSummaryCard({ tenant }) {
  const { data: summary = {} } = useQuery({
    queryKey: ['payment-summary', tenant.id],
    queryFn: async () => {
      const transactions = await base44.entities.FinancialTransaction.filter(
        { tenant_id: tenant.id, transaction_type: 'rent' },
        '-transaction_date',
        100
      ).catch(() => []);

      const paidTotal = transactions
        .filter(t => t.status === 'paid')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const overdueTotal = transactions
        .filter(t => t.status === 'overdue')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      return {
        totalPaid: paidTotal,
        overdueAmount: overdueTotal,
        totalTransactions: transactions.length
      };
    }
  });

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
        <p className="text-3xl font-bold text-green-700">£{summary.totalPaid?.toLocaleString('en-GB', { minimumFractionDigits: 2 }) || '0.00'}</p>
        <p className="text-xs text-green-600 mt-2">{summary.totalTransactions || 0} transactions</p>
      </Card>
      
      {summary.overdueAmount > 0 && (
        <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <p className="text-sm text-muted-foreground mb-1">Amount Overdue</p>
          <p className="text-3xl font-bold text-red-700">£{summary.overdueAmount?.toLocaleString('en-GB', { minimumFractionDigits: 2 }) || '0.00'}</p>
          <p className="text-xs text-red-600 mt-2">Requires immediate payment</p>
        </Card>
      )}
    </>
  );
}