import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Phone, MapPin, DollarSign, FileText, Shield } from 'lucide-react';

export default function VendorDetail({ vendor, insurance = [], agreements = [], payments = [], onBack }) {
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const totalOwed = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline" className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Vendors
      </Button>

      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground">{vendor.name}</h2>
            <p className="text-muted-foreground mt-1">Contact: {vendor.contact_name}</p>
          </div>
          <Badge className="bg-green-100 text-green-700">
            {vendor.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            {vendor.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${vendor.email}`} className="text-primary hover:underline">{vendor.email}</a>
              </div>
            )}
            {vendor.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                {vendor.phone}
              </div>
            )}
            {vendor.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p>{vendor.address}</p>
                  <p>{vendor.postcode}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 text-sm">
            {vendor.registration_number && (
              <div>
                <p className="text-muted-foreground">Company Registration</p>
                <p className="font-medium">{vendor.registration_number}</p>
              </div>
            )}
            {vendor.tax_id && (
              <div>
                <p className="text-muted-foreground">Tax ID / VAT</p>
                <p className="font-medium">{vendor.tax_id}</p>
              </div>
            )}
            {vendor.payment_terms && (
              <div>
                <p className="text-muted-foreground">Payment Terms</p>
                <p className="font-medium">{vendor.payment_terms.replace(/_/g, ' ')}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50">
          <Shield className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-2xl font-bold text-blue-900">{insurance.length}</p>
          <p className="text-xs text-blue-700">Insurance Policies</p>
        </Card>
        <Card className="p-4 bg-purple-50">
          <FileText className="w-5 h-5 text-purple-600 mb-2" />
          <p className="text-2xl font-bold text-purple-900">{agreements.length}</p>
          <p className="text-xs text-purple-700">Service Agreements</p>
        </Card>
        <Card className="p-4 bg-red-50">
          <DollarSign className="w-5 h-5 text-red-600 mb-2" />
          <p className="text-2xl font-bold text-red-900">£{(totalOwed / 100).toFixed(2)}</p>
          <p className="text-xs text-red-700">{pendingPayments} payments pending</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="insurance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insurance">Insurance ({insurance.length})</TabsTrigger>
          <TabsTrigger value="agreements">Agreements ({agreements.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="insurance" className="space-y-4">
          {insurance.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No insurance policies recorded</p>
            </Card>
          ) : (
            insurance.map(policy => (
              <Card key={policy.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{policy.insurance_type.replace(/_/g, ' ')}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Provider: {policy.provider}</p>
                    <p className="text-xs text-muted-foreground">Policy: {policy.policy_number}</p>
                  </div>
                  <Badge
                    className={
                      policy.status === 'active' ? 'bg-green-100 text-green-700' :
                      policy.status === 'expiring_soon' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }
                  >
                    {policy.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200 text-sm">
                  <div>
                    <p className="text-muted-foreground">Coverage</p>
                    <p className="font-medium">£{(policy.coverage_amount / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Issue Date</p>
                    <p className="font-medium">{new Date(policy.issue_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expiry Date</p>
                    <p className="font-medium">{new Date(policy.expiry_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="agreements" className="space-y-4">
          {agreements.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No service agreements</p>
            </Card>
          ) : (
            agreements.map(agreement => (
              <Card key={agreement.id} className="p-4">
                <h3 className="font-semibold text-foreground">{agreement.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{agreement.agreement_type.replace(/_/g, ' ')}</p>
                {agreement.monthly_cost && (
                  <p className="text-sm text-foreground mt-2">£{(agreement.monthly_cost / 100).toFixed(2)}/month</p>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          {payments.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No payment history</p>
            </Card>
          ) : (
            payments.map(payment => (
              <Card key={payment.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{payment.invoice_number}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{payment.description}</p>
                  </div>
                  <Badge
                    className={
                      payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      payment.status === 'overdue' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200 text-sm">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium">£{(payment.amount / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">{new Date(payment.due_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Invoice Date</p>
                    <p className="font-medium">{new Date(payment.invoice_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}