import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Download, Trash2, AlertTriangle, Check, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const DOC_TYPES_MAP = {
  gas_safety_certificate: { label: '🔥 Gas Safety', color: 'bg-red-100 text-red-800' },
  epc: { label: '⚡ EPC', color: 'bg-blue-100 text-blue-800' },
  electrical_inspection: { label: '🔌 Electrical', color: 'bg-yellow-100 text-yellow-800' },
  boiler_service: { label: '🛠️ Boiler Service', color: 'bg-orange-100 text-orange-800' },
  fire_safety: { label: '🚒 Fire Safety', color: 'bg-red-100 text-red-800' },
  hmo_license: { label: '🏠 HMO License', color: 'bg-green-100 text-green-800' },
  building_regulations: { label: '📋 Building Regs', color: 'bg-purple-100 text-purple-800' },
  insurance: { label: '📄 Insurance', color: 'bg-indigo-100 text-indigo-800' },
  property_deed: { label: '📑 Deed', color: 'bg-gray-100 text-gray-800' },
  other: { label: '📂 Other', color: 'bg-gray-100 text-gray-800' }
};

export default function DocumentListPanel({ propertyId, refreshTrigger }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [propertyId, refreshTrigger]);

  const loadDocuments = async () => {
    try {
      const data = await base44.entities.Document.filter({ property_id: propertyId });
      setDocuments(data || []);
    } catch (err) {
      toast.error('Error loading documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!confirm('Delete this document?')) return;
    
    try {
      await base44.entities.Document.delete(documentId);
      toast.success('Document deleted');
      loadDocuments();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;

    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring_soon', label: `Expires in ${daysUntilExpiry} days`, color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    } else if (daysUntilExpiry <= 90) {
      return { status: 'expiring', label: `Expires in ${daysUntilExpiry} days`, color: 'bg-orange-100 text-orange-800', icon: Calendar };
    } else {
      return { status: 'valid', label: `Valid until ${expiry.toLocaleDateString('en-GB')}`, color: 'bg-green-100 text-green-800', icon: Check };
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading documents...</div>;
  }

  if (documents.length === 0) {
    return (
      <Card className="text-center py-12">
        <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
        <p className="text-sm text-muted-foreground">Upload compliance certificates to get started</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map(doc => {
        const typeInfo = DOC_TYPES_MAP[doc.document_type] || DOC_TYPES_MAP.other;
        const expiryStatus = getExpiryStatus(doc.expiry_date);
        const ExpiryIcon = expiryStatus?.icon;

        return (
          <Card key={doc.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                    {expiryStatus && (
                      <Badge className={expiryStatus.color} variant="outline">
                        {ExpiryIcon && <ExpiryIcon className="w-3 h-3 mr-1 inline" />}
                        {expiryStatus.label}
                      </Badge>
                    )}
                  </div>

                  <p className="font-medium text-sm mb-1">{doc.file_name}</p>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Uploaded: {new Date(doc.uploaded_date).toLocaleDateString('en-GB')}</p>
                    {doc.expiry_date && (
                      <p>Expiry: {new Date(doc.expiry_date).toLocaleDateString('en-GB')}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="gap-1">
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}