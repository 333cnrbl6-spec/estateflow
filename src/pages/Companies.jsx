import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Search, ExternalLink, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import EntityFormDialog from '@/components/shared/EntityFormDialog';
import { useDemoFilter } from '@/hooks/useDemoFilter';

const COMPANY_FIELDS = [
  { name: 'name', type: 'string', label: 'Company Name' },
  { name: 'company_number', type: 'string', label: 'Companies House No.' },
  { name: 'status', type: 'string', enumValues: ['active', 'dissolved', 'dormant', 'in_liquidation'] },
  { name: 'category', type: 'string', enumValues: ['core_property', 'freehold', 'rtm_management', 'service_charge_vehicle', 'investment', 'international', 'other'] },
  { name: 'region', type: 'string', enumValues: ['london', 'brighton', 'blackpool', 'ipswich', 'leeds', 'other'] },
  { name: 'registered_address', type: 'string' },
  { name: 'incorporation_date', type: 'string', format: 'date' },
  { name: 'notes', type: 'string' },
];

const categoryLabels = {
  core_property: 'Core Property', freehold: 'Freehold', rtm_management: 'RTM / Management',
  service_charge_vehicle: 'Service Charge', investment: 'Investment', international: 'International', other: 'Other'
};

export default function Companies() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();
  const { demoCompanyId } = useDemoFilter();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies', demoCompanyId],
    queryFn: async () => {
      if (demoCompanyId) {
        return [await base44.entities.Company.get(demoCompanyId)];
      }
      return base44.entities.Company.list('-created_date');
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Company.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['companies'] }); setDialogOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Company.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['companies'] }); setDialogOpen(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Company.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });

  const filtered = companies.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.company_number?.includes(search);
    const matchCategory = filterCategory === 'all' || c.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleSave = (data) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Companies" subtitle={`${companies.length} companies in the group`}>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Add Company
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(company => (
            <div key={company.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground leading-tight">{company.name}</h3>
                    {company.company_number && (
                      <a
                        href={`https://find-and-update.company-information.service.gov.uk/company/${company.company_number}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5"
                      >
                        {company.company_number} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditing(company); setDialogOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(company.id)}>
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <StatusBadge status={company.status} />
                {company.category && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                    {categoryLabels[company.category] || company.category}
                  </span>
                )}
                {company.region && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground capitalize">{company.region}</span>
                )}
              </div>
              {company.registered_address && (
                <p className="text-xs text-muted-foreground mt-3 truncate">{company.registered_address}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Building2} title="No companies found" description="Add your first company to get started" actionLabel="Add Company" onAction={() => { setEditing(null); setDialogOpen(true); }} />
      )}

      <EntityFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Edit Company' : 'Add Company'}
        fields={COMPANY_FIELDS}
        initialData={editing}
        onSave={handleSave}
        saving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}