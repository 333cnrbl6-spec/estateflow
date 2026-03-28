import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Phone, Clock, AlertCircle, CheckCircle2, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CallHandlerModule({ call, duration, handlerName, onHandlerNameChange, onEndCall, isEnding }) {
  const [actionType, setActionType] = useState('log_and_email');
  const [notes, setNotes] = useState('');
  const [severity, setSeverity] = useState('medium');

  const { data: property } = useQuery({
    queryKey: ['property', call.matched_property_id],
    queryFn: () => base44.entities.Property.get(call.matched_property_id),
    enabled: !!call.matched_property_id
  });

  const { data: service } = useQuery({
    queryKey: ['service', call.matched_company_id],
    queryFn: async () => {
      if (!call.matched_company_id) return null;
      const services = await base44.entities.OutOfHoursService.list();
      return services.find(s => s.company_id === call.matched_company_id);
    },
    enabled: !!call.matched_company_id
  });

  const handleEndCall = () => {
    onEndCall({
      id: call.id,
      action_taken: actionType,
      action_details: notes,
      duration_minutes: duration,
      notes
    });
  };

  const availableActions = service?.call_handling_options || ['log_and_email'];

  const actionLabels = {
    log_and_email: '📧 Log & Send Email Confirmation',
    maintenance_order_creation: '🔧 Create Maintenance Order',
    contractor_dispatch: '👷 Dispatch Contractor',
    emergency_response: '🚨 Emergency Response',
    callback_scheduling: '📞 Schedule Callback'
  };

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-card to-secondary/5">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <CardTitle className="text-lg">Call in Progress</CardTitle>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Clock className="w-4 h-4" />
            {duration} min
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Caller:</span>
            <span className="font-medium">{call.caller_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-medium">{call.caller_type.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Issue:</span>
            <span className="font-medium">{call.call_type?.replace(/_/g, ' ').toUpperCase()}</span>
          </div>
          {property && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Property:</span>
              <span className="font-medium">{property.name}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
        <Tabs defaultValue="handler" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="handler">Call Handler</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="handler" className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-medium">Handler Name</Label>
              <Input
                placeholder="Your name"
                value={handlerName}
                onChange={(e) => onHandlerNameChange(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Severity Level</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">🚨 Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Call Summary & Notes</Label>
              <Textarea
                placeholder="Document the call: issue details, symptoms, temporary fixes, next steps..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 h-32 resize-none"
              />
            </div>

            {call.call_description && (
              <div className="bg-muted/50 rounded-lg p-3 border-l-2 border-primary">
                <p className="text-xs font-medium text-muted-foreground mb-1">Caller's Description:</p>
                <p className="text-sm">{call.call_description}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Action to Take</Label>
              <div className="space-y-2">
                {availableActions.map((action) => (
                  <label key={action} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer">
                    <input
                      type="radio"
                      checked={actionType === action}
                      onChange={() => setActionType(action)}
                      className="w-4 h-4 rounded-full border-border"
                    />
                    <span className="text-sm">{actionLabels[action]}</span>
                  </label>
                ))}
              </div>
            </div>

            {actionType === 'contractor_dispatch' && service?.emergency_contractors && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium mb-2">Available Contractors:</p>
                <div className="space-y-1 text-xs">
                  {service.emergency_contractors.map((c) => (
                    <div key={c.contractor_id} className="flex justify-between">
                      <span>{c.contractor_name}</span>
                      <span className="text-muted-foreground">{c.specialties.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {actionType === 'callback_scheduling' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm">Callback will be scheduled within 1 hour during next business day</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <div className="border-t border-border p-4 flex gap-3">
        <Button
          onClick={handleEndCall}
          disabled={isEnding || !handlerName}
          className="flex-1 bg-red-600 hover:bg-red-700 gap-2"
        >
          {isEnding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Ending...
            </>
          ) : (
            <>
              <Phone className="w-4 h-4" />
              End Call
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}