import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import BrandingCustomizer from '@/components/onboarding/BrandingCustomizer';
import { Palette, ArrowRight } from 'lucide-react';

export default function OnboardingBranding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Palette className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Customize Your Brand</h1>
          </div>
          <p className="text-slate-600">Make Premiso feel like your own. Choose colors, fonts, and branding that match your company identity.</p>
        </div>

        {/* Main form */}
        <Card className="p-8 border-slate-200 shadow-sm mb-6">
          <BrandingCustomizer />
        </Card>

        {/* Skip option */}
        <div className="text-center">
          <p className="text-sm text-slate-600 mb-4">You can always customize this later in Settings</p>
          <Button asChild variant="outline">
            <Link to="/dashboard" className="gap-2">
              Continue to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}