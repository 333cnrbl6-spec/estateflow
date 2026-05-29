import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ZoneBasedSidebar from './ZoneBasedSidebar';
import HelperBot from '@/components/HelperBot';
import RBMBrandedHeader from '@/components/RBMBrandedHeader';
import AudioToggle from '@/components/shared/AudioToggle';
import TopBar from './TopBar';
import { Menu, X } from 'lucide-react';

export default function LightThemeLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex overflow-x-hidden bg-background">

      {/* Mobile overlay backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className={`
        fixed left-0 top-0 bottom-0 w-[260px] overflow-y-auto z-50 transition-transform duration-300
        lg:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <ZoneBasedSidebar />
      </aside>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="lg:ml-[260px] w-full min-w-0 flex flex-col min-h-screen">

        {/* Optional RBM branding (only renders when rbm-branded class is on body) */}
        <RBMBrandedHeader />

        {/* Top navigation bar */}
        <TopBar />

        {/* Mobile hamburger button */}
        <button
          className="fixed top-3 left-3 z-[60] lg:hidden p-2 rounded-lg bg-sidebar text-white shadow-lg"
          onClick={() => setMobileSidebarOpen(o => !o)}
          aria-label="Toggle sidebar"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Audio toggle — top-right */}
        <div className="fixed top-3 right-16 z-[1000]">
          <AudioToggle />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <HelperBot />
    </div>
  );
}