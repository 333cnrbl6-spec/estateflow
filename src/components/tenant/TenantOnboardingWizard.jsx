import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Check, ArrowRight, FileText, CreditCard, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function TenantOnboardingWizard({ tenantId, propertyId, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState({
    id: null,
    income: null,
    references: null
  });
  const [directDebit, setDirectDebit] = useState({
    accountHolder: '',
    sortCode: '',
    accountNumber: '',
    consent: false
  });

  const handleFileUpload = async (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.Document.create({
        tenant_id: tenantId,
        property_id: propertyId,
        document_type: docType === 'id' ? 'ID Document' : docType === 'income' ? 'Bank Statement' : 'Other',
        file_name: file.name,
        file_url: file_url,
        status: 'pending_review',
        uploaded_by: 'tenant'
      });

      setDocuments(prev => ({ ...prev, [docType]: file.name }));
      toast.success(`${docType.toUpperCase()} uploaded successfully`);
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectDebitSetup = async () => {
    if (!directDebit.accountHolder || !directDebit.sortCode || !directDebit.accountNumber) {
      toast.error('Please fill in all bank details');
      return;
    }

    setLoading(true);
    try {
      // Create recurring payment for rent
      await base44.entities.RecurringPayment.create({
        tenant_id: tenantId,
        property_id: propertyId,
        type: 'rent',
        amount: 0, // Will be set by manager
        frequency: 'monthly',
        status: 'pending_activation',
        bank_account: {
          accountHolder: directDebit.accountHolder,
          sortCode: directDebit.sortCode,
          accountNumber: directDebit.accountNumber
        },
        consent_given: true,
        consent_date: new Date().toISOString()
      });

      toast.success('Direct debit details saved');
      setStep(3);
    } catch (err) {
      toast.error('Failed to save bank details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      // Generate welcome pack
      const response = await base44.functions.invoke('generateTenantWelcomePack', {
        tenantId,
        propertyId
      });

      if (response.data.success) {
        toast.success('Welcome pack generated!');
        onComplete?.();
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      toast.error('Failed to complete onboarding: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Your New Home</h1>
        <p className="text-muted-foreground">Complete your onboarding in 3 simple steps</p>
      </div>

      {/* Progress */}
      <div className="flex gap-4 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              s < step ? 'bg-green-600 text-white' :
              s === step ? 'bg-primary text-white' :
              'bg-muted text-muted-foreground'
            }`}>
              {s < step ? <Check className="w-5 h-5" /> : s}
            </div>
            <span className="text-sm font-medium hidden sm:inline">
              {s === 1 ? 'Documents' : s === 2 ? 'Direct Debit' : 'Confirm'}
            </span>
            {s < 3 && <div className={`flex-1 h-1 ${s < step ? 'bg-green-600' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Documents */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Required Documents
            </CardTitle>
            <CardDescription>Please upload your identification and proof of income</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ID Document */}
            <div>
              <Label className="mb-3 block">ID Document (Passport or Driving License) *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {documents.id ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>{documents.id}</span>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">PDF, JPG or PNG</p>
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'id')} />
                  </label>
                )}
              </div>
            </div>

            {/* Proof of Income */}
            <div>
              <Label className="mb-3 block">Proof of Income (Recent Payslip or Bank Statement) *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {documents.income ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>{documents.income}</span>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">PDF or JPG</p>
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'income')} />
                  </label>
                )}
              </div>
            </div>

            {/* References */}
            <div>
              <Label className="mb-3 block">Reference Letter (Previous Landlord or Employer)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {documents.references ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>{documents.references}</span>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">PDF or JPG</p>
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'references')} />
                  </label>
                )}
              </div>
            </div>

            <Button 
              onClick={() => setStep(2)} 
              disabled={!documents.id || !documents.income}
              className="w-full"
            >
              Continue to Direct Debit <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Direct Debit */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Set Up Direct Debit
            </CardTitle>
            <CardDescription>Authorize automatic monthly rent payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                Direct debit is the easiest way to pay your rent on time, every month. Your bank will automatically collect your rent payment on the due date.
              </p>
            </div>

            <div>
              <Label>Account Holder Name *</Label>
              <Input
                value={directDebit.accountHolder}
                onChange={(e) => setDirectDebit(prev => ({ ...prev, accountHolder: e.target.value }))}
                placeholder="Full name"
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sort Code *</Label>
                <Input
                  value={directDebit.sortCode}
                  onChange={(e) => setDirectDebit(prev => ({ ...prev, sortCode: e.target.value }))}
                  placeholder="XX-XX-XX"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Account Number *</Label>
                <Input
                  value={directDebit.accountNumber}
                  onChange={(e) => setDirectDebit(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="XXXXXXXX"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="consent"
                checked={directDebit.consent}
                onChange={(e) => setDirectDebit(prev => ({ ...prev, consent: e.target.checked }))}
                className="w-4 h-4"
              />
              <label htmlFor="consent" className="text-sm">
                I authorize rent payments via direct debit and understand this cannot be cancelled without notice to my landlord
              </label>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleDirectDebitSetup}
                disabled={!directDebit.consent || loading}
                className="flex-1"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Complete */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Review & Complete
            </CardTitle>
            <CardDescription>Your onboarding summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <span className="font-medium flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  Documents Submitted
                </span>
                <Badge variant="outline" className="bg-green-100 text-green-800">Complete</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <span className="font-medium flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  Direct Debit Authorized
                </span>
                <Badge variant="outline" className="bg-green-100 text-green-800">Complete</Badge>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What Happens Next?</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>✓ Your documents will be reviewed within 24 hours</li>
                <li>✓ We'll send you a digital welcome pack with property rules and important information</li>
                <li>✓ Your direct debit will be activated once approved</li>
                <li>✓ You'll receive reminders before each rent payment</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleCompleteOnboarding}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Complete Onboarding
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}