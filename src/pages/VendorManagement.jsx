import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, Users, FileText, DollarSign, Shield } from 'lucide-react';
import VendorList from '@/components/vendor/VendorList';
import VendorDetail from '@/components/vendor/VendorDetail';
import InsuranceTracker from '@/components/vendor/InsuranceTracker';
import PaymentHistory from '@/components/vendor/PaymentHistory';

export default function VendorManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [activeTab, setActiveTab] = useState('vendors');

  const { data: vendors = [], refetch: refetchVendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor?.list?.() || Promise.resolve([])
  });

  const { data: insurance = [] } = useQuery({
    queryKey: ['vendor-insurance'],
    queryFn: () => base44.entities.VendorInsurance?.list?.() || Promise.resolve([])
  });

  const { data: agreements = [] } = useQuery({
    queryKey: ['service-agreements'],
    queryFn: () => base44.entities.ServiceAgreement?.list?.() || Promise.resolve([])
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['vendor-payments'],
    queryFn: () => base44.entities.VendorPayment?.list?.() || Promise.resolve([])
  });

  const filteredVendors = vendors.filter(v =>
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const activeVendors = vendors.filter(v => v.status === 'active').length;
  const expiringInsurance = insurance.filter(cert => {
    const expiry = new Date(cert.expiry_date);
    const daysLeft = Math.floor((expiry - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 30;
  }).length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-foreground">Vendor Management</h1>
          <p className="text-muted-foreground mt-2">Manage contractors, insurance, and payments</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <Users className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-900">{activeVendors}</p>
            <p className="text-xs text-blue-700 mt-1">Active Vendors</p>
          </Card>
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <Shield className="w-5 h-5 text-yellow-600 mb-2" />
            <p className="text-2xl font-bold text-yellow-900">{expiringInsurance}</p>
            <p className="text-xs text-yellow-700 mt-1">Expiring Insurance</p>
          </Card>
          <Card className="p-4 bg-purple-50 border-purple-200">
            <FileText className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-900">{agreements.filter(a => a.status === 'active').length}</p>
            <p className="text-xs text-purple-700 mt-1">Active Agreements</p>
          </Card>
          <Card className="p-4 bg-red-50 border-red-200">
            <DollarSign className="w-5 h-5 text-red-600 mb-2" />
            <p className="text-2xl font-bold text-red-900">{pendingPayments}</p>
            <p className="text-xs text-red-700 mt-1">Pending Payments</p>
          </Card>
        </div>

        {/* Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="insurance">Insurance</TabsTrigger>
            <TabsTrigger value="agreements">Agreements</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-6">
            <div className="flex items-center justify-between">
              <Input
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Vendor
              </Button>
            </div>

            {selectedVendor ? (
              <VendorDetail
                vendor={selectedVendor}
                insurance={insurance.filter(i => i.vendor_id === selectedVendor.id)}
                agreements={agreements.filter(a => a.vendor_id === selectedVendor.id)}
                payments={payments.filter(p => p.vendor_id === selectedVendor.id)}
                onBack={() => setSelectedVendor(null)}
              />
            ) : (
              <VendorList
                vendors={filteredVendors}
                onSelect={setSelectedVendor}
              />
            )}
          </TabsContent>

          {/* Insurance Tab */}
          <TabsContent value="insurance">
            <InsuranceTracker
              vendors={vendors}
              insurance={insurance}
            />
          </TabsContent>

          {/* Agreements Tab */}
          <TabsContent value="agreements" className="space-y-4">
            {agreements.length === 0 ? (
              <Card className="p-6 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-muted-foreground">No service agreements</p>
              </Card>
            ) : (
              agreements.map(agreement => {
                const vendor = vendors.find(v => v.id === agreement.vendor_id);
                return (
                  <Card key={agreement.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{agreement.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{vendor?.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{agreement.description}</p>
                      </div>
                      <Badge
                        className={
                          agreement.status === 'active' ? 'bg-green-100 text-green-700' :
                          agreement.status === 'draft' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }
                      >
                        {agreement.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200 text-xs">
                      <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p className="font-medium">{new Date(agreement.start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">End Date</p>
                        <p className="font-medium">{new Date(agreement.end_date).toLocaleDateString()}</p>
                      </div>
                      {agreement.monthly_cost && (
                        <div>
                          <p className="text-muted-foreground">Monthly Cost</p>
                          <p className="font-medium">£{(agreement.monthly_cost / 100).toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <PaymentHistory
              payments={payments}
              vendors={vendors}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}