import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import AlertsBell from '@/components/alerts/AlertsBell';
import { MapPin } from 'lucide-react';
import { clearTourHistory } from '@/components/onboarding/useFounderTour';
import { Link, useLocation } from 'react-router-dom';

// Breadcrumb label map for common routes
const ROUTE_LABELS = {
  '/dashboard': 'Dashboard',
  '/properties': 'Properties',
  '/tenants': 'Tenants',
  '/financials': 'Financials',
  '/maintenance-board': 'Maintenance Board',
  '/compliance-hub': 'Compliance Hub',
  '/settings': 'Settings',
};

export default function TopBar() {
  const { user } = useAuth();
  const location = useLocation();

  const pageLabel = ROUTE_LABELS[location.pathname] || null;

  return (
    <div className="h-12 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-40 gap-4">
      {/* Left: breadcrumb hint */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
        {pageLabel && (
          <>
            <span className="text-muted-foreground/50 hidden sm:inline">Premiso</span>
            <span className="text-muted-foreground/40 hidden sm:inline">/</span>
            <span className="font-medium text-foreground truncate">{pageLabel}</span>
          </>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {user && (
          <span className="text-xs text-muted-foreground hidden lg:block max-w-[180px] truncate">
            {user.email}
          </span>
        )}
        <button
          onClick={() => {
            clearTourHistory();
            window.location.href = '/dashboard';
          }}
          title="Take the platform tour"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary border border-border hover:border-primary/40 rounded-md px-2.5 py-1 transition-colors"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tour</span>
        </button>
        <div className="text-muted-foreground">
          <AlertsBell />
        </div>
      </div>
    </div>
  );
}