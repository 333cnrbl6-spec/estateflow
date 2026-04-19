import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Upload, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function InvoiceUploadForm({ taskId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file || !invoiceNumber || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({
        file: file
      });

      // Create invoice record
      await base44.entities.VendorPayment.create({
        vendor_id: 'contractor', // Will be updated with actual contractor ID
        related_work_order_id: taskId,
        invoice_number: invoiceNumber,
        description: notes || 'Invoice submission',
        amount: Math.round(parseFloat(amount) * 100), // Convert to pence
        invoice_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        payment_date: null,
        status: 'pending',
        payment_method: 'pending',
        invoice_url: file_url
      });

      toast.success('Invoice uploaded successfully');
      setFile(null);
      setFileName('');
      setInvoiceNumber('');
      setAmount('');
      setNotes('');
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
        <CardTitle>Upload Invoice/Receipt</CardTitle>
        <CardDescription>Submit proof of work completion and costs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Invoice Number *</Label>
          <Input
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="e.g., INV-001"
            className="mt-2"
            disabled={loading}
          />
        </div>

        <div>
          <Label>Amount (£) *</Label>
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="mt-2"
            disabled={loading}
          />
        </div>

        <div>
          <Label>Notes (Optional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this invoice..."
            className="mt-2"
            disabled={loading}
          />
        </div>

        <div>
          <Label>Upload Document *</Label>
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
              <p className="text-sm font-medium mb-1">Click to upload invoice/receipt</p>
              {fileName && <p className="text-xs text-green-600 flex items-center justify-center gap-1"><Check className="w-3 h-3" /> {fileName}</p>}
            </label>
          </div>
        </div>

        <Button onClick={handleUpload} disabled={loading || !file} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Submit Invoice
        </Button>
      </CardContent>
    </Card>
  );
}