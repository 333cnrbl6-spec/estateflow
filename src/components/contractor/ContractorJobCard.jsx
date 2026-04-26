import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function ContractorJobCard({ job, isSelected, onClick, onStatusChange, disabled }) {
  const statusIcons = {
    scheduled: <AlertCircle className="w-4 h-4 text-amber-500" />,
    in_progress: <Clock className="w-4 h-4 text-blue-500" />,
    completed: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  };

  const statusColors = {
    scheduled: 'bg-amber-50 border-amber-200',
    in_progress: 'bg-blue-50 border-blue-200',
    completed: 'bg-green-50 border-green-200',
  };

  const bgColor = isSelected ? (statusColors[job.status] || 'bg-slate-100') : 'bg-white';
  const borderClass = isSelected ? 'ring-2 ring-blue-500' : 'border-slate-200';

  return (
    <Card
      onClick={!disabled ? onClick : undefined}
      className={`p-4 cursor-pointer transition-all ${bgColor} border ${borderClass} ${
        disabled ? 'opacity-60' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {statusIcons[job.status]}
            <h3 className="font-semibold text-slate-900">{job.description || 'Maintenance Job'}</h3>
          </div>
          <p className="text-xs text-slate-500 mb-2">
            {job.property_id && `Property: ${job.property_id}`}
          </p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="capitalize text-xs">
              {job.status?.replace(/_/g, ' ') || 'scheduled'}
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                job.priority === 'high' ? 'bg-red-100 text-red-700' :
                job.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                'bg-slate-100 text-slate-700'
              }`}
            >
              {job.priority || 'medium'} priority
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">
            {job.created_date ? format(new Date(job.created_date), 'dd MMM') : 'TBC'}
          </p>
        </div>
      </div>
    </Card>
  );
}