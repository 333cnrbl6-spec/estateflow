import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { COILegalBadge } from '@/components/relationship/COILegalSeverityPanel';
import { useState, useMemo } from 'react';
import COILegalSeverityPanel from '@/components/relationship/COILegalSeverityPanel';

const RELATIONSHIP_LABELS = {
  director_of: 'Director of',
  psc_of: 'PSC / Beneficial Owner of',
  owns_freehold: 'Owns Freehold of',
  holds_leasehold: 'Holds Leasehold of',
  manages_block: 'Manages Block',
  collects_ground_rent: 'Collects Ground Rent for',
  letting_agent_for: 'Letting Agent for',
  rtm_company_for: 'RTM Company for',
  tenant_of: 'Tenant of',
  beneficial_owner_of: 'Beneficial Owner of',
  shareholder_of: 'Shareholder of',
  secretary_of: 'Secretary of',
};

export default function RelationshipNodePanel({ relationships, selectedNodeId, onClose }) {
  const [legalPanel, setLegalPanel] = useState(null);

  // Memoize relationship lookups to prevent N+1 scans when switching nodes
  const nodeRels = useMemo(
    () => selectedNodeId ? relationships.filter(
      r => r.from_entity_id === selectedNodeId || r.to_entity_id === selectedNodeId
    ) : [],
    [selectedNodeId, relationships]
  );

  if (!selectedNodeId) return null;

  const nodeLabel = nodeRels[0]?.from_entity_id === selectedNodeId
    ? nodeRels[0]?.from_label
    : nodeRels[0]?.to_label;

  const nodeType = nodeRels[0]?.from_entity_id === selectedNodeId
    ? nodeRels[0]?.from_entity_type
    : nodeRels[0]?.to_entity_type;

  const outgoing = nodeRels.filter(r => r.from_entity_id === selectedNodeId);
  const incoming = nodeRels.filter(r => r.to_entity_id === selectedNodeId);
  const conflicts = nodeRels.filter(r => r.conflict_of_interest);

  return (
    <div className="border rounded-xl bg-white shadow-sm p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-sm">{nodeLabel}</div>
          <div className="text-xs text-muted-foreground capitalize">{nodeType}</div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
          <X className="w-3 h-3" />
        </Button>
      </div>

      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700 space-y-2">
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium">Conflict of interest</div>
              {conflicts.map((c, i) => <div key={i} className="opacity-80 mt-0.5">{c.conflict_description}</div>)}
            </div>
          </div>
          {conflicts.filter(c => c.coi_pattern).map((c, i) => (
            <COILegalBadge
              key={i}
              coiPattern={c.coi_pattern}
              onClick={() => setLegalPanel({ pattern: c.coi_pattern, fromLabel: c.from_label, toLabel: c.to_label })}
            />
          ))}
        </div>
      )}

      {outgoing.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Outgoing Relationships</div>
          <div className="space-y-1.5">
            {outgoing.map(r => (
              <div key={r.id} className="flex items-center justify-between text-xs bg-muted/40 rounded-lg px-2 py-1.5">
                <span className="text-muted-foreground">{RELATIONSHIP_LABELS[r.relationship_type] || r.relationship_type}</span>
                <span className="font-medium ml-2 truncate max-w-[120px]">{r.to_label}</span>
                {r.verified
                  ? <CheckCircle2 className="w-3 h-3 text-green-500 ml-1 shrink-0" />
                  : <span className="w-3 h-3 ml-1" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {incoming.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Incoming Relationships</div>
          <div className="space-y-1.5">
            {incoming.map(r => (
              <div key={r.id} className="flex items-center justify-between text-xs bg-muted/40 rounded-lg px-2 py-1.5">
                <span className="font-medium truncate max-w-[120px]">{r.from_label}</span>
                <span className="text-muted-foreground mx-1">{RELATIONSHIP_LABELS[r.relationship_type] || r.relationship_type}</span>
                {r.verified
                  ? <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                  : <span className="w-3 h-3" />}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1 flex-wrap">
        <Badge variant="outline" className="text-[10px]">
          {nodeRels.length} relationship{nodeRels.length !== 1 ? 's' : ''}
        </Badge>
        {conflicts.length > 0 && (
          <Badge className="text-[10px] bg-red-100 text-red-700 border-red-200">
            {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

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