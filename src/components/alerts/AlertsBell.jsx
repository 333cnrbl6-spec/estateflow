import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Bell, X, AlertTriangle, Clock, FileText, CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

function buildAlerts(tenants, certificates, transactions, deposits) {
  const alerts = [];
  const today = new Date();

  // Rent overdue
  transactions
    .filter(t => t.status === 'overdue' || (t.status === 'pending' && t.due_date && new Date(t.due_date) < today))
    .forEach(t => {
      const daysOverdue = Math.floor((today - new Date(t.due_date)) / (1000 * 60 * 60 * 24));
      alerts.push({
        id: `rent-${t.id}`,
        type: 'rent_overdue',
        title: 'Rent Overdue',
        desc: `£${(t.amount / 100).toFixed(0)} overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`,
        severity: daysOverdue >= 14 ? 'critical' : daysOverdue >= 7 ? 'high' : 'medium',
        action: '/rent-ledger',
        dismissed: false,
      });
    });

  // Tenancy expiring
  tenants.filter(t => t.tenancy_end_date && t.status === 'active').forEach(t => {
    const daysLeft = Math.floor((new Date(t.tenancy_end_date) - today) / (1000 * 60 * 60 * 24));
    if (daysLeft >= 0 && daysLeft <= 90) {
      alerts.push({
        id: `tenancy-${t.id}`,
        type: 'tenancy_expiring',
        title: `Tenancy Expiring – ${t.full_name}`,
        desc: `${daysLeft} days remaining`,
        severity: daysLeft <= 14 ? 'critical' : daysLeft <= 30 ? 'high' : 'medium',
        action: '/tenants',
        dismissed: false,
      });
    }
  });

  // Certificate expiry (gas safety, EPC, etc.)
  certificates.filter(c => c.expiry_date).forEach(c => {
    const daysLeft = Math.floor((new Date(c.expiry_date) - today) / (1000 * 60 * 60 * 24));
    if (daysLeft >= 0 && daysLeft <= 60) {
      alerts.push({
        id: `cert-${c.id}`,
        type: 'cert_expiring',
        title: `${c.certificate_type || 'Certificate'} Expiring`,
        desc: `Expires in ${daysLeft} days`,
        severity: daysLeft <= 7 ? 'critical' : 'high',
        action: '/compliance-hub',
        dismissed: false,
      });
    }
  });

  // Unprotected deposits (> 30 days since tenancy start)
  tenants.filter(t => t.tenancy_start_date && t.status === 'active').forEach(t => {
    const daysSinceStart = Math.floor((today - new Date(t.tenancy_start_date)) / (1000 * 60 * 60 * 24));
    const hasProtection = deposits.some(d => d.tenant_id === t.id && d.status !== 'not_protected');
    if (daysSinceStart > 30 && !hasProtection) {
      alerts.push({
        id: `deposit-${t.id}`,
        type: 'deposit_unprotected',
        title: `Deposit Not Protected – ${t.full_name}`,
        desc: `Tenancy started ${daysSinceStart} days ago`,
        severity: 'critical',
        action: '/compliance-hub',
        dismissed: false,
      });
    }
  });

  return alerts;
}

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', dot: 'bg-red-500' },
  high: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500' },
  medium: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400' },
};

export default function AlertsBell() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('premiso_dismissed_alerts') || '[]'); } catch { return []; }
  });
  const panelRef = useRef(null);

  const { data: tenants = [] } = useQuery({ queryKey: ['tenants'], queryFn: () => base44.entities.Tenant.list() });
  const { data: certificates = [] } = useQuery({ queryKey: ['certs-bell'], queryFn: () => base44.entities.SafetyCertificate?.list?.() || Promise.resolve([]) });
  const { data: transactions = [] } = useQuery({ queryKey: ['transactions'], queryFn: () => base44.entities.FinancialTransaction.list() });
  const { data: deposits = [] } = useQuery({ queryKey: ['deposits-bell'], queryFn: () => base44.entities.DepositProtection?.list?.() || Promise.resolve([]) });

  const allAlerts = buildAlerts(tenants, certificates, transactions, deposits);
  const activeAlerts = allAlerts.filter(a => !dismissed.includes(a.id));
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const unreadCount = activeAlerts.length;

  const handleDismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem('premiso_dismissed_alerts', JSON.stringify(next));
  };

  const handleDismissAll = () => {
    const next = [...dismissed, ...activeAlerts.map(a => a.id)];
    setDismissed(next);
    localStorage.setItem('premiso_dismissed_alerts', JSON.stringify(next));
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 ${
            criticalCount > 0 ? 'bg-red-500 text-white' : 'bg-amber-400 text-slate-900'
          }`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-slate-800 text-sm">Alerts</span>
              {unreadCount > 0 && <Badge className="bg-red-100 text-red-700 text-xs px-1.5">{unreadCount}</Badge>}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button onClick={handleDismissAll} className="text-xs text-slate-500 hover:text-slate-700">Dismiss all</button>
              )}
              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
          </div>

          {/* Alerts List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {activeAlerts.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">All clear!</p>
                <p className="text-xs text-slate-400 mt-1">No active alerts</p>
              </div>
            ) : (
              activeAlerts.map(alert => {
                const colors = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.medium;
                return (
                  <div key={alert.id} className={`px-4 py-3 hover:bg-slate-50 transition-colors`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${colors.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{alert.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{alert.desc}</p>
                        {alert.action && (
                          <Link to={alert.action} onClick={() => setOpen(false)} className={`text-xs font-medium mt-1 inline-flex items-center gap-0.5 ${colors.text}`}>
                            Take action <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                      <button onClick={() => handleDismiss(alert.id)} className="text-slate-300 hover:text-slate-500 flex-shrink-0 mt-0.5">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
            <Link to="/compliance-hub" onClick={() => setOpen(false)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              View compliance dashboard →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}