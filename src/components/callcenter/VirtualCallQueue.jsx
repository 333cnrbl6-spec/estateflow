import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Pause, Play } from 'lucide-react';

export default function VirtualCallQueue() {
  const queryClient = useQueryClient();
  const [agentStatus, setAgentStatus] = useState('available'); // available, on-call, paused, offline
  const [currentCall, setCurrentCall] = useState(null);

  const { data: queuedCalls = [] } = useQuery({
    queryKey: ['callQueue'],
    queryFn: async () => {
      const calls = await base44.entities.OutOfHoursCall.filter(
        { validation_status: 'pending' },
        '-call_date_time',
        100
      );
      return calls;
    },
    refetchInterval: 5000,
  });

  const acceptCallMutation = useMutation({
    mutationFn: async (callId) => {
      setCurrentCall(callId);
      setAgentStatus('on-call');
      return base44.entities.OutOfHoursCall.update(callId, {
        handler_name: 'Current Agent',
        validation_status: 'validated',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callQueue'] });
    },
  });

  const endCallMutation = useMutation({
    mutationFn: async (callId) => {
      setCurrentCall(null);
      setAgentStatus('available');
      return base44.entities.OutOfHoursCall.update(callId, {
        action_taken: 'logged_and_email_sent',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callQueue'] });
    },
  });

  const togglePauseMutation = useMutation({
    mutationFn: async () => {
      const newStatus = agentStatus === 'paused' ? 'available' : 'paused';
      setAgentStatus(newStatus);
      return newStatus;
    },
  });

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    'on-call': 'bg-blue-100 text-blue-800',
    paused: 'bg-yellow-100 text-yellow-800',
    offline: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      {/* Agent Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Agent Status</span>
            <Badge className={statusColors[agentStatus]}>
              {agentStatus.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant={agentStatus === 'paused' ? 'default' : 'outline'}
              onClick={() => togglePauseMutation.mutate()}
              className="flex items-center gap-2"
            >
              {agentStatus === 'paused' ? (
                <>
                  <Play className="w-4 h-4" /> Resume
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" /> Pause
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Call */}
      {currentCall && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Active Call</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {queuedCalls
                .filter((c) => c.id === currentCall)
                .map((call) => (
                  <div key={call.id} className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Caller</p>
                      <p className="font-semibold">{call.caller_name}</p>
                      <p className="text-sm text-muted-foreground">{call.caller_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Issue Type</p>
                      <Badge variant="outline">{call.call_type}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm">{call.call_description}</p>
                    </div>
                    <div className="pt-4">
                      <Button
                        variant="destructive"
                        onClick={() => endCallMutation.mutate(call.id)}
                        className="flex items-center gap-2 w-full justify-center"
                      >
                        <PhoneOff className="w-4 h-4" /> End Call
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Call Queue ({queuedCalls.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {queuedCalls.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No calls waiting
            </p>
          ) : (
            <div className="space-y-2">
              {queuedCalls.slice(0, 10).map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 hover:bg-slate-100"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{call.caller_name}</p>
                    <p className="text-xs text-muted-foreground">{call.caller_phone}</p>
                    <Badge variant="outline" className="mt-1">
                      {call.call_type}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => acceptCallMutation.mutate(call.id)}
                    disabled={agentStatus === 'paused' || agentStatus === 'on-call'}
                    className="flex items-center gap-2"
                  >
                    <Phone className="w-3 h-3" /> Accept
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}