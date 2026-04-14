import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertCircle, MessageCircle, Camera } from 'lucide-react';

export default function MaintenanceProgressTracker({ request }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const msgs = await base44.entities.Message?.filter?.({
          entity_type: 'maintenance_request',
          entity_id: request.id
        }) || [];
        setMessages(msgs);
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };
    loadMessages();

    // Subscribe to real-time updates
    const unsubscribe = base44.entities.Message?.subscribe?.((event) => {
      if (event.data?.entity_id === request.id) {
        loadMessages();
      }
    });

    return () => unsubscribe?.();
  }, [request.id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'cancelled': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Issue Details */}
      <Card className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{request.issue_title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
          </div>
          <div className="ml-2">
            {getStatusIcon(request.status)}
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Status</span>
            <Badge className={getStatusColor(request.status)}>
              {request.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Urgency</span>
            <Badge variant="outline" className="text-xs">
              {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Reported</span>
            <span className="text-xs text-foreground">
              {new Date(request.created_date).toLocaleDateString()}
            </span>
          </div>
          {request.estimated_completion_date && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Est. Completion</span>
              <span className="text-xs text-foreground">
                {new Date(request.estimated_completion_date).toLocaleDateString()}
              </span>
            </div>
          )}
          {request.completion_date && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Completed</span>
              <span className="text-xs text-green-600">
                {new Date(request.completion_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Photos */}
      {request.photos && request.photos.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Reported Photos
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {request.photos.map((photo, idx) => (
              <img
                key={idx}
                src={photo}
                alt="Issue"
                className="w-full aspect-square object-cover rounded-lg"
              />
            ))}
          </div>
        </Card>
      )}

      {/* Progress Timeline */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Progress Updates
        </h3>

        <div className="space-y-4">
          {/* Pending */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-0.5 h-12 bg-slate-200 mt-1" />
            </div>
            <div className="flex-1 pb-4">
              <p className="text-sm font-medium text-foreground">Request Submitted</p>
              <p className="text-xs text-muted-foreground">
                {new Date(request.created_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* In Progress */}
          {(request.status === 'in_progress' || request.status === 'completed') && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${request.status === 'in_progress' ? 'bg-blue-500' : 'bg-green-500'}`} />
                {request.status !== 'completed' && <div className="w-0.5 h-12 bg-slate-200 mt-1" />}
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm font-medium text-foreground">Contractor Assigned</p>
                <p className="text-xs text-muted-foreground">
                  {request.assigned_to ? `Assigned to ${request.assigned_to}` : 'Waiting for assignment'}
                </p>
              </div>
            </div>
          )}

          {/* Completed */}
          {request.status === 'completed' && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Work Completed</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(request.completion_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Messages/Comments */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Updates ({messages.length})
        </h3>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-xs text-muted-foreground">No updates yet</p>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className="p-2 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-foreground">{msg.sender_name}</p>
                <p className="text-sm text-muted-foreground mt-1">{msg.message_text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(msg.created_date).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}