import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, X } from 'lucide-react';

export default function MaintenanceRequestForm({ 
  newRequest, 
  setNewRequest, 
  uploading, 
  handlePhotoUpload, 
  submitMaintenanceRequest,
  onClose 
}) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">New Maintenance Request</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
      </div>
      <form onSubmit={submitMaintenanceRequest} className="space-y-4">
        <div>
          <Label>Issue Title *</Label>
          <Input
            value={newRequest.title}
            onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Leaking tap in kitchen"
            required
          />
        </div>
        <div>
          <Label>Description *</Label>
          <textarea
            className="w-full p-2 border rounded-md"
            rows={4}
            value={newRequest.description}
            onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Please describe the issue in detail..."
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Category</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={newRequest.category}
              onChange={(e) => setNewRequest(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="general">General</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="heating">Heating</option>
              <option value="appliance">Appliance</option>
              <option value="structural">Structural</option>
              <option value="security">Security</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label>Urgency</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={newRequest.urgency}
              onChange={(e) => setNewRequest(prev => ({ ...prev, urgency: e.target.value }))}
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>
        <div>
          <Label>Upload Photos</Label>
          <div className="mt-2 flex gap-2 flex-wrap">
            <Input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploading}
              className="flex-1"
            />
            {uploading && <Loader2 className="w-5 h-5 animate-spin" />}
          </div>
          {newRequest.photos.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {newRequest.photos.map((photo, i) => (
                <div key={i} className="relative">
                  <img src={photo.url} alt={photo.name} className="w-20 h-20 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => setNewRequest(prev => ({
                      ...prev,
                      photos: prev.photos.filter((_, idx) => idx !== i)
                    }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Button type="submit" className="w-full">
          Submit Request
        </Button>
      </form>
    </Card>
  );
}