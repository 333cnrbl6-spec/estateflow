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
    <div className="min-h-screen bg-slate-950">
      <ZoneBasedSidebar />
      
      {/* Audio toggle */}
      <div className="fixed top-4 right-6 z-[1000]">
        <AudioToggle />
      </div>

      {/* Main content */}
      <main className="ml-[260px] mt-[128px] min-h-screen">
        <Outlet />
      </main>

      <HelperBot />
    </div>
  );
}