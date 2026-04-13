import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProgressPhotoUpload from './ProgressPhotoUpload';
import { ChevronLeft, Clock, MapPin, DollarSign, Image, CheckCircle2, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function TaskDetail({ task, onBack, onTaskUpdated }) {
  const queryClient = useQueryClient();
  const [statusChange, setStatusChange] = useState(task.status);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { data: property } = useQuery({
    queryKey: ['property', task.property_id],
    queryFn: async () => base44.entities.Property.get(task.property_id),
  });

  const { data: unit } = useQuery({
    queryKey: ['unit', task.unit_id],
    queryFn: async () => task.unit_id ? base44.entities.Unit.get(task.unit_id) : null,
    enabled: !!task.unit_id,
  });

  const handleStatusUpdate = async () => {
    if (statusChange === task.status) return;
    
    setUpdating(true);
    setError(null);
    try {
      await base44.entities.MaintenanceRequest.update(task.id, {
        status: statusChange,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      queryClient.invalidateQueries({ queryKey: ['contractorTasks'] });
      setTimeout(() => onTaskUpdated(), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotoUploaded = () => {
    queryClient.invalidateQueries({ queryKey: ['contractorTasks'] });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ChevronLeft className="w-4 h-4" />
        Back to Tasks
      </Button>

      {/* Task Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">{task.title}</h1>
                <Badge variant="outline">{task.category}</Badge>
              </div>
              <p className="text-muted-foreground">{task.description}</p>
            </div>
            <Badge variant={task.priority === 'emergency' ? 'destructive' : task.priority === 'urgent' ? 'default' : 'secondary'}>
              {task.priority?.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Status & Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Update */}
        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
            <CardDescription>Change the task status to track progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">Status updated successfully</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Current Status</label>
              <Select value={statusChange} onValueChange={setStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleStatusUpdate}
              disabled={statusChange === task.status || updating}
              className="w-full"
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </CardContent>
        </Card>

        {/* Task Details */}
        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {property && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{property.name}</p>
                  {unit && <p className="text-xs text-muted-foreground">{unit.name || `Unit ${unit.unit_number}`}</p>}
                </div>
              </div>
            )}

            {task.scheduled_date && (
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Scheduled Date</p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(task.scheduled_date).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}

            {task.estimated_cost && (
              <div className="flex items-start gap-3">
                <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Estimated Cost</p>
                  <p className="text-sm font-medium text-slate-900">£{task.estimated_cost.toFixed(2)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Photo Upload */}
      <ProgressPhotoUpload taskId={task.id} onPhotoUploaded={handlePhotoUploaded} />

      {/* Current Photos */}
      {task.photos && task.photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Progress Photos ({task.photos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {task.photos.map((photo, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={photo.url}
                      alt={photo.caption || `Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {photo.caption && (
                    <p className="text-xs text-muted-foreground">{photo.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}