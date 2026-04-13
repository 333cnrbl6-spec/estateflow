import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from './Sidebar';
import HelperBot from '@/components/HelperBot';
import { Bell } from 'lucide-react';
import RBMBrandedHeader from '@/components/RBMBrandedHeader';

export default function AppLayout() {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <RBMBrandedHeader />
      <Sidebar onCollapsedChange={setSidebarCollapsed} />

      {/* Top Header */}
      <header className={`fixed top-20 right-0 h-11 bg-background/90 backdrop-blur-sm border-b border-border/60 transition-all duration-300 ${sidebarCollapsed ? 'left-[68px]' : 'left-[260px]'} flex items-center justify-end px-5 z-40 gap-3`}>
        <button className="relative p-1.5 hover:bg-muted rounded-lg transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-destructive rounded-full"></span>
        </button>
        <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground shadow-sm">
          {user?.full_name?.[0] || 'U'}
        </div>
      </header>

      <main className={`${sidebarCollapsed ? 'ml-[68px]' : 'ml-[260px]'} mt-[128px] min-h-screen transition-all duration-300`}>
        <Outlet />
      </main>

      <HelperBot />
    </div>
  );
}