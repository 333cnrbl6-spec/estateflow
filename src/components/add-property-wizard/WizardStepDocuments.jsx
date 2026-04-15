import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, FileCheck, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const DOC_FIELDS = [
  { key: 'gas_safety_url',  label: 'Gas Safety Certificate (CP12)', complianceKey: 'gas_safety_expiry' },
  { key: 'eicr_url',        label: 'EICR Certificate',              complianceKey: 'eicr_expiry' },
  { key: 'epc_url',         label: 'EPC Document',                  complianceKey: 'epc_rating' },
  { key: 'fire_risk_url',   label: 'Fire Risk Assessment',          complianceKey: 'fire_risk_assessment_date' },
  { key: 'hmo_license_url', label: 'HMO License',                   complianceKey: 'hmo_licensed' },
];

function DocUploadRow({ label, docKey, value, onChange, compliance }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(docKey, file_url);
    setUploading(false);
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {value ? (
          <a href={value} target="_blank" rel="noopener noreferrer"
            className="text-xs text-primary flex items-center gap-1 mt-0.5 truncate">
            <FileCheck className="w-3 h-3 shrink-0" /> Uploaded
          </a>
        ) : (
          <p className="text-xs text-muted-foreground mt-0.5">No file uploaded</p>
        )}
      </div>
      <div>
        <Label htmlFor={`file-${docKey}`} className="cursor-pointer">
          <Button variant="outline" size="sm" asChild disabled={uploading}>
            <span>
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span className="ml-1.5">{uploading ? 'Uploading...' : value ? 'Replace' : 'Upload'}</span>
            </span>
          </Button>
        </Label>
        <Input
          id={`file-${docKey}`}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}

export default function WizardStepDocuments({ data, onChange, compliance }) {
  const handleChange = (key, url) => onChange({ [key]: url });

  const relevantDocs = DOC_FIELDS.filter(f => {
    if (f.complianceKey === 'hmo_licensed') return compliance?.hmo_licensed;
    return true;
  });

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Upload Documents</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Upload certificates and compliance documents now or add them later. PDF, JPG, PNG accepted.
      </p>

      <div className="space-y-3">
        {relevantDocs.map(f => (
          <DocUploadRow
            key={f.key}
            label={f.label}
            docKey={f.key}
            value={data[f.key]}
            onChange={handleChange}
            compliance={compliance}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        All documents are stored securely. You can add or replace documents at any time from the property record.
      </p>
    </div>
  );
}