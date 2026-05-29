import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Home, Plus, Search, MoreHorizontal, Pencil, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import EntityFormDialog from '@/components/shared/EntityFormDialog';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PaginationControls from '@/components/shared/PaginationControls';
import { Link } from 'react-router-dom';
import { useDemoFilter } from '@/hooks/useDemoFilter';

const PROPERTY_FIELDS = [
  { name: 'name', type: 'string', label: 'Property Name', required: true },
  { name: 'address_line_1', type: 'string' },
  { name: 'address_line_2', type: 'string' },
  { name: 'city', type: 'string' },
  { name: 'postcode', type: 'string' },
  { name: 'region', type: 'string', enumValues: ['london', 'brighton', 'blackpool', 'ipswich', 'leeds', 'other'] },
  { name: 'property_type', type: 'string', enumValues: ['freehold_block', 'leasehold_block', 'house', 'mixed_use', 'commercial', 'land'] },
  { name: 'ownership_type', type: 'string', enumValues: ['freehold', 'leasehold', 'commonhold'] },
  { name: 'total_units', type: 'number' },
  { name: 'year_built', type: 'number' },
  { name: 'listed_building', type: 'boolean' },
  { name: 'notes', type: 'string' },
];

export default function Properties() {
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const queryClient = useQueryClient();
  const { demoCompanyId } = useDemoFilter();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties', demoCompanyId],
    queryFn: async () => {
      if (demoCompanyId) return base44.entities.Property.filter({ owning_company: demoCompanyId });
      return base44.entities.Property.list('-created_date');
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Property.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['properties'] }); setDialogOpen(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Property.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['properties'] }); setDialogOpen(false); setEditing(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Property.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['properties'] }); setConfirmId(null); },
  });

  const filtered = properties.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.postcode?.toLowerCase().includes(search.toLowerCase());
    const matchRegion = filterRegion === 'all' || p.region === filterRegion;
    return matchSearch && matchRegion;
  });

  const startIdx = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(startIdx, startIdx + pageSize);

  const handleSave = (data) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Properties" subtitle={`${properties.length} propert${properties.length === 1 ? 'y' : 'ies'} in portfolio`}>
        <Button asChild variant="outline" size="sm">
          <Link to="/properties/add">Guided Wizard</Link>
        </Button>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Quick Add
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or postcode…" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9" />
        </div>
        <Select value={filterRegion} onValueChange={(v) => { setFilterRegion(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {['london', 'brighton', 'blackpool', 'ipswich', 'leeds', 'other'].map(r => (
              <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage label="Loading properties…" />
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map(property => (
              <div key={property.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all group">
                <div className="h-28 bg-gradient-to-br from-primary/8 to-primary/4 flex items-center justify-center">
                  <Home className="w-10 h-10 text-primary/25" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-foreground truncate flex-1 mr-2">{property.name}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 flex-shrink-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(property); setDialogOpen(true); }}>
                          <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setConfirmId(property.id)}>
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {(property.address_line_1 || property.city) && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {[property.address_line_1, property.city, property.postcode].filter(Boolean).join(', ')}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {property.property_type && <StatusBadge status={property.property_type} />}
                    {property.ownership_type && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{property.ownership_type}</span>
                    )}
                    {property.total_units > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{property.total_units} units</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <PaginationControls
            currentPage={currentPage}
            pageSize={pageSize}
            hasNextPage={(startIdx + pageSize) < filtered.length}
            hasPreviousPage={currentPage > 1}
            totalItems={filtered.length}
            onNextPage={() => setCurrentPage(c => c + 1)}
            onPreviousPage={() => setCurrentPage(c => Math.max(1, c - 1))}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            pageSizeOptions={[10, 25, 50]}
          />
        </div>
      ) : (
        <EmptyState
          icon="🏠"
          title="No properties found"
          description={search || filterRegion !== 'all' ? 'Try adjusting your search or filter' : 'Add your first property to get started'}
          actionLabel="Add Property"
          onAction={() => { setEditing(null); setDialogOpen(true); }}
        />
      )}

      <EntityFormDialog
        open={dialogOpen} onOpenChange={setDialogOpen}
        title={editing ? 'Edit Property' : 'Add Property'}
        fields={PROPERTY_FIELDS} initialData={editing}
        onSave={handleSave} saving={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(o) => !o && setConfirmId(null)}
        title="Delete Property?"
        description="This will permanently remove the property and cannot be undone."
        onConfirm={() => deleteMutation.mutate(confirmId)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}