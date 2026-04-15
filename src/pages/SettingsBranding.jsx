import React from 'react';
import { Card } from '@/components/ui/card';
import BrandingCustomizer from '@/components/onboarding/BrandingCustomizer';
import PageHeader from '@/components/shared/PageHeader';
import { Palette } from 'lucide-react';

export default function SettingsBranding() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Brand Settings"
        subtitle="Customize colors, fonts, and branding to match your company identity"
        icon={<Palette className="w-6 h-6" />}
      />

      <div className="max-w-2xl">
        <Card className="p-8 border-slate-200">
          <BrandingCustomizer />
        </Card>
      </div>
    </div>
  );
}