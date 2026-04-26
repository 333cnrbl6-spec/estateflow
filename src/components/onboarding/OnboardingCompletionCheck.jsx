import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OnboardingCompletionCheck() {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = React.useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties-onboarding'],
    queryFn: () => base44.entities.Property.list(),
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants-onboarding'],
    queryFn: () => base44.entities.Tenant.list(),
  });

  const needsOnboarding = !user?.onboarding_complete && properties.length === 0;

  useEffect(() => {
    if (needsOnboarding) {
      setShowDialog(true);
    }
  }, [needsOnboarding]);

  const handleCompleteOnboarding = async () => {
    try {
      // Check if basic setup done
      if (properties.length > 0 && tenants.length > 0) {
        await base44.auth.updateMe({ onboarding_complete: true });
        setShowDialog(false);
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  if (!needsOnboarding) return null;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Welcome to Premiso
          </DialogTitle>
          <DialogDescription>
            Let's get your portfolio set up in 3 quick steps
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                properties.length > 0 ? 'bg-green-600' : 'bg-slate-300'
              }`}>
                {properties.length > 0 ? '✓' : '1'}
              </div>
              <div>
                <p className="text-sm font-medium">Add your first property</p>
                <p className="text-xs text-muted-foreground">{properties.length > 0 ? 'Complete' : 'Required'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                tenants.length > 0 ? 'bg-green-600' : 'bg-slate-300'
              }`}>
                {tenants.length > 0 ? '✓' : '2'}
              </div>
              <div>
                <p className="text-sm font-medium">Add your first tenant</p>
                <p className="text-xs text-muted-foreground">{tenants.length > 0 ? 'Complete' : 'Required'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-slate-300">
                3
              </div>
              <div>
                <p className="text-sm font-medium">Set rent collection day</p>
                <p className="text-xs text-muted-foreground">Optional</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {properties.length === 0 ? (
            <Button 
              onClick={() => navigate('/properties/add')} 
              className="flex-1 gap-2"
            >
              Add Property <ArrowRight className="w-4 h-4" />
            </Button>
          ) : tenants.length === 0 ? (
            <Button 
              onClick={() => navigate('/tenants')}
              className="flex-1 gap-2"
            >
              Add Tenant <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleCompleteOnboarding}
              className="flex-1 gap-2"
            >
              Complete Setup <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}