import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Zap, Users, Home, TrendingUp, Wrench } from 'lucide-react';

export default function FeatureSummary() {
  const features = [
    {
      category: 'Maintenance Management Engine',
      icon: Wrench,
      items: [
        'Tenant maintenance request form with photo uploads',
        'Category & priority selection (Plumbing, Electrical, Heating, Appliance, etc.)',
        'Automatic manager/landlord alerts via email',
        'Contractor assignment from vendor directory',
        'Lifecycle tracking: Pending → Assigned → In Progress → Resolved → Closed',
        'Real-time notifications at each stage',
        'Manager dashboard with status filtering',
        'Photo documentation & request history'
      ]
    },
    {
      category: 'Secure Tenant Dashboard',
      icon: Users,
      items: [
        'View active lease details with expiration alerts',
        'Monthly rent, deposit, and lease term visibility',
        'Submit maintenance requests with photo uploads',
        'Track maintenance request progress live',
        '12-month payment history and upcoming invoices',
        'Receipt downloads and payment reference tracking',
        'Access gas safety, electrical (EICR), and fire safety certificates',
        'Certificate expiry status with alert indicators'
      ]
    },
    {
      category: 'AI Property Valuation Engine',
      icon: Home,
      items: [
        'Automated property valuation analysis',
        'Comparable properties research via land registry',
        'Market demand scoring (0-100)',
        'Estimated rental yield calculation',
        'Projected annual growth rate',
        'Tenant demand level assessment',
        'Neighborhood & area scoring',
        'Investment recommendations with risk analysis',
        'Valuation history tracking for portfolio growth'
      ]
    },
    {
      category: 'Rental Price Optimizer',
      icon: TrendingUp,
      items: [
        'AI-driven rental price recommendations',
        'Land registry comparable property analysis',
        'Local market trend integration',
        'Monthly/annual income impact projections',
        'Confidence level scoring',
        'Market demand signals',
        'Rental growth rate forecasting',
        'Risk warnings for large price increases',
        'Comparable properties display with details'
      ]
    },
    {
      category: 'Document & Safety Management',
      icon: CheckCircle2,
      items: [
        'Gas Safety Certificate (CP12) tracking with alerts',
        'Electrical Installation Condition Report (EICR) cycles',
        'Fire Risk Assessment management',
        'Certificate upload & version control',
        'Automatic expiry alerts (30, 14, 7 day windows)',
        'Tenant access to documents via portal',
        'Compliance status dashboard',
        'Audit trail for all document actions'
      ]
    },
    {
      category: 'Financial & Reporting',
      icon: Zap,
      items: [
        'Real-time rent payment tracking',
        'Arrears detection & automated alerts',
        'Monthly financial reporting',
        'Income & expense analysis',
        'Service charge management',
        'Ground rent tracking',
        'Accounting integration (QuickBooks/Xero)',
        'Custom report generation with export to PDF'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Feature Catalogue</h1>
          <p className="text-xl text-slate-600">
            Complete property management platform with AI-driven valuation, maintenance automation, and tenant portal
          </p>
          <p className="text-sm text-slate-500 mt-2">May 2026 Release — Ready for Launch</p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((section, idx) => {
            const Icon = section.icon;
            return (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{section.category}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Stats */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Platform Readiness — May 2026</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-5 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">100%</p>
              <p className="text-sm text-slate-600 mt-1">Core Modules Complete</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">6</p>
              <p className="text-sm text-slate-600 mt-1">Major Feature Areas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">30+</p>
              <p className="text-sm text-slate-600 mt-1">API Entities</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">24/7</p>
              <p className="text-sm text-slate-600 mt-1">Maintenance Support</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">AI-Driven</p>
              <p className="text-sm text-slate-600 mt-1">Valuations & Pricing</p>
            </div>
          </CardContent>
        </Card>

        {/* Key Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: 'QuickBooks', status: 'Integrated' },
                { name: 'Xero', status: 'Integrated' },
                { name: 'Slack', status: 'Available' },
                { name: 'Zapier', status: 'Available' },
                { name: 'Stripe', status: 'Available' },
                { name: 'Land Registry', status: 'Integrated' }
              ].map((svc, i) => (
                <div key={i} className="p-4 border rounded-lg text-center">
                  <p className="font-semibold text-slate-900">{svc.name}</p>
                  <p className="text-xs text-slate-600 mt-1">{svc.status}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deployment Notes */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Launch Readiness Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-blue-800">
            <p className="flex gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-blue-600" />
              <span><strong>Core Platform:</strong> All modules built and tested (Maintenance, Tenant Portal, Valuation, Pricing)</span>
            </p>
            <p className="flex gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-blue-600" />
              <span><strong>Automations:</strong> Email notifications configured for all lifecycle stages</span>
            </p>
            <p className="flex gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-blue-600" />
              <span><strong>AI Integration:</strong> LLM-powered valuation and rental optimization functional</span>
            </p>
            <p className="flex gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-blue-600" />
              <span><strong>Documentation:</strong> Updated across all user manuals, API docs, and help center</span>
            </p>
            <p className="flex gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-blue-600" />
              <span><strong>Sales Materials:</strong> Feature summary, brochures, and pricing updated May 3, 2026</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}