import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Users, MapPin, CheckCircle, X, Phone, Mail, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import ViewingScheduler from '@/components/sales/ViewingScheduler';
import { toast } from 'sonner';

const statusColors = {
  requested: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-800',
  rescheduled: 'bg-purple-100 text-purple-800',
};

export default function ViewingsPage() {
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedViewing, setSelectedViewing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: viewings = [], isLoading } = useQuery({
    queryKey: ['viewings'],
    queryFn: () => base44.entities.ViewingAppointment.list('-scheduled_date'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await base44.entities.ViewingAppointment.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
      toast.success('Status updated');
    },
  });

  const filteredViewings = statusFilter === 'all' 
    ? viewings 
    : viewings.filter(v => v.status === statusFilter);

  const stats = {
    total: viewings.length,
    requested: viewings.filter(v => v.status === 'requested').length,
    confirmed: viewings.filter(v => v.status === 'confirmed').length,
    completed: viewings.filter(v => v.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Viewings & Appointments</h1>
            <p className="text-muted-foreground">Manage property viewings and client appointments</p>
          </div>
          <Button onClick={() => setShowScheduler(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Viewing
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Viewings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-600">{stats.requested}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
              <div className="text-sm text-muted-foreground">Confirmed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
        </div>

        {showScheduler && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <ViewingScheduler onClose={() => setShowScheduler(false)} />
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter:</span>
          <div className="flex gap-2">
            {['all', 'requested', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Viewings List */}
        <div className="grid gap-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading viewings...</div>
          ) : filteredViewings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No viewings found</p>
            </div>
          ) : (
            filteredViewings.map((viewing) => (
              <Card key={viewing.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={statusColors[viewing.status]}>
                          {viewing.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(viewing.scheduled_date), 'EEEE, dd MMMM yyyy')}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(viewing.scheduled_date), 'HH:mm')} ({viewing.duration_minutes} min)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        <div>
                          <div className="text-xs text-muted-foreground">Contact</div>
                          <div className="text-sm font-medium">{viewing.contact_name}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Type</div>
                          <div className="text-sm">{viewing.appointment_type.replace(/_/g, ' ')}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Agent</div>
                          <div className="text-sm">{viewing.agent_name}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Location</div>
                          <div className="text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {viewing.location_type.replace('_', ' ')}
                          </div>
                        </div>
                      </div>

                      {viewing.meeting_instructions && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <div className="text-xs font-medium mb-1">Meeting Instructions:</div>
                          <div className="text-sm text-muted-foreground">{viewing.meeting_instructions}</div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {viewing.status === 'requested' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateStatusMutation.mutate({ id: viewing.id, status: 'confirmed' })}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ id: viewing.id, status: 'cancelled' })}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {viewing.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: viewing.id, status: 'completed' })}
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(`${viewing.contact_email}, ${viewing.contact_phone}`);
                          toast.success('Contact details copied');
                        }}
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}