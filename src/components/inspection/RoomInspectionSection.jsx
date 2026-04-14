import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, ChevronDown } from 'lucide-react';

export default function RoomInspectionSection({
  room,
  defaultRooms,
  defaultChecklist,
  onUpdate,
  onRemove,
}) {
  const [expanded, setExpanded] = useState(true);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef(null);

  const handleRoomNameChange = (name) => {
    onUpdate({ ...room, name });
  };

  const handleChecklistItemChange = (idx, field, value) => {
    const newChecklist = [...(room.checklist || [])];
    newChecklist[idx] = { ...newChecklist[idx], [field]: value };
    onUpdate({ ...room, checklist: newChecklist });
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingPhotos(true);
    try {
      const uploadedPhotos = [];
      for (const file of files) {
        const { file_url } = await (async () => {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: file,
          });
          return res.json();
        })();
        uploadedPhotos.push(file_url);
      }
      onUpdate({ ...room, photos: [...(room.photos || []), ...uploadedPhotos] });
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (idx) => {
    const newPhotos = room.photos.filter((_, i) => i !== idx);
    onUpdate({ ...room, photos: newPhotos });
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="text-left flex-1">
          <input
            type="text"
            value={room.name}
            onChange={(e) => handleRoomNameChange(e.target.value)}
            placeholder="Enter room name..."
            list="room-names"
            className="w-full font-semibold text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none"
            onClick={(e) => e.stopPropagation()}
          />
          <datalist id="room-names">
            {defaultRooms.map(name => <option key={name} value={name} />)}
          </datalist>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Checklist */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Condition Checklist</h4>
            <div className="space-y-2">
              {(room.checklist && room.checklist.length > 0 ? room.checklist : defaultChecklist).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <span className="text-sm text-foreground">{item.item}</span>
                  <select
                    value={item.status || 'good'}
                    onChange={(e) => handleChecklistItemChange(idx, 'status', e.target.value)}
                    className="px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Photos</h4>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground text-sm"
              disabled={uploadingPhotos}
            >
              {uploadingPhotos ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Click to add photos
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploadingPhotos}
            />

            {/* Photo Preview */}
            {room.photos && room.photos.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {room.photos.map((url, idx) => (
                  <div key={idx} className="relative rounded overflow-hidden group">
                    <img src={url} alt={`Room photo ${idx + 1}`} className="w-full h-20 object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Remove Room */}
          <button
            type="button"
            onClick={onRemove}
            className="w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-semibold"
          >
            Remove Room
          </button>
        </div>
      )}
    </div>
  );
}