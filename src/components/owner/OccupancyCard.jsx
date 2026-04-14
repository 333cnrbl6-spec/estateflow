import { Card } from '@/components/ui/card';
import { Home } from 'lucide-react';

export default function OccupancyCard({ occupancyData }) {
  const { rate = 0, occupied = 0, totalUnits = 0 } = occupancyData;

  const getOccupancyColor = () => {
    if (rate >= 90) return 'text-green-700 bg-green-50 border-green-200';
    if (rate >= 70) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-orange-700 bg-orange-50 border-orange-200';
  };

  return (
    <Card className={`p-6 bg-gradient-to-br ${getOccupancyColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
        <Home className="w-4 h-4 text-current" />
      </div>
      <p className="text-3xl font-bold mb-4">{rate}%</p>
      <p className="text-xs text-muted-foreground">
        {occupied} of {totalUnits} units occupied
      </p>
    </Card>
  );
}