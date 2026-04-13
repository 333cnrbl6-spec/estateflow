import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from './Sidebar';
import HelperBot from '@/components/HelperBot';
import { Bell, Search, Settings } from 'lucide-react';
import RBMBrandedHeader from '@/components/RBMBrandedHeader';

export default function AppLayout() {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <RBMBrandedHeader />
      
      <Sidebar onCollapsedChange={setSidebarCollapsed} />
      
      {/* Top Header */}
      























      
      
      <main className={`${sidebarCollapsed ? 'ml-[68px]' : 'ml-[260px]'} mt-[92px] min-h-screen transition-all duration-300`}>
        <Outlet />
      </main>

      {/* Helper Bot - Always Available */}
      <HelperBot />
    </div>);

}