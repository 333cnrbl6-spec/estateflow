import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

export default function TransactionImporter({ onBankDataReady, onLedgerDataReady }) {
  const [bankFile, setBankFile] = useState(null);
  const [ledgerFile, setLedgerFile] = useState(null);
  const [bankData, setBankData] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          if (type === 'bank') {
            // Expected columns: date, description, amount, reference
            const parsed = results.data.filter(row => row.date && row.amount).map(row => ({
              date: row.date,
              description: row.description || '',
              amount: parseFloat(row.amount),
              reference: row.reference || '',
            }));
            setBankFile(file.name);
            setBankData(parsed);
            onBankDataReady(parsed);
            setError(null);
          } else {
            // Expected columns: transaction_date, tenant_name, amount, description, id
            const parsed = results.data.filter(row => row.transaction_date && row.amount).map(row => ({
              id: row.id || `ledger_${Math.random()}`,
              transaction_date: row.transaction_date,
              tenant_name: row.tenant_name || '',
              amount: parseFloat(row.amount),
              description: row.description || '',
            }));
            setLedgerFile(file.name);
            setLedgerData(parsed);
            onLedgerDataReady(parsed);
            setError(null);
          }
        } catch (err) {
          setError(`Failed to parse ${type} file: ${err.message}`);
        }
      },
      error: (err) => {
        setError(`CSV parse error: ${err.message}`);
      },
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bank Export (Xero/Sage)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload(e, 'bank')}
              className="hidden"
              id="bank-file"
            />
            <label htmlFor="bank-file" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Click to upload CSV</p>
              <p className="text-xs text-muted-foreground">or drag and drop</p>
            </label>
          </div>

          {bankFile && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <FileText className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">{bankFile}</span>
              <Badge className="ml-auto bg-green-100 text-green-700">
                {bankData?.length} rows
              </Badge>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1 p-3 bg-blue-50 rounded-lg">
            <p className="font-semibold text-blue-900">Required columns:</p>
            <ul className="list-disc list-inside">
              <li>date (YYYY-MM-DD)</li>
              <li>description</li>
              <li>amount (numeric)</li>
              <li>reference (optional)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rental Ledger Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload(e, 'ledger')}
              className="hidden"
              id="ledger-file"
            />
            <label htmlFor="ledger-file" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Click to upload CSV</p>
              <p className="text-xs text-muted-foreground">or drag and drop</p>
            </label>
          </div>

          {ledgerFile && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <FileText className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">{ledgerFile}</span>
              <Badge className="ml-auto bg-green-100 text-green-700">
                {ledgerData?.length} rows
              </Badge>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1 p-3 bg-blue-50 rounded-lg">
            <p className="font-semibold text-blue-900">Required columns:</p>
            <ul className="list-disc list-inside">
              <li>transaction_date (YYYY-MM-DD)</li>
              <li>tenant_name</li>
              <li>amount (numeric)</li>
              <li>description</li>
              <li>id (optional)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="col-span-full flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-700">Import Error</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}