import React, { useState } from 'react';
import { FileText, Download, ExternalLink, BookOpen, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';

export default function DeveloperDocuments() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docContent, setDocContent] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleViewDocument = async (doc) => {
    if (doc.id === 'investor-pitch') {
      window.open(doc.file, '_blank');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(doc.file);
      const text = await response.text();
      setDocContent(text);
      setSelectedDoc(doc);
    } catch (err) {
      console.error('Failed to load document:', err);
    }
    setLoading(false);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const closeModal = () => {
    setSelectedDoc(null);
    setDocContent(null);
  };

  // Modal for viewing markdown documents
  if (selectedDoc && docContent) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold">{selectedDoc.title}</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handlePrintPdf}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Print/Save PDF
              </Button>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{docContent}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              disabled={loading}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              {loading ? 'Loading...' : 'Open Product Manual'}
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
                  disabled={loading}
                  className="gap-2 flex-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  {loading ? 'Loading...' : 'View'}
                </Button>
                {doc.id === 'investor-pitch' && (
                  <Button
                    size="sm"
                    onClick={() => handleViewDocument(doc)}
                    className="gap-2 flex-1"
                  >
                    <Download className="w-4 h-4" />
                    {doc.downloadText}
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