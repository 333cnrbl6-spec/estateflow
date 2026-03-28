import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function PlatformTour() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const screenshots = [
    {
      title: 'Dashboard',
      subtitle: 'Portfolio Overview & Key Metrics',
      description: 'Real-time portfolio summary with key performance indicators, recent alerts, and visual analytics.',
      sections: [
        { label: 'Companies', value: '35', icon: '📊' },
        { label: 'Properties', value: '250', icon: '🏢' },
        { label: 'Occupancy', value: '92%', icon: '📈' },
        { label: 'Active Tenants', value: '1,240', icon: '👥' },
        { label: 'Rental Income', value: '£2.4M', icon: '💷' },
        { label: 'Expected Spend', value: '£892K', icon: '💰' },
        { label: 'Service Charge', value: '£184K', icon: '⚙️' },
        { label: 'Maintenance', value: '42', icon: '🔧' },
      ],
      charts: ['Companies by Category', 'Properties by Region'],
      widgets: ['Recent Maintenance Orders', 'Setup Progress Tracker'],
      color: 'from-blue-50',
    },
    {
      title: 'Companies',
      subtitle: 'Corporate Structure Management',
      description: 'Manage company entities, directors, filing deadlines, and Companies House registrations.',
      sections: [
        { label: 'Total Companies', value: '35', icon: '🏛️' },
        { label: 'Active Status', value: '33', icon: '✓' },
        { label: 'Dissolved', value: '2', icon: '✗' },
        { label: 'Accounts Due', value: '8', icon: '📅' },
      ],
      filters: ['Status', 'Region', 'Category'],
      tableColumns: ['Company Name', 'Registration', 'Status', 'Accounts Due', 'Confirmation'],
      color: 'from-purple-50',
    },
    {
      title: 'Properties',
      subtitle: 'Portfolio Holdings',
      description: 'View and manage all property assets, ownership types, and unit allocations.',
      sections: [
        { label: 'Total Properties', value: '250', icon: '🏢' },
        { label: 'Leasehold Blocks', value: '142', icon: '🏗️' },
        { label: 'Freehold Houses', value: '85', icon: '🏠' },
        { label: 'Mixed Use', value: '23', icon: '🏪' },
      ],
      filters: ['Type', 'Region', 'Ownership'],
      metrics: ['Total Units', 'Occupied', 'Vacant', 'Value'],
      color: 'from-green-50',
    },
    {
      title: 'Financial Reporting',
      subtitle: 'Advanced Analytics & Trend Analysis',
      description: 'Comprehensive financial dashboards with 12-month trends, occupancy analysis, and collection rates.',
      sections: [
        { label: 'Total Income', value: '£2.4M', icon: '📈' },
        { label: 'Collection Rate', value: '92%', icon: '✓' },
        { label: 'Arrears', value: '£186K', icon: '⚠️' },
        { label: 'Cost Ratio', value: '38%', icon: '📊' },
      ],
      charts: ['12-Month Income Trend', 'Expense Breakdown', 'Occupancy Rate', 'Collection Forecast'],
      color: 'from-amber-50',
    },
    {
      title: 'Compliance Audit',
      subtitle: 'Regulatory Compliance & Audit Trail',
      description: 'Full compliance tracking with audit logs, bulk document generation, and regulatory deadline management.',
      sections: [
        { label: 'Active Audits', value: '18', icon: '✓' },
        { label: 'Audit Logs', value: '1,240', icon: '📋' },
        { label: 'Documents Generated', value: '8,450', icon: '📄' },
        { label: 'Deadline Tracking', value: '100%', icon: '📅' },
      ],
      features: ['Gas Safety Tracking', 'EPC Management', 'EICR Compliance', 'Deposit Registration'],
      color: 'from-red-50',
    },
    {
      title: 'Tenant Portal',
      subtitle: 'White-Label Self-Service',
      description: 'Secure tenant access to payment history, documents, maintenance requests, and notifications.',
      sections: [
        { label: 'Active Accounts', value: '2,400', icon: '👥' },
        { label: 'Monthly Login Rate', value: '87%', icon: '📱' },
        { label: 'Documents Downloaded', value: '12.5K', icon: '📥' },
        { label: 'Maintenance Requests', value: '280/mo', icon: '🔧' },
      ],
      portals: ['Rent & Payments', 'Documents', 'Maintenance', 'Notifications'],
      color: 'from-cyan-50',
    },
    {
      title: 'API Integration Hub',
      subtitle: 'Third-Party Service Connectors',
      description: 'Extensible API framework with webhook management, auto-sync scheduling, and service integration.',
      sections: [
        { label: 'Connected Services', value: '12', icon: '🔌' },
        { label: 'Webhook Events', value: '1.2K/day', icon: '🔔' },
        { label: 'Sync Success Rate', value: '99.8%', icon: '✓' },
        { label: 'Error Logs', value: '8', icon: '⚠️' },
      ],
      integrations: ['QuickBooks', 'Utility APIs', 'Council Systems', 'Insurance Data'],
      color: 'from-indigo-50',
    },
    {
      title: 'Maintenance Orders',
      subtitle: 'Operations & Contractor Management',
      description: 'Priority-based maintenance tracking with contractor management and completion reporting.',
      sections: [
        { label: 'Total Orders', value: '850/yr', icon: '🔧' },
        { label: 'Completion Rate', value: '92%', icon: '✓' },
        { label: 'Avg Response', value: '3 days', icon: '⏱️' },
        { label: 'Cost Tracked', value: '£2.1M', icon: '💷' },
      ],
      priorities: ['Emergency (48h)', 'Urgent (7d)', 'Standard (30d)', 'Low'],
      color: 'from-orange-50',
    },
  ];

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
  };

  const current = screenshots[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-serif font-bold text-white">Platform Tour</h1>
          <p className="text-slate-300">Comprehensive view of the EstateFlow management system</p>
          <p className="text-sm text-slate-400">
            Slide {currentSlide + 1} of {screenshots.length}
          </p>
        </div>

        {/* Main Screenshot Container */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Tablet Frame */}
          <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-50 p-8 flex items-center justify-center relative overflow-hidden">
            {/* Simulated Tablet Screen */}
            <div className="w-full h-full max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
              {/* App Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-6 shrink-0">
                <h2 className="text-2xl font-serif font-bold">{current.title}</h2>
                <p className="text-sm text-slate-300 mt-1">{current.subtitle}</p>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {/* Description */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-slate-700">{current.description}</p>
                </div>

                {/* Key Metrics Grid */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Key Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {current.sections.map((section, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200"
                      >
                        <div className="text-2xl mb-2">{section.icon}</div>
                        <p className="text-xs text-slate-600">{section.label}</p>
                        <p className="text-lg font-bold text-slate-900 mt-1">{section.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Charts/Features Section */}
                {current.charts && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">
                      Analytics & Visualizations
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {current.charts.map((chart, idx) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200 flex items-center justify-center h-32"
                        >
                          <div className="text-center">
                            <div className="text-3xl mb-2">📊</div>
                            <p className="text-xs font-medium text-slate-700">{chart}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filters/Features */}
                {current.filters && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">
                      Search & Filter
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {current.filters.map((filter, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-medium rounded-full"
                        >
                          {filter}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Portal Features */}
                {current.portals && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">
                      Portal Features
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {current.portals.map((portal, idx) => (
                        <div
                          key={idx}
                          className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 text-center"
                        >
                          <p className="text-xs font-medium text-slate-700">{portal}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Integrations */}
                {current.integrations && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">
                      Connected Services
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {current.integrations.map((integration, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full border border-indigo-300"
                        >
                          <span>✓</span> {integration}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features List */}
                {current.features && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">
                      Compliance Features
                    </h3>
                    <div className="space-y-2">
                      {current.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm text-slate-700"
                        >
                          <span className="text-green-600">✓</span> {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Priority Levels */}
                {current.priorities && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">
                      Priority Levels
                    </h3>
                    <div className="space-y-2">
                      {current.priorities.map((priority, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 bg-orange-100 text-orange-700 text-xs font-medium rounded border border-orange-300"
                        >
                          {priority}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center justify-between">
          <Button
            onClick={goToPrevious}
            variant="outline"
            className="bg-white text-slate-900 border-slate-300 hover:bg-slate-50 gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {/* Slide Dots */}
          <div className="flex gap-2">
            {screenshots.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-3 w-3 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'bg-white w-8'
                    : 'bg-slate-400 hover:bg-slate-300'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="bg-white text-slate-900 border-slate-300 hover:bg-slate-50 gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              onClick={goToNext}
              className="bg-white text-slate-900 border-slate-300 hover:bg-slate-50 gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Info Footer */}
        <div className="text-center text-slate-400 text-sm mt-12 pb-8">
          <p>Explore the complete EstateFlow platform with page-by-page interface previews</p>
        </div>
      </div>
    </div>
  );
}