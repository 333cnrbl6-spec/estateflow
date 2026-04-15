import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Wrench, Plus, Search, LayoutGrid, List, Filter, X,
  User, Phone, Mail, Calendar, DollarSign, Loader2, CheckCircle2
} from 'lucide-react';
import MaintenanceKanban from '@/components/maintenance/MaintenanceKanban';
import CostSummaryDialog from '@/components/maintenance/CostSummaryDialog';

const EMPTY_ORDER = {
  title: '', description: '', priority: 'standard', status: 'reported',
  category: 'general', scheduled_date: '', estimated_cost: '',
  actual_cost: '', notes: '',
};

// ─── Job Edit Dialog ──────────────────────────────────────────────
function JobDialog({ open, onClose, order, properties, contacts }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(order || EMPTY_ORDER);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => { setForm(order || EMPTY_ORDER); }, [order]);

  const save = async () => {
    setSaving(true);
    if (form.id) {
      await base44.entities.MaintenanceOrder.update(form.id, form);
    } else {
      await base44.entities.MaintenanceOrder.create(form);
    }
    qc.invalidateQueries(['maintenance_orders']);
    setSaving(false);
    onClose();
  };

  const contractors = (contacts || []).filter(c => c.contact_type === 'contractor');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            {form.id ? 'Edit Job' : 'New Maintenance Job'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-700">Job Title *</label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Boiler repair — Flat 4" className="mt-1" />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-700">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe the issue…" rows={3}
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Priority</label>
            <Select value={form.priority} onValueChange={v => set('priority', v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['emergency','urgent','standard','low'].map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Category</label>
            <Select value={form.category} onValueChange={v => set('category', v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['plumbing','electrical','structural','roofing','decorating','landscaping','cleaning','fire_safety','lift','security','general','other'].map(c => (
                  <SelectItem key={c} value={c} className="capitalize">{c.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Status</label>
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['reported','assigned','in_progress','completed','cancelled'].map(s => (
                  <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Property</label>
            <Select value={form.property_id || ''} onValueChange={v => set('property_id', v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select property" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>— None —</SelectItem>
                {(properties || []).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Assign Contractor</label>
            <Select value={form.assigned_contractor_id || ''} onValueChange={v => {
              const c = contractors.find(x => x.id === v);
              set('assigned_contractor_id', v);
              set('assigned_contractor_name', c?.full_name || '');
              set('assigned_contractor_phone', c?.phone || '');
              set('assigned_contractor_email', c?.email || '');
            }}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select contractor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>— Unassigned —</SelectItem>
                {contractors.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}{c.company_name ? ` (${c.company_name})` : ''}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {form.assigned_contractor_name && (
            <div className="col-span-2 bg-slate-50 rounded-lg p-3 flex items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{form.assigned_contractor_name}</div>
              {form.assigned_contractor_phone && <div className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{form.assigned_contractor_phone}</div>}
              {form.assigned_contractor_email && <div className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{form.assigned_contractor_email}</div>}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-700">Scheduled Date</label>
            <Input type="date" value={form.scheduled_date || ''} onChange={e => set('scheduled_date', e.target.value)} className="mt-1" />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Estimated Cost (£)</label>
            <Input type="number" min="0" value={form.estimated_cost || ''} onChange={e => set('estimated_cost', e.target.value)} placeholder="0.00" className="mt-1" />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Actual Cost (£)</label>
            <Input type="number" min="0" value={form.actual_cost || ''} onChange={e => set('actual_cost', e.target.value)} placeholder="0.00" className="mt-1" />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Completed Date</label>
            <Input type="date" value={form.completed_date || ''} onChange={e => set('completed_date', e.target.value)} className="mt-1" />
          </div>

          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-700">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Internal notes…"
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving || !form.title}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Saving…</> : form.id ? 'Save Changes' : 'Create Job'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assign Contractor Quick Dialog ───────────────────────────────
function AssignDialog({ open, onClose, order, contacts }) {
  const qc = useQueryClient();
  const [contractorId, setContractorId] = useState('');
  const [saving, setSaving] = useState(false);
  const contractors = (contacts || []).filter(c => c.contact_type === 'contractor');

  const assign = async () => {
    const c = contractors.find(x => x.id === contractorId);
    if (!c || !order) return;
    setSaving(true);
    await base44.entities.MaintenanceOrder.update(order.id, {
      assigned_contractor_id: c.id,
      assigned_contractor_name: c.full_name,
      assigned_contractor_phone: c.phone || '',
      assigned_contractor_email: c.email || '',
      status: 'assigned',
      assigned_date: new Date().toISOString(),
    });
    qc.invalidateQueries(['maintenance_orders']);
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Contractor</DialogTitle>
        </DialogHeader>
        {order && <p className="text-sm text-muted-foreground mt-1">{order.title}</p>}
        <Select value={contractorId} onValueChange={setContractorId}>
          <SelectTrigger><SelectValue placeholder="Select contractor" /></SelectTrigger>
          <SelectContent>
            {contractors.map(c => (
              <SelectItem key={c.id} value={c.id}>
                {c.full_name}{c.company_name ? ` — ${c.company_name}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={assign} disabled={!contractorId || saving}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
            Assign & Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function MaintenanceBoard() {
  const qc = useQueryClient();
  const [editOrder, setEditOrder] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [assignOrder, setAssignOrder] = useState(null);
  const [costOrder, setCostOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');

  const { data: orders = [] } = useQuery({
    queryKey: ['maintenance_orders'],
    queryFn: () => base44.entities.MaintenanceOrder.list('-created_date', 500),
  });
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('name', 200),
  });
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('full_name', 200),
  });

  // Cleanup subscriptions on unmount to prevent memory leaks
  React.useEffect(() => {
    const unsubOrders = base44.entities.MaintenanceOrder.subscribe(() => {
      qc.invalidateQueries(['maintenance_orders']);
    });
    const unsubProperties = base44.entities.Property.subscribe(() => {
      qc.invalidateQueries(['properties']);
    });
    const unsubContacts = base44.entities.Contact.subscribe(() => {
      qc.invalidateQueries(['contacts']);
    });

    return () => {
      if (typeof unsubOrders === 'function') unsubOrders();
      if (typeof unsubProperties === 'function') unsubProperties();
      if (typeof unsubContacts === 'function') unsubContacts();
    };
  }, [qc]);

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.title?.toLowerCase().includes(search.toLowerCase()) ||
      o.assigned_contractor_name?.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === 'all' || o.priority === filterPriority;
    const matchProp = filterProperty === 'all' || o.property_id === filterProperty;
    return matchSearch && matchPriority && matchProp;
  });

  // Cost summary: get all orders for a property
  const costOrders = costOrder
    ? orders.filter(o => o.property_id === costOrder.property_id)
    : [];
  const costProperty = properties.find(p => p.id === costOrder?.property_id);

  // Stats
  const totalValue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.estimated_cost || 0), 0);
  const openJobs = orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length;
  const unassigned = orders.filter(o => !o.assigned_contractor_id && !['completed', 'cancelled'].includes(o.status)).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary" /> Maintenance Board
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Track all maintenance jobs from request to completion.</p>
        </div>
        <Button onClick={() => { setEditOrder(null); setShowEdit(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> New Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open Jobs', value: openJobs, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Unassigned', value: unassigned, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Completed', value: orders.filter(o => o.status === 'completed').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Value', value: `£${totalValue.toLocaleString()}`, color: 'text-slate-700', bg: 'bg-slate-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl border p-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs or contractors…" className="pl-9" />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {['emergency','urgent','standard','low'].map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterProperty} onValueChange={setFilterProperty}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Property" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {(search || filterPriority !== 'all' || filterProperty !== 'all') && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterPriority('all'); setFilterProperty('all'); }}>
            <X className="w-4 h-4" /> Clear
          </Button>
        )}
      </div>

      {/* Kanban board */}
      <MaintenanceKanban
        orders={filtered}
        properties={properties}
        onEdit={order => { setEditOrder(order); setShowEdit(true); }}
        onAssign={order => setAssignOrder(order)}
        onViewCost={order => setCostOrder(order)}
        onAdd={status => { setEditOrder({ ...EMPTY_ORDER, status }); setShowEdit(true); }}
      />

      {/* Dialogs */}
      <JobDialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        order={editOrder}
        properties={properties}
        contacts={contacts}
      />
      <AssignDialog
        open={!!assignOrder}
        onClose={() => setAssignOrder(null)}
        order={assignOrder}
        contacts={contacts}
      />
      <CostSummaryDialog
        open={!!costOrder}
        onClose={() => setCostOrder(null)}
        orders={costOrders}
        property={costProperty}
      />
    </div>
  );
}