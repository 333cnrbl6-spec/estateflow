import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  FileText, Upload, Search, Filter, Eye, Download, Trash2,
  Lock, Shield, Users, User, Building2, Wrench, ChevronDown,
  CheckCircle2, AlertCircle, Clock, Plus, ExternalLink, X, Loader2
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import SmartDropZone from '@/components/onboarding/SmartDropZone';
import DocumentAIProcessor from '@/components/documents/DocumentAIProcessor';
import ComplianceAlertsPanel from '@/components/documents/ComplianceAlertsPanel';

// ─── Helpers ──────────────────────────────────────────────────────
const DOC_CATEGORIES = {
  tenancy: {
    label: 'Tenancy',
    color: 'bg-blue-100 text-blue-700',
    types: ['tenancy_agreement','lease','deposit_protection_notice','inventory','inspection_report','section_21','section_8'],
  },
  compliance: {
    label: 'Safety & Compliance',
    color: 'bg-red-100 text-red-700',
    types: ['gas_safety_cert','eicr','epc','fire_safety_cert','asbestos_report'],
  },
  financial: {
    label: 'Financial',
    color: 'bg-green-100 text-green-700',
    types: ['service_charge_statement','invoice','rent_statement','ground_rent_demand','bank_statement'],
  },
  legal: {
    label: 'Legal & Notices',
    color: 'bg-amber-100 text-amber-700',
    types: ['eviction_notice','rent_increase','rtm_notice','s20_notice'],
  },
  company: {
    label: 'Company',
    color: 'bg-purple-100 text-purple-700',
    types: ['company_document','maintenance_notice','other'],
  },
};

const ACCESS_ROLE_STYLES = {
  admin:      { icon: Shield, color: 'bg-slate-100 text-slate-600', label: 'Admin only' },
  tenant:     { icon: User, color: 'bg-blue-100 text-blue-700', label: 'Tenant' },
  landlord:   { icon: Building2, color: 'bg-green-100 text-green-700', label: 'Landlord' },
  contractor: { icon: Wrench, color: 'bg-amber-100 text-amber-700', label: 'Contractor' },
};

function getCategoryForType(type) {
  return Object.entries(DOC_CATEGORIES).find(([, cat]) => cat.types.includes(type))?.[0] || 'company';
}

function docTypeLabel(type) {
  return type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Document';
}

function fileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function StatusBadge({ status }) {
  const styles = {
    draft: 'bg-slate-100 text-slate-600',
    generated: 'bg-blue-100 text-blue-700',
    signed: 'bg-green-100 text-green-700',
    filed: 'bg-green-100 text-green-700',
    archived: 'bg-slate-100 text-slate-400',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${styles[status] || styles.draft}`}>{status}</span>;
}

// ─── Upload Dialog ────────────────────────────────────────────────
function UploadDialog({ open, onClose, properties, tenants }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: '', document_type: 'other', access_roles: ['admin'],
    property_id: '', tenant_id: '', status: 'filed',
  });
  const [saving, setSaving] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  const onClassified = ({ file, file_url, classification }) => {
    setUploadedFile({ file_url, file_name: file.name, file_size_bytes: file.size });
    const typeMap = {
      tenancy_agreement: 'tenancy_agreement', rent_ledger: 'rent_statement',
      bank_statement: 'bank_statement', invoice: 'invoice',
      gas_safety_cert: 'gas_safety_cert', property_list: 'other',
    };
    const suggestedType = typeMap[classification?.document_type] || 'other';
    setForm(f => ({
      ...f,
      document_type: suggestedType,
      title: f.title || (file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')),
    }));
  };

  // Handle field applications from AI processor
  const onAIExtracted = (extraction) => {
    setAiResult(extraction);
    if (extraction._apply) {
      const map = extraction._apply;
      setForm(f => ({
        ...f,
        ...(map.document_type && { document_type: map.document_type }),
        ...(map.title && { title: map.title }),
        ...(map.expiry_date && { expiry_date: map.expiry_date }),
        ...(map.tags && { tags: map.tags }),
        ...(map.generated_date && { generated_date: map.generated_date }),
        ...(map.notes && { notes: f.notes ? f.notes + '\n' + map.notes : map.notes }),
      }));
    }
  };

  const save = async () => {
    if (!form.title || !uploadedFile) return;
    setSaving(true);
    await base44.entities.Document.create({
      ...form,
      ...uploadedFile,
      source: 'uploaded',
      uploaded_by: (await base44.auth.me())?.email,
      generated_date: new Date().toISOString().split('T')[0],
    });
    qc.invalidateQueries(['documents']);
    setSaving(false);
    onClose();
  };

  const toggleRole = (role) => {
    const roles = form.access_roles || [];
    const next = roles.includes(role) ? roles.filter(r => r !== role) : [...roles, role];
    setForm(f => ({ ...f, access_roles: next.length ? next : ['admin'] }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Upload className="w-5 h-5" /> Upload Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <SmartDropZone onFilesClassified={onClassified} hint="Drop tenancy agreements, certificates, invoices, statements…" />

          {uploadedFile && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> File ready: {uploadedFile.file_name}
            </div>
          )}

          {uploadedFile?.file_url && (
            <DocumentAIProcessor
              fileUrl={uploadedFile.file_url}
              fileName={uploadedFile.file_name}
              onExtracted={onAIExtracted}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-700">Document Title *</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Flat 4 AST 2024" className="mt-1" />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700">Document Type *</label>
              <Select value={form.document_type} onValueChange={v => setForm(f => ({ ...f, document_type: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(DOC_CATEGORIES).map(([, cat]) => (
                    <React.Fragment key={cat.label}>
                      <div className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase">{cat.label}</div>
                      {cat.types.map(t => <SelectItem key={t} value={t}>{docTypeLabel(t)}</SelectItem>)}
                    </React.Fragment>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700">Status</label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['draft','generated','signed','filed','archived'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700">Property</label>
              <Select value={form.property_id} onValueChange={v => setForm(f => ({ ...f, property_id: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>— None —</SelectItem>
                  {(properties || []).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700">Tenant</label>
              <Select value={form.tenant_id} onValueChange={v => setForm(f => ({ ...f, tenant_id: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select tenant" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>— None —</SelectItem>
                  {(tenants || []).map(t => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700">Expiry Date (for certificates)</label>
              <Input type="date" value={form.expiry_date || ''} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} className="mt-1" />
            </div>
          </div>

          {/* Access control */}
          <div className="border rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold">Access Control</span>
            </div>
            <p className="text-xs text-muted-foreground">Who can view this document in their portal?</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ACCESS_ROLE_STYLES).map(([role, style]) => {
                const active = (form.access_roles || []).includes(role);
                const Icon = style.icon;
                return (
                  <button key={role} onClick={() => role !== 'admin' && toggleRole(role)}
                    disabled={role === 'admin'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      active ? style.color + ' border-current' : 'border-border text-muted-foreground hover:border-primary/50'
                    } ${role === 'admin' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <Icon className="w-3 h-3" />{style.label}
                    {role === 'admin' && <Lock className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.title || !uploadedFile}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving…</> : 'Save Document'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Document Row ─────────────────────────────────────────────────
function DocumentRow({ doc, property, tenant, onDelete }) {
  const cat = getCategoryForType(doc.document_type);
  const catStyle = DOC_CATEGORIES[cat];
  const roles = doc.access_roles || ['admin'];
  const isExpired = doc.expiry_date && new Date(doc.expiry_date) < new Date();
  const expiringSoon = doc.expiry_date && !isExpired &&
    (new Date(doc.expiry_date) - new Date()) < 30 * 24 * 60 * 60 * 1000;

  return (
    <tr className="hover:bg-slate-50 transition-colors border-b last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate max-w-xs">{doc.title}</p>
            <p className="text-xs text-muted-foreground">{doc.file_name || ''} {fileSize(doc.file_size_bytes) && `· ${fileSize(doc.file_size_bytes)}`}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catStyle?.color}`}>
          {docTypeLabel(doc.document_type)}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{property?.name || '—'}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{tenant?.full_name || '—'}</td>
      <td className="px-4 py-3">
        {doc.expiry_date ? (
          <div className={`flex items-center gap-1 text-xs ${isExpired ? 'text-red-600' : expiringSoon ? 'text-amber-600' : 'text-slate-500'}`}>
            {isExpired ? <AlertCircle className="w-3 h-3" /> : expiringSoon ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
            {doc.expiry_date}
          </div>
        ) : '—'}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {roles.map(r => {
            const s = ACCESS_ROLE_STYLES[r];
            if (!s) return null;
            const Icon = s.icon;
            return (
              <span key={r} className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1 ${s.color}`}>
                <Icon className="w-2.5 h-2.5" />{s.label}
              </span>
            );
          })}
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={doc.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {doc.file_url && (
            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-7 w-7" title="View"><Eye className="w-3.5 h-3.5" /></Button>
            </a>
          )}
          {doc.file_url && (
            <a href={doc.file_url} download>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Download"><Download className="w-3.5 h-3.5" /></Button>
            </a>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" title="Delete" onClick={() => onDelete(doc.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function DocumentRepository() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAccess, setFilterAccess] = useState('all');
  const [showUpload, setShowUpload] = useState(false);

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-generated_date', 200),
  });
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('name', 200),
  });
  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => base44.entities.Tenant.list('full_name', 200),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => qc.invalidateQueries(['documents']),
  });

  const propertyMap = Object.fromEntries(properties.map(p => [p.id, p]));
  const tenantMap = Object.fromEntries(tenants.map(t => [t.id, t]));

  const filtered = documents.filter(doc => {
    const matchSearch = !search || doc.title?.toLowerCase().includes(search.toLowerCase()) ||
      doc.document_type?.includes(search.toLowerCase()) ||
      propertyMap[doc.property_id]?.name?.toLowerCase().includes(search.toLowerCase()) ||
      tenantMap[doc.tenant_id]?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || getCategoryForType(doc.document_type) === filterType;
    const matchAccess = filterAccess === 'all' || (doc.access_roles || []).includes(filterAccess);
    return matchSearch && matchType && matchAccess;
  });

  // Stats
  const expiredCount = documents.filter(d => d.expiry_date && new Date(d.expiry_date) < new Date()).length;
  const expiringCount = documents.filter(d => {
    if (!d.expiry_date || new Date(d.expiry_date) < new Date()) return false;
    return (new Date(d.expiry_date) - new Date()) < 30 * 24 * 60 * 60 * 1000;
  }).length;
  const tenantAccessCount = documents.filter(d => (d.access_roles || []).includes('tenant')).length;
  const landlordAccessCount = documents.filter(d => (d.access_roles || []).includes('landlord')).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" /> Document Repository
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Secure storage for tenancy agreements, certificates, invoices and notices.</p>
        </div>
        <Button onClick={() => setShowUpload(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Documents', value: documents.length, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Tenant Access', value: tenantAccessCount, icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Landlord Access', value: landlordAccessCount, icon: Building2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Expiring / Expired', value: expiringCount + expiredCount, icon: AlertCircle, color: expiredCount > 0 ? 'text-red-600' : 'text-amber-600', bg: expiredCount > 0 ? 'bg-red-50' : 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents, properties, tenants…" className="pl-9" />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44"><Filter className="w-4 h-4 mr-1" /><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(DOC_CATEGORIES).map(([k, cat]) => (
              <SelectItem key={k} value={k}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterAccess} onValueChange={setFilterAccess}>
          <SelectTrigger className="w-40"><Lock className="w-4 h-4 mr-1" /><SelectValue placeholder="Access" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Access</SelectItem>
            <SelectItem value="admin">Admin only</SelectItem>
            <SelectItem value="tenant">Tenant visible</SelectItem>
            <SelectItem value="landlord">Landlord visible</SelectItem>
            <SelectItem value="contractor">Contractor visible</SelectItem>
          </SelectContent>
        </Select>

        {(search || filterType !== 'all' || filterAccess !== 'all') && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterType('all'); setFilterAccess('all'); }}>
            <X className="w-4 h-4" /> Clear
          </Button>
        )}

        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} document{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Compliance Alerts */}
      <ComplianceAlertsPanel documents={documents} propertyMap={propertyMap} />

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b">
                {['Document', 'Type', 'Property', 'Tenant', 'Expires', 'Access', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="w-10 h-10 opacity-30" />
                      <p className="font-medium">No documents found</p>
                      <p className="text-sm">Upload your first document to get started.</p>
                      <Button size="sm" onClick={() => setShowUpload(true)} className="mt-2 gap-1"><Plus className="w-4 h-4" /> Upload Document</Button>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(doc => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  property={propertyMap[doc.property_id]}
                  tenant={tenantMap[doc.tenant_id]}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload dialog */}
      <UploadDialog open={showUpload} onClose={() => setShowUpload(false)} properties={properties} tenants={tenants} />
    </div>
  );
}