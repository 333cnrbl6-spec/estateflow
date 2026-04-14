import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle, ChevronRight, Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function RelationshipOnboardingWorkflow({ workflowId }) {
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        const wf = await base44.entities.Workflow.get(workflowId);
        setWorkflow(wf);

        // Fetch related tasks
        const relatedTasks = await base44.entities.Task.filter({
          linked_entity_id: workflowId
        }, '-created_date', 20);

        setTasks(relatedTasks);
      } catch (error) {
        toast.error('Failed to load workflow');
      } finally {
        setLoading(false);
      }
    };

    loadWorkflow();
  }, [workflowId]);

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Loader className="w-8 h-8 animate-spin mx-auto mb-3" />
        <p className="text-muted-foreground">Loading workflow...</p>
      </Card>
    );
  }

  if (!workflow) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <p className="text-red-700">Workflow not found</p>
      </Card>
    );
  }

  const currentStage = workflow.stages?.[workflow.current_stage];
  const progressPercent = ((workflow.current_stage + 1) / workflow.total_stages) * 100;

  const stageStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'pending':
        return 'text-slate-600';
      default:
        return 'text-slate-400';
    }
  };

  const stageStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 animate-pulse" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{workflow.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Relationship Type: <strong>{workflow.relationship_type.replace(/_/g, ' ')}</strong>
            </p>
          </div>
          <Badge className={workflow.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'}>
            {workflow.status.replace(/_/g, ' ').toUpperCase()}
          </Badge>
        </div>
      </Card>

      {/* Progress */}
      <Card className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold">Overall Progress</p>
            <p className="text-sm text-muted-foreground">{workflow.current_stage + 1} of {workflow.total_stages}</p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </Card>

      {/* Stages Timeline */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Onboarding Stages</h3>
        <div className="space-y-3">
          {workflow.stages?.map((stage, idx) => {
            const isCurrentStage = idx === workflow.current_stage;
            const isCompleted = idx < workflow.current_stage;
            const stageStatus = isCompleted ? 'completed' : isCurrentStage ? 'in_progress' : 'pending';

            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCurrentStage
                    ? 'border-primary bg-primary/5'
                    : isCompleted
                    ? 'border-green-200 bg-green-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${stageStatusColor(stageStatus)}`}>
                    {stageStatusIcon(stageStatus)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{stage.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        Stage {idx + 1}
                      </Badge>
                      {isCurrentStage && <Badge className="bg-blue-600 text-xs">Active</Badge>}
                      {isCompleted && <Badge className="bg-green-600 text-xs">Done</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>

                    {stage.documents_required && stage.documents_required.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {stage.documents_required.map((doc, docIdx) => (
                          <Badge key={docIdx} variant="outline" className="text-xs">
                            {doc.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {stage.duration_days && (
                      <p className="text-xs text-muted-foreground mt-2">
                        ⏱ Estimated {stage.duration_days} day(s)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Related Tasks */}
      {tasks.length > 0 && (
        <Card className="p-6">
          <h3 className="font-bold mb-4">Associated Tasks</h3>
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : task.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-700'
                  }
                >
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Due Date */}
      {workflow.due_date && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Due Date:</strong> {new Date(workflow.due_date).toLocaleDateString()}
          </p>
        </Card>
      )}
    </div>
  );
}