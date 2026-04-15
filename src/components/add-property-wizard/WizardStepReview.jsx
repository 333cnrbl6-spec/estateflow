import React from 'react';
import { CheckCircle2, AlertCircle, Home, MapPin, Layers, Shield, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function ReviewSection({ icon: Icon, title, items }) {
  const filled = items.filter(i => i.value).length;
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <Badge variant={filled === items.length ? 'default' : 'outline'} className="text-xs">
          {filled}/{items.length} completed
        </Badge>
      </div>
      <div className="divide-y divide-border">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <div className="flex items-center gap-1.5">
              {item.value
                ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /><span className="text-xs text-foreground truncate max-w-[150px]">{String(item.value)}</span></>
                : <><AlertCircle className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">Not provided</span></>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WizardStepReview({ propertyData, addressData, units, complianceData, documents }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Review & Confirm</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Check everything looks correct before saving. You can go back to edit any section.
      </p>

      <div className="space-y-4">
        <ReviewSection
          icon={Home}
          title="Property Details"
          items={[
            { label: 'Name', value: propertyData.name },
            { label: 'Type', value: propertyData.property_type?.replace(/_/g, ' ') },
            { label: 'Ownership', value: propertyData.ownership_type },
            { label: 'Year Built', value: propertyData.year_built },
            { label: 'Listed Building', value: propertyData.listed_building ? 'Yes' : null },
          ]}
        />

        <ReviewSection
          icon={MapPin}
          title="Address"
          items={[
            { label: 'Address Line 1', value: addressData.address_line_1 },
            { label: 'City', value: addressData.city },
            { label: 'Postcode', value: addressData.postcode },
            { label: 'Region', value: addressData.region },
          ]}
        />

        <ReviewSection
          icon={Layers}
          title="Units"
          items={[
            { label: 'Units Added', value: units.length > 0 ? `${units.length} unit(s)` : null },
            ...units.map(u => ({ label: u.unit_reference, value: u.unit_type || 'unit' })),
          ]}
        />

        <ReviewSection
          icon={Shield}
          title="Compliance"
          items={[
            { label: 'Gas Safety Expiry', value: complianceData.gas_safety_expiry },
            { label: 'EICR Next Due', value: complianceData.eicr_expiry },
            { label: 'EPC Rating', value: complianceData.epc_rating },
            { label: 'EPC Expiry', value: complianceData.epc_expiry },
            { label: 'Fire Risk Assessment', value: complianceData.fire_risk_assessment_date },
            { label: 'HMO Licensed', value: complianceData.hmo_licensed ? `Yes (expires ${complianceData.hmo_license_expiry || 'TBC'})` : null },
            { label: 'Asbestos Survey', value: complianceData.asbestos_survey ? complianceData.asbestos_survey_date || 'Yes' : null },
            { label: 'Legionella RA', value: complianceData.legionella_risk_assessment ? complianceData.legionella_date || 'Yes' : null },
          ]}
        />

        <ReviewSection
          icon={FileText}
          title="Documents"
          items={[
            { label: 'Gas Safety Cert', value: documents.gas_safety_url ? 'Uploaded' : null },
            { label: 'EICR', value: documents.eicr_url ? 'Uploaded' : null },
            { label: 'EPC', value: documents.epc_url ? 'Uploaded' : null },
            { label: 'Fire Risk Assessment', value: documents.fire_risk_url ? 'Uploaded' : null },
            { label: 'HMO License', value: documents.hmo_license_url ? 'Uploaded' : null },
          ]}
        />
      </div>

      <div className="mt-5 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-foreground font-medium">Ready to save?</p>
        <p className="text-xs text-muted-foreground mt-1">
          Clicking "Save Property" will create the property record, all units, and register compliance certificates. You can edit everything afterwards.
        </p>
      </div>
    </div>
  );
}