import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  DollarSign,
  BarChart3,
  Users,
  FileText,
  Wrench,
  Shield,
  Zap,
  Download,
  Eye,
} from 'lucide-react';

export default function ProductBrochure() {
  const sections = [
    {
      title: 'Portfolio Management + Sales',
      icon: Building2,
      description: 'Unified platform for lettings AND sales — real agent listings automatically imported from websites and portals.',
      benefits: [
        'Real property listings from Rightmove/Zoopla/OnTheMarket',
        'Sales leads and progression pipeline',
        'Lettings tenancy management',
        'Unified landlord/tenant/buyer CRM',
      ],
      data: 'Real Agent Listings | Dual Modules | Portal Integration',
    },
    {
      title: 'Financial Intelligence',
      icon: DollarSign,
      description: 'Advanced financial analytics with accounting integration and real-time reporting.',
      benefits: [
        'Automated rent & service charge tracking',
        'QuickBooks/Xero synchronization',
        'Monthly income vs. expense analysis',
        'Tenant arrears management and alerts',
      ],
      data: '£250K+ Annual Income | 92% Collection Rate | 200+ Transactions (Powell & Co)',
    },
    {
      title: 'Compliance & Audit',
      icon: Shield,
      description: 'Comprehensive regulatory compliance with automated audit trails and document management.',
      benefits: [
        'Full compliance audit logging',
        'Bulk document generation (1,000+ at once)',
        'Companies House deadline tracking',
        'Tenancy lifecycle management (England/Wales)',
      ],
      data: '38 Companies | 18 Compliance Checks | Full Audit Trail (Powell & Co)',
    },
    {
      title: 'Tenant Portal',
      icon: Users,
      description: 'White-label tenant experience with secure access to documents and rent history.',
      benefits: [
        'Secure token-based access',
        'Payment history visibility',
        'Document downloads',
        'Maintenance request tracking',
      ],
      data: '60+ Active Tenants | Multi-Region Coverage (Powell & Co)',
    },
    {
      title: 'Operations Hub',
      icon: Wrench,
      description: 'Unified maintenance and workflow automation for operational excellence.',
      benefits: [
        'Priority-based maintenance tracking',
        'Automated workflow triggers',
        'CRM interaction logging',
        'Contractor management',
      ],
      data: '40+ Maintenance Orders | Multiple Contractors | Full Tracking (Powell & Co)',
    },
    {
      title: 'API Integration Network',
      icon: Zap,
      description: 'Extensible platform for connecting external services and custom workflows.',
      benefits: [
        'Custom service integrations',
        'Webhook management & logging',
        'Auto-sync scheduling',
        'Third-party API connectors',
      ],
      data: 'QuickBooks | Xero | Custom APIs | Webhook Support (Powell & Co)',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Premiso Property Management Platform
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Comprehensive SaaS Solution for Enterprise Property Groups
            </p>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Executive Summary */}
        <section className="bg-white rounded-xl shadow-lg p-8 border border-border">
          <h2 className="text-3xl font-serif font-bold mb-6">Executive Overview</h2>
          <div className="space-y-4">
            <p className="text-lg text-foreground leading-relaxed">
              The Premiso Platform is a comprehensive property management solution built on public domain legislation and industry best practices. It integrates real-time financial analytics, automated compliance tracking, tenant-facing portals, and flexible API integrations into a single, unified system.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Data Note:</strong> This brochure combines publicly available regulatory frameworks (Companies House, MEES 2018, Renting Homes Act Wales) with representative fictitious data demonstrating platform capabilities at enterprise scale.
              </p>
            </div>
          </div>
        </section>

        {/* Core Capabilities */}
        <section>
          <h2 className="text-3xl font-serif font-bold mb-8">Core Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section, idx) => {
              const IconComponent = section.icon;
              return (
                <Card key={idx} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Key Benefits:</h4>
                      <ul className="space-y-1">
                        {section.benefits.map((benefit, bidx) => (
                          <li key={bidx} className="text-sm text-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">✓</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground">{section.data}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Detailed Feature Sections */}
        <section className="space-y-12">
          <h2 className="text-3xl font-serif font-bold">Feature Deep Dive</h2>

          {/* Financial Analytics */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-primary" />
                <CardTitle className="text-2xl">Financial Analytics & Reporting</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Real-time financial dashboards with 12-month trend analysis, occupancy metrics, and automated accounting synchronization.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                   <p className="text-xs text-muted-foreground">Total Properties</p>
                   <p className="text-2xl font-bold text-primary">13</p>
                   <p className="text-xs text-muted-foreground mt-1">Powell & Co Portfolio</p>
                 </div>
                 <div className="bg-muted p-4 rounded-lg">
                   <p className="text-xs text-muted-foreground">Units</p>
                   <p className="text-2xl font-bold text-green-600">120+</p>
                   <p className="text-xs text-muted-foreground mt-1">Across UK regions</p>
                 </div>
                 <div className="bg-muted p-4 rounded-lg">
                   <p className="text-xs text-muted-foreground">Companies</p>
                   <p className="text-2xl font-bold text-amber-600">38</p>
                   <p className="text-xs text-muted-foreground mt-1">Group structure</p>
                 </div>
                 <div className="bg-muted p-4 rounded-lg">
                   <p className="text-xs text-muted-foreground">Active Tenants</p>
                   <p className="text-2xl font-bold">60+</p>
                   <p className="text-xs text-muted-foreground mt-1">Multi-region</p>
                 </div>
              </div>
              <div className="bg-slate-900 text-white p-6 rounded-lg">
                <p className="text-sm font-mono text-slate-400 mb-2">Accounting Integration Status</p>
                <p className="text-lg font-semibold mb-4">QuickBooks Sandbox (Active)</p>
                <ul className="text-sm space-y-1">
                  <li>✓ Rent transactions synced automatically</li>
                  <li>✓ Expense categories mapped to GL accounts</li>
                  <li>✓ Last sync: 2 hours ago | Next: 2:00 AM</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Management */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                <CardTitle className="text-2xl">Compliance & Audit Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Comprehensive regulatory compliance tracking for England & Wales, with automated audit logs and bulk document generation.
              </p>
              <div className="space-y-3">
                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Regulatory Checkpoints Tracked:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>✓ Gas Safety Certificates (Annual CP12)</div>
                    <div>✓ EPC Ratings (10-year validity)</div>
                    <div>✓ EICR (5-year interval)</div>
                    <div>✓ Smoke Alarms (Tested day 1)</div>
                    <div>✓ Deposit Registration (30-day requirement)</div>
                    <div>✓ How to Rent Guides (England)</div>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-green-900 mb-2">Current Compliance Status</p>
                  <div className="text-sm space-y-1">
                    <p>✓ 100% of properties have valid Gas Safety Certs</p>
                    <p>✓ 95% EPC coverage (12 properties pending renewal)</p>
                    <p>✓ 92% EICR compliance (18 properties overdue)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tenant Portal */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <CardTitle className="text-2xl">Tenant Portal & Self-Service</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                White-label tenant experience with secure token-based access to rent information, documents, and maintenance requests.
              </p>
              <div className="space-y-3">
                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Tenant Portal Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-sm mb-2">Rent & Payments</p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Payment history (12-month view)</li>
                        <li>• Outstanding balances</li>
                        <li>• Payment due dates</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-2">Documents</p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Tenancy agreements</li>
                        <li>• Safety certificates</li>
                        <li>• Inspection reports</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-2">Maintenance</p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Submit requests</li>
                        <li>• Track progress</li>
                        <li>• View completion status</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-2">Notifications</p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• In-app messages</li>
                        <li>• Important updates</li>
                        <li>• Rent reminders</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm">
                    <strong>Tenant Engagement:</strong> 2,400 active accounts | 87% monthly login rate | 94% document download completion
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Integration */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-primary" />
                <CardTitle className="text-2xl">API Integration & Custom Workflows</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Extensible platform for connecting external services, automating workflows, and integrating third-party systems.
              </p>
              <div className="space-y-3">
                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Connected Services</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      QuickBooks (Active)
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      Utility Sync (Active)
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                      Insurance API (Pending)
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      Council Data (Active)
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900 text-white p-4 rounded-lg">
                  <p className="text-sm font-mono mb-2">Webhook Activity (Last 24 hours)</p>
                  <div className="space-y-1 text-xs">
                    <p>✓ 1,240 events received</p>
                    <p>✓ 1,235 processed successfully (99.6%)</p>
                    <p>✓ 5 errors logged and flagged</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Benefits Summary */}
        <section className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl p-12">
          <h2 className="text-3xl font-serif font-bold mb-8">Key Business Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Operational Efficiency</h3>
              <ul className="space-y-2 text-sm">
                <li>• 92% reduction in manual data entry</li>
                <li>• Automated compliance tracking</li>
                <li>• Real-time portfolio visibility</li>
                <li>• Bulk operations (1,000+ documents)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Financial Control</h3>
              <ul className="space-y-2 text-sm">
                <li>• 92% collection rate on rent</li>
                <li>• Automated accounting integration</li>
                <li>• Real-time arrears tracking</li>
                <li>• 12-month financial forecasting</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Compliance & Risk</h3>
              <ul className="space-y-2 text-sm">
                <li>• 100% audit trail coverage</li>
                <li>• Regulatory deadline alerts</li>
                <li>• Document version control</li>
                <li>• England/Wales legislation support</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data & Methodology */}
        <section className="bg-white rounded-xl shadow-lg p-8 border border-border">
          <h2 className="text-2xl font-serif font-bold mb-6">Data & Methodology</h2>
          <div className="space-y-4 text-sm text-foreground">
            <p>
              <strong>Public Domain Information:</strong> This platform documentation references publicly available regulatory frameworks including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Companies House Filing Requirements & SIC Code Classifications</li>
              <li>Minimum Energy Efficiency Standards (MEES) 2018 Regulations</li>
              <li>Renting Homes Act 2016 (Wales) & Housing Act 1988 (England)</li>
              <li>Health & Safety Standards (Gas Safety, Electrical Installation, Smoke Alarms)</li>
              <li>Deposit Protection & Tenancy Reference Schemes</li>
            </ul>
            <p className="mt-4">
              <strong>Fictitious Data:</strong> All numerical metrics, tenant accounts, transaction amounts, and property counts are representative fictitious data demonstrating platform capabilities at enterprise scale. These figures are not based on actual Premiso operations but illustrate the system's ability to manage large-scale property portfolios.
            </p>
            <p className="mt-4 bg-amber-50 border border-amber-200 rounded p-3">
              <strong>Document Purpose:</strong> This brochure is intended for demonstration and educational purposes, showcasing the comprehensive capabilities of the Premiso Property Management Platform. Any resemblance to actual figures is coincidental.
            </p>
          </div>
        </section>

        {/* CTA Footer */}
        <section className="text-center py-12">
          <h2 className="text-3xl font-serif font-bold mb-4">Ready to Transform Your Property Management?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            The Premiso Platform provides enterprise-grade property management with financial analytics, compliance automation, and tenant engagement—all in one unified system.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="gap-2">
              <Eye className="w-4 h-4" />
              Request Demo
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download Brochure
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}