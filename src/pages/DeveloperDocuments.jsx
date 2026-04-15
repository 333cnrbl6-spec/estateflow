import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, BookOpen, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';

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
      autoLoad: false,
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

  // Auto-load product manual on mount
  useEffect(() => {
    const productManual = documents.find(d => d.autoLoad);
    if (productManual) {
      loadDocument(productManual).then(() => setIsReady(true));
    }
  }, []);

  const downloadAsHTML = async (docId) => {
    // Load doc if not already loaded
    if (!loadedDocs[docId]) {
      const doc = documents.find(d => d.id === docId);
      await loadDocument(doc);
    }

    const doc = documents.find(d => d.id === docId);
    const content = loadedDocs[docId];

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Premiso - ${doc.title}</title>
        <style>
          * { margin: 0; padding: 0; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif; 
            line-height: 1.7; 
            color: #1f2937; 
            background: white;
            padding: 40px 20px;
          }
          .container { max-width: 900px; margin: 0 auto; }
          h1 { 
            color: #1d2d44; 
            font-size: 2.5em; 
            margin: 40px 0 20px 0; 
            border-bottom: 3px solid #1d2d44;
            padding-bottom: 15px;
          }
          h2 { 
            color: #2d3d54; 
            font-size: 1.8em; 
            margin: 35px 0 15px 0;
            page-break-after: avoid;
          }
          h3 { 
            color: #374151; 
            font-size: 1.3em; 
            margin: 20px 0 10px 0;
            page-break-after: avoid;
          }
          p, li, td { margin-bottom: 10px; }
          ul, ol { margin-left: 20px; margin-bottom: 15px; }
          li { margin-bottom: 6px; }
          code { 
            background: #f3f4f6; 
            padding: 2px 6px; 
            border-radius: 3px; 
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
          }
          pre { 
            background: #f9fafb; 
            padding: 15px; 
            border-radius: 6px; 
            overflow-x: auto; 
            border-left: 4px solid #1d2d44;
            margin: 15px 0;
            page-break-inside: avoid;
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 20px 0; 
            page-break-inside: avoid;
          }
          th, td { 
            border: 1px solid #d1d5db; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background: #f3f4f6; 
            font-weight: 600;
            color: #1f2937;
          }
          tr:nth-child(even) { background: #f9fafb; }
          blockquote {
            border-left: 4px solid #dbeafe;
            padding-left: 15px;
            margin: 20px 0;
            color: #6b7280;
            font-style: italic;
          }
          .section { page-break-inside: avoid; }
          hr { 
            border: none; 
            border-top: 2px solid #e5e7eb; 
            margin: 30px 0;
            page-break-after: avoid;
          }
          @media print { 
            body { padding: 0; }
            h1, h2, h3 { page-break-after: avoid; }
            table, pre { page-break-inside: avoid; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${content.replace(/^# /gm, '<h1>').replace(/^## /gm, '<h2>').replace(/^### /gm, '<h3>')}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`Premiso-\${doc.id.replace(/-/g, '_')}.html\`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                {doc.id === 'investor-pitch' ? (
                  <Button
                    size="sm"
                    onClick={() => window.open(doc.file, '_blank')}
                    className="gap-2 flex-1"
                  >
                    <Download className="w-4 h-4" />
                    View & Print
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => downloadAsHTML(doc.id)}
                    disabled={doc.autoLoad && !loadedDocs[doc.id]}
                    className="gap-2 flex-1"
                  >
                    <Printer className="w-4 h-4" />
                    {doc.autoLoad && !loadedDocs[doc.id] ? 'Loading...' : 'Download'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
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
                <p className="text-sm text-muted-foreground mt-1">All sections loaded and ready to print</p>
              </div>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Print/Save PDF
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