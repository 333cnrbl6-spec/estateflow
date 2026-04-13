import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Plus, Search, FileUp, Download, MoreHorizontal, Pencil, Trash2, Calendar, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { useDemoFilter } from '@/hooks/useDemoFilter';
import { format, differenceInDays, parseISO } from 'date-fns';
import AlertConfigDialog from '@/components/compliance/AlertConfigDialog';

const CERT_TYPES = {
  gas_safety: 'Gas Safety (CP12)',
  eicr: 'Electrical (EICR)',
  fire_safety: 'Fire Safety',
  asbestos: 'Asbestos Survey',
  legionella: 'Legionella Risk',
  pat_testing: 'PAT Testing',
  boiler_service: 'Boiler Service',
  lift_safety: 'Lift Safety',
  other: 'Other'
};

const getStatusColor = (cert) => {
  if (cert.status === 'expired') return 'bg-destructive/10 text-destructive';
  if (cert.status === 'expiring_soon') return 'bg-amber-100 text-amber-900';
  return 'bg-green-100 text-green-900';
};

const getDaysUntilExpiry = (expiryDate) => {
  const days = differenceInDays(parseISO(expiryDate), new Date());
  return days;
};

const calculateStatus = (expiryDate, alertDays = 30) => {
  const daysLeft = getDaysUntilExpiry(expiryDate);
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= alertDays) return 'expiring_soon';
  return 'valid';
};

export default function CertificateCompliance() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const queryClient = useQueryClient();
  const { propertyIds } = useDemoFilter();

  const { data: certificates = [] } = useQuery({
    queryKey: ['certificates', propertyIds],
    queryFn: async () => {
      if (propertyIds) {
        const all = await base44.entities.SafetyCertificate.list('-created_date');
        return all.filter(c => propertyIds.includes(c.property_id));
      }
      return base44.entities.SafetyCertificate.list('-created_date');
    }
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties', propertyIds],
    queryFn: async () => {
      if (propertyIds) {
        const allProps = await base44.entities.Property.list();
        return allProps.filter(p => propertyIds.includes(p.id));
      }
      return base44.entities.Property.list();
    }
  });

  const propMap = properties.reduce((m, p) => { m[p.id] = p.name; return m; }, {});

  const createMutation = useMutation({
    mutationFn: async (data) => {
      let documentUrl = data.document_url;
      if (selectedFile) {
        const uploadRes = await base44.integrations.Core.UploadFile({ file: selectedFile });
        documentUrl = uploadRes.file_url;
      }
      return base44.entities.SafetyCertificate.create({
        ...data,
        document_url: documentUrl,
        status: calculateStatus(data.expiry_date, data.alert_days)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      setDialogOpen(false);
      setSelectedFile(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      let documentUrl = data.document_url;
      if (selectedFile) {
        const uploadRes = await base44.integrations.Core.UploadFile({ file: selectedFile });
        documentUrl = uploadRes.file_url;
      }
      return base44.entities.SafetyCertificate.update(id, {
        ...data,
        document_url: documentUrl,
        status: calculateStatus(data.expiry_date, data.alert_days)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      setDialogOpen(false);
      setEditing(null);
      setSelectedFile(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SafetyCertificate.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['certificates'] })
  });

  const filtered = certificates.filter(c => {
    const matchSearch = !search || propMap[c.property_id]?.toLowerCase().includes(search.toLowerCase()) || c.certificate_number?.includes(search);
    const matchType = filterType === 'all' || c.certificate_type === filterType;
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const expiringCerts = certificates.filter(c => c.status === 'expiring_soon').length;
  const expiredCerts = certificates.filter(c => c.status === 'expired').length;

  const { data: alertConfigs = [] } = useQuery({
    queryKey: ['alert-configs'],
    queryFn: () => base44.entities.ComplianceAlertConfig.list(),
  });
  const activeConfigs = alertConfigs.filter(c => c.enabled);

  const handleSave = (data) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <AlertConfigDialog open={configDialogOpen} onClose={setConfigDialogOpen} />
      <PageHeader title="Certificate Compliance" subtitle={`${certificates.length} safety certificates tracked`}>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setConfigDialogOpen(true)} 
            size="sm"
            className="gap-2"
          >
            <Bell className="w-4 h-4" />
            {activeConfigs.length > 0 ? `${activeConfigs.length} Alerts Active` : 'Configure Alerts'}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditing(null); setSelectedFile(null); }} size="sm">
                <Plus className="w-4 h-4 mr-1.5" /> Add Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Certificate' : 'Add Certificate'}</DialogTitle>
              </DialogHeader>
              <CertificateForm
                cert={editing}
                properties={properties}
                onSave={handleSave}
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                saving={createMutation.isPending || updateMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      {/* Alerts */}
      {(expiringCerts > 0 || expiredCerts > 0) && (
        <div className="mb-6 space-y-2">
          {expiredCerts > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">{expiredCerts} certificate{expiredCerts !== 1 ? 's' : ''} expired</p>
                <p className="text-destructive/70">Immediate action required</p>
              </div>
            </div>
          )}
          {expiringCerts > 0 && (
            <div className="bg-amber-100 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-900 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900">{expiringCerts} certificate{expiringCerts !== 1 ? 's' : ''} expiring soon</p>
                <p className="text-amber-800">Renew within 30 days</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search certificates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(CERT_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="valid">Valid</SelectItem>
            <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(cert => {
            const daysLeft = getDaysUntilExpiry(cert.expiry_date);
            return (
              <div key={cert.id} className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-foreground">{CERT_TYPES[cert.certificate_type]}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(cert)}`}>
                        {cert.status === 'expired' ? 'Expired' : cert.status === 'expiring_soon' ? `${daysLeft} days` : 'Valid'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{propMap[cert.property_id] || 'Property'}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {cert.certificate_number && <span>Cert: {cert.certificate_number}</span>}
                      {cert.issue_date && <span>Issued: {format(parseISO(cert.issue_date), 'dd MMM yyyy')}</span>}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Expires: {format(parseISO(cert.expiry_date), 'dd MMM yyyy')}
                      </span>
                      {cert.issuing_body && <span>By: {cert.issuing_body}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {cert.document_url && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(cert.document_url)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(cert); setDialogOpen(true); }}>
                          <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(cert.id)}>
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={AlertTriangle}
          title="No certificates found"
          description="Add safety certificates to track compliance"
          actionLabel="Add Certificate"
          onAction={() => { setEditing(null); setDialogOpen(true); }}
        />
      )}
    </div>
  );
}

function CertificateForm({ cert, properties, onSave, onFileSelect, selectedFile, saving }) {
  const [data, setData] = React.useState(cert || {
    property_id: '',
    certificate_type: 'gas_safety',
    issue_date: '',
    expiry_date: '',
    certificate_number: '',
    issuing_body: '',
    alert_days: 30,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1">Property *</label>
        <Select value={data.property_id} onValueChange={(val) => setData({...data, property_id: val})}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Certificate Type *</label>
        <Select value={data.certificate_type} onValueChange={(val) => setData({...data, certificate_type: val})}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(CERT_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium block mb-1">Issue Date</label>
          <input type="date" value={data.issue_date} onChange={(e) => setData({...data, issue_date: e.target.value})} className="w-full px-3 py-2 border border-input rounded-md text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Expiry Date *</label>
          <input type="date" value={data.expiry_date} onChange={(e) => setData({...data, expiry_date: e.target.value})} className="w-full px-3 py-2 border border-input rounded-md text-sm" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium block mb-1">Certificate #</label>
          <input type="text" placeholder="e.g., CP12-123456" value={data.certificate_number} onChange={(e) => setData({...data, certificate_number: e.target.value})} className="w-full px-3 py-2 border border-input rounded-md text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Issuing Body</label>
          <input type="text" value={data.issuing_body} onChange={(e) => setData({...data, issuing_body: e.target.value})} className="w-full px-3 py-2 border border-input rounded-md text-sm" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Alert Days Before Expiry</label>
        <input type="number" value={data.alert_days} onChange={(e) => setData({...data, alert_days: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-input rounded-md text-sm" min="1" />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Upload Document</label>
        <input 
          type="file" 
          onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
          className="w-full text-sm"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        {selectedFile && <p className="text-xs text-green-600 mt-1">File selected: {selectedFile.name}</p>}
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Notes</label>
        <textarea value={data.notes} onChange={(e) => setData({...data, notes: e.target.value})} placeholder="Additional notes..." className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none" rows="2" />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={!data.property_id || !data.expiry_date || saving}>
          {saving ? 'Saving...' : 'Save Certificate'}
        </Button>
      </div>
    </form>
  );
}