import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Search, LogOut } from 'lucide-react';
import { navigationZones } from '@/lib/navigationZones';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';

// Zones hidden from the default nav (too developer-facing)
const ADVANCED_ZONE_IDS = ['developer'];

export default function ZoneBasedSidebar() {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

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

  // Filter zones+routes by search
  const filteredZones = useMemo(() => {
    if (!search.trim()) return navigationZones;
    const q = search.toLowerCase();
    return navigationZones
      .map(zone => ({
        ...zone,
        routes: zone.routes.filter(r => r.label.toLowerCase().includes(q)),
      }))
      .filter(zone => zone.routes.length > 0 || zone.label.toLowerCase().includes(q));
  }, [search]);

  const primaryZones = filteredZones.filter(z => !ADVANCED_ZONE_IDS.includes(z.id));
  const advancedZones = filteredZones.filter(z => ADVANCED_ZONE_IDS.includes(z.id));

  const renderZoneIcon = (zone) => {
    if (typeof zone.icon === 'string') return <span className="text-base leading-none">{zone.icon}</span>;
    if (zone.icon && typeof zone.icon === 'function') {
      const Icon = zone.icon;
      return <Icon className="w-4 h-4 flex-shrink-0" />;
    }
    return <span className="text-base">📁</span>;
  };

  const ZoneRoutes = ({ zone }) => (
    <div className="ml-2 mt-0.5 mb-1 space-y-0.5 border-l border-white/10 pl-3">
      {zone.routes.map(route => (
        <Link
          key={route.path}
          to={route.path}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all duration-150',
            isRouteActive(route.path)
              ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm'
              : 'text-white/60 hover:bg-white/10 hover:text-white'
          )}
        >
          <span className="text-sm flex-shrink-0 leading-none w-5 text-center">
            {typeof route.icon === 'string' ? route.icon : '📄'}
          </span>
          <span className="truncate">{route.label}</span>
        </Link>
      ))}
    </div>
  );

  const ZoneHeader = ({ zone }) => {
    const isActive = isZoneActive(zone);
    const isExpanded = !!expandedZones[zone.id];
    return (
      <div>
        <button
          onClick={() => toggleZone(zone.id)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 text-left group',
            isActive
              ? 'bg-white/15 text-white'
              : 'text-white/70 hover:bg-white/8 hover:text-white'
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {renderZoneIcon(zone)}
            <span className="truncate font-poppins">{zone.label}</span>
          </div>
          <ChevronDown
            className={cn('w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 opacity-60 group-hover:opacity-100', isExpanded && 'rotate-180')}
          />
        </button>
        {isExpanded && <ZoneRoutes zone={zone} />}
      </div>
    );
  };

  const initials = user
    ? (user.full_name || user.email || '?').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'hsl(var(--sidebar-background))' }}>
      {/* ── Logo ─────────────────────────────── */}
      <div className="px-4 pt-5 pb-4 border-b border-white/10 flex items-center gap-3 flex-shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"
          style={{ background: 'linear-gradient(135deg, hsl(var(--sidebar-primary)), #1a60d4)' }}
        >
          <span className="text-white font-bold text-sm font-poppins" style={{ color: 'hsl(var(--sidebar-primary-foreground))' }}>P</span>
        </div>
        <div className="min-w-0">
          <h2 className="font-bold text-sm leading-none text-white font-poppins tracking-wide">Premiso</h2>
          <p className="text-xs mt-0.5 text-white/40 font-inter">Property Management</p>
        </div>
      </div>

      {/* ── Search ───────────────────────────── */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            placeholder="Search navigation…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/8 border border-white/10 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-colors"
          />
        </div>
      </div>

      {/* ── Navigation Zones ─────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 scrollbar-thin">
        {primaryZones.map(zone => <ZoneHeader key={zone.id} zone={zone} />)}

        {advancedZones.length > 0 && (
          <>
            <div className="px-3 pt-3 pb-1">
              <p className="text-xs text-white/25 font-semibold uppercase tracking-widest">Advanced</p>
            </div>
            {advancedZones.map(zone => <ZoneHeader key={zone.id} zone={zone} />)}
          </>
        )}
      </nav>

      {/* ── Footer Quick Links ────────────────── */}
      <div className="px-3 pb-2 pt-2 border-t border-white/10 flex-shrink-0 space-y-0.5">
        {[
          { path: '/guided-setup', label: 'Guided Setup', icon: '🚀' },
          { path: '/help-support', label: 'Help & Support', icon: '❓' },
          { path: '/beta-feedback', label: 'BETA Feedback', icon: '💬' },
        ].map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors',
              isRouteActive(link.path)
                ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold'
                : 'text-white/45 hover:text-white hover:bg-white/10'
            )}
          >
            <span className="w-5 text-center">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>

      {/* ── User Profile Footer ───────────────── */}
      {user && (
        <div className="px-3 pb-4 flex-shrink-0 border-t border-white/10 pt-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
              style={{ background: 'hsl(var(--sidebar-primary))' }}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white/80 truncate">{user.full_name || 'User'}</p>
              <p className="text-xs text-white/35 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => base44.auth.logout('/')}
              title="Sign out"
              className="p-1.5 rounded-md text-white/30 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}