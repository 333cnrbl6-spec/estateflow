import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Phone, Mail, MapPin } from 'lucide-react';

export default function VendorList({ vendors = [], onSelect }) {
  const getTypeColor = (type) => {
    const colors = {
      plumber: 'bg-blue-100 text-blue-700',
      electrician: 'bg-yellow-100 text-yellow-700',
      gas_engineer: 'bg-red-100 text-red-700',
      general_contractor: 'bg-purple-100 text-purple-700',
      cleaning: 'bg-green-100 text-green-700',
      gardening: 'bg-emerald-100 text-emerald-700',
      pest_control: 'bg-orange-100 text-orange-700',
      other: 'bg-slate-100 text-slate-700'
    };
    return colors[type] || colors.other;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-slate-100 text-slate-700',
      on_hold: 'bg-yellow-100 text-yellow-700',
      blacklisted: 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.inactive;
  };

  if (vendors.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No vendors found</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {vendors.map(vendor => (
        <Card key={vendor.id} className="p-4 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-foreground text-lg">{vendor.name}</h3>
                <Badge className={getTypeColor(vendor.type)}>
                  {vendor.type.replace(/_/g, ' ')}
                </Badge>
                <Badge className={getStatusColor(vendor.status)}>
                  {vendor.status}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                Contact: {vendor.contact_name}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                {vendor.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {vendor.email}
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {vendor.phone}
                  </div>
                )}
                {vendor.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {vendor.address}
                  </div>
                )}
              </div>

              {vendor.rating && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(vendor.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground">{vendor.rating}/5</span>
                  {vendor.completion_rate && (
                    <span className="text-muted-foreground">• {vendor.completion_rate}% on-time</span>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={() => onSelect(vendor)}
              variant="outline"
              size="sm"
              className="shrink-0 ml-4"
            >
              View Details
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}