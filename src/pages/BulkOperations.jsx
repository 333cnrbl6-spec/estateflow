import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, MessageSquare, FileText, Zap, Check, Clock } from 'lucide-react';

const BULK_ACTIONS = [
  {
    id: 'bulk-email',
    name: 'Send Bulk Email',
    icon: Mail,
    description: 'Send emails to multiple tenants/contractors',
    templates: ['Rent Reminder', 'Maintenance Alert', 'Inspection Notice', 'Custom']
  },
  {
    id: 'bulk-sms',
    name: 'Send Bulk SMS',
    icon: MessageSquare,
    description: 'Send SMS to multiple recipients',
    templates: ['Payment Due', 'Inspection Today', 'Maintenance Scheduled', 'Custom']
  },
  {
    id: 'bulk-documents',
    name: 'Generate Documents',
    icon: FileText,
    description: 'Generate & send documents in bulk',
    templates: ['Lease Agreements', 'Inspection Reports', 'Invoices', 'Notices']
  },
  {
    id: 'bulk-assign',
    name: 'Bulk Assign',
    icon: Zap,
    description: 'Assign maintenance/tasks to contractors',
    templates: []
  }
];

export default function BulkOperations() {
  const [selectedAction, setSelectedAction] = useState('bulk-email');
  const [selectedItems, setSelectedItems] = useState([]);

  // Mock data
  const recipients = [
    { id: 1, name: 'John Smith', email: 'john@example.com', phone: '+441234567890', property: '123 Main St' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+441234567891', property: '456 Oak Ave' },
    { id: 3, name: 'Mike Davis', email: 'mike@example.com', phone: '+441234567892', property: '789 Pine Rd' },
    { id: 4, name: 'Emma Wilson', email: 'emma@example.com', phone: '+441234567893', property: '321 Elm St' },
    { id: 5, name: 'James Brown', email: 'james@example.com', phone: '+441234567894', property: '654 Maple Dr' }
  ];

  const toggleItem = (id) => {
    setSelectedItems(selectedItems.includes(id)
      ? selectedItems.filter(i => i !== id)
      : [...selectedItems, id]
    );
  };

  const toggleAll = () => {
    if (selectedItems.length === recipients.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(recipients.map(r => r.id));
    }
  };

  const currentAction = BULK_ACTIONS.find(a => a.id === selectedAction);
  const ActionIcon = currentAction?.icon || Mail;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Zap className="w-8 h-8 text-yellow-600" />
            Bulk Operations
          </h1>
          <p className="text-lg text-slate-600">Execute actions at scale across your portfolio</p>
        </div>

        {/* Action Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {BULK_ACTIONS.map(action => {
            const Icon = action.icon;
            return (
              <Card
                key={action.id}
                className={`cursor-pointer transition-all ${selectedAction === action.id ? 'border-blue-500 bg-blue-50' : 'hover:border-slate-300'}`}
                onClick={() => setSelectedAction(action.id)}
              >
                <CardContent className="pt-6 text-center">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="font-semibold text-slate-900">{action.name}</p>
                  <p className="text-xs text-slate-500 mt-2">{action.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ActionIcon className="w-6 h-6 text-blue-600" />
                <div>
                  <CardTitle>{currentAction?.name}</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">{currentAction?.description}</p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">{selectedItems.length} selected</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Recipient Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900">Select Recipients</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAll}
                  className="text-xs"
                >
                  {selectedItems.length === recipients.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recipients.map(recipient => (
                  <div
                    key={recipient.id}
                    className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                    onClick={() => toggleItem(recipient.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedItems.includes(recipient.id)}
                        onChange={() => {}}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{recipient.name}</p>
                        <p className="text-sm text-slate-600">{recipient.email}</p>
                        <p className="text-xs text-slate-500 mt-1">{recipient.property}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Selection */}
            {currentAction?.templates.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Template</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {currentAction.templates.map((template, i) => (
                    <Button key={i} variant="outline" className="text-xs">
                      {template}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Preview */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Preview</h3>
              <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600">
                  {selectedAction === 'bulk-email' && `Email to ${selectedItems.length} recipients\nSubject: Rent Payment Due\nBody: Your rent is due on...`}
                  {selectedAction === 'bulk-sms' && `SMS to ${selectedItems.length} recipients\nMessage: Your property inspection is scheduled for...`}
                  {selectedAction === 'bulk-documents' && `Generate ${selectedItems.length} documents\nType: Lease Agreement`}
                  {selectedAction === 'bulk-assign' && `Assign ${selectedItems.length} tasks\nAssignee: Select Contractor`}
                </p>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
              <p className="text-sm text-slate-900 font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Schedule Execution
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="text-xs" disabled>
                  Send Now
                </Button>
                <Button variant="outline" className="text-xs">
                  Schedule for Later
                </Button>
              </div>
            </div>

            {/* Execute */}
            <div className="flex gap-2 justify-end pt-4 border-t border-slate-200">
              <Button variant="outline">Preview</Button>
              <Button
                disabled={selectedItems.length === 0}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4" />
                Execute Bulk Action
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Executions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { action: 'Bulk Email', recipients: 12, status: 'completed', time: '2 hours ago' },
                { action: 'Bulk SMS', recipients: 8, status: 'completed', time: '1 day ago' },
                { action: 'Generate Documents', recipients: 5, status: 'processing', time: 'Just now' }
              ].map((exec, i) => (
                <div key={i} className="p-3 flex items-center justify-between border-b border-slate-200 last:border-b-0">
                  <div>
                    <p className="font-semibold text-slate-900">{exec.action}</p>
                    <p className="text-xs text-slate-600">{exec.recipients} recipients • {exec.time}</p>
                  </div>
                  <Badge className={exec.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                    {exec.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}