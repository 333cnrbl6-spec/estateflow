import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Returns the active demo company ID and associated property IDs.
 * Uses React Query so it's cache-aware, reactive, and consistent
 * with the rest of the application's data fetching strategy.
 */
export function useDemoFilter() {
  const { data, isLoading } = useQuery({
    queryKey: ['demoFilter'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const demoCompanyId = user?.current_demo_company_id || null;
      if (!demoCompanyId) return { demoCompanyId: null, propertyIds: null };

      const props = await base44.entities.Property.filter({ owning_company: demoCompanyId });
      const propertyIds = props.map(p => p.id);
      return { demoCompanyId, propertyIds };
    },
    staleTime: 30_000, // treat as fresh for 30s to avoid repeated refetches
  });

  return {
    demoCompanyId: data?.demoCompanyId ?? null,
    propertyIds: data?.propertyIds ?? null,
    loading: isLoading,
    resolved: !isLoading,
  };
}