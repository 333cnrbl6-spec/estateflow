import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TaskStatusUpdater({ task, onStatusChange }) {
  const [loading, setLoading] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === 'completed' && !completionNotes) {
      toast.error('Please add completion notes');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.MaintenanceOrder.update(task.id, {
        status: newStatus,
        completion_notes: newStatus === 'completed' ? completionNotes : null,
        completed_date: newStatus === 'completed' ? new Date().toISOString() : null
      });

      toast.success(`Task marked as ${newStatus}`);
      setCompletionNotes('');
      onStatusChange?.();
    } catch (err) {
      toast.error('Status update failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStatuses = {
    assigned: ['in_progress'],
    in_progress: ['completed', 'pending_approval'],
    pending_approval: [],
    completed: []
  };

  const availableNextStatuses = nextStatuses[task.status] || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Task Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Current Status</p>
          <p className="font-semibold capitalize">{task.status}</p>
        </div>

        {task.status === 'completed' && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-green-800">This task is complete</p>
                {task.completed_date && (
                  <p className="text-xs text-green-700 mt-1">
                    Completed on {new Date(task.completed_date).toLocaleDateString('en-GB')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {availableNextStatuses.length > 0 && (
          <>
            {availableNextStatuses.includes('completed') && (
              <div>
                <Label>Completion Notes *</Label>
                <Textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Describe what work was completed..."
                  className="mt-2"
                  disabled={loading}
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              {availableNextStatuses.map(status => (
                <Button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={loading}
                  className="gap-2"
                  variant={status === 'completed' ? 'default' : 'outline'}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Mark as {status.replace('_', ' ').toUpperCase()}
                </Button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}