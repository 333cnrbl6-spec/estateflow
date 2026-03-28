import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import EntityFormDialog from '@/components/shared/EntityFormDialog';

export default function RTMManagementPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const queryClient = useQueryClient();

  const { data: rtmRecords, isLoading } = useQuery({
    queryKey: ['rtmManagement'],
    queryFn: () => base44.entities.RTMManagement.list(),
    initialData: [],
  });

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RTMManagement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rtmManagement'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RTMManagement.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rtmManagement'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RTMManagement.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rtmManagement'] });
    },
  });

  const filtered = rtmRecords.filter((rtm) => {
    const property = properties.find(p => p.id === rtm.property_id);
    const matchesSearch = !search || property?.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || rtm.rtm_status === filter;
    return matchesSearch && matchesFilter;
  });

  const rtmStatusColors = {
    traditional_management: 'bg-slate-100 text-slate-800',
    rtm_claim_initiated: 'bg-blue-100 text-blue-800',
    notice_served: 'bg-amber-100 text-amber-800',
    dispute_period: 'bg-red-100 text-red-800',
    rtm_acquired: 'bg-green-100 text-green-800',
    rtm_to_landlord_transition: 'bg-orange-100 text-orange-800',
  };

  const getProgressStep = (status) => {
    const steps = [
      'traditional_management',
      'rtm_claim_initiated',
      'notice_served',
      'dispute_period',
      'rtm_acquired',
    ];
    return steps.indexOf(status) + 1;
  };

  return (
    <div className="min-h-screen bg-background space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">RTM Management</h1>
          <p className="text-muted-foreground mt-1">Commonhold & Leasehold Reform Act 2002 s.71-113</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New RTM Record
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
          <option value="traditional_management">Traditional Management</option>
          <option value="rtm_claim_initiated">Claim Initiated</option>
          <option value="notice_served">Notice Served</option>
          <option value="dispute_period">Dispute Period</option>
          <option value="rtm_acquired">RTM Acquired</option>
        </select>
      </div>

      {/* Records */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading RTM records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-muted/20">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No RTM records found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filtered.map((rtm) => {
            const property = properties.find(p => p.id === rtm.property_id);
            const progress = getProgressStep(rtm.rtm_status);

            return (
              <Card key={rtm.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{property?.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {rtm.management_type} • {rtm.leaseholder_eligibility?.total_leaseholders} leaseholders
                      </p>
                    </div>
                    <Badge className={rtmStatusColors[rtm.rtm_status]}>
                      {rtm.rtm_status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress Indicator */}
                  {rtm.rtm_status !== 'traditional_management' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>RTM Progress</span>
                        <span>{progress}/5</span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((step) => (
                          <div
                            key={step}
                            className={`flex-1 h-2 rounded-full ${
                              step <= progress ? 'bg-primary' : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Leaseholder Eligibility */}
                  {rtm.leaseholder_eligibility && (
                    <div className="grid grid-cols-3 gap-4 py-3 border-y">
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-lg font-semibold">{rtm.leaseholder_eligibility.total_leaseholders}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Eligible</p>
                        <p className="text-lg font-semibold">{rtm.leaseholder_eligibility.eligible_to_participate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Threshold</p>
                        <p className={`text-lg font-semibold ${
                          rtm.leaseholder_eligibility.claim_threshold_met ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {rtm.leaseholder_eligibility.eligible_percentage?.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  )}

                  {/* RTM Company Details */}
                  {rtm.rtm_company_details?.company_number && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-900">
                        RTM Company: {rtm.rtm_company_details.company_number}
                      </p>
                      {rtm.rtm_company_details.formed_date && (
                        <p className="text-xs text-blue-700 mt-1">
                          Formed: {new Date(rtm.rtm_company_details.formed_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Claim Timeline */}
                  {rtm.rtm_claim_process && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Claim Timeline</p>
                      <div className="text-xs space-y-1 text-muted-foreground">
                        {rtm.rtm_claim_process.claim_notice_date && (
                          <div>
                            Claim Notice: {new Date(rtm.rtm_claim_process.claim_notice_date).toLocaleDateString()}
                          </div>
                        )}
                        {rtm.rtm_claim_process.acquisition_date && (
                          <div>
                            Acquisition Date: {new Date(rtm.rtm_claim_process.acquisition_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(rtm.id)}
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(rtm.id)}
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
          entity="RTMManagement"
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createMutation.mutate(data)}
        />
      )}

      {editingId && (
        <EntityFormDialog
          entity="RTMManagement"
          initialId={editingId}
          onClose={() => setEditingId(null)}
          onSubmit={(data) => updateMutation.mutate({ id: editingId, data })}
        />
      )}
    </div>
  );
}