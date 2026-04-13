import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wrench, Plus, Search, GripVertical, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useDemoFilter } from '@/hooks/useDemoFilter';
import { format } from 'date-fns';

const WORKFLOW_STAGES = [
  { id: 'reported', label: 'Reported', color: 'bg-slate-100' },
  { id: 'assigned', label: 'Assigned', color: 'bg-blue-100' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-amber-100' },
  { id: 'completed', label: 'Completed', color: 'bg-green-100' }
];

const PRIORITY_COLORS = {
  emergency: 'bg-red-100 text-red-900',
  urgent: 'bg-orange-100 text-orange-900',
  standard: 'bg-blue-100 text-blue-900',
  low: 'bg-gray-100 text-gray-900'
};

export default function MaintenanceWorkflow() {
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const queryClient = useQueryClient();
  const { propertyIds } = useDemoFilter();

  const { data: orders = [] } = useQuery({
    queryKey: ['maintenance', propertyIds],
    queryFn: async () => base44.entities.MaintenanceOrder.list('-created_date', 200)
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

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list()
  });

  const propMap = properties.reduce((m, p) => { m[p.id] = p.name; return m; }, {});
  const contractorMap = contacts.filter(c => c.contact_type === 'contractor').reduce((m, c) => { m[c.id] = c; return m; }, {});

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MaintenanceOrder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      setDialogOpen(false);
      setEditing(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MaintenanceOrder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      setDialogOpen(false);
      setEditing(null);
    }
  });

  const moveToStage = useMutation({
    mutationFn: ({ orderId, newStage }) => {
      const updates = { status: newStage };
      if (newStage === 'in_progress') updates.started_date = new Date().toISOString();
      if (newStage === 'completed') updates.completed_date = new Date().toISOString();
      return base44.entities.MaintenanceOrder.update(orderId, updates);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MaintenanceOrder.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] })
  });

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.title?.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === 'all' || o.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  const kanbanByStage = WORKFLOW_STAGES.reduce((acc, stage) => {
    acc[stage.id] = filtered.filter(o => o.status === stage.id);
    return acc;
  }, {});

  const handleSave = (data) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <PageHeader title="Maintenance Workflow" subtitle="Kanban board for work order management">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); }} size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Order' : 'New Maintenance Order'}</DialogTitle>
            </DialogHeader>
            <MaintenanceForm
              order={editing}
              properties={properties}
              contractors={contacts.filter(c => c.contact_type === 'contractor')}
              onSave={handleSave}
              saving={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            {['emergency', 'urgent', 'standard', 'low'].map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {WORKFLOW_STAGES.map(stage => (
          <div key={stage.id} className={`rounded-lg border border-border p-4 min-h-[600px] ${stage.color}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">{stage.label}</h3>
              <span className="text-xs font-medium bg-black/10 px-2 py-1 rounded">{kanbanByStage[stage.id].length}</span>
            </div>

            <div className="space-y-3">
              {kanbanByStage[stage.id].map(order => (
                <div key={order.id} className="bg-white rounded-lg border border-border p-3 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground line-clamp-2">{order.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{propMap[order.property_id] || 'Property'}</p>
                    </div>
                    <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0" />
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[order.priority]}`}>
                        {order.priority}
                      </span>
                      {order.category && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                          {order.category.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {order.assigned_contractor_name && (
                    <div className="bg-blue-50 rounded p-2 mb-3 text-xs">
                      <p className="font-medium text-blue-900">{order.assigned_contractor_name}</p>
                      {order.assigned_contractor_phone && (
                        <p className="text-blue-800 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {order.assigned_contractor_phone}
                        </p>
                      )}
                    </div>
                  )}

                  {(order.scheduled_date || order.estimated_cost) && (
                    <div className="text-xs text-muted-foreground space-y-1 mb-3 pb-3 border-t border-gray-200">
                      {order.scheduled_date && (
                        <p className="flex items-center gap-1 mt-2">
                          <Calendar className="w-3 h-3" /> {format(new Date(order.scheduled_date), 'dd MMM')}
                        </p>
                      )}
                      {order.estimated_cost && (
                        <p className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> £{order.estimated_cost.toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 text-xs">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => { setEditing(order); setDialogOpen(true); }}
                    >
                      Edit
                    </Button>
                    {stage.id !== 'completed' && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const nextIdx = WORKFLOW_STAGES.findIndex(s => s.id === stage.id) + 1;
                          if (nextIdx < WORKFLOW_STAGES.length) {
                            moveToStage.mutate({ orderId: order.id, newStage: WORKFLOW_STAGES[nextIdx].id });
                          }
                        }}
                      >
                        → Next
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MaintenanceForm({ order, properties, contractors, onSave, saving }) {
  const [data, setData] = React.useState(order || {
    title: '',
    description: '',
    property_id: '',
    priority: 'standard',
    category: 'general',
    status: 'reported',
    assigned_contractor_id: '',
    assigned_contractor_name: '',
    assigned_contractor_phone: '',
    assigned_contractor_email: '',
    estimated_cost: '',
    scheduled_date: '',
    notes: ''
  });

  const handleContractorSelect = (contractorId) => {
    const contractor = contractors.find(c => c.id === contractorId);
    setData({
      ...data,
      assigned_contractor_id: contractorId,
      assigned_contractor_name: contractor?.full_name || '',
      assigned_contractor_phone: contractor?.phone || '',
      assigned_contractor_email: contractor?.email || ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
      <div>
        <label className="text-sm font-medium block mb-1">Title *</label>
        <input type="text" value={data.title} onChange={(e) => setData({...data, title: e.target.value})} className="w-full px-3 py-2 border border-input rounded-md text-sm" required />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Description</label>
        <textarea value={data.description} onChange={(e) => setData({...data, description: e.target.value})} className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none" rows="2" />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Property *</label>
        <Select value={data.property_id} onValueChange={(val) => setData({...data, property_id: val})}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium block mb-1">Priority</label>
          <Select value={data.priority} onValueChange={(val) => setData({...data, priority: val})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['emergency', 'urgent', 'standard', 'low'].map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Category</label>
          <Select value={data.category} onValueChange={(val) => setData({...data, category: val})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['plumbing', 'electrical', 'structural', 'roofing', 'decorating', 'cleaning', 'fire_safety', 'general'].map(c => <SelectItem key={c} value={c} className="capitalize">{c.replace(/_/g, ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Assign Contractor</label>
        <Select value={data.assigned_contractor_id} onValueChange={handleContractorSelect}>
          <SelectTrigger><SelectValue placeholder="Select contractor..." /></SelectTrigger>
          <SelectContent>
            {contractors.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium block mb-1">Scheduled Date</label>
          <input type="date" value={data.scheduled_date} onChange={(e) => setData({...data, scheduled_date: e.target.value})} className="w-full px-3 py-2 border border-input rounded-md text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Est. Cost (£)</label>
          <input type="number" value={data.estimated_cost} onChange={(e) => setData({...data, estimated_cost: e.target.value})} className="w-full px-3 py-2 border border-input rounded-md text-sm" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Notes</label>
        <textarea value={data.notes} onChange={(e) => setData({...data, notes: e.target.value})} className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none" rows="2" />
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button type="button" variant="outline" disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={!data.title || !data.property_id || saving}>
          {saving ? 'Saving...' : 'Save Order'}
        </Button>
      </div>
    </form>
  );
}