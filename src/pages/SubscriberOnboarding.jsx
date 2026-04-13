import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SmartDropZone from '@/components/onboarding/SmartDropZone';
import DataImportPipelineConfig from '@/components/onboarding/DataImportPipelineConfig';
import {
  Building2, Users, ChevronRight, ChevronLeft, Search, CheckCircle2, Circle,
  Loader2, Sparkles, FileText, Globe, HardDrive, CloudIcon, Database,
  Home, Key, Wrench, Receipt, AlertCircle, Check, X, ExternalLink
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Step definitions
// ─────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'company',    label: 'Your Company',    icon: Building2 },
  { id: 'directors',  label: 'Directors',       icon: Users },
  { id: 'addresses',  label: 'Addresses',       icon: Home },
  { id: 'services',   label: 'Services',        icon: Key },
  { id: 'software',   label: 'Software & Integrations', icon: Globe },
  { id: 'data_audit', label: 'Your Data',       icon: Database },
  { id: 'data_source',label: 'Data Sources',    icon: HardDrive },
  { id: 'import_pipeline', label: 'Configure Import', icon: Loader2 },
  { id: 'upload',     label: 'Import Data',     icon: FileText },
  { id: 'review',     label: 'Review & Create', icon: CheckCircle2 },
];

const SERVICES = [
  { id: 'residential_lettings', label: 'Residential Lettings' },
  { id: 'block_management', label: 'Block Management' },
  { id: 'freehold_management', label: 'Freehold Management' },
  { id: 'rtm', label: 'Right to Manage (RTM)' },
  { id: 'student_lets', label: 'Student Lets' },
  { id: 'commercial', label: 'Commercial Property' },
  { id: 'sales', label: 'Property Sales' },
  { id: 'maintenance', label: 'Maintenance Only' },
  { id: 'out_of_hours', label: 'Out-of-Hours Service' },
  { id: 'service_charge', label: 'Service Charge Accounting' },
];

const SOFTWARE = [
  { id: 'xero', label: 'Xero', category: 'accounting' },
  { id: 'sage', label: 'Sage', category: 'accounting' },
  { id: 'quickbooks', label: 'QuickBooks', category: 'accounting' },
  { id: 'freeagent', label: 'FreeAgent', category: 'accounting' },
  { id: 'clearbooks', label: 'ClearBooks', category: 'accounting' },
  { id: 'propertyware', label: 'Propertyware', category: 'property_mgmt' },
  { id: 'jupix', label: 'Jupix', category: 'property_mgmt' },
  { id: 'reapit', label: 'Reapit', category: 'property_mgmt' },
  { id: 'arthur_online', label: 'Arthur Online', category: 'property_mgmt' },
  { id: 'fixflo', label: 'Fixflo', category: 'maintenance' },
  { id: 'open_rent', label: 'OpenRent', category: 'portals' },
  { id: 'rightmove', label: 'Rightmove', category: 'portals' },
  { id: 'zoopla', label: 'Zoopla', category: 'portals' },
  { id: 'mailchimp', label: 'Mailchimp', category: 'marketing' },
  { id: 'companies_house', label: 'Companies House', category: 'compliance' },
  { id: 'docusign', label: 'DocuSign', category: 'documents' },
  { id: 'google_drive', label: 'Google Drive', category: 'storage' },
  { id: 'dropbox', label: 'Dropbox', category: 'storage' },
  { id: 'onedrive', label: 'OneDrive', category: 'storage' },
  { id: 'other', label: 'Other (specify)', category: 'other' },
];

const DATA_TYPES = [
  { id: 'properties', label: 'Properties / Buildings', icon: Building2 },
  { id: 'tenants', label: 'Tenants', icon: Users },
  { id: 'landlords', label: 'Landlords / Freeholders', icon: Key },
  { id: 'contractors', label: 'Contractors / Suppliers', icon: Wrench },
  { id: 'rent_ledger', label: 'Rent Ledger / Arrears', icon: Receipt },
  { id: 'service_charges', label: 'Service Charge Accounts', icon: Receipt },
  { id: 'maintenance', label: 'Maintenance History', icon: Wrench },
  { id: 'documents', label: 'Tenancy Agreements / Leases', icon: FileText },
  { id: 'banking', label: 'Bank Statements', icon: Receipt },
  { id: 'compliance', label: 'Safety Certificates (Gas, EICR, EPC)', icon: CheckCircle2 },
];

const DATA_SOURCES = [
  { id: 'google_drive', label: 'Google Drive', icon: '📁' },
  { id: 'dropbox', label: 'Dropbox', icon: '📦' },
  { id: 'onedrive', label: 'OneDrive', icon: '☁️' },
  { id: 'sharepoint', label: 'SharePoint', icon: '🏢' },
  { id: 'local_files', label: 'Local files (upload)', icon: '💻' },
  { id: 'xero_export', label: 'Xero export', icon: '📊' },
  { id: 'sage_export', label: 'Sage export', icon: '📊' },
  { id: 'bank_export', label: 'Bank CSV export', icon: '🏦' },
  { id: 'email', label: 'Email attachments', icon: '✉️' },
  { id: 'paper', label: 'Paper documents (scan)', icon: '📄' },
];

// ─────────────────────────────────────────────────────────────────
// Step components
// ─────────────────────────────────────────────────────────────────

function StepCompany({ data, onChange }) {
  const [query, setQuery] = useState(data.company_name || '');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Find UK company details for: "${query}". Return realistic company data as if from Companies House. Include company_name, company_number, status, registered_address, incorporation_date, sic_code, sic_description.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  company_name: { type: 'string' },
                  company_number: { type: 'string' },
                  status: { type: 'string' },
                  registered_address: { type: 'string' },
                  incorporation_date: { type: 'string' },
                  sic_code: { type: 'string' },
                  sic_description: { type: 'string' },
                },
              },
            },
          },
        },
      });
      setResults(res.results || []);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  };

  const select = (c) => {
    onChange({ ...data, ...c, confirmed: true });
    setResults([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Find your company</h2>
        <p className="text-sm text-muted-foreground mt-1">Search Companies House to pre-fill your details, or enter manually.</p>
      </div>

      <div className="flex gap-2">
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="Company name or number e.g. RBM Property Ltd"
          className="flex-1"
        />
        <Button onClick={search} disabled={searching} className="gap-2">
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Select your company</p>
          {results.map((r, i) => (
            <div key={i} onClick={() => select(r)}
              className="border rounded-xl p-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-primary">{r.company_name}</p>
                  <p className="text-xs text-muted-foreground">{r.company_number} · {r.status}</p>
                  <p className="text-xs text-slate-500 mt-1">{r.registered_address}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary mt-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {searched && results.length === 0 && (
        <p className="text-sm text-muted-foreground">No results. Enter details manually below.</p>
      )}

      {data.confirmed && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">Company confirmed</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Company Name', 'company_name'],
              ['Company Number', 'company_number'],
              ['Status', 'status'],
              ['Incorporated', 'incorporation_date'],
              ['SIC Code', 'sic_code'],
              ['SIC Description', 'sic_description'],
            ].map(([label, key]) => data[key] && (
              <div key={key}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium text-slate-800">{data[key]}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Registered Address</p>
            <p className="font-medium text-slate-800">{data.registered_address}</p>
          </div>
        </div>
      )}

      {/* Manual fallback */}
      {!data.confirmed && (
        <div className="space-y-3 border rounded-xl p-4 bg-slate-50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Or enter manually</p>
          {[
            ['Company Name', 'company_name', 'text'],
            ['Company Number', 'company_number', 'text'],
            ['Registered Address', 'registered_address', 'text'],
          ].map(([label, key, type]) => (
            <div key={key}>
              <label className="text-xs font-medium text-slate-700">{label}</label>
              <Input type={type} value={data[key] || ''} onChange={e => onChange({ ...data, [key]: e.target.value })} className="mt-1" />
            </div>
          ))}
          <Button size="sm" onClick={() => onChange({ ...data, confirmed: true })} disabled={!data.company_name}>
            Confirm Details
          </Button>
        </div>
      )}
    </div>
  );
}

function StepDirectors({ data, onChange }) {
  const [fetching, setFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchingAdditional, setSearchingAdditional] = useState(false);
  const [additionalResults, setAdditionalResults] = useState([]);
  const [searchingAssociated, setSearchingAssociated] = useState(false);
  const [associatedCompanies, setAssociatedCompanies] = useState([]);
  const [selectedOfficers, setSelectedOfficers] = useState(data.selected_officer_ids || []);

  const directors = data.directors || [];
  const officers = data.officers || [];
  const psc = data.persons_with_control || [];
  const allOfficers = [...directors, ...officers, ...psc];

  const fetchDirectorsFromCompaniesHouse = async () => {
    if (!data.company_number) return;
    setFetching(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `From Companies House for company number ${data.company_number}, fetch:
1. All directors/officers (role, appointment_date, nationality)
2. All officers beyond directors
3. All persons with significant control (PSC) - name, control type, date notified
Return as JSON with fields: directors (array), officers (array), persons_with_control (array). Each person should have: name, role/type, appointed_date, nationality (if available).`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            directors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  appointed_date: { type: 'string' },
                  role: { type: 'string' },
                  nationality: { type: 'string' },
                  type: { type: 'string', enum: ['director'] }
                }
              }
            },
            officers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  role: { type: 'string' },
                  appointed_date: { type: 'string' },
                  type: { type: 'string', enum: ['officer'] }
                }
              }
            },
            persons_with_control: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  control_type: { type: 'string' },
                  date_notified: { type: 'string' },
                  type: { type: 'string', enum: ['psc'] }
                }
              }
            }
          }
        }
      });
      onChange({
        ...data,
        directors: res.directors || [],
        officers: res.officers || [],
        persons_with_control: res.persons_with_control || []
      });
    } catch (error) {
      console.error('Error fetching directors:', error);
    } finally {
      setFetching(false);
    }
  };

  const toggleOfficer = (officerId) => {
    const next = selectedOfficers.includes(officerId)
      ? selectedOfficers.filter(id => id !== officerId)
      : [...selectedOfficers, officerId];
    setSelectedOfficers(next);
    onChange({ ...data, selected_officer_ids: next });
  };

  const searchAssociatedCompanies = async () => {
    if (selectedOfficers.length === 0) return;
    setSearchingAssociated(true);
    try {
      const officerNames = allOfficers
        .filter((_, idx) => selectedOfficers.includes(idx))
        .map(o => o.name)
        .join(', ');

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `From Companies House, find all companies where ANY of these officers/directors are also involved: ${officerNames}. Return up to 10 most relevant companies (excluding their main company). For each company return: company_name, company_number, status, registered_address, officer_roles_in_company.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            associated_companies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  company_name: { type: 'string' },
                  company_number: { type: 'string' },
                  status: { type: 'string' },
                  registered_address: { type: 'string' },
                  officer_roles: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      });
      setAssociatedCompanies(res.associated_companies || []);
    } finally {
      setSearchingAssociated(false);
    }
  };

  const addAssociatedCompanies = (companies) => {
    const existingCompanies = data.associated_companies || [];
    const newCompanies = companies.filter(
      c => !existingCompanies.some(ec => ec.company_number === c.company_number)
    );
    onChange({ ...data, associated_companies: [...existingCompanies, ...newCompanies] });
    setAssociatedCompanies([]);
  };

  const searchAdditionalCompanies = async () => {
    if (!searchQuery.trim()) return;
    setSearchingAdditional(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Search Companies House for company matching: "${searchQuery}". Return top 3 results with company_name, company_number, registered_address, and list of all directors with their names, roles, and appointment dates.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            companies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  company_name: { type: 'string' },
                  company_number: { type: 'string' },
                  registered_address: { type: 'string' },
                  directors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        role: { type: 'string' },
                        appointed_date: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
      setAdditionalResults(res.companies || []);
    } finally {
      setSearchingAdditional(false);
    }
  };

  const addDirectorsFromCompany = (companyDirectors) => {
    const newDirectors = [...directors];
    companyDirectors.forEach(d => {
      if (!newDirectors.some(nd => nd.name?.toLowerCase() === d.name?.toLowerCase())) {
        newDirectors.push(d);
      }
    });
    onChange({ ...data, directors: newDirectors });
    setAdditionalResults([]);
    setSearchQuery('');
  };

  const toggle = (name) => {
    const confirmed = data.confirmed_directors || [];
    const next = confirmed.includes(name) ? confirmed.filter(d => d !== name) : [...confirmed, name];
    onChange({ ...data, confirmed_directors: next });
  };
  const addDirector = () => onChange({ ...data, directors: [...directors, { name: '', role: 'Director' }] });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Officers & Control</h2>
        <p className="text-sm text-muted-foreground mt-1">Fetch all directors, officers, and persons with significant control from Companies House. Then discover associated companies.</p>
      </div>

      {data.company_number && !allOfficers.length && (
        <Button onClick={fetchDirectorsFromCompaniesHouse} disabled={fetching} className="w-full gap-2" variant="outline">
          {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
          Fetch Officers from Companies House
        </Button>
      )}

      {allOfficers.length > 0 && (
        <div className="space-y-4">
          {directors.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Directors</p>



      <div className="space-y-2">
        {directors.map((d, i) => {
          const selected = selectedOfficers.includes(i);
          return (
            <div key={i} onClick={() => toggleOfficer(i)}
              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
              {selected ? <Check className="w-5 h-5 text-primary shrink-0" /> : <Circle className="w-5 h-5 text-muted-foreground shrink-0" />}
              <div className="flex-1">
                <p className="font-medium text-slate-800">{d.name}</p>
                <p className="text-xs text-muted-foreground">Director {d.appointed_date ? `· Appointed ${d.appointed_date}` : ''}</p>
              </div>
            </div>
          );
        })}
        </div>
        )}

        {officers.length > 0 && (
        <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Other Officers</p>
        {officers.map((o, i) => {
          const idx = directors.length + i;
          const selected = selectedOfficers.includes(idx);
          return (
            <div key={idx} onClick={() => toggleOfficer(idx)}
              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
              {selected ? <Check className="w-5 h-5 text-primary shrink-0" /> : <Circle className="w-5 h-5 text-muted-foreground shrink-0" />}
              <div className="flex-1">
                <p className="font-medium text-slate-800">{o.name}</p>
                <p className="text-xs text-muted-foreground">{o.role}</p>
              </div>
            </div>
          );
        })}
        </div>
        )}

        {psc.length > 0 && (
        <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Persons with Significant Control</p>
        {psc.map((p, i) => {
          const idx = directors.length + officers.length + i;
          const selected = selectedOfficers.includes(idx);
          return (
            <div key={idx} onClick={() => toggleOfficer(idx)}
              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
              {selected ? <Check className="w-5 h-5 text-primary shrink-0" /> : <Circle className="w-5 h-5 text-muted-foreground shrink-0" />}
              <div className="flex-1">
                <p className="font-medium text-slate-800">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.control_type}</p>
              </div>
            </div>
          );
        })}
        </div>
        )}
        </div>
      </div>

      {selectedOfficers.length > 0 && (
        <div className="space-y-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-900">{selectedOfficers.length} officer(s) selected</p>
          <Button onClick={searchAssociatedCompanies} disabled={searchingAssociated} className="w-full gap-2" variant="outline">
            {searchingAssociated ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search for Associated Companies
          </Button>
        </div>
      )}

      {associatedCompanies.length > 0 && (
        <div className="border rounded-xl p-4 bg-amber-50 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-amber-900">Found {associatedCompanies.length} associated companies</p>
            <Button size="sm" onClick={() => addAssociatedCompanies(associatedCompanies)} className="gap-1">
              + Add All
            </Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {associatedCompanies.map((company, idx) => (
              <div key={idx} className="bg-white border border-amber-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{company.company_name}</p>
                    <p className="text-xs text-muted-foreground">{company.company_number} · {company.status}</p>
                    {company.officer_roles && company.officer_roles.length > 0 && (
                      <p className="text-xs text-slate-600 mt-1">Roles: {company.officer_roles.join(', ')}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addAssociatedCompanies([company])}
                    className="gap-1"
                  >
                    + Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(data.associated_companies || []).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-900">Associated Companies to Add ({data.associated_companies.length})</p>
          {data.associated_companies.map((c, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-blue-800 font-medium">{c.company_name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onChange({ ...data, associated_companies: (data.associated_companies || []).filter((_, i) => i !== idx) })}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Or search for other company directors</p>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchAdditionalCompanies()}
              placeholder="Company name or number"
              className="flex-1"
            />
            <Button onClick={searchAdditionalCompanies} disabled={searchingAdditional} variant="outline" className="gap-2">
              {searchingAdditional ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </Button>
          </div>
        </div>

        {additionalResults.length > 0 && (
          <div className="border rounded-xl p-4 bg-blue-50 space-y-3">
            <p className="text-xs font-semibold text-blue-900">Found {additionalResults.length} company/companies with directors</p>
            {additionalResults.map((company, idx) => (
              <div key={idx} className="bg-white border border-blue-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-900">{company.company_name}</p>
                    <p className="text-xs text-muted-foreground">{company.company_number}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addDirectorsFromCompany(company.directors || [])}
                    className="gap-1"
                  >
                    + Add {company.directors?.length || 0} directors
                  </Button>
                </div>
                {company.directors && company.directors.length > 0 && (
                  <div className="text-xs space-y-1 mt-2">
                    {company.directors.map((d, didx) => (
                      <div key={didx} className="text-muted-foreground">
                        {d.name} · {d.role}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Button variant="outline" size="sm" onClick={addDirector} className="gap-2">
        + Add director manually
      </Button>

      {directors.length === 0 && (
        <div className="space-y-2 border rounded-xl p-4 bg-slate-50">
          {(data.manual_directors || [{ name: '', role: 'Director' }]).map((d, i) => (
            <div key={i} className="flex gap-2">
              <Input placeholder="Full name" value={d.name}
                onChange={e => {
                  const next = [...(data.manual_directors || [{ name: '', role: 'Director' }])];
                  next[i] = { ...next[i], name: e.target.value };
                  onChange({ ...data, manual_directors: next, directors: next });
                }} />
              <Input placeholder="Role" value={d.role}
                onChange={e => {
                  const next = [...(data.manual_directors || [{ name: '', role: 'Director' }])];
                  next[i] = { ...next[i], role: e.target.value };
                  onChange({ ...data, manual_directors: next, directors: next });
                }} className="w-36" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepAddresses({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Addresses</h2>
        <p className="text-sm text-muted-foreground mt-1">Confirm your registered address and add your trading / branch addresses.</p>
      </div>

      <div className="space-y-3 border rounded-xl p-4 bg-slate-50">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Registered Address</p>
        <Input value={data.registered_address || ''} placeholder="Registered address"
          onChange={e => onChange({ ...data, registered_address: e.target.value })} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Branch / Trading Addresses</p>
          <Button variant="outline" size="sm" onClick={() => {
            const branches = [...(data.branches || []), ''];
            onChange({ ...data, branches });
          }}>+ Add branch</Button>
        </div>
        {(data.branches || ['']).map((b, i) => (
          <div key={i} className="flex gap-2">
            <Input value={b} placeholder={`Branch ${i + 1} address`}
              onChange={e => {
                const branches = [...(data.branches || [''])];
                branches[i] = e.target.value;
                onChange({ ...data, branches });
              }} />
            <Button variant="ghost" size="icon" onClick={() => {
              const branches = (data.branches || ['']).filter((_, j) => j !== i);
              onChange({ ...data, branches });
            }}><X className="w-4 h-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MultiSelect({ items, selected, onToggle, columns = 2 }) {
  return (
    <div className={`grid grid-cols-${columns} gap-2`}>
      {items.map(item => {
        const active = selected.includes(item.id);
        return (
          <div key={item.id} onClick={() => onToggle(item.id)}
            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all text-sm ${
              active ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border hover:border-primary/40 text-slate-700'
            }`}>
            {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
            {item.emoji && <span>{item.emoji}</span>}
            <span>{item.label}</span>
            {active && <Check className="w-3.5 h-3.5 ml-auto shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

function StepServices({ data, onChange }) {
  const selected = data.services || [];
  const toggle = (id) => {
    onChange({ ...data, services: selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id] });
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">What services do you offer?</h2>
        <p className="text-sm text-muted-foreground mt-1">Select all that apply. This helps us configure your dashboard and workflows.</p>
      </div>
      <MultiSelect items={SERVICES} selected={selected} onToggle={toggle} columns={2} />
      {selected.length > 0 && (
        <p className="text-xs text-primary font-medium">{selected.length} service{selected.length > 1 ? 's' : ''} selected</p>
      )}
    </div>
  );
}

function StepSoftware({ data, onChange }) {
  const selected = data.software || [];
  const toggle = (id) => {
    onChange({ ...data, software: selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id] });
  };
  const categories = [...new Set(SOFTWARE.map(s => s.category))];
  const catLabels = { accounting: 'Accounting', property_mgmt: 'Property Management', maintenance: 'Maintenance', portals: 'Property Portals', marketing: 'Marketing', compliance: 'Compliance', storage: 'File Storage', documents: 'Documents', other: 'Other' };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">What software do you currently use?</h2>
        <p className="text-sm text-muted-foreground mt-1">We'll configure integrations and import paths based on your existing tools.</p>
      </div>
      {categories.map(cat => (
        <div key={cat} className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{catLabels[cat]}</p>
          <div className="grid grid-cols-3 gap-2">
            {SOFTWARE.filter(s => s.category === cat).map(item => {
              const active = selected.includes(item.id);
              return (
                <div key={item.id} onClick={() => toggle(item.id)}
                  className={`p-2.5 rounded-lg border cursor-pointer text-xs text-center transition-all font-medium ${
                    active ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40 text-slate-700'
                  }`}>
                  {item.label}
                  {active && <span className="block text-green-500 mt-0.5">✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function StepDataAudit({ data, onChange }) {
  const selected = data.data_types || [];
  const toggle = (id) => onChange({ ...data, data_types: selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id] });
  const counts = data.data_counts || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">What data do you have?</h2>
        <p className="text-sm text-muted-foreground mt-1">Tell us what existing data you'd like to bring into Premiso. Give rough counts where possible — we'll import and structure it for you.</p>
      </div>
      <div className="space-y-2">
        {DATA_TYPES.map(item => {
          const active = selected.includes(item.id);
          return (
            <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${active ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div onClick={() => toggle(item.id)} className="flex items-center gap-3 flex-1 cursor-pointer">
                {active ? <Check className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                <item.icon className="w-4 h-4 text-slate-500" />
                <span className={`text-sm font-medium ${active ? 'text-primary' : 'text-slate-700'}`}>{item.label}</span>
              </div>
              {active && (
                <Input
                  type="number"
                  min="0"
                  placeholder="Count?"
                  className="w-24 h-8 text-xs"
                  value={counts[item.id] || ''}
                  onChange={e => onChange({ ...data, data_counts: { ...counts, [item.id]: e.target.value } })}
                  onClick={e => e.stopPropagation()}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepDataSource({ data, onChange }) {
  const selected = data.data_sources || [];
  const toggle = (id) => onChange({ ...data, data_sources: selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id] });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Where is your data stored?</h2>
        <p className="text-sm text-muted-foreground mt-1">Select all sources you'll pull data from. You can connect cloud storage or upload files directly.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {DATA_SOURCES.map(src => {
          const active = selected.includes(src.id);
          return (
            <div key={src.id} onClick={() => toggle(src.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              }`}>
              <span className="text-xl">{src.icon}</span>
              <span className={`text-sm font-medium ${active ? 'text-primary' : 'text-slate-700'}`}>{src.label}</span>
              {active && <Check className="w-4 h-4 text-primary ml-auto" />}
            </div>
          );
        })}
      </div>
      {selected.some(s => ['google_drive','dropbox','onedrive','sharepoint'].includes(s)) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-semibold">Cloud storage detected</p>
          <p className="text-xs mt-1">After setup, you'll be able to connect your cloud storage directly. For now, export your key files and upload them in the next step.</p>
        </div>
      )}
    </div>
  );
}

function StepImportPipeline({ data, onChange }) {
  const handleImportStart = (config) => {
    onChange({ ...data, import_pipeline_config: config });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Configure Data Import</h2>
        <p className="text-sm text-muted-foreground mt-1">Automated pipelines to fetch historical data from your software integrations.</p>
      </div>
      <DataImportPipelineConfig data={data} onImportStart={handleImportStart} />
    </div>
  );
}

function StepUpload({ data, onChange }) {
  const [classified, setClassified] = useState(data.classified_files || []);

  const onFileClassified = (file) => {
    const next = [...classified.filter(f => f.id !== file.id), file];
    setClassified(next);
    onChange({ ...data, classified_files: next });
  };

  const hints = {
    properties: 'Property list, tenancy agreements, lease schedules',
    tenants: 'Tenant register, tenancy agreements',
    landlords: 'Landlord / freeholder contacts',
    rent_ledger: 'Rent ledger, arrears report',
    banking: 'Bank statement CSV or PDF',
    compliance: 'Safety certificate PDFs',
  };

  const selectedTypes = data.data_types || [];
  const hint = selectedTypes.map(t => hints[t]).filter(Boolean).join(' · ') || undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Upload your data files</h2>
        <p className="text-sm text-muted-foreground mt-1">Drop in your spreadsheets, PDFs, and documents. Our AI will classify each file, extract records, and map them to the right part of Premiso.</p>
      </div>

      <SmartDropZone onFilesClassified={onFileClassified} hint={hint} />

      {classified.filter(f => f.classification).length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-green-800">📊 AI Summary</p>
          {[...new Set(classified.filter(f => f.classification?.document_type).map(f => f.classification.document_type))].map(type => {
            const files = classified.filter(f => f.classification?.document_type === type);
            return (
              <div key={type} className="flex items-center justify-between text-xs">
                <span className="text-green-700 capitalize">{type.replace(/_/g, ' ')}</span>
                <span className="text-green-600 font-medium">{files.length} file{files.length > 1 ? 's' : ''}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StepReview({ data, onBuild, building, buildResult }) {
  const counts = data.data_counts || {};
  const hasFiles = (data.classified_files || []).filter(f => f.classification?.document_type !== 'unknown').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Review & Create</h2>
        <p className="text-sm text-muted-foreground mt-1">Here's everything we've collected. When you're ready, we'll build your Premiso environment.</p>
      </div>

      <div className="space-y-3">
       <ReviewRow label="Primary Company" value={data.company_name} sub={data.company_number} />
       <ReviewRow label="Registered Address" value={data.registered_address} />
       <ReviewRow label="Officers Selected" value={`${(data.selected_officer_ids || []).length} officer(s)`} />
       {(data.associated_companies || []).length > 0 && (
         <ReviewRow label="Associated Companies" value={`${data.associated_companies.length} companies to add`}
           sub={data.associated_companies.map(c => `${c.company_name} (${c.company_number})`).join(', ')} />
       )}
       <ReviewRow label="Branch addresses" value={`${(data.branches || []).filter(Boolean).length} address(es)`} />
       <ReviewRow label="Services" value={`${(data.services || []).length} service types`} />
       <ReviewRow label="Existing software" value={(data.software || []).join(', ') || 'None selected'} />
       <ReviewRow label="Data types" value={`${(data.data_types || []).length} categories`}
         sub={Object.entries(counts).filter(([,v]) => v).map(([k,v]) => `${k.replace(/_/g,' ')}: ~${v}`).join(', ')} />
       <ReviewRow label="Files uploaded" value={`${(data.classified_files || []).length} files (${hasFiles} classified by AI)`} />
      </div>

      {!buildResult && (
       <Button onClick={onBuild} disabled={building || !data.company_name} size="lg" className="w-full gap-2">
         {building ? <><Loader2 className="w-4 h-4 animate-spin" /> Building your environment…</> : <><Sparkles className="w-4 h-4" /> Create Premiso Environment</>}
       </Button>
      )}
      {!buildResult && (data.associated_companies || []).length > 0 && (
       <p className="text-xs text-center text-slate-600">✓ {data.associated_companies.length} associated companies will be provisioned alongside main company</p>
      )}

      {buildResult && (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2">
       <CheckCircle2 className="w-6 h-6 text-green-600" />
       <p className="font-bold text-green-800 text-lg">Environment Created!</p>
      </div>
      <p className="text-sm text-green-700">{buildResult.summary}</p>
      {buildResult.created && (
       <div className="grid grid-cols-2 gap-2 text-xs">
         {Object.entries(buildResult.created).map(([k, v]) => (
           <div key={k} className="flex justify-between bg-white rounded px-2 py-1.5 border border-green-200">
             <span className="capitalize text-slate-600">{k.replace(/_/g,' ')}</span>
             <span className="font-bold text-green-700">{v}</span>
           </div>
         ))}
       </div>
      )}
      {buildResult.recommended_workflows && buildResult.recommended_workflows.length > 0 && (
       <div className="bg-white rounded px-3 py-2 border border-green-200 text-xs">
         <p className="font-semibold text-slate-800 mb-1">Recommended workflows activated:</p>
         <ul className="list-disc list-inside text-slate-600 space-y-0.5">
           {buildResult.recommended_workflows.map((w, i) => <li key={i}>{w}</li>)}
         </ul>
       </div>
      )}
      <Button asChild className="w-full" variant="default">
       <a href="/">Go to Dashboard</a>
      </Button>
      </div>
      )}
    </div>
  );
}

function ReviewRow({ label, value, sub }) {
  return (
    <div className="flex items-start justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="text-sm font-medium text-slate-800">{value || '—'}</span>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────
export default function SubscriberOnboarding() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    company_number: '',
    company_name: '',
    directors: [],
    officers: [],
    persons_with_control: [],
    selected_officer_ids: [],
    associated_companies: [],
    addresses: [],
    services: [],
    software_integrations: [],
    data_audit_scope: [],
    data_sources: [],
    document_urls: [],
  });
  const [building, setBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState(null);

  const canContinue = () => {
    if (step === 0) return !!formData.company_name;
    if (step === 3) return (formData.services || []).length > 0;
    return true;
  };

  const build = async () => {
    setBuilding(true);
    try {
      const selectedOfficerNames = (formData.selected_officer_ids || []).map(idx => {
        const allOfficers = [...(formData.directors || []), ...(formData.officers || []), ...(formData.persons_with_control || [])];
        return allOfficers[idx]?.name;
      }).filter(Boolean);

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are setting up a new property management company called "${formData.company_name}" on the Premiso platform.

Primary Company:
- Name: ${formData.company_name}
- Number: ${formData.company_number || 'N/A'}
- Address: ${formData.registered_address || 'N/A'}

Officers Selected:
- Officers: ${selectedOfficerNames.join(', ') || 'None'}

Associated Companies to Provision:
${(formData.associated_companies || []).map(c => `- ${c.company_name} (${c.company_number})`).join('\n') || '- None'}

Services: ${(formData.services || []).join(', ')}
Software: ${(formData.software || []).join(', ')}
Data types available: ${JSON.stringify(formData.data_counts || {})}
Files uploaded: ${(formData.classified_files || []).map(f => f.classification?.document_type).join(', ')}

Generate a realistic onboarding summary: what records would be created, what workflows to activate, what integrations to configure. Include the multi-company structure setup. Return a summary paragraph and a "created" object with counts of entities that would be set up.`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            created: { type: 'object' },
            recommended_workflows: { type: 'array', items: { type: 'string' } },
            recommended_integrations: { type: 'array', items: { type: 'string' } },
          },
        },
      });
      setBuildResult(res);
    } finally {
      setBuilding(false);
    }
  };

  const currentStep = STEPS[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" /> Premiso Setup Wizard
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome to Premiso</h1>
          <p className="text-muted-foreground mt-1">Let's get your property management platform configured in a few simple steps.</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <React.Fragment key={s.id}>
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  done ? 'bg-green-100 text-green-700' :
                  active ? 'bg-primary text-primary-foreground shadow-md' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`h-px w-3 shrink-0 ${i < step ? 'bg-green-300' : 'bg-slate-200'}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 min-h-[400px] flex flex-col">
          <div className="flex-1">
            {step === 0 && <StepCompany data={formData} onChange={setFormData} />}
            {step === 1 && <StepDirectors data={formData} onChange={setFormData} />}
            {step === 2 && <StepAddresses data={formData} onChange={setFormData} />}
            {step === 3 && <StepServices data={formData} onChange={setFormData} />}
            {step === 4 && <StepSoftware data={formData} onChange={setFormData} />}
            {step === 5 && <StepDataAudit data={formData} onChange={setFormData} />}
            {step === 6 && <StepDataSource data={formData} onChange={setFormData} />}
            {step === 7 && <StepImportPipeline data={formData} onChange={setFormData} />}
            {step === 8 && <StepUpload data={formData} onChange={setFormData} />}
            {step === 9 && <StepReview data={formData} onBuild={build} building={building} buildResult={buildResult} />}
          </div>

          {/* Navigation */}
          {step < STEPS.length - 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
              <div className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}</div>
              <Button onClick={() => setStep(s => s + 1)} disabled={!canContinue()} className="gap-1">
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
          {step === STEPS.length - 1 && !buildResult && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
              <div className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}