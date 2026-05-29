import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { navigationZones } from '@/lib/navigationZones';
import { cn } from '@/lib/utils';

export default function ZoneBasedSidebar() {
  const [expandedZones, setExpandedZones] = useState({
    core: true,
    onboarding: false,
    operations: false,
    finance: false,
    compliance: false,
  });
  const location = useLocation();

  const toggleZone = (zoneId) => {
    setExpandedZones(prev => ({
      ...prev,
      [zoneId]: !prev[zoneId],
    }));
  };

  const isRouteActive = (path) => {
    return location.pathname === path;
  };

  const isZoneActive = (zone) => {
    return zone.routes.some(route => isRouteActive(route.path));
  };

  return (
    <div className="w-full h-full flex flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo Section */}
      <div className="px-4 py-5 border-b border-sidebar-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #007BFF, #0A1E3F)' }}>
          <span className="text-white font-bold text-xs">P</span>
        </div>
        <div>
          <h2 className="font-bold text-base leading-none" style={{ color: '#fff', fontFamily: 'Poppins, Inter, sans-serif' }}>Premiso</h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>Property Management</p>
        </div>
      </div>

      {/* Navigation Zones */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
        {navigationZones.map(zone => {
          const Icon = zone.icon;
          const isActive = isZoneActive(zone);
          const isExpanded = expandedZones[zone.id];

          return (
            <div key={zone.id}>
              {/* Zone Header */}
              <button
                onClick={() => toggleZone(zone.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{zone.label}</span>
                </div>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                />
              </button>

              {/* Zone Routes */}
              {isExpanded && (
                <div className="ml-2 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                  {zone.routes.map(route => (
                    <Link
                      key={route.path}
                      to={route.path}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors',
                        isRouteActive(route.path)
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/30'
                      )}
                    >
                      <span className="text-sm">{route.icon}</span>
                      <span>{route.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
        <p>Premiso BETA · SynergyFlow Group</p>
      </div>
    </div>
  );
}