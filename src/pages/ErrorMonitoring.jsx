import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle, Trash2, CheckCircle2, Filter, AlertCircle,
  Clock, Mail, Code, Eye, EyeOff
} from 'lucide-react';
import { format } from 'date-fns';

export default function ErrorMonitoring() {
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const { data: errors = [], refetch } = useQuery({
    queryKey: ['errorLogs', filterSeverity, filterStatus],
    queryFn: async () => {
      let all = await base44.entities.ErrorLog.list('-timestamp', 200);
      
      if (filterSeverity !== 'all') {
        all = all.filter(e => e.severity === filterSeverity);
      }
      if (filterStatus !== 'all') {
        all = all.filter(e => e.status === filterStatus);
      }
      return all;
    }
  });

  const handleResolve = async (error) => {
    await base44.entities.ErrorLog.update(error.id, { status: 'resolved' });
    refetch();
  };

  const handleIgnore = async (error) => {
    await base44.entities.ErrorLog.update(error.id, { status: 'ignored' });
    refetch();
  };

  const handleDelete = async (error) => {
    if (confirm(`Delete error "${error.message.substring(0, 50)}..."?`)) {
      await base44.entities.ErrorLog.delete(error.id);
      refetch();
    }
  };

  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    error: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    warning: 'bg-blue-100 text-blue-800 border-blue-300',
    info: 'bg-slate-100 text-slate-800 border-slate-300'
  };

  const statusColors = {
    new: 'bg-blue-50 border-blue-200',
    reviewed: 'bg-slate-50 border-slate-200',
    resolved: 'bg-green-50 border-green-200',
    ignored: 'bg-gray-50 border-gray-200'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      <div className="p-8 max-w-[1400px] mx-auto">
        <PageHeader
          title="Error Monitoring"
          subtitle="Track, analyze, and resolve application errors in real-time"
          icon={AlertTriangle}
        />

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              <Filter className="w-3.5 h-3.5 inline mr-1" />
              Severity
            </label>
            <select
              value={filterSeverity}
              onChange={e => setFilterSeverity(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="ignored">Ignored</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button onClick={() => refetch()} variant="outline" className="w-full">
              Refresh
            </Button>
          </div>
        </div>

        {/* Error list */}
        <div className="space-y-3">
          {errors.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-lg font-semibold text-foreground mb-1">No errors found</p>
              <p className="text-sm text-muted-foreground">Your application is running smoothly</p>
            </div>
          ) : (
            errors.map(error => (
              <div
                key={error.id}
                className={`border rounded-lg p-4 transition-all ${statusColors[error.status]}`}
              >
                <div className="flex items-start gap-4">
                  {/* Severity badge */}
                  <div className="shrink-0">
                    <span className={`inline-block px-2.5 py-1 rounded text-xs font-semibold border ${severityColors[error.severity]}`}>
                      {error.severity}
                    </span>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{error.message}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {error.error_type.replace(/_/g, ' ')} • {format(new Date(error.timestamp), 'dd MMM yyyy HH:mm:ss')}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
                        error.status === 'new' ? 'bg-blue-100 text-blue-700' :
                        error.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        error.status === 'ignored' ? 'bg-gray-100 text-gray-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {error.status}
                      </span>
                    </div>

                    {/* User & URL */}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                      {error.user_email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {error.user_email}
                        </div>
                      )}
                      {error.url && (
                        <div className="flex items-center gap-1 truncate">
                          <Code className="w-3 h-3 shrink-0" />
                          <span className="truncate">{new URL(error.url).pathname}</span>
                        </div>
                      )}
                      {error.timestamp && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(error.timestamp), 'HH:mm:ss')}
                        </div>
                      )}
                    </div>

                    {/* Stack trace - expandable */}
                    {error.stack_trace && (
                      <div>
                        <button
                          onClick={() => setExpandedId(expandedId === error.id ? null : error.id)}
                          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 mb-2"
                        >
                          {expandedId === error.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {expandedId === error.id ? 'Hide' : 'Show'} Stack Trace
                        </button>
                        {expandedId === error.id && (
                          <pre className="bg-slate-900 text-slate-100 p-3 rounded text-xs overflow-x-auto max-h-64 overflow-y-auto">
                            {error.stack_trace}
                          </pre>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {error.notes && (
                      <div className="text-xs bg-white/50 rounded p-2 mt-3 text-foreground">
                        <p className="font-medium mb-1">Notes:</p>
                        <pre className="whitespace-pre-wrap overflow-x-auto">{error.notes}</pre>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {error.status === 'new' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolve(error)}
                        title="Mark as resolved"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {error.status !== 'ignored' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleIgnore(error)}
                        title="Ignore this error"
                      >
                        <Eye className="w-3.5 h-3.5 opacity-50" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(error)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete error"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}