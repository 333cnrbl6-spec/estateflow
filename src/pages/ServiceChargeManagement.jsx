import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react';
import EntityFormDialog from '@/components/shared/EntityFormDialog';

export default function ServiceChargeManagement() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const queryClient = useQueryClient();

  const { data: serviceCharges, isLoading } = useQuery({
    queryKey: ['serviceCharges'],
    queryFn: () => base44.entities.ServiceCharge.list(),
    initialData: [],
  });

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceCharge.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCharges'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ServiceCharge.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCharges'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ServiceCharge.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCharges'] });
    },
  });

  const filtered = serviceCharges.filter((sc) => {
    const property = properties.find(p => p.id === sc.property_id);
    const matchesSearch = !search || property?.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || sc.status === filter;
    return matchesSearch && matchesFilter;
  });

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    estimated: 'bg-blue-100 text-blue-800',
    final_approved: 'bg-green-100 text-green-800',
    disputed: 'bg-red-100 text-red-800',
  };

  const s20StatusLabels = {
    not_required: 'Not required',
    notice_issued: 'Notice issued',
    consultation_period: 'In consultation',
    leaseholder_consent_obtained: 'Approved',
    dispute_filed: 'Disputed',
  };

  return (
    <div className="min-h-screen bg-background space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Service Charge Management</h1>
          <p className="text-muted-foreground mt-1">Landlord & Tenant Act 1985 s.20 compliance</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Account
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
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="estimated">Estimated</option>
          <option value="final_approved">Final Approved</option>
          <option value="disputed">Disputed</option>
        </select>
      </div>

      {/* Grid View */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading service charges...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-muted/20">
          <CardContent className="py-12 text-center">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No service charges found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filtered.map((sc) => {
            const property = properties.find(p => p.id === sc.property_id);
            const totalDisputed = sc.disputed_items?.reduce((sum, item) => sum + (item.amount_disputed || 0), 0) || 0;
            return (
              <Card key={sc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{property?.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {sc.period_start} to {sc.period_end}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={statusColors[sc.status]}>{sc.status}</Badge>
                      {sc.section_20_consultation_required && (
                        <Badge variant="outline" className="bg-amber-50">
                          s.20 required
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Financial Summary */}
                  <div className="grid grid-cols-3 gap-4 py-3 border-t border-b">
                    <div>
                      <p className="text-xs text-muted-foreground">Estimated</p>
                      <p className="text-lg font-semibold">£{(sc.total_estimated_cost || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Actual</p>
                      <p className="text-lg font-semibold">£{(sc.actual_cost || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Per Unit</p>
                      <p className="text-lg font-semibold">
                        £{sc.leaseholder_count ? (sc.actual_cost / sc.leaseholder_count).toFixed(0) : 0}
                      </p>
                    </div>
                  </div>

                  {/* s.20 Status */}
                  {sc.section_20_consultation_required && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-900">s.20 Status: {s20StatusLabels[sc.section_20_status]}</p>
                      {sc.section_20_deadline && (
                        <p className="text-xs text-blue-700 mt-1">
                          Deadline: {new Date(sc.section_20_deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Disputes */}
                  {totalDisputed > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-red-900">
                        Disputed: £{totalDisputed.toLocaleString()} ({sc.disputed_items.length} items)
                      </p>
                    </div>
                  )}

                  {/* Cost Breakdown Preview */}
                  <div>
                    <p className="text-sm font-medium mb-2">Cost Categories</p>
                    <div className="space-y-1 text-xs">
                      {sc.cost_breakdown?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-muted-foreground">
                          <span>{item.category.replace(/_/g, ' ')}</span>
                          <span>£{(item.actual_cost || item.budgeted_cost || 0).toLocaleString()}</span>
                        </div>
                      ))}
                      {sc.cost_breakdown?.length > 3 && (
                        <p className="text-muted-foreground">+ {sc.cost_breakdown.length - 3} more...</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(sc.id)}
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(sc.id)}
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
          entity="ServiceCharge"
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createMutation.mutate(data)}
        />
      )}

      {editingId && (
        <EntityFormDialog
          entity="ServiceCharge"
          initialId={editingId}
          onClose={() => setEditingId(null)}
          onSubmit={(data) => updateMutation.mutate({ id: editingId, data })}
        />
      )}
    </div>
  );
}