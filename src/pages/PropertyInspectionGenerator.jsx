import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InspectionChecklist from '@/components/inspection/InspectionChecklist';

export default function PropertyInspectionGenerator() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [inspectionData, setInspectionData] = useState(null);

  // Fetch properties
  const propertiesQuery = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-updated_date', 100),
  });

  // Fetch units for selected property
  const unitsQuery = useQuery({
    queryKey: ['units', selectedProperty?.id],
    enabled: !!selectedProperty,
    queryFn: () => base44.entities.Unit.filter(
      { property_id: selectedProperty.id },
      '-updated_date',
      50
    ),
  });

  // Fetch contacts for property
  const contactsQuery = useQuery({
    queryKey: ['contacts', selectedProperty?.id],
    enabled: !!selectedProperty,
    queryFn: () => base44.entities.Contact.filter(
      { property_id: selectedProperty.id },
      '-updated_date',
      50
    ),
  });

  const { data: properties = [] } = propertiesQuery;
  const { data: units = [] } = unitsQuery;
  const { data: contacts = [] } = contactsQuery;

  if (inspectionData) {
    return (
      <InspectionChecklist
        property={selectedProperty}
        unit={selectedUnit}
        landlords={contacts.filter(c => c.contact_type === 'landlord')}
        onBack={() => setInspectionData(null)}
      />
    );
  }

  // Property selection
  if (!selectedProperty) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Inspection Report Generator</h1>
            <p className="text-muted-foreground mt-2">Select a property to start</p>
          </div>

          <div className="space-y-3">
            {properties.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <p className="text-muted-foreground">No properties available</p>
              </div>
            ) : (
              properties.map(prop => (
                <button
                  key={prop.id}
                  onClick={() => setSelectedProperty(prop)}
                  className="w-full text-left p-4 bg-card rounded-lg border border-border hover:border-primary hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-foreground">{prop.name}</h3>
                  <p className="text-sm text-muted-foreground">{prop.address_line_1}, {prop.city}</p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Unit selection
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setSelectedProperty(null)}
          className="mb-6 gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Properties
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{selectedProperty.name}</h1>
          <p className="text-muted-foreground mt-2">Select a unit to inspect</p>
        </div>

        <div className="space-y-3">
          {units.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">No units available</p>
            </div>
          ) : (
            units.map(unit => (
              <button
                key={unit.id}
                onClick={() => {
                  setSelectedUnit(unit);
                  setInspectionData({ rooms: [] });
                }}
                className="w-full text-left p-4 bg-card rounded-lg border border-border hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-foreground">{unit.name}</h3>
                <p className="text-sm text-muted-foreground">Status: {unit.status}</p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}