import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Download,
  Signature
} from 'lucide-react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import InspectionEditor from '@/components/inspections/InspectionEditor';

const ROOM_TYPES = [
  { value: 'living_room', label: 'Living Room' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'hallway', label: 'Hallway' },
  { value: 'garden', label: 'Garden' },
  { value: 'other', label: 'Other' }
];

const CONDITION_OPTIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'damaged', label: 'Damaged' }
];

const CLEANLINESS_OPTIONS = [
  { value: 'very_clean', label: 'Very Clean' },
  { value: 'clean', label: 'Clean' },
  { value: 'acceptable', label: 'Acceptable' },
  { value: 'dirty', label: 'Dirty' },
  { value: 'very_dirty', label: 'Very Dirty' }
];

const ITEM_CATEGORIES = [
  { value: 'furniture', label: 'Furniture' },
  { value: 'appliance', label: 'Appliance' },
  { value: 'fixture', label: 'Fixture' },
  { value: 'fitting', label: 'Fitting' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'decoration', label: 'Decoration' },
  { value: 'other', label: 'Other' }
];

export default function PropertyInspectionManager({ propertyId, unitId, tenantId }) {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingInspection, setEditingInspection] = useState(null);

  const queryClient = useQueryClient();

  // Fetch inspections
  const { data: inspections, isLoading } = useQuery({
    queryKey: ['propertyInspections', propertyId],
    queryFn: async () => {
      const all = await base44.entities.PropertyInspection.list();
      return propertyId ? all.filter(i => i.property_id === propertyId) : all;
    }
  });

  // Create inspection mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.PropertyInspection.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propertyInspections'] });
      setShowCreateDialog(false);
    }
  });

  // Update inspection mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.PropertyInspection.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propertyInspections'] });
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'tenant_signed':
        return 'bg-green-100 text-green-800';
      case 'pending_tenant_review':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateInspection = (formData) => {
    createMutation.mutate({
      ...formData,
      property_id: propertyId,
      unit_id: unitId,
      tenant_id: tenantId,
      status: 'scheduled',
      rooms: []
    });
  };

  const handleEditInspection = (updatedData) => {
    updateMutation.mutate({ id: editingInspection.id, data: updatedData });
    setShowEditDialog(false);
    setEditingInspection(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Property Inspections</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Inspection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Property Inspection</DialogTitle>
            </DialogHeader>
            <CreateInspectionForm
              propertyId={propertyId}
              unitId={unitId}
              tenantId={tenantId}
              onSubmit={handleCreateInspection}
              onCancel={() => setShowCreateDialog(false)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading inspections...</div>
      ) : inspections && inspections.length > 0 ? (
        <div className="grid gap-3">
          {inspections.map((inspection) => (
            <Card key={inspection.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{inspection.inspection_type.replace('_', ' ').toUpperCase()}</h4>
                      <Badge className={getStatusColor(inspection.status)}>
                        {inspection.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Inspector: {inspection.inspector_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Scheduled: {inspection.scheduled_date ? new Date(inspection.scheduled_date).toLocaleDateString() : 'Not set'}
                    </p>
                    {inspection.completed_date && (
                      <p className="text-sm text-muted-foreground">
                        Completed: {new Date(inspection.completed_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (inspection.status === 'scheduled' || inspection.status === 'in_progress') {
                          setEditingInspection(inspection);
                          setShowEditDialog(true);
                        } else {
                          setSelectedInspection(inspection);
                          setShowViewDialog(true);
                        }
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {inspection.status === 'scheduled' || inspection.status === 'in_progress' ? 'Edit' : 'View'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No inspections yet</p>
          <p className="text-sm">Create your first inspection report</p>
        </div>
      )}

      {selectedInspection && (
        <Dialog open={showViewDialog} onOpenChange={(open) => {
          setShowViewDialog(open);
          if (!open) setSelectedInspection(null);
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Inspection Report</DialogTitle>
            </DialogHeader>
            <ViewInspectionDialog
              inspection={selectedInspection}
              onUpdate={(data) => updateMutation.mutate({ id: selectedInspection.id, data })}
              onClose={() => {
                setShowViewDialog(false);
                setSelectedInspection(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {editingInspection && (
        <Dialog open={showEditDialog} onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setEditingInspection(null);
          }
        }}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Inspection Report</DialogTitle>
            </DialogHeader>
            <InspectionEditor
              inspection={editingInspection}
              onSave={handleEditInspection}
              onCancel={() => {
                setShowEditDialog(false);
                setEditingInspection(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CreateInspectionForm({ propertyId, unitId, tenantId, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    inspection_type: 'inventory',
    scheduled_date: '',
    inspector_name: '',
    inspector_email: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="inspection_type">Inspection Type</Label>
          <Select
            value={formData.inspection_type}
            onValueChange={(value) => setFormData({ ...formData, inspection_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inventory">Inventory</SelectItem>
              <SelectItem value="condition_report">Condition Report</SelectItem>
              <SelectItem value="mid_term">Mid-Term Inspection</SelectItem>
              <SelectItem value="check_out">Check-Out</SelectItem>
              <SelectItem value="routine">Routine Inspection</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="scheduled_date">Scheduled Date</Label>
          <Input
            id="scheduled_date"
            type="datetime-local"
            value={formData.scheduled_date}
            onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="inspector_name">Inspector Name</Label>
          <Input
            id="inspector_name"
            value={formData.inspector_name}
            onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="inspector_email">Inspector Email</Label>
          <Input
            id="inspector_email"
            type="email"
            value={formData.inspector_email}
            onChange={(e) => setFormData({ ...formData, inspector_email: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Inspection'}
        </Button>
      </div>
    </form>
  );
}

function ViewInspectionDialog({ inspection, onUpdate, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [tenantAgreed, setTenantAgreed] = useState(inspection.tenant_agreed || false);
  const [tenantComments, setTenantComments] = useState(inspection.tenant_comments || '');

  const handleTenantSignOff = () => {
    onUpdate({
      tenant_agreed: tenantAgreed,
      tenant_comments: tenantComments,
      tenant_signature_date: new Date().toISOString(),
      status: tenantAgreed ? 'tenant_signed' : 'disputed'
    });
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rooms">Rooms & Items</TabsTrigger>
          <TabsTrigger value="signoff">Tenant Sign-off</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Inspection Type</Label>
              <p className="font-medium">{inspection.inspection_type.replace('_', ' ').toUpperCase()}</p>
            </div>
            <div>
              <Label>Status</Label>
              <p className="font-medium">{inspection.status.replace('_', ' ').toUpperCase()}</p>
            </div>
            <div>
              <Label>Scheduled Date</Label>
              <p className="font-medium">
                {inspection.scheduled_date ? new Date(inspection.scheduled_date).toLocaleString() : 'Not set'}
              </p>
            </div>
            <div>
              <Label>Completed Date</Label>
              <p className="font-medium">
                {inspection.completed_date ? new Date(inspection.completed_date).toLocaleString() : 'Not completed'}
              </p>
            </div>
            <div>
              <Label>Inspector</Label>
              <p className="font-medium">{inspection.inspector_name}</p>
            </div>
            <div>
              <Label>Inspector Email</Label>
              <p className="font-medium">{inspection.inspector_email}</p>
            </div>
          </div>

          {inspection.overall_condition && (
            <div>
              <Label>Overall Condition</Label>
              <p className="font-medium">{inspection.overall_condition.toUpperCase()}</p>
            </div>
          )}

          {inspection.meter_readings && (
            <div>
              <Label>Meter Readings</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {inspection.meter_readings.electricity && (
                  <div className="bg-muted p-2 rounded">
                    <p className="text-xs text-muted-foreground">Electricity</p>
                    <p className="font-medium">{inspection.meter_readings.electricity}</p>
                  </div>
                )}
                {inspection.meter_readings.gas && (
                  <div className="bg-muted p-2 rounded">
                    <p className="text-xs text-muted-foreground">Gas</p>
                    <p className="font-medium">{inspection.meter_readings.gas}</p>
                  </div>
                )}
                {inspection.meter_readings.water && (
                  <div className="bg-muted p-2 rounded">
                    <p className="text-xs text-muted-foreground">Water</p>
                    <p className="font-medium">{inspection.meter_readings.water}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {inspection.keys_provided && inspection.keys_provided.length > 0 && (
            <div>
              <Label>Keys Provided</Label>
              <ul className="list-disc list-inside mt-1">
                {inspection.keys_provided.map((key, idx) => (
                  <li key={idx}>{key}</li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rooms">
          {inspection.rooms && inspection.rooms.length > 0 ? (
            <div className="space-y-6">
              {inspection.rooms.map((room, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{room.room_name}</CardTitle>
                    <CardDescription>
                      Condition: {room.condition_rating.toUpperCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {room.notes && (
                      <div>
                        <Label>Notes</Label>
                        <p className="text-sm">{room.notes}</p>
                      </div>
                    )}

                    {room.items && room.items.length > 0 && (
                      <div>
                        <Label className="mb-2 block">Items</Label>
                        <div className="space-y-3">
                          {room.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="border rounded p-3 bg-muted/50">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{item.item_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.item_category} • {item.condition.toUpperCase()}
                                  </p>
                                </div>
                                <Badge variant="outline">{item.cleanliness}</Badge>
                              </div>
                              {item.description && (
                                <p className="text-sm mt-2">{item.description}</p>
                              )}
                              {item.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Note: {item.notes}
                                </p>
                              )}
                              {item.photo_urls && item.photo_urls.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                  {item.photo_urls.map((url, photoIdx) => (
                                    <img
                                      key={photoIdx}
                                      src={url}
                                      alt={`${item.item_name} photo`}
                                      className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-75"
                                      onClick={() => window.open(url, '_blank')}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {room.photos && room.photos.length > 0 && (
                      <div>
                        <Label className="mb-2 block">Room Photos</Label>
                        <div className="flex gap-2 flex-wrap">
                          {room.photos.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`${room.room_name} photo ${idx + 1}`}
                              className="w-32 h-32 object-cover rounded cursor-pointer hover:opacity-75"
                              onClick={() => window.open(url, '_blank')}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No rooms added yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="signoff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Review & Sign-off</CardTitle>
              <CardDescription>
                Please review the inspection report and provide your agreement or disputes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {inspection.tenant_agreed ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Report Agreed & Signed</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Signed on: {inspection.tenant_signature_date ? new Date(inspection.tenant_signature_date).toLocaleString() : 'N/A'}
                  </p>
                  {inspection.tenant_comments && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-green-800">Comments:</p>
                      <p className="text-sm text-green-700">{inspection.tenant_comments}</p>
                    </div>
                  )}
                </div>
              ) : inspection.status === 'disputed' ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-800">Report Disputed</span>
                  </div>
                  {inspection.dispute_details && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-red-800">Dispute Details:</p>
                      <p className="text-sm text-red-700">{inspection.dispute_details}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Do you agree with this inspection report?</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="agreement"
                          checked={tenantAgreed}
                          onChange={() => setTenantAgreed(true)}
                          className="w-4 h-4"
                        />
                        <span>Yes, I agree</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="agreement"
                          checked={!tenantAgreed}
                          onChange={() => setTenantAgreed(false)}
                          className="w-4 h-4"
                        />
                        <span>No, I dispute this</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="comments">Your Comments</Label>
                    <Textarea
                      id="comments"
                      value={tenantComments}
                      onChange={(e) => setTenantComments(e.target.value)}
                      placeholder={tenantAgreed ? "Any additional comments (optional)" : "Please explain what you dispute..."}
                      rows={4}
                    />
                  </div>

                  <Button onClick={handleTenantSignOff} className="w-full">
                    <Signature className="w-4 h-4 mr-2" />
                    {tenantAgreed ? 'Agree & Sign' : 'Submit Dispute'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}