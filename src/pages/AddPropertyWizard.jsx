import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Check, ChevronRight, ChevronLeft, Building2, MapPin, Shield, FileText, Layers, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import WizardStepPropertyDetails from '@/components/add-property-wizard/WizardStepPropertyDetails';
import WizardStepAddress from '@/components/add-property-wizard/WizardStepAddress';
import WizardStepUnits from '@/components/add-property-wizard/WizardStepUnits';
import WizardStepCompliance from '@/components/add-property-wizard/WizardStepCompliance';
import WizardStepDocuments from '@/components/add-property-wizard/WizardStepDocuments';
import WizardStepReview from '@/components/add-property-wizard/WizardStepReview';

const STEPS = [
  { id: 'details',    label: 'Property Details', icon: Building2 },
  { id: 'address',   label: 'Address & Region',  icon: MapPin },
  { id: 'units',     label: 'Units',             icon: Layers },
  { id: 'compliance',label: 'Compliance Info',   icon: Shield },
  { id: 'documents', label: 'Documents',         icon: FileText },
  { id: 'review',    label: 'Review & Save',     icon: CheckCircle2 },
];

export default function AddPropertyWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [propertyData, setPropertyData] = useState({
    name: '',
    property_type: '',
    ownership_type: '',
    owning_company: '',
    year_built: '',
    listed_building: false,
    total_units: 1,
    notes: '',
  });

  const [addressData, setAddressData] = useState({
    address_line_1: '',
    address_line_2: '',
    city: '',
    postcode: '',
    region: '',
  });

  const [units, setUnits] = useState([]);

  const [complianceData, setComplianceData] = useState({
    gas_safety_expiry: '',
    eicr_expiry: '',
    epc_rating: '',
    epc_expiry: '',
    fire_risk_assessment_date: '',
    hmo_licensed: false,
    hmo_license_expiry: '',
    hmo_max_occupants: '',
    asbestos_survey: false,
    asbestos_survey_date: '',
    legionella_risk_assessment: false,
    legionella_date: '',
  });

  const [documents, setDocuments] = useState({
    gas_safety_url: '',
    eicr_url: '',
    epc_url: '',
    fire_risk_url: '',
    hmo_license_url: '',
    other_docs: [],
  });

  const updatePropertyData = (d) => setPropertyData(p => ({ ...p, ...d }));
  const updateAddressData = (d) => setAddressData(p => ({ ...p, ...d }));
  const updateComplianceData = (d) => setComplianceData(p => ({ ...p, ...d }));
  const updateDocuments = (d) => setDocuments(p => ({ ...p, ...d }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const property = await base44.entities.Property.create({
        ...propertyData,
        ...addressData,
        total_units: units.length || parseInt(propertyData.total_units) || 0,
        year_built: propertyData.year_built ? parseInt(propertyData.year_built) : undefined,
        notes: [
          propertyData.notes,
          complianceData.hmo_licensed ? `HMO Licensed (max ${complianceData.hmo_max_occupants} occupants)` : '',
          complianceData.asbestos_survey ? `Asbestos Survey: ${complianceData.asbestos_survey_date}` : '',
          complianceData.legionella_risk_assessment ? `Legionella RA: ${complianceData.legionella_date}` : '',
        ].filter(Boolean).join(' | ') || undefined,
      });

      // Create units
      if (units.length > 0) {
        await Promise.all(units.map(u =>
          base44.entities.Unit.create({ ...u, property_id: property.id })
        ));
      }

      // Create gas safety cert if data provided
      if (complianceData.gas_safety_expiry || documents.gas_safety_url) {
        await base44.entities.GasSafetyCertificate.create({
          property_id: property.id,
          expiry_date: complianceData.gas_safety_expiry || undefined,
          document_url: documents.gas_safety_url || undefined,
          status: 'valid',
        }).catch(() => {});
      }

      // Create EICR if data provided
      if (complianceData.eicr_expiry || documents.eicr_url) {
        await base44.entities.EICRCertificate.create({
          property_id: property.id,
          next_inspection_due: complianceData.eicr_expiry || undefined,
          document_url: documents.eicr_url || undefined,
          status: 'valid',
        }).catch(() => {});
      }

      // Create EPC if data provided
      if (complianceData.epc_rating || documents.epc_url) {
        await base44.entities.EnergyPerformanceCertificate.create({
          property_id: property.id,
          current_rating: complianceData.epc_rating || undefined,
          expiry_date: complianceData.epc_expiry || undefined,
          document_url: documents.epc_url || undefined,
          assessment_date: new Date().toISOString().split('T')[0],
          assessor_name: 'Imported',
          certificate_number: `EPC-${property.id.slice(0, 8)}`,
          status: 'valid',
        }).catch(() => {});
      }

      // HMO License
      if (complianceData.hmo_licensed && complianceData.hmo_license_expiry) {
        await base44.entities.HMOLicense.create({
          property_id: property.id,
          license_type: 'mandatory',
          license_number: `HMO-${property.id.slice(0, 8)}`,
          local_authority: addressData.city || 'Unknown',
          issue_date: new Date().toISOString().split('T')[0],
          expiry_date: complianceData.hmo_license_expiry,
          document_url: documents.hmo_license_url || undefined,
          status: 'valid',
          max_occupants: parseInt(complianceData.hmo_max_occupants) || undefined,
        }).catch(() => {});
      }

      toast({ title: 'Property created!', description: `${propertyData.name} has been added successfully.` });
      navigate('/properties');
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const stepProps = [
    { data: propertyData, onChange: updatePropertyData },
    { data: addressData, onChange: updateAddressData },
    { units, onChange: setUnits, totalUnits: propertyData.total_units },
    { data: complianceData, onChange: updateComplianceData },
    { data: documents, onChange: updateDocuments, compliance: complianceData },
    { propertyData, addressData, units, complianceData, documents },
  ];

  const StepComponents = [
    WizardStepPropertyDetails,
    WizardStepAddress,
    WizardStepUnits,
    WizardStepCompliance,
    WizardStepDocuments,
    WizardStepReview,
  ];

  const ActiveStep = StepComponents[currentStep];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground">Add New Property</h1>
          <p className="text-muted-foreground mt-1">Complete all steps to ensure full compliance coverage from day one.</p>
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border z-0" />
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const done = idx < currentStep;
              const active = idx === currentStep;
              return (
                <div key={step.id} className="flex flex-col items-center z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                    ${done ? 'bg-primary border-primary text-primary-foreground' :
                      active ? 'bg-card border-primary text-primary' :
                      'bg-card border-border text-muted-foreground'}`}>
                    {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs mt-2 font-medium text-center hidden sm:block
                    ${active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6 min-h-[400px]">
          <ActiveStep {...stepProps[currentStep]} />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => currentStep === 0 ? navigate('/properties') : setCurrentStep(s => s - 1)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={() => setCurrentStep(s => s + 1)} disabled={!propertyData.name}>
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving || !propertyData.name}>
              {saving ? 'Saving...' : 'Save Property'}
              <Check className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}