import { useEffect } from 'react';
import { rbmBrand } from '@/lib/brandConfig';

export const useRBMBranding = (isRBMUser = false) => {
  useEffect(() => {
    if (isRBMUser) {
      // Apply RBM branding
      rbmBrand.applyTheme();
      
      // Add custom favicon and title
      document.title = `${rbmBrand.name} - ${rbmBrand.tagline}`;
      
      return () => {
        // Reset to default theme on unmount
        const root = document.documentElement;
        root.style.setProperty('--primary', '0 0% 0%');
        root.style.setProperty('--primary-foreground', '0 0% 100%');
        root.style.setProperty('--secondary', '0 0% 90%');
        root.style.setProperty('--background', '0 0% 98%');
      };
    }
  }, [isRBMUser]);
};

export default useRBMBranding;