import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function TenantMaintenanceSubmission({ tenantId, propertyId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'medium'
  });

  const categories = [
    { value: 'plumbing', label: '🚿 Plumbing' },
    { value: 'electrical', label: '⚡ Electrical' },
    { value: 'heating', label: '🔥 Heating/Cooling' },
    { value: 'appliance', label: '🍳 Appliance' },
    { value: 'structural', label: '🏠 Structural' },
    { value: 'decorating', label: '🎨 Decorating' },
    { value: 'other', label: '📋 Other' }
  ];

  const urgencies = [
    { value: 'low', label: 'Low - Can wait', color: 'bg-blue-100 text-blue-800' },
    { value: 'medium', label: 'Medium - Within a week', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High - Within 24 hours', color: 'bg-orange-100 text-orange-800' },
    { value: 'emergency', label: '🚨 Emergency - Immediate', color: 'bg-red-100 text-red-800' }
  ];

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxPhotos = 5;
    const maxFileSize = 5 * 1024 * 1024; // 5MB per file
    
    // Validate files
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image`);
        return false;
      }
      if (file.size > maxFileSize) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    if (photos.length + validFiles.length > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed. Current: ${photos.length}`);
      return;
    }

    setLoading(true);
    try {
      for (const file of validFiles) {
        const { file_url } = await base44.integrations.Core.UploadFile({
          file: file
        });
        if (!file_url) {
          throw new Error('Upload returned no URL');
        }
        setPhotos(prev => [...prev, {
          url: file_url,
          name: file.name
        }]);
      }
      toast.success(`${validFiles.length} photo(s) uploaded successfully`);
    } catch (err) {
      toast.error('Photo upload failed: ' + (err?.message || 'Unknown error'));
      // Remove any partially uploaded photos
      setPhotos(prev => prev.slice(0, prev.length - validFiles.length));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields with trimming
    const title = formData.title?.trim() || '';
    const description = formData.description?.trim() || '';
    const category = formData.category?.trim() || '';

    if (!title || !description || !category) {
      toast.error('Please fill in all required fields (Title, Description, Category)');
      return;
    }

    if (title.length < 3) {
      toast.error('Title must be at least 3 characters');
      return;
    }

    if (description.length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    setLoading(true);
    try {
      const photoUrls = photos.map(p => p?.url).filter(Boolean);

      // Create maintenance request
      const request = await base44.entities.MaintenanceRequest.create({
        tenant_id: tenantId,
        property_id: propertyId,
        title: title,
        description: description,
        category: category,
        priority: formData.urgency, // Map urgency to priority field
        status: 'pending',
        photo_urls: photoUrls,
        submitted_date: new Date().toISOString(),
        contact_email: 'tenant@example.com', // Should come from auth context
        contact_phone: '' // Optional
      });

      if (!request?.id) {
        throw new Error('Failed to create request - no ID returned');
      }

      // Send notification to property manager
      try {
        await base44.integrations.Core.SendEmail({
          to: 'manager@premiso.app',
          subject: `New Maintenance Request - ${title}`,
          body: `
            <html>
              <body style="font-family: Arial, sans-serif;">
                <h2>New Maintenance Request</h2>
                <p><strong>Request ID:</strong> ${request.id}</p>
                <p><strong>Property:</strong> ${propertyId}</p>
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Priority:</strong> ${formData.urgency}</p>
                <p><strong>Title:</strong> ${title}</p>
                <p><strong>Description:</strong></p>
                <p>${description}</p>
                <p><strong>Photos Attached:</strong> ${photoUrls.length}</p>
                <p>Log in to your dashboard to review and assign this request.</p>
              </body>
            </html>
          `
        });
      } catch (emailErr) {
        console.warn('Email notification failed (request created):', emailErr);
        // Don't fail the whole submission if email fails
      }

      toast.success('Maintenance request submitted successfully');
      setFormData({ title: '', description: '', category: '', urgency: 'medium' });
      setPhotos([]);
      onSuccess?.();
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Error submitting request: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Maintenance Request</CardTitle>
        <CardDescription>Report any issues with your property and upload photos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Issue Title *</Label>
          <Input
            placeholder="e.g., Leaky kitchen tap"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Description *</Label>
          <Textarea
            placeholder="Provide details about the issue..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-2 min-h-24"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Urgency *</Label>
            <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {urgencies.map(u => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Photos (Up to 5)</Label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center mt-2 hover:bg-muted/50 transition">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium mb-1">Click to upload photos of the issue</p>
            <p className="text-xs text-muted-foreground mb-4">Photos help us understand the problem better</p>
            <label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={loading || photos.length >= 5}
              />
              <Button variant="outline" disabled={loading || photos.length >= 5} size="sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Choose Photos
              </Button>
            </label>
          </div>

          {photos.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">{photos.length} photo(s) selected</p>
              <div className="grid grid-cols-4 gap-2">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={photo.url}
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            For emergencies (gas leak, electrical hazard, flooding), call the emergency hotline immediately at 0800 999 8888
          </p>
        </div>

        <Button onClick={handleSubmit} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Submit Request
        </Button>
      </CardContent>
    </Card>
  );
}