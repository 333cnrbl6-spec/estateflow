import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingUp, Database, CheckCircle2, AlertTriangle } from 'lucide-react';
import { scoreDataQuality, getQualityStatus } from '@/lib/dataValidation';
import { Progress } from '@/components/ui/progress';

export default function DataQualityWidget() {
  const { data: profiles = [] } = useQuery({
    queryKey: ['companiesHouseProfiles'],
    queryFn: () => base44.entities.CompaniesHouseProfile.list('-updated_date', 10)
  });

  if (profiles.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">Data Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No company profiles yet. Add a company to see quality metrics.
          </p>
        </CardContent>
      </Card>
    );
  }

  const qualityScores = profiles.map(p => ({
    id: p.id,
    name: p.company_name,
    ...scoreDataQuality(p)
  }));

  const avgScore = Math.round(qualityScores.reduce((s, q) => s + q.score, 0) / qualityScores.length);
  const avgStatus = getQualityStatus(avgScore);

  // Count issues
  const totalIssues = qualityScores.reduce((s, q) => s + (q.issues?.length || 0), 0);

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Data Quality</CardTitle>
          <Database className="w-4 h-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Portfolio Average</span>
            <span className={`text-lg font-bold text-${avgStatus.color}-600`}>{avgScore}%</span>
          </div>
          <Progress value={avgScore} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{avgStatus.label} data quality</p>
        </div>

        {/* Company breakdown */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">By Company</p>
          {qualityScores.map(q => {
            const status = getQualityStatus(q.score);
            return (
              <div key={q.id} className="flex items-center justify-between text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800 truncate">{q.name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <div className="w-16">
                    <Progress value={q.score} className="h-1.5" />
                  </div>
                  <span className={`font-semibold text-${status.color}-600`}>{q.score}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Issues summary */}
        {totalIssues > 0 && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800">
                {totalIssues} data quality issue{totalIssues !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Run compliance sync to update company profiles
              </p>
            </div>
          </div>
        )}

        {totalIssues === 0 && (
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-2.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-green-800">All company data is current and complete</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}