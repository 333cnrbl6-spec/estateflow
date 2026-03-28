import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Upload, Receipt, Fuel, Car } from 'lucide-react';
import EntityFormDialog from '@/components/shared/EntityFormDialog';
import { format } from 'date-fns';

const categoryIcons = {
  fuel: '⛽',
  mileage: '🚗',
  vehicle: '🚙',
  office_supplies: '📎',
  software: '💻',
  professional_fees: '👔',
  legal: '⚖️',
  insurance: '🛡️',
  travel: '✈️',
  accommodation: '🏨',
  subsistence: '🍽️',
  telephone: '📱',
  postage: '📬',
  maintenance_materials: '🔧',
  tools: '🔨',
  advertising: '📣',
  bank_charges: '🏦',
  accountancy: '📊',
  other: '📁',
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  reimbursed: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function Expenses() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.BusinessExpense.list('-date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (d) => base44.entities.BusinessExpense.create(d),
    onSuccess: () => { queryClient.invalidateQueries(['expenses']); setShowForm(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BusinessExpense.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['expenses']); setEditing(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BusinessExpense.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['expenses']),
  });

  const filtered = expenses.filter(e => {
    const matchSearch = !search || e.description?.toLowerCase().includes(search.toLowerCase()) || e.supplier?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || e.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const totalNet = expenses.reduce((s, e) => s + (e.amount_net || 0), 0);
  const totalVat = expenses.reduce((s, e) => s + (e.vat_amount || 0), 0);
  const totalGross = expenses.reduce((s, e) => s + (e.amount_gross || 0), 0);
  const totalMileage = expenses.filter(e => e.category === 'mileage').reduce((s, e) => s + (e.mileage_miles || 0), 0);

  const schema = base44.entities.BusinessExpense.schema();

  return (
    <div className="p-6">
      <PageHeader title="Business Expenses" subtitle="Fuel, mileage, purchases and business costs">
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Expense
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">Total Net</div>
          <div className="text-xl font-semibold">£{totalNet.toLocaleString(undefined, {minimumFractionDigits:2,maximumFractionDigits:2})}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">VAT</div>
          <div className="text-xl font-semibold text-blue-700">£{totalVat.toLocaleString(undefined, {minimumFractionDigits:2,maximumFractionDigits:2})}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">Total Gross</div>
          <div className="text-xl font-semibold">£{totalGross.toLocaleString(undefined, {minimumFractionDigits:2,maximumFractionDigits:2})}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Car className="w-3 h-3" /> Mileage</div>
          <div className="text-xl font-semibold">{totalMileage.toLocaleString()} mi</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search description, supplier..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="fuel">⛽ Fuel</SelectItem>
            <SelectItem value="mileage">🚗 Mileage</SelectItem>
            <SelectItem value="vehicle">🚙 Vehicle</SelectItem>
            <SelectItem value="office_supplies">📎 Office Supplies</SelectItem>
            <SelectItem value="software">💻 Software</SelectItem>
            <SelectItem value="professional_fees">👔 Professional Fees</SelectItem>
            <SelectItem value="legal">⚖️ Legal</SelectItem>
            <SelectItem value="insurance">🛡️ Insurance</SelectItem>
            <SelectItem value="travel">✈️ Travel</SelectItem>
            <SelectItem value="subsistence">🍽️ Subsistence</SelectItem>
            <SelectItem value="telephone">📱 Telephone</SelectItem>
            <SelectItem value="maintenance_materials">🔧 Materials</SelectItem>
            <SelectItem value="bank_charges">🏦 Bank Charges</SelectItem>
            <SelectItem value="accountancy">📊 Accountancy</SelectItem>
            <SelectItem value="other">📁 Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="reimbursed">Reimbursed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Supplier</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Net</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">VAT</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Gross</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">No expenses found</td></tr>
            ) : filtered.map(e => (
              <tr key={e.id} className="hover:bg-muted/20">
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{e.date ? format(new Date(e.date), 'dd MMM yyyy') : '—'}</td>
                <td className="px-4 py-3 max-w-xs truncate font-medium">{e.description}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  <span>{categoryIcons[e.category]} {e.category?.replace(/_/g, ' ')}</span>
                  {e.mileage_miles && <span className="ml-1 text-xs text-muted-foreground">({e.mileage_miles} mi)</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{e.supplier || '—'}</td>
                <td className="px-4 py-3 text-right">£{(e.amount_net || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">£{(e.vat_amount || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-semibold">£{(e.amount_gross || 0).toFixed(2)}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[e.status]}`}>{e.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(e)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(e.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(showForm || editing) && (
        <EntityFormDialog
          title={editing ? 'Edit Expense' : 'Add Expense'}
          schema={schema}
          initialData={editing || {}}
          onSave={(d) => editing ? updateMutation.mutate({ id: editing.id, data: d }) : createMutation.mutate(d)}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}