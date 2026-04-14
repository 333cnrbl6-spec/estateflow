import React, { useState, useEffect } from 'react';
import { getCurrentDemoBrand } from '@/lib/brandConfig';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard, Building2, Home, DoorOpen, Users, PoundSterling, Wrench,
  BookUser, ShieldCheck, GitBranch, ChevronLeft, ChevronRight, Crown, BookOpen,
  Layers, MapPin, Landmark, Receipt, MessageSquare, Settings, Plug, Scale, Zap,
  FileText, Shield, AlertCircle, Code2, TrendingUp, Phone, Lightbulb, Sparkles,
  Calendar, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: 'Core',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: 'Properties', icon: Home, path: '/properties' },
      { label: 'Contacts', icon: BookUser, path: '/contacts' },
    ]
  },
  {
    label: '🏷️ For Sale',
    items: [
      { label: 'Sales Dashboard', icon: TrendingUp, path: '/sales' },
      { label: 'Listings', icon: Home, path: '/sales?tab=listings' },
      { label: 'Leads', icon: Users, path: '/sales?tab=leads' },
      { label: 'Pipeline', icon: GitBranch, path: '/sales?tab=pipeline' },
      { label: 'Viewings', icon: Calendar, path: '/viewings' },
      { label: 'Performance', icon: BarChart3, path: '/agent-performance' },
      { label: 'Market Reports', icon: BookOpen, path: '/market-reports' },
      { label: 'Buyer Portal', icon: DoorOpen, path: '/buyer-portal' },
    ]
  },
  {
    label: '🏠 To Let',
    items: [
      { label: 'Lettings Dashboard', icon: LayoutDashboard, path: '/pipeline' },
      { label: 'Tenants', icon: Users, path: '/tenants' },
      { label: 'Units & Leases', icon: DoorOpen, path: '/units' },
      { label: 'Rent Ledger', icon: BookOpen, path: '/rent-ledger' },
      { label: 'Tenant Portal', icon: Users, path: '/tenant-portal' },
    ]
  },
  {
    label: '👤 New Applicants',
    items: [
      { label: 'CRM', icon: MessageSquare, path: '/crm' },
      { label: 'Sales Leads', icon: Users, path: '/sales?tab=leads' },
      { label: 'Tenant Applications', icon: FileText, path: '/pipeline' },
      { label: 'Messages', icon: MessageSquare, path: '/messages' },
    ]
  },
  {
    label: '💼 Block Management',
    items: [
      { label: 'Overview', icon: Building2, path: '/block-management' },
      { label: 'Service Charges', icon: PoundSterling, path: '/service-charges-management' },
      { label: 'RTM Management', icon: Users, path: '/rtm-management' },
      { label: 'Building Safety', icon: Shield, path: '/building-safety-register' },
      { label: 'Compliance Hub', icon: Scale, path: '/block-compliance-dashboard' },
      { label: 'Document Automation', icon: FileText, path: '/document-automation' },
      { label: 'Leaseholder Portal', icon: Users, path: '/leaseholder-portal' },
    ]
  },
  {
    label: '💰 Finance',
    items: [
      { label: 'Financial Dashboard', icon: TrendingUp, path: '/financial-reporting' },
      { label: 'Banking', icon: Landmark, path: '/banking' },
      { label: 'Expenses', icon: Receipt, path: '/expenses' },
      { label: 'Service Charges', icon: Layers, path: '/service-charges' },
      { label: 'Ground Rent', icon: MapPin, path: '/ground-rent' },
      { label: 'Owner Tax Summary', icon: Crown, path: '/owner-financials' },
      { label: 'Bank Reconciliation', icon: Receipt, path: '/bank-reconciliation' },
      { label: 'Accounting', icon: Settings, path: '/accounting' },
    ]
  },
  {
    label: '🔧 Operations',
    items: [
      { label: 'Maintenance', icon: Wrench, path: '/maintenance' },
      { label: 'Maintenance Board', icon: Layers, path: '/maintenance-board' },
      { label: 'Maintenance Reports', icon: FileText, path: '/maintenance-reports' },
      { label: 'Emergency Callouts', icon: AlertCircle, path: '/emergency-callouts' },
      { label: 'Compliance', icon: ShieldCheck, path: '/compliance' },
      { label: 'Certificates', icon: FileText, path: '/certificate-compliance' },
      { label: 'Compliance Audit', icon: Scale, path: '/compliance-audit' },
      { label: 'Regulatory Hub', icon: Scale, path: '/regulatory-hub' },
      { label: 'Documents', icon: FileText, path: '/document-repository' },
      { label: 'Workflow Engine', icon: Zap, path: '/workflows' },
    ]
  },
  {
    label: '📞 Out-of-Hours',
    items: [
      { label: 'Call Center', icon: Phone, path: '/out-of-hours' },
      { label: 'Service Pipeline', icon: GitBranch, path: '/out-of-hours-pipeline' },
      { label: 'Reporting', icon: TrendingUp, path: '/out-of-hours-reporting' },
      { label: 'Config', icon: Settings, path: '/call-center-config' },
      { label: 'Contractor Portal', icon: Users, path: '/contractor-portal' },
    ]
  },
  {
    label: '📊 Reporting',
    items: [
      { label: 'Landlord Reports', icon: TrendingUp, path: '/reporting' },
      { label: 'Monthly Reports', icon: FileText, path: '/monthly-reports' },
      { label: 'Financial Reports', icon: PoundSterling, path: '/financial-reports' },
      { label: 'KPI Dashboard', icon: BarChart3, path: '/kpi-dashboard' },
      { label: 'Maintenance Analytics', icon: Wrench, path: '/maintenance-analytics' },
      { label: 'Reconciliation', icon: Receipt, path: '/reconciliation' },
    ]
  },
  {
    label: '⚙️ Admin',
    items: [
      { label: 'Companies', icon: Building2, path: '/companies' },
      { label: 'Land Registry', icon: PoundSterling, path: '/land-registry' },
      { label: 'Setup & Onboarding', icon: Plug, path: '/setup' },
      { label: 'Integrations', icon: Settings, path: '/integrations' },
      { label: 'API Hub', icon: Zap, path: '/api-integrations' },
      { label: 'Document Templates', icon: FileText, path: '/document-templates' },
      { label: 'Landlord Portal', icon: Users, path: '/landlord-portal' },
      { label: 'Settings', icon: Settings, path: '/settings' },
      { label: 'Compliance Hub', icon: Scale, path: '/compliance-hub' },
      { label: 'Billing', icon: Receipt, path: '/billing' },
    ]
  },
  {
    label: '🚀 Demo & Sales',
    items: [
      { label: '⭐ Demo Station', icon: Sparkles, path: '/demo-station' },
      { label: 'Sales Demo Builder', icon: Zap, path: '/sales-demo-setup' },
      { label: 'Brochure Generator', icon: FileText, path: '/sales-brochure-generator' },
      { label: 'Expansion Opportunities', icon: Lightbulb, path: '/expansion-opportunities' },
      { label: 'Dev: Demo Switcher', icon: Code2, path: '/dev-demo-switcher' },
    ]
  }
];

export default function Sidebar({ onCollapsedChange }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const [demoBrand, setDemoBrand] = useState(null);

  useEffect(() => {
    // Pick up brand set by RBMBrandingProvider (may run slightly after mount)
    const check = () => setDemoBrand(user?.demo_brand || getCurrentDemoBrand() || null);
    check();
    const timer = setTimeout(check, 800);
    return () => clearTimeout(timer);
  }, [user]);

  const handleCollapse = (newState) => {
    setCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground z-50 flex flex-col transition-all duration-300 border-r border-sidebar-border",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-[72px] border-b border-sidebar-border shrink-0">
        {demoBrand?.logo_url ? (
          <img
            src={demoBrand.logo_url}
            alt={demoBrand.company_name || 'Logo'}
            className="h-8 w-8 object-contain rounded shrink-0"
            onError={e => { e.target.style.display='none'; }}
          />
        ) : (
          <div className="w-8 h-8 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0 shadow-md">
            <Crown className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
        )}
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-[15px] tracking-tight text-sidebar-foreground truncate">
              {demoBrand?.company_name || 'Premiso'}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.12em] text-sidebar-foreground/40">
              {demoBrand?.tagline || user?.business_name || 'Property Software'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-3 mb-1.5 text-[9px] uppercase tracking-[0.15em] font-bold text-sidebar-foreground/35">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                if ((item.path === '/out-of-hours' || item.path === '/call-center-config') && user?.role !== 'admin') {
                  return null;
                }
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                    )}
                  >
                    <item.icon className={cn("w-[17px] h-[17px] shrink-0", isActive ? "text-sidebar-primary-foreground" : "")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User card */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-sidebar-border flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-sidebar-primary flex items-center justify-center text-xs font-bold text-sidebar-primary-foreground shrink-0">
            {user?.full_name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{user?.full_name || 'User'}</p>
            <p className="text-[10px] text-sidebar-foreground/40 truncate">{user?.role}</p>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => handleCollapse(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-sidebar-border text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}