import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { applyDemoBrand, clearDemoBrand } from '@/lib/brandConfig';

export const RBMBrandingProvider = ({ children }) => {
  useEffect(() => {
    const apply = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.demo_brand) {
          applyDemoBrand(user.demo_brand);
        } else {
          clearDemoBrand();
        }
      } catch (e) {
        // not authenticated
      }
    };
    apply();
  }, []);

  return children;
};

export default RBMBrandingProvider;