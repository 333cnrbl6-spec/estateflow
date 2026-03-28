import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import EntityFormDialog from '@/components/shared/EntityFormDialog';
import { format } from 'date-fns';

const FIELDS = [
  { name: 'tenant_name', label: 'Tenant Name' },
  { name: 'property_address', label: 'Property Address' },
  { name: 'transaction_type', label: 'Transaction Type', enumValues: ['rent_charge','payment_received','credit','debit_adjustment','deposit_charge','late_fee'] },
  { name: 'description', label: 'Description' },
  { name: 'amount', label: 'Amount (£)', type: 'number' },
  { name: 'due_date', label: 'Due Date', format: 'date' },
  { name: 'paid_date', label: 'Paid Date', format: 'date' },
  { name: 'status', label: 'Status', enumValues: ['charged','paid','partial','overdue','waived'] },
  { name: 'payment_method', label: 'Payment Method', enumValues: ['bank_transfer','standing_order','cash','cheque','direct_debit','other'] },
  { name: 'bank_reference', label: 'Bank Reference' },
  { name: 'period_start', label: 'Period Start', format: 'date' },
  { name: 'period_end', label: 'Period End', format: 'date' },
  { name: 'notes', label: 'Notes' },
];

const statusColors = {
  charged: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
  waived: 'bg-gray-100 text-gray-600',
};

const typeColors = {
  rent_charge: 'text-foreground',
  payment_received: 'text-green-600',
  credit: 'text-green-600',
  debit_adjustment: 'text-red-600',
  deposit_charge: 'text-blue-600',
  late_fee: 'text-orange-600',
};

export default function RentLedger() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['rent-ledger'],
    queryFn: () => base44.entities.RentLedger.list('-created_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (d) => base44.entities.RentLedger.create(d),
    onSuccess: () => { queryClient.invalidateQueries(['rent-ledger']); setShowForm(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RentLedger.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['rent-ledger']); setEditing(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RentLedger.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['rent-ledger']),
  });

  const filtered = entries.filter(e => {
    const matchSearch = !search || e.tenant_name?.toLowerCase().includes(search.toLowerCase()) || e.property_address?.toLowerCase().includes(search.toLowerCase()) || e.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalCharged = entries.filter(e => ['rent_charge', 'late_fee', 'deposit_charge', 'debit_adjustment'].includes(e.transaction_type)).reduce((s, e) => s + (e.amount || 0), 0);
  const totalReceived = entries.filter(e => ['payment_received', 'credit'].includes(e.transaction_type)).reduce((s, e) => s + (e.amount || 0), 0);
  const totalArrears = entries.filter(e => e.status === 'overdue').reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="p-6">
      <PageHeader title="Rent Ledger" subtitle="Tenant charges, payments and arrears">
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Entry
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><TrendingDown className="w-4 h-4" /> Total Charged</div>
          <div className="text-2xl font-semibold">£{totalCharged.toLocaleString()}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><TrendingUp className="w-4 h-4 text-green-600" /> Total Received</div>
          <div className="text-2xl font-semibold text-green-700">£{totalReceived.toLocaleString()}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><AlertCircle className="w-4 h-4 text-red-500" /> Arrears</div>
          <div className="text-2xl font-semibold text-red-600">£{totalArrears.toLocaleString()}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tenant, property..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="charged">Charged</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="waived">Waived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tenant</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Due</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No entries found</td></tr>
            ) : filtered.map(entry => (
              <tr key={entry.id} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{entry.tenant_name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  <div className={typeColors[entry.transaction_type]}>{entry.description || entry.transaction_type?.replace(/_/g, ' ')}</div>
                  {entry.property_address && <div className="text-xs text-muted-foreground">{entry.property_address}</div>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{entry.due_date ? format(new Date(entry.due_date), 'dd MMM yyyy') : '—'}</td>
                <td className={`px-4 py-3 text-right font-semibold ${['payment_received','credit'].includes(entry.transaction_type) ? 'text-green-600' : ''}`}>
                  {['payment_received','credit'].includes(entry.transaction_type) ? '+' : ''}£{(entry.amount || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[entry.status]}`}>{entry.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(entry)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(entry.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EntityFormDialog
        open={showForm || !!editing}
        onOpenChange={(o) => { if (!o) { setShowForm(false); setEditing(null); } }}
        title={editing ? 'Edit Ledger Entry' : 'Add Ledger Entry'}
        fields={FIELDS}
        initialData={editing || {}}
        onSave={(d) => editing ? updateMutation.mutate({ id: editing.id, data: d }) : createMutation.mutate(d)}
      />
    </div>
  );
}