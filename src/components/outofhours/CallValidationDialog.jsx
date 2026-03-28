import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import PhoneNumberMatcher from './PhoneNumberMatcher';

export default function CallValidationDialog({ open, onOpenChange, onValidationComplete, onCancel }) {
  const [step, setStep] = useState(1); // 1: caller info, 2: property match, 3: gdpr consent
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [callerEmail, setCallerEmail] = useState('');
  const [callerType, setCallerType] = useState('');
  const [postcode, setPostcode] = useState('');
  const [town, setTown] = useState('');
  const [region, setRegion] = useState('');
  const [landlordName, setLandlordName] = useState('');
  const [callType, setCallType] = useState('');
  const [callDescription, setCallDescription] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [matchedProperty, setMatchedProperty] = useState(null);
  const [matchedCompany, setMatchedCompany] = useState(null);
  const [serviceGap, setServiceGap] = useState(null);
  const [error, setError] = useState('');
  const [showPhoneMatcher, setShowPhoneMatcher] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties-validation', postcode, town, region, landlordName],
    queryFn: async () => {
      const searchTerm = (postcode || town || region || landlordName).trim();
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const all = await base44.entities.Property.list();
      const searchUpper = searchTerm.toUpperCase();
      
      return all.filter(p => {
        const matchPostcode = p.postcode?.toUpperCase().includes(searchUpper);
        const matchCity = p.city?.toUpperCase().includes(searchUpper);
        const matchRegion = p.region?.toUpperCase().includes(searchUpper);
        const matchAddress = (p.address_line_1 + ' ' + (p.address_line_2 || '')).toUpperCase().includes(searchUpper);
        const matchName = p.name?.toUpperCase().includes(searchUpper);
        
        return matchPostcode || matchCity || matchRegion || matchAddress || matchName;
      });
    },
    enabled: step === 2
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies-for-property', matchedProperty?.id],
    queryFn: async () => {
      if (!matchedProperty?.owning_company) return [];
      const company = await base44.entities.Company.get(matchedProperty.owning_company);
      return [company];
    },
    enabled: !!matchedProperty?.owning_company
  });

  const { data: service } = useQuery({
    queryKey: ['service-for-company', matchedCompany?.id],
    queryFn: async () => {
      if (!matchedCompany?.id) return null;
      const services = await base44.entities.OutOfHoursService.list();
      return services.find(s => s.company_id === matchedCompany.id);
    },
    enabled: !!matchedCompany?.id
  });

  const checkServiceCoverage = (issueType) => {
    if (!service) return { covered: false, gap: 'no_subscription' };
    
    const coverageMap = {
      emergency: 'emergency_response',
      heating_failure: 'maintenance_order_creation',
      water_leak: 'emergency_response',
      security_breach: 'emergency_response',
      maintenance: 'maintenance_order_creation',
      contractor_dispatch: 'contractor_dispatch'
    };

    const requiredOption = coverageMap[issueType];
    const isCovered = service.call_handling_options?.includes(requiredOption);
    
    return {
      covered: isCovered,
      gap: isCovered ? null : requiredOption
    };
  };

  const handleNext = () => {
    if (step === 1) {
      if (!callerName || !callerPhone || !callerType) {
        setError('Please fill in all required fields');
        return;
      }
      if (!postcode && !town && !region && !landlordName) {
        setError('Please provide at least one property search criteria');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      if (!matchedProperty) {
        setError('Please select a property or try different search terms');
        return;
      }
      if (!callType || !callDescription) {
        setError('Please specify the issue type and description');
        return;
      }
      
      // Set company and check service coverage
      if (companies.length > 0) {
        setMatchedCompany(companies[0]);
        const coverage = checkServiceCoverage(callType);
        if (!coverage.covered) {
          setServiceGap(coverage.gap);
          setError('');
          setStep(4); // Service redirect step
          return;
        }
      }
      
      setError('');
      setStep(3);
    }
  };

  const handleValidate = () => {
    if (!gdprConsent) {
      setError('You must confirm GDPR compliance before proceeding');
      return;
    }

    const callData = {
      call_date_time: new Date().toISOString(),
      caller_name: callerName,
      caller_phone: callerPhone,
      caller_email: callerEmail,
      caller_type: callerType,
      property_postcode: postcode,
      matched_property_id: matchedProperty?.id,
      matched_company_id: matchedCompany?.id,
      call_type: callType,
      call_description: callDescription,
      validation_status: 'validated',
      gdpr_consent_recorded: true
    };

    onValidationComplete(callData);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setStep(1);
    setCallerName('');
    setCallerPhone('');
    setCallerEmail('');
    setCallerType('');
    setPostcode('');
    setTown('');
    setRegion('');
    setLandlordName('');
    setCallType('');
    setCallDescription('');
    setGdprConsent(false);
    setMatchedProperty(null);
    setMatchedCompany(null);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
    onCancel();
  };

  return (
    <>
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Incoming Call - Validation</DialogTitle>
          <DialogDescription>
            Step {step} of 3: {step === 1 ? 'Caller Information' : step === 2 ? 'Property Validation' : 'GDPR Consent'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Step 1: Caller Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Caller Type *</Label>
                <Select value={callerType} onValueChange={setCallerType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tenant">Tenant</SelectItem>
                    <SelectItem value="landlord">Landlord</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Full Name *</Label>
                <Input
                  placeholder="Name"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Phone Number *</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="07xxx xxxxxx"
                    value={callerPhone}
                    onChange={(e) => setCallerPhone(e.target.value)}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowPhoneMatcher(true)}
                    disabled={!callerPhone}
                  >
                    Search
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={callerEmail}
                  onChange={(e) => setCallerEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Postcode</Label>
                  <Input
                    placeholder="e.g. SW1A 1AA"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Town / City</Label>
                  <Input
                    placeholder="e.g. London"
                    value={town}
                    onChange={(e) => setTown(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Region</Label>
                  <Input
                    placeholder="e.g. london, brighton"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Landlord / Company</Label>
                  <Input
                    placeholder="Landlord name"
                    value={landlordName}
                    onChange={(e) => setLandlordName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                * Use any field with wildcard search - at least one required
              </p>
            </div>
          )}

          {/* Step 2: Property Match */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>Search criteria:</strong> {[
                    postcode && `Postcode: ${postcode}`,
                    town && `Town: ${town}`,
                    region && `Region: ${region}`,
                    landlordName && `Landlord: ${landlordName}`
                  ].filter(Boolean).join(' • ')}
                </p>
              </div>

              {properties.length > 0 ? (
                <div className="space-y-2">
                  {properties.map((prop) => (
                    <Card
                      key={prop.id}
                      className={`cursor-pointer transition-all ${matchedProperty?.id === prop.id ? 'border-blue-500 bg-blue-50' : 'border-border hover:bg-secondary'}`}
                      onClick={() => setMatchedProperty(prop)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{prop.name}</p>
                            <p className="text-xs text-muted-foreground">{prop.address_line_1}</p>
                            <p className="text-xs text-muted-foreground">{prop.city} {prop.postcode}</p>
                          </div>
                          {matchedProperty?.id === prop.id && (
                            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : postcode.length > 2 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-900">No properties found for this postcode</p>
                </div>
              ) : null}

              <div>
                <Label className="text-sm font-medium">Call Type *</Label>
                <Select value={callType} onValueChange={setCallType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">🚨 Emergency</SelectItem>
                    <SelectItem value="heating_failure">❄️ Heating Failure</SelectItem>
                    <SelectItem value="water_leak">💧 Water Leak</SelectItem>
                    <SelectItem value="security_breach">🔐 Security Issue</SelectItem>
                    <SelectItem value="maintenance">🔧 Maintenance Request</SelectItem>
                    <SelectItem value="contractor_dispatch">👷 Contractor Dispatch</SelectItem>
                    <SelectItem value="general_enquiry">❓ General Enquiry</SelectItem>
                    <SelectItem value="complaint">⚠️ Complaint</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Call Description *</Label>
                <Textarea
                  placeholder="Details of the issue..."
                  value={callDescription}
                  onChange={(e) => setCallDescription(e.target.value)}
                  className="mt-1 h-24"
                />
              </div>
            </div>
          )}

          {/* Step 3: Service Gap Redirect */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-900 mb-1">Service Not Covered</p>
                    <p className="text-sm text-orange-800">
                      {callType?.replace(/_/g, ' ').toUpperCase()} is not included in the current subscription.
                    </p>
                  </div>
                </div>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-sm space-y-2">
                  <p className="font-medium text-blue-900">Recommended Action:</p>
                  <ul className="text-blue-800 space-y-1 list-disc list-inside">
                    {callType?.includes('heating') && (
                      <>
                        <li>Gas Safe Engineer (£50-150 emergency call-out)</li>
                        <li>Local plumber/heating specialist</li>
                      </>
                    )}
                    {callType?.includes('water') && (
                      <>
                        <li>Licensed plumber for emergency repairs</li>
                        <li>Water authority emergency line</li>
                      </>
                    )}
                    {callType?.includes('gas') && (
                      <li>Gas Safe Register - 0800 408 5500</li>
                    )}
                    {!callType?.match(/heating|water|gas/) && (
                      <li>Local contractor specialising in {callType?.replace(/_/g, ' ')}</li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  📧 Confirmation email with alternative provider recommendations will be sent to account holder.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: GDPR Consent */}
          {step === 3 && (
            <div className="space-y-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 space-y-2 text-sm">
                  <p className="font-medium text-blue-900">GDPR Data Protection Compliance</p>
                  <ul className="space-y-1 text-blue-800 text-xs list-disc list-inside">
                    <li>Caller identity verified against property records</li>
                    <li>Data will be stored for call handling & legal compliance</li>
                    <li>Information shared only with relevant contractors/service providers</li>
                    <li>Caller has right to access, correct, or delete their data</li>
                    <li>Call may be recorded for training & quality purposes</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
                <div>
                  <p className="font-medium text-sm mb-2">Call Summary:</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>Caller:</strong> {callerName} ({callerType})</p>
                    <p><strong>Property:</strong> {matchedProperty?.name}</p>
                    <p><strong>Issue Type:</strong> {callType?.replace(/_/g, ' ').toUpperCase()}</p>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gdprConsent}
                    onChange={(e) => setGdprConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-border"
                  />
                  <span className="text-xs leading-relaxed">
                    I confirm that caller identity has been validated and GDPR consent has been obtained. I understand that data will be handled in accordance with data protection legislation.
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => {
            if (step > 1) setStep(step - 1);
            else handleClose();
          }}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          {step === 4 ? (
            <Button onClick={handleValidate} className="bg-orange-600 hover:bg-orange-700">
              Log & Redirect Call
            </Button>
          ) : step < 3 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleValidate} className="bg-green-600 hover:bg-green-700">
              Confirm & Start Call
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {showPhoneMatcher && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <PhoneNumberMatcher 
              phone={callerPhone}
              onMatchFound={(match) => {
                setCallerName(match.data.full_name);
                if (match.property) {
                  setPostcode(match.property.postcode || '');
                  setMatchedProperty(match.property);
                }
                setShowPhoneMatcher(false);
              }}
              onCancel={() => setShowPhoneMatcher(false)}
            />
          </div>
        </div>
      </div>
    )}
    </>
  );
}