import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from './Sidebar';
import HelperBot from '@/components/HelperBot';
import RBMBrandedHeader from '@/components/RBMBrandedHeader';

export default function AppLayout() {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <RBMBrandedHeader />
      <Sidebar onCollapsedChange={setSidebarCollapsed} />

      <main className={`${sidebarCollapsed ? 'ml-[68px]' : 'ml-[260px]'} mt-[128px] min-h-screen transition-all duration-300`}>
        <Outlet />
      </main>

      <HelperBot />
    </div>
  );
}