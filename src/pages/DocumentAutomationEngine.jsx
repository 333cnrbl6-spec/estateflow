import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus, Send, RotateCw, AlertCircle, CheckCircle2, Clock, Download } from 'lucide-react';

export default function DocumentAutomationEngine() {
  const [search, setSearch] = useState('');
  const [selectedNoticeType, setSelectedNoticeType] = useState('s20_consultation');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState(null);

  const queryClient = useQueryClient();

  // Fetch data
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
    initialData: [],
  });

  const { data: serviceCharges } = useQuery({
    queryKey: ['serviceCharges'],
    queryFn: () => base44.entities.ServiceCharge.list(),
    initialData: [],
  });

  const { data: rtmRecords } = useQuery({
    queryKey: ['rtmManagement'],
    queryFn: () => base44.entities.RTMManagement.list(),
    initialData: [],
  });

  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list(),
    initialData: [],
  });

  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => base44.entities.Tenant.list(),
    initialData: [],
  });

  const { data: leaseholderRights } = useQuery({
    queryKey: ['leaseholderRights'],
    queryFn: () => base44.entities.LeaseholderRights.list(),
    initialData: [],
  });

  // Generate notice mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProperty) {
        throw new Error('Please select a property');
      }

      setGenerating(true);
      const property = properties.find(p => p.id === selectedProperty);

      let noticeData = {};

      if (selectedNoticeType === 's20_consultation') {
        const sc = serviceCharges.find(s => s.property_id === selectedProperty);
        if (!sc) throw new Error('No service charge found for this property');

        noticeData = {
          property_name: property.name,
          notice_date: new Date().toISOString().split('T')[0],
          notice_reference: `S20-${property.id.slice(0, 4)}-${Date.now()}`,
          cost_items: sc.cost_breakdown || [],
          total_estimated_cost: sc.total_estimated_cost || 0,
          managing_agent_address: '123 Property Lane, London, UK',
          managing_agent_contact: 'Managing Agent Ltd',
          managing_agent_phone: '020 1234 5678',
          consultation_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };
      } else if (selectedNoticeType === 'rtm_claim') {
        const rtm = rtmRecords.find(r => r.property_id === selectedProperty);
        if (!rtm) throw new Error('No RTM record found for this property');

        noticeData = {
          property_name: property.name,
          notice_date: new Date().toISOString().split('T')[0],
          notice_reference: `RTM-${property.id.slice(0, 4)}-${Date.now()}`,
          company_name: rtm.rtm_company_details?.name || 'RTM Company Ltd',
          company_number: rtm.rtm_company_details?.company_number || 'TBC',
          company_address: rtm.rtm_company_details?.registered_office || 'TBC',
          total_leaseholders: rtm.leaseholder_eligibility?.total_leaseholders || 0,
          participating_leaseholders: rtm.leaseholder_eligibility?.eligible_to_participate || 0,
          percentage_participation: rtm.leaseholder_eligibility?.eligible_percentage || 0,
          proposed_acquisition_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          counternotice_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          rtm_contact: 'RTM Company Representative',
          rtm_phone: '020 9876 5432',
        };
      }

      const response = await base44.functions.invoke('generateStatutoryNotice', {
        notice_type: selectedNoticeType,
        property_id: selectedProperty,
        data: noticeData,
      });

      setGeneratedDocument(response.data);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setGenerating(false);

      return response.data;
    },
    onError: (error) => {
      setGenerating(false);
    },
  });

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const property = properties.find(p => p.id === doc.property_id);
    const matchesSearch = !search || property?.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = !selectedNoticeType || doc.type === selectedNoticeType;
    return matchesSearch && matchesType;
  });

  // Track notice status
  const getNoticeStatus = (doc) => {
    const property = properties.find(p => p.id === doc.property_id);
    
    if (doc.type === 's20_consultation') {
      const sc = serviceCharges.find(s => s.property_id === doc.property_id);
      return {
        stage: sc?.section_20_status || 'notice_issued',
        disputes: sc?.disputed_items?.length || 0,
        leaseholders: sc?.leaseholder_count || 0,
      };
    }

    return {
      stage: 'pending',
      disputes: 0,
      leaseholders: 0,
    };
  };

  const noticeTypes = [
    { id: 's20_consultation', label: 's.20 Consultation (Landlord & Tenant Act 1985)', icon: '📋' },
    { id: 'rtm_claim', label: 'RTM Claim Notice (Leasehold Reform Act 2002)', icon: '📝' },
    { id: 's21_notice', label: 's.21 Notice to Quit (Housing Act 1988)', icon: '⚠️' },
  ];

  const stageColors = {
    notice_issued: 'bg-blue-100 text-blue-800',
    consultation_period: 'bg-amber-100 text-amber-800',
    leaseholder_consent_obtained: 'bg-green-100 text-green-800',
    dispute_filed: 'bg-red-100 text-red-800',
    pending: 'bg-slate-100 text-slate-800',
  };

  return (
    <div className="min-h-screen bg-background space-y-6 p-6">
      <div>
        <h1 className="text-4xl font-serif font-bold text-foreground">Document Automation Engine</h1>
        <p className="text-muted-foreground mt-1">Generate and track statutory notices with leaseholder response workflow</p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Notice</TabsTrigger>
          <TabsTrigger value="tracking">Track Notices</TabsTrigger>
          <TabsTrigger value="responses">Responses & Disputes</TabsTrigger>
        </TabsList>

        {/* Generate Notice Tab */}
        <TabsContent value="generate" className="space-y-6">
          {/* Notice Type Selection */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Notice Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {noticeTypes.map(type => (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all ${
                    selectedNoticeType === type.id
                      ? 'border-primary ring-2 ring-primary/50'
                      : 'hover:border-muted-foreground/50'
                  }`}
                  onClick={() => setSelectedNoticeType(type.id)}
                >
                  <CardHeader>
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <CardTitle className="text-base">{type.label}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Property Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Property</CardTitle>
              <CardDescription>Choose the property for this notice</CardDescription>
            </CardHeader>
            <CardContent>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">-- Select a property --</option>
                {properties.map(prop => (
                  <option key={prop.id} value={prop.id}>
                    {prop.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex gap-3">
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={!selectedProperty || generating}
              size="lg"
              className="gap-2"
            >
              {generating ? 'Generating...' : <>
                <FileText className="w-4 h-4" />
                Generate Notice
              </>}
            </Button>
          </div>

          {/* Generated Document Preview */}
          {generatedDocument && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Notice Generated Successfully
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Document Reference:</p>
                  <p className="font-mono bg-white p-2 rounded text-sm">{generatedDocument.document_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Preview (First 500 characters):</p>
                  <div className="bg-white border border-input rounded-lg p-4 text-sm max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {generatedDocument.content.substring(0, 500)}...
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Send className="w-4 h-4" />
                    Send to Leaseholders
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Track Notices Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Statutory Notices</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search by property..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4"
              />

              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No notices generated yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDocuments.map(doc => {
                    const property = properties.find(p => p.id === doc.property_id);
                    const status = getNoticeStatus(doc);

                    return (
                      <div key={doc.id} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold">{doc.title}</p>
                            <p className="text-sm text-muted-foreground">{property?.name}</p>
                          </div>
                          <Badge className={stageColors[status.stage]}>
                            {status.stage.replace(/_/g, ' ')}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Generated</p>
                            <p className="font-semibold">{doc.generated_date}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Leaseholders</p>
                            <p className="font-semibold">{status.leaseholders}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Disputes</p>
                            <p className={`font-semibold ${status.disputes > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {status.disputes}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-2">
                            <Download className="w-3 h-3" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Send className="w-3 h-3" />
                            Send
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Responses & Disputes Tab */}
        <TabsContent value="responses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leaseholder Responses & Dispute Tracking</CardTitle>
              <CardDescription>Monitor responses to s.20 and RTM notices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* s.20 Disputes */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">s.20 Service Charge Disputes</h3>
                  {serviceCharges.filter(sc => sc.disputed_items && sc.disputed_items.length > 0).length === 0 ? (
                    <p className="text-muted-foreground text-sm">No disputes filed</p>
                  ) : (
                    serviceCharges
                      .filter(sc => sc.disputed_items && sc.disputed_items.length > 0)
                      .map(sc => {
                        const property = properties.find(p => p.id === sc.property_id);
                        return (
                          <div key={sc.id} className="border border-border rounded-lg p-4 bg-red-50">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold">{property?.name}</p>
                                <p className="text-sm text-muted-foreground">Year {sc.year}</p>
                              </div>
                              <Badge className="bg-red-200 text-red-800">
                                {sc.disputed_items.length} items disputed
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              {sc.disputed_items.map((item, idx) => (
                                <div key={idx} className="text-sm bg-white p-2 rounded">
                                  <div className="flex justify-between">
                                    <span className="font-medium">{item.category}</span>
                                    <span className="text-red-600">£{item.amount_disputed?.toLocaleString()}</span>
                                  </div>
                                  <p className="text-muted-foreground text-xs mt-1">{item.reason}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Status: {item.resolution_status}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>

                {/* RTM Claims Status */}
                <div className="space-y-3 mt-6">
                  <h3 className="font-semibold text-lg">RTM Claims & Disputes</h3>
                  {rtmRecords.filter(r => r.rtm_claim_process?.dispute_filed).length === 0 ? (
                    <p className="text-muted-foreground text-sm">No RTM disputes filed</p>
                  ) : (
                    rtmRecords
                      .filter(r => r.rtm_claim_process?.dispute_filed)
                      .map(rtm => {
                        const property = properties.find(p => p.id === rtm.property_id);
                        return (
                          <div key={rtm.id} className="border border-border rounded-lg p-4 bg-amber-50">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{property?.name}</p>
                                <p className="text-sm text-muted-foreground">RTM Dispute Filed</p>
                              </div>
                              <Badge className="bg-amber-200 text-amber-800">In Dispute</Badge>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}