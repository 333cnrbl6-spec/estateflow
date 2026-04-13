import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DataImportMappingGuidance({ data, onChange }) {
  const [loading, setLoading] = useState(false);
  const [mappings, setMappings] = useState(null);
  const [error, setError] = useState(null);

  const generateMappings = async () => {
    setLoading(true);
    setError(null);
    try {
      const dataGleans = data.data_gleans || {};
      const sourceDescriptions = Object.entries(dataGleans)
        .filter(([, gleans]) => gleans.length > 0)
        .map(([source, gleans]) => `${source.replace(/_/g, ' ')}: ${gleans.join(', ')}`)
        .join('\n');

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are helping structure property management data for import into Premiso.

Data sources available:
${sourceDescriptions}

Company context:
- Name: ${data.company_name || 'Unknown'}
- Services: ${(data.services || []).join(', ') || 'General'}
- Software: ${(data.software || []).join(', ') || 'None'}

Create an AI-guided mapping plan that:
1. Recommends which source data maps to which entity (Tenants, Properties, Transactions, etc)
2. Identifies key fields to extract from each source
3. Suggests data transformation rules (e.g., date formats, currency)
4. Flags potential data quality issues
5. Estimates record counts by entity

Return as JSON with:
- entity_mappings: array of {entity, sources[], key_fields[], confidence}
- transformation_rules: array of {rule_type, source_field, target_field, logic}
- data_quality_flags: array of {flag, severity, recommendation}
- estimated_records: object with entity counts
- next_steps: array of actions to validate/enhance data`,
        response_json_schema: {
          type: 'object',
          properties: {
            entity_mappings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  entity: { type: 'string' },
                  sources: { type: 'array', items: { type: 'string' } },
                  key_fields: { type: 'array', items: { type: 'string' } },
                  confidence: { type: 'string' },
                },
              },
            },
            transformation_rules: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  rule_type: { type: 'string' },
                  source_field: { type: 'string' },
                  target_field: { type: 'string' },
                  logic: { type: 'string' },
                },
              },
            },
            data_quality_flags: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  flag: { type: 'string' },
                  severity: { type: 'string' },
                  recommendation: { type: 'string' },
                },
              },
            },
            estimated_records: { type: 'object' },
            next_steps: { type: 'array', items: { type: 'string' } },
          },
        },
      });

      setMappings(res);
      onChange({ ...data, import_mappings: res });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!mappings ? (
        <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center">
          <p className="text-sm text-slate-700 mb-4">
            Let AI analyze your data sources and recommend how to structure everything for import.
          </p>
          <Button onClick={generateMappings} disabled={loading} size="lg" className="gap-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing data sources...
              </>
            ) : (
              <>🤖 Generate AI Mapping Plan</>
            )}
          </Button>
          {error && (
            <p className="text-xs text-destructive mt-3">{error}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Entity Mappings */}
          <div className="border rounded-xl p-4 bg-gradient-to-br from-blue-50 to-transparent">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
              📊 Entity Mappings
            </h3>
            <div className="space-y-2">
              {mappings.entity_mappings?.map((em, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-slate-900">{em.entity}</p>
                    <p className="text-xs text-muted-foreground mt-1">Sources: {em.sources.join(', ')}</p>
                    <p className="text-xs text-muted-foreground">Fields: {em.key_fields.join(', ')}</p>
                  </div>
                  <div className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">
                    {em.confidence}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Quality Flags */}
          {mappings.data_quality_flags?.length > 0 && (
            <div className="border rounded-xl p-4 bg-gradient-to-br from-amber-50 to-transparent">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                ⚠️ Data Quality Flags
              </h3>
              <div className="space-y-2">
                {mappings.data_quality_flags.map((flag, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-white rounded-lg border border-amber-100">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm flex-1">
                      <p className="font-medium text-slate-900">{flag.flag}</p>
                      <p className="text-xs text-muted-foreground mt-1">{flag.recommendation}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-100 text-amber-700 whitespace-nowrap">
                      {flag.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estimated Records */}
          {mappings.estimated_records && (
            <div className="border rounded-xl p-4 bg-gradient-to-br from-green-50 to-transparent">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" /> Estimated Data Volume
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(mappings.estimated_records).map(([entity, count]) => (
                  <div key={entity} className="flex items-center justify-between p-2 bg-white rounded border border-green-100 text-sm">
                    <span className="text-slate-700">{entity.replace(/_/g, ' ')}</span>
                    <span className="font-bold text-green-700">~{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {mappings.next_steps?.length > 0 && (
            <div className="border rounded-xl p-4 bg-slate-50">
              <h3 className="font-semibold text-slate-900 mb-3">📋 Next Steps</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
                {mappings.next_steps.map((step, i) => (
                  <li key={i} className="text-xs text-slate-600">{step}</li>
                ))}
              </ol>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setMappings(null)} className="flex-1">
              Re-analyze
            </Button>
            <Button size="sm" className="flex-1" disabled>
              <CheckCircle2 className="w-4 h-4" /> Mappings Ready
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}