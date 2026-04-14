import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, CheckCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function InspectionHistory({ refreshKey }) {
  const { data: completedInspections = [], isLoading } = useQuery({
    queryKey: ['completed-inspections', refreshKey],
    queryFn: () => base44.entities.InspectionRecord.filter(
      { status: 'completed' },
      '-completed_date',
      30
    ).catch(() => [])
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-muted-foreground">Loading inspection history...</p>
      </div>
    );
  }

  if (completedInspections.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No completed inspections yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {completedInspections.map(inspection => (
        <Card key={inspection.id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-foreground">{inspection.inspection_type} Inspection</h3>
                <Badge className="bg-green-100 text-green-700 text-xs">Completed</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {inspection.property_id}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {format(new Date(inspection.completed_date), 'dd MMM yyyy')}
                </div>
              </div>
            </div>
          </div>

          {inspection.findings && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm font-medium text-foreground mb-2">Key Findings:</p>
              <p className="text-sm text-muted-foreground">{inspection.findings}</p>
            </div>
          )}

          {inspection.photos_count > 0 && (
            <div className="mt-3 text-xs text-muted-foreground">
              📸 {inspection.photos_count} photo{inspection.photos_count > 1 ? 's' : ''} attached
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}