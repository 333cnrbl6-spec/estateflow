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

  const downloadAllAsHTML = () => {
    const allContent = Object.entries(loadedDocs)
      .map(([docId, content]) => {
        const doc = documents.find(d => d.id === docId);
        return `
          <div style="page-break-after: always; margin-bottom: 40px;">
            <h1>${doc.title}</h1>
            <p>${doc.description}</p>
            <div style="margin-top: 20px;">
              ${content}
            </div>
          </div>
        `;
      })
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Premiso - Product Manual</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 20px; }
          h1 { color: #1d2d44; margin-top: 0; }
          h2 { color: #2d3d54; margin-top: 30px; }
          code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
          pre { background: #f5f5f5; padding: 12px; border-radius: 6px; overflow-x: auto; }
          table { border-collapse: collapse; width: 100%; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f9f9f9; }
          @media print { body { margin: 0; padding: 0; } }
        </style>
      </head>
      <body>
        ${allContent}
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Premiso-Product-Manual.html';
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
              onClick={downloadAllAsHTML}
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
                    onClick={downloadAllAsHTML}
                    disabled={!loadedDocs['product-manual']}
                    className="gap-2 flex-1"
                  >
                    <Printer className="w-4 h-4" />
                    {loadedDocs['product-manual'] ? 'Download' : 'Loading...'}
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
      {loadedDocs['product-manual'] && (
        <Card className="print:page-break-before">
          <CardHeader className="flex items-center justify-between flex-row">
            <div>
              <CardTitle>Product Manual - Full Content</CardTitle>
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
              <ReactMarkdown>{loadedDocs['product-manual']}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
      );
      }