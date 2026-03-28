import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DoorOpen, Plus, Search, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/shared/PageHeader';
import SampleDataBanner from '@/components/shared/SampleDataBanner';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import EntityFormDialog from '@/components/shared/EntityFormDialog';

const UNIT_FIELDS = [
  { name: 'unit_reference', type: 'string', label: 'Unit Reference' },
  { name: 'property_id', type: 'string', label: 'Property ID' },
  { name: 'floor', type: 'string' },
  { name: 'bedrooms', type: 'number' },
  { name: 'unit_type', type: 'string', enumValues: ['flat', 'apartment', 'penthouse', 'studio', 'maisonette', 'house', 'commercial'] },
  { name: 'tenure', type: 'string', enumValues: ['leasehold', 'freehold', 'assured_shorthold', 'assured', 'regulated'] },
  { name: 'status', type: 'string', enumValues: ['occupied', 'vacant', 'under_renovation', 'sold'] },
  { name: 'monthly_rent', type: 'number', label: 'Monthly Rent (£)' },
  { name: 'annual_ground_rent', type: 'number', label: 'Annual Ground Rent (£)' },
  { name: 'annual_service_charge', type: 'number', label: 'Annual Service Charge (£)' },
  { name: 'lease_start_date', type: 'string', format: 'date' },
  { name: 'lease_end_date', type: 'string', format: 'date' },
  { name: 'lease_term_years', type: 'number' },
  { name: 'lease_remaining_years', type: 'number' },
  { name: 'notes', type: 'string' },
];

export default function Units() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: units = [] } = useQuery({ queryKey: ['units'], queryFn: () => base44.entities.Unit.list('-created_date') });
  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: () => base44.entities.Property.list() });

  const propMap = properties.reduce((m, p) => { m[p.id] = p.name; return m; }, {});

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Unit.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['units'] }); setDialogOpen(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Unit.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['units'] }); setDialogOpen(false); setEditing(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Unit.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['units'] }),
  });

  const filtered = units.filter(u => {
    const matchSearch = !search || u.unit_reference?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = (data) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Units & Leases" subtitle={`${units.length} units across all properties`}>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Add Unit
        </Button>
      </PageHeader>

      <SampleDataBanner entity="unit rent figures, lease terms and service charge amounts — estimated from public listings" />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search units..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {['occupied', 'vacant', 'under_renovation', 'sold'].map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs">Unit</TableHead>
                <TableHead className="text-xs">Property</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Tenure</TableHead>
                <TableHead className="text-xs">Rent/mo</TableHead>
                <TableHead className="text-xs">Ground Rent/yr</TableHead>
                <TableHead className="text-xs">Service Charge/yr</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(unit => (
                <TableRow key={unit.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-sm">{unit.unit_reference}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{propMap[unit.property_id] || '—'}</TableCell>
                  <TableCell className="text-sm capitalize">{unit.unit_type?.replace(/_/g, ' ') || '—'}</TableCell>
                  <TableCell className="text-sm capitalize">{unit.tenure?.replace(/_/g, ' ') || '—'}</TableCell>
                  <TableCell className="text-sm">{unit.monthly_rent ? `£${unit.monthly_rent.toLocaleString()}` : '—'}</TableCell>
                  <TableCell className="text-sm">{unit.annual_ground_rent ? `£${unit.annual_ground_rent.toLocaleString()}` : '—'}</TableCell>
                  <TableCell className="text-sm">{unit.annual_service_charge ? `£${unit.annual_service_charge.toLocaleString()}` : '—'}</TableCell>
                  <TableCell><StatusBadge status={unit.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(unit); setDialogOpen(true); }}><Pencil className="w-3.5 h-3.5 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(unit.id)}><Trash2 className="w-3.5 h-3.5 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState icon={DoorOpen} title="No units found" description="Add your first unit" actionLabel="Add Unit" onAction={() => { setEditing(null); setDialogOpen(true); }} />
      )}

      <EntityFormDialog
        open={dialogOpen} onOpenChange={setDialogOpen}
        title={editing ? 'Edit Unit' : 'Add Unit'}
        fields={UNIT_FIELDS} initialData={editing}
        onSave={handleSave} saving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}