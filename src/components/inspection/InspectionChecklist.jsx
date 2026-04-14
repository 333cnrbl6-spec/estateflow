import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Upload, Loader2, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const CHECKLIST_ITEMS = [
  { category: 'Exterior', items: ['Roof condition', 'Walls/siding', 'Windows/doors', 'Gutters', 'Garden/landscaping'] },
  { category: 'Interior', items: ['Walls/paint', 'Flooring', 'Ceilings', 'Doors/locks', 'Light switches'] },
  { category: 'Kitchen', items: ['Appliances', 'Counters', 'Cabinets', 'Sink/taps', 'Tiles/grout'] },
  { category: 'Bathroom', items: ['Fixtures', 'Tiles/grout', 'Ventilation', 'Sink/toilet', 'Tub/shower'] },
  { category: 'Safety', items: ['Smoke alarms', 'Carbon monoxide', 'Electrical outlets', 'Gas safety', 'Handrails'] }
];

export default function InspectionChecklist({ refreshKey }) {
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [checklistData, setChecklistData] = useState({});
  const [photos, setPhotos] = useState([]);
  const [notes, setNotes] = useState('');

  const { data: pendingInspections = [] } = useQuery({
    queryKey: ['pending-inspections', refreshKey],
    queryFn: () => base44.entities.InspectionRecord.filter(
      { status: 'scheduled' },
      'scheduled_date',
      20
    ).catch(() => [])
  });

  const submitInspectionMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('submitInspection', {
        inspection_id: selectedInspection.id,
        checklist_data: checklistData,
        photos,
        notes
      });
    },
    onSuccess: () => {
      alert('Inspection submitted successfully!');
      setSelectedInspection(null);
      setChecklistData({});
      setPhotos([]);
      setNotes('');
    }
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos(prev => [...prev, { name: file.name, data: reader.result }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleChecklistItem = (category, item) => {
    const key = `${category}-${item}`;
    setChecklistData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!selectedInspection) {
    return (
      <div className="space-y-4">
        {pendingInspections.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No pending inspections</p>
          </Card>
        ) : (
          pendingInspections.map(inspection => (
            <Card key={inspection.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedInspection(inspection)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">{inspection.property_id}</h3>
                    <Badge className="bg-blue-100 text-blue-700 text-xs capitalize">{inspection.inspection_type}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(inspection.scheduled_date), 'dd MMM yyyy')}
                  </div>
                  {inspection.notes && <p className="text-sm text-muted-foreground mt-2">{inspection.notes}</p>}
                </div>
                <Button variant="outline" size="sm">Start Inspection</Button>
              </div>
            </Card>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{selectedInspection.inspection_type} Inspection</h2>
            <p className="text-sm text-muted-foreground mt-1">{selectedInspection.property_id}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSelectedInspection(null)}>Close</Button>
        </div>
      </Card>

      {/* Checklist */}
      <div className="space-y-4">
        {CHECKLIST_ITEMS.map(section => (
          <Card key={section.category} className="p-6">
            <h3 className="font-semibold text-foreground mb-4 text-lg border-b pb-3">{section.category}</h3>
            <div className="space-y-3">
              {section.items.map(item => {
                const key = `${section.category}-${item}`;
                const isChecked = checklistData[key] || false;
                return (
                  <div
                    key={item}
                    onClick={() => toggleChecklistItem(section.category, item)}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition"
                  >
                    {isChecked ? (
                      <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300 shrink-0" />
                    )}
                    <span className={isChecked ? 'text-green-700 font-medium' : 'text-foreground'}>{item}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Photos */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Add Photos</h3>
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center mb-4">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload" className="cursor-pointer">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Click or drag photos here</p>
          </label>
        </div>
        
        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative group">
                <img src={photo.data} alt="inspection" className="w-full h-24 object-cover rounded-lg" />
                <button
                  onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Notes */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Additional Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Document any issues found, required repairs, or follow-up items..."
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
          rows="4"
        />
      </Card>

      {/* Submit */}
      <Button 
        onClick={() => submitInspectionMutation.mutate()}
        disabled={submitInspectionMutation.isPending}
        className="w-full py-6 text-lg"
      >
        {submitInspectionMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Inspection'
        )}
      </Button>
    </div>
  );
}