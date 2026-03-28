import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PoundSterling, Plus, Search, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/shared/PageHeader';
import SampleDataBanner from '@/components/shared/SampleDataBanner';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import EntityFormDialog from '@/components/shared/EntityFormDialog';
import { format } from 'date-fns';
import MonthlyStatement from '@/components/financials/MonthlyStatement';
import ServiceChargeReport from '@/components/financials/ServiceChargeReport';
import { useDemoFilter } from '@/hooks/useDemoFilter';

const TRANSACTION_FIELDS = [
  { name: 'description', type: 'string' },
  { name: 'transaction_type', type: 'string', enumValues: ['rent_payment', 'service_charge', 'ground_rent', 'insurance', 'maintenance_cost', 'management_fee', 'major_works', 'legal_fee', 'deposit', 'refund', 'other'] },
  { name: 'amount', type: 'number', label: 'Amount (£)' },
  { name: 'direction', type: 'string', enumValues: ['income', 'expense'] },
  { name: 'status', type: 'string', enumValues: ['paid', 'pending', 'overdue', 'cancelled', 'partial'] },
  { name: 'due_date', type: 'string', format: 'date' },
  { name: 'paid_date', type: 'string', format: 'date' },
  { name: 'reference', type: 'string' },
  { name: 'notes', type: 'string' },
];

export default function Financials() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();
  const { propertyIds } = useDemoFilter();

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', propertyIds],
    queryFn: async () => {
      const all = await base44.entities.FinancialTransaction.list('-created_date');
      if (propertyIds) return all.filter(t => propertyIds.includes(t.property_id));
      return all;
    }
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties', propertyIds],
    queryFn: async () => {
      if (propertyIds) {
        const allProps = await base44.entities.Property.list();
        return allProps.filter(p => propertyIds.includes(p.id));
      }
      return base44.entities.Property.list();
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FinancialTransaction.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['transactions'] }); setDialogOpen(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FinancialTransaction.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['transactions'] }); setDialogOpen(false); setEditing(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FinancialTransaction.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });

  const totalIncome = transactions.filter(t => t.direction === 'income' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
  const totalExpenses = transactions.filter(t => t.direction === 'expense' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
  const totalOverdue = transactions.filter(t => t.status === 'overdue').reduce((s, t) => s + (t.amount || 0), 0);

  const filtered = transactions.filter(t => {
    const matchSearch = !search || t.description?.toLowerCase().includes(search.toLowerCase()) || t.reference?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || t.transaction_type === filterType;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const handleSave = (data) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Financials" subtitle="Track all income and expenses">
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Add Transaction
        </Button>
      </PageHeader>

      <SampleDataBanner entity="financial transactions" />

      <div className="space-y-6 mb-8">
        <MonthlyStatement transactions={transactions} />
        <ServiceChargeReport transactions={transactions} properties={properties} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Income" value={`£${totalIncome.toLocaleString()}`} icon={PoundSterling} />
        <StatCard title="Total Expenses" value={`£${totalExpenses.toLocaleString()}`} icon={PoundSterling} />
        <StatCard title="Overdue Amount" value={`£${totalOverdue.toLocaleString()}`} icon={PoundSterling} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {['rent_payment', 'service_charge', 'ground_rent', 'insurance', 'maintenance_cost', 'management_fee', 'major_works', 'legal_fee'].map(t =>
              <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, ' ')}</SelectItem>
            )}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {['paid', 'pending', 'overdue', 'cancelled', 'partial'].map(s =>
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {filtered.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="text-xs">Direction</TableHead>
                <TableHead className="text-xs">Due Date</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => (
                <TableRow key={t.id} className="hover:bg-muted/30 opacity-80 hover:opacity-100">
                  <TableCell className="font-medium text-sm">{t.description}</TableCell>
                  <TableCell className="text-sm capitalize">{t.transaction_type?.replace(/_/g, ' ') || '—'}</TableCell>
                  <TableCell className="text-sm font-medium">£{(t.amount || 0).toLocaleString()}</TableCell>
                  <TableCell><StatusBadge status={t.direction} /></TableCell>
                  <TableCell className="text-sm">{t.due_date ? format(new Date(t.due_date), 'dd MMM yyyy') : '—'}</TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(t); setDialogOpen(true); }}><Pencil className="w-3.5 h-3.5 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(t.id)}><Trash2 className="w-3.5 h-3.5 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState icon={PoundSterling} title="No transactions found" description="Add your first transaction" actionLabel="Add Transaction" onAction={() => { setEditing(null); setDialogOpen(true); }} />
      )}

      <EntityFormDialog
        open={dialogOpen} onOpenChange={setDialogOpen}
        title={editing ? 'Edit Transaction' : 'Add Transaction'}
        fields={TRANSACTION_FIELDS} initialData={editing}
        onSave={handleSave} saving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}