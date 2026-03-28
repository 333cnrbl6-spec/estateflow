import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, Clock, AlertCircle, CheckCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import CallValidationDialog from '@/components/outofhours/CallValidationDialog';
import CallHandlerModule from '@/components/outofhours/CallHandlerModule';
import CallHistoryPanel from '@/components/outofhours/CallHistoryPanel';

export default function OutOfHoursCallCenter() {
  const [activeCall, setActiveCall] = useState(null);
  const [showValidation, setShowValidation] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
  const [handlerName, setHandlerName] = useState('');
  const queryClient = useQueryClient();

  const { data: recentCalls = [] } = useQuery({
    queryKey: ['outOfHoursCalls'],
    queryFn: async () => {
      const calls = await base44.entities.OutOfHoursCall.list('-call_date_time');
      return calls.slice(0, 20);
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const saveCallMutation = useMutation({
    mutationFn: (callData) => base44.entities.OutOfHoursCall.create(callData),
    onSuccess: (newCall) => {
      queryClient.invalidateQueries({ queryKey: ['outOfHoursCalls'] });
      setActiveCall(newCall);
    }
  });

  const endCallMutation = useMutation({
    mutationFn: (callData) => base44.entities.OutOfHoursCall.update(callData.id, {
      action_taken: callData.action_taken,
      action_details: callData.action_details,
      duration_minutes: callData.duration_minutes,
      handler_name: handlerName,
      notes: callData.notes
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outOfHoursCalls'] });
      resetCall();
    }
  });

  const resetCall = () => {
    setActiveCall(null);
    setCallStartTime(null);
    setShowValidation(false);
  };

  const handleNewCall = () => {
    setCallStartTime(new Date());
    setShowValidation(true);
  };

  const handleValidationComplete = (validatedData) => {
    setActiveCall(validatedData);
    saveCallMutation.mutate(validatedData);
  };

  const getDuration = () => {
    if (!callStartTime) return 0;
    return Math.round((new Date() - callStartTime) / 60000);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <PageHeader 
          title="Out-of-Hours Support" 
          subtitle="Call center module for after-hours tenant & landlord support"
        />
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call Handler */}
        <div className="lg:col-span-2">
          {activeCall ? (
            <CallHandlerModule 
              call={activeCall}
              duration={getDuration()}
              handlerName={handlerName}
              onHandlerNameChange={setHandlerName}
              onEndCall={endCallMutation.mutate}
              isEnding={endCallMutation.isPending}
            />
          ) : (
            <Card className="h-full flex flex-col items-center justify-center py-16 border-2 border-dashed">
              <Phone className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready to Take a Call</h3>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-xs">
                Click below to start a new incoming call or retrieve a recent call record
              </p>
              <Button 
                size="lg" 
                onClick={handleNewCall}
                className="gap-2"
              >
                <Phone className="w-4 h-4" />
                New Incoming Call
              </Button>
            </Card>
          )}
        </div>

        {/* Recent Calls */}
        <div>
          <CallHistoryPanel 
            calls={recentCalls}
            onSelectCall={(call) => {
              setActiveCall(call);
              setCallStartTime(new Date());
            }}
            activeCallId={activeCall?.id}
          />
        </div>
      </div>

      {/* Validation Dialog */}
      <CallValidationDialog 
        open={showValidation}
        onOpenChange={setShowValidation}
        onValidationComplete={handleValidationComplete}
        onCancel={resetCall}
      />
    </div>
  );
}