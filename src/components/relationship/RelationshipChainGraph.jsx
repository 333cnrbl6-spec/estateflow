import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Building2, User, Home, KeyRound, ArrowRight } from 'lucide-react';

const NODE_COLORS = {
  person: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', icon: User },
  company: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800', icon: Building2 },
  property: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800', icon: Home },
  unit: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', icon: KeyRound },
};

const EDGE_COLORS = {
  director_of: 'text-purple-600',
  psc_of: 'text-purple-700',
  owns_freehold: 'text-green-700',
  holds_leasehold: 'text-amber-700',
  manages_block: 'text-blue-600',
  collects_ground_rent: 'text-orange-600',
  letting_agent_for: 'text-teal-600',
  rtm_company_for: 'text-rose-600',
  tenant_of: 'text-gray-600',
  beneficial_owner_of: 'text-indigo-700',
  shareholder_of: 'text-indigo-600',
  secretary_of: 'text-slate-600',
};

function RelationshipNode({ label, entityType, isConflict, onClick, selected }) {
  const style = NODE_COLORS[entityType] || NODE_COLORS.company;
  const Icon = style.icon;

  return (
    <div
      onClick={onClick}
      className={`
        relative cursor-pointer rounded-xl border-2 px-4 py-3 min-w-[160px] max-w-[200px] text-center transition-all
        ${style.bg} ${style.border} ${style.text}
        ${selected ? 'ring-2 ring-offset-2 ring-primary shadow-lg scale-105' : 'hover:shadow-md hover:scale-102'}
      `}
    >
      {isConflict && (
        <div className="absolute -top-2 -right-2">
          <AlertTriangle className="w-4 h-4 text-red-500 bg-white rounded-full" />
        </div>
      )}
      <Icon className="w-5 h-5 mx-auto mb-1 opacity-70" />
      <div className="text-xs font-semibold leading-tight">{label}</div>
      <div className="text-[10px] opacity-60 mt-0.5 capitalize">{entityType}</div>
    </div>
  );
}

function RelationshipEdge({ label, type, isConflict }) {
  const colorClass = EDGE_COLORS[type] || 'text-gray-500';
  return (
    <div className="flex flex-col items-center justify-center px-2 min-w-[120px]">
      <div className={`text-[10px] font-medium ${colorClass} text-center leading-tight mb-1`}>{label}</div>
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <div className="h-px w-12 bg-current opacity-40" />
        <ArrowRight className="w-3 h-3" />
      </div>
      {isConflict && (
        <div className="text-[9px] text-red-500 font-medium mt-0.5 flex items-center gap-0.5">
          <AlertTriangle className="w-2.5 h-2.5" /> Conflict
        </div>
      )}
    </div>
  );
}

export default function RelationshipChainGraph({ relationships, onNodeClick, selectedNodeId }) {
  // Build a simple layered chain — group by "from" to find roots and build levels
  const { nodes, edges, conflicts } = useMemo(() => {
    if (!relationships?.length) return { nodes: [], edges: [], conflicts: [] };

    const nodeMap = {};
    const edgeList = [];
    const conflictList = [];

    relationships.forEach(rel => {
      if (!nodeMap[rel.from_entity_id]) {
        nodeMap[rel.from_entity_id] = {
          id: rel.from_entity_id,
          label: rel.from_label,
          type: rel.from_entity_type,
          isConflict: false,
        };
      }
      if (!nodeMap[rel.to_entity_id]) {
        nodeMap[rel.to_entity_id] = {
          id: rel.to_entity_id,
          label: rel.to_label,
          type: rel.to_entity_type,
          isConflict: false,
        };
      }
      if (rel.conflict_of_interest) {
        nodeMap[rel.from_entity_id].isConflict = true;
        nodeMap[rel.to_entity_id].isConflict = true;
        conflictList.push(rel);
      }
      edgeList.push(rel);
    });

    return {
      nodes: Object.values(nodeMap),
      edges: edgeList,
      conflicts: conflictList,
    };
  }, [relationships]);

  // Build ordered chain: find nodes that appear only as "from" (roots)
  const chainSegments = useMemo(() => {
    // Simple linear chain rendering — pair each edge as a segment
    return edges.map(edge => ({
      from: { id: edge.from_entity_id, label: edge.from_label, type: edge.from_entity_type, isConflict: edge.conflict_of_interest },
      edge: { label: edge.relationship_label || edge.relationship_type.replace(/_/g, ' '), type: edge.relationship_type, isConflict: edge.conflict_of_interest },
      to: { id: edge.to_entity_id, label: edge.to_label, type: edge.to_entity_type, isConflict: edge.conflict_of_interest },
      id: edge.id,
    }));
  }, [edges]);

  if (!relationships?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No relationships mapped yet. Add relationships to visualise the ownership chain.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conflicts.length > 0 && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold">{conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} of interest detected</span>
            {conflicts.map(c => (
              <div key={c.id} className="text-xs mt-0.5 opacity-80">{c.conflict_description}</div>
            ))}
          </div>
        </div>
      )}

      {/* Chain visualisation — horizontal scroll */}
      <div className="overflow-x-auto pb-4">
        <div className="flex flex-col gap-6 min-w-max">
          {chainSegments.map((seg, i) => (
            <div key={seg.id || i} className="flex items-center gap-1">
              <RelationshipNode
                label={seg.from.label}
                entityType={seg.from.type}
                isConflict={seg.from.isConflict}
                selected={selectedNodeId === seg.from.id}
                onClick={() => onNodeClick?.(seg.from.id)}
              />
              <RelationshipEdge
                label={seg.edge.label}
                type={seg.edge.type}
                isConflict={seg.edge.isConflict}
              />
              <RelationshipNode
                label={seg.to.label}
                entityType={seg.to.type}
                isConflict={seg.to.isConflict}
                selected={selectedNodeId === seg.to.id}
                onClick={() => onNodeClick?.(seg.to.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-2 border-t">
        {Object.entries(NODE_COLORS).map(([type, style]) => {
          const Icon = style.icon;
          return (
            <div key={type} className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs ${style.bg} ${style.border} ${style.text}`}>
              <Icon className="w-3 h-3" />
              <span className="capitalize">{type}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs bg-red-50 border-red-200 text-red-700">
          <AlertTriangle className="w-3 h-3" />
          <span>Conflict of interest</span>
        </div>
      </div>
    </div>
  );
}