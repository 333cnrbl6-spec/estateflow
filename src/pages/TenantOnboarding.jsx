import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import TenantOnboardingWizard from '@/components/tenant/TenantOnboardingWizard';

export default function TenantOnboarding() {
  const { user } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    loadTenantData();
  }, [user]);

  const loadTenantData = async () => {
    if (!user?.email) return;

    try {
      const tenants = await base44.entities.Tenant.filter({ email: user.email });
      if (tenants?.length > 0) {
        setTenant(tenants[0]);
      }
    } catch (err) {
      console.error('Error loading tenant:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your onboarding...</p>
        </Card>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Tenancy Found</h2>
          <p className="text-muted-foreground">
            We couldn't find a tenancy associated with your account. Please contact your property manager.
          </p>
        </Card>
      </div>
    );
  }

  if (onboardingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Onboarding Complete!</h2>
          <p className="text-muted-foreground mb-4">
            Your welcome pack has been created and sent to your email. You can now access your tenant portal to manage your tenancy.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <TenantOnboardingWizard
        tenantId={tenant.id}
        propertyId={tenant.property_id}
        onComplete={() => setOnboardingComplete(true)}
      />
    </div>
  );
}