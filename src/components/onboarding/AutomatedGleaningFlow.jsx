import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Sparkles, Globe, Database, CheckCircle2, AlertCircle, TrendingUp,
  BarChart3, Link2, Clock, Zap, MapPin, Users, Shield, AlertTriangle
} from 'lucide-react';

const COMPLEXITY_COLORS = {
  SIMPLE: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100' },
  MODERATE: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100' },
  COMPLEX: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100' },
  VERY_COMPLEX: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' },
};

export default function AutomatedGleaningFlow({ onComplete }) {
  const [step, setStep] = useState('input');
  const [query, setQuery] = useState('');
  const [gleaning, setGleaning] = useState(false);
  const [gleanResult, setGleanResult] = useState(null);
  const [gleanError, setGleanError] = useState(null);

  const startGleaning = async () => {
    if (!query.trim()) return;
    setGleaning(true);
    setGleanError(null);

    try {
      const res = await base44.functions.invoke('gleanCompanyIntelligence', {
        company_name: query,
        company_website: '',
        company_number: '',
      });

      setGleanResult(res.data);
      setStep('results');
    } catch (error) {
      setGleanError(error.message || 'Failed to glean company intelligence');
      console.error('Gleaning error:', error);
    } finally {
      setGleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Phase */}
      {step === 'input' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Automated Company Intelligence Gleaning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your company name or number to auto-populate your profile from public data (website, Companies House, industry registries, social media).
            </p>

            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startGleaning()}
                placeholder="Company name or Companies House number"
                disabled={gleaning}
              />
              <Button onClick={startGleaning} disabled={gleaning || !query.trim()} className="gap-2">
                {gleaning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Scanning...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" /> Glean
                  </>
                )}
              </Button>
            </div>

            {gleaning && (
              <Alert className="bg-blue-50 border-blue-200">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <AlertDescription className="text-blue-800 ml-2">
                  <div>Scanning company website, registries, and public records...</div>
                  <div className="text-xs mt-1">Analyzing: websites • Companies House • LinkedIn • industry platforms</div>
                </AlertDescription>
              </Alert>
            )}

            {gleanError && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{gleanError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Phase */}
      {step === 'results' && gleanResult && (
        <div className="space-y-6">
          {/* Company Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{gleanResult.company_info?.name}</span>
                <Badge>{gleanResult.company_info?.number}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="font-medium">{gleanResult.company_info?.address}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Founded</p>
                  <p className="font-medium">{gleanResult.company_info?.founded}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Team Size</p>
                  <p className="font-medium">{gleanResult.team_size}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> Portfolio Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3 rounded">
                  <p className="text-xs text-muted-foreground">Properties</p>
                  <p className="text-2xl font-bold text-slate-900">{gleanResult.portfolio?.properties}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded">
                  <p className="text-xs text-muted-foreground">Units</p>
                  <p className="text-2xl font-bold text-slate-900">{gleanResult.portfolio?.units}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded">
                  <p className="text-xs text-muted-foreground">Estimated Value</p>
                  <p className="text-lg font-bold text-slate-900">
                    {gleanResult.portfolio?.value_estimate
                      ? `£${(gleanResult.portfolio.value_estimate / 1000000).toFixed(1)}M`
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded">
                  <p className="text-xs text-muted-foreground">Regions</p>
                  <p className="text-lg font-bold text-slate-900">{gleanResult.portfolio?.regions?.length || 0}</p>
                </div>
              </div>

              {gleanResult.services && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">Services Offered</p>
                  <div className="flex flex-wrap gap-1">
                    {gleanResult.services.map((s, i) => (
                      <Badge key={i} variant="outline">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Complexity Assessment */}
          {gleanResult.complexity && (
            <Card className={`${COMPLEXITY_COLORS[gleanResult.complexity.category]?.bg} border ${COMPLEXITY_COLORS[gleanResult.complexity.category]?.border}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Import Complexity Assessment
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{gleanResult.complexity.overall_score}</div>
                    <Badge className={`${COMPLEXITY_COLORS[gleanResult.complexity.category]?.badge}`}>
                      {gleanResult.complexity.category}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{gleanResult.complexity.rationale}</p>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  {Object.entries(gleanResult.complexity.factors || {}).map(([key, value]) => (
                    <div key={key} className="bg-white/50 p-2 rounded">
                      <p className="font-semibold text-slate-800">{value}/10</p>
                      <p className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium">Estimated Setup Time: ~{gleanResult.complexity.estimated_hours}h</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Sources Detected */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" /> Detected Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {gleanResult.data_sources?.accounting_systems?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Accounting Systems
                  </p>
                  <div className="space-y-1">
                    {gleanResult.data_sources.accounting_systems.map((sys, i) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded">
                        <span>{sys.name}</span>
                        <Badge variant="outline">{sys.confidence}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {gleanResult.data_sources?.cloud_storage?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Link2 className="w-4 h-4" /> Cloud Storage
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {gleanResult.data_sources.cloud_storage.map((s, i) => (
                      <Badge key={i} variant="outline">{s.provider}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {gleanResult.data_sources?.rental_platforms?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Rental Platforms</p>
                  <div className="flex flex-wrap gap-1">
                    {gleanResult.data_sources.rental_platforms.map((p, i) => (
                      <Badge key={i} variant="outline">{p.platform}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {gleanResult.technology_detected?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Technology Stack
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {gleanResult.technology_detected.map((t, i) => (
                      <Badge key={i} variant="outline">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pain Points & Risks */}
          {gleanResult.complexity?.pain_points?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Anticipated Pain Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {gleanResult.complexity.pain_points.map((point, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Quick Wins */}
          {gleanResult.complexity?.quick_wins?.length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" /> Quick Wins (Start Here!)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {gleanResult.complexity.quick_wins.map((win, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <Zap className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <span>{win}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommended Actions */}
          {gleanResult.recommended_actions?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Recommended Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {gleanResult.recommended_actions.map((action, i) => (
                  <div key={i} className="flex gap-3 p-2 bg-slate-50 rounded">
                    <Badge className="shrink-0">{action.priority}</Badge>
                    <div className="text-sm">
                      <p className="font-medium">{action.action}</p>
                      <p className="text-xs text-muted-foreground">{action.reason}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('input')} className="flex-1">
              Search Another Company
            </Button>
            <Button onClick={() => onComplete?.(gleanResult)} className="flex-1 gap-2">
              <CheckCircle2 className="w-4 h-4" /> Use This Profile
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}