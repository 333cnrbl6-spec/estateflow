import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Loader2, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DocumentGenerationWizard({ propertyId, unitId, tenantId }) {
  const [step, setStep] = useState('select');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const queryClient = useQueryClient();

  // Fetch available templates
  const templatesQuery = useQuery({
    queryKey: ['document-templates'],
    queryFn: () => base44.entities.DocumentTemplate.filter(
      { is_active: true },
      '-created_date',
      50
    ),
  });

  // Fetch property and tenant data
  const propertyQuery = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => base44.entities.Property.get(propertyId),
  });

  const tenantQuery = useQuery({
    queryKey: ['tenant', tenantId],
    enabled: !!tenantId,
    queryFn: () => base44.entities.Tenant.get(tenantId),
  });

  // Generate document
  const generateMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('generateDocumentFromTemplate', {
        templateId: selectedTemplate,
        propertyId,
        unitId,
        tenantId,
      });
      return result.data;
    },
    onSuccess: (data) => {
      setGeneratedDoc(data);
      setStep('complete');
      queryClient.invalidateQueries({ queryKey: ['generated-documents'] });
    },
  });

  const { data: templates = [] } = templatesQuery;
  const { data: property } = propertyQuery;
  const { data: tenant } = tenantQuery;

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {['select', 'review', 'generate', 'complete'].map((s, idx) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step === s ? 'bg-primary text-primary-foreground' :
              ['select', 'review', 'generate', 'complete'].indexOf(step) > idx ? 'bg-green-600 text-white' :
              'bg-muted text-muted-foreground'
            }`}>
              {idx + 1}
            </div>
            {idx < 3 && <div className="w-12 h-1 bg-muted mx-2" />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Template */}
      {step === 'select' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Select Document Template</h3>
            <p className="text-sm text-muted-foreground">Choose the document type you want to generate</p>
          </div>

          {templatesQuery.isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <div className="grid gap-3">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{template.template_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {template.document_type.replace(/_/g, ' ')} • {template.jurisdiction}
                      </p>
                    </div>
                    <span className="text-xs bg-muted px-2 py-1 rounded">v{template.version}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={() => setStep('review')}
              disabled={!selectedTemplate}
            >
              Continue →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Review Data */}
      {step === 'review' && selectedTemplateData && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Review Data</h3>
            <p className="text-sm text-muted-foreground">Verify the information that will be populated into the document</p>
          </div>

          <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            {property && (
              <div className="pb-4 border-b border-border">
                <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold">Property</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Address</p>
                    <p className="font-semibold text-foreground">{property.address_line_1}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Postcode</p>
                    <p className="font-semibold text-foreground">{property.postcode}</p>
                  </div>
                </div>
              </div>
            )}

            {tenant && (
              <div className="pb-4 border-b border-border">
                <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold">Tenant</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-semibold text-foreground">{tenant.full_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-semibold text-foreground">{tenant.email}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground mb-3 uppercase font-semibold">Required Fields</p>
              <div className="space-y-2">
                {selectedTemplateData.placeholder_fields?.filter(f => f.required).map(field => (
                  <div key={field.placeholder_name} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{field.display_name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-4">
            <Button variant="outline" onClick={() => setStep('select')}>
              ← Back
            </Button>
            <Button onClick={() => setStep('generate')}>
              Generate Document →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Generating */}
      {step === 'generate' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Generating Document</h3>
          </div>

          {!generateMutation.isPending && !generatedDoc && (
            <div className="bg-card rounded-lg border border-border p-8 text-center space-y-4">
              <FileText className="w-12 h-12 text-primary mx-auto opacity-30" />
              <p className="text-foreground font-semibold">Ready to generate</p>
              <p className="text-sm text-muted-foreground">Click below to create your document</p>
              <Button
                onClick={() => generateMutation.mutate()}
                className="w-full gap-2"
              >
                <FileText className="w-4 h-4" />
                Generate PDF
              </Button>
            </div>
          )}

          {generateMutation.isPending && (
            <div className="bg-card rounded-lg border border-border p-8 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
              <p className="text-foreground font-semibold">Generating document...</p>
              <p className="text-sm text-muted-foreground">Please wait while we populate and create your PDF</p>
            </div>
          )}

          {generateMutation.isError && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-100">
              <p className="font-semibold mb-1">Generation Failed</p>
              <p className="text-sm">{generateMutation.error?.message}</p>
              <Button
                variant="outline"
                onClick={() => setStep('review')}
                className="mt-4"
              >
                ← Back to Review
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Complete */}
      {step === 'complete' && generatedDoc && (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Document Generated Successfully</h3>
                <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                  Your document is ready for download and signature
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1 uppercase">Document</p>
              <p className="font-semibold text-foreground text-lg">{generatedDoc.document_name}</p>
            </div>

            <div className="flex gap-2">
              <a
                href={generatedDoc.document_url}
                download
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
              <Button
                variant="outline"
                onClick={() => window.open(generatedDoc.document_url, '_blank')}
              >
                Preview
              </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-xs text-blue-900 dark:text-blue-100 font-semibold mb-2">Next Steps:</p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>✓ Download the PDF to your device</li>
                <li>✓ Review all populated information</li>
                <li>✓ Share with relevant parties for signature</li>
                <li>✓ Collect signatures (digital or wet ink)</li>
              </ul>
            </div>

            <Button
              onClick={() => {
                setStep('select');
                setSelectedTemplate('');
                setGeneratedDoc(null);
              }}
              className="w-full"
            >
              Generate Another Document
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}