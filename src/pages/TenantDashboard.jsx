import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, 
  FileText, 
  Wrench, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Shield,
  ClipboardCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function TenantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [tenancy, setTenancy] = useState(null);
  const [property, setProperty] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [inspections, setInspections] = useState([]);
  
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: 'general',
    urgency: 'normal',
    photos: []
  });

  useEffect(() => {
    loadTenantData();
  }, [user]);

  const loadTenantData = async () => {
    if (!user?.email) {
      navigate('/');
      return;
    }

    try {
      setLoading(true);

      // Find tenant record by email
      const tenants = await base44.entities.Tenant.filter({ email: user.email });
      if (!tenants || tenants.length === 0) {
        toast.error('No tenancy record found');
        setLoading(false);
        return;
      }

      const tenantRecord = tenants[0];
      setTenancy(tenantRecord);

      // Get property details
      if (tenantRecord.property_id) {
        const prop = await base44.entities.Property.get(tenantRecord.property_id);
        setProperty(prop);
      }

      // Get certificates for this property
      if (tenantRecord.property_id) {
        const certs = await base44.entities.SafetyCertificate.filter({
          property_id: tenantRecord.property_id,
          status: 'valid'
        }, '-issue_date');
        setCertificates(certs || []);
      }

      // Get maintenance requests for this tenant
      const requests = await base44.entities.MaintenanceRequest.filter({
        tenant_id: tenantRecord.id
      }, '-created_date');
      setMaintenanceRequests(requests || []);

      // Get property inspections for this tenant
      const propertyInspections = await base44.entities.PropertyInspection.filter({
        tenant_id: tenantRecord.id
      }, '-completed_date');
      setInspections(propertyInspections || []);

    } catch (err) {
      console.error('Error loading tenant data:', err);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an image (JPG/PNG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewRequest(prev => ({
        ...prev,
        photos: [...prev.photos, { url: file_url, name: file.name }]
      }));
      toast.success('Photo uploaded');
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const submitMaintenanceRequest = async (e) => {
    e.preventDefault();
    
    if (!newRequest.title || !newRequest.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await base44.entities.MaintenanceRequest.create({
        title: newRequest.title,
        description: newRequest.description,
        category: newRequest.category,
        urgency: newRequest.urgency,
        tenant_id: tenancy.id,
        property_id: tenancy.property_id,
        unit_id: tenancy.unit_id,
        status: 'submitted',
        photos: newRequest.photos,
        reported_by: user.email,
        reported_date: new Date().toISOString()
      });

      toast.success('Maintenance request submitted successfully');
      setShowMaintenanceForm(false);
      setNewRequest({ title: '', description: '', category: 'general', urgency: 'normal', photos: [] });
      loadTenantData();
    } catch (err) {
      toast.error('Failed to submit request: ' + err.message);
    }
  };

  const downloadCertificate = async (cert) => {
    try {
      if (!cert.file_url) {
        toast.error('Certificate file not available');
        return;
      }

      // Create download link
      const link = document.createElement('a');
      link.href = cert.file_url;
      link.download = `${cert.certificate_type}_${property?.name || 'property'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Certificate downloaded');
    } catch (err) {
      toast.error('Download failed: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      submitted: { color: 'bg-blue-100 text-blue-800', label: 'Submitted' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
      scheduled: { color: 'bg-purple-100 text-purple-800', label: 'Scheduled' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };
    return badges[status] || badges.submitted;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </Card>
      </div>
    );
  }

  if (!tenancy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Tenancy Found</h2>
          <p className="text-muted-foreground mb-4">
            We couldn't find an active tenancy associated with your email.
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Tenancy Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {tenancy.full_name || user.full_name}</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Certificates
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="inspections" className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Inspections
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tenancy Details */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" />
                  My Home
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 py-2 border-b">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{property?.name || 'Property'}</p>
                      <p className="text-sm text-muted-foreground">
                        {property?.address_line_1}, {property?.city}, {property?.postcode}
                      </p>
                    </div>
                  </div>
                  {tenancy.unit && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Unit</span>
                      <span className="font-medium">{tenancy.unit.name || tenancy.unit.unit_number}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Tenancy Start</span>
                    <span className="font-medium">
                      {tenancy.tenancy_start_date ? new Date(tenancy.tenancy_start_date).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={tenancy.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {tenancy.status?.toUpperCase() || 'ACTIVE'}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Contact Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Contact Us
                </h3>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-3">Property Manager</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        <a href="mailto:support@premiso.app" className="text-primary hover:underline">
                          support@premiso.app
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        <a href="tel:08001234567" className="text-primary hover:underline">
                          0800 123 4567
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-red-800 mb-2">🚨 Emergency</h4>
                    <p className="text-xs text-red-700 mb-2">For urgent issues outside office hours:</p>
                    <p className="text-sm font-bold text-red-900">0800 999 8888</p>
                    <p className="text-xs text-red-600 mt-1">Gas leaks, electrical hazards, severe water leaks</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{certificates.length}</p>
                    <p className="text-sm text-muted-foreground">Certificates</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Wrench className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{maintenanceRequests.filter(r => r.status !== 'completed').length}</p>
                    <p className="text-sm text-muted-foreground">Active Requests</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{maintenanceRequests.filter(r => r.status === 'completed').length}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                My Property Certificates
              </h2>
            </div>

            {certificates.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No certificates available for download</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Contact your property manager if you need certificates
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert) => (
                  <Card key={cert.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{cert.certificate_type}</h3>
                        <p className="text-sm text-muted-foreground">
                          Issued: {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('en-GB') : 'N/A'}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Valid</Badge>
                    </div>
                    
                    {cert.expiry_date && (
                      <div className="mb-4 text-sm">
                        <span className="text-muted-foreground">Expires: </span>
                        <span className="font-medium">
                          {new Date(cert.expiry_date).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    )}

                    {cert.file_url && (
                      <Button 
                        onClick={() => downloadCertificate(cert)}
                        className="w-full"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Certificate
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Maintenance Requests</h2>
              <Button onClick={() => setShowMaintenanceForm(true)}>
                <Wrench className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </div>

            {showMaintenanceForm && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">New Maintenance Request</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowMaintenanceForm(false)}>✕</Button>
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
                    <Label>Upload Photos (Optional)</Label>
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
            )}

            {/* Maintenance Requests List */}
            <div className="space-y-4">
              {maintenanceRequests.length === 0 ? (
                <Card className="p-8 text-center">
                  <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No maintenance requests yet</p>
                </Card>
              ) : (
                maintenanceRequests.map((request) => (
                  <Card key={request.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{request.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Reported on {new Date(request.reported_date || request.created_date).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <Badge className={getStatusBadge(request.status).color}>
                        {getStatusBadge(request.status).label}
                      </Badge>
                    </div>
                    <p className="text-slate-700 mb-4">{request.description}</p>
                    {request.photos && request.photos.length > 0 && (
                      <div className="flex gap-2 flex-wrap mb-4">
                        {request.photos.map((photo, i) => (
                          <img key={i} src={photo.url} alt="Maintenance photo" className="w-24 h-24 object-cover rounded" />
                        ))}
                      </div>
                    )}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Category: <span className="capitalize">{request.category}</span></span>
                      <span>Urgency: <span className="capitalize">{request.urgency}</span></span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Inspections Tab */}
          <TabsContent value="inspections" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6 text-primary" />
                Property Inspection Reports
              </h2>
            </div>

            {inspections.length === 0 ? (
              <Card className="p-8 text-center">
                <ClipboardCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No inspection reports yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your property manager will create inspection reports during your tenancy
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {inspections.map((inspection) => (
                  <Card key={inspection.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {inspection.inspection_type.replace('_', ' ').toUpperCase()}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {inspection.completed_date 
                            ? `Completed: ${new Date(inspection.completed_date).toLocaleDateString('en-GB')}`
                            : `Scheduled: ${inspection.scheduled_date ? new Date(inspection.scheduled_date).toLocaleDateString('en-GB') : 'Not set'}`
                          }
                        </p>
                      </div>
                      <Badge className={
                        inspection.status === 'tenant_signed' ? 'bg-green-100 text-green-800' :
                        inspection.status === 'disputed' ? 'bg-red-100 text-red-800' :
                        inspection.status === 'pending_tenant_review' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {inspection.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      Inspector: {inspection.inspector_name}
                    </p>

                    {inspection.status === 'pending_tenant_review' ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <ClipboardCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-900 mb-2">Action Required</h4>
                            <p className="text-sm text-blue-800 mb-3">
                              Please review this inspection report and provide your agreement or note any disputes.
                            </p>
                            <Button size="sm">Review & Sign</Button>
                          </div>
                        </div>
                      </div>
                    ) : inspection.status === 'tenant_signed' ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-800">You have agreed to this report</span>
                        </div>
                        {inspection.tenant_signature_date && (
                          <p className="text-sm text-green-700 mt-2">
                            Signed on: {new Date(inspection.tenant_signature_date).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ) : inspection.status === 'disputed' ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-red-900 mb-2">Dispute Submitted</h4>
                            <p className="text-sm text-red-800">
                              Your dispute has been recorded. The property manager will review your comments.
                            </p>
                            {inspection.tenant_comments && (
                              <div className="mt-3 p-3 bg-white rounded border">
                                <p className="text-xs font-medium text-red-900 mb-1">Your comments:</p>
                                <p className="text-sm text-red-800">{inspection.tenant_comments}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}