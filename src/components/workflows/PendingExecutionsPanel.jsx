import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

export default function PendingExecutionsPanel({ execution, onApprove, onReject, isExecuting }) {
  const [expanded, setExpanded] = useState(false);
  const daysUntil = differenceInDays(parseISO(execution.trigger_date), new Date());

  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 cursor-pointer hover:bg-white/30 transition-colors rounded-t-lg" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 text-orange-700" />
              </div>
              <CardTitle className="text-base font-bold text-foreground">{execution.workflow_name}</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {execution.property_address || 'N/A'} • {execution.tenant_name || 'Tenant'}
            </p>
          </div>
          <ChevronDown className={`w-5 h-5 text-orange-700 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3 border-t border-orange-200 pt-4 bg-white/50">
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
          <div className="bg-white rounded-lg p-3 space-y-2 border border-border/50">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Actions to Execute:</p>
            {execution.actions_to_execute?.map((action, i) => (
              <div key={i} className="text-xs text-muted-foreground flex items-start gap-2 py-1">
                <span className="mt-0.5 text-primary font-bold">•</span>
                <span>
                  <span className="font-semibold text-foreground capitalize">{action.action_type.replace(/_/g, ' ')}</span>
                  {action.details?.maintenance_title && <span className="text-muted-foreground"> — {action.details.maintenance_title}</span>}
                  {action.details?.email_subject && <span className="text-muted-foreground"> — {action.details.email_subject}</span>}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-orange-200">
            <Button 
              size="sm" 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-semibold"
              onClick={onApprove}
              disabled={isExecuting}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve & Execute
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 font-semibold"
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