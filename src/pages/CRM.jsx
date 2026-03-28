import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Mail, Phone, MessageSquare, FileText, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import EntityFormDialog from '@/components/shared/EntityFormDialog';
import { format } from 'date-fns';

const FIELDS = [
  { name: 'date', label: 'Date', format: 'date' },
  { name: 'interaction_type', label: 'Type', enumValues: ['email','letter','phone_call','meeting','sms','whatsapp','legal_notice','complaint','note'] },
  { name: 'direction', label: 'Direction', enumValues: ['inbound','outbound','internal'] },
  { name: 'contact_name', label: 'Contact Name' },
  { name: 'contact_type', label: 'Contact Type', enumValues: ['tenant','leaseholder','contractor','solicitor','accountant','surveyor','local_authority','tribunal','other'] },
  { name: 'contact_email', label: 'Contact Email' },
  { name: 'contact_phone', label: 'Contact Phone' },
  { name: 'subject', label: 'Subject' },
  { name: 'body', label: 'Body / Summary' },
  { name: 'priority', label: 'Priority', enumValues: ['low','normal','high','urgent'] },
  { name: 'status', label: 'Status', enumValues: ['open','pending_reply','resolved','closed'] },
  { name: 'follow_up_date', label: 'Follow-up Date', format: 'date' },
  { name: 'notes', label: 'Notes' },
];

const typeIcons = {
  email: Mail,
  letter: FileText,
  phone_call: Phone,
  meeting: Calendar,
  sms: MessageSquare,
  whatsapp: MessageSquare,
  legal_notice: FileText,
  complaint: FileText,
  note: FileText,
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-50 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  pending_reply: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-600',
};

export default function CRM() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const queryClient = useQueryClient();

  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ['crm'],
    queryFn: () => base44.entities.CRMInteraction.list('-date', 300),
  });

  const createMutation = useMutation({
    mutationFn: (d) => base44.entities.CRMInteraction.create(d),
    onSuccess: () => { queryClient.invalidateQueries(['crm']); setShowForm(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CRMInteraction.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['crm']); setEditing(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CRMInteraction.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['crm']),
  });

  const filtered = interactions.filter(i => {
    const matchSearch = !search ||
      i.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.subject?.toLowerCase().includes(search.toLowerCase()) ||
      i.body?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || i.interaction_type === typeFilter;
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const open = interactions.filter(i => i.status === 'open').length;
  const pendingReply = interactions.filter(i => i.status === 'pending_reply').length;
  const urgent = interactions.filter(i => i.priority === 'urgent').length;

  return (
    <div className="p-6">
      <PageHeader title="CRM" subtitle="Correspondence, calls and contact log">
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Log Interaction
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">Open</div>
          <div className="text-xl font-semibold text-blue-700">{open}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">Pending Reply</div>
          <div className="text-xl font-semibold text-yellow-700">{pendingReply}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">Urgent</div>
          <div className="text-xl font-semibold text-red-600">{urgent}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search contact, subject..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="letter">Letter</SelectItem>
            <SelectItem value="phone_call">Phone Call</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="legal_notice">Legal Notice</SelectItem>
            <SelectItem value="complaint">Complaint</SelectItem>
            <SelectItem value="note">Note</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="pending_reply">Pending Reply</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">No interactions logged yet</div>
        ) : filtered.map(i => {
          const Icon = typeIcons[i.interaction_type] || FileText;
          const isExpanded = expanded === i.id;
          return (
            <div key={i.id} className="bg-card border rounded-lg overflow-hidden">
              <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/20" onClick={() => setExpanded(isExpanded ? null : i.id)}>
                <div className="mt-0.5 p-2 rounded-lg bg-muted">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{i.contact_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[i.priority]}`}>{i.priority}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[i.status]}`}>{i.status?.replace(/_/g, ' ')}</span>
                    {i.direction === 'inbound' ? <ArrowDownLeft className="w-3 h-3 text-green-500" /> : <ArrowUpRight className="w-3 h-3 text-blue-500" />}
                  </div>
                  <div className="text-sm font-medium mt-0.5">{i.subject}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex gap-3">
                    <span>{i.date ? format(new Date(i.date), 'dd MMM yyyy') : '—'}</span>
                    <span className="capitalize">{i.interaction_type?.replace(/_/g, ' ')}</span>
                    {i.contact_type && <span className="capitalize">{i.contact_type?.replace(/_/g, ' ')}</span>}
                    {i.follow_up_date && <span className="text-orange-600">Follow-up: {format(new Date(i.follow_up_date), 'dd MMM')}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditing(i); }}>Edit</Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(i.id); }}>Delete</Button>
                </div>
              </div>
              {isExpanded && i.body && (
                <div className="px-4 pb-4 pt-0 border-t bg-muted/10">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{i.body}</p>
                  {i.notes && <p className="text-xs text-muted-foreground mt-2 italic">{i.notes}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <EntityFormDialog
        open={showForm || !!editing}
        onOpenChange={(o) => { if (!o) { setShowForm(false); setEditing(null); } }}
        title={editing ? 'Edit Interaction' : 'Log Interaction'}
        fields={FIELDS}
        initialData={editing || {}}
        onSave={(d) => editing ? updateMutation.mutate({ id: editing.id, data: d }) : createMutation.mutate(d)}
      />
    </div>
  );
}