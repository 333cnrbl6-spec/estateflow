import React, { useEffect } from 'react';
import { useBranding } from '@/lib/BrandingContext';

export default function ThemeWrapper({ children }) {
  const { branding } = useBranding();

  useEffect(() => {
    // Apply custom branding to CSS variables
    const root = document.documentElement;
    if (branding.primaryColor) {
      root.style.setProperty('--primary', branding.primaryColor.replace('hsl(', '').replace(')', ''));
    }
    if (branding.secondaryColor) {
      root.style.setProperty('--secondary', branding.secondaryColor.replace('hsl(', '').replace(')', ''));
    }
    if (branding.accentColor) {
      root.style.setProperty('--accent', branding.accentColor.replace('hsl(', '').replace(')', ''));
    }
    if (branding.fontFamily) {
      root.style.setProperty('--font-sans', branding.fontFamily);
    }
  }, [branding]);

  return <>{children}</>;
}