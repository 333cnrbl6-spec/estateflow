import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, Camera, FileUp, LogOut } from 'lucide-react';
import TaskQueueItem from '@/components/contractor/TaskQueueItem';
import ProofOfWorkUpload from '@/components/contractor/ProofOfWorkUpload';
import TaskSignOff from '@/components/contractor/TaskSignOff';

export default function ContractorMobilePortal() {
  const [contractor, setContractor] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showSignOff, setShowSignOff] = useState(false);

  // Get contractor email from URL token or session
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email') || token;
    
    if (email) {
      setContractor({ email });
    }
  }, []);

  const { data: tasks = [] } = useQuery({
    queryKey: ['contractor-tasks', contractor?.email],
    queryFn: () => base44.entities.Task.filter({ assigned_to: contractor?.email }),
    enabled: !!contractor?.email
  });

  const activeTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const handleLogout = () => {
    setContractor(null);
    window.location.href = '/';
  };

  if (!contractor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm p-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Contractor Portal</h1>
          <p className="text-muted-foreground mb-4">Access your assigned tasks</p>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value) {
                setContractor({ email: e.target.value });
              }
            }}
          />
          <p className="text-xs text-muted-foreground">Or use the access link sent to your email</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="p-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Task Queue</h1>
            <p className="text-xs text-muted-foreground">{contractor.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{activeTasks.length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{tasks.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      {/* Task Content */}
      {selectedTask ? (
        // Task Detail View
        <div className="p-4 space-y-4 pb-24">
          <Button
            onClick={() => setSelectedTask(null)}
            variant="outline"
            className="w-full"
          >
            ← Back to List
          </Button>

          <Card className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{selectedTask.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedTask.description}</p>
              </div>
              <Badge
                className={
                  selectedTask.status === 'completed' ? 'bg-green-100 text-green-700' :
                  selectedTask.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }
              >
                {selectedTask.status}
              </Badge>
            </div>

            <div className="space-y-3 border-t border-slate-200 pt-4">
              <div>
                <p className="text-xs text-muted-foreground">Priority</p>
                <p className="font-medium text-foreground">{selectedTask.priority}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className="font-medium text-foreground">{new Date(selectedTask.deadline).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="font-medium text-foreground">{selectedTask.category}</p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            {selectedTask.status !== 'completed' && (
              <Button
                onClick={() => setShowUpload(true)}
                className="w-full gap-2"
              >
                <Camera className="w-4 h-4" />
                Upload Proof of Work
              </Button>
            )}

            {selectedTask.status === 'in_progress' && (
              <Button
                onClick={() => setShowSignOff(true)}
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4" />
                Complete & Sign Off
              </Button>
            )}
          </div>

          {/* Proof of Work Section */}
          {selectedTask.proof_of_work && selectedTask.proof_of_work.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3">Proof of Work</h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedTask.proof_of_work.map((file, idx) => (
                  <div key={idx} className="bg-slate-100 rounded-lg p-2 aspect-square flex items-center justify-center">
                    <FileUp className="w-6 h-6 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : (
        // Task List View
        <div className="p-4 space-y-4 pb-24">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active ({activeTasks.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-3 mt-4">
              {activeTasks.length === 0 ? (
                <Card className="p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-3 opacity-50" />
                  <p className="text-muted-foreground">No active tasks</p>
                </Card>
              ) : (
                activeTasks.map(task => (
                  <TaskQueueItem
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3 mt-4">
              {completedTasks.length === 0 ? (
                <Card className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground">No completed tasks</p>
                </Card>
              ) : (
                completedTasks.map(task => (
                  <TaskQueueItem
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Modals */}
      {showUpload && selectedTask && (
        <ProofOfWorkUpload
          task={selectedTask}
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false);
            window.location.reload();
          }}
        />
      )}

      {showSignOff && selectedTask && (
        <TaskSignOff
          task={selectedTask}
          onClose={() => setShowSignOff(false)}
          onSuccess={() => {
            setShowSignOff(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}