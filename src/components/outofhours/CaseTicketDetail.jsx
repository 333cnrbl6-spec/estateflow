import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CommunicationThread from './CommunicationThread';
import { AlertCircle, Clock, User, MapPin, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-900',
  high: 'bg-orange-100 text-orange-900',
  medium: 'bg-yellow-100 text-yellow-900',
  low: 'bg-blue-100 text-blue-900',
};

const STATUS_COLORS = {
  logged: 'bg-gray-100 text-gray-900',
  escalated: 'bg-orange-100 text-orange-900',
  contractor_assigned: 'bg-blue-100 text-blue-900',
  in_progress: 'bg-purple-100 text-purple-900',
  resolved: 'bg-green-100 text-green-900',
};

export default function CaseTicketDetail({ call }) {
  if (!call) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">No call data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Case Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{call.caller_name}</h2>
              <p className="text-muted-foreground mb-4">{call.property_address}</p>
              <div className="flex flex-wrap gap-2">
                <Badge className={SEVERITY_COLORS[call.severity]}>
                  {call.severity} severity
                </Badge>
                <Badge className={STATUS_COLORS[call.status]}>
                  {call.status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Case ID</p>
              <p className="text-lg font-mono font-semibold">{call.id?.slice(0, 8)}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Case Details Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Caller Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{call.caller_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{call.caller_phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{call.caller_email || 'Not provided'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Type</p>
              <Badge variant="outline" className="capitalize">
                {call.caller_type}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Call Received</p>
                <p className="text-sm font-medium">
                  {new Date(call.call_date_time).toLocaleString('en-GB')}
                </p>
              </div>
            </div>
            {call.callback_scheduled_for && (
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Callback Scheduled</p>
                  <p className="text-sm font-medium">
                    {new Date(call.callback_scheduled_for).toLocaleString('en-GB')}
                  </p>
                </div>
              </div>
            )}
            {call.duration_minutes && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Duration</p>
                <p className="text-sm font-medium">{call.duration_minutes} minutes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Issue Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Issue Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Issue Type</p>
            <Badge variant="outline" className="capitalize">
              {call.call_type}
            </Badge>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Description</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{call.call_description}</p>
          </div>
          {call.notes && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground">{call.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action & Validation */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Action Taken</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Action</p>
              <Badge variant="outline" className="capitalize">
                {call.action_taken}
              </Badge>
            </div>
            {call.action_details && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Details</p>
                <p className="text-sm font-mono text-foreground">{call.action_details}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Validation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded-full', 
                call.validation_status === 'validated' ? 'bg-green-600' : 'bg-yellow-600'
              )} />
              <span className="text-sm font-medium capitalize">{call.validation_status}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded-full', 
                call.gdpr_consent_recorded ? 'bg-green-600' : 'bg-gray-300'
              )} />
              <span className="text-sm">GDPR Consent {call.gdpr_consent_recorded ? 'Recorded' : 'Not Recorded'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communication Tab */}
      <Tabs defaultValue="communications" className="w-full">
        <TabsList>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>
        <TabsContent value="communications">
          <CommunicationThread callId={call.id} />
        </TabsContent>
        <TabsContent value="activity">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Activity log coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}