import React, { useEffect } from 'react';
import { useBranding } from '@/lib/BrandingContext';

export default function ThemeWrapper({ children }) {
  const { branding } = useBranding();

  useEffect(() => {
    // Apply custom branding to CSS variables (only if not defaults)
    const root = document.documentElement;
    if (branding.primaryColor && branding.primaryColor !== 'hsl(221, 65%, 28%)') {
      const normalized = branding.primaryColor.replace(/[()]/g, '').replace('hsl', '').trim();
      root.style.setProperty('--primary', normalized);
    }
    if (branding.secondaryColor && branding.secondaryColor !== 'hsl(43, 74%, 49%)') {
      const normalized = branding.secondaryColor.replace(/[()]/g, '').replace('hsl', '').trim();
      root.style.setProperty('--secondary', normalized);
    }
    if (branding.accentColor && branding.accentColor !== 'hsl(173, 58%, 39%)') {
      const normalized = branding.accentColor.replace(/[()]/g, '').replace('hsl', '').trim();
      root.style.setProperty('--accent', normalized);
    }
    if (branding.fontFamily && branding.fontFamily !== "'Inter', sans-serif") {
      root.style.setProperty('--font-sans', branding.fontFamily);
    }
  }, [branding]);

  return <>{children}</>;
}