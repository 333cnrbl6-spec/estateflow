import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, GitBranch, AlertTriangle, CheckCircle2, Trash2, Network } from 'lucide-react';
import RelationshipChainGraph from '@/components/relationship/RelationshipChainGraph';
import AddRelationshipDialog from '@/components/relationship/AddRelationshipDialog';
import RelationshipNodePanel from '@/components/relationship/RelationshipNodePanel';

export default function RelationshipIntelligence() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const { data: relationships = [], isLoading } = useQuery({
    queryKey: ['ownership_relationships'],
    queryFn: () => base44.entities.OwnershipRelationship.list('-created_date', 200),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list(),
  });

  // Filter by search
  const filtered = search
    ? relationships.filter(r =>
        r.from_label?.toLowerCase().includes(search.toLowerCase()) ||
        r.to_label?.toLowerCase().includes(search.toLowerCase())
      )
    : relationships;

  // Stats
  const conflicts = relationships.filter(r => r.conflict_of_interest);
  const verified = relationships.filter(r => r.verified);

  // Unique node IDs for counting
  const uniqueNodes = new Set([
    ...relationships.map(r => r.from_entity_id),
    ...relationships.map(r => r.to_entity_id),
  ]);

  const handleDelete = async (id) => {
    await base44.entities.OwnershipRelationship.delete(id);
    queryClient.invalidateQueries({ queryKey: ['ownership_relationships'] });
    setSelectedNodeId(null);
  };

  const selectedRelationships = selectedNodeId
    ? relationships.filter(r => r.from_entity_id === selectedNodeId || r.to_entity_id === selectedNodeId)
    : [];

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Relationship Intelligence</h1>
            <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
              Unique to Premiso
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Map the full ownership chain — from beneficial owner to freeholder, managing agent, leaseholder, letting agent, and tenant. 
            Automatically surface conflicts of interest, dual roles, and beneficial ownership loops.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Relationship
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold text-foreground">{uniqueNodes.size}</div>
            <div className="text-xs text-muted-foreground">Entities mapped</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold text-foreground">{relationships.length}</div>
            <div className="text-xs text-muted-foreground">Relationships</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className={`text-2xl font-bold ${conflicts.length > 0 ? 'text-red-600' : 'text-foreground'}`}>
              {conflicts.length}
            </div>
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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by person, company, property..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Ownership & Control Chain
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">Loading relationships...</div>
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
                Click any node in the chain to see its relationships and flags
              </CardContent>
            </Card>
          )}

          {/* Conflict Summary */}
          {conflicts.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm text-red-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Conflicts Detected
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {conflicts.map(c => (
                  <div key={c.id} className="text-xs text-red-700 bg-white border border-red-200 rounded-lg p-2">
                    <div className="font-medium">{c.from_label} → {c.to_label}</div>
                    <div className="opacity-80 mt-0.5">{c.conflict_description}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Relationship Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Relationships</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No relationships found. Use "Add Relationship" to start mapping your ownership chains.
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map(rel => (
                <div key={rel.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-medium truncate">{rel.from_label}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {rel.relationship_label || rel.relationship_type?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-medium truncate">{rel.to_label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {rel.verified && (
                      <Badge variant="outline" className="text-[10px] text-green-700 border-green-200 bg-green-50">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {rel.conflict_of_interest && (
                      <Badge className="text-[10px] bg-red-100 text-red-700 border-red-200">
                        <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                        Conflict
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] capitalize">{rel.source}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(rel.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddRelationshipDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['ownership_relationships'] })}
      />
    </div>
  );
}