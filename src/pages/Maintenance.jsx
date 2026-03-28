import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wrench, Plus, Search, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import EntityFormDialog from '@/components/shared/EntityFormDialog';
import { format } from 'date-fns';

const MAINTENANCE_FIELDS = [
  { name: 'title', type: 'string' },
  { name: 'description', type: 'string' },
  { name: 'priority', type: 'string', enumValues: ['emergency', 'urgent', 'standard', 'low'] },
  { name: 'status', type: 'string', enumValues: ['reported', 'assessed', 'quoted', 'approved', 'in_progress', 'completed', 'cancelled'] },
  { name: 'category', type: 'string', enumValues: ['plumbing', 'electrical', 'structural', 'roofing', 'decorating', 'landscaping', 'cleaning', 'fire_safety', 'lift', 'security', 'general', 'other'] },
  { name: 'contractor_name', type: 'string' },
  { name: 'contractor_phone', type: 'string' },
  { name: 'estimated_cost', type: 'number', label: 'Estimated Cost (£)' },
  { name: 'actual_cost', type: 'number', label: 'Actual Cost (£)' },
  { name: 'scheduled_date', type: 'string', format: 'date' },
  { name: 'completed_date', type: 'string', format: 'date' },
  { name: 'notes', type: 'string' },
];

export default function Maintenance() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({ queryKey: ['maintenance'], queryFn: () => base44.entities.MaintenanceOrder.list('-created_date') });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MaintenanceOrder.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['maintenance'] }); setDialogOpen(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MaintenanceOrder.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['maintenance'] }); setDialogOpen(false); setEditing(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MaintenanceOrder.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
  });

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchPriority = filterPriority === 'all' || o.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleSave = (data) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Maintenance" subtitle="Track and manage all work orders">
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> New Order
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {['reported', 'assessed', 'quoted', 'approved', 'in_progress', 'completed', 'cancelled'].map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            {['emergency', 'urgent', 'standard', 'low'].map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(order => (
            <div key={order.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">{order.title}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100"><MoreHorizontal className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditing(order); setDialogOpen(true); }}><Pencil className="w-3.5 h-3.5 mr-2" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(order.id)}><Trash2 className="w-3.5 h-3.5 mr-2" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {order.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{order.description}</p>}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <StatusBadge status={order.priority} />
                <StatusBadge status={order.status} />
                {order.category && <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{order.category.replace(/_/g, ' ')}</span>}
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                {order.contractor_name && <p>Contractor: {order.contractor_name}</p>}
                {order.estimated_cost && <p>Est: £{order.estimated_cost.toLocaleString()}</p>}
                {order.scheduled_date && <p>Scheduled: {format(new Date(order.scheduled_date), 'dd MMM yyyy')}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Wrench} title="No maintenance orders" description="Create a new work order" actionLabel="New Order" onAction={() => { setEditing(null); setDialogOpen(true); }} />
      )}

      <EntityFormDialog
        open={dialogOpen} onOpenChange={setDialogOpen}
        title={editing ? 'Edit Maintenance Order' : 'New Maintenance Order'}
        fields={MAINTENANCE_FIELDS} initialData={editing}
        onSave={handleSave} saving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}