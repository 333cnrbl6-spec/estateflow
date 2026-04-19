import React, { useState } from 'react';
import AIDraftButton from '@/components/documents/AIDraftButton';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, FileText, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/shared/PageHeader';
import { useDemoFilter } from '@/hooks/useDemoFilter';
import TemplateUploadDialog from '@/components/templates/TemplateUploadDialog';
import TemplateGeneratorDialog from '@/components/templates/TemplateGeneratorDialog';

export default function DocumentTemplates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const queryClient = useQueryClient();
  const { companyIds } = useDemoFilter();

  const { data: templates = [] } = useQuery({
    queryKey: ['documentTemplates', companyIds],
    queryFn: async () => {
      const all = await base44.entities.DocumentTemplate.list('-updated_date');
      if (companyIds) {
        return all.filter(t => companyIds.includes(t.company_id));
      }
      return all;
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.DocumentTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
    }
  });

  const filteredTemplates = templates.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.template_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      <PageHeader 
        title="Document Templates" 
        subtitle="Manage PDF/Word templates with automatic data merge"
      >
        <div className="flex gap-2">
          <AIDraftButton documentType="tenancy_agreement" context={{}} />
          <AIDraftButton documentType="section_21_notice" context={{}} />
          <Button onClick={() => setShowUpload(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Upload Template
          </Button>
        </div>
      </PageHeader>

      {/* Search */}
      <div>
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{template.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {template.template_type?.replace(/_/g, ' ').title()}
                    </p>
                  </div>
                  <FileText className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {template.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1">
                  {template.merge_fields?.map((field) => (
                    <span key={field} className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                      {field}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowGenerator(true);
                    }}
                  >
                    <Download className="w-3 h-3" />
                    Generate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTemplateMutation.mutate(template.id)}
                    disabled={deleteTemplateMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No templates match your search' : 'No templates uploaded yet'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowUpload(true)} variant="outline" className="mt-4 gap-2">
                <Upload className="w-4 h-4" />
                Upload Your First Template
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <TemplateUploadDialog 
        open={showUpload} 
        onOpenChange={setShowUpload}
      />
      
      {selectedTemplate && (
        <TemplateGeneratorDialog
          open={showGenerator}
          onOpenChange={(open) => {
            if (!open) setSelectedTemplate(null);
            setShowGenerator(open);
          }}
          template={selectedTemplate}
        />
      )}
    </div>
  );
}