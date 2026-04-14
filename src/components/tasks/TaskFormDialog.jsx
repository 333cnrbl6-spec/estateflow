import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function TaskFormDialog({ open, onOpenChange, task, onSubmit, loading }) {
  const [formData, setFormData] = useState(task || {
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    deadline: '',
    category: 'maintenance',
    linked_entity_type: 'none',
    status: 'pending',
    estimated_hours: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{task?.id ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Task title"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Task details"
              className="h-20"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Assign To *</label>
            <Input
              value={formData.assigned_to}
              onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
              placeholder="contractor@example.com"
              type="email"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Deadline *</label>
            <Input
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              type="date"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Link to Entity (optional)</label>
            <Select value={formData.linked_entity_type} onValueChange={(value) => setFormData({...formData, linked_entity_type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="maintenance_request">Maintenance Request</SelectItem>
                <SelectItem value="financial_transaction">Financial Record</SelectItem>
                <SelectItem value="inspection_record">Inspection Record</SelectItem>
                <SelectItem value="property">Property</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}