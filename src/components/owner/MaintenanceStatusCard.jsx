import { Card } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

export default function MaintenanceStatusCard({ taskCount = 0 }) {
  const getStatusColor = () => {
    if (taskCount === 0) return 'from-green-50 to-emerald-50 border-green-200 text-green-700';
    if (taskCount <= 3) return 'from-blue-50 to-cyan-50 border-blue-200 text-blue-700';
    return 'from-orange-50 to-red-50 border-orange-200 text-orange-700';
  };

  return (
    <Card className={`p-6 bg-gradient-to-br ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
        <Wrench className="w-4 h-4 text-current" />
      </div>
      <p className="text-3xl font-bold mb-4">{taskCount}</p>
      <p className="text-xs text-muted-foreground">
        {taskCount === 0 ? 'All systems operational' : `${taskCount} pending or in progress`}
      </p>
    </Card>
  );
}