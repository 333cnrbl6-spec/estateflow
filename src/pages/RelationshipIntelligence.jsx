import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Plus, Search, GitBranch, AlertTriangle, CheckCircle2,
  Network, Loader2, Zap, ShieldAlert, Shield
} from 'lucide-react';
import RelationshipChainGraph from '@/components/relationship/RelationshipChainGraph';
import AddRelationshipDialog from '@/components/relationship/AddRelationshipDialog';
import RelationshipNodePanel from '@/components/relationship/RelationshipNodePanel';
import COILegalSeverityPanel, { COILegalBadge } from '@/components/relationship/COILegalSeverityPanel';

const SCENARIO_META = {
  reed_close_farnworth:     { label: 'Reed Close, Farnworth',      color: 'bg-blue-100 text-blue-800 border-blue-200',   desc: 'RTM + self-dealing letting agent' },
  adriatic_offshore:        { label: 'Adriatic / Offshore',         color: 'bg-red-100 text-red-800 border-red-200',      desc: 'Offshore freehold chain, no PSC' },
  service_charge_vehicle:   { label: 'Service Charge Vehicle',      color: 'bg-orange-100 text-orange-800 border-orange-200', desc: 'Shared directors extracting fees' },
  nominee_director_web:     { label: 'Nominee Director Web',        color: 'bg-gray-100 text-gray-700 border-gray-200',   desc: 'Duport — 17,054 appointments' },
  other:                    { label: 'Other / Untagged',             color: 'bg-slate-100 text-slate-600 border-slate-200', desc: 'Manually added relationships' },
};

const COI_SEVERITY = {
  CRITICAL: 'bg-red-600 text-white',
  HIGH:     'bg-orange-500 text-white',
  MEDIUM:   'bg-yellow-500 text-white',
};

export default function RelationshipIntelligence() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [legalPanel, setLegalPanel] = useState(null); // { pattern, fromLabel, toLabel }

  const { data: relationships = [], isLoading } = useQuery({
    queryKey: ['ownership_relationships'],
    queryFn: () => base44.entities.OwnershipRelationship.list('-created_date', 500),
  });

  // Cleanup subscriptions on unmount to prevent memory leaks
  useEffect(() => {
    const unsubscribe = base44.entities.OwnershipRelationship.subscribe((event) => {
      // Real-time updates would be handled here if needed
      queryClient.invalidateQueries({ queryKey: ['ownership_relationships'] });
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [queryClient]);

  // Derived stats
  const conflicts = relationships.filter(r => r.conflict_of_interest);
  const verified = relationships.filter(r => r.verified);
  const uniqueNodes = new Set([
    ...relationships.map(r => r.from_entity_id),
    ...relationships.map(r => r.to_entity_id),
  ]);

  // Scenarios present in data
  const scenariosInData = [...new Set(relationships.map(r => r.scenario_tag || 'other'))];

  // Filter by tab + search
  const filtered = relationships.filter(r => {
    const tag = r.scenario_tag || 'other';
    const matchesTab = activeTab === 'all' || activeTab === 'conflicts'
      ? (activeTab === 'conflicts' ? r.conflict_of_interest : true)
      : tag === activeTab;
    const matchesSearch = !search || [r.from_label, r.to_label, r.relationship_label, r.conflict_description || '']
      .some(v => v?.toLowerCase?.()?.includes(search.toLowerCase?.()) || false);
    return matchesTab && matchesSearch;
  });

  const runScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await base44.functions.invoke('detectConflictsOfInterest', { action: 'fix', dry_run: false });
      setScanResult(res.data || res);
      await queryClient.invalidateQueries({ queryKey: ['ownership_relationships'] });
    } catch (err) {
      setScanResult({ error: err.message, scan_stats: {} });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Relationship Intelligence</h1>
            <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
              Unique to Premiso
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Map beneficial ownership chains, detect conflicts of interest, and surface hidden control patterns across your portfolio.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={runScan}
            disabled={scanning}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            {scanning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
            {scanning ? 'Scanning...' : 'Run COI Scan'}
          </Button>
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Relationship
          </Button>
        </div>
      </div>

      {/* Scan result banner */}
      {scanResult && (
        <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${scanResult.scan_stats?.total_findings > 0 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
          {scanResult.scan_stats?.total_findings > 0
            ? <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            : <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
          <div>
            <div className="font-semibold">
              {scanResult.scan_stats?.total_findings > 0
                ? `${scanResult.scan_stats.total_findings} conflicts detected — ${scanResult.scan_stats.updates_applied} records updated`
                : 'No conflicts found — all relationships clean'}
            </div>
            <div className="text-xs mt-1 opacity-80">
              {scanResult.scan_stats?.by_severity && Object.entries(scanResult.scan_stats.by_severity)
                .filter(([, v]) => v > 0)
                .map(([k, v]) => `${v} ${k}`)
                .join(' · ')}
            </div>
          </div>
          <button onClick={() => setScanResult(null)} className="ml-auto text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold">{uniqueNodes.size}</div>
            <div className="text-xs text-muted-foreground">Entities mapped</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold">{relationships.length}</div>
            <div className="text-xs text-muted-foreground">Relationships</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className={`text-2xl font-bold ${conflicts.length > 0 ? 'text-red-600' : ''}`}>{conflicts.length}</div>
            <div className="text-xs text-muted-foreground">Conflicts of interest</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold text-green-600">{verified.length}</div>
            <div className="text-xs text-muted-foreground">Verified via public registry</div>
          </CardContent>
        </Card>
      </div>

      {/* COI Cards */}
      {conflicts.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Active Conflicts of Interest</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {conflicts.slice(0, 6).map(c => (
              <div key={c.id} className="border border-red-200 bg-red-50 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="text-xs font-semibold text-red-800 leading-tight">{c.coi_pattern?.replace(/_/g, ' ') || 'conflict detected'}</span>
                  {c.risk_score && (
                    <Badge className={`ml-auto text-[9px] ${c.risk_score >= 80 ? COI_SEVERITY.CRITICAL : c.risk_score >= 50 ? COI_SEVERITY.HIGH : COI_SEVERITY.MEDIUM}`}>
                      Risk {c.risk_score}
                    </Badge>
                  )}
                </div>
                <div className="text-[11px] text-red-700 leading-snug">
                  <span className="font-medium">{c.from_label}</span>
                  <span className="opacity-70 mx-1">→</span>
                  <span className="font-medium">{c.to_label}</span>
                </div>
                {c.conflict_description && (
                  <div className="text-[10px] text-red-600 opacity-80 line-clamp-2">{c.conflict_description}</div>
                )}
                <div className="flex gap-1 flex-wrap items-center">
                  {c.auto_detected_coi && <Badge variant="outline" className="text-[9px] border-red-200 text-red-600">Auto-detected</Badge>}
                  {c.verified && <Badge variant="outline" className="text-[9px] border-green-200 text-green-700">Verified</Badge>}
                  {c.scenario_tag && (
                    <Badge variant="outline" className={`text-[9px] ${SCENARIO_META[c.scenario_tag]?.color || ''}`}>
                      {SCENARIO_META[c.scenario_tag]?.label || c.scenario_tag}
                    </Badge>
                  )}
                  {c.coi_pattern && (
                    <COILegalBadge
                      coiPattern={c.coi_pattern}
                      onClick={() => setLegalPanel({ pattern: c.coi_pattern, fromLabel: c.from_label, toLabel: c.to_label })}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name, company..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Tabs + Graph */}
      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setSelectedNodeId(null); }}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All ({relationships.length})</TabsTrigger>
          <TabsTrigger value="conflicts" className="text-red-700 data-[state=active]:bg-red-100">
            Conflicts ({conflicts.length})
          </TabsTrigger>
          {scenariosInData.map(tag => {
            const meta = SCENARIO_META[tag] || { label: tag };
            const count = relationships.filter(r => (r.scenario_tag || 'other') === tag).length;
            return (
              <TabsTrigger key={tag} value={tag}>
                {meta.label} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Scenario description */}
        {activeTab !== 'all' && activeTab !== 'conflicts' && SCENARIO_META[activeTab] && (
          <div className={`mt-2 px-3 py-1.5 rounded-lg border text-xs ${SCENARIO_META[activeTab].color}`}>
            {SCENARIO_META[activeTab].desc}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Graph */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Ownership & Control Chain
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-16 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading relationships...
                  </div>
                ) : (
                  <RelationshipChainGraph
                    relationships={filtered}
                    onNodeClick={setSelectedNodeId}
                    selectedNodeId={selectedNodeId}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            {selectedNodeId ? (
              <RelationshipNodePanel
                relationships={relationships}
                selectedNodeId={selectedNodeId}
                onClose={() => setSelectedNodeId(null)}
              />
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-6 pb-6 text-center text-xs text-muted-foreground">
                  Click any node to see its full connection profile
                </CardContent>
              </Card>
            )}

            {/* Scenario guide */}
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">Scenarios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(SCENARIO_META).map(([tag, meta]) => {
                  const count = relationships.filter(r => (r.scenario_tag || 'other') === tag).length;
                  if (count === 0) return null;
                  const coiCount = conflicts.filter(r => (r.scenario_tag || 'other') === tag).length;
                  return (
                    <button
                      key={tag}
                      onClick={() => setActiveTab(tag)}
                      className={`w-full text-left rounded-lg border px-3 py-2 text-[11px] transition-all hover:shadow-sm ${meta.color} ${activeTab === tag ? 'ring-2 ring-primary/40' : ''}`}
                    >
                      <div className="font-semibold">{meta.label}</div>
                      <div className="opacity-70">{meta.desc}</div>
                      <div className="mt-1 flex gap-2">
                        <span>{count} links</span>
                        {coiCount > 0 && <span className="text-red-700 font-medium">· {coiCount} COI</span>}
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>

      <AddRelationshipDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['ownership_relationships'] })}
      />

      {legalPanel && (
        <COILegalSeverityPanel
          open={!!legalPanel}
          onClose={() => setLegalPanel(null)}
          coiPattern={legalPanel.pattern}
          fromLabel={legalPanel.fromLabel}
          toLabel={legalPanel.toLabel}
        />
      )}
    </div>
  );
}