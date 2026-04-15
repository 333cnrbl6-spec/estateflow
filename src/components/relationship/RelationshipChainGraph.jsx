import { useMemo } from 'react';
import { AlertTriangle, Building2, User, Home, KeyRound, ArrowRight, ShieldAlert, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const NODE_STYLES = {
  person:   { bg: 'bg-blue-50',   border: 'border-blue-300',   text: 'text-blue-800',   icon: User },
  company:  { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800', icon: Building2 },
  property: { bg: 'bg-green-50',  border: 'border-green-300',  text: 'text-green-800',  icon: Home },
  unit:     { bg: 'bg-amber-50',  border: 'border-amber-300',  text: 'text-amber-800',  icon: KeyRound },
};

const EDGE_COLORS = {
  director_of:               'text-purple-600',
  psc_of:                    'text-purple-700',
  owns_freehold:             'text-green-700',
  holds_leasehold:           'text-amber-700',
  manages_block:             'text-blue-600',
  collects_ground_rent:      'text-orange-600',
  letting_agent_for:         'text-teal-600',
  rtm_company_for:           'text-rose-600',
  tenant_of:                 'text-gray-600',
  beneficial_owner_of:       'text-indigo-700',
  shareholder_of:            'text-indigo-600',
  secretary_of:              'text-slate-600',
  service_charge_vehicle_for:'text-orange-700',
  nominee_director_of:       'text-gray-500',
  offshore_owner_of:         'text-red-700',
  ground_rent_fund_for:      'text-orange-800',
};

function GraphNode({ node, selected, onClick }) {
  const style = NODE_STYLES[node.type] || NODE_STYLES.company;
  const Icon = style.icon;
  return (
    <div
      onClick={() => onClick?.(node.id)}
      className={`
        relative cursor-pointer rounded-xl border-2 px-3 py-2.5 text-center transition-all select-none
        min-w-[140px] max-w-[180px]
        ${style.bg} ${style.border} ${style.text}
        ${selected ? 'ring-2 ring-offset-2 ring-primary shadow-lg scale-105' : 'hover:shadow-md hover:scale-[1.02]'}
        ${node.isConflict ? 'border-red-400 shadow-red-100' : ''}
      `}
    >
      {node.isConflict && (
        <div className="absolute -top-2 -right-2 bg-white rounded-full">
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
      )}
      {node.control_type === 'nominee' && (
        <div className="absolute -top-2 -left-2 bg-white rounded-full">
          <ShieldAlert className="w-4 h-4 text-gray-400" title="Nominee" />
        </div>
      )}
      {node.verified && (
        <div className="absolute -bottom-2 -right-2 bg-white rounded-full">
          <Shield className="w-3.5 h-3.5 text-green-500" title="Verified" />
        </div>
      )}
      <Icon className="w-4 h-4 mx-auto mb-1 opacity-60" />
      <div className="text-[11px] font-semibold leading-tight">{node.label}</div>
      <div className="text-[9px] opacity-50 mt-0.5 capitalize">{node.type}</div>
    </div>
  );
}

function GraphEdge({ rel }) {
  const colorClass = EDGE_COLORS[rel.relationship_type] || 'text-gray-500';
  const label = rel.relationship_label || rel.relationship_type?.replace(/_/g, ' ');
  return (
    <div className="flex flex-col items-center justify-center px-1 shrink-0">
      <div className={`text-[9px] font-medium ${colorClass} text-center leading-tight mb-0.5 max-w-[100px]`}>{label}</div>
      <div className={`flex items-center gap-0.5 ${colorClass}`}>
        <div className="h-px w-10 bg-current opacity-30" />
        <ArrowRight className="w-3 h-3" />
      </div>
      {rel.conflict_of_interest && (
        <div className="text-[8px] text-red-500 font-medium mt-0.5 flex items-center gap-0.5">
          <AlertTriangle className="w-2 h-2" /> COI
        </div>
      )}
      {rel.date_from && (
        <div className="text-[8px] text-muted-foreground mt-0.5">{rel.date_from?.slice(0,7)}</div>
      )}
    </div>
  );
}

export default function RelationshipChainGraph({ relationships, onNodeClick, selectedNodeId }) {
  // Build deduplicated node map and edge list
  const { nodeMap, edges } = useMemo(() => {
    const nodeMap = {};
    const edges = [];

    (relationships || []).forEach(rel => {
      if (!nodeMap[rel.from_entity_id]) {
        nodeMap[rel.from_entity_id] = {
          id: rel.from_entity_id,
          label: rel.from_label,
          type: rel.from_entity_type,
          isConflict: false,
          verified: rel.verified,
          control_type: rel.control_type,
        };
      }
      if (!nodeMap[rel.to_entity_id]) {
        nodeMap[rel.to_entity_id] = {
          id: rel.to_entity_id,
          label: rel.to_label,
          type: rel.to_entity_type,
          isConflict: false,
          verified: rel.verified,
          control_type: rel.control_type,
        };
      }
      if (rel.conflict_of_interest) {
        nodeMap[rel.from_entity_id].isConflict = true;
        nodeMap[rel.to_entity_id].isConflict = true;
      }
      edges.push(rel);
    });

    return { nodeMap, edges };
  }, [relationships]);

  // Build chains: group edges by scenario_tag so each scenario renders as its own chain
  const scenarioGroups = useMemo(() => {
    const groups = {};
    edges.forEach(rel => {
      const tag = rel.scenario_tag || 'other';
      if (!groups[tag]) groups[tag] = [];
      groups[tag].push(rel);
    });
    return groups;
  }, [edges]);

  if (!relationships?.length) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        No relationships mapped yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(scenarioGroups).map(([tag, rels]) => {
        const conflicts = rels.filter(r => r.conflict_of_interest);
        return (
          <div key={tag} className="space-y-2">
            {/* Scenario header */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {tag.replace(/_/g, ' ')}
              </span>
              <div className="h-px flex-1 bg-border" />
              {conflicts.length > 0 && (
                <Badge className="text-[9px] bg-red-100 text-red-700 border-red-200 h-4">
                  {conflicts.length} COI
                </Badge>
              )}
              <Badge variant="outline" className="text-[9px] h-4">{rels.length} links</Badge>
            </div>

            {/* Chain rows */}
            <div className="overflow-x-auto pb-2">
              <div className="flex flex-col gap-3 min-w-max pl-1">
                {rels.map((rel, i) => (
                  <div key={rel.id || i} className="flex items-center gap-0.5">
                    <GraphNode
                      node={nodeMap[rel.from_entity_id] || { id: rel.from_entity_id, label: rel.from_label, type: rel.from_entity_type }}
                      selected={selectedNodeId === rel.from_entity_id}
                      onClick={onNodeClick}
                    />
                    <GraphEdge rel={rel} />
                    <GraphNode
                      node={nodeMap[rel.to_entity_id] || { id: rel.to_entity_id, label: rel.to_label, type: rel.to_entity_type }}
                      selected={selectedNodeId === rel.to_entity_id}
                      onClick={onNodeClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex flex-wrap gap-2 pt-3 border-t">
        {Object.entries(NODE_STYLES).map(([type, style]) => {
          const Icon = style.icon;
          return (
            <div key={type} className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] ${style.bg} ${style.border} ${style.text}`}>
              <Icon className="w-2.5 h-2.5" /><span className="capitalize">{type}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] bg-red-50 border-red-200 text-red-700">
          <AlertTriangle className="w-2.5 h-2.5" /><span>Conflict</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] bg-gray-50 border-gray-200 text-gray-600">
          <ShieldAlert className="w-2.5 h-2.5" /><span>Nominee</span>
        </div>
      </div>
    </div>
  );
}