import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import ZoneBasedSidebar from './ZoneBasedSidebar';
import HelperBot from '@/components/HelperBot';
import AudioToggle from '@/components/shared/AudioToggle';

/**
 * Dark theme layout for dev/admin pages (no restructure, original look).
 */
export default function DarkThemeLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Fixed sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-[260px] bg-sidebar text-sidebar-foreground overflow-y-auto z-50">
        <ZoneBasedSidebar />
      </div>

      {/* Main content area */}
      <div className="ml-[260px] w-full flex flex-col">
        {/* Audio toggle */}
        <div className="fixed top-4 right-6 z-[1000]">
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