import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles } from 'lucide-react';
import { useBranding } from '@/lib/BrandingContext';

const PRESET_PALETTES = [
  { name: 'Professional', primary: 'hsl(221, 65%, 28%)', secondary: 'hsl(43, 74%, 49%)', accent: 'hsl(173, 58%, 39%)' },
  { name: 'Modern Blue', primary: 'hsl(217, 91%, 60%)', secondary: 'hsl(265, 95%, 64%)', accent: 'hsl(0, 0%, 100%)' },
  { name: 'Warm Sunset', primary: 'hsl(3, 87%, 60%)', secondary: 'hsl(39, 100%, 50%)', accent: 'hsl(15, 100%, 70%)' },
  { name: 'Forest', primary: 'hsl(140, 74%, 35%)', secondary: 'hsl(160, 60%, 45%)', accent: 'hsl(200, 90%, 70%)' },
];

const FONT_OPTIONS = [
  { name: 'Inter', family: "'Inter', sans-serif" },
  { name: 'Playfair Display', family: "'Playfair Display', serif" },
  { name: 'System', family: 'system-ui, -apple-system' },
];

export default function BrandingCustomizer() {
  const { branding, updateBranding } = useBranding();
  const [formData, setFormData] = useState(branding);
  const [gleaning, setGleaning] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const handleExtractBranding = async () => {
    setGleaning(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract branding identity from the company. Suggest:
        1. Primary color (hex or hsl)
        2. Secondary color
        3. Accent color
        4. Font style (modern, professional, creative)
        5. Tagline or brand statement
        Return as JSON with keys: primary_color, secondary_color, accent_color, font_recommendation, tagline`,
        response_json_schema: {
          type: 'object',
          properties: {
            primary_color: { type: 'string' },
            secondary_color: { type: 'string' },
            accent_color: { type: 'string' },
            font_recommendation: { type: 'string' },
            tagline: { type: 'string' },
          },
        },
      });

      if (response.data) {
        setFormData(prev => ({
          ...prev,
          primaryColor: response.data.primary_color || prev.primaryColor,
          secondaryColor: response.data.secondary_color || prev.secondaryColor,
          accentColor: response.data.accent_color || prev.accentColor,
          tagline: response.data.tagline || prev.tagline,
        }));
      }
    } catch (err) {
      console.error('Branding extraction failed:', err);
    } finally {
      setGleaning(false);
    }
  };

  const handleSave = async () => {
    await updateBranding(formData);
    setSavedMessage('✓ Branding saved!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Color Palette */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3">Color Scheme</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {PRESET_PALETTES.map(p => (
            <button
              key={p.name}
              onClick={() => setFormData(prev => ({ ...prev, primaryColor: p.primary, secondaryColor: p.secondary, accentColor: p.accent }))}
              className="p-3 rounded-lg border-2 border-slate-200 hover:border-slate-400 transition-all"
            >
              <div className="flex gap-1 mb-2">
                <div className="w-6 h-6 rounded" style={{ background: p.primary }}></div>
                <div className="w-6 h-6 rounded" style={{ background: p.secondary }}></div>
                <div className="w-6 h-6 rounded" style={{ background: p.accent }}></div>
              </div>
              <p className="text-xs font-medium text-slate-700">{p.name}</p>
            </button>
          ))}
        </div>

        {/* Custom colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Primary</label>
            <Input
              type="color"
              value={formData.primaryColor}
              onChange={e => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
              className="h-10"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Secondary</label>
            <Input
              type="color"
              value={formData.secondaryColor}
              onChange={e => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
              className="h-10"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Accent</label>
            <Input
              type="color"
              value={formData.accentColor}
              onChange={e => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
              className="h-10"
            />
          </div>
        </div>
      </div>

      {/* Font */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3">Typography</h3>
        <div className="grid grid-cols-3 gap-3">
          {FONT_OPTIONS.map(f => (
            <button
              key={f.name}
              onClick={() => setFormData(prev => ({ ...prev, fontFamily: f.family }))}
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.fontFamily === f.family ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-400'
              }`}
              style={{ fontFamily: f.family }}
            >
              <p className="text-sm font-semibold">{f.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Tagline */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3">Tagline</h3>
        <Input
          value={formData.tagline}
          onChange={e => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
          placeholder="e.g., Scaled Legal Protection"
        />
      </div>

      {/* AI Gleaner */}
      <div>
        <Button
          onClick={handleExtractBranding}
          disabled={gleaning}
          variant="outline"
          className="w-full gap-2"
        >
          {gleaning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing your brand...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Auto-detect from company info
            </>
          )}
        </Button>
      </div>

      {/* Save */}
      <div className="flex gap-3">
        <Button onClick={handleSave} className="flex-1">
          Save Branding
        </Button>
        {savedMessage && <div className="text-sm text-green-600 py-2">{savedMessage}</div>}
      </div>
    </div>
  );
}