import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

export default function PendingExecutionsPanel({ execution, onApprove, onReject, isExecuting }) {
  const [expanded, setExpanded] = useState(false);
  const daysUntil = differenceInDays(parseISO(execution.trigger_date), new Date());

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <CardTitle className="text-base">{execution.workflow_name}</CardTitle>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              {execution.property_address || 'N/A'} • {execution.tenant_name || 'Tenant'}
            </p>
          </div>
          <ChevronDown className={`w-4 h-4 text-amber-600 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3 border-t border-amber-200 pt-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Trigger Date:</span>
              <p className="font-medium">{execution.trigger_date}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Days Until:</span>
              <p className={`font-medium ${daysUntil <= 7 ? 'text-red-600' : 'text-amber-600'}`}>
                {daysUntil} days
              </p>
            </div>
          </div>

          {/* Actions Preview */}
          <div className="bg-white rounded-lg p-3 space-y-2">
            <p className="text-xs font-medium text-foreground">Actions to Execute:</p>
            {execution.actions_to_execute?.map((action, i) => (
              <div key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="mt-0.5">→</span>
                <span>
                  <span className="font-medium capitalize">{action.action_type.replace(/_/g, ' ')}</span>
                  {action.details?.maintenance_title && ` • ${action.details.maintenance_title}`}
                  {action.details?.email_subject && ` • ${action.details.email_subject}`}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={onApprove}
              disabled={isExecuting}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve & Execute
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1"
              onClick={onReject}
              disabled={isExecuting}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}