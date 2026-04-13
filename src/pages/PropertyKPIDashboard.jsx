import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/shared/PageHeader';
import OccupancyRateCard from '@/components/dashboard/OccupancyRateCard';
import YieldMetricsCard from '@/components/dashboard/YieldMetricsCard';
import MaintenanceResponseTimeCard from '@/components/dashboard/MaintenanceResponseTimeCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import moment from 'moment';

export default function PropertyKPIDashboard() {
  // Fetch all required data
  const { data: properties = [] } = useQuery({
    queryKey: ['kpi-properties'],
    queryFn: async () => {
      return await base44.entities.Property.list();
    },
  });

  const { data: units = [] } = useQuery({
    queryKey: ['kpi-units'],
    queryFn: async () => {
      return await base44.entities.Unit.list();
    },
  });

  const { data: tenancies = [] } = useQuery({
    queryKey: ['kpi-tenancies'],
    queryFn: async () => {
      return await base44.entities.Tenant.list();
    },
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['kpi-transactions'],
    queryFn: async () => {
      return await base44.entities.FinancialTransaction.list();
    },
  });

  const { data: maintenanceOrders = [] } = useQuery({
    queryKey: ['kpi-maintenance'],
    queryFn: async () => {
      return await base44.entities.MaintenanceRequest.list();
    },
  });

  // Process occupancy data
  const occupancyData = useMemo(() => {
    if (properties.length === 0 || units.length === 0) return null;

    const totalUnits = units.length;
    const activeUnits = units.filter(u => u.status === 'active');

    // Count occupied units (those with active tenancies)
    const occupiedUnits = activeUnits.filter(u => {
      return tenancies.some(t => 
        t.unit_id === u.id && 
        t.status === 'active' &&
        (!t.tenancy_end_date || moment(t.tenancy_end_date).isAfter(moment()))
      );
    }).length;

    const vacantUnits = activeUnits.length - occupiedUnits;
    const occupancyRate = activeUnits.length > 0 ? (occupiedUnits / activeUnits.length) * 100 : 0;

    return {
      totalUnits: activeUnits.length,
      occupiedUnits,
      vacantUnits,
      occupancyRate,
      occupancyTrend: 0,
    };
  }, [units, tenancies, properties]);

  // Process yield data
  const yieldData = useMemo(() => {
    if (properties.length === 0) return null;

    const propertyYields = properties.map(prop => {
      // Get all units for this property
      const propUnits = units.filter(u => u.property_id === prop.id);
      
      // Calculate annual rental income
      const annualIncome = propUnits.reduce((sum, u) => {
        return sum + ((u.monthly_rent || 0) * 12);
      }, 0);

      // Estimate property value for yield calculation (simplified: 20x annual income)
      const estimatedValue = annualIncome * 20;
      const yield_ = estimatedValue > 0 ? (annualIncome / estimatedValue) * 100 : 0;

      return {
        id: prop.id,
        name: prop.name,
        annualIncome,
        yield: yield_,
      };
    });

    const totalIncome = propertyYields.reduce((sum, p) => sum + p.annualIncome, 0);
    const portfolioYield = propertyYields.length > 0 
      ? propertyYields.reduce((sum, p) => sum + p.yield, 0) / propertyYields.length 
      : 0;

    return {
      portfolioYield,
      properties: propertyYields,
    };
  }, [properties, units]);

  // Process maintenance response time data
  const responseTimeData = useMemo(() => {
    if (maintenanceOrders.length === 0) return null;

    const completed = maintenanceOrders.filter(m => m.status === 'completed' && m.completion_date && m.created_date);
    
    // Calculate average response times
    const responseTimes = maintenanceOrders
      .filter(m => m.assigned_date && m.created_date)
      .map(m => {
        const created = moment(m.created_date);
        const assigned = moment(m.assigned_date);
        return assigned.diff(created, 'hours', true);
      });

    const completionTimes = completed
      .map(m => {
        const created = moment(m.created_date);
        const finished = moment(m.completion_date);
        return finished.diff(created, 'hours', true);
      });

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    const averageCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : 0;

    // Count pending requests
    const pendingRequests = maintenanceOrders.filter(m => 
      m.status === 'reported' || m.status === 'assigned'
    ).length;

    // Count overdue high-priority requests
    const overduePriority = maintenanceOrders.filter(m => {
      if (m.status === 'completed') return false;
      if (m.priority !== 'urgent' && m.priority !== 'emergency') return false;
      
      const created = moment(m.created_date);
      const hoursSince = moment().diff(created, 'hours');
      return hoursSince > 24;
    }).length;

    // Response time by priority
    const byPriority = ['low', 'standard', 'urgent', 'emergency'].map(priority => {
      const priorityOrders = maintenanceOrders.filter(m => 
        m.priority === priority && m.assigned_date && m.created_date
      );
      const times = priorityOrders.map(m => {
        const created = moment(m.created_date);
        const assigned = moment(m.assigned_date);
        return assigned.diff(created, 'hours', true);
      });
      
      return {
        priority: priority.charAt(0).toUpperCase() + priority.slice(1),
        responseTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
      };
    }).filter(item => item.responseTime > 0);

    // 30-day trend
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = moment().subtract(i, 'days');
      const dayOrders = maintenanceOrders.filter(m => 
        moment(m.created_date).isSame(date, 'day') && 
        m.assigned_date && 
        m.created_date
      );
      
      const times = dayOrders.map(m => {
        const created = moment(m.created_date);
        const assigned = moment(m.assigned_date);
        return assigned.diff(created, 'hours', true);
      });

      if (times.length > 0) {
        last30Days.push({
          date: date.format('MMM DD'),
          avgTime: times.reduce((a, b) => a + b, 0) / times.length,
        });
      }
    }

    return {
      averageResponseTime,
      averageCompletionTime,
      totalRequests: maintenanceOrders.length,
      pendingRequests,
      overduePriority,
      responseTimeTrend: last30Days,
      byPriority,
    };
  }, [maintenanceOrders]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="KPI Dashboard"
          description="Real-time property performance metrics and operational insights"
        />
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OccupancyRateCard occupancyData={occupancyData} />
        <YieldMetricsCard yieldData={yieldData} />
        <MaintenanceResponseTimeCard responseTimeData={responseTimeData} />
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Properties</p>
              <p className="text-2xl font-bold">{properties.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Units</p>
              <p className="text-2xl font-bold">{units.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Active Tenancies</p>
              <p className="text-2xl font-bold">
                {tenancies.filter(t => t.status === 'active').length}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Maintenance Requests</p>
              <p className="text-2xl font-bold">{maintenanceOrders.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Updated Timestamp */}
      <div className="text-xs text-muted-foreground text-center">
        Data updated: {moment().format('DD MMM YYYY HH:mm:ss')}
      </div>
    </div>
  );
}