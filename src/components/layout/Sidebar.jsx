import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Home,
  DoorOpen,
  Users,
  PoundSterling,
  Wrench,
  BookUser,
  ShieldCheck,
  GitBranch,
  ChevronLeft,
  ChevronRight,
  Crown,
  BookOpen,
  Layers,
  MapPin,
  Landmark,
  Receipt,
  MessageSquare,
  Settings,
  Plug,
  Scale,
  Zap,
  FileText,
  Shield,
  AlertCircle,
  Code2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: 'Portfolio',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: 'Companies', icon: Building2, path: '/companies' },
      { label: 'Properties', icon: Home, path: '/properties' },
      { label: 'Units & Leases', icon: DoorOpen, path: '/units' },
      { label: 'Tenants', icon: Users, path: '/tenants' },
      { label: 'Pipeline', icon: GitBranch, path: '/pipeline' },
      { label: 'Land Registry', icon: PoundSterling, path: '/land-registry' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { label: 'Rent Ledger', icon: BookOpen, path: '/rent-ledger' },
      { label: 'Service Charges', icon: Layers, path: '/service-charges' },
      { label: 'Ground Rent', icon: MapPin, path: '/ground-rent' },
      { label: 'Banking', icon: Landmark, path: '/banking' },
      { label: 'Expenses', icon: Receipt, path: '/expenses' },
      { label: 'Financials', icon: PoundSterling, path: '/financials' },
      { label: 'Financial Reports', icon: FileText, path: '/financial-reporting' },
      { label: 'Accounting', icon: Settings, path: '/accounting' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { label: 'Maintenance', icon: Wrench, path: '/maintenance' },
      { label: 'Emergency Callouts', icon: AlertCircle, path: '/emergency-callouts' },
      { label: 'Compliance', icon: ShieldCheck, path: '/compliance' },
       { label: 'Compliance Audit', icon: Scale, path: '/compliance-audit' },
       { label: 'Regulatory Hub', icon: Scale, path: '/regulatory-hub' },
       { label: 'Documents', icon: FileText, path: '/document-templates' },
       { label: 'Workflow Engine', icon: Zap, path: '/workflows' },
      { label: 'CRM', icon: MessageSquare, path: '/crm' },
      { label: 'Contacts', icon: BookUser, path: '/contacts' },
    ]
  },
  {
    label: 'Block Management',
    items: [
      { label: 'Compliance Hub', icon: Scale, path: '/block-compliance-dashboard' },
      { label: 'Document Automation', icon: FileText, path: '/document-automation' },
      { label: 'Overview', icon: Building2, path: '/block-management' },
      { label: 'Service Charges', icon: PoundSterling, path: '/service-charges-management' },
      { label: 'RTM Management', icon: Users, path: '/rtm-management' },
      { label: 'Building Safety', icon: Shield, path: '/building-safety-register' },
    ]
  },
  {
    label: 'Platform',
    items: [
      { label: 'Setup & Integrations', icon: Plug, path: '/setup' },
      { label: 'Integrations', icon: Settings, path: '/integrations' },
      { label: 'API Hub', icon: Zap, path: '/api-integrations' },
      { label: 'Tenant Portal', icon: Users, path: '/tenant-portal' },
      { label: 'Leaseholder Portal', icon: Users, path: '/leaseholder-portal' },
      { label: 'Dev: Demo Switcher', icon: Code2, path: '/dev-demo-switcher' },
    ]
  }
];

export default function Sidebar({ onCollapsedChange }) {
  let location;
  try {
    location = useLocation();
  } catch {
    // useLocation() called outside Router context - provide fallback
    location = { pathname: '/' };
  }
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const handleCollapse = (newState) => {
    setCollapsed(newState);
    onCollapsedChange?.(newState);
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground z-50 flex flex-col transition-all duration-300 border-r border-sidebar-border",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-[72px] border-b border-sidebar-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
          <Crown className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-serif text-base font-semibold tracking-tight text-sidebar-foreground truncate">
              EstateFlow
            </h1>
            <p className="text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/50">
              {user?.business_name ? user.business_name : 'Property Group'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-3 mb-1 text-[10px] uppercase tracking-[0.12em] font-semibold text-sidebar-foreground/30">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <item.icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-sidebar-primary")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => handleCollapse(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-sidebar-border text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}