import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

const DEFAULT_FILTERS = {
  search: '',
  property_status: 'all',
  rent_status: 'all',
  postcode_area: '',
  tenancy_expiring_days: 'all',
  property_type: 'all',
};

export default function PropertySearchFilters({ filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });
  const reset = () => onChange(DEFAULT_FILTERS);
  const hasActive = Object.entries(filters).some(([k, v]) => v && v !== 'all' && v !== DEFAULT_FILTERS[k]);

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search properties, tenants, postcodes..."
          value={filters.search}
          onChange={e => update('search', e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={filters.property_status} onValueChange={v => update('property_status', v)}>
        <SelectTrigger className="w-38">
          <SelectValue placeholder="Occupancy" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="occupied">Occupied</SelectItem>
          <SelectItem value="vacant">Vacant</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.rent_status} onValueChange={v => update('rent_status', v)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Rent Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Rent</SelectItem>
          <SelectItem value="current">Current</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="partial">Partial</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.tenancy_expiring_days} onValueChange={v => update('tenancy_expiring_days', v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Expiring" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any Expiry</SelectItem>
          <SelectItem value="30">Expiring in 30d</SelectItem>
          <SelectItem value="60">Expiring in 60d</SelectItem>
          <SelectItem value="90">Expiring in 90d</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.property_type} onValueChange={v => update('property_type', v)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="freehold_block">Freehold Block</SelectItem>
          <SelectItem value="leasehold_block">Leasehold Block</SelectItem>
          <SelectItem value="house">House</SelectItem>
          <SelectItem value="mixed_use">Mixed Use</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="Postcode area"
        value={filters.postcode_area}
        onChange={e => update('postcode_area', e.target.value)}
        className="w-32"
      />

      {hasActive && (
        <Button variant="ghost" size="sm" onClick={reset} className="gap-1 text-muted-foreground">
          <X className="w-3 h-3" /> Clear
        </Button>
      )}
    </div>
  );
}

export { DEFAULT_FILTERS };