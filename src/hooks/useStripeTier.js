import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useStripeTier() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const tier = user?.stripe_subscription_tier || 'free'; // free, starter, professional, enterprise
  
  const canAccessAIDraft = ['professional', 'enterprise'].includes(tier);
  const canExportPDF = ['professional', 'enterprise'].includes(tier);
  const maxProperties = tier === 'starter' ? 3 : tier === 'professional' ? 999 : 999;
  
  return { tier, user, canAccessAIDraft, canExportPDF, maxProperties };
}