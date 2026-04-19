import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Wrench, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { differenceInDays, parseISO } from 'date-fns';

const ALERT_CONFIG = {
  rent_overdue: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-red-50 border-red-200', badge: 'destructive', label: 'Rent Overdue' },
  tenancy_expiring: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', badge: 'outline', label: 'Tenancy Expiring' },
  maintenance_open: { icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', badge: 'secondary', label: 'Maintenance' },
  cert_expiring: { icon: Shield, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', badge: 'outline', label: 'Certificate' },
};

export default function SmartAlerts({ tenants = [], maintenance = [], certificates = [], transactions = [] }) {
  const alerts = useMemo(() => {
    const list = [];
    const now = new Date();

    // Rent overdue
    transactions
      .filter(t => t.status === 'overdue' && t.direction === 'income')
      .slice(0, 3)
      .forEach(t => {
        list.push({
          type: 'rent_overdue',
          message: `Rent overdue: £${((t.amount || 0) / 100).toFixed(0)}`,
          link: '/rent-ledger',
          priority: 1
        });
      });

    // Tenancies expiring in 30/60/90 days
    tenants
      .filter(t => t.tenancy_end_date && t.status === 'active')
      .forEach(t => {
        const days = differenceInDays(parseISO(t.tenancy_end_date), now);
        if (days >= 0 && days <= 90) {
          list.push({
            type: 'tenancy_expiring',
            message: `${t.full_name}'s tenancy expires in ${days} days`,
            link: '/tenants',
            priority: days <= 30 ? 1 : days <= 60 ? 2 : 3
          });
        }
      });

    // Open high-priority maintenance
    maintenance
      .filter(m => m.priority === 'high' && !['completed', 'cancelled'].includes(m.status))
      .slice(0, 3)
      .forEach(m => {
        list.push({
          type: 'maintenance_open',
          message: `High priority: ${m.title || 'Maintenance request'}`,
          link: '/maintenance',
          priority: 2
        });
      });

    // Certificates expiring
    certificates
      .filter(c => c.expiry_date)
      .forEach(c => {
        const days = differenceInDays(parseISO(c.expiry_date), now);
        if (days >= 0 && days <= 60) {
          list.push({
            type: 'cert_expiring',
            message: `Certificate expires in ${days} days`,
            link: '/certificates',
            priority: days <= 14 ? 1 : 2
          });
        }
      });

    return list.sort((a, b) => a.priority - b.priority).slice(0, 6);
  }, [tenants, maintenance, certificates, transactions]);

  if (alerts.length === 0) return null;

  return (
    <Card className="p-5 border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-amber-500" />
        <h3 className="text-base font-semibold text-slate-900">Smart Alerts</h3>
        <Badge variant="secondary" className="ml-auto">{alerts.length}</Badge>
      </div>
      <div className="space-y-2">
        {alerts.map((alert, i) => {
          const cfg = ALERT_CONFIG[alert.type];
          const Icon = cfg.icon;
          return (
            <Link key={i} to={alert.link} className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${cfg.bg} hover:opacity-90 transition-opacity`}>
              <Icon className={`w-4 h-4 shrink-0 ${cfg.color}`} />
              <span className={`flex-1 ${cfg.color} font-medium`}>{alert.message}</span>
              <Badge variant={cfg.badge} className="text-xs shrink-0">{cfg.label}</Badge>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}