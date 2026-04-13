import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertTriangle, AlertCircle, ChevronDown, ChevronUp, Eye } from 'lucide-react';

export default function DataStagingReview({ importSessionId, onCommit }) {
  const [stagingRecords, setStagingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [selected, setSelected] = useState(new Set());
  const [committing, setCommitting] = useState(false);

  useEffect(() => {
    fetchStagingRecords();
  }, [importSessionId]);

  const fetchStagingRecords = async () => {
    setLoading(true);
    try {
      const records = await base44.entities.DataImportStaging.filter({ import_session_id: importSessionId });
      setStagingRecords(records);
    } finally {
      setLoading(false);
    }
  };

  const toggleRecord = (recordId) => {
    const newSelected = new Set(selected);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelected(newSelected);
  };

  const selectAllValid = () => {
    const valid = stagingRecords.filter(r => r.validation_errors?.length === 0 && r.status === 'staged');
    setSelected(new Set(valid.map(r => r.id)));
  };

  const handleCommit = async () => {
    setCommitting(true);
    try {
      const result = await base44.functions.invoke('commitStagedData', {
        import_session_id: importSessionId,
        approved_ids: Array.from(selected),
      });
      onCommit(result);
    } finally {
      setCommitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 rounded-xl p-8 text-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
        <p className="text-sm font-medium text-slate-700">Loading staged records...</p>
      </div>
    );
  }

  const validRecords = stagingRecords.filter(r => r.validation_errors?.length === 0);
  const failedRecords = stagingRecords.filter(r => r.validation_errors?.length > 0);
  const avgQuality = (stagingRecords.reduce((sum, r) => sum + (r.quality_score || 0), 0) / stagingRecords.length).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Records</p>
          <p className="text-lg font-bold text-slate-900">{stagingRecords.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Ready to Import</p>
          <p className="text-lg font-bold text-green-700">{validRecords.length}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Issues Found</p>
          <p className="text-lg font-bold text-red-700">{failedRecords.length}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Avg Quality</p>
          <p className="text-lg font-bold text-blue-700">{avgQuality}%</p>
        </div>
      </div>

      {/* Failed Records */}
      {failedRecords.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="font-semibold text-red-800">{failedRecords.length} Records with Errors</p>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {failedRecords.map(record => (
              <div key={record.id} className="bg-white rounded-lg p-3 border border-red-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-900 capitalize">{record.entity_type}</p>
                    <div className="mt-1 space-y-0.5">
                      {record.validation_errors?.map((err, i) => (
                        <p key={i} className="text-xs text-red-700">• {err}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ready Records */}
      {validRecords.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Records Ready to Import</p>
            <Button size="sm" variant="outline" onClick={selectAllValid}>
              Select All Valid
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg">
            {validRecords.map(record => {
              const isSelected = selected.has(record.id);
              const isExpanded = expanded[record.id];

              return (
                <div
                  key={record.id}
                  className={`border-b last:border-b-0 p-3 transition-all ${
                    isSelected ? 'bg-green-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div
                    onClick={() => toggleRecord(record.id)}
                    className="flex items-start gap-3 cursor-pointer"
                  >
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-green-600 border-green-600' : 'border-slate-300'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {record.entity_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Quality: {record.quality_score}%</span>
                      </div>
                      <p className="text-xs text-slate-600 truncate">
                        {record.staged_data?.name || record.staged_data?.full_name || 'Unnamed record'}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(prev => ({ ...prev, [record.id]: !isExpanded }));
                      }}
                      className="shrink-0"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 ml-8 space-y-2 text-xs">
                      {record.validation_warnings?.length > 0 && (
                        <div className="bg-yellow-50 rounded p-2 border border-yellow-200">
                          <p className="font-semibold text-yellow-800 mb-1">Warnings:</p>
                          {record.validation_warnings.map((w, i) => (
                            <p key={i} className="text-yellow-700">• {w}</p>
                          ))}
                        </div>
                      )}
                      <div className="bg-slate-100 rounded p-2">
                        <p className="font-semibold text-slate-700 mb-1">Data Preview:</p>
                        <pre className="overflow-x-auto text-slate-600">
                          {JSON.stringify(record.staged_data, null, 2).substring(0, 200)}...
                        </pre>
                      </div>
                      {record.cleansing_applied?.length > 0 && (
                        <div className="bg-blue-50 rounded p-2 border border-blue-200">
                          <p className="font-semibold text-blue-800 mb-1">Cleansing Applied ({record.cleansing_applied.length}):</p>
                          {record.cleansing_applied.slice(0, 3).map((c, i) => (
                            <p key={i} className="text-blue-700 text-xs">
                              {c.field}: "{c.original_value}" → "{c.cleansed_value}"
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex gap-3 pt-4 border-t">
        <Button variant="outline" onClick={fetchStagingRecords} className="flex-1">
          ↻ Refresh
        </Button>
        <Button
          onClick={handleCommit}
          disabled={selected.size === 0 || committing}
          className="flex-1 gap-2"
        >
          {committing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Committing...</>
          ) : (
            <><CheckCircle2 className="w-4 h-4" /> Commit {selected.size} Records</>
          )}
        </Button>
      </div>
    </div>
  );
}