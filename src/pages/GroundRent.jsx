import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, AlertCircle } from 'lucide-react';
import EntityFormDialog from '@/components/shared/EntityFormDialog';
import { format, isAfter, addDays } from 'date-fns';

const statusColors = {
  scheduled: 'bg-gray-100 text-gray-700',
  demanded: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  peppercorn: 'bg-purple-100 text-purple-700',
  disputed: 'bg-orange-100 text-orange-800',
};

export default function GroundRent() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['ground-rent'],
    queryFn: () => base44.entities.GroundRent.list('-due_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (d) => base44.entities.GroundRent.create(d),
    onSuccess: () => { queryClient.invalidateQueries(['ground-rent']); setShowForm(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GroundRent.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['ground-rent']); setEditing(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GroundRent.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['ground-rent']),
  });

  const filtered = records.filter(r => {
    const matchSearch = !search || r.property_name?.toLowerCase().includes(search.toLowerCase()) || r.leaseholder_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalAnnual = records.filter(r => r.status !== 'peppercorn').reduce((s, r) => s + (r.annual_amount || 0), 0);
  const overdue = records.filter(r => r.status === 'overdue').length;
  const upcoming = records.filter(r => r.due_date && isAfter(new Date(r.due_date), new Date()) && !isAfter(new Date(r.due_date), addDays(new Date(), 60))).length;

  const schema = base44.entities.GroundRent.schema();

  return (
    <div className="p-6">
      <PageHeader title="Ground Rent" subtitle="Schedules, demands and collection">
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Record
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">Annual GR Income</div>
          <div className="text-xl font-semibold">£{totalAnnual.toLocaleString()}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3 text-red-500" /> Overdue</div>
          <div className="text-xl font-semibold text-red-600">{overdue}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">Due in 60 Days</div>
          <div className="text-xl font-semibold text-orange-600">{upcoming}</div>
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
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="demanded">Demanded</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="peppercorn">Peppercorn</SelectItem>
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
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Annual GR</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Due Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Paid Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Review</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">No ground rent records found</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{r.property_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.leaseholder_name}</td>
                <td className="px-4 py-3 text-right font-semibold">£{(r.annual_amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.due_date ? format(new Date(r.due_date), 'dd MMM yyyy') : '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.paid_date ? format(new Date(r.paid_date), 'dd MMM yyyy') : '—'}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{r.review_clause || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>{r.status}</span>
                  {r.ground_rent_act_2022 && <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">2022 Act</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(r)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(r.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(showForm || editing) && (
        <EntityFormDialog
          title={editing ? 'Edit Ground Rent' : 'Add Ground Rent Record'}
          schema={schema}
          initialData={editing || {}}
          onSave={(d) => editing ? updateMutation.mutate({ id: editing.id, data: d }) : createMutation.mutate(d)}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}