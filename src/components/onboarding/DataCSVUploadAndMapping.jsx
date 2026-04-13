import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

const REQUIRED_FIELDS = {
  property: ['name', 'postcode', 'property_type', 'ownership_type'],
  tenant: ['full_name', 'email', 'phone', 'property_id'],
  transaction: ['date', 'amount', 'type', 'property_id', 'description'],
};

const FIELD_SUGGESTIONS = {
  property: {
    name: ['Property Name', 'Name', 'Address', 'Building'],
    postcode: ['Postcode', 'Post Code', 'Postal Code', 'ZIP'],
    property_type: ['Type', 'Property Type', 'Building Type'],
    ownership_type: ['Ownership', 'Tenure', 'Freehold/Leasehold'],
    address_line_1: ['Address', 'Street', 'Line 1'],
    city: ['Town', 'City', 'Location'],
  },
  tenant: {
    full_name: ['Name', 'Full Name', 'Tenant Name'],
    email: ['Email', 'Email Address'],
    phone: ['Phone', 'Phone Number', 'Mobile'],
    property_id: ['Property', 'Property ID', 'Unit'],
    status: ['Status', 'Occupancy'],
  },
  transaction: {
    date: ['Date', 'Transaction Date', 'Payment Date'],
    amount: ['Amount', 'Value', 'Sum'],
    type: ['Type', 'Category', 'Transaction Type'],
    property_id: ['Property', 'Property ID', 'Building'],
    description: ['Description', 'Notes', 'Details'],
  },
};

export default function DataCSVUploadAndMapping({ onComplete }) {
  const [selectedType, setSelectedType] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [validationResults, setValidationResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length === 0) return { headers: [], rows: [] };
    
    const headers = lines[0]
      .split(',')
      .map(h => h.trim().replace(/^"|"$/g, ''));
    
    const rows = lines.slice(1).map(line => {
      const matches = line.match(/(?:^|,)(?:"(?:[^"])*"|[^,]*)(?:,|$)/g);
      if (!matches) return [];
      
      return matches.map(cell => 
        cell
          .replace(/^[,]|[,]$/g, '')
          .trim()
          .replace(/^"|"$/g, '')
      );
    });
    
    return { headers, rows };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const { headers, rows } = parseCSV(text);
        
        if (headers.length === 0) {
          setError('CSV file is empty');
          return;
        }

        setHeaders(headers);
        setCsvData(rows);
        
        // Auto-map headers
        const autoMapping = {};
        headers.forEach((header) => {
          const suggestions = FIELD_SUGGESTIONS[selectedType] || {};
          for (const [targetField, possibleNames] of Object.entries(suggestions)) {
            if (possibleNames.some(name => 
              header.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(header.toLowerCase())
            )) {
              autoMapping[header] = targetField;
              break;
            }
          }
        });
        setMapping(autoMapping);
      } catch (error) {
        setError(`CSV parsing failed: ${error.message}`);
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read file');
    };
    
    reader.readAsText(file);
  };

  const handleMappingChange = (csvHeader, targetField) => {
    setMapping(prev => ({
      ...prev,
      [csvHeader]: targetField || undefined,
    }));
  };

  const validateMapping = () => {
    const requiredFields = REQUIRED_FIELDS[selectedType] || [];
    const mappedFields = Object.values(mapping).filter(Boolean);
    const missingFields = requiredFields.filter(field => !mappedFields.includes(field));

    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }
    return true;
  };

  const processAndStage = async () => {
    if (!validateMapping()) return;

    setIsProcessing(true);
    try {
      const mappedData = csvData.map(row => {
        const mappedRow = {};
        headers.forEach((csvHeader, idx) => {
          const targetField = mapping[csvHeader];
          if (targetField) {
            mappedRow[targetField] = row[idx];
          }
        });
        return mappedRow;
      });

      const response = await base44.functions.invoke('cleanseAndStageData', {
        entity_type: selectedType,
        records: mappedData,
        source_file: csvFile.name,
      });

      setValidationResults(response.data);
      if (onComplete) {
        onComplete({
          type: selectedType,
          file: csvFile.name,
          recordCount: mappedData.length,
          mappedData,
          validationResults: response.data,
        });
      }
    } catch (err) {
      setError(`Processing failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Step 1: Select Data Type */}
      {!selectedType && (
        <Card>
          <CardHeader>
            <CardTitle>Select Data to Import</CardTitle>
            <CardDescription>Choose which type of data you'd like to upload</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['property', 'tenant', 'transaction'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className="p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-muted/30 transition-all text-left"
              >
                <p className="font-semibold text-foreground capitalize">{type}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {type === 'property' && 'Upload properties, units, addresses'}
                  {type === 'tenant' && 'Upload tenant details & occupancy'}
                  {type === 'transaction' && 'Upload payments, income, expenses'}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Upload CSV */}
      {selectedType && !csvData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold">1</span>
              Upload {selectedType.toUpperCase()} CSV
            </CardTitle>
            <CardDescription>
              Select your CSV file. Required fields: {REQUIRED_FIELDS[selectedType].join(', ')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-center w-full p-8 border-2 border-dashed border-border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
              <div className="text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="font-medium text-foreground">Click to upload or drag CSV</p>
                <p className="text-xs text-muted-foreground mt-1">Max 10MB</p>
              </div>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
            <Button variant="outline" onClick={() => setSelectedType(null)} className="w-full">
              Change Type
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Map Headers */}
      {selectedType && csvData && !validationResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold">2</span>
              Map Columns
            </CardTitle>
            <CardDescription>
              Match CSV columns to system fields ({csvData.length} records detected)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              {headers.map(header => (
                <div key={header} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground min-w-[150px]">{header}</span>
                  <Select value={mapping[header] || ''} onValueChange={(value) => handleMappingChange(header, value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select field or leave empty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Skip this column</SelectItem>
                      {Object.keys(FIELD_SUGGESTIONS[selectedType] || {}).map(field => (
                        <SelectItem key={field} value={field}>
                          {field.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <p className="text-sm font-medium text-foreground">Required fields:</p>
              <div className="flex flex-wrap gap-2">
                {(REQUIRED_FIELDS[selectedType] || []).map(field => (
                  <Badge 
                    key={field}
                    variant={Object.values(mapping).includes(field) ? 'default' : 'secondary'}
                  >
                    {field}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setCsvData(null); setCsvFile(null); }}>
                Upload Different File
              </Button>
              <Button onClick={processAndStage} disabled={isProcessing} className="flex-1">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Validate & Stage Data'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Validation Results */}
      {validationResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Data Staged Successfully
            </CardTitle>
            <CardDescription>
              Your {selectedType} data has been processed and staged for review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Records Processed</p>
                <p className="text-2xl font-bold text-foreground">{validationResults.processed || 0}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Quality Score</p>
                <p className="text-2xl font-bold text-foreground">{Math.round(validationResults.average_quality || 0)}%</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Issues Found</p>
                <p className="text-2xl font-bold text-amber-600">{validationResults.errors?.length || 0}</p>
              </div>
            </div>

            {validationResults.errors && validationResults.errors.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-semibold text-amber-900 mb-2">Validation Issues:</p>
                <ul className="text-xs text-amber-800 space-y-1">
                  {validationResults.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                  {validationResults.errors.length > 5 && (
                    <li className="text-amber-700 font-medium">... and {validationResults.errors.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}

            <Button onClick={() => { setSelectedType(null); setCsvData(null); setCsvFile(null); setValidationResults(null); }} className="w-full">
              Upload Another File
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}