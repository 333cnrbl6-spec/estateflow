// Dynamic Brand Configuration
// Applied automatically when a demo is active with brand data

/**
 * Convert hex to HSL string "H S% L%" for CSS variables
 */
function hexToHsl(hex) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return null;
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;
  let r = parseInt(clean.slice(0, 2), 16) / 255;
  let g = parseInt(clean.slice(2, 4), 16) / 255;
  let b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Compute relative luminance from hex — used to pick white/black foreground
 */
function getLuminance(hex) {
  if (!hex || !hex.startsWith('#')) return 0.5;
  const clean = hex.replace('#', '');
  const toLinear = (c) => {
    const v = parseInt(c, 16) / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const r = toLinear(clean.slice(0, 2));
  const g = toLinear(clean.slice(2, 4));
  const b = toLinear(clean.slice(4, 6));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function isDark(hex) {
  return getLuminance(hex) < 0.35;
}

/**
 * Slightly lighten an HSL string for sidebar accent
 */
function lightenHsl(hsl, amount = 8) {
  if (!hsl) return hsl;
  const match = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!match) return hsl;
  const l = Math.min(100, parseInt(match[3]) + amount);
  return `${match[1]} ${match[2]}% ${l}%`;
}

/**
 * Apply a demo brand object (from user.demo_brand) to the CSS variables.
 * brand = { primary_color, secondary_color, accent_color, logo_url, tagline, font_hint, company_name }
 */
export function applyDemoBrand(brand) {
  if (!brand) return;
  const root = document.documentElement;

  const primaryHsl = hexToHsl(brand.primary_color);
  const secondaryHsl = hexToHsl(brand.secondary_color);
  const accentHsl = hexToHsl(brand.accent_color);

  if (primaryHsl) {
    const fgHsl = isDark(brand.primary_color) ? '0 0% 100%' : '0 0% 5%';
    // Main app primary
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--primary-foreground', fgHsl);
    root.style.setProperty('--ring', primaryHsl);
    // Sidebar background uses primary
    root.style.setProperty('--sidebar-background', primaryHsl);
    root.style.setProperty('--sidebar-foreground', fgHsl);
    root.style.setProperty('--sidebar-border', lightenHsl(primaryHsl, 5));
    // Sidebar accent slightly lighter
    const accentBase = secondaryHsl || lightenHsl(primaryHsl, 10);
    root.style.setProperty('--sidebar-accent', accentBase);
    root.style.setProperty('--sidebar-accent-foreground', fgHsl);
  }

  if (accentHsl) {
    root.style.setProperty('--sidebar-primary', accentHsl);
    const accentFg = isDark(brand.accent_color) ? '0 0% 100%' : '0 0% 5%';
    root.style.setProperty('--sidebar-primary-foreground', accentFg);
  }

  if (secondaryHsl) {
    root.style.setProperty('--secondary', secondaryHsl);
  }

  // Inject brand font via Google Fonts if specified and not already the default
  if (brand.font_hint && !['inter', 'arial', 'helvetica'].includes(brand.font_hint.toLowerCase())) {
    const fontName = brand.font_hint.trim();
    const linkId = 'demo-brand-font';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }
    root.style.setProperty('--font-sans', `'${fontName}', sans-serif`);
  }

  // Expose brand globally for UI components (Sidebar, Header)
  window.__demoBrand = brand;
  document.documentElement.setAttribute('data-demo-brand', brand.company_name || 'demo');
}

export function clearDemoBrand() {
  const root = document.documentElement;
  const vars = [
    '--primary', '--primary-foreground', '--ring',
    '--sidebar-background', '--sidebar-foreground', '--sidebar-border',
    '--sidebar-accent', '--sidebar-accent-foreground',
    '--sidebar-primary', '--sidebar-primary-foreground',
    '--secondary', '--font-sans'
  ];
  vars.forEach(v => root.style.removeProperty(v));
  document.documentElement.removeAttribute('data-demo-brand');
  window.__demoBrand = null;
  const link = document.getElementById('demo-brand-font');
  if (link) link.remove();
}

export function getCurrentDemoBrand() {
  return window.__demoBrand || null;
}

// Legacy RBM brand kept for backward compatibility
export const rbmBrand = {
  name: 'RBM (North West) Limited',
  tagline: 'Proactive & transparent block management',
  applyTheme: () => applyDemoBrand({
    primary_color: '#1a3a52',
    secondary_color: '#2d5a8c',
    accent_color: '#f0ad4e',
    company_name: 'RBM (North West) Limited',
    tagline: 'Proactive & transparent block management',
  }),
};

export default rbmBrand;