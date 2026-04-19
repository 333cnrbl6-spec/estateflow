import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, AlertCircle, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const DOCUMENT_TYPES = [
  { value: 'gas_safety_certificate', label: '🔥 Gas Safety Certificate' },
  { value: 'epc', label: '⚡ Energy Performance Certificate' },
  { value: 'electrical_inspection', label: '🔌 Electrical Installation Condition Report' },
  { value: 'boiler_service', label: '🛠️ Boiler Service Certificate' },
  { value: 'fire_safety', label: '🚒 Fire Safety Certificate' },
  { value: 'hmo_license', label: '🏠 HMO License' },
  { value: 'building_regulations', label: '📋 Building Regulations Approval' },
  { value: 'insurance', label: '📄 Insurance Certificate' },
  { value: 'property_deed', label: '📑 Property Deed' },
  { value: 'other', label: '📂 Other' }
];

export default function DocumentUploadPanel({ propertyId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!documentType || !file) {
      toast.error('Please select document type and file');
      return;
    }

    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({
        file: file
      });

      await base44.entities.Document.create({
        document_type: documentType,
        file_name: fileName,
        file_url: file_url,
        property_id: propertyId,
        status: 'approved',
        uploaded_by: 'manager',
        uploaded_date: new Date().toISOString(),
        expiry_date: expiryDate || null
      });

      toast.success('Document uploaded successfully');
      setDocumentType('');
      setExpiryDate('');
      setFile(null);
      setFileName('');
      onSuccess?.();
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>Add certificates and compliance documents for this property</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Document Type *</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map(doc => (
                <SelectItem key={doc.value} value={doc.value}>{doc.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>File *</Label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center mt-2 hover:bg-muted/50 transition cursor-pointer">
            <label className="cursor-pointer block">
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                disabled={loading}
              />
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">Click to upload document</p>
              {fileName && <p className="text-xs text-green-600 flex items-center justify-center gap-1"><Check className="w-3 h-3" /> {fileName}</p>}
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Supported: PDF, DOC, DOCX, JPG, PNG</p>
        </div>

        <div>
          <Label>Expiry Date (Optional)</Label>
          <Input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">Leave empty if document doesn't expire</p>
        </div>

        <Button onClick={handleUpload} disabled={loading || !file} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload Document
        </Button>
      </CardContent>
    </Card>
  );
}