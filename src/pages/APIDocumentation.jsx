import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Code, Copy, Check } from 'lucide-react';

export default function APIDocumentation() {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/entities/{entityName}',
      description: 'List entities with optional filtering',
      example: 'GET /entities/Property?limit=50&skip=0',
      response: '[ { "id": "123", "name": "Property A", "address": "123 Main St" } ]'
    },
    {
      method: 'POST',
      path: '/entities/{entityName}',
      description: 'Create a new entity',
      example: 'POST /entities/Property\n{ "name": "Property B", "address": "456 Oak Ave" }',
      response: '{ "id": "456", "name": "Property B", "created_date": "2026-05-02T10:00:00Z" }'
    },
    {
      method: 'GET',
      path: '/entities/{entityName}/{id}',
      description: 'Get entity by ID',
      example: 'GET /entities/Property/123',
      response: '{ "id": "123", "name": "Property A", "address": "123 Main St" }'
    },
    {
      method: 'PATCH',
      path: '/entities/{entityName}/{id}',
      description: 'Update entity',
      example: 'PATCH /entities/Property/123\n{ "name": "Property A Updated" }',
      response: '{ "id": "123", "name": "Property A Updated" }'
    },
    {
      method: 'DELETE',
      path: '/entities/{entityName}/{id}',
      description: 'Delete entity',
      example: 'DELETE /entities/Property/123',
      response: '{ "success": true }'
    },
    {
      method: 'POST',
      path: '/functions/{functionName}',
      description: 'Invoke backend function',
      example: 'POST /functions/generateCustomReport\n{ "reportId": "abc123", "format": "excel" }',
      response: '{ "report": "Q2 Summary", "rows": 150, "downloadUrl": "..." }'
    }
  ];

  const entities = ['Property', 'Tenant', 'MaintenanceRequest', 'MaintenanceOrder', 'FinancialTransaction', 'TeamMember', 'CustomReport', 'ComplianceRiskScore', 'WorkflowExecution', 'IntegrationConnection', 'PropertyValuation', 'RentalRecommendation', 'SafetyCertificate', 'Document', 'ActivityStream', 'TwoFactorAuth', 'GDPRRequest'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Code className="w-8 h-8" />
            API Documentation
          </h1>
          <p className="text-lg text-slate-600">Build integrations with Premiso — RESTful API, Webhooks, Maintenance Engine, Property Valuation, and Rental Optimization</p>
        </div>

        {/* Authentication */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700">All API requests require bearer token authentication:</p>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              Authorization: Bearer YOUR_API_TOKEN
            </div>
            <p className="text-sm text-slate-600">Get your API token from Settings → Integrations → API Keys</p>
          </CardContent>
        </Card>

        {/* Base URL */}
        <Card>
          <CardHeader>
            <CardTitle>Base URL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm flex items-center justify-between">
              <span>https://api.premiso.io/v1</span>
              <button
                onClick={() => copyToClipboard('https://api.premiso.io/v1', 'baseurl')}
                className="hover:text-primary transition-colors"
              >
                {copied === 'baseurl' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Entities */}
        <Card>
          <CardHeader>
            <CardTitle>Available Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {entities.map(entity => (
                <Badge key={entity} variant="outline" className="py-2 px-3">
                  {entity}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Endpoints</h2>
          <div className="space-y-3">
            {endpoints.map((ep, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge className={ep.method === 'GET' ? 'bg-blue-600' : ep.method === 'POST' ? 'bg-green-600' : ep.method === 'PATCH' ? 'bg-yellow-600' : 'bg-red-600'}>
                      {ep.method}
                    </Badge>
                    <code className="text-sm font-mono text-slate-900">{ep.path}</code>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-slate-700">{ep.description}</p>
                  <Tabs defaultValue="example" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="example">Example</TabsTrigger>
                      <TabsTrigger value="response">Response</TabsTrigger>
                    </TabsList>
                    <TabsContent value="example">
                      <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto flex items-start justify-between">
                        <pre>{ep.example}</pre>
                        <button
                          onClick={() => copyToClipboard(ep.example, `ex-${i}`)}
                          className="hover:text-primary transition-colors ml-4 flex-shrink-0 mt-1"
                        >
                          {copied === `ex-${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </TabsContent>
                    <TabsContent value="response">
                      <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <pre>{ep.response}</pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Rate Limits */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">Rate Limits</CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-900">
            <ul className="space-y-2">
              <li>• <strong>1,000 requests/hour</strong> per API token</li>
              <li>• <strong>100 requests/minute</strong> burst limit</li>
              <li>• <strong>50MB</strong> max payload size</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}