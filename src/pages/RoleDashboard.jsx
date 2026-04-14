import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import PageHeader from '@/components/shared/PageHeader';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Building2, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const COLORS = ['#1f2937', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function RoleDashboard() {
  const userRole = useRoleAccess();
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Call all hooks unconditionally at top level
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list('', 50)
  });

  const { data: errors = [] } = useQuery({
    queryKey: ['errorLogs'],
    queryFn: () => base44.entities.ErrorLog.list('-timestamp', 50)
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['companyProfiles'],
    queryFn: () => base44.entities.CompaniesHouseProfile.list('-last_synced', 30)
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('', 50)
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => base44.entities.Tenant.list('', 100)
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.FinancialTransaction.list('-created_date', 100)
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['maintenanceOrders'],
    queryFn: () => base44.entities.MaintenanceRequest.filter({ assigned_contractor_email: user?.email }, '-created_date', 50),
    enabled: !!user?.email
  });

  const errorsByType = useMemo(() => {
    const grouped = errors.reduce((acc, e) => {
      const type = e.error_type.replace(/_/g, ' ');
      const existing = acc.find(x => x.name === type);
      if (existing) existing.value++;
      else acc.push({ name: type, value: 1 });
      return acc;
    }, []);
    return grouped;
  }, [errors]);

  const income = useMemo(() => {
    return transactions.filter(t => t.direction === 'income' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
  }, [transactions]);

  const overdue = useMemo(() => {
    return transactions.filter(t => t.status === 'overdue').reduce((s, t) => s + (t.amount || 0), 0);
  }, [transactions]);

  const activeJobs = useMemo(() => {
    return jobs.filter(j => !['completed', 'cancelled'].includes(j.status));
  }, [jobs]);

  // ADMIN ROLE
  if (userRole === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background">
        <div className="p-8 max-w-[1400px] mx-auto">
          <PageHeader title="Admin Dashboard" subtitle={`Welcome, ${user?.full_name}`} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Companies" value={companies.length} icon={Building2} color="blue" />
            <StatCard title="With Alerts" value={profiles.filter(p => p.critical_alerts?.length > 0).length} icon={AlertCircle} color="red" />
            <StatCard title="Errors (24h)" value={errors.length} icon={AlertCircle} color="orange" />
            <StatCard title="System Health" value={`${Math.round((1 - errors.filter(e => e.severity === 'critical').length / (errors.length || 1)) * 100)}%`} icon={TrendingUp} color="green" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Errors by Type</h3>
              {errorsByType.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={errorsByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No errors</p>
              )}
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Companies Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Active', value: companies.filter(c => c.status === 'active').length },
                      { name: 'Inactive', value: companies.filter(c => c.status !== 'active').length }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {[0, 1].map((i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LANDLORD ROLE
  if (userRole === 'landlord') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background">
        <div className="p-8 max-w-[1400px] mx-auto">
          <PageHeader title="Landlord Portal" subtitle={`Welcome back, ${user?.full_name}`} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard title="Properties" value={properties.length} icon={Building2} color="blue" />
            <StatCard title="Active Tenants" value={tenants.filter(t => t.status === 'active').length} icon={Users} color="green" />
            <StatCard title="Monthly Income" value={`£${income.toLocaleString()}`} icon={TrendingUp} color="green" />
            <StatCard title="Overdue Rent" value={`£${overdue.toLocaleString()}`} icon={AlertCircle} color="red" />
          </div>
        </div>
      </div>
    );
  }

  // CONTRACTOR ROLE
  if (userRole === 'contractor') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background">
        <div className="p-8 max-w-[1400px] mx-auto">
          <PageHeader title="My Jobs" subtitle={`Welcome, ${user?.full_name}`} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard title="Total Jobs" value={jobs.length} icon={AlertCircle} color="blue" />
            <StatCard title="Active" value={activeJobs.length} icon={TrendingUp} color="orange" />
            <StatCard title="Completed" value={jobs.filter(j => j.status === 'completed').length} icon={TrendingUp} color="green" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {activeJobs.map(job => (
              <div key={job.id} className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{job.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{job.description}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">
                    {job.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <div className="p-8">Dashboard for your role is being prepared...</div>;
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200'
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg border p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
        </div>
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  );
}