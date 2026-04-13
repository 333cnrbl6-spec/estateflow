import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search, Loader2, Zap, Building2, CheckCircle2, PlusCircle,
  Link2, DollarSign, Globe, ChevronRight, Lightbulb, AlertTriangle,
  Package, Puzzle, ArrowRight, ExternalLink
} from 'lucide-react';

const SCOPE_COLOURS = {
  in_scope: 'bg-green-100 text-green-800 border-green-300',
  buildable: 'bg-amber-100 text-amber-800 border-amber-300',
  integration: 'bg-blue-100 text-blue-800 border-blue-300',
  out_of_scope: 'bg-slate-100 text-slate-600 border-slate-300',
};

const SCOPE_LABELS = {
  in_scope: '✓ In Premiso',
  buildable: '⚡ Buildable for Client',
  integration: '🔌 Integration Available',
  out_of_scope: 'Outside Scope',
};

export default function ExpansionOpportunities() {
  const [agentName, setAgentName] = useState('');
  const [agentLocation, setAgentLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleResearch = async () => {
    if (!agentName.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await base44.functions.invoke('researchExpansion', {
        agent_name: agentName.trim(),
        agent_location: agentLocation.trim() || 'UK',
      });
      if (res.data?.success) {
        setData(res.data);
      } else {
        setError(res.data?.error || 'Research failed.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h1 className="text-2xl font-serif font-bold">Expansion Opportunities</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Research any agent or property company — identify out-of-scope services, competitor software they use, integration possibilities, and what Premiso could build for them.
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Agent / Company Name *</label>
              <Input
                placeholder="e.g. Redman Casey, Reeds Rains, Connells..."
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleResearch()}
              />
            </div>
            <div className="sm:w-52">
              <label className="text-xs text-muted-foreground mb-1 block">Location (optional)</label>
              <Input
                placeholder="e.g. Horwich Bolton"
                value={agentLocation}
                onChange={e => setAgentLocation(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleResearch()}
              />
            </div>
            <div className="sm:self-end">
              <Button onClick={handleResearch} disabled={loading || !agentName.trim()} className="w-full sm:w-auto">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Research
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-3" />
            <p className="font-medium">Researching {agentName}…</p>
            <p className="text-sm text-muted-foreground mt-1">
              Searching public sources for services, software stack, integrations and competitor landscape.
            </p>
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="space-y-6">
          {/* Agent Summary */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h2 className="font-bold text-base">{data.agent_name}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{data.agent_summary}</p>
                  {data.services_overview && (
                    <p className="text-xs text-muted-foreground mt-1 italic">{data.services_overview}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(SCOPE_LABELS).map(([key, label]) => (
              <span key={key} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${SCOPE_COLOURS[key]}`}>
                {label}
              </span>
            ))}
          </div>

          {/* Services Breakdown */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Services Offered — Scope Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(data.services || []).map((svc, i) => (
                <Card key={i} className="border">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{svc.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SCOPE_COLOURS[svc.scope]}`}>
                            {SCOPE_LABELS[svc.scope]}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{svc.description}</p>
                        {svc.build_notes && (
                          <p className="text-xs text-amber-700 mt-1.5 bg-amber-50 rounded px-2 py-1">
                            💡 {svc.build_notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Software They Likely Use */}
          {data.existing_software?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" /> Software They Likely Already Use
              </h3>
              <div className="space-y-3">
                {data.existing_software.map((sw, i) => (
                  <Card key={i}>
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-semibold text-sm">{sw.name}</h4>
                            <Badge variant="outline" className="text-xs">{sw.category}</Badge>
                            {sw.pricing && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />{sw.pricing}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{sw.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${sw.has_api ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                              {sw.has_api ? '✓ Has API' : '✗ No Public API'}
                            </span>
                            {sw.integration_type && (
                              <span className="text-xs px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                                🔌 {sw.integration_type}
                              </span>
                            )}
                            {sw.confidence && (
                              <span className="text-xs text-muted-foreground">
                                Likelihood: {sw.confidence}
                              </span>
                            )}
                          </div>
                        </div>
                        {sw.website && (
                          <a href={sw.website} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary shrink-0">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Competitor Software Landscape */}
          {data.competitor_software?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Puzzle className="w-4 h-4" /> Competitor Software Landscape (for out-of-scope services)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left py-2 px-3">Software</th>
                      <th className="text-left py-2 px-3">Covers</th>
                      <th className="text-left py-2 px-3">Pricing</th>
                      <th className="text-left py-2 px-3">API</th>
                      <th className="text-left py-2 px-3">Premiso Integration?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.competitor_software.map((sw, i) => (
                      <tr key={i} className="border-b hover:bg-muted/30">
                        <td className="py-2.5 px-3">
                          <div className="font-medium">{sw.name}</div>
                          <div className="text-xs text-muted-foreground">{sw.vendor}</div>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-muted-foreground">{sw.covers}</td>
                        <td className="py-2.5 px-3 text-xs">{sw.pricing}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${sw.has_api ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {sw.has_api ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            sw.integration_feasibility === 'high' ? 'bg-green-100 text-green-700' :
                            sw.integration_feasibility === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {sw.integration_feasibility === 'high' ? '✓ High' :
                             sw.integration_feasibility === 'medium' ? '~ Medium' : 'Low'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Integration Opportunities */}
          {data.integration_opportunities?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4" /> Premiso Integration Opportunities
              </h3>
              <div className="space-y-3">
                {data.integration_opportunities.map((opp, i) => (
                  <Card key={i} className={`border-l-4 ${
                    opp.priority === 'high' ? 'border-l-green-500' :
                    opp.priority === 'medium' ? 'border-l-amber-500' : 'border-l-slate-300'
                  }`}>
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{opp.title}</h4>
                            <Badge variant="outline" className={`text-xs ${
                              opp.priority === 'high' ? 'border-green-300 text-green-700' :
                              opp.priority === 'medium' ? 'border-amber-300 text-amber-700' :
                              'border-slate-300 text-slate-500'
                            }`}>
                              {opp.priority} priority
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{opp.description}</p>
                          {opp.technical_approach && (
                            <p className="text-xs text-blue-600 mt-1">🔧 {opp.technical_approach}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{opp.effort}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {data.recommendation && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-4 pb-4 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-amber-900 mb-1">Sales Recommendation</p>
                  <p className="text-sm text-amber-800">{data.recommendation}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <p className="text-xs text-muted-foreground text-center pb-4">
            Research based on publicly available information. Software pricing and API availability should be verified directly with vendors.
          </p>
        </div>
      )}
    </div>
  );
}