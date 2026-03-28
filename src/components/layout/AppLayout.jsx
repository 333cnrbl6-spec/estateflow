import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from './Sidebar';
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
      <header className={`fixed top-20 right-0 h-[72px] bg-card border-b border-border transition-all duration-300 ${sidebarCollapsed ? 'left-[68px]' : 'left-[260px]'} flex items-center justify-between px-6 z-40`}>
        <div className="flex-1 flex items-center gap-3">
          <div className="relative hidden md:flex items-center bg-muted rounded-lg px-3 py-2 w-64">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none w-full"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary flex items-center justify-center text-xs font-semibold text-primary">
            {user?.full_name?.[0] || 'U'}
          </div>
        </div>
      </header>
      
      <main className={`${sidebarCollapsed ? 'ml-[68px]' : 'ml-[260px]'} mt-[92px] min-h-screen transition-all duration-300`}>
        <Outlet />
      </main>
    </div>
  );
}