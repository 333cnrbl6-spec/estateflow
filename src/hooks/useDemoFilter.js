import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useDemoFilter() {
  const [demoCompanyId, setDemoCompanyId] = useState(null);
  const [propertyIds, setPropertyIds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolved, setResolved] = useState(false); // eslint-disable-line

  useEffect(() => {
    const loadDemoContext = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.current_demo_company_id) {
          setDemoCompanyId(user.current_demo_company_id);
          // Pre-fetch property IDs for this company
          const props = await base44.entities.Property.filter({ owning_company: user.current_demo_company_id });
          setPropertyIds(props.map(p => p.id));
        }
      setResolved(true);
      } catch (err) {
      console.error('Failed to load demo context:', err);
      } finally {
      setLoading(false);
      }
    };
    loadDemoContext();
  }, []);

  return { demoCompanyId, propertyIds, loading, resolved };
}