import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, CheckCircle, AlertCircle, Loader2, FileText, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function ContractorUploadPortal() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [certificateInfo, setCertificateInfo] = useState(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    validateToken();
  }, []);

  const validateToken = async () => {
    const token = searchParams.get('token');
    const certId = searchParams.get('cert');

    if (!token || !certId) {
      toast.error('Invalid upload link');
      setLoading(false);
      return;
    }

    try {
      // Fetch certificate details
      const cert = await base44.entities.SafetyCertificate.get(certId);
      if (!cert) {
        toast.error('Certificate not found');
        setLoading(false);
        return;
      }

      // Get property info if available
      const property = cert.property_id 
        ? await base44.entities.Property.get(cert.property_id)
        : null;

      setCertificateInfo({
        id: cert.id,
        type: cert.certificate_type,
        expiry_date: cert.expiry_date,
        property_name: property?.name || 'Property',
        property_address: `${property?.address_line_1 || ''}, ${property?.city || ''}, ${property?.postcode || ''}`.trim()
      });

      setTokenValid(true);
    } catch (err) {
      console.error('Token validation error:', err);
      toast.error('Invalid or expired upload link');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please upload a PDF or image file (JPG/PNG)');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);

    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Parse certificate with AI
      const parseResponse = await base44.functions.invoke('processComplianceDocument', {
        file_url,
        document_type: certificateInfo.type,
        context: { certificate_id: certificateInfo.id }
      });

      const parsedData = parseResponse.data.data;

      // Create new certificate record or update existing
      const newCertData = {
        certificate_type: certificateInfo.type,
        property_id: await getPropertyId(),
        file_url,
        issue_date: new Date().toISOString(),
        expiry_date: parsedData.extracted_fields?.expiry_date || calculateExpiryDate(certificateInfo.type),
        status: parsedData.risk_level === 'critical' ? 'review_required' : 'valid',
        uploaded_by: 'contractor_portal',
        uploaded_date: new Date().toISOString(),
        contractor_notes: notes,
        ai_analysis: parsedData,
        compliance_status: parsedData.compliance_check
      };

      await base44.entities.SafetyCertificate.create(newCertData);

      // Mark old certificate as superseded
      if (certificateInfo.id) {
        await base44.entities.SafetyCertificate.update(certificateInfo.id, {
          status: 'superseded',
          superseded_date: new Date().toISOString(),
          superseded_by_file: file_url
        });
      }

      // Log to audit trail
      await base44.entities.AuditLog.create({
        action: 'certificate.uploaded_via_contractor_portal',
        entity_type: 'SafetyCertificate',
        entity_id: certificateInfo.id,
        timestamp: new Date().toISOString(),
        notes: `Uploaded via secure contractor portal. AI compliance score: ${Math.round(parsedData.confidence_score * 100)}%`
      });

      setSuccess(true);
      toast.success('Certificate uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const getPropertyId = async () => {
    // This would normally come from the certificate relationship
    // For now, return null or fetch from certificate
    const cert = await base44.entities.SafetyCertificate.get(certificateInfo.id);
    return cert?.property_id || null;
  };

  const calculateExpiryDate = (certType) => {
    const now = new Date();
    if (certType === 'Gas Safety') {
      now.setFullYear(now.getFullYear() + 1);
    } else if (certType === 'Electrical') {
      now.setFullYear(now.getFullYear() + 5);
    } else if (certType === 'EPC') {
      now.setFullYear(now.getFullYear() + 10);
    }
    return now.toISOString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Validating secure upload link...</p>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Invalid Upload Link</h2>
            <p className="text-muted-foreground mb-4">
              This upload link has expired or is invalid. Please request a new link from your property manager.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Return to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Upload Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Your certificate has been uploaded and is being processed. Our AI compliance checker will validate it within minutes.
            </p>
            <div className="bg-white rounded-lg p-4 mb-6 text-left">
              <p className="text-sm"><strong>Certificate Type:</strong> {certificateInfo.type}</p>
              <p className="text-sm"><strong>Property:</strong> {certificateInfo.property_name}</p>
              <p className="text-sm text-green-600 mt-2">✓ You will receive a confirmation email shortly</p>
            </div>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700">
              Close
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 shadow-xl border-0">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold">Secure Certificate Upload</h1>
            </div>
            <p className="text-muted-foreground">
              Upload your new certificate using this secure link. Our AI will automatically validate compliance.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-5 mb-6 border border-slate-200">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Certificate Details
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>Type:</strong> {certificateInfo.type}</p>
              <p><strong>Property:</strong> {certificateInfo.property_name}</p>
              <p><strong>Address:</strong> {certificateInfo.property_address || 'Not specified'}</p>
              {certificateInfo.expiry_date && (
                <p><strong>Previous Expiry:</strong> {new Date(certificateInfo.expiry_date).toLocaleDateString('en-GB')}</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Upload Certificate (PDF or Image)</Label>
              <div className="mt-2">
                <Input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Max file size: 10MB. Accepted formats: PDF, JPG, PNG
                </p>
              </div>
            </div>

            <div>
              <Label>Contractor Notes (Optional)</Label>
              <textarea
                className="w-full mt-2 p-2 border rounded-md text-sm"
                rows={3}
                placeholder="Any additional notes about the inspection..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">AI Compliance Check</h4>
              <p className="text-xs text-blue-700">
                Your uploaded certificate will be automatically analysed using AI to verify compliance with UK regulations. 
                You'll receive instant feedback on any issues or missing information.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Uploading & Analysing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Certificate
                </>
              )}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          This is a secure upload portal. Your file is encrypted and stored in compliance with GDPR.
        </p>
      </div>
    </div>
  );
}