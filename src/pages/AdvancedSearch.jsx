import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Calendar, MapPin, Building2, Users, FileText, Hammer } from 'lucide-react';

export default function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', region: '', status: '' });

  // Mock search results
  const allResults = [
    { id: 1, type: 'property', title: '123 Main Street, London', description: 'Office building', region: 'London', matches: ['123 Main Street', 'Main', 'London'] },
    { id: 2, type: 'tenant', title: 'John Smith', email: 'john@example.com', property: '123 Main Street', matches: ['John', 'Smith'] },
    { id: 3, type: 'maintenance', title: 'Roof Repair - 456 Oak Avenue', status: 'completed', description: 'Water damage repair', matches: ['Roof', 'Repair'] },
    { id: 4, type: 'document', title: 'Gas Safety Certificate 2025', property: '789 Pine Road', matches: ['Gas Safety', 'Certificate'] },
    { id: 5, type: 'property', title: '456 Oak Avenue, Manchester', description: 'Retail unit', region: 'Manchester', matches: ['Oak Avenue', 'Manchester'] },
    { id: 6, type: 'tenant', title: 'Sarah Johnson', email: 'sarah@example.com', property: '456 Oak Avenue', matches: ['Sarah', 'Johnson'] },
    { id: 7, type: 'maintenance', title: 'Boiler Service - 123 Main Street', status: 'pending', description: 'Annual boiler inspection', matches: ['Boiler', 'Service'] },
    { id: 8, type: 'document', title: 'Lease Agreement - John Smith', property: '123 Main Street', matches: ['Lease', 'Agreement'] },
    { id: 9, type: 'financial', title: 'Rent Payment - October 2025', amount: '£1,500', property: '123 Main Street', matches: ['Rent', 'Payment', 'October'] },
    { id: 10, type: 'property', title: '789 Pine Road, Bristol', description: 'Residential complex', region: 'Bristol', matches: ['Pine Road', 'Bristol'] }
  ];

  const filteredResults = useMemo(() => {
    let results = allResults;

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(r => {
        const searchFields = [r.title, r.description, r.email, r.property].filter(Boolean).join(' ').toLowerCase();
        return searchFields.includes(q);
      });
    }

    // Type filter
    if (searchType !== 'all') {
      results = results.filter(r => r.type === searchType);
    }

    // Region filter
    if (filters.region) {
      results = results.filter(r => r.region?.includes(filters.region));
    }

    return results;
  }, [query, searchType, filters]);

  const typeIcons = {
    property: Building2,
    tenant: Users,
    maintenance: Hammer,
    document: FileText,
    financial: () => <span>💰</span>
  };

  const getIcon = (type) => {
    const IconComponent = typeIcons[type];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Search className="w-8 h-8 text-blue-600" />
            Advanced Search
          </h1>
          <p className="text-lg text-slate-600">Search across all your properties, tenants, documents & more</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by property, tenant, document, maintenance..."
            className="pl-12 py-3 text-base"
            autoFocus
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Type</label>
            <select
              value={searchType}
              onChange={e => setSearchType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">All Types</option>
              <option value="property">Properties</option>
              <option value="tenant">Tenants</option>
              <option value="maintenance">Maintenance</option>
              <option value="document">Documents</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Region</label>
            <select
              value={filters.region}
              onChange={e => setFilters(prev => ({ ...prev, region: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="">All Regions</option>
              <option value="London">London</option>
              <option value="Manchester">Manchester</option>
              <option value="Bristol">Bristol</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Date From</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={e => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Date To</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={e => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="text-sm"
            />
          </div>
        </div>

        {/* Results */}
        <div>
          <p className="text-sm font-semibold text-slate-600 mb-4">
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
          </p>

          <div className="space-y-3">
            {filteredResults.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-slate-500">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No results found. Try a different search.</p>
                </CardContent>
              </Card>
            ) : (
              filteredResults.map(result => (
                <Card key={result.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1 text-slate-400">
                          {getIcon(result.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{result.title}</p>
                          {result.description && (
                            <p className="text-sm text-slate-600 mt-1">{result.description}</p>
                          )}
                          {result.property && (
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {result.property}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {result.matches?.slice(0, 3).map((match, i) => (
                              <Badge key={i} variant="outline" className="text-xs font-normal">
                                {match}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Badge className="capitalize">
                        {result.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Saved Searches */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base">💾 Save Your Search</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 mb-3">Save this search to access it later quickly</p>
            <Button variant="outline" size="sm" disabled={!query}>
              Save Search
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}