import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Zap, BookOpen, Filter } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import AutomationTemplateCard from '@/components/automation/AutomationTemplateCard';
import { navigationZones } from '@/lib/navigationZones';

const CATEGORIES = [
  { id: 'alerts', label: 'Alerts', icon: '🔔' },
  { id: 'scheduling', label: 'Scheduling', icon: '📅' },
  { id: 'reporting', label: 'Reporting', icon: '📊' },
  { id: 'notifications', label: 'Notifications', icon: '💬' },
  { id: 'integration', label: 'Integration', icon: '🔗' },
  { id: 'cleanup', label: 'Cleanup', icon: '🧹' },
  { id: 'verification', label: 'Verification', icon: '✓' },
];

export default function AutomationTemplateLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['automationTemplates'],
    queryFn: () => base44.entities.AutomationTemplate.list(),
  });

  // Clone template mutation
  const cloneTemplateMutation = useMutation({
    mutationFn: async (template) => {
      const newWorkflow = {
        name: `${template.name} (Copy)`,
        trigger_type: template.trigger_type,
        trigger_config: template.trigger_config,
        actions: template.actions,
        is_active: false,
      };
      return base44.entities.Workflow.create(newWorkflow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      alert('Workflow created! Go to Workflows page to customize.');
    },
  });

  // Filter templates
  const filtered = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = selectedZone === 'all' || t.zone === selectedZone;
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesZone && matchesCategory;
  });

  const popular = filtered.filter(t => t.is_popular);
  const others = filtered.filter(t => !t.is_popular);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Automation Template Library"
        subtitle="Pre-built workflows for compliance, maintenance, finance, and operations"
      >
        <Button variant="outline" className="gap-2">
          <BookOpen className="w-4 h-4" />
          View Guide
        </Button>
      </PageHeader>

      {/* Search & Filters */}
      <Card className="p-4 space-y-4">
        <div className="flex gap-2">
          <Search className="w-4 h-4 text-muted-foreground mt-2.5" />
          <Input
            placeholder="Search templates by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              <Filter className="w-4 h-4 inline mr-1" />
              Zone
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedZone === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedZone('all')}
              >
                All Zones
              </Button>
              {navigationZones.map(zone => (
                <Button
                  key={zone.id}
                  variant={selectedZone === zone.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedZone(zone.id)}
                >
                  {zone.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All Categories
              </Button>
              {CATEGORIES.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.icon} {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground">No templates match your filters.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Popular Section */}
          {popular.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-100 text-amber-800">⭐ Popular</Badge>
                <p className="text-sm text-muted-foreground">{popular.length} template{popular.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popular.map(template => (
                  <AutomationTemplateCard
                    key={template.id}
                    template={template}
                    onClone={() => cloneTemplateMutation.mutate(template)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Templates */}
          {others.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{others.length} more template{others.length !== 1 ? 's' : ''}</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {others.map(template => (
                  <AutomationTemplateCard
                    key={template.id}
                    template={template}
                    onClone={() => cloneTemplateMutation.mutate(template)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}