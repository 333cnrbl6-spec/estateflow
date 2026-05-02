import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useFeatureFlag(flagName) {
  const { data: enabled = false, isLoading } = useQuery({
    queryKey: ['feature-flag', flagName],
    queryFn: async () => {
      const response = await base44.functions.invoke('checkFeatureFlag', {
        flag_name: flagName
      });
      return response.data?.enabled || false;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  return { enabled, isLoading };
}