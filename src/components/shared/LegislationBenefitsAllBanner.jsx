import React from 'react';
import { Scale, Users, Home, Heart } from 'lucide-react';

export default function LegislationBenefitsAllBanner() {
  return (
    <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-emerald-50 border-l-4 border-l-emerald-600 p-6 rounded-lg">
      <div className="flex items-start gap-4">
        <Scale className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="font-bold text-foreground mb-2">Legislation Benefits Everyone</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Property laws exist to protect tenants from unsafe conditions, landlords from disputes, and society from exploitation. These aren't bureaucratic burdens—they're fairness mechanisms.
          </p>
          <p className="text-sm font-medium text-emerald-900">
            Premiso was built to make those protections accessible to everyone, regardless of portfolio size or budget. Legislation for all. Protection for all.
          </p>
          
          <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-600" />
              <span className="text-muted-foreground">Tenants protected</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-muted-foreground">Landlords empowered</span>
            </div>
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-600" />
              <span className="text-muted-foreground">Market fairness</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}