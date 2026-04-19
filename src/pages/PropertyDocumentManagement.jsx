import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import DocumentUploadPanel from '@/components/property-documents/DocumentUploadPanel';
import DocumentListPanel from '@/components/property-documents/DocumentListPanel';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function PropertyDocumentManagement() {
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (selectedPropertyId) {
      loadDocuments();
    }
  }, [selectedPropertyId]);

  const loadProperties = async () => {
    try {
      const data = await base44.entities.Property.list();
      setProperties(data || []);
      if (data?.length > 0) {
        setSelectedPropertyId(data[0].id);
      }
    } catch (err) {
      console.error('Error loading properties');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const data = await base44.entities.Document.filter({ property_id: selectedPropertyId });
      setDocuments(data || []);
    } catch (err) {
      console.error('Error loading documents');
    }
  };

  const getDocumentStats = () => {
    const today = new Date();
    let expired = 0, expiringSoon = 0;

    documents.forEach(doc => {
      if (doc.expiry_date) {
        const expiry = new Date(doc.expiry_date);
        const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) expired++;
        else if (daysUntilExpiry <= 30) expiringSoon++;
      }
    });

    return { expired, expiringSoon, total: documents.length };
  };

  const stats = getDocumentStats();

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Property Document Management</h1>
        <p className="text-muted-foreground">Store and track compliance certificates and documents</p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Select Property</label>
          <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
            <SelectTrigger>
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Documents</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Expiring Soon</p>
                <p className="text-3xl font-bold text-orange-600">{stats.expiringSoon}</p>
                <p className="text-xs text-muted-foreground mt-1">Within 30 days</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Expired</p>
                <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
                <p className="text-xs text-muted-foreground mt-1">Action required</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedPropertyId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <DocumentUploadPanel 
              propertyId={selectedPropertyId}
              onSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentListPanel 
                  propertyId={selectedPropertyId}
                  refreshTrigger={refreshTrigger}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}