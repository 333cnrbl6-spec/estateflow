import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import AlertsBell from '@/components/alerts/AlertsBell';
import { Building2 } from 'lucide-react';

export default function TopBar() {
  const { user } = useAuth();

  return (
    <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-40">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Building2 className="w-4 h-4 text-primary" />
        <span className="font-medium text-primary">Premiso</span>
      </div>
      <div className="flex items-center gap-3">
        {user && <span className="text-xs text-slate-500 hidden md:block">{user.email}</span>}
        <div className="text-slate-600">
          <AlertsBell />
        </div>
      </div>
    </div>
  );
}