import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

const CERT_TYPE_LABELS = {
  gas_safety: 'Gas Safety (CP12)',
  eicr: 'EICR',
  fire_safety: 'Fire Risk Assessment',
  asbestos: 'Asbestos Survey',
  legionella: 'Legionella Risk Assessment',
  pat_testing: 'PAT Testing',
  boiler_service: 'Boiler Service',
  lift_safety: 'Lift Safety',
  other: 'Other',
};

const CONFIDENCE_COLOURS = {
  high: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  medium: 'text-amber-700 bg-amber-50 border-amber-200',
  low: 'text-red-700 bg-red-50 border-red-200',
};

export default function CertificateUploadDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState('upload'); // upload | parsing | review | saving | done
  const [fileUrl, setFileUrl] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState(null);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties-for-cert-upload'],
    queryFn: () => base44.entities.Property.list('-created_date', 100),
    enabled: open,
  });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setStep('parsing');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFileUrl(file_url);
      const res = await base44.functions.invoke('parseCertificateDocument', { file_url });
      const data = res.data?.extracted || {};
      setExtracted(data);
      setForm({
        certificate_type: data.certificate_type || 'other',
        issue_date: data.issue_date || '',
        expiry_date: data.expiry_date || '',
        certificate_number: data.certificate_number || '',
        issuing_body: data.issuing_body || '',
        status: data.status || 'valid',
        notes: data.outcome_notes || '',
        property_id: '',
      });
      setStep('review');
    } catch (err) {
      setError(err.message);
      setStep('upload');
    }
  };

  const handleSave = async () => {
    if (!form.property_id) { setError('Please select a property.'); return; }
    if (!form.expiry_date) { setError('Expiry date is required before saving.'); return; }
    setError(null);
    setStep('saving');
    try {
      await base44.entities.SafetyCertificate.create({
        property_id: form.property_id,
        certificate_type: form.certificate_type,
        issue_date: form.issue_date || undefined,
        expiry_date: form.expiry_date,
        certificate_number: form.certificate_number || undefined,
        issuing_body: form.issuing_body || undefined,
        status: form.status,
        document_url: fileUrl,
        notes: form.notes || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['safety-certificates'] });
      setStep('done');
    } catch (err) {
      setError(err.message);
      setStep('review');
    }
  };

  const handleClose = () => {
    setStep('upload');
    setFileUrl(null);
    setExtracted(null);
    setForm({});
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Upload & Parse Certificate
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a Gas Safety Certificate, EICR, EPC, Fire Risk Assessment or any other compliance document.
              AI will extract the key details automatically.
            </p>
            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-all">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Click to select a file (PDF, PNG, JPG)</span>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFileChange} />
            </label>
            {error && <p className="text-sm text-destructive flex items-center gap-1"><AlertTriangle className="w-4 h-4" />{error}</p>}
          </div>
        )}

        {step === 'parsing' && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-medium">AI is reading the document…</p>
            <p className="text-xs text-muted-foreground">Extracting dates, certificate numbers and property details</p>
          </div>
        )}

        {step === 'review' && extracted && (
          <div className="space-y-4">
            <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border ${CONFIDENCE_COLOURS[extracted.confidence] || CONFIDENCE_COLOURS.medium}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              AI confidence: <strong>{extracted.confidence}</strong>
              {extracted.property_address && <span className="ml-auto text-muted-foreground truncate max-w-[180px]">📍 {extracted.property_address}</span>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Certificate Type</label>
                <Select value={form.certificate_type} onValueChange={v => setForm(f => ({ ...f, certificate_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CERT_TYPE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Issue Date</label>
                <Input type="date" value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Expiry Date *</label>
                <Input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Certificate No.</label>
                <Input value={form.certificate_number} onChange={e => setForm(f => ({ ...f, certificate_number: e.target.value }))} placeholder="e.g. GS-123456" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Issuing Body</label>
                <Input value={form.issuing_body} onChange={e => setForm(f => ({ ...f, issuing_body: e.target.value }))} placeholder="Engineer / company" />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Property *</label>
                <Select value={form.property_id} onValueChange={v => setForm(f => ({ ...f, property_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select property…" /></SelectTrigger>
                  <SelectContent>
                    {properties.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}{p.address_line_1 ? ` — ${p.address_line_1}` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {extracted.property_address && (
                  <p className="text-[11px] text-muted-foreground mt-1">Detected address: {extracted.property_address}</p>
                )}
              </div>
            </div>

            {error && <p className="text-sm text-destructive flex items-center gap-1"><AlertTriangle className="w-4 h-4" />{error}</p>}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave}>Save to Compliance</Button>
            </div>
          </div>
        )}

        {step === 'saving' && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-medium">Saving certificate…</p>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            <p className="text-base font-semibold">Certificate saved!</p>
            <p className="text-sm text-muted-foreground">The compliance record has been added and will appear in Certificate Compliance.</p>
            <Button onClick={handleClose} className="mt-2">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}