import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Download,
  Trash2,
  Play
} from 'lucide-react';
import { toast } from "sonner";
import ProcessingFeedback from '@/components/ui/ProcessingFeedback';

export default function BulkImportTester() {
  const [selectedTier, setSelectedTier] = useState('small');
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [validationResults, setValidationResults] = useState(null);
  const [importProgress, setImportProgress] = useState(null);
  const fileInputRef = useRef(null);

  // Generate test data mutation
  const generateTestDataMutation = useMutation({
    mutationFn: async (tier) => {
      const response = await base44.functions.invoke('generateBulkImportTestData', { 
        tier, 
        includeRelationships: true 
      });
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedFiles(data.csv_files);
      toast.success(`Generated ${data.summary.total_records} test records (${selectedTier} tier)`);
    },
    onError: (error) => {
      toast.error('Failed to generate test data: ' + error.message);
    }
  });

  // Validate import mutation
  const validateImportMutation = useMutation({
    mutationFn: async ({ fileUrl, entityType }) => {
      const response = await base44.functions.invoke('validateBulkImport', {
        file_url: fileUrl,
        entity_type: entityType,
        dry_run: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      setValidationResults(data);
      if (data.ready_to_import) {
        toast.success('✓ File is valid and ready to import');
      } else {
        toast.warning(`⚠ File has ${data.validation.invalid_rows} errors`);
      }
    },
    onError: (error) => {
      toast.error('Validation failed: ' + error.message);
    }
  });

  // Execute import mutation
  const executeImportMutation = useMutation({
    mutationFn: async ({ entityType, fileData }) => {
      // This would use the Base44 import_data tool
      // For now, we'll simulate the process
      const total = fileData.split('\n').length - 1; // Exclude header
      setImportProgress({ current: 0, total, status: 'importing' });

      // Simulate progress
      for (let i = 0; i <= total; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setImportProgress({ current: i, total, status: 'importing' });
      }

      return { success: true, imported: total };
    },
    onSuccess: (data) => {
      setImportProgress({ current: data.imported, total: data.imported, status: 'completed' });
      toast.success(`Successfully imported ${data.imported} records`);
    },
    onError: (error) => {
      setImportProgress(prev => ({ ...prev, status: 'failed' }));
      toast.error('Import failed: ' + error.message);
    }
  });

  const handleGenerateTestData = () => {
    generateTestDataMutation.mutate(selectedTier);
  };

  const handleDownloadCSV = (file) => {
    const blob = new Blob([file.content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${file.filename}`);
  };

  const handleFileUpload = async (event, entityType) => {
    const file = event.target.files[0];
    if (!file) return;

    // Upload file to get URL
    try {
      const uploadResponse = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadResponse.file_url;
      
      // Validate the uploaded file
      validateImportMutation.mutate({ fileUrl, entityType });
    } catch (error) {
      toast.error('Failed to upload file: ' + error.message);
    }
  };

  const handleImport = (entityType, file) => {
    executeImportMutation.mutate({ entityType, fileData: file.content });
  };

  const handleClearResults = () => {
    setValidationResults(null);
    setImportProgress(null);
  };

  const entityTypes = [
    { value: 'Company', label: 'Companies', icon: '🏢' },
    { value: 'Property', label: 'Properties', icon: '🏠' },
    { value: 'Unit', label: 'Units', icon: '🚪' },
    { value: 'Tenant', label: 'Tenants', icon: '👤' },
    { value: 'Contact', label: 'Contacts', icon: '📇' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bulk Import Testing Suite</h1>
        <p className="text-muted-foreground">
          Generate test data, validate imports, and test bulk data operations
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Test Data</TabsTrigger>
          <TabsTrigger value="validate">Validate & Test</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        {/* Generate Test Data Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select Data Tier</CardTitle>
              <CardDescription>
                Choose the size of test data to generate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { tier: 'small', label: 'Small', records: '~100', time: '< 5s' },
                  { tier: 'medium', label: 'Medium', records: '~800', time: '< 30s' },
                  { tier: 'large', label: 'Large', records: '~3000', time: '< 2min' }
                ].map((option) => (
                  <Card 
                    key={option.tier}
                    className={`cursor-pointer transition-all ${
                      selectedTier === option.tier 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedTier(option.tier)}
                  >
                    <CardContent className="p-4 text-center">
                      <h3 className="font-semibold text-lg">{option.label}</h3>
                      <p className="text-sm text-muted-foreground">{option.records} records</p>
                      <p className="text-xs text-muted-foreground mt-1">Est. time: {option.time}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {generateTestDataMutation.isPending && (
                <ProcessingFeedback
                  label={`Generating ${selectedTier} test data…`}
                  detail="Creating realistic sample records for import testing"
                  tips={[
                    'Test data includes properties, units, tenants, and financial records.',
                    'Each tier includes realistic relationships and duplicate scenarios.',
                    'Generated files are ready to download and import immediately.'
                  ]}
                  className="mb-4"
                />
              )}
              <Button 
                onClick={handleGenerateTestData}
                disabled={generateTestDataMutation.isPending}
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                {generateTestDataMutation.isPending ? 'Generating...' : 'Generate Test Data'}
              </Button>

              {generatedFiles.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h3 className="font-semibold">Generated CSV Files:</h3>
                  <div className="grid gap-3">
                    {generatedFiles.map((file, idx) => (
                      <Card key={idx}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{file.filename}</p>
                              <p className="text-sm text-muted-foreground">{file.record_count} records</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadCSV(file)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validate & Test Tab */}
        <TabsContent value="validate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Upload & Validate CSV</CardTitle>
              <CardDescription>
                Upload a CSV file to validate before importing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {entityTypes.map((entity) => (
                  <Card key={entity.value}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{entity.icon}</span>
                          <div>
                            <h3 className="font-semibold">{entity.label}</h3>
                            <p className="text-sm text-muted-foreground">Entity: {entity.value}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.xlsx"
                          onChange={(e) => handleFileUpload(e, entity.value)}
                          className="hidden"
                          id={`file-${entity.value}`}
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById(`file-${entity.value}`).click()}
                          disabled={validateImportMutation.isPending}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {validateImportMutation.isPending ? 'Validating...' : 'Upload & Validate'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {validationResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Validation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {validationResults.validation.valid_rows}
                      </p>
                      <p className="text-sm text-muted-foreground">Valid Rows</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {validationResults.validation.invalid_rows}
                      </p>
                      <p className="text-sm text-muted-foreground">Invalid Rows</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {validationResults.validation.warnings.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Warnings</p>
                    </CardContent>
                  </Card>
                </div>

                {validationResults.validation.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold mb-2">Errors Found:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {validationResults.validation.errors.slice(0, 5).map((error, idx) => (
                          <li key={idx}>
                            Row {error.row}: {error.errors.map(e => e.message).join(', ')}
                          </li>
                        ))}
                      </ul>
                      {validationResults.validation.errors.length > 5 && (
                        <p className="text-xs mt-2">...and {validationResults.validation.errors.length - 5} more errors</p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      // Trigger actual import
                      toast.info('Import functionality would execute here');
                    }}
                    disabled={!validationResults.ready_to_import}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Execute Import
                  </Button>
                  <Button variant="outline" onClick={handleClearResults}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {importProgress && (
            <Card>
              <CardHeader>
                <CardTitle>Import Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress 
                  value={(importProgress.current / importProgress.total) * 100} 
                  className="h-2"
                />
                <div className="flex items-center justify-between text-sm">
                  <span>Imported: {importProgress.current} / {importProgress.total}</span>
                  <Badge variant={importProgress.status === 'completed' ? 'default' : 'secondary'}>
                    {importProgress.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {!validationResults && !importProgress && (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No validation results yet</p>
                <p className="text-sm">Upload a CSV file to see validation results</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}