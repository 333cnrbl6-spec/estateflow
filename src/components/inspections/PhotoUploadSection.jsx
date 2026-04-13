import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ROOMS = [
  'Living Room',
  'Kitchen',
  'Master Bedroom',
  'Bedroom 2',
  'Bedroom 3',
  'Bathroom',
  'En-Suite',
  'Hallway',
  'Dining Room',
  'Study',
  'Garage',
  'Garden',
];

export default function PhotoUploadSection({ roomPhotos, onPhotosChange, disabled }) {
  const [selectedRoom, setSelectedRoom] = useState('Living Room');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPhotos = [...(roomPhotos[selectedRoom] || [])];

    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        newPhotos.push({
          photo_id: `photo-${Date.now()}-${Math.random()}`,
          photo_url: file_url,
          caption: caption || file.name,
          uploaded_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    onPhotosChange({
      ...roomPhotos,
      [selectedRoom]: newPhotos,
    });

    setCaption('');
    setUploading(false);
  };

  const removePhoto = (room, photoId) => {
    onPhotosChange({
      ...roomPhotos,
      [room]: roomPhotos[room].filter(p => p.photo_id !== photoId),
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-600" />
          Photo Documentation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Room Selection & Upload */}
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Room</label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={disabled}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOMS.map(room => (
                  <SelectItem key={room} value={room}>
                    {room}
                    {roomPhotos[room]?.length > 0 && ` (${roomPhotos[room].length})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Photo Caption (Optional)</label>
            <Input
              placeholder="e.g., Water damage on ceiling"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              disabled={disabled}
            />
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <label className="cursor-pointer">
              <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">Drop photos here or click to upload</p>
              <p className="text-xs text-muted-foreground mb-3">PNG, JPG up to 10MB each</p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={e => handleUpload(e.target.files)}
                disabled={disabled}
              />
            </label>
          </div>
        </div>

        {/* Photos by Room */}
        <div className="space-y-4">
          {Object.entries(roomPhotos).map(([room, photos]) => (
            photos.length > 0 && (
              <div key={room} className="border rounded-lg p-4">
                <p className="font-semibold text-sm mb-3">{room}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map(photo => (
                    <div key={photo.photo_id} className="relative group">
                      <img
                        src={photo.photo_url}
                        alt={photo.caption}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      {photo.caption && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {photo.caption}
                        </p>
                      )}
                      {!disabled && (
                        <button
                          onClick={() => removePhoto(room, photo.photo_id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>

        {Object.values(roomPhotos).flat().length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No photos uploaded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}