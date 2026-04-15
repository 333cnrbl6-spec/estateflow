import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, BookOpen, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';

export default function DeveloperDocuments() {
  const [loadedDocs, setLoadedDocs] = useState({});
  const [isReady, setIsReady] = useState(false);

  const documents = [
    {
      id: 'investor-pitch',
      title: 'Investor Pitch Deck',
      description: '6-slide professional pitch deck for Series A funding. Includes market opportunity, traction, and investment thesis.',
      category: 'Investor Relations',
      file: 'investor-pitch/INVESTOR_PITCH.html',
      isPdf: false,
      downloadText: 'View & Print',
    },
    {
      id: 'product-manual',
      title: 'Product Manual',
      description: 'Core product guide covering modules, features, user roles, and FAQ.',
      category: 'Product',
      file: 'PRODUCT_MANUAL.md',
      isPdf: false,
      downloadText: 'Download All',
      autoLoad: true,
    },
    {
      id: 'business-strategy',
      title: 'Business Strategy 2026',
      description: 'Comprehensive business plan, market analysis, SWOT, competitive landscape, financial projections, roadmap, and Series A case.',
      category: 'Investor Relations',
      file: 'BUSINESS_STRATEGY_2026.md',
      isPdf: false,
      downloadText: 'Download Strategy',
      autoLoad: true,
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

  const loadDocument = async (doc) => {
    if (loadedDocs[doc.id]) return;
    
    try {
      const response = await fetch(doc.file);
      const text = await response.text();
      setLoadedDocs(prev => ({ ...prev, [doc.id]: text }));
    } catch (err) {
      console.error('Failed to load document:', err);
    }
  };

  // Auto-load all documents marked with autoLoad on mount
  useEffect(() => {
    const autoLoadDocs = documents.filter(d => d.autoLoad);
    Promise.all(autoLoadDocs.map(doc => loadDocument(doc))).then(() => setIsReady(true));
  }, []);

  const downloadAsHTML = async (docId) => {
    // Load doc if not already loaded
    if (!loadedDocs[docId]) {
      const doc = documents.find(d => d.id === docId);
      await loadDocument(doc);
    }

    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    
    const content = loadedDocs[docId];
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;

    // Parse markdown and add to PDF
    const lines = content.split('\n');
    pdf.setFontSize(12);
    pdf.setTextColor(31, 41, 55);

    lines.forEach((line) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      let text = line;
      let fontSize = 12;
      let isBold = false;

      // Handle headers
      if (line.startsWith('# ')) {
        fontSize = 20;
        isBold = true;
        text = line.replace(/^# /, '');
        pdf.setFontSize(fontSize);
        pdf.setFont(undefined, 'bold');
        pdf.text(text, margin, yPosition, { maxWidth: pageWidth - 2 * margin });
        yPosition += lineHeight * 2;
      } else if (line.startsWith('## ')) {
        fontSize = 16;
        isBold = true;
        text = line.replace(/^## /, '');
        pdf.setFontSize(fontSize);
        pdf.setFont(undefined, 'bold');
        pdf.text(text, margin, yPosition, { maxWidth: pageWidth - 2 * margin });
        yPosition += lineHeight * 1.5;
      } else if (line.startsWith('### ')) {
        fontSize = 14;
        isBold = true;
        text = line.replace(/^### /, '');
        pdf.setFontSize(fontSize);
        pdf.setFont(undefined, 'bold');
        pdf.text(text, margin, yPosition, { maxWidth: pageWidth - 2 * margin });
        yPosition += lineHeight * 1.2;
      } else if (line.trim()) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        const lines_split = pdf.splitTextToSize(line, pageWidth - 2 * margin);
        lines_split.forEach((splitLine) => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(splitLine, margin, yPosition);
          yPosition += lineHeight;
        });
      } else {
        yPosition += lineHeight / 2;
      }
    });

    pdf.save(`Premiso-${doc.id.replace(/-/g, '_')}.pdf`);
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
              onClick={() => window.open(documents[0].file, '_blank')}
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
              onClick={() => downloadAsHTML('product-manual')}
              disabled={!loadedDocs['product-manual']}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {loadedDocs['product-manual'] ? 'Download Manual' : 'Loading...'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* PDF Export Tips */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">💡 Downloading & Printing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>
            <strong>Product Manual:</strong> Click "Download Manual" → Saves as HTML → Open in browser → Cmd+P / Ctrl+P → Save as PDF
          </p>
          <p>
            <strong>Investor Pitch:</strong> Click "View & Print" → Browser print dialog → Save as PDF
          </p>
          <p>
            <strong>Note:</strong> Product Manual auto-loads on page load and includes all expanded content ready to print.
          </p>
        </CardContent>
      </Card>

      {/* Expanded Document Sections */}
      {Object.entries(loadedDocs).map(([docId, content]) => {
        const doc = documents.find(d => d.id === docId);
        return (
          <Card key={docId} className="print:page-break-before">
            <CardHeader className="flex items-center justify-between flex-row">
              <div>
                <CardTitle>{doc.title} - Full Content</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">All sections loaded and ready to download</p>
              </div>
              <Button
                size="sm"
                onClick={() => downloadAsHTML(docId)}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        );
      })}
      </div>
      );
      }