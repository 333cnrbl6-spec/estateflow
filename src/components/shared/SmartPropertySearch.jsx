import React, { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

export default function SmartPropertySearch({ properties = [], tenants = [], onFilterChange }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    rent_status: 'all',
    postcode_area: 'all',
    tenancy_expiring: 'all',
    property_type: 'all',
  });

  const filteredResults = useMemo(() => {
    return properties.filter(p => {
      // Search filter
      const searchMatch = !search || 
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.address_line_1?.toLowerCase().includes(search.toLowerCase()) ||
        p.postcode?.toLowerCase().includes(search.toLowerCase());

      // Property status
      const statusMatch = filters.status === 'all' || p.status === filters.status;

      // Property type
      const typeMatch = filters.property_type === 'all' || p.property_type === filters.property_type;

      // Postcode area (first part e.g., "SW1")
      const postcodeMatch = filters.postcode_area === 'all' || 
        p.postcode?.split(' ')[0]?.toUpperCase() === filters.postcode_area;

      // Rent status (check related tenant)
      let rentMatch = filters.rent_status === 'all';
      if (filters.rent_status !== 'all') {
        const tenant = tenants.find(t => t.property_id === p.id);
        rentMatch = filters.rent_status === 'current' ? tenant?.status === 'active' :
                   filters.rent_status === 'overdue' ? tenant?.status === 'in_arrears' :
                   filters.rent_status === 'partial' ? tenant?.status === 'partial_arrears' : false;
      }

      // Tenancy expiring
      let tenancyMatch = filters.tenancy_expiring === 'all';
      if (filters.tenancy_expiring !== 'all') {
        const tenant = tenants.find(t => t.property_id === p.id);
        if (tenant?.tenancy_end_date) {
          const daysLeft = Math.floor((new Date(tenant.tenancy_end_date) - new Date()) / (1000 * 60 * 60 * 24));
          tenancyMatch = (filters.tenancy_expiring === '30' && daysLeft > 0 && daysLeft <= 30) ||
                        (filters.tenancy_expiring === '60' && daysLeft > 0 && daysLeft <= 60) ||
                        (filters.tenancy_expiring === '90' && daysLeft > 0 && daysLeft <= 90);
        }
      }

      return searchMatch && statusMatch && typeMatch && postcodeMatch && rentMatch && tenancyMatch;
    });
  }, [search, filters, properties, tenants]);

  const handleClearFilters = () => {
    setSearch('');
    setFilters({
      status: 'all',
      rent_status: 'all',
      postcode_area: 'all',
      tenancy_expiring: 'all',
      property_type: 'all',
    });
  };

  const isFiltered = search || Object.values(filters).some(v => v !== 'all');

  React.useEffect(() => {
    onFilterChange?.(filteredResults);
  }, [filteredResults, onFilterChange]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, address, or postcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
          <SelectTrigger className="text-xs h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="vacant">Vacant</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.rent_status} onValueChange={(v) => setFilters({...filters, rent_status: v})}>
          <SelectTrigger className="text-xs h-9">
            <SelectValue placeholder="Rent Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rent</SelectItem>
            <SelectItem value="current">Current</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.postcode_area} onValueChange={(v) => setFilters({...filters, postcode_area: v})}>
          <SelectTrigger className="text-xs h-9">
            <SelectValue placeholder="Area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
            <SelectItem value="SW1">SW1</SelectItem>
            <SelectItem value="E1">E1</SelectItem>
            <SelectItem value="N1">N1</SelectItem>
            <SelectItem value="W1">W1</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.tenancy_expiring} onValueChange={(v) => setFilters({...filters, tenancy_expiring: v})}>
          <SelectTrigger className="text-xs h-9">
            <SelectValue placeholder="Expiring" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tenancies</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="60">60 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.property_type} onValueChange={(v) => setFilters({...filters, property_type: v})}>
          <SelectTrigger className="text-xs h-9">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="flat">Flat</SelectItem>
            <SelectItem value="terraced">Terraced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredResults.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">{filteredResults.length} results</p>
      )}
    </div>
  );
}