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

  const extractMarkdownContent = (text) => {
    // If response is HTML page wrapper, try to extract markdown from script
    if (text.includes('<!doctype') || text.includes('<html')) {
      // This is the full HTML page - return empty to signal reload needed
      return null;
    }
    return text;
  };

  const loadDocument = async (doc) => {
    if (loadedDocs[doc.id]) return;
    
    try {
      const response = await fetch(doc.file);
      let text = await response.text();
      
      // Validate and extract content
      const content = extractMarkdownContent(text);
      if (!content) {
        console.error('Document returned HTML instead of markdown:', doc.file);
        // Try direct import as fallback
        try {
          const imported = await import(`../../${doc.file}`);
          text = imported.default || text;
        } catch (e) {
          console.error('Fallback import failed:', e);
        }
      }
      
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
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    
    let content = loadedDocs[docId];
    
    // If not loaded yet or is HTML, fetch raw markdown
    if (!content || content.includes('<!doctype') || content.includes('<html')) {
      try {
        // Try importing as ES module
        try {
          const imported = await import(`../../${doc.file}`);
          content = imported.default;
        } catch (e) {
          // Fallback: fetch with ?raw query param
          const response = await fetch(`${doc.file}?raw=true`);
          if (!response.ok) throw new Error('Failed to load document');
          content = await response.text();
          
          // Still HTML? Try stripping it
          if (content.includes('<!doctype')) {
            // Last resort: alert user to reload
            alert('Document format invalid. Please refresh the page.');
            return;
          }
        }
      } catch (err) {
        console.error('Failed to download document:', err);
        alert('Failed to download document. Please refresh and try again.');
        return;
      }
    }
    
    // Final validation
    if (!content || content.includes('<!doctype') || content.includes('<html')) {
      alert('Document content is invalid. Please refresh the page.');
      return;
    }
    
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Process markdown line by line
      const lines = content.split('\n');

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        
        // Skip empty lines but add minimal spacing
        if (!trimmedLine) {
          yPosition += 2;
          return;
        }

        // Check for page break
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        // Detect and format headers
        const headerMatch = trimmedLine.match(/^(#+)\s+(.+)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const text = headerMatch[2];
          const sizes = { 1: 18, 2: 14, 3: 12 };
          const size = sizes[level] || 11;
          
          pdf.setFontSize(size);
          pdf.setFont(undefined, 'bold');
          pdf.setTextColor(0, 0, 0);
          
          const wrappedLines = pdf.splitTextToSize(text, contentWidth);
          wrappedLines.forEach((wrappedLine) => {
            if (yPosition > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(wrappedLine, margin, yPosition);
            yPosition += size * 0.4;
          });
          yPosition += 3;
        } else {
          // Body text
          pdf.setFontSize(10);
          pdf.setFont(undefined, 'normal');
          pdf.setTextColor(30, 30, 30);
          
          const wrappedLines = pdf.splitTextToSize(trimmedLine, contentWidth);
          wrappedLines.forEach((wrappedLine) => {
            if (yPosition > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(wrappedLine, margin, yPosition);
            yPosition += 4.5;
          });
        }
      });

      const fileName = `${doc.title.replace(/\s+/g, '_').toLowerCase()}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
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