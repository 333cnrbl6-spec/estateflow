import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { MapPin, Calendar, DollarSign, AlertCircle } from 'lucide-react';

const STATUS_COLORS = {
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  pending_approval: 'bg-purple-100 text-purple-800'
};

export default function ContractorTaskList({ contractorId, onTaskSelect }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [contractorId]);

  const loadTasks = async () => {
    try {
      // Fetch all maintenance orders assigned to this contractor
      const allOrders = await base44.entities.MaintenanceOrder.list();
      const assignedTasks = allOrders?.filter(order => 
        order.assigned_contractor_id === contractorId || 
        order.assigned_to === contractorId
      ) || [];
      
      setTasks(assignedTasks);
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No tasks assigned yet</p>
        </CardContent>
      </Card>
    );
  }

  const tasksByStatus = {
    assigned: tasks.filter(t => t.status === 'assigned'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
    pending_approval: tasks.filter(t => t.status === 'pending_approval')
  };

  return (
    <div className="space-y-4">
      {['assigned', 'in_progress', 'pending_approval', 'completed'].map(status => (
        tasksByStatus[status].length > 0 && (
          <div key={status}>
            <h3 className="font-semibold mb-3 text-sm capitalize flex items-center gap-2">
              <Badge className={STATUS_COLORS[status]}>{status}</Badge>
              ({tasksByStatus[status].length})
            </h3>
            <div className="space-y-3">
              {tasksByStatus[status].map(task => (
                <Card key={task.id} className="cursor-pointer hover:border-primary transition" onClick={() => onTaskSelect(task)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">{task.title || task.issue_type}</h4>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {task.property_id && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>Property: {task.property_id}</span>
                            </div>
                          )}
                          {task.scheduled_date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(task.scheduled_date).toLocaleDateString('en-GB')}</span>
                            </div>
                          )}
                          {task.estimated_cost && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              <span>Budget: £{(task.estimated_cost / 100).toFixed(2)}</span>
                            </div>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-sm mt-3 text-foreground">{task.description}</p>
                        )}
                      </div>

                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}