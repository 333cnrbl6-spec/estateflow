import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, AlertTriangle, Building2 } from 'lucide-react';
import EntityFormDialog from '@/components/shared/EntityFormDialog';
import { format } from 'date-fns';

const statusColors = {
  budgeted: 'bg-gray-100 text-gray-700',
  demanded: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
  disputed: 'bg-orange-100 text-orange-800',
};

export default function ServiceCharges() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: charges = [], isLoading } = useQuery({
    queryKey: ['service-charges'],
    queryFn: () => base44.entities.ServiceCharge.list('-created_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (d) => base44.entities.ServiceCharge.create(d),
    onSuccess: () => { queryClient.invalidateQueries(['service-charges']); setShowForm(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ServiceCharge.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['service-charges']); setEditing(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ServiceCharge.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['service-charges']),
  });

  const filtered = charges.filter(c => {
    const matchSearch = !search || c.property_name?.toLowerCase().includes(search.toLowerCase()) || c.leaseholder_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalDemanded = charges.reduce((s, c) => s + (c.amount_demanded || 0), 0);
  const totalReceived = charges.reduce((s, c) => s + (c.amount_received || 0), 0);
  const totalOutstanding = totalDemanded - totalReceived;
  const disputed = charges.filter(c => c.status === 'disputed').length;

  const schema = base44.entities.ServiceCharge.schema();

  return (
    <div className="p-6">
      <PageHeader title="Service Charges" subtitle="Block budgets, demands and collections">
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Charge
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">Total Demanded</div>
          <div className="text-xl font-semibold">£{totalDemanded.toLocaleString()}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">Received</div>
          <div className="text-xl font-semibold text-green-700">£{totalReceived.toLocaleString()}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">Outstanding</div>
          <div className="text-xl font-semibold text-orange-600">£{totalOutstanding.toLocaleString()}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-orange-500" /> Disputed</div>
          <div className="text-xl font-semibold text-orange-600">{disputed}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search property, leaseholder..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="budgeted">Budgeted</SelectItem>
            <SelectItem value="demanded">Demanded</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="disputed">Disputed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Property</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Leaseholder</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Period</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Demanded</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Received</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">No service charges found</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{c.property_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.leaseholder_name || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground capitalize">{c.charge_type?.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.period_label || (c.due_date ? format(new Date(c.due_date), 'MMM yyyy') : '—')}</td>
                <td className="px-4 py-3 text-right font-semibold">£{(c.amount_demanded || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-green-700">£{(c.amount_received || 0).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status]}`}>{c.status}</span>
                  {c.s20_consultation_required && <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">S20</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(c)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(c.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(showForm || editing) && (
        <EntityFormDialog
          title={editing ? 'Edit Service Charge' : 'Add Service Charge'}
          schema={schema}
          initialData={editing || {}}
          onSave={(d) => editing ? updateMutation.mutate({ id: editing.id, data: d }) : createMutation.mutate(d)}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}