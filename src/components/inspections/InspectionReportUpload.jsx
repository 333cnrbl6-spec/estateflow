import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, FileText, Image, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function InspectionReportUpload({ inspectionId, propertyId }) {
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const loadInspection = async () => {
    try {
      const data = await base44.entities.PropertyInspection.get(inspectionId);
      setInspection(data);
    } catch (err) {
      toast.error('Error loading inspection: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReportUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      await base44.entities.PropertyInspection.update(inspectionId, {
        report_pdf_url: file_url,
        status: 'pending_tenant_review'
      });

      toast.success('Report uploaded successfully');
      loadInspection();
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      const photoUrls = [];
      
      for (let i = 0; i < files.length; i++) {
        const { file_url } = await base44.integrations.Core.UploadFile({ 
          file: files[i] 
        });
        photoUrls.push(file_url);
      }

      // Update first room's photos (or add to general photos)
      const updatedInspection = { ...inspection };
      if (!updatedInspection.photos) {
        updatedInspection.photos = [];
      }
      updatedInspection.photos = [...updatedInspection.photos, ...photoUrls];

      await base44.entities.PropertyInspection.update(inspectionId, {
        photos: updatedInspection.photos
      });

      toast.success(`${files.length} photo(s) uploaded`);
      setShowPhotoUpload(false);
      loadInspection();
    } catch (err) {
      toast.error('Photo upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCompleteInspection = async () => {
    if (!inspection?.report_pdf_url) {
      toast.error('Please upload an inspection report before completing');
      return;
    }

    try {
      await base44.entities.PropertyInspection.update(inspectionId, {
        status: 'pending_tenant_review',
        completed_date: new Date().toISOString()
      });

      // Send notification to tenant
      if (inspection.tenant_id) {
        await base44.integrations.Core.SendEmail({
          to: inspection.tenant_email || 'tenant@example.com',
          subject: 'Your Property Inspection Report is Ready',
          body: `
            <html>
              <body style="font-family: Arial, sans-serif;">
                <h2>Inspection Complete</h2>
                <p>Your property inspection has been completed and the report is ready for your review.</p>
                <p>Please log in to your tenant portal to view the inspection report and photos.</p>
                <p>If you have any questions or concerns about the inspection, please contact your property manager.</p>
              </body>
            </html>
          `
        });
      }

      toast.success('Inspection completed and tenant notified');
      loadInspection();
    } catch (err) {
      toast.error('Error: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading inspection...</div>;
  }

  if (!inspection) {
    return <div className="text-center py-8 text-red-600">Inspection not found</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inspection Report</CardTitle>
              <CardDescription>Upload and manage inspection documentation</CardDescription>
            </div>
            <Badge variant={inspection.status === 'completed' ? 'default' : 'secondary'}>
              {inspection.status?.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="report" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="report">Report</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
            </TabsList>

            <TabsContent value="report" className="space-y-4 mt-4">
              {inspection.report_pdf_url ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Report Uploaded</p>
                    <p className="text-sm text-green-700">
                      Uploaded on {new Date(inspection.updated_date).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <a
                    href={inspection.report_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-green-600 underline text-sm"
                  >
                    View Report
                  </a>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="font-medium mb-2">Upload Inspection Report</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a PDF containing your detailed inspection findings
                  </p>
                  <label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleReportUpload}
                      disabled={uploading}
                    />
                    <Button variant="outline" disabled={uploading} className="gap-2">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Choose Report
                    </Button>
                  </label>
                </div>
              )}
            </TabsContent>

            <TabsContent value="photos" className="space-y-4 mt-4">
              {inspection.photos && inspection.photos.length > 0 ? (
                <div>
                  <p className="text-sm font-medium mb-3">{inspection.photos.length} photo(s) uploaded</p>
                  <div className="grid grid-cols-3 gap-3">
                    {inspection.photos.map((photo, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={photo}
                          alt={`Inspection photo ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <a
                            href={photo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 bg-white rounded text-xs"
                          >
                            View
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No photos uploaded yet</p>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setShowPhotoUpload(true)}
              >
                <Upload className="w-4 h-4" />
                Add Photos
              </Button>

              <Dialog open={showPhotoUpload} onOpenChange={setShowPhotoUpload}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Photos</DialogTitle>
                  </DialogHeader>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Image className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="font-medium mb-2">Upload Inspection Photos</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select multiple photos to upload
                    </p>
                    <label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                      />
                      <Button variant="outline" disabled={uploading} className="gap-2">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Choose Photos
                      </Button>
                    </label>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>

          {inspection.status !== 'completed' && inspection.report_pdf_url && (
            <Button onClick={handleCompleteInspection} className="w-full bg-green-600 hover:bg-green-700">
              Complete Inspection & Notify Tenant
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}