import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Circle, ChevronDown, ChevronUp } from 'lucide-react';

export default function DataSourceGuidedGlean({ selectedSources, onGleanUpdate }) {
  const [expanded, setExpanded] = useState({});

  const sourceGuides = {
    google_drive: {
      label: 'Google Drive',
      questions: [
        { id: 'tenancy_docs', label: 'Tenancy agreements / Leases' },
        { id: 'property_schedules', label: 'Property schedules / Inventories' },
        { id: 'financial_docs', label: 'Financial statements / Invoices' },
        { id: 'compliance_docs', label: 'Safety certificates / Compliance docs' },
        { id: 'correspondence', label: 'Emails / Correspondence' },
      ],
    },
    dropbox: {
      label: 'Dropbox',
      questions: [
        { id: 'tenant_records', label: 'Tenant records / References' },
        { id: 'landlord_docs', label: 'Landlord / Freeholder documents' },
        { id: 'maintenance_files', label: 'Maintenance records / Contractor quotes' },
        { id: 'financial_records', label: 'Financial records / Bank statements' },
      ],
    },
    onedrive: {
      label: 'OneDrive',
      questions: [
        { id: 'accounting_exports', label: 'Accounting software exports (Excel)' },
        { id: 'service_charge_data', label: 'Service charge accounts' },
        { id: 'rent_ledgers', label: 'Rent ledgers / Arrears reports' },
        { id: 'property_data', label: 'Property data / Building info' },
      ],
    },
    bank_export: {
      label: 'Bank CSV Export',
      questions: [
        { id: 'tenant_payments', label: 'Tenant rent payments (inbound)' },
        { id: 'supplier_payments', label: 'Supplier / Contractor payments (outbound)' },
        { id: 'operational_expenses', label: 'Operational expenses (utilities, insurance, etc)' },
        { id: 'loan_payments', label: 'Loan / Mortgage payments' },
        { id: 'rent_collection_fees', label: 'Rent collection service fees' },
      ],
    },
    xero_export: {
      label: 'Xero Export',
      questions: [
        { id: 'chart_of_accounts', label: 'Chart of accounts / GL data' },
        { id: 'invoices', label: 'Invoices (sales & purchase)' },
        { id: 'journal_entries', label: 'Journal entries / Adjustments' },
        { id: 'tax_data', label: 'VAT / Tax data' },
        { id: 'contacts', label: 'Contacts (customers, suppliers, landlords)' },
      ],
    },
    sage_export: {
      label: 'Sage Export',
      questions: [
        { id: 'nominal_ledger', label: 'Nominal ledger accounts' },
        { id: 'purchase_ledger', label: 'Purchase ledger (supplier invoices)' },
        { id: 'sales_ledger', label: 'Sales ledger (customer invoices)' },
        { id: 'cash_book', label: 'Cash book / Bank reconciliation' },
      ],
    },
    local_files: {
      label: 'Local Files (Upload)',
      questions: [
        { id: 'spreadsheets', label: 'Spreadsheets (Excel, Sheets)' },
        { id: 'pdfs', label: 'PDFs (contracts, certificates)' },
        { id: 'documents', label: 'Word documents / Forms' },
        { id: 'images', label: 'Photos (property inspection, damage)' },
      ],
    },
  };

  const toggleExpand = (sourceId) => {
    setExpanded(prev => ({ ...prev, [sourceId]: !prev[sourceId] }));
  };

  const toggleGlean = (sourceId, gleanId) => {
    const currentGleans = onGleanUpdate.getGleans(sourceId) || [];
    const newGleans = currentGleans.includes(gleanId)
      ? currentGleans.filter(g => g !== gleanId)
      : [...currentGleans, gleanId];
    onGleanUpdate.setGleans(sourceId, newGleans);
  };

  const getGuideSummary = (sourceId) => {
    const gleans = onGleanUpdate.getGleans(sourceId) || [];
    return gleans.length > 0 ? `${gleans.length} categor${gleans.length === 1 ? 'y' : 'ies'} identified` : 'No data categorized yet';
  };

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-900">📋 Guided Data Classification</p>
        <p className="text-xs text-blue-800 mt-1">For each data source, tell us what data it contains. This helps us map and import records correctly.</p>
      </div>

      {selectedSources.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-4">Select data sources above to see classification options.</p>
      ) : (
        <div className="space-y-2">
          {selectedSources.map(sourceId => {
            const guide = sourceGuides[sourceId];
            if (!guide) return null;

            const isExpanded = expanded[sourceId];
            const gleans = onGleanUpdate.getGleans(sourceId) || [];

            return (
              <div key={sourceId} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleExpand(sourceId)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{guide.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{getGuideSummary(sourceId)}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t bg-slate-50 p-4 space-y-2">
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">What data is in this source?</p>
                    {guide.questions.map(q => {
                      const selected = gleans.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          onClick={() => toggleGlean(sourceId, q.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            selected
                              ? 'border-primary bg-primary/5'
                              : 'border-slate-200 hover:border-primary/40'
                          }`}
                        >
                          {selected ? (
                            <Check className="w-4 h-4 text-primary shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                          <span className={`text-sm ${selected ? 'text-primary font-medium' : 'text-slate-700'}`}>
                            {q.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedSources.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-green-800">
            ✓ {selectedSources.length} data source{selectedSources.length > 1 ? 's' : ''} ready for import
          </p>
          <p className="text-xs text-green-700 mt-1">
            During import, Premiso will intelligently map your data to the correct entities (Tenants, Properties, Transactions, etc).
          </p>
        </div>
      )}
    </div>
  );
}