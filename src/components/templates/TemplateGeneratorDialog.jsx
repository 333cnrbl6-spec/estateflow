import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Download, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function TemplateGeneratorDialog({ open, onOpenChange, template }) {
  const [entityType, setEntityType] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [customData, setCustomData] = useState({});
  const [error, setError] = useState('');

  const { data: entities = [] } = useQuery({
    queryKey: ['template-entities', entityType],
    queryFn: async () => {
      if (!entityType) return [];
      try {
        return await base44.entities[entityType].list();
      } catch {
        return [];
      }
    },
    enabled: !!entityType
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      try {
        const result = await base44.functions.invoke('mergeTemplateData', {
          templateId: template.id,
          templateFileUrl: template.file_url,
          templateType: template.template_type,
          entityType,
          entityId: selectedId,
          mergeFields: template.merge_fields || [],
          customData
        });
        return result.data;
      } catch (err) {
        throw new Error(err.message || 'Failed to generate document');
      }
    },
    onSuccess: (data) => {
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
        onOpenChange(false);
      }
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const selectedEntity = useMemo(() => {
    return entities.find(e => e.id === selectedId);
  }, [entities, selectedId]);

  const getDisplayName = (entity) => {
    return entity.full_name || entity.name || entity.tenant_name || entity.property_name || entity.id;
  };

  const entityTypeOptions = [
    { label: 'Tenant', value: 'Tenant' },
    { label: 'Unit', value: 'Unit' },
    { label: 'Property', value: 'Property' },
    { label: 'TenancyPipeline', value: 'TenancyPipeline' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Document</DialogTitle>
          <DialogDescription>
            Merge data into {template.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Select Entity Type</Label>
            <Select value={entityType} onValueChange={(value) => {
              setEntityType(value);
              setSelectedId('');
            }}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose..." />
              </SelectTrigger>
              <SelectContent>
                {entityTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {entityType && (
            <div>
              <Label className="text-sm font-medium">Select {entityType}</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Loading..." />
                </SelectTrigger>
                <SelectContent>
                  {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {getDisplayName(entity)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedEntity && template.merge_fields && (
            <div className="bg-secondary/50 p-3 rounded-lg">
              <p className="text-xs font-medium mb-2">Auto-merged fields:</p>
              <div className="space-y-1">
                {template.merge_fields.map((field) => {
                  const value = selectedEntity[field] || '';
                  return (
                    <div key={field} className="text-xs">
                      <span className="font-mono bg-background px-1 rounded">{field}</span>
                      {value && <span className="text-muted-foreground ml-2">= {String(value).slice(0, 30)}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Additional Data (JSON)</Label>
            <Textarea
              placeholder='{"custom_field": "value"}'
              value={JSON.stringify(customData, null, 2)}
              onChange={(e) => {
                try {
                  setCustomData(JSON.parse(e.target.value));
                } catch {
                  setCustomData({});
                }
              }}
              className="mt-1 h-24 font-mono text-xs"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!selectedId || generateMutation.isPending}
            className="gap-2"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate & Download
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}