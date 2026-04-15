import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Zap } from 'lucide-react';

export default function AutomationTemplateCard({ template, onClone }) {
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  const categoryEmoji = {
    alerts: '🔔',
    scheduling: '📅',
    reporting: '📊',
    notifications: '💬',
    integration: '🔗',
    cleanup: '🧹',
    verification: '✓',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{template.icon || categoryEmoji[template.category] || '⚙️'}</span>
              <CardTitle className="text-base">{template.name}</CardTitle>
            </div>
            <CardDescription className="line-clamp-2">{template.description}</CardDescription>
          </div>
          {template.is_popular && (
            <Badge className="bg-amber-100 text-amber-800 shrink-0">Popular</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3">
        {/* Meta */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={`text-xs ${difficultyColors[template.difficulty]}`}>
            {template.difficulty}
          </Badge>
          {template.estimated_setup_time_minutes && (
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {template.estimated_setup_time_minutes}m
            </Badge>
          )}
          {template.status === 'beta' && (
            <Badge className="bg-blue-100 text-blue-800 text-xs">Beta</Badge>
          )}
        </div>

        {/* Trigger & Actions Summary */}
        <div className="space-y-1 text-xs text-muted-foreground border-t pt-2">
          <p><strong>Trigger:</strong> {template.trigger_type.replace(/_/g, ' ')}</p>
          <p><strong>Actions:</strong> {template.actions?.length || 0} action{template.actions?.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Use Cases */}
        {template.use_cases?.length > 0 && (
          <div className="text-xs space-y-1 border-t pt-2">
            <p className="font-medium text-foreground">Use cases:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
              {template.use_cases.slice(0, 2).map((use, i) => (
                <li key={i}>{use}</li>
              ))}
              {template.use_cases.length > 2 && <li>+{template.use_cases.length - 2} more</li>}
            </ul>
          </div>
        )}

        {/* Clone Button */}
        <Button
          size="sm"
          onClick={() => onClone(template)}
          className="w-full mt-auto"
          variant="outline"
        >
          <Zap className="w-4 h-4 mr-2" />
          Clone & Customize
        </Button>
      </CardContent>
    </Card>
  );
}