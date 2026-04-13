import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronDown, ChevronUp, CheckCircle2, Clock, AlertCircle, Zap, FileText,
  Database, BarChart3, Settings, Link2, Download, GripVertical, Sparkles
} from 'lucide-react';

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const PRIORITY_COLORS = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
  high: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  medium: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  low: { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-700' },
};

const CATEGORY_ICONS = {
  properties: Database,
  tenants: AlertCircle,
  financials: BarChart3,
  accounting: Link2,
  compliance: CheckCircle2,
  workflows: Zap,
};

export default function SmartImportPlanner({ dataPrediction, existingTechStack = [] }) {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [checkedItems, setCheckedItems] = useState({});

  // Generate import checklist from data prediction
  const generateChecklist = () => {
    const checklist = {};

    // Properties & Units
    checklist.properties = {
      priority: 'critical',
      title: 'Properties & Units',
      icon: 'properties',
      estimatedHours: Math.ceil((dataPrediction.estimated_properties || 10) / 50),
      items: [
        {
          id: 'prop-basic',
          title: 'Property Basic Details',
          description: 'Name, address, type, ownership',
          subtasks: [
            { id: 'prop-addresses', title: 'Export property addresses & postcode data', automated: canAutomate('properties') },
            { id: 'prop-images', title: 'Upload property photos/branding', automated: false },
          ],
        },
        {
          id: 'prop-units',
          title: 'Units & Apartments',
          description: 'Assign units to properties with specs',
          subtasks: [
            { id: 'unit-list', title: 'Extract unit list from current system', automated: canAutomate('properties') },
            { id: 'unit-mapping', title: 'Map unit types & bedroom count', automated: false },
          ],
        },
      ],
    };

    // Tenants
    checklist.tenants = {
      priority: 'critical',
      title: 'Tenants & Leaseholders',
      icon: 'tenants',
      estimatedHours: Math.ceil((dataPrediction.estimated_tenants || 50) / 100),
      items: [
        {
          id: 'tenant-list',
          title: 'Tenant Directory',
          description: `${dataPrediction.estimated_tenants || '~50'} contacts total`,
          subtasks: [
            { id: 'tenant-export', title: 'Export tenant list with contact info', automated: canAutomate('tenants', existingTechStack) },
            { id: 'tenant-dedupe', title: 'Remove duplicates & verify emails', automated: false },
            { id: 'tenant-upload', title: 'Bulk import validated tenant list', automated: false },
          ],
        },
        {
          id: 'tenant-agreements',
          title: 'Tenancy Agreements',
          description: 'Link agreements to active tenancies',
          subtasks: [
            { id: 'agreement-scan', title: 'Locate & scan all tenancy agreements', automated: false },
            { id: 'agreement-upload', title: 'Upload agreements to document vault', automated: false },
          ],
        },
      ],
    };

    // Financials
    if (dataPrediction.financial_period) {
      checklist.financials = {
        priority: 'high',
        title: 'Financial Records',
        icon: 'financials',
        estimatedHours: 8,
        items: [
          {
            id: 'fin-transactions',
            title: 'Historical Transactions',
            description: `${dataPrediction.financial_period} historical data`,
            subtasks: [
              { id: 'fin-export', title: 'Export transaction history from bank/accounting', automated: canAutomate('financials', existingTechStack) },
              { id: 'fin-import', title: 'Map accounts and import transactions', automated: false },
            ],
          },
          {
            id: 'fin-rent',
            title: 'Rent & Charges',
            description: 'Setup rent schedules and service charges',
            subtasks: [
              { id: 'rent-schedule', title: 'Create rent schedules per tenant', automated: canAutomate('financials', existingTechStack) },
              { id: 'rent-history', title: 'Import rent payment history', automated: false },
            ],
          },
        ],
      };
    }

    // Accounting Integration
    const accountingSystem = existingTechStack.find(t => ['Xero', 'Sage', 'QuickBooks', 'FreeAgent'].includes(t));
    if (accountingSystem) {
      checklist.accounting = {
        priority: 'high',
        title: `${accountingSystem} Integration`,
        icon: 'accounting',
        estimatedHours: 2,
        items: [
          {
            id: 'acc-connect',
            title: 'Connect Accounting System',
            description: `OAuth connection to ${accountingSystem}`,
            subtasks: [
              { id: 'acc-oauth', title: `Authorize ${accountingSystem} access`, automated: 'manual-quick' },
              { id: 'acc-chart', title: 'Review & sync chart of accounts', automated: true },
              { id: 'acc-nominals', title: 'Create Nominal records from GL codes', automated: true },
            ],
          },
        ],
      };
    }

    // Compliance
    checklist.compliance = {
      priority: 'high',
      title: 'Compliance & Certificates',
      icon: 'compliance',
      estimatedHours: 4,
      items: [
        {
          id: 'comp-gas',
          title: 'Gas Safety Certificates',
          description: 'CP12 certificates for all properties',
          subtasks: [
            { id: 'gas-gather', title: 'Gather all CP12 certificates', automated: false },
            { id: 'gas-upload', title: 'Upload certificates with expiry dates', automated: false },
          ],
        },
        {
          id: 'comp-eicr',
          title: 'Electrical Safety (EICR)',
          description: 'Electrical inspection certificates',
          subtasks: [
            { id: 'eicr-gather', title: 'Collect EICR reports', automated: false },
            { id: 'eicr-upload', title: 'Upload with inspection dates', automated: false },
          ],
        },
      ],
    };

    // Workflows
    if (dataPrediction.likely_storage?.includes('Automated')) {
      checklist.workflows = {
        priority: 'medium',
        title: 'Workflows & Automations',
        icon: 'workflows',
        estimatedHours: 3,
        items: [
          {
            id: 'wf-rent-reminders',
            title: 'Rent Payment Reminders',
            description: 'Auto-send reminders for overdue rent',
            subtasks: [
              { id: 'wf-config', title: 'Configure reminder thresholds', automated: false },
              { id: 'wf-test', title: 'Send test reminder', automated: false },
            ],
          },
          {
            id: 'wf-maintenance',
            title: 'Maintenance Workflows',
            description: 'Auto-assign and escalate tickets',
            subtasks: [
              { id: 'wf-assign', title: 'Setup contractor assignment rules', automated: false },
              { id: 'wf-escalate', title: 'Configure escalation on overdue', automated: false },
            ],
          },
        ],
      };
    }

    return checklist;
  };

  const canAutomate = (category, stack = existingTechStack) => {
    const hasCloudStorage = stack.some(t => ['Google Drive', 'OneDrive', 'Dropbox'].includes(t));
    const hasAccounting = stack.some(t => ['Xero', 'Sage', 'QuickBooks'].includes(t));
    const hasRentalSoft = stack.some(t => ['OpenRent', 'Rightmove', 'PropTech'].includes(t));

    if (category === 'properties') return hasRentalSoft || hasCloudStorage;
    if (category === 'tenants') return hasRentalSoft || hasCloudStorage;
    if (category === 'financials') return hasAccounting;
    return false;
  };

  const checklist = generateChecklist();
  const categories = Object.values(checklist).sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const totalHours = categories.reduce((sum, cat) => sum + (cat.estimatedHours || 0), 0);
  const completedItems = Object.values(checkedItems).filter(Boolean).length;
  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);

  const toggleCategory = (catKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  const toggleItem = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const downloadChecklist = () => {
    const checklistText = categories.map(cat => {
      const items = cat.items.map(item => {
        const subtasks = item.subtasks.map(s => `  - ${s.title} ${s.automated ? '(automated)' : '(manual)'}`).join('\n');
        return `\n${item.title}\n${item.description}\n${subtasks}`;
      }).join('\n\n');
      return `\n${cat.title} (${cat.estimatedHours}h)\n${'='.repeat(50)}\n${items}`;
    }).join('\n\n');

    const blob = new Blob([
      `IMPORT CHECKLIST - ${dataPrediction.company_name || 'New Subscriber'}\n`,
      `Generated: ${new Date().toLocaleDateString()}\n`,
      `Total Estimated Time: ${totalHours} hours\n`,
      `\n${checklistText}`
    ], { type: 'text/plain' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-checklist-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">{completedItems}/{totalItems}</p>
              <p className="text-xs text-muted-foreground mt-1">Items Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">~{totalHours}h</p>
              <p className="text-xs text-muted-foreground mt-1">Estimated Time</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">
                {categories.filter(c => c.items.some(i => i.subtasks?.some(s => s.automated))).length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Auto-Mapped</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tech Stack Automations */}
      {existingTechStack.length > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <p className="font-semibold mb-1">Automated Mappings Detected</p>
            <p className="text-xs">Your {existingTechStack.join(', ')} account(s) have been identified for automated data sync.</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Checklist Categories */}
      <div className="space-y-3">
        {categories.map((category) => {
          const colors = PRIORITY_COLORS[category.priority];
          const CategoryIcon = CATEGORY_ICONS[category.icon] || Database;
          const isExpanded = expandedCategories[category.icon];
          const categoryItems = category.items;
          const categoryChecked = categoryItems.filter(i => checkedItems[i.id]).length;

          return (
            <Card key={category.icon} className={`${colors.bg} border ${colors.border}`}>
              <div
                onClick={() => toggleCategory(category.icon)}
                className="cursor-pointer p-4 flex items-center justify-between hover:bg-black/5 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <CategoryIcon className="w-5 h-5 text-slate-700" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{category.title}</h3>
                      <Badge variant="outline" className={colors.badge}>
                        {category.priority}
                      </Badge>
                      <span className="text-xs text-slate-600">
                        {categoryChecked}/{categoryItems.length}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      <Clock className="w-3 h-3 inline mr-1" /> ~{category.estimatedHours}h
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>

              {isExpanded && (
                <CardContent className="border-t pt-4">
                  <div className="space-y-3">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="bg-white rounded-lg p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <Checkbox
                            id={item.id}
                            checked={!!checkedItems[item.id]}
                            onChange={() => toggleItem(item.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <label htmlFor={item.id} className="font-medium text-sm text-slate-900 cursor-pointer">
                              {item.title}
                            </label>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                          </div>
                        </div>

                        {item.subtasks && (
                          <div className="ml-6 space-y-1 mt-2">
                            {item.subtasks.map((subtask) => (
                              <div key={subtask.id} className="flex items-center gap-2 text-xs">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                <span className="text-slate-600">{subtask.title}</span>
                                {subtask.automated && (
                                  <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 text-xs py-0">
                                    <Zap className="w-2.5 h-2.5 mr-0.5" /> Auto
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Download Action */}
      <Button onClick={downloadChecklist} variant="outline" className="w-full gap-2">
        <Download className="w-4 h-4" /> Download Checklist
      </Button>
    </div>
  );
}