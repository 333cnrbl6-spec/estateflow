import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Search, CheckCircle2, Circle, TrendingUp, TrendingDown, Landmark } from 'lucide-react';
import EntityFormDialog from '@/components/shared/EntityFormDialog';
import { format } from 'date-fns';

const categoryColors = {
  rent_receipt: 'bg-green-100 text-green-800',
  service_charge_receipt: 'bg-blue-100 text-blue-800',
  ground_rent_receipt: 'bg-purple-100 text-purple-800',
  maintenance_payment: 'bg-orange-100 text-orange-800',
  contractor_payment: 'bg-orange-100 text-orange-800',
  fuel: 'bg-yellow-100 text-yellow-800',
  business_expense: 'bg-gray-100 text-gray-700',
  unknown: 'bg-gray-100 text-gray-500',
};

function parseLloydsCsv(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 4) continue;
    const dateStr = cols[0]?.trim().replace(/"/g, '');
    const desc = cols[1]?.trim().replace(/"/g, '');
    const debit = parseFloat(cols[2]?.trim().replace(/"/g, '') || '0') || 0;
    const credit = parseFloat(cols[3]?.trim().replace(/"/g, '') || '0') || 0;
    const balance = parseFloat(cols[4]?.trim().replace(/"/g, '') || '0') || 0;
    const amount = credit > 0 ? credit : -debit;
    if (!dateStr || !desc) continue;
    rows.push({
      bank_name: 'lloyds',
      transaction_date: dateStr,
      description: desc,
      amount,
      direction: amount >= 0 ? 'credit' : 'debit',
      balance_after: balance,
      category: 'unknown',
      reconciled: false,
      import_batch: `lloyds-${Date.now()}`,
    });
  }
  return rows;
}

export default function Banking() {
  const [search, setSearch] = useState('');
  const [reconciled, setReconciled] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['bank-transactions'],
    queryFn: () => base44.entities.BankTransaction.list('-transaction_date', 500),
  });

  const bulkCreateMutation = useMutation({
    mutationFn: (rows) => base44.entities.BankTransaction.bulkCreate(rows),
    onSuccess: () => { queryClient.invalidateQueries(['bank-transactions']); setImporting(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BankTransaction.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['bank-transactions']); setEditing(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BankTransaction.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['bank-transactions']),
  });

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseLloydsCsv(ev.target.result);
      if (rows.length > 0) bulkCreateMutation.mutate(rows);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filtered = transactions.filter(t => {
    const matchSearch = !search || t.description?.toLowerCase().includes(search.toLowerCase()) || t.reference?.toLowerCase().includes(search.toLowerCase());
    const matchRec = reconciled === 'all' || (reconciled === 'yes' ? t.reconciled : !t.reconciled);
    const matchCat = categoryFilter === 'all' || t.category === categoryFilter;
    return matchSearch && matchRec && matchCat;
  });

  const totalCredits = transactions.filter(t => t.direction === 'credit').reduce((s, t) => s + Math.abs(t.amount || 0), 0);
  const totalDebits = transactions.filter(t => t.direction === 'debit').reduce((s, t) => s + Math.abs(t.amount || 0), 0);
  const unreconciled = transactions.filter(t => !t.reconciled).length;

  const schema = base44.entities.BankTransaction.schema();

  return (
    <div className="p-6">
      <PageHeader title="Banking" subtitle="Lloyds statements, transaction import & reconciliation">
        <input ref={fileRef} type="file" accept=".csv,.ofx" className="hidden" onChange={handleFileImport} />
        <Button variant="outline" onClick={() => fileRef.current.click()} className="gap-2">
          <Upload className="w-4 h-4" /> Import CSV
        </Button>
      </PageHeader>

      {/* FreeAgent Banner */}
      <div className="mb-6 p-4 rounded-lg border border-dashed border-accent/50 bg-accent/5 flex items-center justify-between">
        <div>
          <div className="font-medium text-sm">FreeAgent Integration</div>
          <div className="text-xs text-muted-foreground">Connect your FreeAgent account to sync transactions, invoices and expenses automatically.</div>
        </div>
        <Button variant="outline" size="sm" disabled>Configure FreeAgent</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><TrendingUp className="w-3 h-3 text-green-600" /> Total Credits</div>
          <div className="text-xl font-semibold text-green-700">£{totalCredits.toLocaleString()}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><TrendingDown className="w-3 h-3 text-red-500" /> Total Debits</div>
          <div className="text-xl font-semibold text-red-600">£{totalDebits.toLocaleString()}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Circle className="w-3 h-3 text-orange-500" /> Unreconciled</div>
          <div className="text-xl font-semibold text-orange-600">{unreconciled}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search transactions..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={reconciled} onValueChange={setReconciled}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="no">Unreconciled</SelectItem>
            <SelectItem value="yes">Reconciled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="rent_receipt">Rent Receipt</SelectItem>
            <SelectItem value="service_charge_receipt">Service Charge</SelectItem>
            <SelectItem value="ground_rent_receipt">Ground Rent</SelectItem>
            <SelectItem value="contractor_payment">Contractor</SelectItem>
            <SelectItem value="fuel">Fuel</SelectItem>
            <SelectItem value="business_expense">Business Expense</SelectItem>
            <SelectItem value="unknown">Uncategorised</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-8"></th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No transactions. Import a Lloyds CSV to get started.</td></tr>
            ) : filtered.map(t => (
              <tr key={t.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  {t.reconciled
                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                    : <Circle className="w-4 h-4 text-muted-foreground/40" />}
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{t.transaction_date ? format(new Date(t.transaction_date), 'dd MMM yyyy') : '—'}</td>
                <td className="px-4 py-3 max-w-xs truncate">{t.description}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[t.category] || categoryColors.unknown}`}>
                    {t.category?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${t.amount >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {t.amount >= 0 ? '+' : ''}£{Math.abs(t.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(t)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(t.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EntityFormDialog
          title="Edit Transaction"
          schema={schema}
          initialData={editing}
          onSave={(d) => updateMutation.mutate({ id: editing.id, data: d })}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}