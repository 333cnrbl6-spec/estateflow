import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Download, Printer, CheckCircle2, AlertCircle, DollarSign, Calendar, Wrench, User } from 'lucide-react';

const STATUS_COLOR = {
  reported: 'bg-red-100 text-red-700',
  assigned: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

function SummarySection({ orders, property }) {
  const completed = orders.filter(o => o.status === 'completed');
  const pending = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const totalEstimated = orders.reduce((s, o) => s + (o.estimated_cost || 0), 0);
  const totalActual = completed.reduce((s, o) => s + (o.actual_cost || 0), 0);
  const outstanding = pending.reduce((s, o) => s + (o.estimated_cost || 0), 0);

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Estimated', value: `£${totalEstimated.toLocaleString()}`, icon: DollarSign, color: 'text-slate-700', bg: 'bg-slate-50' },
          { label: 'Actual Spend', value: `£${totalActual.toLocaleString()}`, icon: CheckCircle2, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Outstanding', value: `£${outstanding.toLocaleString()}`, icon: AlertCircle, color: 'text-amber-700', bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-3 ${s.bg} text-center`}>
            <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Job breakdown */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Job Breakdown</p>
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                {['Job', 'Contractor', 'Status', 'Estimated', 'Actual'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-800">{order.title}</p>
                    {order.scheduled_date && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.scheduled_date).toLocaleDateString('en-GB')}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">{order.assigned_contractor_name || '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLOR[order.status] || STATUS_COLOR.reported}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs font-medium">{order.estimated_cost ? `£${Number(order.estimated_cost).toLocaleString()}` : '—'}</td>
                  <td className="px-3 py-2 text-xs font-medium text-green-700">{order.actual_cost ? `£${Number(order.actual_cost).toLocaleString()}` : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t font-semibold">
                <td className="px-3 py-2 text-sm" colSpan={3}>Totals</td>
                <td className="px-3 py-2 text-sm">£{totalEstimated.toLocaleString()}</td>
                <td className="px-3 py-2 text-sm text-green-700">£{totalActual.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function CostSummaryDialog({ open, onClose, orders, property, landlord }) {
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateAISummary = async () => {
    setLoading(true);
    const totalEstimated = orders.reduce((s, o) => s + (o.estimated_cost || 0), 0);
    const totalActual = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.actual_cost || 0), 0);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a UK property manager writing a maintenance cost summary letter for a landlord.

Property: ${property?.name || 'Unknown'} (${property?.address_line_1 || ''}, ${property?.postcode || ''})
Landlord: ${landlord || 'Dear Landlord'}
Period: ${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}

Maintenance jobs:
${orders.map(o => `- ${o.title} | Status: ${o.status} | Contractor: ${o.assigned_contractor_name || 'TBC'} | Estimated: £${o.estimated_cost || 0} | Actual: £${o.actual_cost || 0}`).join('\n')}

Total estimated: £${totalEstimated}
Total actual spend (completed): £${totalActual}

Write a professional, concise 3-paragraph landlord maintenance summary letter. Include:
1. Overview of works undertaken/in progress
2. Cost breakdown narrative
3. Any recommendations or upcoming works to be aware of

Plain text only. No markdown.`,
      });
      setAiSummary(typeof res === 'string' ? res : JSON.stringify(res));
    } finally {
      setLoading(false);
    }
  };

  const print = () => window.print();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Maintenance Cost Summary
            {property && <span className="text-muted-foreground font-normal text-sm">— {property.name}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <SummarySection orders={orders} property={property} />

          {/* AI Landlord Letter */}
          <div className="border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 border-b">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-semibold text-violet-900">AI Landlord Summary Letter</span>
              </div>
              {!aiSummary && (
                <Button size="sm" onClick={generateAISummary} disabled={loading}
                  className="bg-violet-600 hover:bg-violet-700 text-white h-7 text-xs gap-1">
                  {loading ? <><Loader2 className="w-3 h-3 animate-spin" />Generating…</> : <><Sparkles className="w-3 h-3" />Generate Letter</>}
                </Button>
              )}
            </div>

            {aiSummary ? (
              <div className="p-4 space-y-3">
                <pre className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">{aiSummary}</pre>
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(aiSummary)} className="gap-1 text-xs">
                    Copy text
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setAiSummary(null)} className="text-xs">
                    Regenerate
                  </Button>
                  <Button size="sm" onClick={print} className="gap-1 text-xs ml-auto">
                    <Printer className="w-3.5 h-3.5" /> Print / PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-sm text-muted-foreground">
                Generate a professional maintenance summary letter to send to your landlord, covering all jobs, costs, and recommendations.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}