import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, Upload, Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function DataDiscoveryHub() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanType, setScanType] = useState('all');

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const uploadedUrls = [];

      // Upload each file
      for (const file of files) {
        const response = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push({
          name: file.name,
          url: response.file_url,
          size: file.size,
        });
      }

      setUploadedFiles(prev => [...prev, ...uploadedUrls]);

      // Auto-analyze if we have files
      if (uploadedUrls.length > 0) {
        analyzeFiles(uploadedUrls.map(f => f.url));
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeFiles = async (fileUrls) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('analyzeDiscoveredFiles', {
        file_urls: fileUrls,
        scan_type: scanType,
      });
      setAnalysis(response.data.analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 80) return <Badge className="bg-green-100 text-green-800">High Confidence</Badge>;
    if (confidence >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Medium Confidence</Badge>;
    return <Badge className="bg-orange-100 text-orange-800">Low Confidence</Badge>;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Zap className="w-8 h-8 text-primary" />
          AI Data Discovery Hub
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload files from your drives. AI analyzes them and suggests how to populate your Premiso database.
        </p>
      </div>

      {/* Cloud Connector Gate */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Connect Cloud Storage
          </CardTitle>
          <CardDescription>
            Map your network drives to OneDrive, Google Drive, or Dropbox first for seamless access
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Button variant="outline" className="gap-2">
            <Cloud className="w-4 h-4" />
            OneDrive Setup
          </Button>
          <Button variant="outline" className="gap-2">
            <Cloud className="w-4 h-4" />
            Google Drive Setup
          </Button>
          <Button variant="outline" className="gap-2">
            <Cloud className="w-4 h-4" />
            Dropbox Setup
          </Button>
        </CardContent>
      </Card>

      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Files to Analyze
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
          >
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="font-medium text-slate-700">Drag files here or click to upload</p>
            <p className="text-sm text-muted-foreground">CSV, Excel, PDF, JSON supported</p>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium text-sm text-slate-600">{uploadedFiles.length} file(s) uploaded:</p>
              <div className="space-y-1">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded">
                    <span className="text-slate-700">{file.name}</span>
                    <span className="text-muted-foreground text-xs">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value)}
              className="border border-input rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Scan for all data</option>
              <option value="property">Property data only</option>
              <option value="tenant">Tenant data only</option>
              <option value="financial">Financial records only</option>
              <option value="certificate">Certificates only</option>
            </select>

            <Button
              onClick={() => analyzeFiles(uploadedFiles.map(f => f.url))}
              disabled={uploadedFiles.length === 0 || loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Analyze Files
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Discovery Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Files Analyzed</p>
                  <p className="text-2xl font-bold">{analysis.summary.total_files}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Categories Found</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.summary.categories_found.map((cat) => (
                      <Badge key={cat} variant="secondary">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* File-by-file results */}
              <div className="space-y-3">
                <p className="font-medium text-slate-700">Detailed Findings:</p>
                {analysis.discovered_files.map((file, idx) => (
                  <Card key={idx} className="bg-slate-50">
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{file.file_name}</p>
                          <p className="text-sm text-muted-foreground">{file.category}</p>
                        </div>
                        {getConfidenceBadge(file.confidence)}
                      </div>

                      {file.suggested_entity && (
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            Suggested Entity: <span className="text-primary">{file.suggested_entity}</span>
                          </p>
                        </div>
                      )}

                      {file.sample_fields && Object.keys(file.sample_fields).length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-slate-700">Detected Fields:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 mt-1">
                            {Object.entries(file.sample_fields).map(([field, desc]) => (
                              <li key={field}>
                                • <code className="bg-white px-1 rounded">{field}</code> - {desc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {file.data_quality_notes && (
                        <div className="flex gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <p>{file.data_quality_notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Import Recommendations */}
              {analysis.summary.recommended_import_order.length > 0 && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="font-medium text-green-900 mb-2">Recommended Import Order:</p>
                  <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                    {analysis.summary.recommended_import_order.map((entity) => (
                      <li key={entity}>{entity}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Missing Data */}
              {analysis.summary.missing_data_categories.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <p className="font-medium text-orange-900 mb-2">Missing Data Categories:</p>
                  <p className="text-sm text-orange-800">
                    {analysis.summary.missing_data_categories.join(', ')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}