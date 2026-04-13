import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';

export default function OccupancyRateCard({ occupancyData }) {
  if (!occupancyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Occupancy Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const {
    totalUnits = 0,
    occupiedUnits = 0,
    vacantUnits = 0,
    occupancyRate = 0,
    occupancyTrend = 0,
  } = occupancyData;

  const occupancyColor = occupancyRate >= 85 ? 'bg-green-600' : occupancyRate >= 70 ? 'bg-amber-600' : 'bg-red-600';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Occupancy Rate
          </span>
          <span className={`text-2xl font-bold ${
            occupancyRate >= 85 ? 'text-green-600' : occupancyRate >= 70 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {occupancyRate.toFixed(1)}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Occupied Units</span>
            <span className="font-medium">{occupiedUnits} / {totalUnits}</span>
          </div>
          <Progress value={occupancyRate} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Occupied</p>
            <p className="text-lg font-bold">{occupiedUnits}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Vacant</p>
            <p className="text-lg font-bold">{vacantUnits}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold">{totalUnits}</p>
          </div>
        </div>

        {occupancyTrend !== 0 && (
          <div className={`text-sm font-medium ${occupancyTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {occupancyTrend > 0 ? '↑' : '↓'} {Math.abs(occupancyTrend).toFixed(1)}% vs last month
          </div>
        )}
      </CardContent>
    </Card>
  );
}