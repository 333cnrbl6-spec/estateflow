import React from 'react';
import ReportBuilder from '@/components/reporting/ReportBuilder';

export default function CustomizableFinancialReports() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Reports</h1>
          <p className="text-lg text-slate-600">Create custom reports with Excel/PDF export and scheduling</p>
        </div>
        <ReportBuilder />
      </div>
    </div>
  );
}