import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Search, MoreHorizontal, Pencil, Trash2, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/shared/PageHeader';
import SampleDataBanner from '@/components/shared/SampleDataBanner';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import EntityFormDialog from '@/components/shared/EntityFormDialog';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useDemoFilter } from '@/hooks/useDemoFilter';
import TenantPortalAccess from '@/components/tenants/TenantPortalAccess';

const TENANT_FIELDS = [
  { name: 'full_name', type: 'string', required: true },
  { name: 'email', type: 'email' },
  { name: 'phone', type: 'phone' },
  { name: 'tenant_type', type: 'string', enumValues: ['leaseholder', 'assured_shorthold', 'assured', 'regulated', 'licensee'] },
  { name: 'status', type: 'string', enumValues: ['active', 'in_arrears', 'notice_given', 'former', 'prospective'] },
  { name: 'tenancy_start_date', type: 'string', format: 'date' },
  { name: 'tenancy_end_date', type: 'string', format: 'date' },
  { name: 'deposit_amount', type: 'number', label: 'Deposit (£)' },
  { name: 'deposit_scheme', type: 'string', enumValues: ['dps', 'mydeposits', 'tds', 'none'] },
  { name: 'emergency_contact_name', type: 'string' },
  { name: 'emergency_contact_phone', type: 'phone' },
  { name: 'notes', type: 'string' },
];

export default function Tenants() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const queryClient = useQueryClient();
  const { propertyIds } = useDemoFilter();

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants', propertyIds],
    queryFn: async () => {
      if (propertyIds) {
        const all = await base44.entities.Tenant.list('-created_date');
        return all.filter(t => propertyIds.includes(t.property_id));
      }
      return base44.entities.Tenant.list('-created_date');
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Tenant.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tenants'] }); setDialogOpen(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Tenant.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tenants'] }); setDialogOpen(false); setEditing(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Tenant.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tenants'] }); setConfirmId(null); },
  });

  const filtered = tenants.filter(t => {
    const matchSearch = !search || t.full_name?.toLowerCase().includes(search.toLowerCase()) || t.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = (data) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Tenants & Leaseholders" subtitle={`${tenants.length} total contacts`}>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Add Tenant
        </Button>
      </PageHeader>

      <SampleDataBanner entity="tenant names, email addresses and phone numbers" />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tenants…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {['active', 'in_arrears', 'notice_given', 'former', 'prospective'].map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage label="Loading tenants…" />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(tenant => (
            <div key={tenant.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all group">
              {/* Card header row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {tenant.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{tenant.full_name}</h3>
                    <p className="text-[11px] text-muted-foreground capitalize">{tenant.tenant_type?.replace(/_/g, ' ') || 'Tenant'}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 flex-shrink-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditing(tenant); setDialogOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => setConfirmId(tenant.id)}>
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Contact details */}
              <div className="space-y-1 mb-3">
                {tenant.email && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 flex-shrink-0" /> {tenant.email}
                  </p>
                )}
                {tenant.phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Phone className="w-3 h-3 flex-shrink-0" /> {tenant.phone}
                  </p>
                )}
              </div>

              {/* Status badge */}
              <StatusBadge status={tenant.status} />

              {/* Portal access */}
              <div className="mt-3 pt-3 border-t border-border">
                <TenantPortalAccess tenant={tenant} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Users} title="No tenants found" description="Add your first tenant or adjust the filter" actionLabel="Add Tenant" onAction={() => { setEditing(null); setDialogOpen(true); }} />
      )}

      <EntityFormDialog
        open={dialogOpen} onOpenChange={setDialogOpen}
        title={editing ? 'Edit Tenant' : 'Add Tenant'}
        fields={TENANT_FIELDS} initialData={editing}
        onSave={handleSave} saving={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(o) => !o && setConfirmId(null)}
        title="Delete Tenant?"
        description="This will permanently remove the tenant record. This cannot be undone."
        onConfirm={() => deleteMutation.mutate(confirmId)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}