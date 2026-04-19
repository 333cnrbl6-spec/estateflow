import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, MapPin, Calendar } from 'lucide-react';

export default function TenancyDetailsCard({ tenancy, property }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        Tenancy Details
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Property</span>
          <span className="font-medium">{property?.name || 'N/A'}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Address</span>
          <span className="font-medium text-right">
            {property?.address_line_1 || 'N/A'}<br/>
            {property?.city && <>{property.city}, </>}
            {property?.postcode || ''}
          </span>
        </div>
        {tenancy.unit && (
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Unit</span>
            <span className="font-medium">{tenancy.unit.name || tenancy.unit.unit_number}</span>
          </div>
        )}
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Tenancy Type</span>
          <span className="font-medium capitalize">{tenancy.tenancy_type || 'Assured Shorthold'}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Start Date</span>
          <span className="font-medium">
            {tenancy.tenancy_start_date ? new Date(tenancy.tenancy_start_date).toLocaleDateString('en-GB') : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">End Date</span>
          <span className="font-medium">
            {tenancy.tenancy_end_date ? new Date(tenancy.tenancy_end_date).toLocaleDateString('en-GB') : 'Periodic'}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-muted-foreground">Status</span>
          <Badge className={tenancy.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {tenancy.status?.replace('_', ' ').toUpperCase() || 'ACTIVE'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}