import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Edit2 } from 'lucide-react';

const CATEGORIES = [
  'Certificate',
  'Lease',
  'Inspection',
  'Service Charge',
  'Maintenance',
  'Financial',
  'Legal',
  'Other',
];

export default function DocumentCategoryConfirm({ document, onConfirm, onSkip, isLoading }) {
  const [selectedCategory, setSelectedCategory] = useState(document.suggested_category || 'Other');
  const [notes, setNotes] = useState(document.parsing_notes || '');
  const [isEditing, setIsEditing] = useState(false);

  const confidenceColor = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-red-100 text-red-800',
  };

  const getConfidenceLevel = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  const confidenceLevel = getConfidenceLevel(document.confidence_score || 0);

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{document.file_name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">AI Confidence: {document.confidence_score}%</p>
          </div>
          <Badge className={confidenceColor[confidenceLevel]}>
            {confidenceLevel === 'high' ? '✓ High' : confidenceLevel === 'medium' ? '⚠ Medium' : '✗ Low'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Suggested Category */}
        <div>
          <label className="text-sm font-medium">Category</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Extracted Metadata */}
        {document.extracted_metadata && Object.keys(document.extracted_metadata).length > 0 && (
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Extracted Dates
            </label>
            <div className="text-xs text-muted-foreground mt-1 space-y-1">
              {document.extracted_metadata.issue_date && (
                <p>Issue: {document.extracted_metadata.issue_date}</p>
              )}
              {document.extracted_metadata.expiry_date && (
                <p>Expiry: {document.extracted_metadata.expiry_date}</p>
              )}
            </div>
          </div>
        )}

        {/* Alerts */}
        {notes && (
          <div className="flex gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">{notes}</div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onConfirm(selectedCategory, document.extracted_metadata)}
            disabled={isLoading}
            className="flex-1"
          >
            ✓ Confirm
          </Button>
          <Button variant="outline" onClick={onSkip} disabled={isLoading} className="flex-1">
            Skip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}