import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { rbmBrand } from '@/lib/brandConfig';

export const RBMBrandingProvider = ({ children }) => {
  useEffect(() => {
    const applyRBMBrandingIfNeeded = async () => {
      try {
        const user = await base44.auth.me();
        
        // Check if this is RBM demo user
        const isRBMUser = user?.email?.includes('rbm') || 
                          user?.full_name?.includes('RBM') ||
                          localStorage.getItem('rbm_demo_user') === 'true';
        
        if (isRBMUser) {
          // Apply RBM brand theme
          rbmBrand.applyTheme();
          
          // Mark as RBM user in session
          localStorage.setItem('rbm_demo_user', 'true');
          
          // Update page metadata
          document.documentElement.setAttribute('data-brand', 'rbm');
          document.body.classList.add('rbm-branded');
        } else {
          // Clear RBM branding if not RBM user
          localStorage.removeItem('rbm_demo_user');
          document.documentElement.removeAttribute('data-brand');
          document.body.classList.remove('rbm-branded');
        }
      } catch (error) {
        console.log('Branding detection skipped (not authenticated)');
      }
    };

    applyRBMBrandingIfNeeded();
  }, []);

  return children;
};

export default RBMBrandingProvider;