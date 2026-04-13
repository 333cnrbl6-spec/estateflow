import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function ProfitabilityMetrics({ metrics }) {
  const {
    totalIncome = 0,
    totalExpenses = 0,
    netProfit = 0,
    profitMargin = 0,
    roi = 0,
    propertyCount = 0,
    tenancyCount = 0,
  } = metrics || {};

  const isPositive = netProfit >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Income (12M)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">£{totalIncome.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</div>
          <p className="text-xs text-muted-foreground mt-1">From {tenancyCount} tenancies</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses (12M)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">£{totalExpenses.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</div>
          <p className="text-xs text-muted-foreground mt-1">{(totalExpenses / totalIncome * 100).toFixed(1)}% of income</p>
        </CardContent>
      </Card>

      <Card className={isPositive ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit (12M)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold flex items-center gap-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            £{Math.abs(netProfit).toLocaleString('en-GB', { maximumFractionDigits: 0 })}
            {isPositive ? (
              <TrendingUp className="w-6 h-6" />
            ) : (
              <TrendingDown className="w-6 h-6" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {profitMargin.toFixed(1)}% profit margin
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">ROI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{roi.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">Across {propertyCount} properties</p>
        </CardContent>
      </Card>
    </div>
  );
}