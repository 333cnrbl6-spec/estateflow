import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Calendar, User, AlertCircle } from 'lucide-react';

export default function PreviousInspectionsPanel({ unitId, propertyId }) {
  const [expandedId, setExpandedId] = useState(null);

  const { data: previousInspections = [], isLoading } = useQuery({
    queryKey: ['inspections', unitId, propertyId],
    queryFn: async () => {
      const records = await base44.entities.InspectionRecord.filter({
        unit_id: unitId,
        property_id: propertyId,
      }, '-inspection_date', 100);
      return records;
    },
    enabled: !!unitId && !!propertyId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Previous Inspections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading inspection history...</p>
        </CardContent>
      </Card>
    );
  }

  if (previousInspections.length === 0) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Previous Inspections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700">No previous inspections on record. This will be the baseline inspection.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Previous Inspections ({previousInspections.length})
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-2">Compare current condition against previous reports</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {previousInspections.map(inspection => (
          <div key={inspection.id} className="border rounded-lg">
            {/* Header */}
            <button
              onClick={() => setExpandedId(expandedId === inspection.id ? null : inspection.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {new Date(inspection.inspection_date).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {inspection.inspection_type?.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                  <Badge
                    className={`text-xs ${
                      inspection.overall_condition === 'excellent' ? 'bg-green-100 text-green-700' :
                      inspection.overall_condition === 'good' ? 'bg-blue-100 text-blue-700' :
                      inspection.overall_condition === 'fair' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}
                  >
                    {inspection.overall_condition}
                  </Badge>
                </div>
                {inspection.inspector_name && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> {inspection.inspector_name}
                  </p>
                )}
              </div>
              {expandedId === inspection.id ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {/* Expanded Details */}
            {expandedId === inspection.id && (
              <div className="border-t p-4 bg-slate-50 space-y-4">
                {/* Summary */}
                {inspection.summary_notes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Summary</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{inspection.summary_notes}</p>
                  </div>
                )}

                {/* Room Summary */}
                {(inspection.room_inspections || []).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-2">Rooms Inspected</p>
                    <div className="grid grid-cols-2 gap-2">
                      {inspection.room_inspections.map(room => (
                        <div key={room.room_id} className="bg-white p-2 rounded border text-xs">
                          <p className="font-medium text-slate-800">{room.room_name}</p>
                          <p className="text-muted-foreground capitalize">{room.condition_rating}</p>
                          {room.fixtures?.length > 0 && (
                            <p className="text-muted-foreground text-xs mt-1">
                              {room.fixtures.length} fixture{room.fixtures.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Issues Found */}
                {(inspection.issues_identified || []).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <p className="text-xs font-semibold text-slate-700">
                        {inspection.issues_identified.length} Issue{inspection.issues_identified.length !== 1 ? 's' : ''} Found
                      </p>
                    </div>
                    <div className="space-y-2">
                      {inspection.issues_identified.slice(0, 3).map((issue, idx) => (
                        <div key={idx} className="bg-white p-2 rounded border-l-2 border-amber-400 text-xs">
                          <p className="font-medium text-slate-800">{issue.title}</p>
                          <p className="text-muted-foreground text-xs">{issue.room} · {issue.severity}</p>
                        </div>
                      ))}
                      {inspection.issues_identified.length > 3 && (
                        <p className="text-xs text-muted-foreground italic">
                          +{inspection.issues_identified.length - 3} more issues
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {inspection.room_inspections?.some(r => r.photos?.length > 0) && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-2">Photos</p>
                    <p className="text-xs text-muted-foreground">
                      {inspection.room_inspections.reduce((sum, r) => sum + (r.photos?.length || 0), 0)} photo{inspection.room_inspections.reduce((sum, r) => sum + (r.photos?.length || 0), 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {/* View Full Report */}
                {inspection.pdf_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(inspection.pdf_url, '_blank')}
                    className="w-full text-xs"
                  >
                    View Full PDF Report
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}