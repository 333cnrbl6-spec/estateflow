import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { FileText, Wand2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/shared/PageHeader';
import AIDocumentDrafter from '@/components/documents/AIDocumentDrafter';

const DOC_TYPES = [
  { value: 'tenancy_agreement', label: 'Tenancy Agreement' },
  { value: 'section_21', label: 'Section 21 Notice' },
  { value: 'section_8', label: 'Section 8 Notice' },
  { value: 'rent_review', label: 'Rent Review Letter' },
  { value: 'inspection_report', label: 'Inspection Report' },
];

export default function TenancyDocuments() {
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [docType, setDocType] = useState('tenancy_agreement');

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => base44.entities.Tenant.list(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const tenant = tenants.find(t => t.id === selectedTenant);
  const property = properties.find(p => p.id === selectedProperty);

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <PageHeader
        title="AI Document Drafting"
        subtitle="Generate legally compliant UK property documents in minutes"
        icon={<FileText className="w-5 h-5" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Configuration Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4" /> Document Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm mb-1.5 block">Document Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm mb-1.5 block">Property</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property..." />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name || p.address_line_1 || p.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm mb-1.5 block">Tenant</Label>
              <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant..." />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {tenant && (
              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-1">
                <p><span className="font-medium">Tenant:</span> {tenant.full_name}</p>
                {tenant.tenancy_start_date && <p><span className="font-medium">Start:</span> {tenant.tenancy_start_date}</p>}
                {tenant.tenancy_end_date && <p><span className="font-medium">End:</span> {tenant.tenancy_end_date}</p>}
                {tenant.deposit_amount && <p><span className="font-medium">Deposit:</span> £{tenant.deposit_amount}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Draft Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" /> AI Document Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedProperty && !selectedTenant ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-medium">Select a property and tenant to get started</p>
                  <p className="text-xs text-slate-400 mt-1">Or generate a document template without specific details</p>
                  <div className="mt-4">
                    <AIDocumentDrafter
                      documentType={docType}
                      property={null}
                      tenant={null}
                      startDate={null}
                      rentAmount={null}
                      depositAmount={null}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                    <p className="font-semibold mb-1">Ready to draft:</p>
                    <p>
                      {DOC_TYPES.find(d => d.value === docType)?.label} for{' '}
                      {tenant?.full_name || 'tenant'} at{' '}
                      {property?.name || property?.address_line_1 || 'property'}
                    </p>
                  </div>
                  <AIDocumentDrafter
                    documentType={docType}
                    property={property}
                    tenant={tenant}
                    startDate={tenant?.tenancy_start_date}
                    rentAmount={tenant?.deposit_amount ? Math.round(tenant.deposit_amount / 5) : null}
                    depositAmount={tenant?.deposit_amount}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document types info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {DOC_TYPES.map(d => (
              <button
                key={d.value}
                onClick={() => setDocType(d.value)}
                className={`text-left p-3 rounded-lg border text-sm transition-all ${
                  docType === d.value
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <FileText className="w-3.5 h-3.5 mb-1.5" />
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}