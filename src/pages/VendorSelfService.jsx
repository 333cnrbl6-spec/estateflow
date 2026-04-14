import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertCircle } from 'lucide-react';
import VendorRegistrationForm from '@/components/vendor-portal/VendorRegistrationForm';
import InsuranceDocumentUpload from '@/components/vendor-portal/InsuranceDocumentUpload';
import ServiceAgreementSigning from '@/components/vendor-portal/ServiceAgreementSigning';

export default function VendorSelfService() {
  const [step, setStep] = useState(0);
  const [vendor, setVendor] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({
    registration: false,
    insurance: false,
    agreement: false
  });

  const handleRegistrationComplete = (vendorData) => {
    setVendor(vendorData);
    setCompletedSteps(prev => ({ ...prev, registration: true }));
    setStep(1);
  };

  const handleInsuranceComplete = () => {
    setCompletedSteps(prev => ({ ...prev, insurance: true }));
    setStep(2);
  };

  const handleAgreementComplete = () => {
    setCompletedSteps(prev => ({ ...prev, agreement: true }));
  };

  const isComplete = completedSteps.registration && completedSteps.insurance && completedSteps.agreement;

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center bg-white border-green-200">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-900 mb-2">Registration Complete!</h1>
          <p className="text-muted-foreground mb-6">
            Your vendor profile has been submitted successfully. Our team will review your documents and contact you shortly.
          </p>
          <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
            <p className="text-sm text-green-700">
              <strong>Next Steps:</strong><br/>
              We'll verify your insurance documents and contact you within 2 business days to discuss service agreements.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            A confirmation email has been sent to the email address you provided.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-foreground">Vendor Self-Service Portal</h1>
          <p className="text-muted-foreground mt-2">Complete your vendor profile and service agreements</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[
              { label: 'Register Business', step: 0, done: completedSteps.registration },
              { label: 'Upload Insurance', step: 1, done: completedSteps.insurance },
              { label: 'Sign Agreement', step: 2, done: completedSteps.agreement }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    item.done
                      ? 'bg-green-500 text-white'
                      : step === item.step
                      ? 'bg-primary text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {item.done ? '✓' : idx + 1}
                </div>
                <p className="text-xs font-medium ml-2">{item.label}</p>
                {idx < 2 && (
                  <div className={`h-1 flex-1 mx-2 rounded ${item.done ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {step === 0 && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Business Registration</h2>
              <VendorRegistrationForm onComplete={handleRegistrationComplete} />
            </Card>
          )}

          {step === 1 && vendor && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Insurance Documentation</h2>
              <p className="text-muted-foreground mb-6">
                Please upload your insurance certificates to proceed. We require evidence of public liability insurance as a minimum.
              </p>
              <InsuranceDocumentUpload vendorId={vendor.id} onComplete={handleInsuranceComplete} />
            </Card>
          )}

          {step === 2 && vendor && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Service Agreement</h2>
              <ServiceAgreementSigning vendorId={vendor.id} onComplete={handleAgreementComplete} />
            </Card>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Need Help?
          </h3>
          <p className="text-sm text-blue-800 mb-2">
            If you have any questions during the registration process:
          </p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Email: <a href="mailto:vendors@example.com" className="underline">vendors@example.com</a></li>
            <li>• Phone: +44 (0)20 7946 0958</li>
            <li>• Available: Monday-Friday, 9am-5pm GMT</li>
          </ul>
        </div>
      </div>
    </div>
  );
}