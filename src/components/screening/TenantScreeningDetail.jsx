import React from 'react';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function TenantScreeningDetail({ tenant }) {
  const screening = tenant.screening;

  if (!screening) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No screening data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-border">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Screening Summary</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Overall Score</p>
            <p className={`text-4xl font-bold mt-2 ${
              screening.overall_score >= 75 ? 'text-green-600' :
              screening.overall_score >= 50 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {screening.overall_score}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Recommendation</p>
            <div className="mt-2 flex items-center gap-2">
              {screening.recommendation === 'approve' && (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <span className="text-lg font-bold text-green-600">Approved</span>
                </>
              )}
              {screening.recommendation === 'review' && (
                <>
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  <span className="text-lg font-bold text-yellow-600">Review</span>
                </>
              )}
              {screening.recommendation === 'decline' && (
                <>
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <span className="text-lg font-bold text-red-600">Declined</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Credit Check */}
      {screening.credit_check && (
        <div className="border border-border rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-3">Credit Check</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Credit Score</span>
              <span className="font-semibold">{screening.credit_check.score}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rating</span>
              <span className="font-semibold capitalize">{screening.credit_check.credit_rating}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Defaults Found</span>
              <span className="font-semibold">{screening.credit_check.defaults_found ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Bankruptcy History</span>
              <span className="font-semibold">{screening.credit_check.bankruptcy_history ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">County Court Judgement</span>
              <span className="font-semibold">{screening.credit_check.ccj_found ? 'Yes' : 'No'}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Checked: {format(parseISO(screening.credit_check.checked_date), 'dd MMM yyyy HH:mm')}
            </p>
          </div>
        </div>
      )}

      {/* Reference Checks */}
      {screening.reference_checks && screening.reference_checks.length > 0 && (
        <div className="border border-border rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-3">Reference Checks ({screening.reference_checks.length})</h4>
          <div className="space-y-3">
            {screening.reference_checks.map((ref, idx) => (
              <div key={idx} className="bg-muted/30 p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-foreground capitalize">{ref.reference_type} Reference</p>
                  <span className="text-sm font-semibold">{ref.score}/100</span>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Status:</span> <span className="font-semibold capitalize">{ref.status}</span></p>
                  {ref.reliability && <p><span className="text-muted-foreground">Reliability:</span> <span className="font-semibold capitalize">{ref.reliability}</span></p>}
                  {ref.payment_history && <p><span className="text-muted-foreground">Payment History:</span> <span className="font-semibold capitalize">{ref.payment_history}</span></p>}
                  {ref.feedback && <p className="text-muted-foreground italic">"{ref.feedback}"</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {screening.screening_notes && (
        <div className="border border-border rounded-lg p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Notes</h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">{screening.screening_notes}</p>
        </div>
      )}
    </div>
  );
}