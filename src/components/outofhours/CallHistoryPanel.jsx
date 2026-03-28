import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Clock, AlertCircle } from 'lucide-react';

export default function CallHistoryPanel({ calls = [], onSelectCall, activeCallId }) {
  const getCallIcon = (callType) => {
    const icons = {
      emergency: '🚨',
      heating_failure: '❄️',
      water_leak: '💧',
      security_breach: '🔐',
      maintenance: '🔧',
      contractor_dispatch: '👷',
      general_enquiry: '❓',
      complaint: '⚠️'
    };
    return icons[callType] || '📞';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-900',
      high: 'bg-orange-100 text-orange-900',
      medium: 'bg-yellow-100 text-yellow-900',
      low: 'bg-green-100 text-green-900'
    };
    return colors[severity] || 'bg-gray-100 text-gray-900';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Calls</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-2 pr-2">
        {calls.length > 0 ? (
          calls.map((call) => (
            <div
              key={call.id}
              onClick={() => onSelectCall(call)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                activeCallId === call.id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-muted/30 border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="text-lg">{getCallIcon(call.call_type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{call.caller_name}</p>
                  <p className="text-xs text-muted-foreground">{call.caller_type}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs line-clamp-2 text-muted-foreground">
                  {call.call_description}
                </p>
                
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {format(new Date(call.call_date_time), 'HH:mm')}
                  </div>
                  {call.severity && (
                    <Badge className={`text-xs ${getSeverityColor(call.severity)}`}>
                      {call.severity}
                    </Badge>
                  )}
                </div>

                {call.action_taken && (
                  <div className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-sm mt-2">
                    ✓ {call.action_taken.replace(/_/g, ' ').toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center py-8">No recent calls</p>
        )}
      </CardContent>
    </Card>
  );
}