import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PhotoUploadSection from './PhotoUploadSection';
import RoomCommentsPanel from './RoomCommentsPanel';
import { Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

const INSPECTION_TYPES = ['pre_tenancy', 'post_tenancy', 'routine', 'complaint', 'safety'];
const CONDITIONS = ['excellent', 'good', 'fair', 'poor', 'critical'];

export default function InspectionForm({ propertyId, unitId, onSubmitSuccess }) {
  const queryClient = useQueryClient();
  const [inspectionType, setInspectionType] = useState('routine');
  const [overallCondition, setOverallCondition] = useState('good');
  const [summaryNotes, setSummaryNotes] = useState('');
  const [roomPhotos, setRoomPhotos] = useState({});
  const [roomComments, setRoomComments] = useState({});
  const [issuesToIdentify, setIssuesToIdentify] = useState([]);
  const [message, setMessage] = useState('');

  const createInspection = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      
      // Transform room data to issues
      const issues = [];
      Object.entries(roomComments).forEach(([room, data]) => {
        if (data.fixtures) {
          data.fixtures.forEach(fixture => {
            if (fixture.needs_repair) {
              issues.push({
                issue_id: `issue-${Date.now()}-${Math.random()}`,
                title: `${fixture.name} - ${fixture.condition}`,
                description: `Fixture in ${room} requires ${fixture.repair_priority} repair`,
                room,
                severity: fixture.repair_priority,
                photo_urls: roomPhotos[room]?.map(p => p.photo_url) || [],
                requires_action: true,
              });
            }
          });
        }
      });

      const record = await base44.entities.InspectionRecord.create({
        property_id: propertyId,
        unit_id: unitId,
        inspector_id: user?.id,
        inspector_name: user?.full_name || 'Inspector',
        inspection_date: new Date().toISOString(),
        inspection_type: inspectionType,
        overall_condition: overallCondition,
        room_inspections: Object.entries(roomComments).map(([room, data]) => ({
          room_id: `room-${Date.now()}-${Math.random()}`,
          room_name: room,
          condition_rating: data.condition || 'good',
          comments: data.comment || '',
          photos: roomPhotos[room] || [],
          fixtures: data.fixtures || [],
        })),
        issues_identified: issues,
        summary_notes: summaryNotes,
        status: 'completed',
      });

      return record;
    },
    onSuccess: async (record) => {
      // Generate PDF
      try {
        await base44.functions.invoke('generateInspectionPDF', {
          inspectionId: record.id,
        });
        setMessage('Inspection submitted and PDF generated successfully');
      } catch {
        setMessage('Inspection submitted (PDF generation failed)');
      }
      
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      setTimeout(() => {
        if (onSubmitSuccess) onSubmitSuccess(record);
        setInspectionType('routine');
        setOverallCondition('good');
        setSummaryNotes('');
        setRoomPhotos({});
        setRoomComments({});
      }, 2000);
    },
    onError: (err) => {
      setMessage(`Submission failed: ${err.message}`);
    },
  });

  const photoCount = Object.values(roomPhotos).flat().length;
  const roomsWithComments = Object.keys(roomComments).filter(r => roomComments[r]?.comment).length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Property Inspection
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Document property condition, upload photos by room, record fixture details, and generate a PDF report
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Inspection Type</label>
              <Select value={inspectionType} onValueChange={setInspectionType} disabled={createInspection.isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INSPECTION_TYPES.map(t => (
                    <SelectItem key={t} value={t}>
                      {t.replace(/_/g, ' ').charAt(0).toUpperCase() + t.replace(/_/g, ' ').slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Overall Condition</label>
              <Select value={overallCondition} onValueChange={setOverallCondition} disabled={createInspection.isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map(c => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Progress</p>
                <div className="flex gap-2">
                  <Badge variant="outline">{photoCount} photos</Badge>
                  <Badge variant="outline">{roomsWithComments} rooms</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Upload Section */}
      <PhotoUploadSection
        roomPhotos={roomPhotos}
        onPhotosChange={setRoomPhotos}
        disabled={createInspection.isPending}
      />

      {/* Room Comments Section */}
      <RoomCommentsPanel
        roomComments={roomComments}
        onCommentsChange={setRoomComments}
        disabled={createInspection.isPending}
      />

      {/* Summary Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Summary & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={summaryNotes}
            onChange={(e) => setSummaryNotes(e.target.value)}
            placeholder="Add overall observations, recommendations, and next steps..."
            rows={5}
            disabled={createInspection.isPending}
          />
          <p className="text-xs text-muted-foreground mt-2">
            This will be included in the PDF report sent to property managers
          </p>
        </CardContent>
      </Card>

      {/* Message */}
      {message && (
        <Alert className={message.includes('failed') ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}>
          <AlertCircle className={`h-4 w-4 ${message.includes('failed') ? 'text-red-600' : 'text-green-600'}`} />
          <AlertDescription className={message.includes('failed') ? 'text-red-700' : 'text-green-700'}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1 gap-2"
          onClick={() => createInspection.mutate()}
          disabled={createInspection.isPending || roomsWithComments === 0}
        >
          {createInspection.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting & Generating PDF...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Submit Inspection & Generate Report
            </>
          )}
        </Button>
      </div>
    </div>
  );
}