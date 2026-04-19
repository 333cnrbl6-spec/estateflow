import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, User, Plus, Edit, Trash2, Bell, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function InspectionScheduler({ propertyId }) {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    inspection_type: 'routine',
    scheduled_date: '',
    scheduled_time: '10:00',
    inspector_name: '',
    inspector_email: ''
  });

  const inspectionTypes = [
    { value: 'routine', label: 'Routine Inspection' },
    { value: 'inventory', label: 'Inventory Check' },
    { value: 'condition_report', label: 'Condition Report' },
    { value: 'mid_term', label: 'Mid-Term Inspection' },
    { value: 'check_out', label: 'Check-Out Inspection' }
  ];

  const handleOpenDialog = (inspection = null) => {
    if (inspection) {
      setEditingId(inspection.id);
      const dateStr = inspection.scheduled_date?.split('T')[0] || '';
      const timeStr = inspection.scheduled_date?.split('T')[1]?.slice(0, 5) || '10:00';
      setFormData({
        inspection_type: inspection.inspection_type,
        scheduled_date: dateStr,
        scheduled_time: timeStr,
        inspector_name: inspection.inspector_name,
        inspector_email: inspection.inspector_email
      });
    } else {
      setEditingId(null);
      setFormData({
        inspection_type: 'routine',
        scheduled_date: '',
        scheduled_time: '10:00',
        inspector_name: '',
        inspector_email: ''
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.scheduled_date || !formData.inspector_name || !formData.inspector_email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`).toISOString();

      if (editingId) {
        await base44.entities.PropertyInspection.update(editingId, {
          inspection_type: formData.inspection_type,
          scheduled_date: scheduledDateTime,
          inspector_name: formData.inspector_name,
          inspector_email: formData.inspector_email,
          status: 'scheduled'
        });
        toast.success('Inspection updated');
      } else {
        const response = await base44.functions.invoke('scheduleInspectionAndNotify', {
          propertyId,
          inspection_type: formData.inspection_type,
          scheduled_date: scheduledDateTime,
          inspector_name: formData.inspector_name,
          inspector_email: formData.inspector_email
        });

        if (!response.data.success) {
          throw new Error(response.data.error);
        }
        toast.success('Inspection scheduled and tenants notified');
      }

      setShowDialog(false);
      loadInspections();
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this inspection?')) return;

    setLoading(true);
    try {
      await base44.entities.PropertyInspection.delete(id);
      toast.success('Inspection deleted');
      loadInspections();
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadInspections = async () => {
    try {
      const data = await base44.entities.PropertyInspection.filter({
        property_id: propertyId
      });
      setInspections(data || []);
    } catch (err) {
      console.error('Error loading inspections:', err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      pending_tenant_review: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const upcomingInspections = inspections
    .filter(i => new Date(i.scheduled_date) > new Date())
    .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inspections</h2>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Inspection
        </Button>
      </div>

      {upcomingInspections.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No inspections scheduled</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {upcomingInspections.map(inspection => (
            <Card key={inspection.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg">
                        {inspectionTypes.find(t => t.value === inspection.inspection_type)?.label}
                      </h3>
                      <Badge className={getStatusColor(inspection.status)}>
                        {inspection.status?.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(inspection.scheduled_date).toLocaleDateString('en-GB')}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {new Date(inspection.scheduled_date).toLocaleTimeString('en-GB', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        {inspection.inspector_name}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        {inspection.inspector_email}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(inspection)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(inspection.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Inspection' : 'Schedule New Inspection'}
            </DialogTitle>
            <DialogDescription>
              {editingId ? 'Update inspection details' : 'Schedule an inspection and notify tenants'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Inspection Type *</Label>
              <Select 
                value={formData.inspection_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, inspection_type: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {inspectionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Time *</Label>
              <Input
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Inspector Name *</Label>
              <Input
                value={formData.inspector_name}
                onChange={(e) => setFormData(prev => ({ ...prev, inspector_name: e.target.value }))}
                placeholder="Full name"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Inspector Email *</Label>
              <Input
                type="email"
                value={formData.inspector_email}
                onChange={(e) => setFormData(prev => ({ ...prev, inspector_email: e.target.value }))}
                placeholder="inspector@example.com"
                className="mt-2"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-1 gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editingId ? 'Update' : 'Schedule'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}