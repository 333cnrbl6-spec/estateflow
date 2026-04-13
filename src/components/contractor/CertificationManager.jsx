import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Award, Plus, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const CERT_TYPES = ['gas_safety', 'electrical_eicr', 'pat_testing', 'fire_safety', 'asbestos', 'boiler_service'];

export default function CertificationManager({ contactId }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ cert_type: 'gas_safety', cert_number: '', expiry_date: '', file: null });
  const [uploading, setUploading] = useState(false);

  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ['contractor-certs', contactId],
    queryFn: async () => {
      const contact = await base44.entities.Contact.get(contactId);
      return contact?.certifications || [];
    },
    enabled: !!contactId,
  });

  const addCert = useMutation({
    mutationFn: async () => {
      setUploading(true);
      let fileUrl = null;
      
      if (form.file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: form.file });
        fileUrl = file_url;
      }

      const contact = await base44.entities.Contact.get(contactId);
      const existing = contact.certifications || [];
      
      const newCert = {
        id: `cert-${Date.now()}`,
        type: form.cert_type,
        number: form.cert_number,
        expiryDate: form.expiry_date,
        documentUrl: fileUrl,
        addedDate: new Date().toISOString(),
      };

      await base44.entities.Contact.update(contactId, {
        certifications: [...existing, newCert],
      });
      
      setUploading(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-certs', contactId] });
      setShowDialog(false);
      setForm({ cert_type: 'gas_safety', cert_number: '', expiry_date: '', file: null });
    },
  });

  const isCertExpiring = (expiryDate) => {
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 30 && days > 0;
  };

  const isCertExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const getStatusColor = (expiryDate) => {
    if (isCertExpired(expiryDate)) return 'bg-red-100 text-red-700 border-red-300';
    if (isCertExpiring(expiryDate)) return 'bg-amber-100 text-amber-700 border-amber-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          Professional Certifications
        </CardTitle>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Add Cert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Certification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Certification Type</label>
                <Select value={form.cert_type} onValueChange={(v) => setForm(f => ({ ...f, cert_type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CERT_TYPES.map(t => (
                      <SelectItem key={t} value={t}>
                        {t.replace(/_/g, ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Certificate Number</label>
                <Input
                  value={form.cert_number}
                  onChange={(e) => setForm(f => ({ ...f, cert_number: e.target.value }))}
                  placeholder="e.g., CP12/12345678"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Expiry Date</label>
                <Input
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) => setForm(f => ({ ...f, expiry_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Document (PDF/Image)</label>
                <label className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg cursor-pointer hover:border-primary/40 text-sm text-muted-foreground">
                  <Upload className="w-4 h-4" />
                  {form.file ? form.file.name : 'Click to upload'}
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => setForm(f => ({ ...f, file: e.target.files?.[0] }))}
                  />
                </label>
              </div>
              <Button
                className="w-full"
                disabled={!form.cert_number || !form.expiry_date || uploading || addCert.isPending}
                onClick={() => addCert.mutate()}
              >
                {uploading || addCert.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...</>
                ) : 'Add Certification'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading certifications...</p>
        ) : certifications.length === 0 ? (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No certifications registered yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {certifications.map(cert => (
              <div key={cert.id} className={`p-4 rounded-lg border ${getStatusColor(cert.expiryDate)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{cert.type.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="text-xs opacity-75 mt-0.5">Certificate: {cert.number}</p>
                    <p className="text-xs opacity-75">
                      Expires: {format(parseISO(cert.expiryDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isCertExpired(cert.expiryDate) ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : isCertExpiring(cert.expiryDate) ? (
                      <Badge variant="outline" className="bg-amber-50">Expiring Soon</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50">Valid</Badge>
                    )}
                    {cert.documentUrl && (
                      <a
                        href={cert.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium underline"
                      >
                        View Doc
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}