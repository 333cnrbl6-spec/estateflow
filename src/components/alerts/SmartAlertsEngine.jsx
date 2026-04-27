import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Clock, Home, FileText, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function SmartAlertsEngine() {
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('premiso_engine_dismissed') || '[]'); } catch { return []; }
  });

  const handleDismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem('premiso_engine_dismissed', JSON.stringify(next));
  };

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants-alerts'],
    queryFn: () => base44.entities.Tenant.list(),
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['certificates-alerts'],
    queryFn: () => base44.entities.SafetyCertificate?.list?.() || Promise.resolve([]),
  });

  const { data: maintenance = [] } = useQuery({
    queryKey: ['maintenance-alerts'],
    queryFn: () => base44.entities.MaintenanceRequest?.list?.() || Promise.resolve([]),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions-alerts'],
    queryFn: () => base44.entities.FinancialTransaction.list(),
  });

  useEffect(() => {
    const newAlerts = [];
    const today = new Date();

    // Rent Overdue
    transactions
      .filter(t => t.status === 'pending')
      .forEach(t => {
        const daysOverdue = Math.floor((today - new Date(t.due_date)) / (1000 * 60 * 60 * 24));
        if (daysOverdue > 0) {
          newAlerts.push({
            id: `rent-${t.id}`,
            type: 'rent_overdue',
            title: 'Rent Overdue',
            description: `Payment overdue by ${daysOverdue} days`,
            severity: daysOverdue > 7 ? 'critical' : 'warning',
            icon: AlertTriangle,
          });
        }
      });

    // Tenancy Expiring
    tenants
      .filter(t => t.tenancy_end_date)
      .forEach(t => {
        const daysLeft = Math.floor((new Date(t.tenancy_end_date) - today) / (1000 * 60 * 60 * 24));
        if (daysLeft > 0 && daysLeft <= 90) {
          newAlerts.push({
            id: `tenancy-${t.id}`,
            type: 'tenancy_expiring',
            title: `Tenancy Expiring: ${t.full_name}`,
            description: `${daysLeft} days remaining`,
            severity: daysLeft <= 30 ? 'critical' : 'warning',
            icon: Clock,
          });
        }
      });

    // Certificate Expiry
    certificates
      .filter(c => c.expiry_date)
      .forEach(c => {
        const daysLeft = Math.floor((new Date(c.expiry_date) - today) / (1000 * 60 * 60 * 24));
        if (daysLeft > 0 && daysLeft <= 30) {
          newAlerts.push({
            id: `cert-${c.id}`,
            type: 'cert_expiring',
            title: `Certificate Expiring: ${c.certificate_type}`,
            description: `${daysLeft} days remaining`,
            severity: daysLeft <= 7 ? 'critical' : 'warning',
            icon: FileText,
          });
        }
      });

    // Maintenance Requests Open
    maintenance
      .filter(m => !['completed', 'cancelled'].includes(m.status))
      .forEach(m => {
        newAlerts.push({
          id: `maint-${m.id}`,
          type: 'maintenance_request',
          title: 'Maintenance Request Open',
          description: m.description || 'No description',
          severity: 'info',
          icon: Home,
        });
      });

    setAlerts(newAlerts);
  }, [tenants, certificates, maintenance, transactions]);

  const visible = alerts.filter(a => !dismissed.includes(a.id));

  return (
    <div className="space-y-2">
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">✓ No active alerts</p>
      ) : (
        visible.map(alert => {
          const Icon = alert.icon;
          const bgColor = alert.severity === 'critical' ? 'bg-red-50' : alert.severity === 'warning' ? 'bg-amber-50' : 'bg-blue-50';
          const borderColor = alert.severity === 'critical' ? 'border-red-200' : alert.severity === 'warning' ? 'border-amber-200' : 'border-blue-200';
          const textColor = alert.severity === 'critical' ? 'text-red-900' : alert.severity === 'warning' ? 'text-amber-900' : 'text-blue-900';

          return (
            <div key={alert.id} className={`${bgColor} border ${borderColor} rounded p-3 flex items-start gap-3`}>
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${textColor}`} />
              <div className="flex-1">
                <p className={`text-sm font-semibold ${textColor}`}>{alert.title}</p>
                <p className={`text-xs ${textColor} opacity-75`}>{alert.description}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                  <Link to="/compliance-dashboard">Action</Link>
                </Button>
                <button onClick={() => handleDismiss(alert.id)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}