import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Lock, CheckCircle2, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TemplateManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ['document-templates-all'],
    queryFn: () => base44.entities.DocumentTemplate.list('-created_date', 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (templateId) => base44.entities.DocumentTemplate.delete(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates-all'] });
    },
  });

  const { data: templates = [] } = templatesQuery;

  const activeTemplates = templates.filter(t => t.is_active).length;
  const approvedTemplates = templates.filter(t => t.legal_review_status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Templates</p>
          <p className="text-2xl font-bold text-foreground">{templates.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">{activeTemplates}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Legally Approved</p>
          <p className="text-2xl font-bold text-blue-600">{approvedTemplates}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Document Templates</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      {/* Templates List */}
      <div className="space-y-3">
        {templatesQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No templates found</p>
          </div>
        ) : (
          templates.map(template => (
            <div
              key={template.id}
              className="bg-card rounded-lg border border-border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{template.template_name}</h3>
                    {template.is_locked && (
                      <Lock className="w-4 h-4 text-muted-foreground" title="Locked" />
                    )}
                    {template.legal_review_status === 'approved' && (
                      <CheckCircle2 className="w-4 h-4 text-green-600" title="Legally approved" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {template.document_type.replace(/_/g, ' ')} • {template.jurisdiction.toUpperCase()} • v{template.version}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {template.is_active && (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100 text-xs font-semibold">
                        Active
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      template.legal_review_status === 'approved' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100' :
                      template.legal_review_status === 'pending_review' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-100'
                    }`}>
                      {template.legal_review_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingTemplate(template)}
                    disabled={template.is_locked}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={() => deleteMutation.mutate(template.id)}
                    disabled={template.is_locked || deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Tip:</strong> Templates must be legally approved before they can be used for document generation. Lock templates after approval to prevent accidental modifications.
        </p>
      </div>
    </div>
  );
}