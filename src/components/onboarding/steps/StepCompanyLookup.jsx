import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Search, Loader2, ChevronRight } from 'lucide-react';
import { SCHEMAS } from '@/lib/llmSchemas';

export default function StepCompanyLookup({ data, onChange }) {
  const [query, setQuery] = useState(data.company_name || '');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Search Companies House for: "${query}". Return top 5 results with company_name, company_number, status, registered_address, incorporation_date.`,
        add_context_from_internet: true,
        response_json_schema: SCHEMAS.companiesHouseSearch,
      });
      setResults(res.results || []);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  };

  const select = (c) => {
    onChange({ ...data, ...c, company_verified: true });
    setResults([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Find Your Company</h2>
        <p className="text-sm text-muted-foreground mt-1">Search Companies House to auto-populate your profile.</p>
      </div>

      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Company name or number"
          className="flex-1"
        />
        <Button onClick={search} disabled={searching} className="gap-2">
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Select your company</p>
          {results.map((r, i) => (
            <div key={i} onClick={() => select(r)}
              className="border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{r.company_name}</p>
                  <p className="text-xs text-muted-foreground">{r.company_number} • {r.status}</p>
                  <p className="text-xs text-slate-500 mt-1">{r.registered_address}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground mt-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {data.company_verified && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">Company verified</span>
          </div>
          <p className="text-sm text-green-700">{data.company_name}</p>
        </div>
      )}
    </div>
  );
}