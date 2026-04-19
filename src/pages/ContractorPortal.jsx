import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import ContractorTaskList from '@/components/contractor/ContractorTaskList';
import InvoiceUploadForm from '@/components/contractor/InvoiceUploadForm';
import TaskStatusUpdater from '@/components/contractor/TaskStatusUpdater';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

export default function ContractorPortal() {
  const [contractor, setContractor] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadContractorData();
  }, []);

  const loadContractorData = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) {
        toast.error('Please log in to access contractor portal');
        await base44.auth.redirectToLogin('/contractor');
        return;
      }

      // Get contractor contact info
      const contractors = await base44.entities.Contact.filter({
        email: user.email,
        contact_type: 'contractor'
      });

      if (contractors?.length > 0) {
        setContractor({ ...contractors[0], email: user.email });
      } else {
        setContractor({ email: user.email, full_name: user.full_name });
      }
    } catch (err) {
      console.error('Error loading contractor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-muted-foreground">Loading contractor portal...</p>
        </div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Unable to load contractor account</p>
            <Button onClick={handleLogout}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Contractor Portal</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <User className="w-4 h-4" />
              <span>{contractor.full_name || contractor.email}</span>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task List - Left Column */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Assigned Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <ContractorTaskList
                  contractorId={contractor.id}
                  onTaskSelect={setSelectedTask}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Task Details */}
          <div className="space-y-6">
            {selectedTask ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Task Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Title</p>
                      <p className="font-semibold">{selectedTask.title || selectedTask.issue_type}</p>
                    </div>
                    {selectedTask.description && (
                      <div>
                        <p className="text-xs text-muted-foreground">Description</p>
                        <p className="text-sm">{selectedTask.description}</p>
                      </div>
                    )}
                    {selectedTask.scheduled_date && (
                      <div>
                        <p className="text-xs text-muted-foreground">Scheduled Date</p>
                        <p className="text-sm font-medium">{new Date(selectedTask.scheduled_date).toLocaleDateString('en-GB')}</p>
                      </div>
                    )}
                    {selectedTask.estimated_cost && (
                      <div>
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="text-sm font-medium">£{(selectedTask.estimated_cost / 100).toFixed(2)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <TaskStatusUpdater
                  task={selectedTask}
                  onStatusChange={() => setRefreshTrigger(prev => prev + 1)}
                />

                <InvoiceUploadForm
                  taskId={selectedTask.id}
                  onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                />
              </>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground">Select a task to view details and upload invoices</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}