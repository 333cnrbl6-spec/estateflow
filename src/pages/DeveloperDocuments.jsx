import React, { useState } from 'react';
import { FileText, Download, ExternalLink, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DeveloperDocuments() {
  const [selectedDoc, setSelectedDoc] = useState(null);

  const documents = [
    {
      id: 'investor-pitch',
      title: 'Investor Pitch Deck',
      description: '14-slide professional pitch deck for Series A funding. Includes market opportunity, financials, competitive advantages.',
      category: 'Investor Relations',
      file: '/investor-pitch/INVESTOR_PITCH.html',
      isPdf: false,
      downloadText: 'View & Print',
    },
    {
      id: 'product-manual',
      title: 'Product Manual',
      description: 'Comprehensive 500+ line guide covering all 7 core modules, features, user roles, integrations, and FAQ.',
      category: 'Product',
      file: '/docs/PRODUCT_MANUAL.md',
      isPdf: false,
      downloadText: 'View',
    },
    {
      id: 'phase-3-completion',
      title: 'Phase 3 Completion Summary',
      description: 'Audit fixes, caching layer, pagination UI, N+1 query elimination. Performance improvements & deployment notes.',
      category: 'Engineering',
      file: '/docs/PHASE_3_COMPLETION_SUMMARY.md',
      isPdf: false,
      downloadText: 'View',
    },
    {
      id: 'comprehensive-guide',
      title: 'Premiso Comprehensive Guide',
      description: 'Full platform documentation covering architecture, workflows, compliance framework, and advanced features.',
      category: 'Documentation',
      file: '/docs/PREMISO_COMPREHENSIVE_GUIDE.md',
      isPdf: false,
      downloadText: 'View',
    },
    {
      id: 'audit-report',
      title: 'Comprehensive Codebase Audit',
      description: 'Complete audit findings including security, performance, validation, and testing recommendations.',
      category: 'QA & Security',
      file: '/docs/COMPREHENSIVE_CODEBASE_AUDIT_2026.md',
      isPdf: false,
      downloadText: 'View',
    },
    {
      id: 'platform-overview',
      title: 'Platform Overview',
      description: 'High-level architecture, entity relationships, core features, and integration capabilities.',
      category: 'Architecture',
      file: '/docs/PLATFORM_OVERVIEW.md',
      isPdf: false,
      downloadText: 'View',
    },
    {
      id: 'compliance-roadmap',
      title: 'Compliance Roadmap',
      description: 'Timeline and strategy for implementing UK property compliance features and regulatory requirements.',
      category: 'Compliance',
      file: '/docs/COMPLIANCE_ROADMAP.md',
      isPdf: false,
      downloadText: 'View',
    },
    {
      id: 'production-guide',
      title: 'Production Deployment Guide',
      description: 'Step-by-step guide for deploying to production, environment configuration, monitoring, and rollback procedures.',
      category: 'Deployment',
      file: '/docs/PRODUCTION_DEPLOYMENT_GUIDE.md',
      isPdf: false,
      downloadText: 'View',
    },
  ];

  const categoryColors = {
    'Investor Relations': 'bg-purple-100 text-purple-800',
    'Product': 'bg-blue-100 text-blue-800',
    'Engineering': 'bg-orange-100 text-orange-800',
    'Documentation': 'bg-green-100 text-green-800',
    'QA & Security': 'bg-red-100 text-red-800',
    'Architecture': 'bg-indigo-100 text-indigo-800',
    'Compliance': 'bg-amber-100 text-amber-800',
    'Deployment': 'bg-cyan-100 text-cyan-800',
  };

  const handleViewDocument = (doc) => {
    window.open(doc.file, '_blank');
  };

  const handlePrintPdf = (doc) => {
    if (doc.id === 'investor-pitch') {
      // Open HTML file
      const printWindow = window.open(doc.file, '_blank');
      printWindow.addEventListener('load', () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      });
    } else {
      // For markdown files, just open in new tab (user can print from there)
      window.open(doc.file, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-primary" />
          Developer & Investor Documents
        </h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive guides, product documentation, audit reports, and investor materials.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <h3 className="font-bold text-purple-900 mb-2">🚀 For Investors</h3>
            <p className="text-sm text-purple-800 mb-4">Start with the Investor Pitch Deck for a complete overview.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePrintPdf(documents[0])}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              View & Print Pitch Deck
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-bold text-blue-900 mb-2">📚 For Product Teams</h3>
            <p className="text-sm text-blue-800 mb-4">Read the Product Manual for feature details and use cases.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewDocument(documents[1])}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Open Product Manual
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Documents Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {documents.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <FileText className="w-5 h-5 text-primary" />
                <Badge className={categoryColors[doc.category]}>
                  {doc.category}
                </Badge>
              </div>
              <CardTitle className="text-lg">{doc.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {doc.description}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDocument(doc)}
                  className="gap-2 flex-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  View
                </Button>
                <Button
                  size="sm"
                  onClick={() => handlePrintPdf(doc)}
                  className="gap-2 flex-1"
                >
                  <Download className="w-4 h-4" />
                  {doc.downloadText}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* PDF Export Tips */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">💡 Printing to PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>
            <strong>For HTML files (Investor Pitch):</strong> Click "View & Print" → Browser print dialog (Cmd+P / Ctrl+P) → Save as PDF
          </p>
          <p>
            <strong>For Markdown files:</strong> Click "View" → Copy content → Paste into Google Docs → Download as PDF
          </p>
          <p>
            <strong>Alternative:</strong> Use free online converters (Pandoc, CloudConvert) for batch markdown to PDF conversion
          </p>
        </CardContent>
      </Card>
    </div>
  );
}