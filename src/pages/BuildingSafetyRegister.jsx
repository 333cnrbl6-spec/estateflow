import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertCircle, Plus, Edit2, Trash2, Shield } from 'lucide-react';
import EntityFormDialog from '@/components/shared/EntityFormDialog';

export default function BuildingSafetyRegister() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const queryClient = useQueryClient();

  const { data: buildingSafety, isLoading } = useQuery({
    queryKey: ['buildingSafety'],
    queryFn: () => base44.entities.BuildingSafety.list(),
    initialData: [],
  });

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BuildingSafety.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildingSafety'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BuildingSafety.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildingSafety'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BuildingSafety.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildingSafety'] });
    },
  });

  const filtered = buildingSafety.filter((bs) => {
    const property = properties.find(p => p.id === bs.property_id);
    const matchesSearch = !search || property?.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'hrrb' && bs.building_classification?.in_scope_building_safety_act) ||
      (filter === 'no_accountable' && !bs.accountable_person?.appointed);
    return matchesSearch && matchesFilter;
  });

  const getComplianceStatus = (bs) => {
    const issues = [];
    
    if (bs.building_classification?.in_scope_building_safety_act && !bs.accountable_person?.appointed) {
      issues.push('No Accountable Person');
    }
    
    if (!bs.responsible_person?.appointed) {
      issues.push('No Responsible Person');
    }

    if (!bs.fire_safety?.fire_risk_assessment?.last_assessment_date) {
      issues.push('No Fire Assessment');
    }

    if (bs.structural_safety?.structural_defect_register?.some(d => !d.completed)) {
      issues.push('Unresolved Defects');
    }

    return issues;
  };

  return (
    <div className="min-h-screen bg-background space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Building Safety Register</h1>
          <p className="text-muted-foreground mt-1">Building Safety Act 2023 & Fire Safety Act 2021</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Record
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search by property..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md text-sm bg-background"
        >
          <option value="all">All buildings</option>
          <option value="hrrb">High-Rise Residential Buildings (7+ storeys)</option>
          <option value="no_accountable">Missing Accountable Person</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Buildings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buildingSafety.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">HRRB (7+ storeys)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {buildingSafety.filter(bs => bs.building_classification?.in_scope_building_safety_act).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Missing Accountable Person</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {buildingSafety.filter(bs => bs.building_classification?.in_scope_building_safety_act && !bs.accountable_person?.appointed).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {filtered.filter(bs => getComplianceStatus(bs).length > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading building safety records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-muted/20">
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No building safety records found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filtered.map((bs) => {
            const property = properties.find(p => p.id === bs.property_id);
            const issues = getComplianceStatus(bs);
            const isHRRB = bs.building_classification?.in_scope_building_safety_act;

            return (
              <Card key={bs.id} className={`hover:shadow-lg transition-shadow ${
                issues.length > 0 ? 'border-red-200 bg-red-50/50' : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{property?.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {bs.building_classification?.storeys || '?'} storeys • {bs.building_classification?.units_count || '?'} units
                      </p>
                    </div>
                    {isHRRB && <Badge className="bg-primary/10 text-primary">HRRB Scope</Badge>}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Compliance Issues Alert */}
                  {issues.length > 0 && (
                    <div className="bg-red-100 border border-red-300 rounded-lg p-3 flex gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900">Action Required</p>
                        <ul className="text-xs text-red-800 mt-1 space-y-1">
                          {issues.map((issue, idx) => (
                            <li key={idx}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Accountable & Responsible Persons */}
                  <div className="grid grid-cols-2 gap-4 py-3 border-y">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Accountable Person</p>
                      {bs.accountable_person?.appointed ? (
                        <div>
                          <p className="text-sm font-medium text-green-700">✓ Appointed</p>
                          <p className="text-xs text-muted-foreground">{bs.accountable_person.name}</p>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-red-600">Not appointed</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Responsible Person (Fire)</p>
                      {bs.responsible_person?.appointed ? (
                        <div>
                          <p className="text-sm font-medium text-green-700">✓ Appointed</p>
                          <p className="text-xs text-muted-foreground">{bs.responsible_person.name}</p>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-red-600">Not appointed</p>
                      )}
                    </div>
                  </div>

                  {/* Fire Safety */}
                  {bs.fire_safety?.fire_risk_assessment && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Fire Risk Assessment</p>
                      <div className="text-xs space-y-1 text-muted-foreground">
                        <div>
                          Last: {bs.fire_safety.fire_risk_assessment.last_assessment_date
                            ? new Date(bs.fire_safety.fire_risk_assessment.last_assessment_date).toLocaleDateString()
                            : 'Not recorded'}
                        </div>
                        <div>
                          Next Due: {bs.fire_safety.fire_risk_assessment.next_assessment_due
                            ? new Date(bs.fire_safety.fire_risk_assessment.next_assessment_due).toLocaleDateString()
                            : 'Not scheduled'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Structural Defects Summary */}
                  {bs.structural_safety?.structural_defect_register?.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-amber-900">
                        {bs.structural_safety.structural_defect_register.filter(d => !d.completed).length} of {bs.structural_safety.structural_defect_register.length} defects unresolved
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(bs.id)}
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(bs.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      {showForm && (
        <EntityFormDialog
          entity="BuildingSafety"
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createMutation.mutate(data)}
        />
      )}

      {editingId && (
        <EntityFormDialog
          entity="BuildingSafety"
          initialId={editingId}
          onClose={() => setEditingId(null)}
          onSubmit={(data) => updateMutation.mutate({ id: editingId, data })}
        />
      )}
    </div>
  );
}