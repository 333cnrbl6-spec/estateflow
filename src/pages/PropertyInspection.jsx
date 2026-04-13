import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InspectionForm from '@/components/inspections/InspectionForm';
import PreviousInspectionsPanel from '@/components/inspections/PreviousInspectionsPanel';
import { AlertCircle, Home, Building2, ArrowLeft } from 'lucide-react';

export default function PropertyInspection() {
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const unitId = searchParams.get('unitId');
  const [inspectionSubmitted, setInspectionSubmitted] = useState(false);

  // Fetch property and unit details
  const { data: property, isLoading: loadingProperty } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => base44.entities.Property.get(propertyId),
    enabled: !!propertyId,
  });

  const { data: unit, isLoading: loadingUnit } = useQuery({
    queryKey: ['unit', unitId],
    queryFn: () => base44.entities.Unit.get(unitId),
    enabled: !!unitId,
  });

  if (!propertyId || !unitId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Missing Information</h1>
          <p className="text-muted-foreground mb-6">Property and unit information are required to conduct an inspection.</p>
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (loadingProperty || loadingUnit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{property?.name}</h1>
              <p className="text-muted-foreground mt-1">
                {property?.address_line_1} {property?.postcode}
              </p>
              {unit && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Home className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600">{unit.unit_reference || 'Unit'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {inspectionSubmitted && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              ✓ Inspection submitted successfully and PDF has been generated. You can now view previous inspections or conduct another.
            </AlertDescription>
          </Alert>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (2 columns) */}
          <div className="lg:col-span-2">
            <InspectionForm
              propertyId={propertyId}
              unitId={unitId}
              onSubmitSuccess={() => setInspectionSubmitted(true)}
            />
          </div>

          {/* Previous Inspections Sidebar */}
          <div className="lg:col-span-1">
            <PreviousInspectionsPanel unitId={unitId} propertyId={propertyId} />
          </div>
        </div>

        {/* Inspection Tips */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">📋 Inspection Best Practices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>• Take clear, well-lit photos from multiple angles in each room</p>
            <p>• Document the condition of all fixtures and appliances</p>
            <p>• Note any damage, wear, or defects as they are discovered</p>
            <p>• Compare against the previous inspection to identify new issues</p>
            <p>• Include references to maintenance requests or repair work needed</p>
            <p>• Keep inspection notes objective and factual for legal compliance</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}