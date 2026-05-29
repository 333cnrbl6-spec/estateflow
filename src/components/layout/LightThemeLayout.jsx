import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import ZoneBasedSidebar from './ZoneBasedSidebar';
import HelperBot from '@/components/HelperBot';
import RBMBrandedHeader from '@/components/RBMBrandedHeader';
import AudioToggle from '@/components/shared/AudioToggle';
import TopBar from './TopBar';

/**
 * Light theme layout wrapper applied to all authenticated pages.
 * Replaces old dark theme with light gradient background globally.
 */
export default function LightThemeLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex" style={{ background: '#f4f7fb' }}>
      {/* Fixed sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-[260px] bg-sidebar text-sidebar-foreground overflow-y-auto z-50">
        <ZoneBasedSidebar />
      </div>

      {/* Main content area */}
      <div className="ml-[260px] w-full flex flex-col">
        <RBMBrandedHeader />
        <TopBar />
        
        {/* Audio toggle */}
        <div className="fixed top-4 right-20 z-[1000]">
          <AudioToggle />
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <HelperBot />
    </div>
  );
}