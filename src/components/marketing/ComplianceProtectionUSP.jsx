import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, Shield } from 'lucide-react';

/**
 * Universal Sales Pitch Components
 * Core message: "Compliance protection scaled for everyone"
 * Use these across sales, marketing, demos, and printed materials
 */

export const ComplianceUSP = () => (
  <div className="space-y-4">
    <div className="bg-blue-50 border-l-4 border-l-blue-600 p-4">
      <p className="font-bold text-blue-900 text-sm">The Premiso Difference</p>
      <p className="text-xs text-blue-700 mt-2">
        Enterprise-grade compliance protection built-in at every subscription level. Your portfolio size doesn't determine your legal safeguards—they're standardized across the system. Whether you manage 1 property or 1,000, you get the same automated audit trails, certificate tracking, deposit protection, and enforcement blocks.
      </p>
    </div>
  </div>
);

export const ThreeLayerMessage = () => (
  <div className="space-y-3">
    <div className="flex gap-3 p-3 bg-green-50 rounded border border-green-200">
      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-bold text-green-900">Everyone Gets Protection</p>
        <p className="text-green-700 text-xs mt-1">Compliance isn't a premium tier—it's built into the platform for all users.</p>
      </div>
    </div>
    <div className="flex gap-3 p-3 bg-blue-50 rounded border border-blue-200">
      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-bold text-blue-900">Scales With Your Portfolio</p>
        <p className="text-blue-700 text-xs mt-1">Same automation handles 1 property or 100. No fragmentation, no tier-based limits.</p>
      </div>
    </div>
    <div className="flex gap-3 p-3 bg-emerald-50 rounded border border-emerald-200">
      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-bold text-emerald-900">Same Cost Model</p>
        <p className="text-emerald-700 text-xs mt-1">You don't pay extra for audit trails, blocking rules, or vendor verification. It's all standard.</p>
      </div>
    </div>
  </div>
);

export const DemoScriptPoints = [
  "Premiso's core design principle: compliance protection isn't optional or tiered—it's fundamental to how the system works, for everyone",
  "A new landlord with 1 property gets the same deposit protection audit trail as a 50-property portfolio group",
  "Automated alerts, certificate tracking, and enforcement blocks work identically whether you manage 5 or 500 properties",
  "We don't charge extra for legal safeguards because we believe every landlord—regardless of scale—deserves protection from prosecution",
  "This is our competitive advantage: we've architected the platform so that enterprise-grade compliance scales down, not up in cost"
];

export const PrintMaterialBlurb = `
ENTERPRISE-GRADE COMPLIANCE PROTECTION AT EVERY SCALE

Premiso delivers the same legal compliance safeguards whether you manage 1 property or 200. Every user gets: 30-day compliance alerts, deposit protection audit trails with full proof, gas/electrical/EPC tracking, right-to-rent verification, vendor screening, and enforcement blocks.

We don't believe landlords should choose between affordability and legal protection. Legislation was designed to benefit everyone—landlords, tenants, and society. Premiso makes those protections accessible to all.

Legislation. For everyone. That's Premiso.
`;