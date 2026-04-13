// Dynamic Brand Configuration
// Applied automatically when a demo is active with brand data

/**
 * Convert a hex colour to HSL CSS variable format "H S% L%"
 */
function hexToHsl(hex) {
  if (!hex || !hex.startsWith('#')) return null;
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
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
 * Apply a demo brand object (from user.demo_brand) to the CSS variables.
 * brand = { primary_color, secondary_color, accent_color, font_hint, ... }
 */
export function applyDemoBrand(brand) {
  if (!brand) return;
  const root = document.documentElement;

  const primary = hexToHsl(brand.primary_color);
  const secondary = hexToHsl(brand.secondary_color);
  const accent = hexToHsl(brand.accent_color);

  if (primary) {
    root.style.setProperty('--primary', primary);
    root.style.setProperty('--sidebar-background', primary);
    root.style.setProperty('--ring', primary);
    // Slightly lighter variant for sidebar accent
    root.style.setProperty('--sidebar-accent', secondary || primary);
  }
  if (accent) {
    root.style.setProperty('--sidebar-primary', accent);
  }

  // Inject brand font if specified
  if (brand.font_hint && brand.font_hint !== 'Inter') {
    const fontName = brand.font_hint.trim();
    // Inject Google Fonts link if not already present
    const linkId = 'demo-brand-font';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }
    document.body.style.setProperty('--font-sans', `'${fontName}', sans-serif`);
  }

  // Store brand for use in header/sidebar components
  window.__demoBrand = brand;
  document.documentElement.setAttribute('data-demo-brand', brand.company_name || 'demo');
}

export function clearDemoBrand() {
  const root = document.documentElement;
  root.style.removeProperty('--primary');
  root.style.removeProperty('--sidebar-background');
  root.style.removeProperty('--ring');
  root.style.removeProperty('--sidebar-accent');
  root.style.removeProperty('--sidebar-primary');
  document.body.style.removeProperty('--font-sans');
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
  }),
};

export default rbmBrand;