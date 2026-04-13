import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Target, 
  Clock, 
  PoundSterling, 
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Zap,
  BarChart3
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function LeadScoringPanel() {
  const [selectedLead, setSelectedLead] = useState(null);
  const queryClient = useQueryClient();

  const { data: leads = [] } = useQuery({
    queryKey: ['sales-leads-scored'],
    queryFn: async () => {
      return await base44.entities.SalesLead.list('-lead_score');
    }
  });

  const scoreMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('calculateLeadScores', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-leads-scored'] });
    }
  });

  const hotLeads = leads.filter(l => l.priority_tier === 'hot' || (l.lead_score && l.lead_score >= 75));
  const warmLeads = leads.filter(l => l.priority_tier === 'warm' || (l.lead_score && l.lead_score >= 50 && l.lead_score < 75));
  const coldLeads = leads.filter(l => l.priority_tier === 'cold' || (l.lead_score && l.lead_score < 50));

  const avgScore = leads.length > 0 
    ? Math.round(leads.reduce((sum, l) => sum + (l.lead_score || 0), 0) / leads.length) 
    : 0;

  const handleScore = () => {
    scoreMutation.mutate();
  };

  const getPriorityColor = (score) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityBadge = (lead) => {
    if (lead.priority_tier === 'hot' || lead.lead_score >= 75) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">🔥 Hot</Badge>;
    }
    if (lead.priority_tier === 'warm' || lead.lead_score >= 50) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">⚡ Warm</Badge>;
    }
    return <Badge className="bg-slate-100 text-slate-800 border-slate-300">❄️ Cold</Badge>;
  };

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">Predictive Lead Scoring</CardTitle>
              <p className="text-xs text-muted-foreground">AI-powered completion probability</p>
            </div>
          </div>
          <Button 
            onClick={handleScore} 
            disabled={scoreMutation.isPending} 
            variant="outline" 
            size="sm" 
            className="gap-2"
          >
            <RefreshCw className={`w-3 h-3 ${scoreMutation.isPending ? 'animate-spin' : ''}`} />
            {scoreMutation.isPending ? 'Scoring...' : 'Recalculate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-green-50 rounded-lg p-3 border border-green-100 text-center">
            <div className="text-2xl font-bold text-green-700">{hotLeads.length}</div>
            <div className="text-xs text-green-600 mt-1">Hot Leads</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100 text-center">
            <div className="text-2xl font-bold text-yellow-700">{warmLeads.length}</div>
            <div className="text-xs text-yellow-600 mt-1">Warm Leads</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-center">
            <div className="text-2xl font-bold text-slate-700">{coldLeads.length}</div>
            <div className="text-xs text-slate-600 mt-1">Cold Leads</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
            <div className="text-2xl font-bold text-blue-700">{avgScore}</div>
            <div className="text-xs text-blue-600 mt-1">Avg Score</div>
          </div>
        </div>

        {/* Top Priority Leads */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Priority Outreach Today</h4>
            <Badge variant="outline" className="text-xs">{hotLeads.length} hot leads</Badge>
          </div>
          
          {hotLeads.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
              <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-600">No hot leads yet</p>
              <Button onClick={handleScore} variant="link" size="sm" className="mt-2">
                Score leads to identify priorities
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {hotLeads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="bg-white rounded-lg p-3 border border-green-100 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedLead(lead)}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-900">{lead.contact_name}</span>
                        {getPriorityBadge(lead)}
                      </div>
                      <p className="text-xs text-slate-600 capitalize">{lead.lead_type} • {lead.property_type || 'Any type'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-700">{lead.lead_score || 0}</div>
                      <div className="text-xs text-slate-500">score</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{lead.timescale?.replace('_', ' ') || 'Timeline unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <PoundSterling className="w-3 h-3" />
                      <span>£{(lead.budget_max || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {lead.recommended_action && (
                    <div className="bg-blue-50 rounded px-2 py-1.5 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-blue-800">
                        <Zap className="w-3 h-3" />
                        <span className="font-medium">Next action:</span>
                        <span>{lead.recommended_action}</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600">Completion probability</span>
                      <span className="font-medium text-slate-900">{lead.completion_probability || 'High'}</span>
                    </div>
                    <Progress value={lead.lead_score || 0} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View All Leads Button */}
        <Button variant="ghost" size="sm" className="w-full gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
          <BarChart3 className="w-3 h-3" />
          View All Scored Leads
        </Button>
      </CardContent>

      {/* Lead Detail Dialog */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Lead Score Analysis: {selectedLead.contact_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Score Overview */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700">Overall Score</span>
                  <Badge className={`${getPriorityColor(selectedLead.lead_score)} text-white`}>
                    {selectedLead.lead_score}/100
                  </Badge>
                </div>
                <Progress value={selectedLead.lead_score} className="h-3 mb-2" />
                <p className="text-xs text-slate-600">
                  {selectedLead.completion_probability || 'Completion probability not available'}
                </p>
              </div>

              {/* Score Breakdown */}
              {selectedLead.scoring_breakdown && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Score Breakdown</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: 'Timescale', value: selectedLead.scoring_breakdown.timescale, icon: Clock },
                      { label: 'Motivation', value: selectedLead.scoring_breakdown.motivation, icon: Zap },
                      { label: 'Financial', value: selectedLead.scoring_breakdown.financial, icon: PoundSterling },
                      { label: 'Engagement', value: selectedLead.scoring_breakdown.engagement, icon: MessageSquare },
                      { label: 'Match', value: selectedLead.scoring_breakdown.property_match, icon: Target },
                    ].map((item, idx) => (
                      <div key={idx} className="text-center bg-slate-50 rounded-lg p-2 border border-slate-200">
                        <item.icon className="w-3 h-3 mx-auto mb-1 text-slate-400" />
                        <div className="text-lg font-bold text-slate-900">{item.value || 0}</div>
                        <div className="text-xs text-slate-600">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Positive Indicators */}
              {selectedLead.positive_indicators?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Positive Indicators
                  </h4>
                  <ul className="space-y-1">
                    {selectedLead.positive_indicators.map((indicator, idx) => (
                      <li key={idx} className="text-sm text-green-800 bg-green-50 px-2 py-1.5 rounded flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        {indicator}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Factors */}
              {selectedLead.risk_factors?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Risk Factors
                  </h4>
                  <ul className="space-y-1">
                    {selectedLead.risk_factors.map((risk, idx) => (
                      <li key={idx} className="text-sm text-amber-800 bg-amber-50 px-2 py-1.5 rounded flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">⚠</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Action */}
              {selectedLead.recommended_action && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">Recommended Action</h4>
                      <p className="text-sm text-blue-800">{selectedLead.recommended_action}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lead Details */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
                <div>
                  <p className="text-xs text-slate-600">Lead Type</p>
                  <p className="text-sm font-medium capitalize">{selectedLead.lead_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Budget</p>
                  <p className="text-sm font-medium">£{(selectedLead.budget_min || 0).toLocaleString()} - £{(selectedLead.budget_max || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Timescale</p>
                  <p className="text-sm font-medium capitalize">{selectedLead.timescale?.replace('_', ' ') || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Last Contact</p>
                  <p className="text-sm font-medium">{selectedLead.last_contact_date ? new Date(selectedLead.last_contact_date).toLocaleDateString() : 'Never'}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}