import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Plus, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RoomInspectionSection from './RoomInspectionSection';

const DEFAULT_ROOMS = ['Living Room', 'Kitchen', 'Main Bedroom', 'Bedroom 2', 'Bedroom 3', 'Bathroom', 'Hallway', 'Other'];

const DEFAULT_CHECKLIST = [
  { item: 'Walls', category: 'decoration' },
  { item: 'Ceiling', category: 'decoration' },
  { item: 'Flooring', category: 'decoration' },
  { item: 'Windows', category: 'fixtures' },
  { item: 'Doors', category: 'fixtures' },
  { item: 'Light fixtures', category: 'electrical' },
  { item: 'Outlets', category: 'electrical' },
  { item: 'Cleanliness', category: 'general' },
];

export default function InspectionChecklist({ property, unit, landlords, onBack }) {
  const [rooms, setRooms] = useState([{ name: '', checklist: [], photos: [] }]);
  const [selectedLandlord, setSelectedLandlord] = useState(landlords[0]?.email || '');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [overallRating, setOverallRating] = useState('good');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Generate PDF and send email
  const generateAndEmail = useMutation({
    mutationFn: async () => {
      setSubmitting(true);
      try {
        const result = await base44.functions.invoke('generateInspectionReportPDF', {
          property: property,
          unit: unit,
          rooms: rooms,
          inspectionNotes: inspectionNotes,
          overallRating: overallRating,
          landlordEmail: selectedLandlord,
          inspectionDate: new Date().toISOString(),
        });
        return result.data;
      } finally {
        setSubmitting(false);
      }
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        onBack();
      }, 2000);
    },
  });

  const addRoom = () => {
    setRooms([...rooms, { name: '', checklist: DEFAULT_CHECKLIST.map(c => ({ ...c, status: 'good' })), photos: [] }]);
  };

  const updateRoom = (index, updatedRoom) => {
    const newRooms = [...rooms];
    newRooms[index] = updatedRoom;
    setRooms(newRooms);
  };

  const removeRoom = (index) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!rooms.some(r => r.name && r.name.trim())) {
      alert('Please add at least one room');
      return;
    }
    if (!selectedLandlord) {
      alert('Please select a landlord to email');
      return;
    }
    await generateAndEmail.mutateAsync();
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Inspection Report Sent</h1>
          <p className="text-muted-foreground">PDF report has been emailed to {selectedLandlord}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Inspection: {unit.name}</h1>
          <p className="text-muted-foreground mt-2">{property.name}</p>
        </div>

        {/* Rooms */}
        <div className="space-y-6 mb-8">
          {rooms.map((room, idx) => (
            <RoomInspectionSection
              key={idx}
              room={room}
              defaultRooms={DEFAULT_ROOMS}
              defaultChecklist={DEFAULT_CHECKLIST}
              onUpdate={(updated) => updateRoom(idx, updated)}
              onRemove={() => removeRoom(idx)}
            />
          ))}
        </div>

        {/* Add Room Button */}
        <div className="mb-8">
          <Button
            type="button"
            variant="outline"
            onClick={addRoom}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </Button>
        </div>

        {/* Overall Rating */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h3 className="font-semibold text-foreground mb-4">Overall Property Condition</h3>
          <div className="flex gap-4 mb-4">
            {['excellent', 'good', 'fair', 'poor'].map(rating => (
              <button
                key={rating}
                onClick={() => setOverallRating(rating)}
                className={`px-4 py-2 rounded-lg border-2 transition-all capitalize font-semibold ${
                  overallRating === rating
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>

          <label className="block text-sm font-semibold text-foreground mb-2">Additional Notes</label>
          <textarea
            value={inspectionNotes}
            onChange={(e) => setInspectionNotes(e.target.value)}
            placeholder="Add any additional observations or concerns..."
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Landlord Selection */}
        {landlords.length > 0 && (
          <div className="bg-card rounded-lg border border-border p-6 mb-8">
            <label className="block text-sm font-semibold text-foreground mb-3">Send to Landlord</label>
            <select
              value={selectedLandlord}
              onChange={(e) => setSelectedLandlord(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select landlord...</option>
              {landlords.map(landlord => (
                <option key={landlord.id} value={landlord.email}>
                  {landlord.name} ({landlord.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !selectedLandlord}
            className="gap-2 flex-1 md:flex-none"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating & Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate Report & Email
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}