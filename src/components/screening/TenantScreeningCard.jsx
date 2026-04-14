import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Clock, Shield, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function TenantScreeningCard({ tenant, onSelect, onScreen, isScreening }) {
  const screening = tenant.screening;
  const isScreened = screening?.overall_score !== undefined;

  const getRecommendationColor = (rec) => {
    switch(rec) {
      case 'approve': return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      case 'review': return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
      case 'decline': return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      default: return 'bg-card border-border';
    }
  };

  const getRecommendationIcon = (rec) => {
    switch(rec) {
      case 'approve': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'review': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'decline': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getRecommendationText = (rec) => {
    switch(rec) {
      case 'approve': return 'Approved';
      case 'review': return 'Review Needed';
      case 'decline': return 'Declined';
      default: return 'Pending';
    }
  };

  return (
    <div
      onClick={() => isScreened && onSelect?.()}
      className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
        getRecommendationColor(isScreened ? screening.recommendation : null)
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-lg font-semibold text-foreground">{tenant.full_name}</h4>
            {isScreened && getRecommendationIcon(screening.recommendation)}
          </div>

          <p className="text-sm text-muted-foreground">{tenant.email}</p>
          <p className="text-sm text-muted-foreground">{tenant.phone}</p>

          {isScreened && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Overall Score</span>
                <span className={`text-lg font-bold ${
                  screening.overall_score >= 75 ? 'text-green-600' :
                  screening.overall_score >= 50 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {screening.overall_score}/100
                </span>
              </div>

              {screening.credit_check && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Credit Score</span>
                  <span className="font-semibold">{screening.credit_check.score}/100</span>
                </div>
              )}

              {screening.reference_checks && screening.reference_checks.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">References Checked</span>
                  <span className="font-semibold">{screening.reference_checks.length}</span>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                Screened: {format(parseISO(screening.screening_completed_date), 'dd MMM yyyy HH:mm')}
              </p>
            </div>
          )}
        </div>

        {isScreened ? (
          <div className="text-right shrink-0">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
              screening.recommendation === 'approve' ? 'bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100' :
              screening.recommendation === 'review' ? 'bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100' :
              'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100'
            }`}>
              {getRecommendationText(screening.recommendation)}
            </span>
          </div>
        ) : (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onScreen?.();
            }}
            disabled={isScreening}
            size="sm"
          >
            {isScreening ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Screening...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Screen
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}