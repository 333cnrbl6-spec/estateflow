import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Download, Trash2 } from 'lucide-react';

export default function AccountSettings() {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const response = await base44.functions.invoke('exportUserData', {});
      const blob = new Blob([JSON.stringify(response.data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `premiso-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirmed) {
      setDeleteConfirmed(true);
      return;
    }

    setDeleting(true);
    try {
      await base44.functions.invoke('deleteUserAccount', {
        confirm: true,
        reason: 'User requested account deletion'
      });
      alert('Account marked for deletion. You have 30 days to cancel.');
    } catch (error) {
      console.error('Deletion failed:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Your Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">Download all your data in JSON format including properties, tenants, maintenance records, and financial data.</p>
          <Button 
            onClick={handleExportData}
            disabled={exporting}
            className="w-full"
          >
            {exporting ? 'Exporting...' : 'Download All Data'}
          </Button>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Trash2 className="w-5 h-5" />
            Delete Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 p-3 bg-white rounded border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600">
              <p className="font-semibold text-slate-900 mb-1">This cannot be undone</p>
              <p>You'll have 30 days to cancel. After that, all your data will be permanently deleted.</p>
            </div>
          </div>

          {deleteConfirmed && (
            <div className="p-3 bg-white border border-red-300 rounded text-sm text-slate-600">
              <p className="mb-3">Type <strong>delete my account</strong> to confirm:</p>
              <input 
                type="text" 
                placeholder="delete my account"
                className="w-full px-3 py-2 border border-red-300 rounded text-sm mb-3"
              />
            </div>
          )}

          <Button 
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full"
          >
            {deleteConfirmed ? 'Confirm Deletion' : 'Delete My Account'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}