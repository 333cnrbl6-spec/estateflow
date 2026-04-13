import { useEffect } from 'react';
import { toast } from 'sonner';

export function useQueryError(query, name) {
  useEffect(() => {
    if (query.isError) {
      toast.error(`Failed to load ${name}`, {
        description: query.error?.message || 'Please try again',
        duration: 4000
      });
    }
  }, [query.isError, query.error, name]);
}