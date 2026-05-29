import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { navigationZones } from '@/lib/navigationZones';
import { cn } from '@/lib/utils';

export default function ZoneBasedSidebar() {
  const location = useLocation();

  // Auto-expand the active zone on mount/navigation
  const getInitialExpanded = () => {
    const expanded = { core: true };
    navigationZones.forEach(zone => {
      if (zone.routes.some(r => r.path === location.pathname)) {
        expanded[zone.id] = true;
      }
    });
    return expanded;
  };

  const [expandedZones, setExpandedZones] = useState(getInitialExpanded);

  // Auto-expand zone when navigating to a route inside it
  useEffect(() => {
    navigationZones.forEach(zone => {
      if (zone.routes.some(r => r.path === location.pathname)) {
        setExpandedZones(prev => ({ ...prev, [zone.id]: true }));
      }
    });
  }, [location.pathname]);

  const toggleZone = (zoneId) => {
    setExpandedZones(prev => ({ ...prev, [zoneId]: !prev[zoneId] }));
  };

  const isRouteActive = (path) => location.pathname === path;

  const isZoneActive = (zone) => zone.routes.some(route => isRouteActive(route.path));

  const renderZoneIcon = (zone) => {
    // Support both emoji strings and Lucide components
    if (typeof zone.icon === 'string') {
      return <span className="text-base leading-none">{zone.icon}</span>;
    }
    if (zone.icon && typeof zone.icon === 'function') {
      const Icon = zone.icon;
      return <Icon className="w-4 h-4 flex-shrink-0" />;
    }
    return <span className="text-base">📁</span>;
  };

  return (
    <div className="w-full h-full flex flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-sidebar-border flex items-center gap-3 flex-shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #007BFF, #0A1E3F)' }}
        >
          <span className="text-white font-bold text-xs">P</span>
        </div>
        <div className="min-w-0">
          <h2 className="font-bold text-base leading-none truncate" style={{ color: '#fff', fontFamily: 'Poppins, Inter, sans-serif' }}>
            Premiso
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>Property Management</p>
        </div>
      </div>

      {/* Navigation Zones */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {navigationZones.map(zone => {
          const isActive = isZoneActive(zone);
          const isExpanded = !!expandedZones[zone.id];

          return (
            <div key={zone.id}>
              <button
                onClick={() => toggleZone(zone.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {renderZoneIcon(zone)}
                  <span className="truncate">{zone.label}</span>
                </div>
                <ChevronDown
                  className={cn('w-4 h-4 flex-shrink-0 transition-transform duration-200', isExpanded && 'rotate-180')}
                />
              </button>

              {isExpanded && (
                <div className="ml-2 mt-1 mb-1 space-y-0.5 border-l border-sidebar-border pl-3">
                  {zone.routes.map(route => (
                    <Link
                      key={route.path}
                      to={route.path}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors',
                        isRouteActive(route.path)
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold'
                          : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground'
                      )}
                    >
                      <span className="text-sm flex-shrink-0 leading-none">
                        {typeof route.icon === 'string' ? route.icon : '📄'}
                      </span>
                      <span className="truncate">{route.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer links */}
      <div className="px-3 py-3 border-t border-sidebar-border flex-shrink-0 space-y-1">
        {[
          { path: '/guided-setup', label: 'Guided Setup', icon: '🚀' },
          { path: '/help-support', label: 'Help & Support', icon: '❓' },
          { path: '/beta-feedback', label: 'BETA Feedback', icon: '💬' },
        ].map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors',
              isRouteActive(link.path)
                ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold'
                : 'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/30'
            )}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
        <p className="text-xs px-3 pt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Premiso BETA · SynergyFlow Group</p>
      </div>
    </div>
  );
}