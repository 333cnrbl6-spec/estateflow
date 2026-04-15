import React, { createContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export const BrandingContext = createContext();

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState({
    logo: null,
    logoUrl: null,
    primaryColor: 'hsl(221, 65%, 28%)',
    secondaryColor: 'hsl(43, 74%, 49%)',
    accentColor: 'hsl(173, 58%, 39%)',
    fontFamily: "'Inter', sans-serif",
    tagline: 'Scaled Legal Protection',
    graphicsUrl: null,
    mode: 'light', // light | dark
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      const user = await base44.auth.me();
      if (user?.branding) {
        setBranding(prev => ({ ...prev, ...user.branding }));
      }
    } catch (err) {
      console.log('No custom branding set, using defaults');
    } finally {
      setLoading(false);
    }
  };

  const updateBranding = async (newBranding) => {
    try {
      await base44.auth.updateMe({ branding: newBranding });
      setBranding(prev => ({ ...prev, ...newBranding }));
    } catch (err) {
      console.error('Failed to save branding:', err);
    }
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, loading }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = React.useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be used within BrandingProvider');
  return ctx;
}