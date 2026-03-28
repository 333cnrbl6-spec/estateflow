import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Wrench, 
  AlertCircle, 
  Download, 
  FileText, 
  TrendingUp,
  CheckCircle2,
  Clock,
  MessageSquare
} from 'lucide-react';

export default function LeaseholderPortalView() {
  const [selectedUnit, setSelectedUnit] = useState('');
  const [filingComplaint, setFilingComplaint] = useState(false);
  const [complaintData, setComplaintData] = useState({
    type: 'maintenance',
    subject: '',
    description: '',
    amount_disputed: '',
  });

  const queryClient = useQueryClient();
  const user = base44.auth.me();

  // Fetch data
  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => base44.entities.Tenant.list(),
    initialData: [],
  });

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list(),
    initialData: [],
  });

  const { data: serviceCharges } = useQuery({
    queryKey: ['serviceCharges'],
    queryFn: () => base44.entities.ServiceCharge.list(),
    initialData: [],
  });

  const { data: maintenanceOrders } = useQuery({
    queryKey: ['maintenanceOrders'],
    queryFn: () => base44.entities.MaintenanceOrder.list(),
    initialData: [],
  });

  const { data: leaseholderRights } = useQuery({
    queryKey: ['leaseholderRights'],
    queryFn: () => base44.entities.LeaseholderRights.list(),
    initialData: [],
  });

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
    initialData: [],
  });

  // File complaint mutation
  const fileComplaintMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUnit || !complaintData.subject || !complaintData.description) {
        throw new Error('Please fill in all required fields');
      }

      const leaseholder = leaseholderRights.find(lr => lr.unit_id === selectedUnit);
      if (!leaseholder) {
        throw new Error('Leaseholder record not found');
      }

      const response = await base44.functions.invoke('fileLeaseholderDispute', {
        unit_id: selectedUnit,
        type: complaintData.type,
        subject: complaintData.subject,
        description: complaintData.description,
        amount_disputed: complaintData.amount_disputed ? parseInt(complaintData.amount_disputed) : null,
        service_charge_id: leaseholder.property_id,
        property_id: leaseholder.property_id,
      });

      setFilingComplaint(false);
      setComplaintData({ type: 'maintenance', subject: '', description: '', amount_disputed: '' });
      queryClient.invalidateQueries({ queryKey: ['leaseholderRights'] });

      return response.data;
    },
  });

  // Get current user's unit
  const currentTenant = useMemo(() => {
    return tenants.find(t => t.email === user?.email);
  }, [tenants, user]);

  // Get user's unit details
  const userUnit = useMemo(() => {
    return units.find(u => u.id === currentTenant?.unit_id || u.id === selectedUnit);
  }, [units, currentTenant, selectedUnit]);

  // Get service charge for user's property
  const userServiceCharge = useMemo(() => {
    if (!userUnit) return null;
    return serviceCharges.find(sc => sc.property_id === userUnit.property_id);
  }, [serviceCharges, userUnit]);

  // Get maintenance orders for user's property
  const propertyMaintenance = useMemo(() => {
    if (!userUnit) return [];
    return maintenanceOrders.filter(mo => mo.property_id === userUnit.property_id);
  }, [maintenanceOrders, userUnit]);

  // Get leaseholder complaints
  const userComplaints = useMemo(() => {
    if (!selectedUnit) return [];
    const leaseholder = leaseholderRights.find(lr => lr.unit_id === selectedUnit);
    return leaseholder?.complaint_handling || [];
  }, [leaseholderRights, selectedUnit]);

  // Get service charge disputes
  const userDisputes = useMemo(() => {
    if (!userServiceCharge) return [];
    return userServiceCharge.disputed_items?.filter(di => di.unit_id === selectedUnit) || [];
  }, [userServiceCharge, selectedUnit]);

  const property = userUnit ? properties.find(p => p.id === userUnit.property_id) : null;

  return (
    <div className="min-h-screen bg-background space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold text-foreground">Leaseholder Portal</h1>
        <p className="text-muted-foreground mt-1">
          {property?.name || 'View your service charges, maintenance updates, and file complaints'}
        </p>
      </div>

      {/* Unit Selection for Admin/Staff View */}
      {!currentTenant && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">Select Unit to View</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-white"
            >
              <option value="">-- Select a unit --</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.unit_reference}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      {userUnit && (
        <Tabs defaultValue="charges" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="charges">Service Charges</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="complaints">Complaints</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Service Charges Tab */}
          <TabsContent value="charges" className="space-y-6">
            {userServiceCharge ? (
              <>
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Estimated Charge</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        £{userServiceCharge.total_estimated_cost?.toLocaleString() || '0'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Year {userServiceCharge.year}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Your Unit Share</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        £{userServiceCharge.per_unit_charges?.length > 0 
                          ? (userServiceCharge.per_unit_charges[0].estimated_charge || 0).toLocaleString() 
                          : '0'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Of {userServiceCharge.leaseholder_count} units</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Payment Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">Paid</div>
                      <p className="text-xs text-muted-foreground mt-1">No arrears</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Cost Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Cost Breakdown
                    </CardTitle>
                    <CardDescription>
                      Detailed breakdown of service charge components for {userServiceCharge.year}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userServiceCharge.cost_breakdown?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.category.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-muted-foreground">{item.note || 'Service charge component'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">£{(item.actual_cost || item.budgeted_cost || 0).toLocaleString()}</p>
                            {item.variance !== undefined && (
                              <p className={`text-xs ${item.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {item.variance > 0 ? '+' : ''}£{item.variance.toLocaleString()} variance
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* s.20 Status */}
                {userServiceCharge.section_20_consultation_required && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        s.20 Consultation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm">
                        <strong>Status:</strong> {userServiceCharge.section_20_status?.replace(/_/g, ' ')}
                      </p>
                      {userServiceCharge.section_20_deadline && (
                        <p className="text-sm">
                          <strong>Deadline:</strong> {new Date(userServiceCharge.section_20_deadline).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        You have the right to make representations about these charges within 30 days.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No service charge information available for your unit</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-6">
            {propertyMaintenance.length > 0 ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="w-5 h-5" />
                      Communal Repairs & Maintenance
                    </CardTitle>
                    <CardDescription>Ongoing and completed works in your building</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {propertyMaintenance.map(mo => (
                      <div key={mo.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{mo.title}</p>
                            <p className="text-sm text-muted-foreground">{mo.category}</p>
                          </div>
                          <Badge className={
                            mo.status === 'completed' ? 'bg-green-100 text-green-800' :
                            mo.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            mo.status === 'approved' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-800'
                          }>
                            {mo.status}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{mo.description}</p>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          {mo.contractor_name && (
                            <div>
                              <p className="text-muted-foreground">Contractor</p>
                              <p className="font-medium">{mo.contractor_name}</p>
                            </div>
                          )}
                          {mo.estimated_cost && (
                            <div>
                              <p className="text-muted-foreground">Cost</p>
                              <p className="font-medium">£{mo.estimated_cost.toLocaleString()}</p>
                            </div>
                          )}
                          {mo.scheduled_date && (
                            <div>
                              <p className="text-muted-foreground">Scheduled</p>
                              <p className="font-medium">{new Date(mo.scheduled_date).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No maintenance orders for your building</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Complaints Tab */}
          <TabsContent value="complaints" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      File a Complaint or Dispute
                    </CardTitle>
                    <CardDescription>Formal complaints about service, charges, or maintenance</CardDescription>
                  </div>
                  <Dialog open={filingComplaint} onOpenChange={setFilingComplaint}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <AlertCircle className="w-4 h-4" />
                        New Complaint
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>File a Complaint</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Complaint Type</label>
                          <select
                            value={complaintData.type}
                            onChange={(e) => setComplaintData({ ...complaintData, type: e.target.value })}
                            className="w-full px-3 py-2 border border-input rounded-md text-sm mt-1"
                          >
                            <option value="maintenance">Maintenance Issue</option>
                            <option value="service_charge">Service Charge Dispute</option>
                            <option value="communication">Communication</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Subject</label>
                          <input
                            type="text"
                            placeholder="Brief subject of complaint"
                            value={complaintData.subject}
                            onChange={(e) => setComplaintData({ ...complaintData, subject: e.target.value })}
                            className="w-full px-3 py-2 border border-input rounded-md text-sm mt-1"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <textarea
                            placeholder="Detailed description of the issue"
                            value={complaintData.description}
                            onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-input rounded-md text-sm mt-1 h-32"
                          />
                        </div>

                        {complaintData.type === 'service_charge' && (
                          <div>
                            <label className="text-sm font-medium">Amount Disputed (optional)</label>
                            <input
                              type="number"
                              placeholder="£0.00"
                              value={complaintData.amount_disputed}
                              onChange={(e) => setComplaintData({ ...complaintData, amount_disputed: e.target.value })}
                              className="w-full px-3 py-2 border border-input rounded-md text-sm mt-1"
                            />
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => fileComplaintMutation.mutate()}
                            disabled={fileComplaintMutation.isPending}
                          >
                            {fileComplaintMutation.isPending ? 'Filing...' : 'File Complaint'}
                          </Button>
                          <Button variant="outline" onClick={() => setFilingComplaint(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>

            {/* Complaints History */}
            {userComplaints.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Your Complaints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {userComplaints.map((complaint, idx) => (
                    <div key={idx} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{complaint.subject}</p>
                          <p className="text-sm text-muted-foreground">{complaint.complaint_date}</p>
                        </div>
                        <Badge className={
                          complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          complaint.status === 'under_investigation' ? 'bg-blue-100 text-blue-800' :
                          complaint.status === 'acknowledged' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                        }>
                          {complaint.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{complaint.description}</p>
                      {complaint.resolution && (
                        <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                          <p className="text-sm"><strong>Resolution:</strong> {complaint.resolution}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No complaints filed</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Statutory Documents
                </CardTitle>
                <CardDescription>Annual statements and statutory disclosures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {userServiceCharge && (
                  <>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-semibold text-sm">Annual Service Charge Statement</p>
                        <p className="text-xs text-muted-foreground">Year {userServiceCharge.year}</p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download PDF
                      </Button>
                    </div>

                    {userServiceCharge.audit_certificate && userServiceCharge.audit_certificate.audit_date && (
                       <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                         <div>
                           <p className="font-semibold text-sm">Audit Certificate</p>
                           <p className="text-xs text-muted-foreground">
                             {new Date(userServiceCharge.audit_certificate.audit_date).toLocaleDateString()}
                           </p>
                         </div>
                         <Button variant="outline" size="sm" className="gap-2">
                           <Download className="w-4 h-4" />
                           Download
                         </Button>
                       </div>
                     )}
                  </>
                )}

                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-semibold text-sm">Prescribed Information Notice</p>
                    <p className="text-xs text-muted-foreground">Housing Act 2004 s.213</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-semibold text-sm">Lease Documentation</p>
                    <p className="text-xs text-muted-foreground">Your lease terms and conditions</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}