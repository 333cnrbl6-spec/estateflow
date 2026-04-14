import React, { useState } from 'react';
import { FileText, Download, Printer, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DocumentationViewer = () => {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    features: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.getElementById('documentation-content');
    const opt = {
      margin: 10,
      filename: 'PREMISO_Documentation.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8 sticky top-0 bg-background/80 backdrop-blur-sm py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Premiso Documentation</h1>
                <p className="text-sm text-muted-foreground">Complete Platform Guide & Reference</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Documentation Content */}
        <div id="documentation-content" className="prose prose-sm max-w-none">
          
          {/* EXECUTIVE SUMMARY */}
          <section className="mb-12">
            <div className="bg-card rounded-lg border border-border p-6 mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Executive Summary</h2>
              <div className="space-y-4 text-foreground">
                <p>
                  <strong>Premiso</strong> is a next-generation Compliance Management Platform designed for property management companies, block management firms, and landlords across the United Kingdom.
                </p>
                <p>
                  The platform automates regulatory compliance tracking, certificate lifecycle management, financial reporting, and operational workflows—reducing manual administrative work by 80% while ensuring zero compliance breaches.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Problem Solved:</p>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    Missing compliance deadlines can result in fines up to £30,000+, tenant disputes, or legal action. Premiso eliminates manual compliance checking through automation.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => toggleSection('overview')}
              className="w-full bg-card rounded-lg border border-border p-4 hover:bg-muted transition-colors"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Key Features Overview</h3>
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.overview ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {expandedSections.overview && (
              <div className="mt-4 space-y-3">
                <div className="bg-card rounded-lg border border-border p-4">
                  <h4 className="font-semibold text-foreground mb-2">✓ Real-time Companies House Sync</h4>
                  <p className="text-sm text-muted-foreground">Daily automated checks for company status changes, filing deadlines, director changes</p>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                  <h4 className="font-semibold text-foreground mb-2">✓ Certificate Lifecycle Tracking</h4>
                  <p className="text-sm text-muted-foreground">Automatic reminders 30 days before expiry; stores documents; generates audit trails</p>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                  <h4 className="font-semibold text-foreground mb-2">✓ Proactive Alerts</h4>
                  <p className="text-sm text-muted-foreground">Email digests, dashboard notifications, configurable alert preferences</p>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                  <h4 className="font-semibold text-foreground mb-2">✓ Mobile Contractor Portal</h4>
                  <p className="text-sm text-muted-foreground">On-site contractors can submit invoices, upload photos, track job status</p>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                  <h4 className="font-semibold text-foreground mb-2">✓ Financial Integration</h4>
                  <p className="text-sm text-muted-foreground">Xero, Sage, QuickBooks sync for accounting records</p>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                  <h4 className="font-semibold text-foreground mb-2">✓ Complete Audit Trail</h4>
                  <p className="text-sm text-muted-foreground">Full history of all actions, compliance checks, and decisions</p>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                  <h4 className="font-semibold text-foreground mb-2">✓ Role-Based Dashboards</h4>
                  <p className="text-sm text-muted-foreground">Admin, Landlord, and Contractor each see relevant data only</p>
                </div>
              </div>
            )}
          </section>

          {/* PLATFORM OVERVIEW */}
          <section className="mb-12">
            <button
              onClick={() => toggleSection('features')}
              className="w-full bg-card rounded-lg border border-border p-4 hover:bg-muted transition-colors mb-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Core Features Detailed</h3>
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.features ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {expandedSections.features && (
              <div className="space-y-6">
                
                <div className="bg-card rounded-lg border border-border p-6">
                  <h4 className="text-lg font-bold text-foreground mb-3">1. Companies House Integration</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">What it does:</strong> Automatically syncs company information from UK Companies House every day at 2 AM UTC</p>
                    <div className="bg-muted p-3 rounded mt-3">
                      <p className="font-semibold text-foreground mb-2">Key Data Tracked:</p>
                      <ul className="list-disc list-inside space-y-1 text-foreground">
                        <li>Company status (Active, Dissolved, Liquidation)</li>
                        <li>Officers and directors with appointment dates</li>
                        <li>Persons with Significant Control (PSC)</li>
                        <li>Filing history and deadlines</li>
                        <li>Automatic alerts for status changes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h4 className="text-lg font-bold text-foreground mb-3">2. Certificate Lifecycle Management</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">What it does:</strong> Tracks all compliance certificates with automatic renewal reminders</p>
                    <div className="bg-muted p-3 rounded mt-3">
                      <p className="font-semibold text-foreground mb-2">Supported Certificate Types:</p>
                      <ul className="space-y-2 text-foreground">
                        <li><strong>Gas Safety (CP12):</strong> Annual renewal, track appliances tested, defects</li>
                        <li><strong>Electrical (EICR):</strong> Every 5 years, monitor remedial work deadlines</li>
                        <li><strong>Fire Safety:</strong> Annual inspection, extinguisher maintenance</li>
                        <li><strong>Deposit Protection:</strong> 30-day registration, dispute tracking</li>
                        <li><strong>Right to Rent:</strong> Immigration compliance, follow-up checks</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded p-3 mt-3">
                      <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                        <strong>Alert System:</strong> Notifications at 30 days, 14 days, and on expiry date. Customizable via email, dashboard, or SMS.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h4 className="text-lg font-bold text-foreground mb-3">3. Property & Unit Management</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">What it does:</strong> Centralized management of properties, units, and occupancy tracking</p>
                    <div className="bg-muted p-3 rounded mt-3">
                      <p className="font-semibold text-foreground mb-2">Tracked Metrics:</p>
                      <ul className="space-y-1 text-foreground">
                        <li>• Property types (blocks, houses, commercial, RTM)</li>
                        <li>• Unit status (occupied, vacant, under repair)</li>
                        <li>• Occupancy rate calculation</li>
                        <li>• Rent amounts and yield calculations</li>
                        <li>• Tenant assignments and tenancy dates</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h4 className="text-lg font-bold text-foreground mb-3">4. Financial Management</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">What it does:</strong> Complete financial tracking including rent, expenses, and reporting</p>
                    <div className="bg-muted p-3 rounded mt-3">
                      <p className="font-semibold text-foreground mb-2">Financial Features:</p>
                      <ul className="space-y-1 text-foreground">
                        <li>• Rent payment tracking and reminders</li>
                        <li>• Service charge calculations</li>
                        <li>• Bank reconciliation</li>
                        <li>• Integration with Xero, Sage, QuickBooks</li>
                        <li>• Monthly P&L reports</li>
                        <li>• Arrears tracking and escalation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h4 className="text-lg font-bold text-foreground mb-3">5. Maintenance Management</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">What it does:</strong> Tracks repairs from tenant request through contractor completion</p>
                    <div className="bg-muted p-3 rounded mt-3">
                      <p className="font-semibold text-foreground mb-2">Maintenance Workflow:</p>
                      <ol className="space-y-1 text-foreground list-decimal list-inside">
                        <li>Tenant submits request</li>
                        <li>Manager assigns contractor</li>
                        <li>Contractor accepts job</li>
                        <li>Work completed with photos</li>
                        <li>Invoice submitted and approved</li>
                        <li>Payment processed</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h4 className="text-lg font-bold text-foreground mb-3">6. Error Monitoring & System Health</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">What it does:</strong> Real-time tracking of system errors with automatic logging</p>
                    <div className="bg-muted p-3 rounded mt-3">
                      <p className="font-semibold text-foreground mb-2">Monitoring Features:</p>
                      <ul className="space-y-1 text-foreground">
                        <li>• Automatic error capture from all users</li>
                        <li>• Stack traces for debugging</li>
                        <li>• 7-day error trend analysis</li>
                        <li>• Severity distribution tracking</li>
                        <li>• No external service required (built-in)</li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </section>

          {/* TECHNOLOGY STACK */}
          <section className="mb-12 bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Technology Stack</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-foreground mb-2">Frontend:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• React 18.2</li>
                  <li>• Tailwind CSS</li>
                  <li>• React Router</li>
                  <li>• React Query</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-2">Backend:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Deno Deploy</li>
                  <li>• Base44 SDK</li>
                  <li>• Scheduled Functions</li>
                  <li>• Real-time Subscriptions</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-2">Database:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 40+ Entities</li>
                  <li>• Auto Timestamps</li>
                  <li>• Audit Logging</li>
                  <li>• Row-level Security</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-2">Integrations:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Companies House API</li>
                  <li>• Stripe Payments</li>
                  <li>• Accounting Software</li>
                  <li>• Email Services</li>
                </ul>
              </div>
            </div>
          </section>

          {/* STATISTICS */}
          <section className="mb-12">
            <h3 className="text-lg font-bold text-foreground mb-4">Platform Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-lg border border-border p-4 text-center">
                <p className="text-3xl font-bold text-primary">40+</p>
                <p className="text-sm text-muted-foreground">Entities</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4 text-center">
                <p className="text-3xl font-bold text-primary">50+</p>
                <p className="text-sm text-muted-foreground">Backend Functions</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4 text-center">
                <p className="text-3xl font-bold text-primary">6</p>
                <p className="text-sm text-muted-foreground">Automated Workflows</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4 text-center">
                <p className="text-3xl font-bold text-primary">15+</p>
                <p className="text-sm text-muted-foreground">Integrations</p>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <section className="bg-muted rounded-lg p-6 text-center text-sm text-muted-foreground">
            <p><strong>PREMISO Compliance Management Platform</strong></p>
            <p>Version 2.0 — April 2026</p>
            <p className="mt-2">For detailed documentation, see PREMISO_COMPREHENSIVE_PART1.md</p>
            <p>Support: support@premiso.io</p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default DocumentationViewer;