import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, DollarSign, AlertCircle, Check, Clock, Loader2, Edit2, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function MaintenanceManagerDashboard({ propertyId }) {
  const [requests, setRequests] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    contractor_id: '',
    estimated_cost: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    try {
      const [reqs, contrs] = await Promise.all([
        base44.entities.MaintenanceRequest.filter({ property_id: propertyId }),
        base44.entities.Vendor.filter({ type: { $nin: ['cleaning', 'gardening'] } })
      ]);
      setRequests(reqs || []);
      setContractors(contrs || []);
    } catch (err) {
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async () => {
    if (!assignmentData.contractor_id || !assignmentData.estimated_cost) {
      toast.error('Please fill in contractor and estimated cost');
      return;
    }

    setLoading(true);
    try {
      const contractor = contractors.find(c => c.id === assignmentData.contractor_id);
      
      await base44.entities.MaintenanceRequest.update(selectedRequest.id, {
        status: 'assigned',
        assigned_contractor_id: assignmentData.contractor_id,
        estimated_cost: Math.round(parseFloat(assignmentData.estimated_cost) * 100),
        assignment_notes: assignmentData.notes,
        assigned_date: new Date().toISOString()
      });

      // Send notification to contractor
      if (contractor?.email) {
        await base44.integrations.Core.SendEmail({
          to: contractor.email,
          subject: `New Maintenance Task Assignment: ${selectedRequest.title}`,
          body: `
            <html>
              <body style="font-family: Arial, sans-serif;">
                <h2>New Task Assignment</h2>
                <p>You have been assigned a new maintenance task:</p>
                <p><strong>Title:</strong> ${selectedRequest.title}</p>
                <p><strong>Description:</strong> ${selectedRequest.description}</p>
                <p><strong>Estimated Cost:</strong> £${assignmentData.estimated_cost}</p>
                <p><strong>Notes:</strong> ${assignmentData.notes || 'None'}</p>
                <p>Please log in to your portal to accept and begin work.</p>
              </body>
            </html>
          `
        });
      }

      toast.success('Task assigned to contractor');
      setShowDetailDialog(false);
      setAssignmentData({ contractor_id: '', estimated_cost: '', notes: '' });
      loadData();
    } catch (err) {
      toast.error('Error assigning task: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await base44.entities.MaintenanceRequest.update(requestId, {
        status: newStatus,
        [newStatus === 'completed' ? 'completion_date' : 'status_updated_date']: new Date().toISOString()
      });
      toast.success('Status updated');
      loadData();
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      assigned: <AlertCircle className="w-4 h-4" />,
      in_progress: <Loader2 className="w-4 h-4 animate-spin" />,
      completed: <Check className="w-4 h-4" />
    };
    return icons[status] || null;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      emergency: 'bg-red-100 text-red-800'
    };
    return colors[urgency] || 'bg-gray-100';
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const assignedRequests = requests.filter(r => r.status === 'assigned');
  const inProgressRequests = requests.filter(r => r.status === 'in_progress');
  const completedRequests = requests.filter(r => r.status === 'completed');

  if (loading && requests.length === 0) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="assigned">
            Assigned
            {assignedRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2">{assignedRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress
            {inProgressRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2">{inProgressRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            {completedRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2">{completedRequests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {['pending', 'assigned', 'in_progress', 'completed'].map(status => {
          const statusRequests = requests.filter(r => r.status === status);
          return (
            <TabsContent key={status} value={status} className="space-y-3 mt-4">
              {statusRequests.length === 0 ? (
                <Card className="text-center py-12">
                  <p className="text-muted-foreground">No requests in this status</p>
                </Card>
              ) : (
                statusRequests.map(request => (
                  <Card key={request.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{request.title}</h3>
                            <Badge className={getUrgencyColor(request.urgency)}>
                              {request.urgency}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">{request.description}</p>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Category</p>
                              <p className="font-medium">{request.category}</p>
                            </div>
                            {request.estimated_cost && (
                              <div>
                                <p className="text-muted-foreground flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" /> Estimated Cost
                                </p>
                                <p className="font-medium">£{(request.estimated_cost / 100).toFixed(2)}</p>
                              </div>
                            )}
                            {request.assigned_contractor_id && (
                              <div>
                                <p className="text-muted-foreground">Assigned Contractor</p>
                                <p className="font-medium">
                                  {contractors.find(c => c.id === request.assigned_contractor_id)?.name || 'Unknown'}
                                </p>
                              </div>
                            )}
                          </div>

                          {request.photo_urls?.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">{request.photo_urls.length} photo(s)</p>
                              <div className="flex gap-2">
                                {request.photo_urls.slice(0, 3).map((url, idx) => (
                                  <img key={idx} src={url} alt="Issue" className="w-16 h-16 object-cover rounded" />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetailDialog(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {status !== 'completed' && (
                            <Select value={status} onValueChange={(newStatus) => handleUpdateStatus(request.id, newStatus)}>
                              <SelectTrigger className="w-32 h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.title}</DialogTitle>
            <DialogDescription>Manage this maintenance request</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {selectedRequest.status === 'pending' ? (
                <>
                  <div>
                    <Label>Assign to Contractor *</Label>
                    <Select value={assignmentData.contractor_id} onValueChange={(value) => setAssignmentData(prev => ({ ...prev, contractor_id: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select contractor" />
                      </SelectTrigger>
                      <SelectContent>
                        {contractors.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Estimated Cost (£) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={assignmentData.estimated_cost}
                      onChange={(e) => setAssignmentData(prev => ({ ...prev, estimated_cost: e.target.value }))}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Add notes for the contractor..."
                      value={assignmentData.notes}
                      onChange={(e) => setAssignmentData(prev => ({ ...prev, notes: e.target.value }))}
                      className="mt-2"
                    />
                  </div>

                  <Button onClick={handleAssignTask} disabled={loading} className="w-full">
                    Assign Task
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <p><strong>Status:</strong> <Badge className={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Badge></p>
                  {selectedRequest.assigned_contractor_id && (
                    <p><strong>Contractor:</strong> {contractors.find(c => c.id === selectedRequest.assigned_contractor_id)?.name}</p>
                  )}
                  {selectedRequest.estimated_cost && (
                    <p><strong>Estimated Cost:</strong> £{(selectedRequest.estimated_cost / 100).toFixed(2)}</p>
                  )}
                  {selectedRequest.assignment_notes && (
                    <p><strong>Notes:</strong> {selectedRequest.assignment_notes}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}