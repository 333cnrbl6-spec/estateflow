import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, 
  Wrench, 
  Shield, 
  Upload, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Calendar,
  PoundSterling,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function TenantPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Tenancy data
  const [tenancy, setTenancy] = useState(null);
  const [property, setProperty] = useState(null);
  const [landlord, setLandlord] = useState(null);
  
  // Maintenance
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: 'general',
    urgency: 'normal',
    photos: []
  });
  const [uploading, setUploading] = useState(false);
  
  // Deposit protection
  const [deposit, setDeposit] = useState(null);
  const [depositStatus, setDepositStatus] = useState('unknown');

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

      // Find tenant record
      const tenants = await base44.entities.Tenant.filter({ email: user.email });
      if (!tenants || tenants.length === 0) {
        toast.error('No tenancy record found');
        return;
      }

      const tenantRecord = tenants[0];
      
      // Get property details
      if (tenantRecord.property_id) {
        const prop = await base44.entities.Property.get(tenantRecord.property_id);
        setProperty(prop);
      }

      // Get unit details if available
      if (tenantRecord.unit_id) {
        const unit = await base44.entities.Unit.get(tenantRecord.unit_id);
        tenantRecord.unit = unit;
      }

      setTenancy(tenantRecord);

      // Get maintenance requests for this tenant
      const requests = await base44.entities.MaintenanceRequest.filter({
        tenant_id: tenantRecord.id
      }, '-created_date');
      setMaintenanceRequests(requests || []);

      // Get deposit protection info
      const deposits = await base44.entities.DepositProtection.filter({
        tenant_id: tenantRecord.id
      });
      if (deposits && deposits.length > 0) {
        const depositData = deposits[0];
        setDeposit(depositData);
        setDepositStatus(depositData.status || 'unknown');
      }

    } catch (err) {
      console.error('Error loading tenant data:', err);
      toast.error('Failed to load tenancy details');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an image file (JPG/PNG)');
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
      loadTenantData(); // Refresh list
    } catch (err) {
      toast.error('Failed to submit request: ' + err.message);
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

  const getDepositStatusBadge = (status) => {
    const badges = {
      not_protected: { color: 'bg-red-100 text-red-800', label: 'Not Protected', icon: AlertCircle },
      protected: { color: 'bg-yellow-100 text-yellow-800', label: 'Protected', icon: CheckCircle },
      prescribed_pending: { color: 'bg-orange-100 text-orange-800', label: 'Prescribed Info Pending', icon: AlertCircle },
      fully_compliant: { color: 'bg-green-100 text-green-800', label: 'Fully Compliant', icon: CheckCircle },
      return_pending: { color: 'bg-blue-100 text-blue-800', label: 'Return Pending', icon: Clock },
      returned: { color: 'bg-green-100 text-green-800', label: 'Returned', icon: CheckCircle },
      disputed: { color: 'bg-red-100 text-red-800', label: 'Disputed', icon: AlertCircle },
      non_compliant: { color: 'bg-red-100 text-red-800', label: 'Non-Compliant', icon: AlertCircle },
      unknown: { color: 'bg-gray-100 text-gray-800', label: 'Unknown', icon: AlertCircle }
    };
    return badges[status] || badges.unknown;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your tenancy details...</p>
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
            We couldn't find an active tenancy associated with your email address.
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Tenant Portal</h1>
          <p className="text-muted-foreground">Welcome back, {tenancy.full_name || user.full_name}</p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="deposit" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Deposit Protection
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tenancy Details */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Tenancy Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Property</span>
                    <span className="font-medium">{property?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Address</span>
                    <span className="font-medium text-right">
                      {property?.address_line_1 || 'N/A'}<br/>
                      {property?.city && <>{property.city}, </>}
                      {property?.postcode || ''}
                    </span>
                  </div>
                  {tenancy.unit && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Unit</span>
                      <span className="font-medium">{tenancy.unit.name || tenancy.unit.unit_number}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Tenancy Type</span>
                    <span className="font-medium capitalize">{tenancy.tenancy_type || 'Assured Shorthold'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Start Date</span>
                    <span className="font-medium">
                      {tenancy.tenancy_start_date ? new Date(tenancy.tenancy_start_date).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">End Date</span>
                    <span className="font-medium">
                      {tenancy.tenancy_end_date ? new Date(tenancy.tenancy_end_date).toLocaleDateString('en-GB') : 'Periodic'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={tenancy.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {tenancy.status?.replace('_', ' ').toUpperCase() || 'ACTIVE'}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Landlord/Agent Contact */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-1">Property Manager</p>
                    <p className="text-sm text-muted-foreground">Premiso Property Management</p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-primary" />
                        <a href="mailto:support@premiso.app" className="text-primary hover:underline">
                          support@premiso.app
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-primary" />
                        <a href="tel:08001234567" className="text-primary hover:underline">
                          0800 123 4567
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Emergency Contacts</h4>
                    <p className="text-xs text-blue-700 mb-2">For urgent issues outside office hours:</p>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        Emergency: <strong>0800 999 8888</strong>
                      </p>
                      <p className="text-xs text-muted-foreground">Gas leaks, electrical hazards, severe water leaks</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => setActiveTab('maintenance')}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Wrench className="w-4 h-4" />
                  Report Maintenance Issue
                </Button>
                <Button 
                  onClick={() => setActiveTab('deposit')}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Shield className="w-4 h-4" />
                  Check Deposit Status
                </Button>
                <Button 
                  onClick={() => navigate('/tenant-payments')}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <PoundSterling className="w-4 h-4" />
                  View Payment History
                </Button>
              </div>
            </Card>
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
                  <Button variant="ghost" size="sm" onClick={() => setShowMaintenanceForm(false)}>
                    ✕
                  </Button>
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
                              ✕
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
                        <p className="text-sm text-muted-foreground mt-1">
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
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Category: <span className="capitalize">{request.category}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Urgency: <span className="capitalize">{request.urgency}</span>
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Deposit Protection Tab */}
          <TabsContent value="deposit" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Shield className="w-6 h-6 text-primary" />
                  Deposit Protection Status
                </h2>
                {deposit && (
                  <Badge className={getDepositStatusBadge(depositStatus).color}>
                    {getDepositStatusBadge(depositStatus).label}
                  </Badge>
                )}
              </div>

              {!deposit ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <p className="text-muted-foreground">No deposit protection record found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please contact your property manager for more information
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">Deposit Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-medium">£{(deposit.deposit_amount / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Scheme</span>
                          <span className="font-medium capitalize">{deposit.scheme_type?.replace('_', ' ') || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Scheme Name</span>
                          <span className="font-medium">{deposit.scheme_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reference</span>
                          <span className="font-medium">{deposit.scheme_reference || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Protected On</span>
                          <span className="font-medium">
                            {deposit.protection_date ? new Date(deposit.protection_date).toLocaleDateString('en-GB') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">Prescribed Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Served On</span>
                          <span className="font-medium">
                            {deposit.prescribed_information_served_date 
                              ? new Date(deposit.prescribed_information_served_date).toLocaleDateString('en-GB')
                              : 'Not served'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Method</span>
                          <span className="font-medium capitalize">{deposit.prescribed_info_method || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Compliant</span>
                          <span className={`font-medium ${deposit.prescribed_info_compliant ? 'text-green-600' : 'text-red-600'}`}>
                            {deposit.prescribed_info_compliant ? '✓ Yes' : '✗ No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Status */}
                  <div className={`p-4 rounded-lg border-2 ${
                    depositStatus === 'fully_compliant' ? 'bg-green-50 border-green-200' :
                    depositStatus === 'non_compliant' ? 'bg-red-50 border-red-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      {depositStatus === 'fully_compliant' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : depositStatus === 'non_compliant' ? (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      )}
                      Legal Compliance Status
                    </h3>
                    <p className={`text-sm ${
                      depositStatus === 'fully_compliant' ? 'text-green-700' :
                      depositStatus === 'non_compliant' ? 'text-red-700' :
                      'text-yellow-700'
                    }`}>
                      {depositStatus === 'fully_compliant' && 'Your deposit is fully protected and compliant with the Housing Act 2004.'}
                      {depositStatus === 'non_compliant' && 'Your deposit protection is non-compliant. Please contact your landlord immediately.'}
                      {depositStatus !== 'fully_compliant' && depositStatus !== 'non_compliant' && 'Your deposit protection is pending completion of required steps.'}
                    </p>
                  </div>

                  {/* Documents */}
                  {(deposit.prescribed_info_content_url || deposit.prescribed_info_proof || deposit.certificate_url) && (
                    <div>
                      <h3 className="font-semibold mb-3">Documents</h3>
                      <div className="space-y-2">
                        {deposit.prescribed_info_content_url && (
                          <Button variant="outline" className="w-full justify-start" asChild>
                            <a href={deposit.prescribed_info_content_url} target="_blank" rel="noopener noreferrer">
                              <FileText className="w-4 h-4 mr-2" />
                              View Prescribed Information
                            </a>
                          </Button>
                        )}
                        {deposit.certificate_url && (
                          <Button variant="outline" className="w-full justify-start" asChild>
                            <a href={deposit.certificate_url} target="_blank" rel="noopener noreferrer">
                              <FileText className="w-4 h-4 mr-2" />
                              View Deposit Certificate
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Return Information */}
                  {deposit.return_amount && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Deposit Return</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Return Amount</span>
                          <span className="font-medium">£{(deposit.return_amount / 100).toFixed(2)}</span>
                        </div>
                        {deposit.return_date && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Returned On</span>
                            <span className="font-medium">{new Date(deposit.return_date).toLocaleDateString('en-GB')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}