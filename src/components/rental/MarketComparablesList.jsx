import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home } from 'lucide-react';

export default function MarketComparablesList({ comparables }) {
  if (!Array.isArray(comparables) || comparables.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5" />
          Comparable Properties Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Similar properties in your area from land registry and local market data
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {comparables.map((comp, idx) => (
            <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-slate-900">{comp.name || `Comparable ${idx + 1}`}</p>
                  {comp.location && (
                    <p className="text-xs text-muted-foreground mt-1">{comp.location}</p>
                  )}
                </div>
                {comp.rent && (
                  <Badge className="bg-primary/10 text-primary">
                    £{(comp.rent / 100).toLocaleString()}/mo
                  </Badge>
                )}
              </div>

              <div className="grid md:grid-cols-4 gap-3 text-sm mt-3">
                {comp.beds && (
                  <div>
                    <p className="text-muted-foreground">Bedrooms</p>
                    <p className="font-medium">{comp.beds}</p>
                  </div>
                )}
                {comp.baths && (
                  <div>
                    <p className="text-muted-foreground">Bathrooms</p>
                    <p className="font-medium">{comp.baths}</p>
                  </div>
                )}
                {comp.size_sqft && (
                  <div>
                    <p className="text-muted-foreground">Size</p>
                    <p className="font-medium">{comp.size_sqft} sq ft</p>
                  </div>
                )}
                {comp.rent_per_sqft && (
                  <div>
                    <p className="text-muted-foreground">Rent/sq ft</p>
                    <p className="font-medium">£{comp.rent_per_sqft.toFixed(2)}</p>
                  </div>
                )}
              </div>

              {comp.distance_km && (
                <p className="text-xs text-muted-foreground mt-2">
                  Distance: {comp.distance_km.toFixed(1)} km away
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Data Source:</span> These properties are sourced from Land Registry records and local market listings within your area. Analysis updated based on recent comparable transactions and market activity.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}