import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Shield, Zap, BarChart3, Users } from 'lucide-react';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ProductOnePageBrochure() {
  const brochureRef = useRef(null);

  const downloadPDF = async () => {
    const element = brochureRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    pdf.save('Premiso-Product-Brochure.pdf');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Brochure - One Page PDF</h1>
        <Button onClick={downloadPDF} className="gap-2">
          <Zap className="w-4 h-4" />
          Download as PDF
        </Button>
      </div>

      {/* Printable Brochure */}
      <div ref={brochureRef} className="bg-white print:bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm' }}>
        
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">PREMISO</h1>
          <p className="text-lg text-gray-600">The All-in-One Property Management Platform for UK Lettings, Block Management & Compliance</p>
        </div>

        {/* Problem Statement */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-bold text-sm text-red-700 mb-2">THE PROBLEM</h3>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• Juggling 5+ software platforms</li>
              <li>• £2,000-3,000/mo on scattered modules</li>
              <li>• Manual data syncing & errors</li>
              <li>• Regulatory compliance gaps</li>
              <li>• Tenant & contractor frustration</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm text-green-700 mb-2">THE SOLUTION: PREMISO</h3>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>✓ One unified platform (no add-ons)</li>
              <li>✓ £199–£999/month all-in pricing</li>
              <li>✓ Real-time integration & sync</li>
              <li>✓ 15+ UK compliance frameworks built-in</li>
              <li>✓ Automated workflows, 24/7 portals</li>
            </ul>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="mb-8">
          <h3 className="font-bold text-sm text-gray-900 mb-3 uppercase">Pricing & Tiers</h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="border border-gray-300 p-3 rounded">
              <p className="font-bold text-blue-600">Starter</p>
              <p className="text-lg font-bold">£199/mo</p>
              <p className="text-gray-600">Up to 75 units</p>
              <ul className="text-xs text-gray-700 space-y-0.5 mt-2">
                <li>• Tenant & landlord portal</li>
                <li>• Maintenance & compliance</li>
                <li>• Rent tracking & documents</li>
              </ul>
            </div>
            <div className="border-2 border-blue-600 p-3 rounded bg-blue-50">
              <p className="font-bold text-blue-700">Professional ⭐</p>
              <p className="text-lg font-bold">£449/mo</p>
              <p className="text-gray-600">Up to 400 units</p>
              <ul className="text-xs text-gray-700 space-y-0.5 mt-2">
                <li>• Block & leasehold mgmt</li>
                <li>• Service charges</li>
                <li>• Sales CRM & analytics</li>
                <li>• Accounting sync (QB, Xero)</li>
              </ul>
            </div>
            <div className="border border-gray-300 p-3 rounded">
              <p className="font-bold text-blue-600">Enterprise</p>
              <p className="text-lg font-bold">£999/mo</p>
              <p className="text-gray-600">Unlimited units</p>
              <ul className="text-xs text-gray-700 space-y-0.5 mt-2">
                <li>• 24/7 call centre</li>
                <li>• Custom integrations</li>
                <li>• Dedicated account mgr</li>
                <li>• SLA guarantee</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <h4 className="font-bold text-xs text-gray-900 mb-2">✓ Core Features</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• Multi-property management</li>
              <li>• Tenant/landlord portals</li>
              <li>• Online rent payment</li>
              <li>• Maintenance tracking</li>
              <li>• Contractor management</li>
              <li>• Document storage (unlimited)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900 mb-2">✓ Compliance & Reporting</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• 15+ certificate tracking</li>
              <li>• Fire Safety Register</li>
              <li>• Deposit protection monitoring</li>
              <li>• Automated P&L reporting</li>
              <li>• Audit trail logging</li>
              <li>• Companies House integration</li>
            </ul>
          </div>
        </div>

        {/* Competitive Advantage */}
        <div className="bg-blue-50 border border-blue-200 p-3 mb-8 rounded">
          <h4 className="font-bold text-xs text-blue-900 mb-2">WHY PREMISO WINS</h4>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <p className="font-bold text-blue-700">Unified</p>
              <p className="text-gray-700">No costly add-on modules</p>
            </div>
            <div>
              <p className="font-bold text-blue-700">UK-Compliant</p>
              <p className="text-gray-700">MEES, Companies House, RHA built-in</p>
            </div>
            <div>
              <p className="font-bold text-blue-700">50% Cheaper</p>
              <p className="text-gray-700">vs AppFolio & Yardi on comparable portfolios</p>
            </div>
            <div>
              <p className="font-bold text-blue-700">Developer-Ready</p>
              <p className="text-gray-700">APIs, webhooks, custom integrations</p>
            </div>
          </div>
        </div>

        {/* Competitor Comparison */}
        <div className="mb-8">
          <h4 className="font-bold text-xs text-gray-900 mb-2">Annual TCO - 250 Unit Portfolio</h4>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="bg-green-50 p-2 rounded border border-green-200">
              <p className="font-bold text-green-700">Premiso</p>
              <p className="text-lg font-bold text-green-900">£5,388/yr</p>
              <p className="text-gray-600">All-in-one</p>
            </div>
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <p className="font-bold">AppFolio</p>
              <p className="text-lg font-bold">£14,400/yr+</p>
              <p className="text-gray-600">Multiple modules</p>
            </div>
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <p className="font-bold">Yardi</p>
              <p className="text-lg font-bold">£24,000/yr+</p>
              <p className="text-gray-600">Enterprise only</p>
            </div>
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <p className="font-bold">Goodlord</p>
              <p className="text-lg font-bold">£2,400/yr</p>
              <p className="text-gray-600">Lettings only</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="border-t-2 border-blue-600 pt-4 text-center">
          <p className="text-sm font-bold text-gray-900 mb-2">Ready to Simplify Property Management?</p>
          <p className="text-xs text-gray-700">30-day free trial • No credit card required • Full feature access • Expert onboarding</p>
          <p className="text-xs text-blue-600 font-bold mt-2">Visit www.premiso.io | Email hello@premiso.io | Call 020 XXXX XXXX</p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-6 pt-4 border-t border-gray-200">
          <p>Premiso © 2026 | UK Property Management Platform | All rights reserved</p>
        </div>

      </div>

      {/* Printable CSS */}
      <style>{`
        @media print {
          * { margin: 0; padding: 0; }
          body { background: white; }
          .print\\:bg-white { background: white !important; }
        }
      `}</style>
    </div>
  );
}