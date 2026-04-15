import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import ZoneBasedSidebar from './ZoneBasedSidebar';
import HelperBot from '@/components/HelperBot';
import RBMBrandedHeader from '@/components/RBMBrandedHeader';
import AudioToggle from '@/components/shared/AudioToggle';

/**
 * Light theme layout wrapper applied to all authenticated pages.
 * Replaces old dark theme with light gradient background globally.
 */
export default function LightThemeLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <RBMBrandedHeader />
      <ZoneBasedSidebar />
      
      {/* Audio toggle */}
      <div className="fixed top-4 right-6 z-[1000]">
        <AudioToggle />
      </div>

      {/* Main content with proper spacing */}
      <main className="ml-[260px] mt-[128px] min-h-screen transition-all duration-300">
        <Outlet />
      </main>

      <HelperBot />
    </div>
  );
}