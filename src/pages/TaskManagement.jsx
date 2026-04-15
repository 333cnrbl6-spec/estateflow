import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import TaskCard from '@/components/tasks/TaskCard';
import TaskFormDialog from '@/components/tasks/TaskFormDialog';
import PaginationControls from '@/components/shared/PaginationControls';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { auditLogger } from '@/lib/auditLogger';

export default function TaskManagement() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list()
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.entities.Task.create(data);
      await auditLogger.logMutation('Task', 'create', result.id, data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setOpenDialog(false);
      setEditingTask(null);
      handleSuccess('Task created successfully');
    },
    onError: (error) => handleError(error, 'Failed to create task'),
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const result = await base44.entities.Task.update(id, data);
      await auditLogger.logMutation('Task', 'update', id, data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setOpenDialog(false);
      setEditingTask(null);
      handleSuccess('Task updated successfully');
    },
    onError: (error) => handleError(error, 'Failed to update task'),
  });

  const handleSaveTask = (formData) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data: formData });
    } else {
      createTaskMutation.mutate({
        ...formData,
        assigned_by: 'current_user'
      });
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    const updates = {
      status: newStatus,
      ...(newStatus === 'completed' && { completion_date: new Date().toISOString() })
    };
    updateTaskMutation.mutate({ id: taskId, data: updates });
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    const searchMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && priorityMatch && searchMatch;
  });

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedTasks = filteredTasks.slice(startIdx, endIdx);

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Task Management</h1>
              <p className="text-muted-foreground mt-2">Assign and track contractor tasks with deadline management</p>
            </div>
            <Button
              onClick={() => {
                setEditingTask(null);
                setOpenDialog(true);
              }}
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              New Task
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-foreground mt-1">{pendingCount}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-3xl font-bold text-foreground mt-1">{inProgressCount}</p>
            </div>
            <Loader2 className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold text-foreground mt-1">{completedCount}</p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Filters and List */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Tasks ({filteredTasks.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({filteredTasks.filter(t => t.status === 'pending').length})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({filteredTasks.filter(t => t.status === 'in_progress').length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({filteredTasks.filter(t => t.status === 'completed').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No tasks found</div>
              ) : (
                <div className="space-y-3">
                  <div className="grid gap-3">
                    {paginatedTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={(t) => {
                          setEditingTask(t);
                          setOpenDialog(true);
                        }}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                  {filteredTasks.length > pageSize && (
                    <PaginationControls
                      currentPage={currentPage}
                      pageSize={pageSize}
                      hasNextPage={endIdx < filteredTasks.length}
                      hasPreviousPage={currentPage > 1}
                      totalItems={filteredTasks.length}
                      onNextPage={() => setCurrentPage(c => c + 1)}
                      onPreviousPage={() => setCurrentPage(c => Math.max(1, c - 1))}
                      onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                      pageSizeOptions={[10, 25, 50]}
                    />
                  )}
                </div>
              )}
            </TabsContent>

            {['pending', 'in_progress', 'completed'].map(status => (
              <TabsContent key={status} value={status} className="space-y-3">
                {filteredTasks.filter(t => t.status === status).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No {status} tasks</div>
                ) : (
                  <div className="grid gap-3">
                    {filteredTasks.filter(t => t.status === status).map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={(t) => {
                          setEditingTask(t);
                          setOpenDialog(true);
                        }}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </div>

      {/* Dialog */}
      <TaskFormDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        task={editingTask}
        onSubmit={handleSaveTask}
        loading={createTaskMutation.isPending || updateTaskMutation.isPending}
      />
    </div>
  );
}