import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookUser, Plus, Search, MoreHorizontal, Pencil, Trash2, Mail, Phone, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import EntityFormDialog from '@/components/shared/EntityFormDialog';

const CONTACT_FIELDS = [
  { name: 'full_name', type: 'string' },
  { name: 'email', type: 'string' },
  { name: 'phone', type: 'string' },
  { name: 'contact_type', type: 'string', enumValues: ['director', 'contractor', 'solicitor', 'accountant', 'agent', 'surveyor', 'managing_agent', 'insurance_broker', 'other'] },
  { name: 'company_name', type: 'string' },
  { name: 'address', type: 'string' },
  { name: 'notes', type: 'string' },
];

export default function Contacts() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: contacts = [] } = useQuery({ queryKey: ['contacts'], queryFn: () => base44.entities.Contact.list('-created_date') });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Contact.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contacts'] }); setDialogOpen(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Contact.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contacts'] }); setDialogOpen(false); setEditing(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Contact.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const filtered = contacts.filter(c => {
    const matchSearch = !search || c.full_name?.toLowerCase().includes(search.toLowerCase()) || c.company_name?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || c.contact_type === filterType;
    return matchSearch && matchType;
  });

  const handleSave = (data) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Contacts" subtitle="Directors, contractors, solicitors and more">
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Add Contact
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {['director', 'contractor', 'solicitor', 'accountant', 'agent', 'surveyor', 'managing_agent', 'insurance_broker', 'other'].map(t =>
              <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, ' ')}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(contact => (
            <div key={contact.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {contact.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{contact.full_name}</h3>
                    <p className="text-[11px] text-muted-foreground capitalize">{contact.contact_type?.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100"><MoreHorizontal className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditing(contact); setDialogOpen(true); }}><Pencil className="w-3.5 h-3.5 mr-2" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(contact.id)}><Trash2 className="w-3.5 h-3.5 mr-2" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-1">
                {contact.company_name && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Building2 className="w-3 h-3" /> {contact.company_name}</p>}
                {contact.email && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Mail className="w-3 h-3" /> {contact.email}</p>}
                {contact.phone && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone className="w-3 h-3" /> {contact.phone}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={BookUser} title="No contacts found" description="Add your first contact" actionLabel="Add Contact" onAction={() => { setEditing(null); setDialogOpen(true); }} />
      )}

      <EntityFormDialog
        open={dialogOpen} onOpenChange={setDialogOpen}
        title={editing ? 'Edit Contact' : 'Add Contact'}
        fields={CONTACT_FIELDS} initialData={editing}
        onSave={handleSave} saving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}