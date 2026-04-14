import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';
import VendorComplianceReview from './VendorComplianceReview';

export default function ServiceAgreementSigning({ vendorId, onComplete }) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);

  const handleSign = async () => {
    setLoading(true);

    try {
      // Create service agreement
      await base44.entities.ServiceAgreement.create({
        vendor_id: vendorId,
        agreement_type: 'on_demand',
        title: 'Standard Service Agreement',
        description: 'Standard maintenance and repair services',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        signed_by_vendor: true
      });

      // Notify admins
      await base44.functions.invoke('notifyVendorAgreementSigned', {
        vendorId
      });

      toast.success('Service agreement signed successfully');
      onComplete();
    } catch (error) {
      toast.error('Failed to sign agreement: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Compliance Assessment */}
      {!assessmentComplete && (
        <VendorComplianceReview 
          vendorId={vendorId} 
          onApproved={() => setAssessmentComplete(true)}
        />
      )}

      {assessmentComplete && (
        <>
          {/* Agreement Preview */}
      <Card className="p-6 bg-slate-50 border-slate-200 max-h-96 overflow-y-auto">
        <h3 className="font-semibold text-foreground mb-4">Standard Service Agreement</h3>
        
        <div className="prose prose-sm text-sm text-muted-foreground space-y-4">
          <div>
            <h4 className="font-semibold text-foreground">1. Scope of Services</h4>
            <p>
              The Vendor agrees to provide maintenance, repair, and other services as requested by the Client, 
              in accordance with the terms and conditions outlined in this agreement.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">2. Insurance Requirements</h4>
            <p>
              The Vendor maintains current public liability insurance with minimum coverage of £1,000,000. 
              Proof of insurance must be provided and kept current throughout the agreement term.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">3. Payment Terms</h4>
            <p>
              Payment shall be made within 30 days of invoice receipt. Invoices must include details of work 
              completed, time spent, and materials used.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">4. Health & Safety</h4>
            <p>
              The Vendor agrees to comply with all applicable health and safety regulations and to work in a 
              safe and professional manner at all times.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">5. Confidentiality</h4>
            <p>
              The Vendor agrees to maintain confidentiality of all client and property information obtained 
              during the performance of services.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">6. Liability</h4>
            <p>
              The Vendor is responsible for damage caused by negligence or failure to follow safety procedures. 
              Insurance should cover such liabilities.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">7. Termination</h4>
            <p>
              This agreement may be terminated by either party with 30 days written notice. Termination does 
              not affect outstanding payment obligations.
            </p>
          </div>
        </div>
      </Card>

      {/* Acceptance Checkbox */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 rounded"
          />
          <span className="text-sm text-blue-800">
            I have read and agree to the Service Agreement terms and conditions. 
            I confirm that all information provided is accurate and complete.
          </span>
        </label>
      </Card>

      {/* Info Box */}
      <Card className="p-4 bg-slate-50 border-slate-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">What Happens Next?</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>Your profile will be reviewed by our team within 2 business days</li>
              <li>You'll receive an email confirmation and access to the vendor portal</li>
              <li>You can then start accepting job assignments and invoicing</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Sign Button */}
      <Button
        onClick={handleSign}
        disabled={!agreed || loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin mr-2" />
            Signing Agreement...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Sign & Submit Application
          </>
        )}
      </Button>

          <p className="text-xs text-muted-foreground text-center">
            By signing, you agree to the terms and conditions outlined above
          </p>
        </>
      )}
    </div>
  );
}