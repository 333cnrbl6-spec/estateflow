import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PropertyInspectionManager from '@/components/inspections/PropertyInspectionManager';
import InspectionEditor from '@/components/inspections/InspectionEditor';

export default function PropertyInspections() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showManager, setShowManager] = useState(false);

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list()
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Property Inspections</h1>
          <p className="text-muted-foreground mt-1">
            Create digital inventory reports, condition assessments, and tenant sign-offs
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {properties?.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{property.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {property.address_line_1}, {property.city}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setSelectedProperty(property);
                      setShowManager(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Manage Inspections
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!properties || properties.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Properties Yet</h3>
          <p className="text-muted-foreground">
            Add properties to start creating inspection reports
          </p>
        </div>
      ) : null}

      {showManager && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Inspections: {selectedProperty.name}
              </h2>
              <Button
                variant="outline"
                onClick={() => {
                  setShowManager(false);
                  setSelectedProperty(null);
                }}
              >
                Close
              </Button>
            </div>
            <PropertyInspectionManager
              propertyId={selectedProperty.id}
              unitId={null}
              tenantId={null}
            />
          </div>
        </div>
      )}
    </div>
  );
}