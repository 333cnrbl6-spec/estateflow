import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, AlertCircle, FileText, Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function InsuranceDocumentUpload({ vendorId, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const insuranceTypes = [
    { value: 'public_liability', label: 'Public Liability Insurance (Required)', required: true },
    { value: 'employer_liability', label: 'Employer Liability Insurance', required: false },
    { value: 'professional_indemnity', label: 'Professional Indemnity Insurance', required: false }
  ];

  const handleFileSelect = async (e, insuranceType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      // Upload file
      const uploadResponse = await base44.integrations.Core.UploadFile({
        file: file
      });

      // Create insurance record
      const insurance = await base44.entities.VendorInsurance.create({
        vendor_id: vendorId,
        insurance_type: insuranceType,
        policy_number: `SELF-SERVICE-${Date.now()}`,
        provider: 'To be verified',
        coverage_amount: 0,
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        certificate_url: uploadResponse.file_url,
        status: 'active'
      });

      setUploadedFiles(prev => [...prev, {
        id: insurance.id,
        type: insuranceType,
        fileName: file.name,
        url: uploadResponse.file_url
      }]);

      toast.success(`${insuranceTypes.find(t => t.value === insuranceType)?.label} uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    const hasPublicLiability = uploadedFiles.some(f => f.type === 'public_liability');
    
    if (!hasPublicLiability) {
      toast.error('Public Liability Insurance is required');
      return;
    }

    // Notify admins of document uploads
    await base44.functions.invoke('notifyVendorDocumentUpload', {
      vendorId,
      uploadedCount: uploadedFiles.length
    });

    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Document Requirements</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>Minimum coverage: £1,000,000 for public liability</li>
              <li>Current and valid documents only (PDF or image)</li>
              <li>All documents must be in English or English translation</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Insurance Types */}
      <div className="space-y-4">
        {insuranceTypes.map(type => {
          const isUploaded = uploadedFiles.some(f => f.type === type.value);
          return (
            <div key={type.value} className={`border rounded-lg p-4 ${isUploaded ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  {isUploaded ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <FileText className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      {type.label}
                      {type.required && <Badge className="bg-red-100 text-red-700">Required</Badge>}
                    </h3>
                  </div>
                </div>
              </div>

              {isUploaded ? (
                <div className="ml-8 text-sm">
                  <p className="text-green-700 font-medium">
                    ✓ {uploadedFiles.find(f => f.type === type.value)?.fileName}
                  </p>
                </div>
              ) : (
                <div className="ml-8">
                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileSelect(e, type.value)}
                      disabled={loading}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2 cursor-pointer"
                      disabled={loading}
                      onClick={(e) => {
                        e.currentTarget.parentElement.querySelector('input[type="file"]').click();
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload {type.label.split('(')[0].trim()}
                        </>
                      )}
                    </Button>
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Continue Button */}
      <Button
        onClick={handleContinue}
        disabled={uploadedFiles.length === 0}
        className="w-full"
      >
        Continue to Service Agreement
      </Button>
    </div>
  );
}