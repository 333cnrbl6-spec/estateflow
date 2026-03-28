import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/shared/PageHeader';
import { Plus, FileText, Trash2, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const categories = [
  { value: 'eviction_notice', label: 'Eviction Notice' },
  { value: 'tenancy_agreement', label: 'Tenancy Agreement' },
  { value: 'deposit_protection_notice', label: 'Deposit Protection Notice' },
  { value: 'gas_safety_cert', label: 'Gas Safety Cert' },
  { value: 'epc', label: 'EPC' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'inspection_report', label: 'Inspection Report' },
  { value: 'maintenance_notice', label: 'Maintenance Notice' },
  { value: 'rent_increase', label: 'Rent Increase Notice' },
];

const jurisdictions = [
  { value: 'england', label: 'England' },
  { value: 'wales', label: 'Wales' },
  { value: 'scotland', label: 'Scotland' },
  { value: 'ni', label: 'Northern Ireland' },
];

export default function DocumentTemplates() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    jurisdiction: 'england',
    template_content: '',
  });

  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['documentTemplates'],
    queryFn: () => base44.entities.DocumentTemplate.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DocumentTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
      resetForm();
      setShowDialog(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DocumentTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
      resetForm();
      setShowDialog(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DocumentTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.category || !formData.template_content) {
      alert('Please fill all required fields');
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (template) => {
    setFormData(template);
    setEditingId(template.id);
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      jurisdiction: 'england',
      template_content: '',
    });
    setEditingId(null);
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Document Templates"
        subtitle="Create reusable templates for compliance documents"
      >
        <Button onClick={() => setShowDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </PageHeader>

      <div className="space-y-4">
        {templates.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No templates yet. Create your first one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {categories.find((c) => c.value === template.category)?.label} •{' '}
                    {jurisdictions.find((j) => j.value === template.jurisdiction)?.label}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(template.id)}
                    className="text-destructive gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
            <DialogDescription>
              Build a template with placeholders like {'{{tenant_name}}'} and {'{{property_address}}'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Template Name</label>
              <Input
                placeholder="e.g. Section 21 Notice"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Jurisdiction</label>
                <Select value={formData.jurisdiction} onValueChange={(val) => setFormData({ ...formData, jurisdiction: val })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jurisdictions.map((j) => (
                      <SelectItem key={j.value} value={j.value}>
                        {j.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Template Content</label>
              <Textarea
                placeholder="Enter template with placeholders like {{tenant_name}}, {{property_address}}, {{due_date}}"
                value={formData.template_content}
                onChange={(e) => setFormData({ ...formData, template_content: e.target.value })}
                className="mt-2 min-h-[300px]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingId ? 'Update' : 'Create'} Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}