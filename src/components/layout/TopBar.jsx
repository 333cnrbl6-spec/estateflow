import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import AlertsBell from '@/components/alerts/AlertsBell';
import { Building2, MapPin } from 'lucide-react';
import { clearTourHistory } from '@/components/onboarding/useFounderTour';


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
        <button
          onClick={() => {
            clearTourHistory();
            window.location.href = '/dashboard';
          }}
          title="Take the platform tour"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary border border-slate-200 hover:border-primary/40 rounded-md px-2.5 py-1 transition-colors"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Take the tour</span>
        </button>
        <div className="text-slate-600">
          <AlertsBell />
        </div>
      </div>
    </div>
  );
}