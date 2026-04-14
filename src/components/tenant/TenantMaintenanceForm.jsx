import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  'plumbing', 'electrical', 'heating', 'structural', 'decorating',
  'general', 'safety', 'cleaning', 'other'
];

const PRIORITIES = ['low', 'standard', 'urgent', 'emergency'];

export default function TenantMaintenanceForm({ tenant, units }) {
  const [selectedUnit, setSelectedUnit] = useState(units[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('standard');
  const [photos, setPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch existing requests
  const maintenanceQuery = useQuery({
    queryKey: ['tenant-maintenance', tenant.id],
    queryFn: async () => {
      return await base44.entities.MaintenanceRequest.filter(
        { tenant_id: tenant.id },
        '-created_date',
        50
      );
    },
  });

  // Create maintenance request
  const createMaintenanceMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.MaintenanceRequest.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-maintenance'] });
      setTitle('');
      setDescription('');
      setPhotos([]);
      setPriority('standard');
    },
  });

  // Handle photo upload
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingPhotos(true);
    try {
      const uploadedPhotos = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedPhotos.push(file_url);
      }
      setPhotos([...photos, ...uploadedPhotos]);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploadingPhotos(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedUnit) return;

    const unit = units.find(u => u.id === selectedUnit);
    const property = unit?.property_id;

    await createMaintenanceMutation.mutateAsync({
      property_id: property,
      unit_id: selectedUnit,
      tenant_id: tenant.id,
      title,
      description,
      category,
      priority,
      status: 'reported',
      photos: photos,
    });
  };

  const { data: maintenanceRequests = [] } = maintenanceQuery;

  return (
    <div className="space-y-8">
      {/* Request Form */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Submit a New Request</h3>
        <form onSubmit={handleSubmit} className="space-y-4 bg-muted p-6 rounded-lg">
          {/* Unit Selection */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Unit *</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Issue Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Leaking tap in kitchen"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the issue..."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {PRIORITIES.map(pri => (
                  <option key={pri} value={pri}>{pri.charAt(0).toUpperCase() + pri.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Photos (optional)</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
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
                  Click to upload photos
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
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden group">
                    <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-20 object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!title.trim() || createMaintenanceMutation.isPending}
            className="w-full"
          >
            {createMaintenanceMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </form>
      </div>

      {/* Recent Requests */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Your Maintenance Requests</h3>
        {maintenanceRequests.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No maintenance requests yet</p>
        ) : (
          <div className="space-y-3">
            {maintenanceRequests.map(req => (
              <div key={req.id} className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{req.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{req.category} • {req.priority} priority</p>
                    <p className="text-xs text-muted-foreground mt-1">Submitted: {new Date(req.created_date).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                    req.status === 'completed' ? 'bg-green-100 text-green-700' :
                    req.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    req.status === 'assigned' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {req.status.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}