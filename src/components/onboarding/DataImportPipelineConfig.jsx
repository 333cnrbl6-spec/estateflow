import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, AlertTriangle, Loader2, Info } from 'lucide-react';

export default function DataImportPipelineConfig({ data, onImportStart }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const loadPipelineConfig = async () => {
      try {
        const res = await base44.functions.invoke('configureDataImportPipeline', {
          software_integrations: data.software || [],
          data_types: data.data_types || [],
          data_counts: data.data_counts || {},
          company_number: data.company_number,
          company_name: data.company_name
        });
        setConfig(res.data);
      } catch (error) {
        console.error('Failed to load pipeline config:', error);
      } finally {
        setLoading(false);
      }
    };

    if (data.software?.length > 0 && data.data_types?.length > 0) {
      loadPipelineConfig();
    } else {
      setLoading(false);
    }
  }, [data.software, data.data_types, data.data_counts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Analyzing data sources and planning import pipelines...</span>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
        <Info className="w-5 h-5 text-blue-600 mx-auto mb-2" />
        <p className="text-sm text-blue-800">Select software integrations and data types to configure import pipelines</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Data Import Pipelines</h3>
        <p className="text-sm text-muted-foreground">Automated data import configuration based on your software and data selections.</p>
      </div>

      {/* Timeline Overview */}
      <div className="bg-slate-50 border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Estimated Import Time</p>
          <p className="text-sm font-bold text-primary">{config.timeline.total_estimated_time}</p>
        </div>
        <div className="space-y-2">
          {config.timeline.phases.map((phase, idx) => (
            <div key={idx} className="flex items-center gap-3 text-xs">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-slate-600 flex-1">{phase.name}</span>
              <span className="text-muted-foreground">{phase.duration}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Conflicts & Issues */}
      {config.conflicts.length > 0 && (
        <div className="border rounded-xl p-4 bg-amber-50 border-amber-200 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Potential Data Conflicts ({config.conflicts.length})</p>
              <p className="text-xs text-amber-800 mt-1">Review these before starting import</p>
            </div>
          </div>
          <div className="space-y-2">
            {config.conflicts.map((conflict, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-amber-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{conflict.description}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      <span className={`font-semibold ${
                        conflict.severity === 'high' ? 'text-red-600' :
                        conflict.severity === 'medium' ? 'text-amber-600' :
                        'text-blue-600'
                      }`}>
                        {conflict.severity.toUpperCase()}
                      </span>
                      {conflict.resolution && ` — ${conflict.resolution}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Import Pipelines */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-900">Import Pipelines ({config.pipelines.length})</p>
        {config.pipelines.map((pipeline, idx) => (
          <div key={idx} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === idx ? null : idx)}
              className="w-full p-4 bg-white hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary capitalize">{pipeline.software[0]}</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 capitalize">{pipeline.software}</p>
                  <p className="text-xs text-muted-foreground">{pipeline.data_types.length} data types • {Object.keys(pipeline.estimated_records).length} entities</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-600">{pipeline.mapping_time}</p>
              </div>
            </button>

            {expanded === idx && (
              <div className="border-t bg-slate-50 p-4 space-y-3">
                {/* Data Types */}
                <div>
                  <p className="text-xs font-semibold text-slate-700 uppercase mb-2">Data Types to Import</p>
                  <div className="flex flex-wrap gap-1">
                    {pipeline.data_types.map(dt => (
                      <span key={dt} className="text-xs bg-white border rounded px-2 py-1 text-slate-600">
                        {dt.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Estimated Records */}
                <div>
                  <p className="text-xs font-semibold text-slate-700 uppercase mb-2">Estimated Records</p>
                  <div className="space-y-1 text-xs">
                    {Object.entries(pipeline.estimated_records).map(([dtype, count]) => (
                      <div key={dtype} className="flex justify-between text-slate-600">
                        <span className="capitalize">{dtype.replace(/_/g, ' ')}</span>
                        <span className="font-medium">{count} records</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extractors */}
                <div>
                  <p className="text-xs font-semibold text-slate-700 uppercase mb-2">Data Extractors</p>
                  <div className="flex flex-wrap gap-1">
                    {pipeline.extractors.map(ext => (
                      <span key={ext} className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1">
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <p className="text-xs font-semibold text-slate-700 uppercase mb-2">Import Steps</p>
                  <div className="space-y-1">
                    {pipeline.actions.map((action, aidx) => (
                      <div key={aidx} className="flex items-center gap-2 text-xs text-slate-600">
                        <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                          <span className="text-xs">{aidx + 1}</span>
                        </div>
                        <span className="capitalize">{action.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conflicts */}
                {pipeline.potential_conflicts.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded p-2">
                    <p className="text-xs font-semibold text-amber-900 mb-1">⚠️ Potential Issues</p>
                    {pipeline.potential_conflicts.map((conf, cidx) => (
                      <p key={cidx} className="text-xs text-amber-800">{conf.description}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {config.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-900">Recommendations</p>
          <ul className="space-y-1 text-sm text-blue-800">
            {config.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-2">
                <span>•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Start Import Button */}
      <Button
        onClick={() => onImportStart?.(config)}
        size="lg"
        className="w-full gap-2"
      >
        <Loader2 className="w-4 h-4" /> Configure & Start Import
      </Button>
    </div>
  );
}