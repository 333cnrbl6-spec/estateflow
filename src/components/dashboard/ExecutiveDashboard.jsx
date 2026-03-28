import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { differenceInDays, parseISO, subYears, startOfYear, endOfYear } from 'date-fns';

export default function ExecutiveDashboard({ properties = [], units = [], transactions = [], tenants = [] }) {
  // Calculate portfolio yield
  const annualIncome = transactions
    .filter(t => t.direction === 'income' && t.status === 'paid')
    .reduce((s, t) => s + (t.amount || 0), 0);

  // Estimate portfolio value (simplified: 5x annual income)
  const estimatedPortfolioValue = annualIncome * 5;
  const portfolioYield = estimatedPortfolioValue > 0 ? ((annualIncome / estimatedPortfolioValue) * 100).toFixed(1) : 0;

  // YoY growth calculation
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  
  const currentYearIncome = transactions
    .filter(t => t.direction === 'income' && t.status === 'paid' && new Date(t.paid_date || t.due_date).getFullYear() === currentYear)
    .reduce((s, t) => s + (t.amount || 0), 0);

  const lastYearIncome = transactions
    .filter(t => t.direction === 'income' && t.status === 'paid' && new Date(t.paid_date || t.due_date).getFullYear() === lastYear)
    .reduce((s, t) => s + (t.amount || 0), 0);

  const yoyGrowth = lastYearIncome > 0 ? (((currentYearIncome - lastYearIncome) / lastYearIncome) * 100).toFixed(1) : 0;

  // Vacancy calculation - days vacant per property
  const vacancyData = properties.map(prop => {
    const propUnits = units.filter(u => u.property_id === prop.id);
    const vacantUnits = propUnits.filter(u => u.status === 'vacant');
    
    let avgDaysVacant = 0;
    if (vacantUnits.length > 0) {
      const vacantDays = vacantUnits.map(u => {
        if (u.vacancy_start_date) {
          return differenceInDays(new Date(), parseISO(u.vacancy_start_date));
        }
        return 0;
      });
      avgDaysVacant = Math.round(vacantDays.reduce((a, b) => a + b, 0) / vacantUnits.length);
    }

    return {
      name: prop.name?.slice(0, 15),
      daysVacant: avgDaysVacant,
      totalUnits: propUnits.length,
      vacantCount: vacantUnits.length,
      occupancy: propUnits.length > 0 ? Math.round(((propUnits.length - vacantUnits.length) / propUnits.length) * 100) : 0
    };
  }).filter(p => p.totalUnits > 0);

  const avgDaysVacantPortfolio = vacancyData.length > 0 
    ? Math.round(vacancyData.reduce((s, p) => s + p.daysVacant, 0) / vacancyData.length)
    : 0;

  // Regional performance heat map
  const regionStats = properties.reduce((acc, prop) => {
    const region = prop.region || 'other';
    const propUnits = units.filter(u => u.property_id === prop.id);
    const occupiedUnits = propUnits.filter(u => u.status === 'occupied').length;
    const occupancyRate = propUnits.length > 0 ? (occupiedUnits / propUnits.length) * 100 : 0;

    const regionIncome = transactions
      .filter(t => t.property_id === prop.id && t.direction === 'income' && t.status === 'paid')
      .reduce((s, t) => s + (t.amount || 0), 0);

    const existing = acc.find(r => r.region === region);
    if (existing) {
      existing.properties++;
      existing.income += regionIncome;
      existing.occupancy = (existing.occupancy + occupancyRate) / 2;
      existing.units += propUnits.length;
    } else {
      acc.push({
        region: region.charAt(0).toUpperCase() + region.slice(1),
        properties: 1,
        income: regionIncome,
        occupancy: occupancyRate,
        units: propUnits.length
      });
    }
    return acc;
  }, []);

  const heatMapData = regionStats.sort((a, b) => b.income - a.income).slice(0, 8);

  // Monthly income trend for YoY comparison
  const monthlyTrend = useMemo(() => {
    const months = {};
    
    transactions.filter(t => t.direction === 'income' && t.status === 'paid').forEach(t => {
      const date = parseISO(t.paid_date || t.due_date);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${month}`;
      
      if (!months[key]) {
        months[key] = { month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month], current: 0, previous: 0 };
      }
      
      if (year === currentYear) {
        months[key].current += t.amount || 0;
      } else if (year === lastYear) {
        months[key].previous += t.amount || 0;
      }
    });

    return Object.values(months).sort((a, b) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });
  }, [transactions, currentYear, lastYear]);

  const getHeatColor = (occupancy) => {
    if (occupancy >= 90) return 'bg-green-500';
    if (occupancy >= 75) return 'bg-yellow-500';
    if (occupancy >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Portfolio Yield
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{portfolioYield}%</div>
            <p className="text-xs text-blue-700 mt-1">Est. value: £{(estimatedPortfolioValue / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>

        <Card className={`border-2 ${parseFloat(yoyGrowth) >= 0 ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: parseFloat(yoyGrowth) >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 72%, 51%)' }}>
              {parseFloat(yoyGrowth) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              YoY Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: parseFloat(yoyGrowth) >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 72%, 51%)' }}>
              {yoyGrowth}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs. {lastYear}</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Avg Days Vacant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{avgDaysVacantPortfolio}</div>
            <p className="text-xs text-purple-700 mt-1">across {properties.length} properties</p>
          </CardContent>
        </Card>
      </div>

      {/* YoY Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Income Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `£${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
                <Legend />
                <Bar dataKey="previous" fill="#cbd5e1" name={`${lastYear}`} radius={[4, 4, 0, 0]} />
                <Bar dataKey="current" fill="#3b82f6" name={`${currentYear}`} radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No data available</p>
          )}
        </CardContent>
      </Card>

      {/* Regional Performance Heat Map */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Regional Performance Heat Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          {heatMapData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {heatMapData.map((region) => (
                <div
                  key={region.region}
                  className={`p-4 rounded-lg border-2 ${getHeatColor(region.occupancy)} bg-opacity-10`}
                  style={{ borderColor: getHeatColor(region.occupancy).replace('bg-', 'rgb(').replace('-', ',') }}
                >
                  <h4 className="font-semibold text-sm mb-2">{region.region}</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Properties:</span>
                      <span className="font-medium">{region.properties}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Units:</span>
                      <span className="font-medium">{region.units}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Occupancy:</span>
                      <span className="font-medium">{region.occupancy.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-opacity-20">
                      <span>Income:</span>
                      <span className="font-medium">£{(region.income / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-12 text-center">No regional data available</p>
          )}
        </CardContent>
      </Card>

      {/* Vacancy Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Property Vacancy Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {vacancyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vacancyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: 'Days Vacant', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} label={{ value: 'Occupancy %', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="daysVacant" fill="#ef4444" name="Avg Days Vacant" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="occupancy" fill="#10b981" name="Occupancy %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-12 text-center">No vacancy data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}