import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Check, X, ChevronDown, ChevronUp, GitMerge, Trash2 } from 'lucide-react';

export default function DataDeduplicationReview({ classifiedFiles, onReview, loading }) {
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [decisions, setDecisions] = useState({});
  const [error, setError] = useState(null);

  const analyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('analyzeDataQualityAndDuplicates', {
        classified_files: classifiedFiles,
      });
      setAnalysis(res.data?.analysis || res.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (classifiedFiles?.length > 0) {
      analyze();
    }
  }, [classifiedFiles]);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const makeDecision = (mergeId, action) => {
    setDecisions(prev => ({ ...prev, [mergeId]: action }));
  };

  const approveMerges = () => {
    onReview({ analysis, decisions });
  };

  if (!analysis && !analyzing) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <p className="text-sm font-medium text-blue-900 mb-3">Ready to analyze your data for duplicates and quality issues</p>
        <Button onClick={analyze} className="gap-2">
          Analyze Data Quality
        </Button>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="bg-slate-50 rounded-xl p-8 text-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
        <p className="text-sm font-medium text-slate-700">Analyzing {classifiedFiles.length} files for duplicates and quality issues...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold text-red-800">Analysis failed</p>
        <p className="text-xs text-red-700">{error}</p>
        <Button size="sm" onClick={analyze} variant="outline">Retry</Button>
      </div>
    );
  }

  const { duplicate_groups = [], merge_suggestions = [], quality_issues = [], data_standardization = [] } = analysis || {};
  const highSeverityIssues = quality_issues.filter(q => q.severity === 'high');
  const mediumSeverityIssues = quality_issues.filter(q => q.severity === 'medium');

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Records</p>
          <p className="text-lg font-bold text-slate-900">{analysis.total_records || 0}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Duplicates Found</p>
          <p className="text-lg font-bold text-amber-700">{duplicate_groups.length}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Quality Issues</p>
          <p className="text-lg font-bold text-red-700">{highSeverityIssues.length + mediumSeverityIssues.length}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Merge Suggestions</p>
          <p className="text-lg font-bold text-blue-700">{merge_suggestions.length}</p>
        </div>
      </div>

      {/* High Severity Issues */}
      {highSeverityIssues.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="font-semibold text-red-800">{highSeverityIssues.length} High-Severity Issues</p>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {highSeverityIssues.slice(0, 5).map((issue, i) => (
              <div key={i} className="bg-white rounded-lg p-3 border border-red-200">
                <p className="text-xs font-medium text-red-700">{issue.field}</p>
                <p className="text-xs text-slate-600 mt-1">{issue.issue}</p>
                <p className="text-xs text-slate-500 mt-1 italic">Fix: {issue.fix_suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Merge Suggestions */}
      {merge_suggestions.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-900">Review & Approve Merges</p>
          {merge_suggestions.map(merge => {
            const decision = decisions[merge.merge_id];
            const expanded = expandedGroups[merge.merge_id];
            return (
              <div key={merge.merge_id} className={`border rounded-lg overflow-hidden transition-all ${
                decision === 'approve' ? 'border-green-300 bg-green-50' :
                decision === 'reject' ? 'border-red-300 bg-red-50' :
                'border-slate-200'
              }`}>
                <div onClick={() => toggleGroup(merge.merge_id)} className="p-4 cursor-pointer hover:bg-slate-50 flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <GitMerge className="w-4 h-4 text-slate-500 shrink-0" />
                      <p className="font-medium text-slate-900">Merge {merge.type} records</p>
                      <Badge variant="outline" className="text-xs">{merge.action}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Indices: {merge.from_indices.join(', ')} → {merge.to_index}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {decision && (
                      <Badge variant={decision === 'approve' ? 'default' : 'destructive'} className="text-xs">
                        {decision === 'approve' ? '✓ Approved' : '✗ Rejected'}
                      </Badge>
                    )}
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {expanded && (
                  <div className="bg-slate-50 border-t p-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-700 mb-2">Expected Result</p>
                      <p className="text-xs text-slate-600">{merge.expected_result}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => makeDecision(merge.merge_id, 'approve')}
                        variant={decision === 'approve' ? 'default' : 'outline'}
                        className="gap-1 flex-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => makeDecision(merge.merge_id, 'reject')}
                        variant={decision === 'reject' ? 'destructive' : 'outline'}
                        className="gap-1 flex-1"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => makeDecision(merge.merge_id, null)}
                        variant="ghost"
                        className="gap-1"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Data Standardization Recommendations */}
      {data_standardization.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <p className="font-semibold text-blue-900">Data Standardization Recommendations</p>
          <div className="space-y-2 text-xs">
            {data_standardization.slice(0, 4).map((std, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-blue-600 font-medium shrink-0">{std.field}:</span>
                <span className="text-blue-700">{std.recommended_format}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button variant="outline" onClick={analyze} className="flex-1 gap-2">
          ↻ Re-analyze
        </Button>
        <Button onClick={approveMerges} className="flex-1 gap-2" disabled={merge_suggestions.length === 0}>
          Continue with Decisions
        </Button>
      </div>
    </div>
  );
}