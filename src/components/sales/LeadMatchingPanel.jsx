import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LeadMatchingPanel({ leadId, leadName, leadType, onMatchSelect }) {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState(null);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  const analyzeMatches = async () => {
    if (!leadId) return;
    setLoading(true);
    setError('');
    try {
      const result = await base44.functions.invoke('matchLeadToProperties', { lead_id: leadId });
      if (result.data?.matches) {
        setMatches(result.data.matches);
        setSummary(result.data.analysis_summary);
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze matches');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-blue-100 text-blue-800';
    if (score >= 40) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreBorder = (score) => {
    if (score >= 80) return 'border-green-300';
    if (score >= 60) return 'border-blue-300';
    if (score >= 40) return 'border-amber-300';
    return 'border-red-300';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            AI Lead Matching
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {leadName ? `Analyze best-fit properties for ${leadName} (${leadType})` : 'Select a lead to analyze matches'}
          </p>
        </CardHeader>
        <CardContent>
          {!matches && !loading && (
            <Button onClick={analyzeMatches} disabled={!leadId} className="w-full gap-2">
              <Zap className="w-4 h-4" /> Analyze Property Matches
            </Button>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Scanning inventory & scoring matches...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800 flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {matches && matches.length > 0 && (
            <div className="space-y-4">
              {summary && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                  <p className="font-semibold mb-1">Analysis Summary</p>
                  <p>{summary}</p>
                </div>
              )}

              <div className="space-y-3">
                {matches.map((match, idx) => (
                  <div
                    key={idx}
                    className={`border-2 rounded-lg p-4 transition-all ${getScoreBorder(match.score)} ${
                      match.score >= 80 ? 'bg-green-50 hover:bg-green-100' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{match.property_name}</h4>
                        <p className="text-xs text-muted-foreground">{match.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getScoreColor(match.score)}`}>
                          {match.score}%
                        </div>
                        {match.score >= 80 && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                        {match.score >= 60 && match.score < 80 && <TrendingUp className="w-5 h-5 text-blue-600" />}
                      </div>
                    </div>

                    {match.match_reasons && match.match_reasons.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-slate-700 mb-1">✓ Good Fit</p>
                        <div className="flex flex-wrap gap-1">
                          {match.match_reasons.map((reason, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {match.missing_fit && match.missing_fit.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-amber-700 mb-1">⚠ Considerations</p>
                        <div className="flex flex-wrap gap-1">
                          {match.missing_fit.map((issue, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {onMatchSelect && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMatchSelect(match)}
                        className="w-full mt-2 text-xs"
                      >
                        View & Contact Lead
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full" onClick={() => setMatches(null)}>
                Analyze Another Lead
              </Button>
            </div>
          )}

          {matches && matches.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No strong matches found in current inventory</p>
              <p className="text-xs text-muted-foreground mt-1">Consider adding more properties or adjusting filters</p>
              <Button variant="outline" className="mt-4" onClick={() => setMatches(null)}>
                Try Another Lead
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}